import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Terminal, ShieldCheck, Loader2 } from 'lucide-react';
import { GithubIcon } from './Icons';
import { sampleProfiles } from '../data/mockData';
import ProfilePreviewCard from './ProfilePreviewCard';

export default function DemoModal({ isOpen, onClose }) {
  const [handle, setHandle] = useState('alexrivera');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeProfileIdx, setActiveProfileIdx] = useState(0);

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
              <h3 className="text-sm sm:text-base font-bold text-slate-900">TraceMint Profile Simulator</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Live test: generate your verified proof of work dossier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Quick preset switch */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              Test with verified builder demo data:
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
                Alex Rivera (Systems Engineer • 98.4 Proof)
              </button>
              <button
                onClick={() => selectPreset(1, 'erostova')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeProfileIdx === 1 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Elena Rostova (Compiler/Rust Dev • 97.1 Proof)
              </button>
            </div>
          </div>

          {/* GitHub handle simulator input */}
          <form onSubmit={handleSimulateSync} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <GithubIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter GitHub handle (e.g. your-username)"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-950 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70 shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Synthesizing Proof...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Generate Proof Dossier</span>
                </>
              )}
            </button>
          </form>

          {isAnalyzing && (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-sky-50 text-sky-600 mb-1">
                <Terminal className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Validating Merged Commits & Cryptographic Proofs</p>
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-500">
                <span>[1/3] Parsing GitHub PR hashes</span>
                <span>•</span>
                <span>[2/3] Verifying deploy webhooks</span>
                <span>•</span>
                <span>[3/3] Scoring velocity</span>
              </div>
            </div>
          )}

          {/* Render Profile Component */}
          {!isAnalyzing && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
                  Verified Result Preview
                </div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Knowledge Authenticated</span>
                </div>
              </div>
              <ProfilePreviewCard profileIndex={activeProfileIdx} />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Ready to mint your permanent developer handle?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert('Welcome to TraceMint Beta! Early access handle claimed: ' + handle + '.mint');
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Claim @{handle}.mint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
