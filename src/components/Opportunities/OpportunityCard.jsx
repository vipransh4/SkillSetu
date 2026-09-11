import React from 'react';
import { 
  MapPin, 
  Timer, 
  IndianRupee, 
  CalendarClock, 
  ArrowUpRight, 
  Check, 
  ShieldCheck,
  Sparkles,
  Video
} from 'lucide-react';

const OpportunityCard = ({ 
  opportunity, 
  onSelect, 
  onApply, 
  isApplied = false,
  searchQuery = '',
  calls = [],
  onJoinCall
}) => {
  const queryWords = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 1);

  const isSkillMatched = (skill) => {
    if (!queryWords.length) return false;
    const s = skill.toLowerCase();
    return queryWords.some(w => s.includes(w));
  };

  const getRoleBadgeStyle = (typeStr = '') => {
    const t = typeStr.toLowerCase();
    if (t.includes('intern')) {
      return 'bg-amber-50 text-amber-700 border-amber-200/70';
    }
    if (t.includes('full') || t.includes('job')) {
      return 'bg-blue-50 text-blue-700 border-blue-200/70';
    }
    if (t.includes('grant') || t.includes('research')) {
      return 'bg-purple-50 text-purple-700 border-purple-200/70';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200/70';
  };

  const companyLogoInitials = (opportunity.company || 'SS')
    .substring(0, 2)
    .toUpperCase();

  const matchPercent = opportunity.matchScore || 92;
  const hasCall = calls && calls.length > 0;

  return (
    <div 
      className={`bg-white border rounded-2xl p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${
        hasCall ? 'border-violet-300 ring-1 ring-violet-200/60' : 'border-slate-200/80'
      }`}
    >
      <div>
        {hasCall && (
          <div className="mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200/80 rounded-full text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              Interview Scheduled
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-800 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:border-blue-300 transition-colors overflow-hidden">
              {opportunity.company_logo ? (
                <img 
                  src={opportunity.company_logo} 
                  alt={opportunity.company} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{companyLogoInitials}</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-slate-600 truncate">
                  {opportunity.company}
                </span>
                {opportunity.is_verified_partner && (
                  <ShieldCheck size={13} className="text-blue-600 shrink-0" title="Verified Employer" />
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getRoleBadgeStyle(opportunity.type || opportunity.role_type)}`}>
                  {opportunity.type || opportunity.role_type || 'Full-Time'}
                </span>
              </div>

              <h3 
                onClick={() => onSelect?.(opportunity)}
                className="text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors cursor-pointer"
                title={opportunity.title}
              >
                {opportunity.title}
              </h3>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 tabular-nums">
            <Sparkles size={11} className="text-emerald-600" />
            {matchPercent}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 mb-3.5 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium">{opportunity.location || 'Remote'}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
            <Timer size={13} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium">{opportunity.duration || opportunity.tenure || 'Full-Time'}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
            <IndianRupee size={13} className="text-slate-400 shrink-0" />
            <span className="truncate font-semibold text-slate-900 tabular-nums">
              {opportunity.stipend || opportunity.stipend_or_ctc || 'Competitive'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
            <CalendarClock size={13} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium">{opportunity.deadline || 'Open'}</span>
          </div>
        </div>

        {opportunity.skills && opportunity.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {opportunity.skills.slice(0, 4).map((skill, idx) => {
              const matched = isSkillMatched(skill);
              return (
                <span
                  key={idx}
                  className={`text-[11px] px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    matched
                      ? 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {opportunity.skills.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-400 font-medium">
                +{opportunity.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {hasCall && (
          <div className="bg-violet-50/70 border border-violet-100 rounded-xl p-2.5 mb-3.5 space-y-2">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    Interview · {call.candidateName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {new Date(call.scheduledTime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onJoinCall?.(call)}
                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
                >
                  <Video size={12} />
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSelect?.(opportunity)}
          className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-center"
        >
          View Details
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!isApplied) {
              onApply?.(opportunity);
            }
          }}
          disabled={isApplied}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
            isApplied
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
          }`}
        >
          {isApplied ? (
            <>
              <Check size={13} />
              <span>Applied</span>
            </>
          ) : (
            <>
              <span>Apply Now</span>
              <ArrowUpRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
