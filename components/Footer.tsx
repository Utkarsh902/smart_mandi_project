import { Link } from 'react-router-dom';
import { Sprout, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
              <Sprout className="w-6 h-6 text-green-500" />
              <span className="font-bold text-xl">Smart Mandi</span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400">
              A platform that connects farmers directly with buyers, removing middlemen and increasing profits.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Important Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-green-500 transition-colors">Home</Link></li>
              <li><Link to="/market" className="hover:text-green-500 transition-colors">Marketplace</Link></li>
              <li><Link to="/dashboard" className="hover:text-green-500 transition-colors">Dashboard</Link></li>
              <li><Link to="/chat" className="hover:text-green-500 transition-colors">Chats</Link></li>
              <li><a href="mailto:devninja886@gmail.com" className="hover:text-green-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Government Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Government Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">Agmarknet</a></li>
              <li><a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">Data.gov.in</a></li>
              <li><a href="https://enam.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">e-NAM</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-green-500" />
              <a href="mailto:devninja886@gmail.com" className="hover:text-green-500 transition-colors">
                devninja886@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
          <p>© 2026 Smart Mandi. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-green-500 fill-green-500" /> by <span className="text-stone-300 font-medium">Utkarsh</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
