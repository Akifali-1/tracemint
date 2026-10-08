import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  GitBranch, 
  Terminal, 
  CheckCircle2, 
  Code2, 
  Zap, 
  Layers, 
  ExternalLink,
  Flame,
  Award,
  Lock,
  ChevronRight
} from 'lucide-react';
import ProfilePreviewCard from '../components/ProfilePreviewCard';

export default function HomePage({ onOpenDemo, onNavigateHowItWorks }) {
  const [handleInput, setHandleInput] = useState('');
  const [previewProfileIdx, setPreviewProfileIdx] = useState(0);

  const handleClaim = (e) => {
    e.preventDefault();
    onOpenDemo();
  };

  return (
    <div className="space-y-20 sm:space-y-32 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-100/60 to-cyan-100/40 blur-3xl -z-10 pointer-events-none rounded-full" />
        
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-subtle text-xs font-mono text-slate-800">
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>Built for developers who ship.</span>
            <span className="text-slate-300">|</span>
            <span className="text-sky-600 font-semibold flex items-center gap-0.5">
              Proof-of-Work Platform
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 font-sans leading-[1.08]">
            Your work. <br />
            <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-sky-700 bg-clip-text text-transparent">
              Proven.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            TraceMint turns your real developer activity—commits, merged PRs, production deployments, and hackathon podiums—into a living, tamper-proof proof-of-work profile.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-slate-950 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md group"
            >
              <span>Create your profile</span>
              <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onNavigateHowItWorks}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-subtle"
            >
              <span>See how it works</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero manual resume updates
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Cryptographic commit verification
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Syncs in &lt; 30 seconds
            </span>
          </div>
        </div>

        {/* HERO DASHBOARD / PROFILE PREVIEW */}
        <div className="mt-10 sm:mt-16 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 mb-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                Preview:
              </span>
              <button 
                onClick={() => setPreviewProfileIdx(0)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all ${
                  previewProfileIdx === 0 ? 'bg-slate-900 text-white font-semibold shadow-sm' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Alex (Full-Stack)
              </button>
              <button 
                onClick={() => setPreviewProfileIdx(1)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all ${
                  previewProfileIdx === 1 ? 'bg-slate-900 text-white font-semibold shadow-sm' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Elena (Systems / Rust)
              </button>
            </div>
            <button
              onClick={onOpenDemo}
              className="text-xs font-mono font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Test Live Simulator</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          
          <ProfilePreviewCard profileIndex={previewProfileIdx} />
        </div>
      </section>

      {/* WHY TRACEMINT: THE RESUME IS BROKEN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              The Reality
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Resumes are fiction. Your git logs don’t lie.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Anyone can put “Senior Distributed Systems Architect” on LinkedIn or generate an AI-tailored resume. But you can’t fake 1,200 merged commits, sub-millisecond production services, and hackathon podium finishes. TraceMint indexes ground-truth evidence directly from your repositories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-mono font-bold mb-4">
                ✕
              </div>
              <h3 className="text-base font-bold text-white mb-2">Paper Resume Fluff</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vague bullet points like “spearheaded initiatives” and “collaborated cross-functionally”. No real code, no verification, no way to verify claims.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold mb-4">
                △
              </div>
              <h3 className="text-base font-bold text-white mb-2">Raw GitHub Clutter</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toy repos from 2019 mixed with real open-source work. Forked repos pollute contribution graphs without showing what you specifically authored.
              </p>
            </div>

            <div className="bg-slate-800/90 p-6 rounded-2xl border border-cyan-500/40 relative">
              <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold uppercase">
                The Standard
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold mb-4">
                ₮
              </div>
              <h3 className="text-base font-bold text-white mb-2">TraceMint Dossier</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deterministic indexing of merged code, active production URLs, verified hackathon submissions, and calculated proof score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CORE FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs uppercase font-mono tracking-wider text-sky-700 font-semibold">
            Features Built For Builders
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Engineered for credibility.
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            No fluff. Every metric on TraceMint corresponds to verified code hashes and live endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Proof, not claims */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Proof, not claims
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Connect your GitHub, GitLab, or personal repos. TraceMint computes commit authenticity and verifies you actually authored and merged the code.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs font-mono space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between text-slate-800 font-semibold">
                <span>Verification Check</span>
                <span className="text-emerald-600 text-[11px]">PASSED</span>
              </div>
              <div className="text-[11px] text-slate-500">GPG Signed: Key #0xFA8291</div>
              <div className="text-[11px] text-slate-500">Ownership: 94.2% code in repo</div>
            </div>
          </div>

          {/* Card 2: Everything in one timeline */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Everything in one timeline
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Your commits, hackathon prizes from ETHGlobal/Devpost, side projects, and open-source contributions unified in a single chronological stream.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs font-mono space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>2024: ETHGlobal Grand Prize</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>2024: Shipped HyperQueue v1.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>2023: 3,400+ merged contributions</span>
              </div>
            </div>
          </div>

          {/* Card 3: Show what you actually shipped */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Show what you shipped
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Link live production domains and edge deployments. TraceMint queries ping latency, uptime, and GitHub releases to prove your software is real.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs font-mono space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span>api.vaultstream.app</span>
                <span className="text-emerald-700 font-semibold">Live 18ms</span>
              </div>
              <div className="text-[11px] text-slate-500">Docker Hub: 14k pulls</div>
              <div className="text-[11px] text-slate-500">Provider: AWS ECS (Verified)</div>
            </div>
          </div>

        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How TraceMint compares
          </h3>
          <p className="text-sm text-slate-500 font-mono">
            Traditional Resume vs. Raw GitHub vs. TraceMint
          </p>
        </div>

        <div className="sm:hidden text-center text-[11px] text-slate-400 font-mono mb-2">
          ← Swipe table horizontally to compare →
        </div>

        <div className="overflow-x-auto no-scrollbar bg-white rounded-2xl border border-slate-200 shadow-card">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-mono text-[11px]">
                <th className="py-3.5 px-4 sm:px-6 font-semibold">Capability</th>
                <th className="py-3.5 px-4 font-semibold text-slate-500">Traditional PDF</th>
                <th className="py-3.5 px-4 font-semibold text-slate-500">GitHub Profile</th>
                <th className="py-3.5 px-4 sm:px-6 font-bold text-sky-700 bg-sky-50/60">TraceMint Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">Code Authenticity Proof</td>
                <td className="py-3.5 px-4 text-red-500">None (self-reported)</td>
                <td className="py-3.5 px-4 text-amber-600">Unfiltered commits</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-emerald-700 bg-sky-50/20">Cryptographically Signed</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">Live Deployments & Uptime</td>
                <td className="py-3.5 px-4 text-red-500">Static links (often dead)</td>
                <td className="py-3.5 px-4 text-slate-400">None</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-emerald-700 bg-sky-50/20">Live Uptime & Latency Check</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">Hackathon Verification</td>
                <td className="py-3.5 px-4 text-slate-500">Text bullet point</td>
                <td className="py-3.5 px-4 text-slate-400">Readme badge only</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-emerald-700 bg-sky-50/20">Devpost / ETHGlobal Sync</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">Credibility Metric</td>
                <td className="py-3.5 px-4 text-red-500">Keyword counts</td>
                <td className="py-3.5 px-4 text-slate-400">Star count (gamified)</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-emerald-700 bg-sky-50/20">0-100 Algorithmic Proof Score</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">Recruiter / Client Share Link</td>
                <td className="py-3.5 px-4 text-slate-500">Static PDF attachment</td>
                <td className="py-3.5 px-4 text-slate-500">Messy repository list</td>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-emerald-700 bg-sky-50/20">tracemint.tech/yourhandle</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-slate-800/80 text-cyan-400 mb-1 border border-slate-700">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Stop writing resumes. <br />
            Start proving your work.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Claim your TraceMint handle today. Connect your GitHub in 30 seconds and generate your proof-of-work link before the next sprint.
          </p>

          <form onSubmit={handleClaim} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-mono text-xs text-slate-400 pointer-events-none">
                tracemint.tech/
              </span>
              <input
                type="text"
                placeholder="yourhandle"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                className="w-full pl-32 pr-3 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm shrink-0"
            >
              Claim Handle
            </button>
          </form>

          <div className="text-xs text-slate-400 font-mono pt-1">
            Free during early beta • No credit card required
          </div>
        </div>
      </section>

    </div>
  );
}
