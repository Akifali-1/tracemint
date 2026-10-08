import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GitBranch, 
  GitCommit, 
  ExternalLink, 
  Trophy, 
  Server, 
  Flame, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Star,
  Copy,
  Check
} from 'lucide-react';
import { sampleProfiles, mockHeatmapWeeks } from '../data/mockData';

export default function ProfilePreviewCard({ profileIndex = 0 }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const profile = sampleProfiles[profileIndex] || sampleProfiles[0];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://tracemint.dev/${profile.handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden transition-all duration-300 hover:shadow-float">
      {/* Top status bar simulating developer profile header */}
      <div className="bg-slate-900 text-slate-100 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">tracemint.dev/</span>
            <span className="text-cyan-400 font-semibold">{profile.handle}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
            PROVEN BUILDER
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>ZKP Cryptographically Signed</span>
          </div>
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
            title="Copy Proof URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="text-[11px] font-mono">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Profile Bio & Proof Score Banner */}
      <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
              />
              <div className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-1 rounded-full shadow" title="Verified by TraceMint Engine">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{profile.name}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Work
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium">{profile.role}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-mono">
                <span>📍 {profile.location}</span>
                <span>•</span>
                <span className="text-sky-700 font-medium">14 Verified Repos</span>
              </div>
            </div>
          </div>

          {/* Proof Score Card */}
          <div className="w-full sm:w-auto bg-slate-900 text-white rounded-xl p-3.5 sm:px-5 sm:py-3.5 border border-slate-800 shadow-sm flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Proof Score</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">{profile.proofScore}</span>
                <span className="text-xs text-cyan-400 font-mono font-medium">/ 100</span>
              </div>
            </div>
            <div className="h-9 w-[1px] bg-slate-800"></div>
            <div className="text-right sm:text-left">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Percentile</div>
              <div className="text-sm font-semibold text-emerald-400 font-mono">{profile.percentile}</div>
              <div className="text-[10px] text-slate-400">Ship Velocity</div>
            </div>
          </div>
        </div>

        {/* Micro Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mt-6">
          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-mono">Verified Commits</div>
            <div className="text-base font-bold text-slate-900 font-mono">{profile.stats.commits}</div>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-mono">PRs Merged</div>
            <div className="text-base font-bold text-slate-900 font-mono">{profile.stats.prMerged}</div>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-mono">Projects Shipped</div>
            <div className="text-base font-bold text-slate-900 font-mono">{profile.stats.projectsShipped}</div>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-mono">Deployments</div>
            <div className="text-base font-bold text-slate-900 font-mono">{profile.stats.deployments}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
            <div className="text-[11px] text-sky-800 font-mono flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>Hackathons</span>
            </div>
            <div className="text-base font-bold text-sky-950 font-mono">{profile.stats.hackathonWins} Podiums</div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/40 px-4 sm:px-6 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity & Commits
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'projects'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Shipped Projects ({profile.projects.length})
        </button>
        <button
          onClick={() => setActiveTab('hackathons')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'hackathons'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hackathon Podiums ({profile.hackathons.length})
        </button>
        <button
          onClick={() => setActiveTab('deployments')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'deployments'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Deployments ({profile.deployments.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* GitHub Contributions Heatmap Preview */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>GitHub Contribution Timeline (Indexed & Authenticated)</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span>
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-200"></span>
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-400"></span>
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-600"></span>
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto pb-1">
                <div className="flex gap-1 min-w-[500px]">
                  {mockHeatmapWeeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-1">
                      {week.map((level, dIndex) => {
                        const bgColors = [
                          'bg-slate-200/80',
                          'bg-sky-200',
                          'bg-sky-400',
                          'bg-sky-600',
                          'bg-slate-900'
                        ];
                        return (
                          <div
                            key={dIndex}
                            className={`w-3 h-3 rounded-[2px] ${bgColors[level]} transition-transform hover:scale-125 cursor-pointer`}
                            title={`Activity level: ${level}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                <span>Total 3,842 contributions across 14 public & private synced repos</span>
                <span className="text-emerald-700 font-semibold">100% Hash Matched</span>
              </div>
            </div>

            {/* Skills Verified by Code Commits */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 font-mono">
                Code-Verified Skills
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.skills.map((skill, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">{skill.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{skill.verifiedCount}</div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-slate-800">{skill.percentage}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-slate-900 rounded-full" 
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Live Activity Feed */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 font-mono flex items-center justify-between">
                <span>Recent Verified Milestones</span>
                <span className="text-sky-600 font-normal">Real-time sync</span>
              </h4>
              <div className="space-y-2">
                {profile.recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 border border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        {act.type === 'pr_merge' && <GitBranch className="w-3.5 h-3.5 text-purple-600" />}
                        {act.type === 'deploy' && <Server className="w-3.5 h-3.5 text-emerald-600" />}
                        {act.type === 'hackathon' && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                        {act.type === 'release' && <Sparkles className="w-3.5 h-3.5 text-sky-600" />}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{act.text}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          repo: <span className="text-slate-700">{act.repo}</span> • hash: <span className="text-sky-700">{act.hash}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono shrink-0 pl-2">
                      {act.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 gap-3.5">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      {proj.stars}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                      {proj.commits}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-sky-700">
                    <span className="flex items-center gap-1 hover:underline cursor-pointer">
                      <span>{proj.verifiedUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hackathons' && (
          <div className="space-y-3">
            {profile.hackathons.map((h, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/20 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100/70 text-amber-700">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{h.name}</div>
                    <div className="text-xs font-semibold text-amber-700 mt-0.5">{h.prize}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">Project: {h.project} • {h.year}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-mono border border-slate-200">
                  Devpost Verified
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="space-y-3">
            {profile.deployments.map((dep, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <div>
                    <div className="text-xs font-bold font-mono text-slate-900">{dep.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{dep.provider} • Latency {dep.latency}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {dep.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">{dep.lastDeploy}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer proof card bar */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Immutable Trace Hash: <span className="font-mono text-slate-800 font-semibold">0x9c3f...d82a</span></span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">Audited 12m ago</span>
      </div>
    </div>
  );
}
