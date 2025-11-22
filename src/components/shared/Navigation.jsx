/**
 * Navigation Component
 * Top navigation bar with "Aplica" logo
 */
import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useSavedCollegesStore from '../../stores/savedCollegesStore';

export default function Navigation() {
  const location = useLocation();
  const { savedCollegeIds } = useSavedCollegesStore();
  
  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo-icon.png" 
              srcSet="/logo-icon-64x64.png 64w, /logo-icon-128x128.png 128w, /logo-icon-256x256.png 256w, /logo-icon.png 512w"
              sizes="(max-width: 768px) 32px, 36px"
              alt="Aplica" 
              className="h-8 md:h-9 w-8 md:w-9 transition-transform group-hover:scale-105"
            />
            <span className="text-xl md:text-2xl font-bold text-white/95 group-hover:text-white transition-colors">
              Aplica
            </span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <Link 
              to="/profile" 
              className={`text-white/70 hover:text-white/90 transition-colors text-sm font-medium ${
                location.pathname === '/profile' ? 'text-white' : ''
              }`}
            >
              Profile
            </Link>
            <Link 
              to="/results" 
              className={`text-white/70 hover:text-white/90 transition-colors text-sm font-medium ${
                location.pathname === '/results' ? 'text-white' : ''
              }`}
            >
              Matches
            </Link>
            <Link 
              to="/my-list" 
              className={`flex items-center gap-1.5 text-white/70 hover:text-white/90 transition-colors text-sm font-medium relative ${
                location.pathname === '/my-list' ? 'text-white' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${savedCollegeIds.length > 0 ? 'text-red-400 fill-red-400' : ''}`} />
              My List
              {savedCollegeIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {savedCollegeIds.length > 9 ? '9+' : savedCollegeIds.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

