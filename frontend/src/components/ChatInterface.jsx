import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Briefcase, BrainCircuit, User, ArrowRight } from 'lucide-react';
import JobCard from './JobCard';

export default function ChatInterface({ 
  messages = [], 
  onSendMessage, 
  loading, 
  savedJobs = [], 
  onSaveToggle 
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestions = [
    { text: "Find frontend developer jobs in Bangalore under 10 LPA", label: "Frontend Bangalore" },
    { text: "Remote React Native junior developer roles", label: "Remote React Native" },
    { text: "Backend Node.js developer jobs in Mumbai", label: "Node.js Mumbai" },
    { text: "Senior Software Architect positions in Hyderabad", label: "Sr. Architect Hyderabad" }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/20 relative z-0">
      {/* Background Decorative Blurs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-10 animate-fade-in py-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-xl border border-white/10 animate-float">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
                AeroJob AI Assistant
              </h1>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
                Describe your dream job in natural language. Our smart agent extracts requirements and fetches listings in seconds.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Suggested queries</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(s.text)}
                    className="group p-4 text-left rounded-xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.04] hover:border-brand-500/20 text-xs text-slate-300 transition-all duration-300 flex flex-col justify-between h-full hover:scale-[1.015] hover:-translate-y-0.5 shadow-sm hover:shadow-glow-purple"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="font-semibold text-brand-400 tracking-wide">{s.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 transition-colors transform group-hover:translate-x-0.5" />
                    </div>
                    <span className="line-clamp-2 leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={index} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md border border-white/10">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
                    {/* Chat Bubble */}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                      isUser 
                        ? 'bg-brand-600/90 border-brand-500/30 text-white rounded-tr-none shadow-lg shadow-brand-500/5' 
                        : 'bg-white/[0.025] border-white/5 text-slate-100 rounded-tl-none shadow-md'
                    }`}>
                      {msg.text}

                      {/* Display Extracted Parameters from agent */}
                      {!isUser && msg.extractedData && (msg.extractedData.role || msg.extractedData.location) && (
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Agent Extraction:</span>
                          {msg.extractedData.role && (
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 text-[10px] flex items-center gap-1.5 font-semibold border border-brand-500/20 shadow-sm">
                              <Briefcase className="w-3 h-3 text-brand-400" />
                              {msg.extractedData.role}
                            </span>
                          )}
                          {msg.extractedData.location && (
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 text-[10px] flex items-center gap-1.5 font-semibold border border-brand-500/20 shadow-sm">
                              <MapPin className="w-3 h-3 text-brand-400" />
                              {msg.extractedData.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Jobs Display Grid */}
                    {!isUser && msg.jobs && msg.jobs.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {msg.jobs.map((job, jIdx) => {
                          const isJobSaved = savedJobs.some(sJob => sJob.link === job.link);
                          return (
                            <JobCard
                              key={jIdx}
                              job={job}
                              isSaved={isJobSaved}
                              onSaveToggle={onSaveToggle}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* No Jobs Found Handler */}
                    {!isUser && msg.jobs && msg.jobs.length === 0 && (
                      <div className="mt-4 p-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center max-w-md">
                        <p className="text-xs font-semibold text-slate-400">No active job listings match this criteria.</p>
                        <p className="text-[11px] text-brand-400 mt-1.5">Try modifying the location or job title for a broader search.</p>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 shadow-md">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-4 justify-start animate-pulse-slow">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md border border-white/10">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/[0.025] border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 min-w-[70px]">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Box (Modern Floating-feel bar, no top border line, bigger & premium) */}
      <div className="p-6 bg-slate-950/20 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-4 bg-white/[0.02] hover:bg-white/[0.035] border border-white/10 focus-within:border-brand-500/40 p-2 rounded-2xl shadow-premium shadow-brand-500/5 focus-within:shadow-glow-purple-strong transition-all duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your job request... (e.g., 'React developer jobs in Bangalore')"
            className="flex-1 py-3.5 px-5 bg-transparent text-white placeholder-slate-500 text-sm md:text-base focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3.5 rounded-xl text-white font-bold flex-shrink-0 transition-all glow-button disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="max-w-5xl mx-auto text-center text-[10px] text-slate-500 mt-3.5 font-medium tracking-wide uppercase opacity-75">
          AeroJob AI may extract and search based on standard role structures. Ensure your query includes locations for best results.
        </p>
      </div>
    </div>
  );
}
