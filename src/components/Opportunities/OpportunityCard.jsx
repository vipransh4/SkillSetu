import React, { useState } from 'react';
import { 
  MapPin, 
  Timer, 
  IndianRupee, 
  CalendarClock, 
  ArrowUpRight, 
  Check, 
  ShieldCheck,
  Sparkles,
  Video,
  Share2
} from 'lucide-react';

const getCompanyInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'SS';
  if (name.startsWith('http://') || name.startsWith('https://') || name.includes('/')) return 'SS';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getCompanyAvatarColor = (name = '') => {
  const colors = [
    'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white',
    'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white',
    'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white',
    'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white',
    'bg-gradient-to-tr from-amber-600 to-orange-600 text-white',
    'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white',
    'bg-gradient-to-tr from-rose-600 to-pink-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const OpportunityCard = ({ 
  opportunity, 
  onSelect, 
  onApply, 
  onViewRecruiter,
  isApplied = false,
  searchQuery = '',
  calls = [],
  onJoinCall,
  isAcademician = false,
  isAdvisoryView = false,
  isMyCompany = false,
  onExpressInterest,
  onRecommendToStudents
}) => {
  const [imgError, setImgError] = useState(false);

  const queryWords = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 1);

  const isSkillMatched = (skill) => {
    if (!queryWords.length) return false;
    const s = skill.toLowerCase();
    return queryWords.some(w => s.includes(w));
  };

  const resolveLogoUrl = (url) => {
    if (!url) return '';
    let trimmed = String(url).trim();
    if (trimmed.includes('logo.clearbit.com/')) {
      const domain = trimmed.split('logo.clearbit.com/')[1]?.split('/')[0] || '';
      if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
    if (trimmed.startsWith('/media/') || trimmed.startsWith('/static/')) {
      return `http://localhost:8000${trimmed}`;
    }
    return trimmed;
  };

  const displayName = opportunity.hiring_display_name || opportunity.company || 'Partner';
  const rawLogo = resolveLogoUrl(opportunity.company_logo || opportunity.logo || opportunity.hiring_logo_url);
  const hasLogoUrl = Boolean(rawLogo && (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')));
  const companyInitials = getCompanyInitials(displayName);
  const avatarColor = getCompanyAvatarColor(displayName);
  const matchPercent = opportunity.matchScore || 92;
  const hasCall = calls && calls.length > 0;

  return (
    <div 
      className={`bg-white border rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all duration-150 flex flex-col justify-between group ${
        hasCall ? 'border-slate-800' : 'border-slate-200/80'
      }`}
    >
      <div>
        {hasCall && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-slate-200/80 rounded-md text-[11px] font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
              Interview Scheduled
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {hasLogoUrl && !imgError ? (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRecruiter?.(opportunity);
                }}
                data-theme-ignore="true"
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity shadow-xs"
                title={`View ${displayName} profile`}
              >
                <img
                  src={rawLogo}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            ) : (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRecruiter?.(opportunity);
                }}
                className={`w-10 h-10 rounded-xl ${avatarColor} font-semibold text-xs flex items-center justify-center shrink-0 tracking-tight select-none cursor-pointer hover:opacity-85 transition-opacity shadow-xs`}
                title={`View ${displayName} profile`}
              >
                {companyInitials}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewRecruiter?.(opportunity);
                  }}
                  className="text-xs font-semibold text-slate-900 hover:text-indigo-600 truncate underline-offset-2 hover:underline cursor-pointer flex items-center gap-1 text-left"
                  title={`View ${displayName} profile`}
                >
                  <span>{displayName}</span>
                </button>
                {opportunity.hiring_mode === 'INDIVIDUAL' && (
                  <span className="bg-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                    Recruiter
                  </span>
                )}
                {isMyCompany && (
                  <span className="bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                    Your Company
                  </span>
                )}
                {opportunity.is_verified_partner && (
                  <ShieldCheck size={12} className="text-slate-600 shrink-0" />
                )}
                <span className="bg-transparent border border-slate-200/80 text-slate-600 text-[10px] font-medium px-1.5 py-0.2 rounded-md">
                  {opportunity.type || opportunity.role_type || 'Full-Time'}
                </span>
              </div>

              <h3 
                onClick={() => onSelect?.(opportunity)}
                className="text-sm font-semibold text-slate-900 tracking-tight truncate hover:text-slate-700 transition-colors cursor-pointer"
                title={opportunity.title}
              >
                {opportunity.title}
              </h3>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 tabular-nums shrink-0">
            <Sparkles size={11} className="text-emerald-600" />
            {matchPercent}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2.5 pb-1 border-t border-slate-100 mb-3 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium text-[11px]">{opportunity.location || 'Remote'}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
            <Timer size={12} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium text-[11px]">{opportunity.duration || opportunity.tenure || 'Full-Time'}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 text-slate-700">
            <IndianRupee size={12} className="text-slate-400 shrink-0" />
            <span className="truncate font-semibold tabular-nums text-[11px]">
              {opportunity.stipend || opportunity.stipend_or_ctc || 'Competitive'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
            <CalendarClock size={12} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium tabular-nums text-[11px]">{opportunity.deadline || 'Open'}</span>
          </div>
        </div>

        {opportunity.skills && opportunity.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {opportunity.skills.slice(0, 4).map((skill, idx) => {
              const matched = isSkillMatched(skill);
              return (
                <span
                  key={idx}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                    matched
                      ? 'border border-slate-900 text-slate-900 font-semibold'
                      : 'border border-slate-200/80 text-slate-600'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {opportunity.skills.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-400 font-medium">
                +{opportunity.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {hasCall && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-3 space-y-2">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    Interview • {call.candidateName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate tabular-nums">
                    {new Date(call.scheduledTime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onJoinCall?.(call)}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Video size={11} />
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
          className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-center"
        >
          View Details
        </button>

        {isAcademician && isAdvisoryView ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onRecommendToStudents) {
                onRecommendToStudents(opportunity);
              } else {
                onSelect?.(opportunity);
              }
            }}
            className="flex-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 size={12} />
            <span>Share with Batch</span>
          </button>
        ) : isAcademician ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isApplied) {
                if (onExpressInterest) {
                  onExpressInterest(opportunity);
                } else {
                  onApply?.(opportunity);
                }
              }
            }}
            disabled={isApplied}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isApplied
                ? 'bg-slate-100 text-slate-500 border border-slate-200/80 cursor-default'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isApplied ? (
              <>
                <Check size={12} />
                <span>SOP Submitted</span>
              </>
            ) : (
              <>
                <span>Express Interest</span>
                <ArrowUpRight size={12} />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isApplied) {
                onApply?.(opportunity);
              }
            }}
            disabled={isApplied}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isApplied
                ? 'bg-slate-100 text-slate-500 border border-slate-200/80 cursor-default'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isApplied ? (
              <>
                <Check size={12} />
                <span>Applied</span>
              </>
            ) : (
              <>
                <span>Apply Now</span>
                <ArrowUpRight size={12} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
