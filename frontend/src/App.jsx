import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import DemoModal from './components/DemoModal';
import ProfilePreviewCard from './components/ProfilePreviewCard';
import { ArrowRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoModalTab, setDemoModalTab] = useState('live');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [publicProfile, setPublicProfile] = useState(null);
  const [loadingPublicProfile, setLoadingPublicProfile] = useState(false);

  // Check auth and process OAuth callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const authStatus = params.get('auth');
    const githubStatus = params.get('github');
    const err = params.get('error');

    if (token) {
      localStorage.setItem('tracemint_session_token', token);
    }

    if (err) {
      setAuthError(`Authentication note: ${err.replace(/_/g, ' ')}`);
    }

    // Clean URL query parameters cleanly
    if (token || authStatus || githubStatus || err) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Load authenticated user
    loadCurrentUser().then((loadedUser) => {
      if (githubStatus === 'connected' || (authStatus === 'success' && loadedUser)) {
        setDemoModalTab('live');
        setIsDemoOpen(true);
      }
    });

    // Handle public handle route: e.g. /@akifali or /alexrivera
    const path = window.location.pathname.replace(/^\/+/, '');
    if (path && !['how-it-works', 'about', ''].includes(path)) {
      const handleName = path.replace(/^@/, '');
      setLoadingPublicProfile(true);
      api.getPublicProfile(handleName)
        .then((profile) => {
          setPublicProfile(profile);
          setCurrentPage('public-profile');
        })
        .catch(() => {
          // If not found, stay on home
          setPublicProfile(null);
        })
        .finally(() => {
          setLoadingPublicProfile(false);
        });
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await api.getMe();
      if (res?.authenticated && res.user) {
        setUser(res.user);
        return res.user;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    }
  };

  const handleOpenDemo = (tab = 'demo') => {
    setDemoModalTab(tab);
    setIsDemoOpen(true);
  };

  const handleCloseDemo = () => {
    setIsDemoOpen(false);
  };

  const handleLogin = () => {
    window.location.href = api.getGoogleLoginUrl();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
  };

  const handleOpenMyProfile = () => {
    setDemoModalTab('live');
    setIsDemoOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] text-slate-900 selection:bg-brand-500 selection:text-white relative bg-grid-pattern">
      
      {/* Top Banner */}
      <aside aria-label="Announcement" className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800 text-center font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded bg-sky-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
            OPEN SOURCE
          </span>
          <span className="text-slate-300">
            TraceMint Proof Engine is live. Claim your verified developer dossier.
          </span>
          <button
            onClick={() => handleOpenDemo(user ? 'live' : 'demo')}
            className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-0.5 ml-1"
          >
            <span>{user ? 'My Profile' : 'Try Demo'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Global Notice if OAuth error occurred */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs flex items-center justify-between font-mono">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{authError}</span>
          </div>
          <button onClick={() => setAuthError('')} className="text-amber-700 hover:text-amber-900">✕</button>
        </div>
      )}

      {/* Navigation */}
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          setPublicProfile(null);
        }}
        onOpenDemo={() => handleOpenDemo('demo')}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenMyProfile={handleOpenMyProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loadingPublicProfile && (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-600 mb-3" />
            <p className="text-sm font-mono text-slate-600">Loading verified developer profile...</p>
          </div>
        )}

        {!loadingPublicProfile && currentPage === 'public-profile' && publicProfile && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
            <button
              onClick={() => {
                setCurrentPage('home');
                setPublicProfile(null);
                window.history.pushState({}, '', '/');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to TraceMint</span>
            </button>
            <ProfilePreviewCard realProfile={publicProfile} />
          </div>
        )}

        {!loadingPublicProfile && currentPage === 'home' && (
          <HomePage 
            onOpenDemo={() => handleOpenDemo(user ? 'live' : 'demo')}
            onNavigateHowItWorks={() => {
              setCurrentPage('how-it-works');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {!loadingPublicProfile && currentPage === 'how-it-works' && (
          <HowItWorksPage 
            onOpenDemo={() => handleOpenDemo(user ? 'live' : 'demo')}
          />
        )}

        {!loadingPublicProfile && currentPage === 'about' && (
          <AboutPage 
            onOpenDemo={() => handleOpenDemo(user ? 'live' : 'demo')}
          />
        )}
      </main>

      {/* Interactive Demo / Real Profile Generation Modal */}
      <DemoModal 
        isOpen={isDemoOpen}
        onClose={handleCloseDemo}
        user={user}
        onUserUpdated={loadCurrentUser}
        initialTab={demoModalTab}
      />

      {/* Footer */}
      <Footer 
        setCurrentPage={(page) => {
          setCurrentPage(page);
          setPublicProfile(null);
        }}
        onOpenDemo={() => handleOpenDemo('demo')}
      />
    </div>
  );
}
