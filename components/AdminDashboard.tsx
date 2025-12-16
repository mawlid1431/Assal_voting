import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Download, Search, Calendar, Mail, Phone, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

interface VoterData {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    created_at: string;
    president_vote?: string;
    vice_president_vote?: string;
}

interface VoteRanking {
    voter_id: string;
    candidate_name: string;
    position_slot: string;
    rank_order: number;
}

export default function AdminDashboard() {
    const [voters, setVoters] = useState<VoterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalVoters: 0,
        todayVotes: 0,
        presidentVotes: 0,
        vicePresidentVotes: 0
    });

    useEffect(() => {
        fetchVotersData();
    }, []);

    const fetchVotersData = async () => {
        try {
            setLoading(true);

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
                const voterRankings = rankingsData?.filter(r => r.voter_id === voter.id) || [];

                const presidentVote = voterRankings
                    .filter(r => r.position_slot === 'president')
                    .map(r => r.voting_positions?.name)
                    .filter(Boolean)
                    .join(', ');

                const vicePresidentVote = voterRankings
                    .filter(r => r.position_slot === 'vice_president')
                    .map(r => r.voting_positions?.name)
                    .filter(Boolean)
                    .join(', ');

                return {
                    ...voter,
                    president_vote: presidentVote || 'N/A',
                    vice_president_vote: vicePresidentVote || 'N/A'
                };
            }) || [];

            setVoters(processedVoters);

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const todayVotes = processedVoters.filter(v =>
                v.created_at.startsWith(today)
            ).length;

            const presidentVotes = rankingsData?.filter(r => r.position_slot === 'president').length || 0;
            const vicePresidentVotes = rankingsData?.filter(r => r.position_slot === 'vice_president').length || 0;

            setStats({
                totalVoters: processedVoters.length,
                todayVotes,
                presidentVotes,
                vicePresidentVotes
            });

        } catch (error) {
            console.error('Error fetching voters data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
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

    const filteredVoters = voters.filter(voter =>
        voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.phone_number.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage and monitor voting data
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Voters</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVoters}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Votes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayVotes}</p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">President Votes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.presidentVotes}</p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">VP Votes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.vicePresidentVotes}</p>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                                <Award className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Voters Table Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
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
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading voters data...</p>
                        </div>
                    ) : filteredVoters.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No voters found</p>
                        </div>
                    ) : (
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVoters.map((voter, index) => (
                                        <motion.tr
                                            key={voter.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
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
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Results Count */}
                    {!loading && filteredVoters.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredVoters.length} of {voters.length} voters
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
