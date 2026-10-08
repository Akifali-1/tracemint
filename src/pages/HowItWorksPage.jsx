import React, { useState } from 'react';
import { 
  GitBranch, 
  Search, 
  Share2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  Terminal, 
  Layers, 
  Globe, 
  Database,
  Sparkles
} from 'lucide-react';

export default function HowItWorksPage({ onOpenDemo }) {
  const [selectedStep, setSelectedStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: "Connect your work",
      shortDesc: "Authenticate your developer footprint across code hosts and platforms.",
      fullDesc: "Authorize read-only access to your GitHub, GitLab, Docker Hub, and Vercel accounts in one click. TraceMint never asks for write permissions and never stores your proprietary code lines—only cryptographic proofs of authorship, hashes, and public releases.",
      items: [
        "GitHub commits, merged pull requests & code review activity",
        "Vercel, Cloudflare, Fly.io, and AWS active deployment endpoints",
        "ETHGlobal, Devpost, and Major League Hacking podium verifications",
        "Open source maintainer roles and tagged release signatures"
      ],
      terminalPreview: {
        command: "tracemint connect --github @alexrivera --vercel --devpost",
        output: [
          "✔ Authenticating OAuth2 read-only scopes...",
          "✔ Found 42 repositories (14 public, 28 private)",
          "✔ Discovered 4 live deployments on Vercel Edge",
          "✔ Synced 4 hackathon trophies from Devpost API",
          "✔ Ready for trace calculation."
        ]
      }
    },
    {
      num: 2,
      title: "Trace your activity",
      shortDesc: "Deterministic indexing verifies code authorship and strips away false noise.",
      fullDesc: "TraceMint’s engine scans raw git trees to differentiate between cosmetic commits and substantial architectural contributions. It benchmarks test coverage velocity, PR turnaround times, and code complexity to calculate your Proof Score.",
      items: [
        "Eliminates bot commits, automated dependency bumps, and trivial forks",
        "Calculates code churn, language distribution, and commit regularity",
        "Benchmarks your ship velocity against 85,000+ indexed software engineers",
        "Signs verification attestations via Zero-Knowledge proofs"
      ],
      terminalPreview: {
        command: "tracemint engine:compute-proof-score --deep-scan",
        output: [
          "⚡ Parsing 3,842 commit trees across 4 years...",
          "⚡ Filtering bot noise (Dependabot, Renovate excluded)...",
          "⚡ Computing language density: 96% TypeScript, 88% Rust...",
          "⚡ Production health check: 99.99% uptime verified on 3 domains",
          "✔ Proof Score calculated: 98.4 / 100 (Top 1.2% percentile)"
        ]
      }
    },
    {
      num: 3,
      title: "Share your proof",
      shortDesc: "A permanent, tamper-resistant developer dossier for founders, recruiters, and peers.",
      fullDesc: "Instead of sending stale PDFs or unvetted LinkedIn profiles, share your clean tracemint.dev link. Recruiter-friendly executive summaries sit alongside deep technical proofs for engineering managers.",
      items: [
        "Permanent customizable URL: tracemint.dev/yourhandle",
        "Interactive proof cards embeddable in GitHub READMEs",
        "Recruiter audit view with one-click verification badges",
        "Exportable verifiable JSON credential for Web3 & DAO grants"
      ],
      terminalPreview: {
        command: "tracemint publish --handle alexrivera.mint",
        output: [
          "🚀 Generating cryptographic certificate...",
          "✔ Hash: 0x9c3f84e1b82a0d927163efc81467",
          "✔ Live at: https://tracemint.dev/alexrivera.mint",
          "✔ Embed badge copied to clipboard: [![TraceMint Proof]...]",
          "✔ Profile ready to share with teams."
        ]
      }
    }
  ];

  const current = steps.find(s => s.num === selectedStep) || steps[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-xs font-mono text-sky-800">
          <Cpu className="w-3.5 h-3.5" />
          <span>Architecture & Verification Pipeline</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
          How TraceMint Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          From commit hash to verified credential in three deterministic steps. No fluff, no self-written essays, pure ground-truth engineering data.
        </p>
      </div>

      {/* 3 Step Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => {
          const isSelected = selectedStep === step.num;
          return (
            <div
              key={step.num}
              onClick={() => setSelectedStep(step.num)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-800 shadow-lg scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                  isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  0{step.num}
                </span>
                <span className={`text-[11px] font-mono uppercase tracking-wider ${
                  isSelected ? 'text-cyan-300' : 'text-slate-400'
                }`}>
                  Step {step.num} of 3
                </span>
              </div>
              <h3 className={`text-lg font-bold mb-1.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {step.shortDesc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Deep Dive on the Selected Step */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Step description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-semibold">
              <span className="text-cyan-600 font-bold">STAGE 0{current.num}</span>
              <span>•</span>
              <span>{current.title}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {current.title}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {current.fullDesc}
            </p>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono font-semibold uppercase text-slate-500 tracking-wider">
                What we inspect:
              </div>
              <ul className="space-y-2">
                {current.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Try this step in Demo</span>
                <ArrowRight className="w-4 h-4 text-cyan-300" />
              </button>
            </div>
          </div>

          {/* Interactive Visual Mockup / Terminal Preview */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
              
              {/* Terminal Window chrome */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 text-[11px] text-slate-300">tracemint-agent --cli</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>v1.0 verified</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-5 space-y-3 text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="text-slate-600">$</span>
                  <span className="font-semibold">{current.terminalPreview.command}</span>
                </div>
                
                <div className="pt-2 space-y-1.5 border-t border-slate-800/80 text-xs">
                  {current.terminalPreview.output.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={line.includes('✔') ? 'text-emerald-400' : line.includes('⚡') ? 'text-sky-300' : line.includes('🚀') ? 'text-amber-300 font-bold' : 'text-slate-300'}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Cryptographic Proof Status</span>
                  <span className="text-emerald-400 font-semibold">100% Deterministic</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Visual Timeline Section */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-950">
            The Continuous Proof Lifecycle
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-mono">
            How your dossier updates automatically as you push code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">You Push Code</h4>
            <p className="text-xs text-slate-500">
              Commit merged into main or release branch on GitHub.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">Webhook Trigger</h4>
            <p className="text-xs text-slate-500">
              TraceMint daemon ingests commit SHA, file diffs, and authorship sigs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">Score Recalculation</h4>
            <p className="text-xs text-slate-500">
              Proof engine weighs complexity, consistency, and deploy health.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h4 className="text-sm font-bold text-slate-900">Profile Updated</h4>
            <p className="text-xs text-slate-500">
              Live link displays fresh proofs with zero manual updates required.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900">
          Ready to turn your commits into credibility?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          TraceMint takes under 60 seconds to set up. Free for individual software builders forever.
        </p>
        <button
          onClick={onOpenDemo}
          className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          View live profile demo
        </button>
      </div>

    </div>
  );
}
