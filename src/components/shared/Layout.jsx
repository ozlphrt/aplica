/**
 * Layout Component
 * Main app layout with navigation
 */
import Navigation from './Navigation';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        }}></div>
      </div>
      
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {children}
      </main>
    </div>
  );
}

