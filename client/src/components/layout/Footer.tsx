import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-20">
      <div className="container-site py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <span className="text-xl font-serif font-bold">Maktoob</span>
              <span className="text-xl font-serif font-bold text-brand-yellow">.</span>
            </div>
            <p className="text-sm text-white/70">Independent journalism for critical times.</p>
          </div>

          <div>
            <h4 className="text-sm font-bold font-sans uppercase tracking-widest mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/" className="hover:text-brand-yellow transition-colors">
                  Latest
                </Link>
              </li>
              <li>
                <Link to="/category/investigation" className="hover:text-brand-yellow transition-colors">
                  Investigations
                </Link>
              </li>
              <li>
                <Link to="/category/analysis" className="hover:text-brand-yellow transition-colors">
                  Analysis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold font-sans uppercase tracking-widest mb-4">About</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#" className="hover:text-brand-yellow transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-yellow transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-yellow transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold font-sans uppercase tracking-widest mb-4">Newsletter</h4>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-brand-yellow"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-brand-yellow text-brand-navy hover:bg-white transition-colors"
              >
                <Mail size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} Maktoob Media. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
