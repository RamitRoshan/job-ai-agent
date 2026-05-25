import React from 'react';
import { MapPin, Briefcase, DollarSign, Bookmark, ExternalLink } from 'lucide-react';

export default function JobCard({ job, isSaved, onSaveToggle }) {
  const { title, company, location, salary, experience, description, link, tags = [] } = job;

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full border border-white/5 relative overflow-hidden group">
      {/* Decorative Blur Background Accent */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
      
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white leading-snug group-hover:text-brand-300 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">{company}</p>
          </div>
          
          <button
            onClick={() => onSaveToggle(job)}
            className={`p-2 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
              isSaved 
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' 
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={isSaved ? 'Unsave Job' : 'Save Job'}
          >
            <Bookmark className={`w-3.5 h-3.5 transition-all ${isSaved ? 'fill-current scale-110' : ''}`} />
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-semibold">
          {location && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/5">
              <MapPin className="w-3 h-3 text-brand-400" />
              <span>{location}</span>
            </div>
          )}
          {salary && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>{salary}</span>
            </div>
          )}
          {experience && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/10">
              <Briefcase className="w-3 h-3 text-amber-400" />
              <span>{experience}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-400/90 line-clamp-3 mb-5 leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>

      {/* Footer Tags & Apply */}
      <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-4">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-brand-500/5 text-brand-300 border border-brand-500/10"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/5 text-slate-400">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-gradient-to-r hover:from-brand-600 hover:to-indigo-600 border border-white/5 hover:border-transparent text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm group/btn"
        >
          <span>Apply Now</span>
          <ExternalLink className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}
