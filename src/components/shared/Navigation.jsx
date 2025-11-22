/**
 * Navigation Component
 * Top navigation bar with "Aplica" logo
 */
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl md:text-2xl font-bold text-white/95 hover:text-white transition-colors">
            Aplica
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/profile" className="text-white/70 hover:text-white/90 transition-colors text-sm font-medium">
              Profile
            </Link>
            <Link to="/matches" className="text-white/70 hover:text-white/90 transition-colors text-sm font-medium">
              Matches
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

