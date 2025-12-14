import { motion } from 'framer-motion';
import { Vote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SimpleVotingModal } from './SimpleVotingModal';
import { votingPositionsAPI } from '../src/lib/api';
import type { VotingPosition } from '../src/lib/supabase';

export function VotingPositions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [positions, setPositions] = useState<VotingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const data = await votingPositionsAPI.getAll();
      setPositions(data);
    } catch (error) {
      console.error('Error loading voting positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorByRole = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('president') && !roleLower.includes('vice')) {
      return { color: 'from-red-600 to-red-700', borderColor: 'border-red-600' };
    } else if (roleLower.includes('vice')) {
      return { color: 'from-green-600 to-green-700', borderColor: 'border-green-600' };
    } else if (roleLower.includes('treasurer')) {
      return { color: 'from-red-600 to-green-600', borderColor: 'border-black' };
    } else {
      return { color: 'from-red-600 to-red-700', borderColor: 'border-red-600' };
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-red-50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xl">Loading voting positions...</p>
        </div>
      </section>
    );
  }

  const handleVoteClick = () => {
    setIsModalOpen(true);
  };

  return (
    <section id="candidates" className="py-20 px-4 bg-gradient-to-br from-green-50 to-red-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-black">Voting Positions</h2>
          <p className="text-lg text-gray-700">
            Choose your leaders for the upcoming term
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {positions.map((candidate, index) => {
            const { color, borderColor } = getColorByRole(candidate.role);
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${borderColor}`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-200">
                  <img
                    src={candidate.image_url || 'https://via.placeholder.com/400'}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className={`bg-gradient-to-r ${color} p-2 text-center`}>
                  <p className="text-white text-sm">{candidate.role}</p>
                </div>

                <div className="p-3 text-center">
                  <h3 className="text-base mb-3 text-black">{candidate.name}</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVoteClick}
                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 mx-auto text-sm"
                  >
                    <Vote size={16} />
                    Vote
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <SimpleVotingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        positions={positions}
      />
    </section>
  );
}