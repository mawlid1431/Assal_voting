import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, User, Phone, Mail, Vote } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { VotingPosition } from '../src/lib/supabase';
import { votersAPI, rankingsAPI, voteAttemptsAPI } from '../src/lib/api';

interface SimpleVotingModalProps {
    isOpen: boolean;
    onClose: () => void;
    positions: VotingPosition[];
}

interface GroupedPositions {
    president: VotingPosition[];
    vice_president: VotingPosition[];
    treasurer: VotingPosition[];
}

export function SimpleVotingModal({ isOpen, onClose, positions }: SimpleVotingModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
    });

    const [selectedVotes, setSelectedVotes] = useState<{
        president?: string;
        vice_president?: string;
        treasurer?: string;
    }>({});

    const [groupedPositions, setGroupedPositions] = useState<GroupedPositions>({
        president: [],
        vice_president: [],
        treasurer: []
    });

    useEffect(() => {
        if (positions.length > 0) {
            const grouped: GroupedPositions = {
                president: [],
                vice_president: [],
                treasurer: []
            };

            positions.forEach(pos => {
                const role = pos.role.toLowerCase();
                if (role.includes('president') && !role.includes('vice')) {
                    grouped.president.push(pos);
                } else if (role.includes('vice')) {
                    grouped.vice_president.push(pos);
                } else if (role.includes('treasurer')) {
                    grouped.treasurer.push(pos);
                }
            });

            setGroupedPositions(grouped);
        }
    }, [positions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectCandidate = (positionKey: keyof GroupedPositions, candidateId: string) => {
        setSelectedVotes(prev => ({
            ...prev,
            [positionKey]: prev[positionKey] === candidateId ? undefined : candidateId
        }));
    };

    const handleNext = async () => {
        if (step === 1 && formData.fullName && formData.phoneNumber && formData.email) {
            // Check if user has already voted before proceeding
            try {
                const voteCheck = await votersAPI.checkIfAlreadyVoted(
                    formData.email,
                    formData.phoneNumber
                );

                if (voteCheck.hasVoted && voteCheck.voter) {
                    const voteDate = new Date(voteCheck.voteDate!).toLocaleString();

                    // Log the rejected attempt
                    await voteAttemptsAPI.logAttempt({
                        full_name: formData.fullName,
                        email: formData.email,
                        phone_number: formData.phoneNumber,
                        attempt_status: 'rejected_already_voted',
                        rejection_reason: `User attempted to vote again. Original vote by ${voteCheck.voter.full_name} (${voteCheck.voter.email}) on ${voteDate}`,
                        existing_voter_id: voteCheck.voter.id
                    });

                    alert(
                        `⚠️ Already Voted!\n\n` +
                        `This email or phone number has already been used to vote.\n\n` +
                        `Name: ${voteCheck.voter.full_name}\n` +
                        `Email: ${voteCheck.voter.email}\n` +
                        `Phone: ${voteCheck.voter.phone_number}\n` +
                        `Vote Date: ${voteDate}\n\n` +
                        `Each person can only vote once to ensure fair elections.`
                    );
                    return;
                }

                setStep(2);
            } catch (error) {
                console.error('Error checking vote status:', error);
                // If check fails, allow them to proceed (fail open)
                setStep(2);
            }
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        try {
            // Check if user has already voted
            const voteCheck = await votersAPI.checkIfAlreadyVoted(
                formData.email,
                formData.phoneNumber
            );

            if (voteCheck.hasVoted && voteCheck.voter) {
                const voteDate = new Date(voteCheck.voteDate!).toLocaleString();

                // Log the rejected attempt
                await voteAttemptsAPI.logAttempt({
                    full_name: formData.fullName,
                    email: formData.email,
                    phone_number: formData.phoneNumber,
                    attempt_status: 'rejected_already_voted',
                    rejection_reason: `Duplicate submission attempt. Original vote by ${voteCheck.voter.full_name} on ${voteDate}`,
                    existing_voter_id: voteCheck.voter.id
                });

                alert(
                    `You have already voted!\n\n` +
                    `Email: ${voteCheck.voter.email}\n` +
                    `Phone: ${voteCheck.voter.phone_number}\n` +
                    `Vote submitted: ${voteDate}\n\n` +
                    `Each person can only vote once. If you believe this is an error, please contact the administrator.`
                );
                return;
            }

            // Create or get voter
            const voter = await votersAPI.create({
                full_name: formData.fullName,
                email: formData.email,
                phone_number: formData.phoneNumber
            });

            // Prepare rankings data
            const rankings = Object.entries(selectedVotes)
                .filter(([_, candidateId]) => candidateId)
                .map(([positionKey, candidateId]) => ({
                    candidateId: candidateId!,
                    positionSlot: positionKey,
                    rankOrder: 1,
                    rating: 10 // Default rating for simple vote
                }));

            // Submit rankings
            await rankingsAPI.submitRankings(voter.id, rankings);

            // Log successful vote attempt
            await voteAttemptsAPI.logAttempt({
                full_name: formData.fullName,
                email: formData.email,
                phone_number: formData.phoneNumber,
                attempt_status: 'success',
                rejection_reason: undefined,
                existing_voter_id: voter.id
            });

            console.log('Vote submitted successfully');

            setStep(4);
            setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote. Please try again.');
        }
    };

    const handleClose = () => {
        setStep(1);
        setFormData({
            fullName: '',
            phoneNumber: '',
            email: '',
        });
        setSelectedVotes({});
        onClose();
    };

    const isStep1Valid = formData.fullName && formData.phoneNumber && formData.email;
    const hasAnyVotes = Object.values(selectedVotes).some(v => v);

    const getPositionTitle = (key: keyof GroupedPositions) => {
        const titles = {
            president: 'President',
            vice_president: 'Vice President',
            treasurer: 'Treasurer'
        };
        return titles[key];
    };

    const getPositionColor = (key: keyof GroupedPositions) => {
        const colors = {
            president: 'from-red-600 to-red-700',
            vice_president: 'from-green-600 to-green-700',
            treasurer: 'from-red-600 to-green-600'
        };
        return colors[key];
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
                        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-green-600 text-white p-6 rounded-t-2xl z-10">
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
                                        Next: Select Candidates
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 2: Select Candidates */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-xl text-black mb-2">Select Your Candidates</h3>
                                        <p className="text-sm text-gray-600">
                                            Click on a candidate to select them for each position
                                        </p>
                                    </div>

                                    {(Object.keys(groupedPositions) as Array<keyof GroupedPositions>).map(positionKey => {
                                        const candidates = groupedPositions[positionKey];
                                        if (candidates.length === 0) return null;

                                        return (
                                            <div key={positionKey} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                                                <div className={`bg-gradient-to-r ${getPositionColor(positionKey)} text-white px-4 py-2 rounded-lg mb-4 text-center font-semibold`}>
                                                    {getPositionTitle(positionKey)}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {candidates.map(candidate => {
                                                        const isSelected = selectedVotes[positionKey] === candidate.id;
                                                        return (
                                                            <motion.div
                                                                key={candidate.id}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => handleSelectCandidate(positionKey, candidate.id)}
                                                                className={`cursor-pointer rounded-lg overflow-hidden transition-all ${isSelected
                                                                    ? 'ring-4 ring-green-500 shadow-lg'
                                                                    : 'border-2 border-gray-300 hover:border-green-400'
                                                                    }`}
                                                            >
                                                                <div className="aspect-[3/4] overflow-hidden bg-gray-200">
                                                                    <img
                                                                        src={candidate.image_url || 'https://via.placeholder.com/400'}
                                                                        alt={candidate.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="bg-white p-3 text-center">
                                                                    <h4 className="text-sm font-semibold text-black mb-1">{candidate.name}</h4>
                                                                    {isSelected && (
                                                                        <div className="flex items-center justify-center gap-1 text-green-600 text-xs">
                                                                            <CheckCircle size={14} />
                                                                            <span>Selected</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Tip:</strong> You can select one candidate per position. Click again to deselect.
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
                                            disabled={!hasAnyVotes}
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
                                    <h3 className="text-xl mb-4 text-black">Confirm Your Votes</h3>

                                    <div className="bg-gradient-to-br from-red-50 to-green-50 border-2 border-green-600 rounded-lg p-6 space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Voter</p>
                                            <p className="text-black font-semibold">{formData.fullName}</p>
                                            <p className="text-sm text-gray-600">{formData.email}</p>
                                            <p className="text-sm text-gray-600">{formData.phoneNumber}</p>
                                        </div>

                                        <div className="pt-3 border-t-2 border-green-200">
                                            <p className="text-sm text-gray-600 mb-3 font-semibold">Your Votes</p>
                                            <div className="space-y-3">
                                                {(Object.keys(selectedVotes) as Array<keyof typeof selectedVotes>).map(positionKey => {
                                                    const candidateId = selectedVotes[positionKey];
                                                    if (!candidateId) return null;

                                                    const candidate = positions.find(p => p.id === candidateId);
                                                    if (!candidate) return null;

                                                    return (
                                                        <div key={positionKey} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                                            <div className={`bg-gradient-to-r ${getPositionColor(positionKey)} text-white px-3 py-1 rounded text-xs font-semibold mb-2 inline-block`}>
                                                                {getPositionTitle(positionKey)}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                                                                    <img
                                                                        src={candidate.image_url || 'https://via.placeholder.com/100'}
                                                                        alt={candidate.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-black font-semibold">{candidate.name}</p>
                                                                    <p className="text-sm text-gray-600">{candidate.role}</p>
                                                                </div>
                                                                <CheckCircle className="text-green-600" size={24} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
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
