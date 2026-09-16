import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
  Globe,
  Award,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Share2
} from 'lucide-react';
import apiClient from '../../api/client';

const Linkedin = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const getInitials = (name = '') => {
  if (!name) return 'RP';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name = '') => {
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
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const RecruiterPublicProfile = ({
  recruiterId,
  companyId,
  onClose,
  onRouteChange,
  onSelectOpportunity,
  isModal = false
}) => {
  const [profile, setProfile] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('openings'); // openings | company | about
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (recruiterId) {
          const res = await apiClient.get(`/recruiters/${recruiterId}/public-profile`);
          setProfile(res.data);
          if (res.data.company?.id) {
            try {
              const compRes = await apiClient.get(`/recruiters/companies/${res.data.company.id}/public-profile`);
              setCompanyDetails(compRes.data);
            } catch {
              // fallback to embedded company
              setCompanyDetails(res.data.company);
            }
          }
        } else if (companyId) {
          const compRes = await apiClient.get(`/recruiters/companies/${companyId}/public-profile`);
          setCompanyDetails(compRes.data);
          // synthesize profile wrapper from company data
          setProfile({
            id: null,
            name: compRes.data.name,
            designation: 'Enterprise Partner Organization',
            bio: compRes.data.description || 'Verified hiring partner on Skill Setu.',
            location: compRes.data.headquarters || 'India',
            website: compRes.data.website || '',
            company: compRes.data,
            active_jobs: compRes.data.active_jobs || [],
            total_openings: compRes.data.total_active_jobs || 0,
            total_placements: compRes.data.total_placements || 12,
            is_verified: compRes.data.is_verified,
            hiring_mode_preference: 'COMPANY',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load recruiter profile.');
      } finally {
        setIsLoading(false);
      }
    };

    if (recruiterId || companyId) {
      fetchProfileData();
    }
  }, [recruiterId, companyId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleJobClick = (job) => {
    if (onSelectOpportunity) {
      onSelectOpportunity(job);
      if (onClose) onClose();
    } else if (onRouteChange) {
      onRouteChange('opportunities', { selectedId: job.id });
      if (onClose) onClose();
    }
  };

  if (isLoading) {
    return (
      <div className={`${isModal ? 'p-8 max-w-4xl mx-auto' : 'max-w-5xl mx-auto px-4 py-12'} flex flex-col items-center justify-center min-h-[400px]`}>
        <Loader2 size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading recruiter & verified company portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`${isModal ? 'p-8 max-w-xl mx-auto' : 'max-w-xl mx-auto px-4 py-16'} text-center`}>
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Building2 size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Profile Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'This recruiter or organization profile is currently unavailable.'}</p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRouteChange ? onRouteChange('opportunities') : window.history.back()}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            Back to Opportunities
          </button>
        )}
      </div>
    );
  }

  const isIndividual = profile.hiring_mode_preference === 'INDIVIDUAL' || profile.hiring_mode === 'INDIVIDUAL';
  const displayName = profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Recruiter';
  const compName = profile.company?.name || companyDetails?.name || 'Independent Partner';
  const avatarColor = getAvatarColor(displayName);
  const initials = getInitials(displayName);
  const activeJobs = profile.active_jobs || companyDetails?.active_jobs || [];

  return (
    <div className={`relative ${isModal ? 'w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 max-h-[92vh] flex flex-col' : 'max-w-6xl mx-auto px-4 sm:px-6 py-6'}`}>
      
      {/* Top Banner Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shrink-0">
        {/* Action Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer text-xs flex items-center gap-1.5"
            title="Share recruiter link"
          >
            <Share2 size={14} />
            {copiedLink && <span className="text-[11px] font-bold text-emerald-300">Copied!</span>}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              title="Close modal"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {!isModal && (
          <button
            type="button"
            onClick={() => onRouteChange ? onRouteChange('opportunities') : window.history.back()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-semibold mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Opportunities</span>
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar / Brand Logo */}
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
              />
            ) : (
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${avatarColor} flex items-center justify-center font-extrabold text-2xl sm:text-3xl border-2 border-white/20 shadow-xl select-none`}>
                {initials}
              </div>
            )}
            {profile.is_verified && (
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow-md" title="Verified Recruiter / Partner">
                <ShieldCheck size={14} />
              </div>
            )}
          </div>

          {/* Core Recruiter & Company Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <Sparkles size={11} className="text-indigo-300" />
                {isIndividual ? 'Independent Recruiter' : 'Enterprise Recruiter'}
              </span>

              {profile.is_verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  Verified Hiring Authority
                </span>
              )}

              {profile.department && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {profile.department}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>{displayName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{profile.designation || 'Technical Recruiter'}</span>
              {compName && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Building2 size={13} className="text-indigo-300" />
                    {compName}
                  </span>
                </>
              )}
              {profile.location && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin size={12} />
                    {profile.location}
                  </span>
                </>
              )}
            </p>

            {/* Social & Contact Links */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-xs font-semibold text-blue-200 transition-all cursor-pointer"
                >
                  <Linkedin size={12} />
                  <span>LinkedIn Profile</span>
                  <ExternalLink size={10} />
                </a>
              )}

              {(profile.website || profile.company?.website) && (
                <a
                  href={(profile.website || profile.company?.website).startsWith('http') ? (profile.website || profile.company?.website) : `https://${profile.website || profile.company?.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                >
                  <Globe size={12} />
                  <span>Website</span>
                  <ExternalLink size={10} />
                </a>
              )}

              {profile.experience_years > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                  <Clock size={12} className="text-slate-400" />
                  <span>{profile.experience_years} Years Industry Exp</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Hiring KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 shrink-0 bg-white/5 p-3 rounded-2xl border border-white/10 min-w-[150px]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Active Openings</span>
              <span className="text-xl font-black text-white tabular-nums">{profile.total_openings || activeJobs.length}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Talent Placed</span>
              <span className="text-xl font-black text-emerald-400 tabular-nums">{profile.total_placements || 14}+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: 'openings', label: `Active Openings (${activeJobs.length})`, icon: Briefcase },
            { id: 'about', label: 'Recruiter Bio & Focus', icon: Award },
            { id: 'company', label: 'Company Overview', icon: Building2 },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon size={13} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-6">
        
        {/* TAB 1: ACTIVE OPENINGS */}
        {activeTab === 'openings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Current Job & Internship Postings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct openings managed by {displayName}. Apply with verified cognitive test credentials.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {activeJobs.length} Active Listings
              </span>
            </div>

            {activeJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/60 p-6">
                <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No active postings right now</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  This recruiter has filled their active requisitions. Check back soon for upcoming campus drives.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeJobs.map((job) => {
                  const deadlineStr = job.application_deadline
                    ? new Date(job.application_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Rolling';
                  const reqSkills = job.required_skills || [];

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                              {job.role_type?.replace('_', ' ') || 'Full-Time'}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors">
                              {job.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <MapPin size={11} className="text-slate-400" />
                              <span>{job.location || 'Remote'}</span>
                              {job.is_remote && <span className="font-semibold text-emerald-600">(Remote)</span>}
                            </p>
                          </div>

                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 shrink-0">
                            {job.stipend_or_ctc}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                          {job.description || 'Join this high-impact engineering team solving scalable challenges.'}
                        </p>

                        {/* Skills */}
                        {reqSkills.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mb-4">
                            {reqSkills.slice(0, 4).map((sk, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                              >
                                {sk}
                              </span>
                            ))}
                            {reqSkills.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{reqSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Calendar size={12} />
                          <span>Deadline: {deadlineStr}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleJobClick(job)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                        >
                          <span>View & Apply</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECRUITER BIO & ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/70">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Award size={16} className="text-indigo-600" />
                <span>Executive Bio & Talent Philosophy</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {profile.bio || `${displayName} is an authorized talent acquisition partner hiring for ${compName}. Committed to merit-based, anti-cheat verified screening and fast-tracking candidates demonstrating authentic project proficiency.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Designation & Department</span>
                <p className="text-sm font-bold text-slate-900">{profile.designation || 'Recruitment Lead'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{profile.department || 'Technical Talent Acquisition'}</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hiring Preference</span>
                <p className="text-sm font-bold text-slate-900">
                  {isIndividual ? 'Independent Recruiter' : 'Enterprise Representation'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isIndividual ? 'Authorized to hire across independent and cross-enterprise requisitions.' : `Hiring directly for ${compName}.`}
                </p>
              </div>
            </div>

            <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Verified Platform Authority</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  Candidate applications to this recruiter are protected by row-level ACID concurrency and instant snapshot verification. Direct messages and interview notifications are dispatched in real-time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPANY OVERVIEW */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            {profile.company || companyDetails ? (
              <>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm select-none">
                      {getInitials(compName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{compName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <ShieldCheck size={10} /> Verified Partner
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{companyDetails?.industry_name || profile.company?.industry_name || 'Technology & Engineering'}</span>
                        <span>·</span>
                        <span>HQ: {companyDetails?.headquarters || profile.company?.headquarters || 'India'}</span>
                      </p>
                    </div>
                  </div>

                  {(profile.company?.website || companyDetails?.website) && (
                    <a
                      href={(profile.company?.website || companyDetails?.website).startsWith('http') ? (profile.company?.website || companyDetails?.website) : `https://${profile.company?.website || companyDetails?.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                    >
                      <Globe size={13} />
                      <span>Visit Company Site</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">About the Organization</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {companyDetails?.description || profile.company?.description || `${compName} is a verified enterprise partner hiring students and experienced candidates through Skill Setu.`}
                  </p>
                </div>

                {companyDetails?.team && companyDetails.team.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Recruitment Team Members</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {companyDetails.team.map((member) => (
                        <div key={member.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{member.designation || 'Recruiter'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <Building2 size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">No corporate entity details attached. Recruiter operates independently.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Footer */}
      {isModal && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Powered by Skill Setu Verified Talent Pipeline
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Close Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default RecruiterPublicProfile;
