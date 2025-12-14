import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { leadershipAPI } from '../src/lib/api';
import type { Leadership as LeadershipType } from '../src/lib/supabase';

export function Leadership() {
  const [leaders, setLeaders] = useState<LeadershipType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaders();
  }, []);

  const loadLeaders = async () => {
    try {
      const data = await leadershipAPI.getAll();
      setLeaders(data);
    } catch (error) {
      console.error('Error loading leadership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xl">Loading leadership...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-black">Leadership & Top Management</h2>
          <p className="text-lg text-gray-700">
            Meet the dedicated individuals leading our community forward
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-t-4 border-green-600"
            >
              <div className="aspect-square overflow-hidden bg-gray-200">
                <img
                  src={leader.image_url || 'https://via.placeholder.com/400'}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-bold mb-1 text-black">{leader.name}</h3>
                <p className="text-sm text-green-600">{leader.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}