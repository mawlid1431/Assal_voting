import { motion } from 'framer-motion';
import { Heart, Users, Shield } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: 'Unity',
      description: 'We believe in the power of coming together as one community with shared values and goals.',
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: 'Trust',
      description: 'Building genuine relationships based on transparency, honesty, and mutual respect.',
    },
    {
      icon: <Heart className="w-12 h-12 text-green-600" />,
      title: 'Engagement',
      description: 'Active participation and meaningful connections that strengthen our community bonds.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-6 text-black">About ASSAL Community</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            ASSAL Community is built on the foundation of unity, trust, and engagement.
            We are dedicated to fostering an environment where every member feels valued,
            heard, and empowered to contribute to our collective success.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gradient-to-br from-green-50 to-red-50 p-8 rounded-xl hover:shadow-xl transition-shadow duration-300 text-center border-2 border-green-100"
            >
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-2xl mb-3 text-black">{value.title}</h3>
              <p className="text-gray-700">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}