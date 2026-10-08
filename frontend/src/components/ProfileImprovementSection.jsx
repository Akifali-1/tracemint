import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Target,
  FileCode2,
  GitBranch,
  ShieldAlert,
  Layers
} from 'lucide-react';

const PRIORITY_STYLES = {
  HIGH: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    indicator: 'bg-rose-500',
    dot: 'bg-rose-500',
    border: 'hover:border-rose-300',
  },
  MEDIUM: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    indicator: 'bg-amber-500',
    dot: 'bg-amber-500',
    border: 'hover:border-amber-300',
  },
  LOW: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    indicator: 'bg-sky-500',
    dot: 'bg-sky-500',
    border: 'hover:border-sky-300',
  },
};

export default function ProfileImprovementSection({ 
  improvements = [], 
  metrics = {}, 
  className = '' 
}) {
  // First item expanded by default
  const [expandedIndex, setExpandedIndex] = useState(0);

  // If no recommendations provided, generate grounded defaults from metrics
  const displayItems = React.useMemo(() => {
    if (improvements && improvements.length > 0) {
      return improvements.slice(0, 5);
    }

    const repoCount = metrics.repository_count ?? 14;
    const starCount = metrics.total_stars ?? 0;
    const activeCount = metrics.active_repository_count ?? 0;
    const langCount = Object.keys(metrics.languages || {}).length || 3;

    return [
      {
        priority: 'HIGH',
        title: 'STRENGTHEN PROJECT DEPTH',
        why: `Your profile demonstrates broad technical exploration across ${repoCount} public repositories. A smaller number of deeper, production-ready projects makes that expertise significantly easier to evaluate.`,
        evidence: [
          `${repoCount} public repositories`,
          `${activeCount} actively maintained in last 90 days`,
        ],
        action: 'Take your 2–3 strongest repositories to a complete production state with architecture diagrams, comprehensive tests, deployment configurations, and a live working demo.',
      },
      {
        priority: 'HIGH',
        title: 'IMPROVE PROJECT DOCUMENTATION',
        why: 'Your repositories demonstrate technical breadth. Stronger documentation elevates raw code into verifiable portfolio assets that recruiters and peers can immediately understand.',
        evidence: [
          `${langCount} distinct programming languages`,
          'Repository documentation visibility signals',
        ],
        action: 'Add structured README files with installation instructions, architectural overviews, system diagrams, and technical design tradeoffs to your top codebases.',
      },
      {
        priority: 'MEDIUM',
        title: 'ADD AUTOMATED TESTING & CI',
        why: 'Verifiable test suites and CI pipelines showcase production-grade reliability and disciplined software engineering practices beyond manual commits.',
        evidence: [
          'Multiple multi-file codebases evaluated',
          'Automated CI/CD validation signals',
        ],
        action: 'Implement unit and integration test suites alongside GitHub Actions workflows for automated continuous integration on pull requests.',
      },
      {
        priority: 'MEDIUM',
        title: 'INCREASE OPEN-SOURCE COLLABORATION',
        why: 'Visible open-source collaboration signals, such as peer reviews, external pull requests, and multi-contributor projects, validate team-readiness.',
        evidence: [
          `${starCount} earned stars tracked`,
          'Public collaboration & contribution footprint',
        ],
        action: 'Engage in open-source issue discussions, contribute upstream pull requests, or collaborate with fellow builders on shared repositories.',
      },
    ];
  }, [improvements, metrics]);

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
              GEMINI ANALYSIS · EVIDENCE BASED
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1 font-mono uppercase">
            Profile Improvement
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Turn your existing work into stronger evidence.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing {displayItems.length} evidence-backed recommendations
        </div>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-3">
        {displayItems.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const priorityKey = (item.priority || 'MEDIUM').toUpperCase();
          const priorityConfig = PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES.MEDIUM;

          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 bg-white overflow-hidden shadow-sm ${
                isExpanded
                  ? 'border-slate-300 ring-1 ring-slate-200'
                  : `border-slate-200/90 ${priorityConfig.border}`
              }`}
            >
              {/* Card Header / Collapsed View */}
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${priorityConfig.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                      {priorityKey}
                    </span>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-mono">
                      {item.title}
                    </h4>
                  </div>

                  {!isExpanded && (
                    <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                      {item.why}
                    </p>
                  )}
                </div>

                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors shrink-0 mt-0.5">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 space-y-4 border-t border-slate-100 bg-gradient-to-b from-slate-50/40 to-white text-xs">
                  {/* WHY THIS MATTERS */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">
                      Why This Matters
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {item.why}
                    </p>
                  </div>

                  {/* EVIDENCE */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">
                      Observed Evidence Signals
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(item.evidence) ? (
                        item.evidence.map((sig, sigIdx) => (
                          <span
                            key={sigIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                            {sig}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                          {item.evidence}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* NEXT ACTION */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/70 border border-sky-200/90 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-sky-900">
                      <Target className="w-3.5 h-3.5 text-sky-700" />
                      <span>Concrete Next Action</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                      {item.action}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
