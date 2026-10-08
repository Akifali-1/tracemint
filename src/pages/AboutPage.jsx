import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Hammer, 
  Eye, 
  ArrowRight, 
  Layers, 
  Check, 
  Code2,
  Lock
} from 'lucide-react';

export default function AboutPage({ onOpenDemo }) {
  const values = [
    {
      title: "Evidence over buzzwords",
      subtitle: "Claims are cheap. Code is unequivocal.",
      description: "We don't care if you have 'exceptional synergy' or know how to prompt an AI chatbot to write generic resume bullet points. We care about what commits you merged, what architectures you designed, and whether your systems stay alive under load.",
      icon: <Terminal className="w-5 h-5 text-sky-600" />
    },
    {
      title: "Built for makers",
      subtitle: "Engineered for engineers who ship.",
      description: "TraceMint wasn't built for human resource algorithms or keyword scrapers. It was built for founders, lead architects, and engineering managers who want to inspect authentic craftsmanship without digging through 50 dead GitHub forks.",
      icon: <Hammer className="w-5 h-5 text-amber-500" />
    },
    {
      title: "Open by default",
      subtitle: "Cryptographic proof, zero vendor lock-in.",
      description: "Your developer reputation belongs to you, not a corporate social network. All TraceMint proof hashes are independently verifiable, portable, and signed so you can take your reputation anywhere.",
      icon: <Eye className="w-5 h-5 text-emerald-600" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 space-y-12 sm:space-y-16">
      
      {/* Manifesto Header */}
      <div className="space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>The TraceMint Manifesto</span>
        </div>

        <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
          “Resumes describe what you say you can do. <br className="hidden sm:inline" />
          <span className="text-sky-700">TraceMint shows what you actually built.”</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed">
          The technology hiring market is fundamentally broken. Hundreds of applicants submit identical, keyword-optimized PDF resumes for single positions. Engineering leaders waste weeks conducting whiteboard syntax trivia, while brilliant builders who ship real production software get overlooked.
        </p>
      </div>

      {/* Philosophy Statement */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-12 border border-slate-800 space-y-5 sm:space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-4 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Our Thesis
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Proof of Work is the only honest credential.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            In software engineering, everything meaningful leaves an audit trail: git commit hashes, pull request reviews, container build stamps, package registries, and DNS routing tables.
          </p>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            TraceMint aggregates these fragmented signals into a single, beautiful developer dossier that can’t be hallucinated, falsified, or gamed.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>TraceMint Protocol • Est. 2024</div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Proof Attestation</span>
          </div>
        </div>
      </div>

      {/* Core Values / Cards */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-950">
            Our Core Principles
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            How we design the platform and evaluate developer credibility
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {values.map((v, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                {v.icon}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-base font-bold text-slate-900">{v.title}</h4>
                  <span className="text-xs font-mono text-slate-400">{v.subtitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {v.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder / Team Ethos Note */}
      <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
        <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-700">
          Why we're building TraceMint
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          We are engineers who grew tired of watching talented friends get rejected by automated resume scanners while people with exaggerated credentials landed roles. We built TraceMint to level the playing field so that builders who stay up late shipping projects, writing robust systems, and winning hackathons get the recognition and opportunities they deserve.
        </p>
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>— The TraceMint Founding Team</span>
          <span>San Francisco & Berlin</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4 space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">
          Join the Proof-of-Work Standard
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Start building your verifiable developer legacy today.
        </p>
        <button
          onClick={onOpenDemo}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <span>Claim your profile now</span>
          <ArrowRight className="w-4 h-4 text-cyan-300" />
        </button>
      </div>

    </div>
  );
}
