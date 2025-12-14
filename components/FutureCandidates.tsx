import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function FutureCandidates() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <Star className="w-16 h-16 text-black fill-black" />
          </div>
          <h2 className="text-4xl md:text-5xl mb-4 text-black">Future Candidates</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            These are candidates selected from participants to contest leadership positions.
            Each candidate brings unique experience, vision, and dedication to serve our community.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-red-600 via-white to-green-600 text-black p-8 rounded-xl text-center"
        >
          <p className="text-xl">
            Our candidates are committed to transparency, innovation, and community-driven leadership.
            Vote wisely and help shape the future of ASSAL Community!
          </p>
        </motion.div>
      </div>
    </section>
  );
}