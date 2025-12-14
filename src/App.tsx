import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Leadership } from '../components/Leadership';
import { FutureCandidates } from '../components/FutureCandidates';
import { VotingPositions } from '../components/VotingPositions';
import { LiveVoting } from '../components/LiveVoting';
import { QRCodeSection } from '../components/QRCodeSection';
import { HowItWorks } from '../components/HowItWorks';
import { Footer } from '../components/Footer';
import { ThemeToggle } from '../components/ThemeToggle';

export default function App() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <ThemeToggle />
            <Hero />
            <QRCodeSection />
            <LiveVoting />
            <VotingPositions />
            <About />
            <Leadership />
            <FutureCandidates />
            <HowItWorks />
            <Footer />
        </div>
    );
}
