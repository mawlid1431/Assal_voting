import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { votingPositionsAPI, rankingsAPI } from '../src/lib/api';
import type { VotingPosition } from '../src/lib/supabase';

interface CandidateWithStats extends VotingPosition {
  voteCount: number;
  percentage: number;
  position: string;
  isLeading: boolean;
  color: string;
  icon: typeof Trophy;
}

export function LiveVoting() {
  const [candidates, setCandidates] = useState<CandidateWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVoters, setTotalVoters] = useState(0);

  useEffect(() => {
    loadVotingData();

    // Refresh data every 5 seconds for real-time updates
    const interval = setInterval(loadVotingData, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadVotingData = async () => {
    try {
      // Get all candidates
      const allCandidates = await votingPositionsAPI.getAll();

      // Get all rankings to calculate votes
      const allRankings = await rankingsAPI.getAllRankings();

      // Count unique voters
      const uniqueVoters = new Set(allRankings.map((r: any) => r.voter_id)).size;
      setTotalVoters(uniqueVoters);

      // Group candidates by position
      const positionGroups: { [key: string]: CandidateWithStats[] } = {
        president: [],
        vice_president: [],
        treasurer: [],
        secretary: []
      };

      // Calculate vote counts for each candidate
      allCandidates.forEach(candidate => {
        const votesForCandidate = allRankings.filter(
          (r: any) => r.candidate_id === candidate.id
        ).length;

        const role = candidate.role.toLowerCase();
        let positionKey = 'president';
        let positionLabel = 'President';
        let color = 'from-red-600 to-red-700';

        if (role.includes('vice')) {
          positionKey = 'vice_president';
          positionLabel = 'Vice President';
          color = 'from-green-600 to-green-700';
        } else if (role.includes('treasurer')) {
          positionKey = 'treasurer';
          positionLabel = 'Treasurer';
          color = 'from-red-600 to-green-600';
        } else if (role.includes('secretary')) {
          positionKey = 'secretary';
          positionLabel = 'Secretary';
          color = 'from-blue-600 to-blue-700';
        }

        // Get total votes for this position
        const votesInPosition = allRankings.filter(
          (r: any) => r.position_slot === positionKey
        ).length;

        const percentage = votesInPosition > 0
          ? Math.round((votesForCandidate / votesInPosition) * 100)
          : 0;

        positionGroups[positionKey].push({
          ...candidate,
          voteCount: votesForCandidate,
          percentage,
          position: positionLabel,
          isLeading: false,
          color,
          icon: Trophy
        });
      });

      // Sort each position group by vote count and mark leaders
      Object.keys(positionGroups).forEach(key => {
        positionGroups[key].sort((a, b) => b.voteCount - a.voteCount);
        if (positionGroups[key].length > 0) {
          positionGroups[key][0].isLeading = true;
          positionGroups[key][0].icon = Trophy;

          // Set Medal icon for second place
          if (positionGroups[key].length > 1) {
            positionGroups[key][1].icon = Medal;
            positionGroups[key][1].color = positionGroups[key][1].color.replace('600', '400').replace('700', '500');
          }
        }
      });

      // Flatten to array
      const allCandidatesWithStats = Object.values(positionGroups).flat();
      setCandidates(allCandidatesWithStats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading voting data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="live-voting" className="py-20 px-4 bg-gradient-to-br from-green-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl text-gray-600">Loading live results...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="live-voting" className="py-20 px-4 bg-gradient-to-br from-green-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-red-600 to-green-600 p-3 rounded-full">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-red-600 via-black to-green-600 bg-clip-text text-transparent">
            Live Voting Leaderboard
          </h2>
          <p className="text-lg text-gray-700">
            Real-time voting results • {totalVoters} {totalVoters === 1 ? 'voter' : 'voters'} participated
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {candidates.map((candidate, idx) => {
            const Icon = candidate.icon;

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative bg-white ${candidate.isLeading ? 'border-yellow-500 shadow-xl' : 'border-gray-300 shadow-lg'
                  } rounded-xl p-4 border-2 overflow-hidden group`}
              >
                {/* Leading badge */}
                {candidate.isLeading && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-0.5 text-xs rounded-full shadow-lg">
                      #1
                    </div>
                  </div>
                )}

                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${candidate.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Position label */}
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-600 mb-2">{candidate.position}</p>
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`bg-gradient-to-r ${candidate.color} p-2 rounded-full shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                </div>

                {/* Candidate image */}
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={candidate.image_url || 'https://via.placeholder.com/100'}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Candidate name */}
                <h4 className="text-base text-black text-center mb-3 leading-tight">
                  {candidate.name}
                </h4>

                {/* Vote percentage */}
                <div className="text-center mb-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                      delay: idx * 0.05 + 0.2
                    }}
                    className={`text-4xl bg-gradient-to-r ${candidate.color} bg-clip-text text-transparent mb-1`}
                  >
                    {candidate.percentage}%
                  </motion.div>
                  <p className="text-gray-600 text-xs">{candidate.voteCount} {candidate.voteCount === 1 ? 'vote' : 'votes'}</p>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      key={`${candidate.id}-${candidate.percentage}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${candidate.percentage}%` }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut"
                      }}
                      className={`h-full bg-gradient-to-r ${candidate.color} shadow-lg`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-block bg-gradient-to-r from-green-50 to-red-50 border-2 border-green-600 rounded-lg px-6 py-3 shadow-md">
            <p className="text-gray-700 text-sm flex items-center gap-2 justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live results • Updates every 5 seconds
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}