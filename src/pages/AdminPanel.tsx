import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Upload, Save, X, Users, Award, LogOut, Database, Download, Search, Calendar, Mail, Phone, User, Eye } from 'lucide-react';
import { votingPositionsAPI, leadershipAPI, uploadImage } from '../lib/api';
import type { VotingPosition, Leadership } from '../lib/supabase';
import { ThemeToggle } from '../../components/ThemeToggle';
import { supabase } from '../lib/supabase';

interface VoterData {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    created_at: string;
    president_vote?: string;
    vice_president_vote?: string;
    treasurer_vote?: string;
    secretary_vote?: string;
}

export function AdminPanel() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'candidates' | 'leadership' | 'voters'>('candidates');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [userEmail, setUserEmail] = useState<string>('');

    const [candidates, setCandidates] = useState<VotingPosition[]>([]);
    const [leaders, setLeaders] = useState<Leadership[]>([]);
    const [voters, setVoters] = useState<VoterData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVoter, setSelectedVoter] = useState<VoterData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [formData, setFormData] = useState({ name: '', position: '', role: '', image: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in, redirect to login
                navigate('/admin/login');
                return;
            }

            setUserEmail(user.email || '');
            setIsCheckingAuth(false);
            loadData();
        } catch (error) {
            console.error('Auth check error:', error);
            navigate('/admin/login');
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout. Please try again.');
        }
    };

    const loadData = async () => {
        try {
            const [positions, leadership] = await Promise.all([
                votingPositionsAPI.getAll(),
                leadershipAPI.getAll()
            ]);
            setCandidates(positions || []);
            setLeaders(leadership || []);

            // Load voters data
            await loadVotersData();
        } catch (error: any) {
            console.error('Error loading data:', error);

            // More specific error messages
            if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
                alert('❌ DATABASE SETUP REQUIRED\n\n' +
                    'The database tables are missing.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/schema.sql (creates tables)\n' +
                    '4. Run data/fix_all_policies.sql (sets permissions)\n' +
                    '5. Refresh this page');
            } else if (error.message?.includes('JWT') || error.message?.includes('API key')) {
                alert('❌ AUTHENTICATION ERROR\n\n' +
                    'Cannot connect to Supabase.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Check your .env file exists\n' +
                    '2. Verify VITE_SUPABASE_URL is correct\n' +
                    '3. Verify VITE_SUPABASE_ANON_KEY is correct\n' +
                    '4. Restart the development server');
            } else if (error.message?.includes('policy') || error.message?.includes('permission')) {
                alert('❌ PERMISSION DENIED\n\n' +
                    'Database policies are not configured.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/fix_all_policies.sql\n' +
                    '4. Refresh this page');
            } else {
                alert('❌ FAILED TO LOAD DATA\n\n' +
                    'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                    'TROUBLESHOOTING:\n' +
                    '1. Check browser console (F12) for details\n' +
                    '2. Verify database setup in Supabase\n' +
                    '3. Run data/schema.sql in Supabase SQL Editor\n' +
                    '4. Run data/fix_all_policies.sql for permissions\n' +
                    '5. Check .env file configuration');
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = async () => {
        // Prevent duplicate submissions
        if (isLoading) return;

        // Validation
        if (!formData.name.trim()) {
            alert('Please enter a name');
            return;
        }
        if (activeTab === 'candidates' && !formData.position) {
            alert('Please select a position');
            return;
        }
        if (activeTab === 'leadership' && !formData.role.trim()) {
            alert('Please enter a role');
            return;
        }
        if (!formData.image && !imageFile) {
            alert('Please upload an image');
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = formData.image;

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            if (activeTab === 'candidates') {
                await votingPositionsAPI.create({
                    name: formData.name,
                    role: formData.position,
                    image_url: imageUrl
                });
            } else {
                await leadershipAPI.create({
                    name: formData.name,
                    role: formData.role,
                    image_url: imageUrl
                });
            }

            await loadData();
            setFormData({ name: '', position: '', role: '', image: '' });
            setImageFile(null);
            alert('Added successfully!');
        } catch (error: any) {
            console.error('Error adding:', error);
            if (error.message?.includes('policy') || error.message?.includes('permission')) {
                alert('❌ PERMISSION DENIED\n\n' +
                    'Cannot add new items.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/fix_all_policies.sql\n' +
                    '4. Try again');
            } else if (error.message?.includes('Storage') || error.message?.includes('upload')) {
                alert('❌ IMAGE UPLOAD FAILED\n\n' +
                    'Cannot upload image to storage.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/fix_all_policies.sql\n' +
                    '4. Try uploading again');
            } else {
                alert('❌ FAILED TO ADD\n\n' +
                    'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                    'Check browser console (F12) for more details.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
        if (activeTab === 'candidates') {
            const candidate = candidates.find((c) => c.id === id);
            if (candidate) {
                setFormData({ name: candidate.name, position: candidate.role, role: '', image: candidate.image_url || '' });
            }
        } else {
            const leader = leaders.find((l) => l.id === id);
            if (leader) {
                setFormData({ name: leader.name, position: '', role: leader.role, image: leader.image_url || '' });
            }
        }
    };

    const handleUpdate = async () => {
        if (!editingId || isLoading) return;
        setIsLoading(true);
        try {
            let imageUrl = formData.image;

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            if (activeTab === 'candidates') {
                await votingPositionsAPI.update(editingId, {
                    name: formData.name,
                    role: formData.position,
                    image_url: imageUrl
                });
            } else {
                await leadershipAPI.update(editingId, {
                    name: formData.name,
                    role: formData.role,
                    image_url: imageUrl
                });
            }

            await loadData();
            setFormData({ name: '', position: '', role: '', image: '' });
            setImageFile(null);
            setEditingId(null);
            alert('Updated successfully!');
        } catch (error: any) {
            console.error('Error updating:', error);
            if (error.message?.includes('policy') || error.message?.includes('permission')) {
                alert('❌ PERMISSION DENIED\n\n' +
                    'Cannot update items.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/fix_all_policies.sql\n' +
                    '4. Try again');
            } else if (error.message?.includes('Storage') || error.message?.includes('upload')) {
                alert('❌ IMAGE UPLOAD FAILED\n\n' +
                    'Cannot upload image to storage.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/fix_all_policies.sql\n' +
                    '4. Try uploading again');
            } else {
                alert('❌ FAILED TO UPDATE\n\n' +
                    'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                    'Check browser console (F12) for more details.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteVoter = async (voterId: string) => {
        if (!confirm('Are you sure you want to delete this voter? This will also delete all their votes.')) return;

        try {
            // Close modal if open
            setIsViewModalOpen(false);
            setSelectedVoter(null);

            const { error } = await supabase
                .from('voters')
                .delete()
                .eq('id', voterId);

            if (error) throw error;

            // Reload voters data
            await loadVotersData();

            alert('✅ Voter deleted successfully!\n\nThe voter and all their votes have been removed from the database.');
        } catch (error: any) {
            console.error('Error deleting voter:', error);

            if (error.message?.includes('policy') || error.message?.includes('permission')) {
                alert('❌ PERMISSION DENIED\n\n' +
                    'Cannot delete voter. RLS policies may be blocking this action.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/fix_all_policies.sql\n' +
                    '4. Try again');
            } else {
                alert('❌ FAILED TO DELETE VOTER\n\n' +
                    'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                    'Check browser console (F12) for more details.');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            if (activeTab === 'candidates') {
                await votingPositionsAPI.delete(id);
            } else {
                await leadershipAPI.delete(id);
            }
            await loadData();
            alert('Deleted successfully!');
        } catch (error: any) {
            console.error('Error deleting:', error);
            if (error.message?.includes('policy') || error.message?.includes('permission')) {
                alert('❌ PERMISSION DENIED\n\n' +
                    'Cannot delete items.\n\n' +
                    'STEPS TO FIX:\n' +
                    '1. Open Supabase Dashboard\n' +
                    '2. Go to SQL Editor\n' +
                    '3. Run data/fix_all_policies.sql\n' +
                    '4. Try again');
            } else {
                alert('❌ FAILED TO DELETE\n\n' +
                    'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                    'Check browser console (F12) for more details.');
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', position: '', role: '', image: '' });
        setImageFile(null);
        setEditingId(null);
    };

    const loadVotersData = async () => {
        try {
            // Fetch voters
            const { data: votersData, error: votersError } = await supabase
                .from('voters')
                .select('*')
                .order('created_at', { ascending: false });

            if (votersError) throw votersError;

            // Fetch candidate rankings with candidate names
            const { data: rankingsData, error: rankingsError } = await supabase
                .from('candidate_rankings')
                .select(`
                    voter_id,
                    position_slot,
                    rank_order,
                    voting_positions (name)
                `)
                .order('rank_order', { ascending: true });

            if (rankingsError) throw rankingsError;

            // Process data to combine voters with their votes
            const processedVoters = votersData?.map(voter => {
                const voterRankings = rankingsData?.filter((r: any) => r.voter_id === voter.id) || [];

                const presidentVote = voterRankings
                    .filter((r: any) => r.position_slot === 'president')
                    .map((r: any) => r.voting_positions?.name)
                    .filter(Boolean)
                    .join(', ');

                const vicePresidentVote = voterRankings
                    .filter((r: any) => r.position_slot === 'vice_president')
                    .map((r: any) => r.voting_positions?.name)
                    .filter(Boolean)
                    .join(', ');

                return {
                    ...voter,
                    president_vote: presidentVote || 'N/A',
                    vice_president_vote: vicePresidentVote || 'N/A'
                };
            }) || [];

            setVoters(processedVoters);
        } catch (error) {
            console.error('Error fetching voters data:', error);
        }
    };

    const exportToExcel = () => {
        const filteredVoters = voters.filter(voter =>
            voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            voter.phone_number.includes(searchTerm)
        );

        // Create CSV content
        const headers = ['Full Name', 'Email', 'Phone Number', 'Vote Date & Time', 'President Vote', 'Vice President Vote'];
        const csvContent = [
            headers.join(','),
            ...filteredVoters.map(voter => [
                `"${voter.full_name}"`,
                `"${voter.email}"`,
                `"${voter.phone_number}"`,
                `"${new Date(voter.created_at).toLocaleString()}"`,
                `"${voter.president_vote}"`,
                `"${voter.vice_president_vote}"`
            ].join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `voters_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
            <ThemeToggle />
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-green-600 dark:from-red-700 dark:to-green-700 text-white py-6 px-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">ASSAL Admin Panel</h1>
                        <p className="text-white/90">Manage voting positions and leadership</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white text-red-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Back to Website
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-white/90 text-sm">
                                {userEmail}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('candidates')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${activeTab === 'candidates'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Users size={20} />
                        Voting Positions
                    </button>
                    <button
                        onClick={() => setActiveTab('leadership')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${activeTab === 'leadership'
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Award size={20} />
                        Leadership & Top Management
                    </button>
                    <button
                        onClick={() => setActiveTab('voters')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${activeTab === 'voters'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Database size={20} />
                        Manage Voters
                    </button>
                </div>

                {/* Voters Management Section */}
                {activeTab === 'voters' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        {/* Table Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Voters Data
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                {/* Search Bar */}
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search voters..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Export Button */}
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <Download className="w-5 h-5" />
                                    Export to Excel
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        {voters.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">No voters found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        Full Name
                                                    </div>
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        Email
                                                    </div>
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4" />
                                                        Phone
                                                    </div>
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Date & Time
                                                    </div>
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    President Vote
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Vice President Vote
                                                </th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {voters
                                                .filter(voter =>
                                                    voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    voter.phone_number.includes(searchTerm)
                                                )
                                                .map((voter) => (
                                                    <tr
                                                        key={voter.id}
                                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                    >
                                                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                                                            {voter.full_name}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                            {voter.email}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                            {voter.phone_number}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(voter.created_at).toLocaleString()}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {voter.president_vote}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                {voter.vice_president_vote}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedVoter(voter);
                                                                        setIsViewModalOpen(true);
                                                                    }}
                                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteVoter(voter.id)}
                                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                                    title="Delete Voter"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Results Count */}
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    Showing {voters.filter(voter =>
                                        voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        voter.phone_number.includes(searchTerm)
                                    ).length} of {voters.length} voters
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Form Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                {editingId ? 'Edit' : 'Add New'} {activeTab === 'candidates' ? 'Candidate' : 'Leader'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter name"
                                        required
                                    />
                                </div>

                                {activeTab === 'candidates' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Position <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select position</option>
                                            <option value="President">President</option>
                                            <option value="Vice President">Vice President</option>
                                            <option value="Treasurer">Treasurer</option>
                                            <option value="Secretary">Secretary</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Enter role"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image <span className="text-red-600">*</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                                            <Upload size={20} />
                                            Upload Image
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" required={!formData.image} />
                                        </label>
                                        {formData.image && (
                                            <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {editingId ? (
                                        <>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={isLoading}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Save size={20} />
                                                {isLoading ? 'Updating...' : 'Update'}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={isLoading}
                                                className="flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X size={20} />
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleAdd}
                                            disabled={isLoading}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={20} />
                                            {isLoading ? 'Adding...' : `Add ${activeTab === 'candidates' ? 'Candidate' : 'Leader'}`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                Current {activeTab === 'candidates' ? 'Candidates' : 'Leaders'}
                            </h2>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {activeTab === 'candidates'
                                    ? candidates.map((candidate) => (
                                        <div
                                            key={candidate.id}
                                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <img src={candidate.image_url || 'https://via.placeholder.com/150'} alt={candidate.name} className="w-16 h-16 rounded-lg object-cover" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{candidate.name}</h3>
                                                <p className="text-sm text-gray-600">{candidate.role}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(candidate.id)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(candidate.id)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                    : leaders.map((leader) => (
                                        <div
                                            key={leader.id}
                                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <img src={leader.image_url || 'https://via.placeholder.com/150'} alt={leader.name} className="w-16 h-16 rounded-lg object-cover" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{leader.name}</h3>
                                                <p className="text-sm text-gray-600">{leader.role}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(leader.id)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(leader.id)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Voter Details View Modal */}
            {isViewModalOpen && selectedVoter && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Voter Details</h3>
                                <button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        setSelectedVoter(null);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">{selectedVoter.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">{selectedVoter.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">{selectedVoter.phone_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Voted At</p>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedVoter.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Voting Choices */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Voting Choices
                                </h4>
                                <div className="space-y-3">
                                    {selectedVoter.president_vote && (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">President</span>
                                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                                {selectedVoter.president_vote}
                                            </span>
                                        </div>
                                    )}
                                    {selectedVoter.vice_president_vote && (
                                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vice President</span>
                                            <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                                                {selectedVoter.vice_president_vote}
                                            </span>
                                        </div>
                                    )}
                                    {selectedVoter.treasurer_vote && (
                                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Treasurer</span>
                                            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                                                {selectedVoter.treasurer_vote}
                                            </span>
                                        </div>
                                    )}
                                    {selectedVoter.secretary_vote && (
                                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secretary</span>
                                            <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-medium">
                                                {selectedVoter.secretary_vote}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Voter ID */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Voter ID</h4>
                                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">{selectedVoter.id}</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-700 p-4 rounded-b-xl flex justify-end gap-3">
                            <button
                                onClick={() => handleDeleteVoter(selectedVoter.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete Voter
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedVoter(null);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
