import { motion } from 'framer-motion';
import { Eye, Hand, Vote, BarChart3 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Eye className="w-12 h-12" />,
      title: 'View Candidates',
      description: 'Browse through all the candidates running for different positions in our community.',
      number: '01',
    },
    {
      icon: <Hand className="w-12 h-12" />,
      title: 'Choose a Position',
      description: 'Select the leadership position you want to vote for - President, Vice President, or Treasurer.',
      number: '02',
    },
    {
      icon: <Vote className="w-12 h-12" />,
      title: 'Vote Live',
      description: 'Cast your vote for your preferred candidate with a simple click.',
      number: '03',
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: 'See Results Instantly',
      description: 'Watch the live results update in real-time as votes are counted.',
      number: '04',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-red-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-black">How It Works</h2>
          <p className="text-lg text-gray-700">
            Voting is simple and transparent - follow these easy steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute -top-4 -left-4 bg-gradient-to-br from-red-600 to-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl">
                {step.number}
              </div>

              <div className="text-green-600 mb-4">{step.icon}</div>

              <h3 className="text-xl mb-3 text-black">{step.title}</h3>

              <p className="text-gray-700">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}