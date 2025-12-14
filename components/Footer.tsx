import { Heart } from 'lucide-react';

const logoImage = '/logos/main_logo.png';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImage} alt="ASSAL Logo" className="w-16 h-16 rounded" />
              <h3 className="text-2xl text-white">ASSAL Community</h3>
            </div>
            <p className="text-gray-400">
              Association of Somaliland Students at AIU
            </p>
            <p className="text-gray-400 mt-2">
              Trust each other, love each other, and engage each other.
            </p>
          </div>

          <div>
            <h4 className="text-lg mb-4 text-green-500">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('candidates')}
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Candidates
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('live-voting')}
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Live Voting
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg mb-4 text-red-500">Contact</h4>
            <p className="text-gray-400">
              For inquiries, please reach out to our community coordinators.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            © 2025 ASSAL Community. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for our Somaliland community at AIU.
          </p>
        </div>
      </div>
    </footer>
  );
}