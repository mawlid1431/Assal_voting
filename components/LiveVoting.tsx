import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Medal } from 'lucide-react';

export function LiveVoting() {
  const results = [
    {
      position: 'President',
      candidates: [
        { name: 'David Thompson', votes: 68, totalVotes: 145, color: 'from-red-600 to-red-700', icon: Trophy },
        { name: 'Jennifer Adams', votes: 32, totalVotes: 68, color: 'from-red-400 to-red-500', icon: Medal },
      ],
    },
    {
      position: 'Vice President',
      candidates: [
        { name: 'Emily Rodriguez', votes: 72, totalVotes: 156, color: 'from-green-600 to-green-700', icon: Trophy },
        { name: 'Kevin Brown', votes: 28, totalVotes: 61, color: 'from-green-400 to-green-500', icon: Medal },
      ],
    },
    {
      position: 'Treasurer',
      candidates: [
        { name: 'Marcus Johnson', votes: 55, totalVotes: 112, color: 'from-red-600 to-green-600', icon: Trophy },
        { name: 'Lisa White', votes: 45, totalVotes: 91, color: 'from-red-400 to-green-400', icon: Medal },
      ],
    },
    {
      position: 'Secretary',
      candidates: [
        { name: 'Ahmed Hassan', votes: 62, totalVotes: 128, color: 'from-red-600 to-red-700', icon: Trophy },
        { name: 'Fatima Ali', votes: 38, totalVotes: 79, color: 'from-red-400 to-red-500', icon: Medal },
      ],
    },
  ];

  // Flatten all candidates into a single array for 4x4 grid
  const allCandidates = results.flatMap((result, posIndex) =>
    result.candidates.map((candidate, candIndex) => ({
      ...candidate,
      position: result.position,
      isLeading: candIndex === 0,
      positionIndex: posIndex,
      candidateIndex: candIndex,
    }))
  );

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
            Real-time voting results preview (UI demonstration only)
          </p>
        </motion.div>

        {/* 4x4 Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {allCandidates.map((candidate, idx) => {
            const Icon = candidate.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
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
                      delay: idx * 0.1 + 0.2
                    }}
                    className={`text-4xl bg-gradient-to-r ${candidate.color} bg-clip-text text-transparent mb-1`}
                  >
                    {candidate.votes}%
                  </motion.div>
                  <p className="text-gray-600 text-xs">{candidate.totalVotes} votes</p>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${candidate.votes}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.2,
                        delay: idx * 0.1 + 0.3,
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
          <div className="inline-block bg-white border border-gray-300 rounded-lg px-6 py-3 shadow-md">
            <p className="text-gray-600 text-sm">
              * This is a static preview for demonstration purposes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}