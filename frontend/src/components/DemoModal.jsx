import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ArrowRight, Terminal, ShieldCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { GithubIcon } from './Icons';
import { sampleProfiles } from '../data/mockData';
import ProfilePreviewCard from './ProfilePreviewCard';
import { api } from '../services/api';

export default function DemoModal({ isOpen, onClose, user, onUserUpdated, initialTab = 'live' }) {
  const [modalTab, setModalTab] = useState(initialTab); // 'live' | 'demo'
  const [handle, setHandle] = useState('alexrivera');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeProfileIdx, setActiveProfileIdx] = useState(0);

  // Live profile states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [realProfile, setRealProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      // If user is already authenticated with GitHub, check if they already have a profile
      if (user?.has_github) {
        api.getMyProfile()
          .then((prof) => {
            if (prof) setRealProfile(prof);
          })
          .catch(() => {
            // Profile not created yet
          });
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSimulateSync = (e) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  const selectPreset = (idx, name) => {
    setActiveProfileIdx(idx);
    setHandle(name);
    setAnalyzed(true);
  };

  const handleGoogleLogin = () => {
    window.location.href = api.getGoogleLoginUrl();
  };

  const handleConnectGitHub = () => {
    window.location.href = api.getGitHubConnectUrl();
  };

  const handleGenerateRealProfile = async (forceRefresh = true) => {
    setIsGenerating(true);
    setErrorMessage('');
    setGenerationStep('Syncing public repositories from GitHub API...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setGenerationStep('Computing deterministic metrics and language frequencies...');
      await new Promise(r => setTimeout(r, 600));
      setGenerationStep('Interpreting evidence with Google Gemini 3.1 Flash Lite...');

      const profile = await api.generateProfile(forceRefresh);
      setRealProfile(profile);
      setGenerationStep('');
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      setErrorMessage(err.message || 'Profile generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs sm:text-sm shrink-0">
              ₮
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">TraceMint Proof Platform</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Google OAuth • GitHub Evidence • Deterministic Metrics • Gemini 3.1</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Live Pipeline vs Interactive Demo */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-4 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setModalTab('live')}
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all border-t border-x ${
              modalTab === 'live'
                ? 'bg-white text-slate-950 border-slate-200 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Real Profile Generator
          </button>
          <button
            onClick={() => setModalTab('demo')}
            className={`px-4 py-2 rounded-t-lg font-semibold transition-all border-t border-x ${
              modalTab === 'demo'
                ? 'bg-white text-slate-950 border-slate-200 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Interactive Demo (Sample Data)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {modalTab === 'live' ? (
            <div className="space-y-5">
              {/* Error banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Notice: </span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Step Flow Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                  Authentication & Evidence Pipeline
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Step 1: Google */}
                  <div className={`p-3.5 rounded-lg border transition-all ${
                    user 
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-500">STEP 1</span>
                      {user && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="font-semibold text-slate-900">Google Identity</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {user ? `Signed in as ${user.name}` : 'Identifies user account'}
                    </p>
                    {!user && (
                      <button
                        onClick={handleGoogleLogin}
                        className="mt-2.5 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Continue with Google</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Step 2: GitHub */}
                  <div className={`p-3.5 rounded-lg border transition-all ${
                    user?.has_github
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-500">STEP 2</span>
                      {user?.has_github && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="font-semibold text-slate-900">GitHub Evidence</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {user?.has_github ? `@${user.github_username} connected` : 'Read-only public repository source'}
                    </p>
                    {user && !user.has_github && (
                      <button
                        onClick={handleConnectGitHub}
                        className="mt-2.5 w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Connect GitHub</span>
                      </button>
                    )}
                  </div>

                  {/* Step 3: Analysis & Generation */}
                  <div className={`p-3.5 rounded-lg border transition-all ${
                    realProfile
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-500">STEP 3</span>
                      {realProfile && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="font-semibold text-slate-900">Gemini Interpretation</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {realProfile ? 'Structured profile ready' : 'Deterministic metrics + AI synthesis'}
                    </p>
                    {user?.has_github && (
                      <button
                        onClick={() => handleGenerateRealProfile(true)}
                        disabled={isGenerating}
                        className="mt-2.5 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                        ) : (
                          <RefreshCw className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>{realProfile ? 'Refresh Profile' : 'Generate Profile'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress indicator during AI generation */}
              {isGenerating && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-sky-50 text-sky-600 mb-1">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{generationStep}</p>
                  <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-500">
                    <span>Deterministic analysis</span>
                    <span>•</span>
                    <span>gemini-3.1-flash-lite</span>
                    <span>•</span>
                    <span>Pydantic validation</span>
                  </div>
                </div>
              )}

              {/* Real profile rendered */}
              {!isGenerating && realProfile && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
                      Your Verified Profile
                    </div>
                    <a
                      href={`https://tracemint.tech/@${realProfile.username_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-700 hover:underline font-mono font-medium flex items-center gap-1"
                    >
                      <span>Public Link: tracemint.tech/@{realProfile.username_slug}</span>
                    </a>
                  </div>
                  <ProfilePreviewCard realProfile={realProfile} />
                </div>
              )}
            </div>
          ) : (
            /* Interactive Demo Tab */
            <div className="space-y-5">
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-mono">
                <strong>Sample developer profile — demonstration data:</strong> Inspect the format of verified developer profiles generated by TraceMint using sample developer profiles.
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                  Select sample developer profile:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => selectPreset(0, 'alexrivera')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      activeProfileIdx === 0 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Alex Rivera (Systems Engineer • Sample)
                  </button>
                  <button
                    onClick={() => selectPreset(1, 'erostova')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      activeProfileIdx === 1 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Elena Rostova (Compiler/Rust Dev • Sample)
                  </button>
                </div>
              </div>

              <div>
                <ProfilePreviewCard profileIndex={activeProfileIdx} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>TraceMint — Your work. Proven. Open-source platform.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
