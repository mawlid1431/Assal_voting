import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone } from 'lucide-react';

interface QRCodePopupProps {
    displayDuration?: number; // Duration in milliseconds (default 40 seconds)
}

export function QRCodePopup({ displayDuration = 40000 }: QRCodePopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        // Show QR code after 2 seconds of page load
        const showTimer = setTimeout(() => {
            if (!hasShown) {
                setIsVisible(true);
                setHasShown(true);
            }
        }, 2000);

        return () => clearTimeout(showTimer);
    }, [hasShown]);

    useEffect(() => {
        if (isVisible) {
            // Auto-hide after specified duration
            const hideTimer = setTimeout(() => {
                setIsVisible(false);
            }, displayDuration);

            return () => clearTimeout(hideTimer);
        }
    }, [isVisible, displayDuration]);

    const handleClose = () => {
        setIsVisible(false);
    };

    // Use production URL for QR code
    const productionUrl = 'https://assalvoting.vercel.app/';
    // Generate QR code URL using a free QR code API (smaller size: 200x200)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productionUrl)}`;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
                >
                    <div className="relative bg-white rounded-xl shadow-2xl p-4 border-2 border-gradient-to-r from-red-600 to-green-600">
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg z-10"
                        >
                            <X size={16} />
                        </button>

                        {/* Animated Border */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 via-green-600 to-red-600 opacity-50 blur-sm animate-pulse"></div>

                        {/* Content */}
                        <div className="relative bg-white rounded-lg p-3">
                            {/* Header */}
                            <div className="text-center mb-3">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-600 to-green-600 rounded-full mb-2"
                                >
                                    <Smartphone className="w-5 h-5 text-white" />
                                </motion.div>
                                <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                                    Scan Me Now to Vote!
                                </h3>
                            </div>

                            {/* QR Code */}
                            <div className="bg-white p-2 rounded-lg">
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code to Vote"
                                    className="w-40 h-40 mx-auto"
                                />
                            </div>

                            {/* Timer */}
                            <div className="mt-3 text-center">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-green-50 px-3 py-1.5 rounded-full">
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-600">
                                        Auto-closing in {Math.ceil(displayDuration / 1000)}s
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
