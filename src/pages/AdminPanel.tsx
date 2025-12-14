import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Upload, Save, X, Users, Award, LogOut } from 'lucide-react';
import { votingPositionsAPI, leadershipAPI, uploadImage } from '../lib/api';
import type { VotingPosition, Leadership } from '../lib/supabase';
import { ThemeToggle } from '../../components/ThemeToggle';

export function AdminPanel() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'candidates' | 'leadership'>('candidates');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [candidates, setCandidates] = useState<VotingPosition[]>([]);
    const [leaders, setLeaders] = useState<Leadership[]>([]);

    const [formData, setFormData] = useState({ name: '', position: '', role: '', image: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [positions, leadership] = await Promise.all([
                votingPositionsAPI.getAll(),
                leadershipAPI.getAll()
            ]);
            setCandidates(positions || []);
            setLeaders(leadership || []);
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
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>

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
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <Users size={20} />
                        Voting Positions
                    </button>
                    <button
                        onClick={() => setActiveTab('leadership')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${activeTab === 'leadership'
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <Award size={20} />
                        Leadership & Top Management
                    </button>
                </div>

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
            </div>
        </div>
    );
}
