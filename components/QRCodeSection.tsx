import { motion } from 'framer-motion';
import { Smartphone, QrCode } from 'lucide-react';

export function QRCodeSection() {
    // Production URL for QR code
    const productionUrl = 'https://assalvoting.vercel.app/';
    // Generate QR code URL (smaller size: 150x150)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(productionUrl)}`;

    return (
        <section className="py-12 px-4 bg-gradient-to-br from-white via-green-50 to-red-50">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200"
                >
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        {/* Left Side - Text */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <div className="bg-gradient-to-r from-red-600 to-green-600 p-2 rounded-full">
                                    <Smartphone className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                                    Vote from Your Phone
                                </h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                                Scan the QR code with your phone camera
                            </p>
                            <p className="text-gray-500 text-xs">
                                Quick and easy mobile voting
                            </p>
                        </div>

                        {/* Right Side - QR Code */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                {/* QR Code Container */}
                                <div className="bg-white p-3 rounded-xl border-2 border-gradient-to-r from-red-600 to-green-600 shadow-md">
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Code to Vote"
                                        className="w-32 h-32"
                                    />
                                </div>

                                {/* Badge */}
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-red-600 to-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                                    <QrCode size={12} />
                                    Scan Me
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
