import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Timer, 
  IndianRupee, 
  CalendarClock, 
  Check, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import apiClient from '../../api/client';

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

const OpportunityDetails = ({ 
  opportunity, 
  onBack, 
  onRouteChange, 
  onApplicationSubmitted,
  onViewRecruiter,
  isAlreadyApplied = false,
  isAcademician = false,
  isAdvisoryView = false,
  onExpressInterest
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(isAlreadyApplied);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [applyErrorMsg, setApplyErrorMsg] = useState('');
  const [imgError, setImgError] = useState(false);

  if (!opportunity) return null;

  const matchPercent = opportunity.matchScore || 92;
  const displayName = opportunity.hiring_display_name || opportunity.company || 'Partner Organization';
  const rawLogo = (opportunity.company_logo || opportunity.logo || opportunity.hiring_logo_url || '').trim();
  const hasLogoUrl = Boolean(rawLogo && (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:') || rawLogo.startsWith('/')));
  const companyInitials = getCompanyInitials(displayName);
  const avatarBg = getCompanyAvatarColor(displayName);

  const handleApply = async () => {
    if (applied || isApplying) return;
    setIsApplying(true);
    setApplyErrorMsg('');

    try {
      if (opportunity.id) {
        await apiClient.post(`/students/jobs/${opportunity.id}/apply`, {});
      }
      setApplied(true);
      setApplySuccessMsg('Application submitted with verified skills snapshot!');
      onApplicationSubmitted?.(opportunity.id);
    } catch (err) {
      if (err.response?.status === 409) {
        setApplied(true);
        setApplySuccessMsg('You have already applied for this position.');
      } else {
        setApplyErrorMsg(err.response?.data?.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const candidateSkillsPresent = (opportunity.skills || []).slice(0, Math.ceil((opportunity.skills || []).length * 0.75));
  const candidateSkillsGaps = (opportunity.skills || []).slice(Math.ceil((opportunity.skills || []).length * 0.75));

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Opportunities</span>
        </button>

        {applySuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{applySuccessMsg}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setApplySuccessMsg('')} 
              className="text-emerald-600 hover:text-emerald-900 text-xs font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {applyErrorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{applyErrorMsg}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setApplyErrorMsg('')} 
              className="text-rose-600 hover:text-rose-900 text-xs font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 min-w-0">
                  {hasLogoUrl && !imgError ? (
                    <div 
                      onClick={() => onViewRecruiter?.(opportunity)}
                      data-theme-ignore="true"
                      className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-md cursor-pointer hover:opacity-85 transition-opacity overflow-hidden"
                      title={`View ${displayName} profile`}
                    >
                      <img
                        src={rawLogo}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => onViewRecruiter?.(opportunity)}
                      className={`w-14 h-14 rounded-2xl ${avatarBg} font-bold text-xl flex items-center justify-center shrink-0 shadow-md select-none cursor-pointer hover:opacity-85 transition-opacity`}
                      title={`View ${displayName} profile`}
                    >
                      <span>{companyInitials}</span>
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onViewRecruiter?.(opportunity)}
                        className="text-xs font-semibold text-slate-800 hover:text-indigo-600 truncate underline-offset-2 hover:underline cursor-pointer flex items-center gap-1.5 text-left"
                        title={`View ${opportunity.hiring_display_name || opportunity.company} profile`}
                      >
                        <Building2 size={13} className="text-slate-400" />
                        <span>{opportunity.hiring_display_name || opportunity.company}</span>
                        <ExternalLink size={11} className="text-slate-400" />
                      </button>
                      {opportunity.hiring_mode === 'INDIVIDUAL' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-transparent text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/40">
                          Recruiter Mode
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-transparent text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/40">
                        {opportunity.type || opportunity.role_type || 'Full-Time'}
                      </span>
                      {opportunity.is_verified_partner && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-transparent text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/40">
                          <ShieldCheck size={11} /> Verified Employer
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      {opportunity.title}
                    </h1>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-transparent text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm border border-emerald-300 dark:border-emerald-500/40 shrink-0 tabular-nums shadow-xs">
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>{matchPercent}% Fit</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium mb-1 text-[11px]">
                    <MapPin size={13} /> Location
                  </span>
                  <p className="font-bold text-slate-900 truncate">{opportunity.location || 'Remote'}</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium mb-1 text-[11px]">
                    <Timer size={13} /> Tenure
                  </span>
                  <p className="font-bold text-slate-900 truncate">{opportunity.duration || opportunity.tenure || 'Permanent'}</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium mb-1 text-[11px]">
                    <IndianRupee size={13} /> Compensation
                  </span>
                  <p className="font-bold text-slate-900 truncate tabular-nums">
                    {opportunity.stipend || opportunity.stipend_or_ctc || 'Competitive'}
                  </p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium mb-1 text-[11px]">
                    <CalendarClock size={13} /> Apply By
                  </span>
                  <p className="font-bold text-slate-900 truncate">{opportunity.deadline || 'Rolling'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>Role Dossier & Architecture</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {opportunity.about || opportunity.description || `Join ${opportunity.company} as ${opportunity.title}. You will collaborate directly with cross-functional engineering leads to architect, scale, and deliver mission-critical software systems.`}
              </p>
            </div>

            {opportunity.responsibilities && opportunity.responsibilities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                  Core Responsibilities
                </h2>
                <ul className="space-y-3">
                  {opportunity.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-normal">
                      <CheckCircle2 size={17} className="text-blue-600 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.qualifications && opportunity.qualifications.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                  Qualifications & Experience
                </h2>
                <ul className="space-y-3">
                  {opportunity.qualifications.map((qual, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-normal">
                      <CheckCircle2 size={17} className="text-blue-600 shrink-0 mt-0.5" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.skills && opportunity.skills.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                  Required Competencies & Tools
                </h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0 shadow-xs">
                  <Building2 size={22} className="text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{opportunity.company}</span>
                    <ShieldCheck size={14} className="text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Verified Industry Partner · Equal Opportunity Employer
                  </p>
                </div>
              </div>

              {opportunity.company_website && (
                <a
                  href={opportunity.company_website.startsWith('http') ? opportunity.company_website : `https://${opportunity.company_website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl bg-white border border-slate-200 transition-colors shrink-0 shadow-xs"
                >
                  <span>Company Portal</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              {/* Recruiter / Company Identity Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xs mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    {opportunity.hiring_mode === 'INDIVIDUAL' ? 'Hiring Recruiter' : 'Enterprise Partner'}
                  </span>
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white truncate">
                  {opportunity.hiring_display_name || opportunity.company}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {opportunity.hiring_mode === 'INDIVIDUAL'
                    ? 'Direct candidate review with verified anti-cheat scoring.'
                    : 'Institutional enterprise recruitment partner.'}
                </p>
                <button
                  type="button"
                  onClick={() => onViewRecruiter?.(opportunity)}
                  className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>View Recruiter Profile</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {isAcademician && isAdvisoryView ? 'Market Demand Overview' : isAcademician ? 'Domain Alignment' : 'Match Analysis'}
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 tabular-nums">
                  {matchPercent}% {isAcademician ? 'Fit' : 'Match'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`transition-all duration-700 ease-out ${isAcademician ? 'text-indigo-600' : 'text-blue-600'}`}
                      strokeDasharray={`${Math.min(100, Math.max(5, matchPercent))}, 100`}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{matchPercent}%</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isAcademician && isAdvisoryView ? 'Placement Benchmark' : isAcademician ? 'Institutional Alignment' : 'Candidate Fit Score'}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {isAcademician && isAdvisoryView 
                      ? 'Industry qualification threshold for student applicants'
                      : isAcademician 
                      ? 'Based on department specializations and research focus' 
                      : 'Based on verified skills and project experience'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    {isAcademician ? 'Target Competencies' : 'Verified Competencies'}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {candidateSkillsPresent.map((skill, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-700 font-medium p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                        <span className="text-xs">{skill}</span>
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {candidateSkillsGaps.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      {isAcademician ? 'Additional Areas' : 'Growth Skill Gaps'}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {candidateSkillsGaps.map((skill, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-600 font-medium p-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
                          <span className="text-xs">{skill}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Elective</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isAcademician && isAdvisoryView ? (
                <div className="w-full py-3 px-4 text-xs font-semibold rounded-2xl bg-slate-100 text-slate-600 border border-slate-200 text-center flex items-center justify-center gap-2">
                  <ShieldCheck size={16} className="text-slate-500" />
                  <span>Read-Only: Student Opportunity</span>
                </div>
              ) : isAcademician ? (
                <button
                  type="button"
                  onClick={() => onExpressInterest ? onExpressInterest(opportunity) : handleApply()}
                  disabled={applied || isApplying}
                  className={`w-full py-3 text-sm font-semibold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    applied
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Submitting...</span>
                    </>
                  ) : applied ? (
                    <>
                      <Check size={16} />
                      <span>Interest Submitted</span>
                    </>
                  ) : (
                    <>
                      <span>Express Interest</span>
                      <ArrowUpRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applied || isApplying}
                  className={`w-full py-3 text-sm font-semibold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    applied
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Submitting...</span>
                    </>
                  ) : applied ? (
                    <>
                      <Check size={16} />
                      <span>Application Active</span>
                    </>
                  ) : (
                    <>
                      <span>Apply with 1-Click Profile</span>
                      <ArrowUpRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 text-xs text-slate-600 space-y-3">
              <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Sparkles size={14} className={isAcademician ? 'text-indigo-600' : 'text-blue-600'} />
                <span>{isAcademician ? 'Institutional Collaboration' : 'Skill Verification'}</span>
              </span>
              <p className="leading-relaxed font-normal">
                {isAcademician && isAdvisoryView
                  ? 'Review industry demand and compensation trends to advise students.'
                  : isAcademician
                  ? 'Submit a Statement of Purpose to explore collaborative faculty and research initiatives.'
                  : 'Applying attaches your verified skills, projects, and credentials.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OpportunityDetails;