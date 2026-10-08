import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Footer({ setCurrentPage, onOpenDemo }) {
  const handleNav = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('home')}>
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <span className="font-mono text-cyan-400 font-bold text-sm">₮</span>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">TraceMint</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-mono">
              Your work. Proven.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              The developer proof-of-work platform replacing static resumes with verifiable shipping records.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Proof Engine operational</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-slate-950 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('how-it-works')} className="hover:text-slate-950 transition-colors">
                  How Verification Works
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-slate-950 transition-colors">
                  Manifesto & About
                </button>
              </li>
              <li>
                <button onClick={onOpenDemo} className="hover:text-slate-950 transition-colors flex items-center gap-1 text-sky-700">
                  <span>Interactive Live Demo</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Ecosystem / Integrations */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono mb-3">
              Supported Sources
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 font-mono">
              <li>GitHub (Commits, PRs, Issues)</li>
              <li>GitLab & Bitbucket</li>
              <li>Vercel & Cloudflare Edge</li>
              <li>AWS & Docker Hub</li>
              <li>Devpost & ETHGlobal Hackathons</li>
            </ul>
          </div>

          {/* Connect / Contact */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono mb-3">
              Developer Network
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Mint your handle before early-builder slots close.
            </p>
            <button
              onClick={onOpenDemo}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors text-center"
            >
              Claim your handle →
            </button>
            
            <div className="pt-4 space-y-1.5 text-xs font-mono">
              <div className="text-slate-500">
                Web: <a href="https://tracemint.tech" className="text-slate-800 hover:text-slate-950 font-semibold underline underline-offset-2">tracemint.tech</a>
              </div>
              <div className="text-slate-500">
                Contact: <a href="mailto:contact@tracemint.tech" className="text-sky-700 hover:text-sky-900 underline underline-offset-2">contact@tracemint.tech</a>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 text-slate-400">
              <a href="https://github.com/Akifali-1/tracemint" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <GithubIcon className="w-4 h-4" />
              </a>
              <span className="text-xs font-mono text-slate-400">@tracemint_dev</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div>
            © 2026 TraceMint. Built for developers who ship.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Security Audits</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">ZKP Spec v1.0</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms & Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
