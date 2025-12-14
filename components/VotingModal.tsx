import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Vote, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidate?: {
    position: string;
    name: string;
  };
}

export function VotingModal({ isOpen, onClose, selectedCandidate }: VotingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    votingFor: selectedCandidate?.position || '',
  });

  const positions = [
    { value: 'President', label: 'President - David Thompson' },
    { value: 'Vice President', label: 'Vice President - Emily Rodriguez' },
    { value: 'Treasurer', label: 'Treasurer - Marcus Johnson' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.fullName && formData.phoneNumber && formData.email) {
      setStep(2);
    } else if (step === 2 && formData.votingFor) {
      setStep(3);
    }
  };

  const handleSubmit = () => {
    // Here you would normally submit to a backend
    console.log('Vote submitted:', formData);
    setStep(4);
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      votingFor: selectedCandidate?.position || '',
    });
    onClose();
  };

  const isStep1Valid = formData.fullName && formData.phoneNumber && formData.email;
  const isStep2Valid = formData.votingFor;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-green-600 text-white p-6 rounded-t-2xl">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl mb-2">Cast Your Vote</h2>
              <p className="text-sm text-white/90">Step {step} of 3</p>
            </div>

            <div className="p-6">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl mb-4 text-black">Your Information</h3>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      <User className="inline w-4 h-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      <Phone className="inline w-4 h-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="w-full bg-gradient-to-r from-red-600 to-green-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Select Position
                  </button>
                </motion.div>
              )}

              {/* Step 2: Select Position */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl mb-4 text-black">Select Position to Vote</h3>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      <Vote className="inline w-4 h-4 mr-2" />
                      Choose Position *
                    </label>
                    <select
                      name="votingFor"
                      value={formData.votingFor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">Select a position...</option>
                      {positions.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Voter:</strong> {formData.fullName}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Email:</strong> {formData.email}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Phone:</strong> {formData.phoneNumber}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!isStep2Valid}
                      className="flex-1 bg-gradient-to-r from-red-600 to-green-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Review
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl mb-4 text-black">Confirm Your Vote</h3>

                  <div className="bg-gradient-to-br from-red-50 to-green-50 border-2 border-green-600 rounded-lg p-6 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-black">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-black">{formData.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-black">{formData.email}</p>
                    </div>
                    <div className="pt-3 border-t-2 border-green-200">
                      <p className="text-sm text-gray-600">Voting For</p>
                      <p className="text-black text-lg">{formData.votingFor}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      <strong>⚠️ Are you sure?</strong> Once submitted, your vote cannot be changed.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-red-600 to-green-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Vote size={20} />
                      Submit Vote
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl mb-2 text-black">Vote Submitted!</h3>
                  <p className="text-gray-700">
                    Thank you for participating in ASSAL Community voting.
                  </p>
                  <p className="text-sm text-gray-600 mt-4">
                    This window will close automatically...
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
