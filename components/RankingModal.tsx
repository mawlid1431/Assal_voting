import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, User, Phone, Mail, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { VotingPosition } from '../src/lib/supabase';
import { votersAPI, rankingsAPI } from '../src/lib/api';

interface RankingModalProps {
    isOpen: boolean;
    onClose: () => void;
    positions: VotingPosition[];
}

interface PositionSlot {
    id: string;
    title: string;
    candidates: (VotingPosition & { rating: number })[];
    color: string;
}

interface DraggedCandidate extends VotingPosition {
    rating: number;
}

export function RankingModal({ isOpen, onClose, positions }: RankingModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
    });

    const [positionSlots, setPositionSlots] = useState<PositionSlot[]>([
        { id: 'president', title: 'President', candidates: [], color: 'from-red-600 to-red-700' },
        { id: 'vice_president', title: 'Vice President', candidates: [], color: 'from-green-600 to-green-700' },
        { id: 'treasurer', title: 'Treasurer', candidates: [], color: 'from-red-600 to-green-600' },
    ]);

    const [availableCandidates, setAvailableCandidates] = useState<DraggedCandidate[]>([]);
    const [draggedCandidate, setDraggedCandidate] = useState<DraggedCandidate | null>(null);

    useEffect(() => {
        if (positions.length > 0) {
            setAvailableCandidates(positions.map(p => ({ ...p, rating: 5 })));
        }
    }, [positions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDragStart = (candidate: DraggedCandidate) => {
        setDraggedCandidate(candidate);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropOnSlot = (slotId: string) => {
        if (!draggedCandidate) return;

        // Remove from available candidates
        setAvailableCandidates(prev => prev.filter(c => c.id !== draggedCandidate.id));

        // Remove from other slots if already placed
        setPositionSlots(prev => prev.map(slot => ({
            ...slot,
            candidates: slot.candidates.filter(c => c.id !== draggedCandidate.id)
        })));

        // Add to target slot
        setPositionSlots(prev => prev.map(slot => {
            if (slot.id === slotId) {
                return {
                    ...slot,
                    candidates: [...slot.candidates, draggedCandidate]
                };
            }
            return slot;
        }));

        setDraggedCandidate(null);
    };

    const handleDropBackToAvailable = () => {
        if (!draggedCandidate) return;

        // Remove from all slots
        setPositionSlots(prev => prev.map(slot => ({
            ...slot,
            candidates: slot.candidates.filter(c => c.id !== draggedCandidate.id)
        })));

        // Add back to available if not already there
        if (!availableCandidates.find(c => c.id === draggedCandidate.id)) {
            setAvailableCandidates(prev => [...prev, draggedCandidate]);
        }

        setDraggedCandidate(null);
    };

    const handleRatingChange = (slotId: string, candidateId: string, rating: number) => {
        setPositionSlots(prev => prev.map(slot => {
            if (slot.id === slotId) {
                return {
                    ...slot,
                    candidates: slot.candidates.map(c =>
                        c.id === candidateId ? { ...c, rating } : c
                    )
                };
            }
            return slot;
        }));
    };

    const handleNext = () => {
        if (step === 1 && formData.fullName && formData.phoneNumber && formData.email) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleSubmit = () => {
        const rankings = positionSlots.flatMap(slot =>
            slot.candidates.map((candidate, index) => ({
                position: slot.id,
                positionTitle: slot.title,
                rank: index + 1,
                candidateId: candidate.id,
                candidateName: candidate.name,
                rating: candidate.rating
            }))
        );

        console.log('Vote submitted:', {
            voter: formData,
            rankings
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
        setPositionSlots([
            { id: 'president', title: 'President', candidates: [], color: 'from-red-600 to-red-700' },
            { id: 'vice_president', title: 'Vice President', candidates: [], color: 'from-green-600 to-green-700' },
            { id: 'treasurer', title: 'Treasurer', candidates: [], color: 'from-red-600 to-green-600' },
        ]);
        setAvailableCandidates(positions.map(p => ({ ...p, rating: 5 })));
        onClose();
    };

    const isStep1Valid = formData.fullName && formData.phoneNumber && formData.email;
    const hasAnyRankings = positionSlots.some(slot => slot.candidates.length > 0);

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
                                        <h3 className="text-xl text-black mb-2">Drag Candidates to Positions</h3>
                                        <p className="text-sm text-gray-600">
                                            Drag candidates into position slots and rate them out of 10
                                        </p>
                                    </div>

                                    {/* Position Slots */}
                                    <div className="space-y-4">
                                        {positionSlots.map(slot => (
                                            <div key={slot.id} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                                                <div className={`bg-gradient-to-r ${slot.color} text-white px-3 py-2 rounded-lg mb-3 text-center font-semibold`}>
                                                    {slot.title}
                                                </div>

                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDrop={() => handleDropOnSlot(slot.id)}
                                                    className={`min-h-[120px] border-2 border-dashed rounded-lg p-3 transition-colors ${slot.candidates.length === 0
                                                        ? 'border-gray-300 bg-white'
                                                        : 'border-green-400 bg-green-50'
                                                        }`}
                                                >
                                                    {slot.candidates.length === 0 ? (
                                                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                                            Drop candidate here
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {slot.candidates.map((candidate, index) => (
                                                                <div
                                                                    key={candidate.id}
                                                                    draggable
                                                                    onDragStart={() => handleDragStart(candidate)}
                                                                    className="bg-white border-2 border-gray-300 rounded-lg p-3 cursor-move hover:border-green-500 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-green-100 flex items-center justify-center text-sm font-bold text-gray-700">
                                                                            {index + 1}
                                                                        </div>

                                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                                                                            <img
                                                                                src={candidate.image_url || 'https://via.placeholder.com/100'}
                                                                                alt={candidate.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>

                                                                        <div className="flex-1">
                                                                            <h4 className="text-sm font-semibold text-black">{candidate.name}</h4>
                                                                            <p className="text-xs text-gray-600">{candidate.role}</p>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <Star className="text-yellow-500" size={16} />
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max="10"
                                                                                step="0.5"
                                                                                value={candidate.rating}
                                                                                onChange={(e) => handleRatingChange(slot.id, candidate.id, parseFloat(e.target.value))}
                                                                                className="w-16 px-2 py-1 border-2 border-gray-300 rounded text-center text-sm focus:border-green-600 focus:outline-none"
                                                                            />
                                                                            <span className="text-xs text-gray-600">/10</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Available Candidates */}
                                    <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-3">Available Candidates</h4>
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={handleDropBackToAvailable}
                                            className="grid grid-cols-2 gap-2 min-h-[80px]"
                                        >
                                            {availableCandidates.length === 0 ? (
                                                <div className="col-span-2 flex items-center justify-center text-gray-400 text-sm py-4">
                                                    All candidates assigned
                                                </div>
                                            ) : (
                                                availableCandidates.map(candidate => (
                                                    <div
                                                        key={candidate.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(candidate)}
                                                        className="bg-white border-2 border-gray-300 rounded-lg p-2 cursor-move hover:border-blue-500 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                                                                <img
                                                                    src={candidate.image_url || 'https://via.placeholder.com/100'}
                                                                    alt={candidate.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="text-xs font-semibold text-black truncate">{candidate.name}</h5>
                                                                <p className="text-xs text-gray-600 truncate">{candidate.role}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Tip:</strong> Drag candidates to position slots, rate them, and drag back to remove
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
                                            disabled={!hasAnyRankings}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-green-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <h3 className="text-xl mb-4 text-black">Confirm Your Rankings & Ratings</h3>

                                    <div className="bg-gradient-to-br from-red-50 to-green-50 border-2 border-green-600 rounded-lg p-6 space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Voter</p>
                                            <p className="text-black font-semibold">{formData.fullName}</p>
                                            <p className="text-sm text-gray-600">{formData.email}</p>
                                            <p className="text-sm text-gray-600">{formData.phoneNumber}</p>
                                        </div>

                                        <div className="pt-3 border-t-2 border-green-200">
                                            <p className="text-sm text-gray-600 mb-3 font-semibold">Your Position Assignments</p>
                                            <div className="space-y-3">
                                                {positionSlots.map(slot => (
                                                    slot.candidates.length > 0 && (
                                                        <div key={slot.id} className="bg-white p-3 rounded-lg border-2 border-gray-200">
                                                            <div className={`bg-gradient-to-r ${slot.color} text-white px-2 py-1 rounded text-xs font-semibold mb-2 inline-block`}>
                                                                {slot.title}
                                                            </div>
                                                            <div className="space-y-2">
                                                                {slot.candidates.map((candidate, index) => (
                                                                    <div key={candidate.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-green-600 flex items-center justify-center text-white font-bold text-xs">
                                                                            {index + 1}
                                                                        </div>
                                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                                                                            <img
                                                                                src={candidate.image_url || 'https://via.placeholder.com/100'}
                                                                                alt={candidate.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-black font-medium text-sm">{candidate.name}</p>
                                                                            <p className="text-xs text-gray-600">{candidate.role}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                                                                            <Star className="text-yellow-600" size={14} />
                                                                            <span className="text-sm font-bold text-yellow-700">{candidate.rating}/10</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800">
                                            <strong>⚠️ Are you sure?</strong> Once submitted, your rankings and ratings cannot be changed.
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
