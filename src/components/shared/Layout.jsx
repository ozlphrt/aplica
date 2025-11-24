/**
 * Layout Component
 * Main app layout with navigation
 */
import Navigation from './Navigation';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107, 114, 128, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(75, 85, 99, 0.1) 0%, transparent 50%)',
        }}></div>
      </div>
      
      <Navigation />
      <main className="container mx-auto px-0 sm:px-0.5 md:px-1 lg:px-2 py-4 sm:py-6 md:py-8 max-w-[100%] relative z-10">
        {children}
      </main>
    </div>
  );
}

