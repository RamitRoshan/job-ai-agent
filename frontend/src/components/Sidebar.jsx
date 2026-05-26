import React from 'react';
import { Bookmark, History, LogIn, LogOut, Trash2, Search, Briefcase, MapPin, Sparkles, X } from 'lucide-react';

export default function Sidebar({ 
  user, 
  savedJobs = [], 
  searchHistory = [], 
  onAuthTrigger, 
  onLogout, 
  onSelectHistory, 
  onDeleteHistory, 
  onUnsaveJob,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen
}) {
  // Helper to extract initials for user avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 w-80 h-full glass-panel border-r border-white/5 flex flex-col flex-shrink-0 z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between group cursor-default">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/15 border border-white/10 group-hover:scale-105 transition-all duration-300">
              <Briefcase className="w-5 h-5 text-white animate-float" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white tracking-tight leading-none">AeroJob AI</h2>
                <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium">Beta</span>
              </div>
              <span className="text-[10px] text-brand-400/80 font-semibold tracking-wider uppercase block mt-1">Intelligent Agent</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 md:hidden flex items-center justify-center transition-all duration-200 hover:scale-105"
            title="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      {/* User Session Controller */}
      <div className="p-5 border-b border-white/5 bg-white/[0.01]">
        {user ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 shadow-inner">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-brand-600 flex items-center justify-center font-bold text-xs text-white shadow-md border border-white/10">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 border border-white/5 text-slate-400 transition-all hover:scale-105 duration-200"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-center p-3 rounded-xl bg-white/[0.01] border border-white/5">
            <div className="flex justify-center mb-2 text-brand-400/85">
              <Sparkles className="w-5 h-5 animate-pulse-slow" />
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Sign in to save job listings and sync search history across devices.
            </p>
            <button
              onClick={onAuthTrigger}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all glow-button"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In / Sign Up</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Selector (Capsule Navigation style) */}
      <div className="p-3 border-b border-white/5">
        <div className="flex p-1 rounded-xl bg-white/[0.02] border border-white/5">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              activeTab === 'history' 
                ? 'pill-tab-active text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              activeTab === 'saved' 
                ? 'pill-tab-active text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Jobs ({savedJobs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'history' && (
          <div className="space-y-2">
            {searchHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-8 h-8 mx-auto mb-3 text-slate-700 animate-pulse-slow" />
                <p className="text-xs text-slate-500 font-medium">No search history yet.</p>
              </div>
            ) : (
              searchHistory.map((item) => (
                <div 
                  key={item._id || item.id} 
                  className="group/item flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectHistory(item.query)}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <Search className="w-3.5 h-3.5 mt-0.5 text-brand-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate pr-1">
                        {item.query}
                      </p>
                      {item.role && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate font-medium">
                          {item.role} {item.location ? `• ${item.location}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item._id || item.id);
                    }}
                    className="p-1 rounded-md opacity-0 group-hover/item:opacity-100 focus:opacity-100 text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all ml-2"
                    title="Delete History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-3">
            {savedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-8 h-8 mx-auto mb-3 text-slate-700 animate-pulse-slow" />
                <p className="text-xs text-slate-500 font-medium">No saved jobs yet.</p>
              </div>
            ) : (
              savedJobs.map((job) => (
                <div 
                  key={job._id || job.link || job.id}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/[0.015] hover:border-brand-500/25 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-white line-clamp-1 flex-1 leading-snug">
                        {job.title}
                      </h4>
                      <button
                        onClick={() => onUnsaveJob(job._id || job.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded hover:bg-white/5"
                        title="Unsave Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-300 font-semibold mt-1">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 mt-2.5">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5">
                        <MapPin className="w-2.5 h-2.5 text-brand-400" />
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 py-1.5 text-center rounded-lg bg-brand-500/10 hover:bg-brand-600 text-brand-300 hover:text-white text-[10px] font-bold border border-brand-500/15 hover:border-transparent transition-all shadow-sm flex items-center justify-center gap-1"
                  >
                    <span>View Listing</span>
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  </>
  );
}
