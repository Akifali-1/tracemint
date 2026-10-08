import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GitBranch, 
  GitCommit, 
  ExternalLink, 
  Trophy, 
  Server, 
  Flame, 
  Tag, 
  CheckCircle2, 
  Star,
  Copy,
  Check,
  Code2
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import GitHubContributionGraph from './GitHubContributionGraph';
import { sampleProfiles, mockHeatmapWeeks } from '../data/mockData';

export default function ProfilePreviewCard({ profileIndex = 0, realProfile = null }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const isReal = Boolean(realProfile);
  const sample = sampleProfiles[profileIndex] || sampleProfiles[0];

  // Derived profile fields
  const handle = isReal ? realProfile.username_slug : sample.handle;
  const name = isReal ? (realProfile.display_name || realProfile.username_slug) : sample.name;
  const avatar = isReal ? (realProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80') : sample.avatar;
  const summary = isReal ? realProfile.summary : sample.role;
  const metrics = isReal ? (realProfile.metrics || {}) : null;

  // Real skills or mock skills
  const skills = isReal 
    ? (realProfile.skills || []).map(s => ({
        name: s.name,
        confidence: Math.round((s.confidence || 0.8) * 100),
        evidence: Array.isArray(s.evidence) ? s.evidence : [s.evidence]
      }))
    : sample.skills.map(s => ({
        name: s.name,
        confidence: s.percentage,
        evidence: [s.verifiedCount]
      }));

  const strengths = isReal ? (realProfile.strengths || []) : [];
  const notableProjects = isReal ? (realProfile.projects || []) : [];
  const insights = isReal ? (realProfile.insights || []) : [];
  const improvements = isReal ? (realProfile.improvements || []) : [];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://tracemint.tech/@${handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden transition-all duration-300 hover:shadow-float">
      {/* Top status bar simulating developer profile header */}
      <div className="bg-slate-900 text-slate-100 px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono min-w-0">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-slate-300 truncate text-[11px] sm:text-xs">
            <span className="hidden xs:inline text-slate-400">tracemint.tech/@</span>
            <span className="text-cyan-400 font-semibold">{handle}</span>
          </span>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700 shrink-0">
            {isReal ? 'PROVEN BUILDER' : 'SAMPLE PROFILE'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isReal ? 'TraceMint Deterministic Metrics' : 'Sample developer profile — demonstration data'}</span>
          </div>
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors text-[11px] font-mono"
            title="Copy Proof URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Profile Bio & Proof Score Banner */}
      <div className="p-4 sm:p-7 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="relative shrink-0">
              <UserAvatar 
                src={avatar} 
                name={name} 
                githubUsername={handle}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-0.5 sm:p-1 rounded-full shadow" title="Verified by TraceMint Engine">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">{name}</h3>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {isReal ? 'Verified GitHub Evidence' : 'Demonstration Data'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mt-0.5 leading-snug">
                {summary}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-[11px] sm:text-xs text-slate-500 font-mono">
                <span>@{handle}</span>
                <span className="hidden xs:inline">•</span>
                <span className="text-sky-700 font-medium">
                  {isReal ? `${metrics?.repository_count || 0} Public Repositories` : '14 Repositories'}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Highlights Card */}
          <div className="w-full sm:w-auto bg-slate-900 text-white rounded-xl p-3 sm:px-5 sm:py-3.5 border border-slate-800 shadow-sm flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Stars</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  {isReal ? (metrics?.total_stars ?? 0) : sample.proofScore}
                </span>
                <span className="text-xs text-cyan-400 font-mono font-medium">earned</span>
              </div>
            </div>
            <div className="h-9 w-[1px] bg-slate-800"></div>
            <div className="text-right sm:text-left">
              <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Forks</div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono">
                {isReal ? (metrics?.total_forks ?? 0) : sample.percentile}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">
                {isReal ? `${metrics?.active_repository_count ?? 0} active repos` : 'Ship Velocity'}
              </div>
            </div>
          </div>
        </div>

        {/* Micro Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
          <div className="bg-slate-50/80 p-2 sm:p-2.5 rounded-lg border border-slate-200/70">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono">Public Repositories</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {isReal ? (metrics?.repository_count ?? 0) : sample.stats.commits}
            </div>
          </div>
          <div className="bg-slate-50/80 p-2 sm:p-2.5 rounded-lg border border-slate-200/70">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono">Active (90d)</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {isReal ? (metrics?.active_repository_count ?? 0) : sample.stats.prMerged}
            </div>
          </div>
          <div className="bg-slate-50/80 p-2 sm:p-2.5 rounded-lg border border-slate-200/70">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono">Recent (180d)</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {isReal ? (metrics?.recent_repository_count ?? 0) : sample.stats.projectsShipped}
            </div>
          </div>
          <div className="bg-sky-50/70 p-2 sm:p-2.5 rounded-lg border border-sky-100">
            <div className="text-[10px] sm:text-[11px] text-sky-800 font-mono flex items-center gap-1">
              <Code2 className="w-3 h-3 text-sky-600" />
              <span>Languages</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-sky-950 font-mono">
              {isReal ? Object.keys(metrics?.languages || {}).length : sample.stats.deployments} tracked
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/40 px-2 sm:px-6 overflow-x-auto no-scrollbar text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Skills
        </button>
        {isReal ? (
          <>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Notable Projects ({notableProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('languages')}
              className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'languages'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Languages Breakdown
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Shipped Projects ({sample.projects.length})
            </button>
            <button
              onClick={() => setActiveTab('hackathons')}
              className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'hackathons'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Hackathon Podiums ({sample.hackathons.length})
            </button>
          </>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Insights and Strengths if real */}
            {isReal && insights.length > 0 && (
              <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100">
                <h4 className="text-xs font-semibold text-sky-900 uppercase tracking-wider mb-2 font-mono">
                  Observed Developer Insights (Gemini Interpretation)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-600 font-bold shrink-0">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {isReal && strengths.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 font-mono">
                  Demonstrated Technical Strengths
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {strengths.map((str, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-900">{str.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Evidence: {Array.isArray(str.evidence) ? str.evidence.join(', ') : str.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Verified by Code Repositories */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 font-mono">
                {isReal ? 'Demonstrated Technologies (Evidence-Backed)' : 'Code-Verified Skills (Demonstration Data)'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((skill, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">{skill.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {skill.evidence.join(', ')}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-slate-800">{skill.confidence}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-slate-900 rounded-full" 
                          style={{ width: `${skill.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Commit / Contributions Calendar Heatmap */}
            <div className="pt-5 border-t border-slate-200">
              <GitHubContributionGraph 
                username={handle}
                totalContributions={isReal ? null : 298}
              />
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 gap-3.5">
            {isReal ? (
              notableProjects.length > 0 ? (
                notableProjects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{proj.repository}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-50 text-sky-700 border border-sky-200">
                        Notable Project
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.reason}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center font-mono">
                  No highlighted projects generated.
                </div>
              )
            ) : (
              sample.projects.map((proj, idx) => (
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
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'languages' && isReal && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
              Deterministic Language Frequency Across Repositories
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(metrics?.languages || {}).map(([lang, count], idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{lang}</span>
                  <span className="text-xs font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-medium">
                    {count} {count === 1 ? 'repository' : 'repositories'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hackathons' && !isReal && (
          <div className="space-y-3">
            {sample.hackathons.map((h, idx) => (
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer proof card bar */}
      <div className="bg-slate-50 px-4 sm:px-5 py-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            {isReal ? (
              <span>Verification Source: <span className="font-mono text-slate-800 font-semibold">GitHub REST API & Gemini 3.1 Flash Lite</span></span>
            ) : (
              <span>Profile Status: <span className="font-mono text-slate-800 font-semibold">Sample Demonstration Data</span></span>
            )}
          </span>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] text-slate-400">
          TraceMint Engine v1.0
        </span>
      </div>
    </div>
  );
}
