import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Star, 
  GitFork, 
  Code2, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  AlertCircle, 
  AlertTriangle,
  Clock,
  X,
  Loader2, 
  ArrowRight,
  Flame,
  FileCode,
  Share2,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { GithubIcon } from '../components/Icons';
import UserAvatar from '../components/UserAvatar';
import GitHubContributionGraph from '../components/GitHubContributionGraph';
import ProfileImprovementSection from '../components/ProfileImprovementSection';
import { api } from '../services/api';

export default function DashboardPage({ user, onUserUpdated, onNavigateHome }) {
  const [profile, setProfile] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStep, setRefreshStep] = useState('');
  const [error, setError] = useState(null); // { message, status, isRateLimit }
  const [aiUsage, setAiUsage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'projects' | 'languages' | 'evidence'

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user?.has_github) {
        // Fetch AI quota
        api.getAiUsage().then(setAiUsage).catch(() => {});

        const prof = await api.getMyProfile().catch(() => null);
        if (prof) {
          setProfile(prof);
        } else {
          // If no profile generated yet, auto-trigger first generation!
          await handleGenerateProfile(false);
          return;
        }

        // Also fetch deterministic evidence in background for inspector
        api.getEvidence().then(setEvidence).catch(() => {});
      }
    } catch (err) {
      const isRateLimit = err?.status === 429 || (typeof err?.message === 'string' && (err.message.includes('limit') || err.message.includes('tomorrow')));
      setError({
        message: err.message || 'Failed to load profile data.',
        status: err?.status,
        isRateLimit
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProfile = async (forceRefresh = true) => {
    setRefreshing(true);
    setError(null);
    setRefreshStep('Syncing latest public repositories from GitHub...');
    try {
      await new Promise(r => setTimeout(r, 600));
      setRefreshStep('Computing deterministic metrics and language distributions...');
      await new Promise(r => setTimeout(r, 600));
      setRefreshStep('Gemini 3.1 Flash Lite interpreting factual evidence...');

      const newProf = await api.generateProfile(forceRefresh);
      setProfile(newProf);
      setRefreshStep('');

      // Refresh raw evidence and AI quota
      api.getEvidence().then(setEvidence).catch(() => {});
      api.getAiUsage().then(setAiUsage).catch(() => {});
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      const isRateLimit = err?.status === 429 || (typeof err?.message === 'string' && (err.message.includes('limit') || err.message.includes('tomorrow')));
      setError({
        message: err.message || 'Profile generation failed. Please try again.',
        status: err?.status,
        isRateLimit
      });
      api.getAiUsage().then(setAiUsage).catch(() => {});
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectGitHub = () => {
    window.location.href = api.getGitHubConnectUrl();
  };

  const handleCopyLink = () => {
    if (!profile) return;
    const url = `https://tracemint.tech/@${profile.username_slug}`;
    navigator.clipboard?.writeText?.(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If user has not connected GitHub yet
  if (!user?.has_github) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-card space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto">
            <GithubIcon className="w-8 h-8" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Connect your GitHub account
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              TraceMint analyzes your public GitHub activity as factual evidence. We request only read-only access to compute deterministic metrics.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleConnectGitHub}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              <GithubIcon className="w-4 h-4 text-cyan-300" />
              <span>Connect GitHub Account</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Read-only inspection
            </span>
            <span>•</span>
            <span>Zero code modification</span>
            <span>•</span>
            <span>Deterministic metrics</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading initial profile
  if (loading && !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Analyzing your GitHub proof of work...</h3>
        <p className="text-xs font-mono text-slate-500">Fetching repositories and running Gemini 3.1 analysis</p>
      </div>
    );
  }

  const metrics = profile?.metrics || {};
  const skills = profile?.skills || [];
  const strengths = profile?.strengths || [];
  const projects = profile?.projects || [];
  const insights = profile?.insights || [];
  const improvements = profile?.improvements || [];
  const languages = metrics?.languages || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* Notice/Error Banner */}
      {error && (
        <div 
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            error.isRateLimit 
              ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm' 
              : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-sm'
          }`}
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                error.isRateLimit ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {error.isRateLimit ? <Clock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold tracking-tight">
                    {error.isRateLimit ? "You've reached today's AI analysis limit." : "Action Failed"}
                  </h4>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border ${
                    error.isRateLimit 
                      ? 'bg-amber-100/80 text-amber-800 border-amber-300' 
                      : 'bg-rose-100/80 text-rose-800 border-rose-300'
                  }`}>
                    {error.isRateLimit ? '429 Rate Limit' : 'Error'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {error.isRateLimit 
                    ? "You've reached today's AI analysis limit. Try again tomorrow. TraceMint enforces a server-side limit of 10 Gemini analyses per user every 24 hours during testing."
                    : (error.message || 'An unexpected error occurred. Please try again.')}
                </p>
                {error.isRateLimit && (
                  <div className="pt-1 flex items-center gap-3 text-[11px] font-mono text-amber-900/80">
                    <span>• Testing Safeguard: 10 calls / 24h</span>
                    <span>• Auto-resets on a rolling 24h window</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100/60 transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Generating/Refreshing state overlay */}
      {refreshing && (
        <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
          <div className="text-sm font-bold text-sky-950">{refreshStep}</div>
          <div className="text-xs font-mono text-sky-700">Deterministic sync & Gemini interpretation in progress</div>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        
        {/* Top Dark Bar */}
        <div className="bg-slate-900 text-slate-100 px-4 sm:px-8 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">tracemint.tech/@</span>
            <span className="text-cyan-400 font-bold">{profile?.username_slug}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
              PROVEN BUILDER
            </span>
            {aiUsage && (
              <span 
                className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 ${
                  aiUsage.remaining === 0 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700' 
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Gemini AI Analysis Limit (24h rolling)"
              >
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                AI: {aiUsage.used}/{aiUsage.limit}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Public Link' : 'Share Profile'}</span>
            </button>

            <button
              onClick={() => handleGenerateProfile(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Evidence</span>
            </button>
          </div>
        </div>

        {/* Bio & Metrics Overview */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Identity Info */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <UserAvatar 
                  src={user.avatar_url} 
                  name={user.name} 
                  githubUsername={user.github_username}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl"
                />
                <div className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-1 rounded-full shadow" title="Verified by TraceMint Engine">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Proof of Work
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
                  <span className="text-slate-800 font-semibold flex items-center gap-1">
                    <GithubIcon className="w-3.5 h-3.5 text-slate-700" />
                    @{user.github_username}
                  </span>
                  <span>•</span>
                  <span>{user.email}</span>
                </div>

                <p className="text-sm text-slate-700 max-w-2xl leading-relaxed pt-1">
                  {profile?.summary}
                </p>
              </div>
            </div>

            {/* Verification Pipeline Checklist */}
            <div className="w-full lg:w-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono space-y-2 shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Verification Pipeline
              </div>
              <div className="space-y-1 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Identity: <strong className="text-slate-900">Verified</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GitHub REST API: <strong className="text-slate-900">{metrics.repository_count || 0} Repos Synced</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gemini 3.1 Flash: <strong className="text-slate-900">Interpreted</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* High-Impact Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-mono">Public Repositories</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-0.5">
                {metrics.repository_count ?? 0}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-mono">Total Earned Stars</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-0.5 flex items-baseline gap-1">
                <span>{metrics.total_stars ?? 0}</span>
                <span className="text-xs text-amber-500">★</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-mono">Total Earned Forks</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-0.5">
                {metrics.total_forks ?? 0}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-mono">Active (90 Days)</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono mt-0.5">
                {metrics.active_repository_count ?? 0} repos
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-sky-50/70 p-3.5 rounded-xl border border-sky-100 shadow-sm">
              <div className="text-[11px] text-sky-800 font-mono">Languages Observed</div>
              <div className="text-xl sm:text-2xl font-bold text-sky-950 font-mono mt-0.5">
                {Object.keys(languages).length} tracked
              </div>
            </div>
          </div>

          {/* GitHub Commit / Contributions Calendar */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <GitHubContributionGraph 
              username={user.github_username || profile?.username_slug}
              totalContributions={null}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-4 sm:px-8 gap-1 sm:gap-2 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Skills ({skills.length})
          </button>
          <button
            onClick={() => setActiveTab('improvements')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'improvements'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Profile Improvement</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Notable Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('languages')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'languages'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Language Ecosystem ({Object.keys(languages).length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-600" />
              <span>Evidence Inspector</span>
            </span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: OVERVIEW & SKILLS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Gemini Insights */}
              {insights.length > 0 && (
                <div className="bg-sky-50/60 rounded-xl p-5 border border-sky-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase font-mono tracking-wider">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span>Gemini 3.1 Developer Insights</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
                    {insights.map((insight, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-sky-100 flex items-start gap-2.5">
                        <span className="text-sky-600 font-bold shrink-0">•</span>
                        <span className="leading-relaxed">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Strengths */}
              {strengths.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Demonstrated Technical Strengths
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {strengths.map((str, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="text-sm font-bold text-slate-900">{str.name}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          Evidence: <span className="text-slate-800 font-medium">{Array.isArray(str.evidence) ? str.evidence.join(', ') : str.evidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Verified by Repository Evidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Evidence-Backed Skills & Technologies
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Every skill cites specific public repositories
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {skills.map((skill, idx) => {
                    const confidencePct = Math.round((skill.confidence || 0.8) * 100);
                    const evidenceList = Array.isArray(skill.evidence) ? skill.evidence : [skill.evidence];
                    return (
                      <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{skill.name}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            Repos: <span className="text-slate-700">{evidenceList.join(', ')}</span>
                          </div>
                        </div>

                        <div className="text-right font-mono shrink-0">
                          <span className="text-xs font-bold text-slate-900">{confidencePct}%</span>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-slate-900 rounded-full transition-all" 
                              style={{ width: `${confidencePct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PROFILE IMPROVEMENT SECTION */}
              <div className="pt-6 border-t border-slate-200">
                <ProfileImprovementSection 
                  improvements={improvements}
                  metrics={metrics}
                />
              </div>
            </div>
          )}

          {/* TAB: PROFILE IMPROVEMENT DEDICATED VIEW */}
          {activeTab === 'improvements' && (
            <div className="space-y-6">
              <ProfileImprovementSection 
                improvements={improvements}
                metrics={metrics}
              />
            </div>
          )}

          {/* TAB 2: NOTABLE PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 font-mono">
                Notable repositories identified by the analysis engine based on star counts, code activity, topics, and complexity:
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-bold text-slate-900">{proj.repository}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          Verified Project
                        </span>
                      </div>

                      <a
                        href={`https://github.com/${user.github_username}/${proj.repository}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-sky-600 hover:text-sky-800 flex items-center gap-1"
                      >
                        <span>View on GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {proj.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-500 font-mono">
                Deterministic language frequency computed directly from repository metadata without speculation:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {Object.entries(languages).map(([lang, count], idx) => {
                  const total = metrics.repository_count || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{lang}</span>
                        <span className="text-xs font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-semibold">
                          {count} {count === 1 ? 'repo' : 'repos'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono text-right">
                        {pct}% of public repositories
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: EVIDENCE INSPECTOR */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono">
                    Raw Deterministic GitHub Evidence
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    This is the factual evidence object passed directly to Gemini 3.1 Flash Lite.
                  </p>
                </div>

                {evidence && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText?.(JSON.stringify(evidence, null, 2));
                      alert('Evidence JSON copied to clipboard!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-mono hover:bg-slate-50"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px]">
                <pre>{JSON.stringify(evidence || { message: 'Loading evidence object...' }, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 px-6 sm:px-8 py-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>TraceMint Deterministic Proof Engine v1.0</span>
          </div>
          <span>Updated: {new Date(profile?.updated_at || Date.now()).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
