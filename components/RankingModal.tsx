import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, GripVertical, CheckCircle, User, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { VotingPosition } from '../src/lib/supabase';

interface RankingModalProps {
    isOpen: boolean;
    onClose: () => void;
    positions: VotingPosition[];
}

export function RankingModal({ isOpen, onClose, positions }: RankingModalProps) {
    const [step, setStep] = useState(1);
    const [rankedPositions, setRankedPositions] = useState<VotingPosition[]>([]);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
    });

    useEffect(() => {
        if (positions.length > 0) {
            setRankedPositions([...positions]);
        }
    }, [positions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleNext = () => {
        if (step === 1 && formData.fullName && formData.phoneNumber && formData.email) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleSubmit = () => {
        console.log('Vote submitted:', {
            voter: formData,
            rankings: rankedPositions.map((pos, index) => ({
                rank: index + 1,
                position: pos.role,
                candidate: pos.name,
            })),
        });
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
        });
        setRankedPositions([...positions]);
        onClose();
    };

    const isStep1Valid = formData.fullName && formData.phoneNumber && formData.email;

    const getColorByRole = (role: string) => {
        const roleLower = role.toLowerCase();
        if (roleLower.includes('president') && !roleLower.includes('vice')) {
            return 'bg-red-600';
        } else if (roleLower.includes('vice')) {
            return 'bg-green-600';
        } else if (roleLower.includes('treasurer')) {
            return 'bg-gradient-to-r from-red-600 to-green-600';
        } else {
            return 'bg-red-600';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-green-600 text-white p-6 rounded-t-2xl z-10">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl mb-2">Rank Your Candidates</h2>
                            <p className="text-sm text-white/90">Step {step} of 3</p>
                        </div>

                        <div className="p-6">
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
                                        Next: Rank Candidates
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-xl text-black mb-2">Organize Your Preferences</h3>
                                        <p className="text-sm text-gray-600">
                                            Drag and drop to rank candidates by priority. Top = Most preferred
                                        </p>
                                    </div>

                                    <Reorder.Group
                                        axis="y"
                                        values={rankedPositions}
                                        onReorder={setRankedPositions}
                                        className="space-y-3"
                                    >
                                        {rankedPositions.map((position, index) => (
                                            <Reorder.Item
                                                key={position.id}
                                                value={position}
                                                className="cursor-grab active:cursor-grabbing"
                                            >
                                                <motion.div
                                                    layout
                                                    className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:border-green-600 transition-colors shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-shrink-0">
                                                            <GripVertical className="text-gray-400" size={24} />
                                                        </div>

                                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-green-100 flex items-center justify-center text-lg font-bold text-gray-700">
                                                            {index + 1}
                                                        </div>

                                                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                                                            <img
                                                                src={position.image_url || 'https://via.placeholder.com/100'}
                                                                alt={position.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-base font-semibold text-black truncate">
                                                                {position.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`${getColorByRole(position.role)} text-white text-xs px-2 py-1 rounded`}>
                                                                    {position.role}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>

                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Tip:</strong> Click and drag any card to reorder your preferences
                                        </p>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-green-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-green-700 transition-all"
                                        >
                                            Next: Review
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-xl mb-4 text-black">Confirm Your Rankings</h3>

                                    <div className="bg-gradient-to-br from-red-50 to-green-50 border-2 border-green-600 rounded-lg p-6 space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Voter</p>
                                            <p className="text-black font-semibold">{formData.fullName}</p>
                                            <p className="text-sm text-gray-600">{formData.email}</p>
                                            <p className="text-sm text-gray-600">{formData.phoneNumber}</p>
                                        </div>

                                        <div className="pt-3 border-t-2 border-green-200">
                                            <p className="text-sm text-gray-600 mb-3">Your Rankings</p>
                                            <div className="space-y-2">
                                                {rankedPositions.map((position, index) => (
                                                    <div key={position.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-black font-medium">{position.name}</p>
                                                            <p className="text-xs text-gray-600">{position.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800">
                                            <strong>⚠️ Are you sure?</strong> Once submitted, your rankings cannot be changed.
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
                                            className="flex-1 bg-gradient-to-r from-red-600 to-green-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-green-700 transition-all"
                                        >
                                            Submit Rankings
                                        </button>
                                    </div>
                                </motion.div>
                            )}

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
                                    <h3 className="text-2xl mb-2 text-black">Rankings Submitted!</h3>
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
