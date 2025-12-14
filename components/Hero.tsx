import { motion } from 'framer-motion';
import { Vote, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SimpleVotingModal } from './SimpleVotingModal';
import { votingPositionsAPI } from '../src/lib/api';
import type { VotingPosition } from '../src/lib/supabase';

const logoImage = '/logos/main_logo.png';

export function Hero() {
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
  const [positions, setPositions] = useState<VotingPosition[]>([]);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const data = await votingPositionsAPI.getAll();
      setPositions(data);
    } catch (error) {
      console.error('Error loading voting positions:', error);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-20 relative overflow-hidden transition-colors">
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* ASSAL Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <img src={logoImage} alt="ASSAL Community Logo" className="w-48 sm:w-56 md:w-64 h-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl mb-6 text-black dark:text-white">
            Voting with ASSAL Community
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-lg sm:text-2xl md:text-3xl bg-gradient-to-r from-red-600 via-green-600 to-green-700 bg-clip-text text-transparent mb-4">
            ASSAL COMMUNITY Trust each other, love each other, and engage each other.
          </p>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Association of Somaliland Students at AIU - Join us in building a stronger community through transparent and democratic leadership selection.

          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => setIsVotingModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center text-lg font-semibold"
          >
            <Vote size={28} />
            Vote Now
          </button>
          <button
            onClick={() => scrollToSection('candidates')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Users size={24} />
            View Candidates
          </button>
        </motion.div>
      </div>

      <SimpleVotingModal
        isOpen={isVotingModalOpen}
        onClose={() => setIsVotingModalOpen(false)}
        positions={positions}
      />
    </section>
  );
}