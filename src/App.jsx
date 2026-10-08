import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import DemoModal from './components/DemoModal';
import { ArrowRight } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleOpenDemo = () => {
    setIsDemoOpen(true);
  };

  const handleCloseDemo = () => {
    setIsDemoOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] text-slate-900 selection:bg-brand-500 selection:text-white relative bg-grid-pattern">
      
      {/* Top Banner */}
      <aside aria-label="Announcement" className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800 text-center font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded bg-sky-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
            NEW
          </span>
          <span className="text-slate-300">
            TraceMint Proof Engine v1.0 is live. Claim your verified developer handle.
          </span>
          <button
            onClick={handleOpenDemo}
            className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-0.5 ml-1"
          >
            <span>Try Demo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Navigation */}
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenDemo={handleOpenDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage 
            onOpenDemo={handleOpenDemo}
            onNavigateHowItWorks={() => {
              setCurrentPage('how-it-works');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage 
            onOpenDemo={handleOpenDemo}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage 
            onOpenDemo={handleOpenDemo}
          />
        )}
      </main>

      {/* Interactive Demo Simulation Modal */}
      <DemoModal 
        isOpen={isDemoOpen}
        onClose={handleCloseDemo}
      />

      {/* Footer */}
      <Footer 
        setCurrentPage={setCurrentPage}
        onOpenDemo={handleOpenDemo}
      />
    </div>
  );
}
