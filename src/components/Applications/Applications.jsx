import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Video,
  Award,
  Plus,
  X,
  Loader2,
  Check,
  Users,
  UserCheck,
  ShieldCheck,
  User,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import apiClient from '../../api/client';
import authService from '../../api/auth';
import StudentPortfolio from '../Uploading/StudentPortfolio';
import RecruiterPublicProfile from '../Profile/RecruiterPublicProfile';

const getCompanyInitials = (name = '') => {
  if (!name) return 'SS';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
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
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const STAGE_CONFIG = {
  APPLIED: { label: 'Applied', color: 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/40', desc: 'Application received by recruiter' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-transparent text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40', desc: 'Profile and test scores under evaluation' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-transparent text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-500/40', desc: 'Candidate advanced to interview pool' },
  INTERVIEW: { label: 'Interview Scheduled', color: 'bg-transparent text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/40', desc: 'Technical or architectural discussion' },
  OFFERED: { label: 'Offer Received', color: 'bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40', desc: 'Offer letter extended to candidate' },
  REJECTED: { label: 'Archived / Rejected', color: 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700', desc: 'Position filled or candidate not selected' },
};

const Applications = ({ onRouteChange }) => {
  const currentUser = authService.getUser();
  const isRecruiter = currentUser?.role === 'industry' || currentUser?.role === 'recruiter' || currentUser?.backend_role === 'RECRUITER';

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTimelines, setExpandedTimelines] = useState({});

  // Recruiter specific state
  const [viewingCandidateId, setViewingCandidateId] = useState(null);
  const [interviewModalTarget, setInterviewModalTarget] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ interview_date: '', note: '' });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Student specific state
  const [milestoneTarget, setMilestoneTarget] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    week_number: 1,
    milestone_summary: '',
    hours_worked: 40,
    deliverables_url: ''
  });
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [viewingRecruiterTarget, setViewingRecruiterTarget] = useState(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      if (isRecruiter) {
        const res = await apiClient.get('/applications/pipeline');
        setApplications(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await apiClient.get('/students/applications');
        setApplications(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [isRecruiter]);

  // Recruiter status counts
  const recruiterCounts = useMemo(() => {
    const res = {
      all: applications.length,
      shortlisted: 0,
      underReview: 0,
      interview: 0,
      offered: 0,
      rejected: 0,
      applied: 0,
    };
    applications.forEach((app) => {
      const s = app.status;
      if (s === 'SHORTLISTED') res.shortlisted += 1;
      else if (s === 'UNDER_REVIEW') res.underReview += 1;
      else if (s === 'INTERVIEW') res.interview += 1;
      else if (s === 'OFFERED') res.offered += 1;
      else if (s === 'REJECTED') res.rejected += 1;
      else if (s === 'APPLIED') res.applied += 1;
    });
    return res;
  }, [applications]);

  // Student status counts
  const studentCounts = useMemo(() => {
    const res = {
      all: applications.length,
      active: 0,
      interviews: 0,
      offers: 0,
      rejected: 0
    };
    applications.forEach((app) => {
      const s = app.status;
      if (s === 'APPLIED' || s === 'UNDER_REVIEW' || s === 'SHORTLISTED') res.active += 1;
      if (s === 'INTERVIEW') res.interviews += 1;
      if (s === 'OFFERED') res.offers += 1;
      if (s === 'REJECTED') res.rejected += 1;
    });
    return res;
  }, [applications]);

  // Recruiter status transition handler
  const handleUpdateStatus = async (appId, newStatus, extraData = {}) => {
    setIsUpdatingStatus(true);
    try {
      const payload = {
        status: newStatus,
        note: extraData.note || `Transitioned to ${newStatus.replace('_', ' ').toLowerCase()}`,
        interview_date: extraData.interview_date || undefined
      };
      await apiClient.post(`/applications/${appId}/status`, payload);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus, ...extraData } : app))
      );
      setActionNotice({ type: 'success', message: `Candidate stage updated to ${newStatus.replace('_', ' ')}` });
      if (interviewModalTarget) setInterviewModalTarget(null);
    } catch (err) {
      setActionNotice({ type: 'error', message: err?.response?.data?.message || 'Failed to update candidate status' });
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const s = app.status;

      if (isRecruiter) {
        if (statusFilter !== 'ALL' && s !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const student = app.student || {};
          const matchName = (student.username || '').toLowerCase().includes(q);
          const matchInst = (student.institution || '').toLowerCase().includes(q);
          const matchTitle = (app.listing_title || '').toLowerCase().includes(q);
          const skills = Object.keys(student.skills_matrix || {});
          const matchSkills = skills.some((k) => k.toLowerCase().includes(q));
          if (!matchName && !matchInst && !matchTitle && !matchSkills) return false;
        }
      } else {
        if (statusFilter === 'ACTIVE' && !['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(s)) return false;
        if (statusFilter === 'INTERVIEWS' && s !== 'INTERVIEW') return false;
        if (statusFilter === 'OFFERS' && s !== 'OFFERED') return false;
        if (statusFilter === 'REJECTED' && s !== 'REJECTED') return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (app.listing_title || app.listing?.title || '').toLowerCase().includes(q);
          const matchCompany = (app.company_name || app.listing?.company_name || '').toLowerCase().includes(q);
          const matchLocation = (app.location || app.listing?.location || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchLocation) return false;
        }
      }
      return true;
    });
  }, [applications, statusFilter, searchQuery, isRecruiter]);

  const toggleTimeline = (id) => {
    setExpandedTimelines((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneTarget) return;
    setIsSubmittingMilestone(true);
    try {
      await apiClient.post(`/students/internships/${milestoneTarget.id}/log-milestone`, {
        week_number: parseInt(milestoneForm.week_number, 10),
        milestone_summary: milestoneForm.milestone_summary,
        hours_worked: parseFloat(milestoneForm.hours_worked),
        deliverables_url: milestoneForm.deliverables_url
      });
      setActionNotice({ type: 'success', message: 'Milestone progress recorded successfully' });
      setMilestoneTarget(null);
      setMilestoneForm({ week_number: 1, milestone_summary: '', hours_worked: 40, deliverables_url: '' });
      fetchApplications();
    } catch {
      setActionNotice({ type: 'error', message: 'Failed to record milestone. Please try again.' });
    } finally {
      setIsSubmittingMilestone(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // If viewing candidate profile full page
  if (viewingCandidateId) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA]">
        <Navbar onRouteChange={onRouteChange} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <StudentPortfolio
            studentId={viewingCandidateId}
            blind={false}
            onBack={() => setViewingCandidateId(null)}
            onRouteChange={onRouteChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mt-20 mx-auto p-4 sm:p-6 min-h-screen">
      <Navbar onRouteChange={onRouteChange} />

      {/* Hero Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-900/50 shadow-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-indigo-200 mb-2.5">
              {isRecruiter ? <Users size={13} className="text-emerald-400" /> : <Briefcase size={13} className="text-blue-400" />}
              <span>{isRecruiter ? 'Enterprise Recruiter Pipeline' : 'Candidate Career Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isRecruiter ? 'Candidate Applications & Review Pipeline' : 'My Job & Internship Applications'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {isRecruiter
                ? "Track and advance candidates across your company's listings. Review verified skills, shortlist candidates, and schedule technical interviews."
                : 'Track your recruitment pipeline in real time. Review submission audits, scheduled interviews, mentor evaluations, and official offers.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchApplications}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw size={13} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange(isRecruiter ? 'post-jobs' : 'opportunities')}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
            >
              {isRecruiter ? 'Manage Postings' : 'Explore More Jobs'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Toast Notice */}
      {actionNotice && (
        <div
          className={`mb-6 p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in duration-150 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionNotice.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* KPI Counters Bar */}
      {isRecruiter ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-7">
          {[
            { key: 'ALL', label: 'Total Candidates', count: recruiterCounts.all, color: 'text-slate-900' },
            { key: 'SHORTLISTED', label: 'Shortlisted', count: recruiterCounts.shortlisted, color: 'text-purple-600' },
            { key: 'UNDER_REVIEW', label: 'Under Review', count: recruiterCounts.underReview, color: 'text-amber-600' },
            { key: 'INTERVIEW', label: 'In Interview', count: recruiterCounts.interview, color: 'text-indigo-600' },
            { key: 'OFFERED', label: 'Offered', count: recruiterCounts.offered, color: 'text-emerald-600' },
            { key: 'REJECTED', label: 'Rejected', count: recruiterCounts.rejected, color: 'text-rose-600' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`p-4 bg-white border rounded-2xl text-left transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                statusFilter === item.key ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{item.label}</span>
              <span className={`text-2xl font-bold mt-1 block tabular-nums ${item.color}`}>{item.count}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-7">
          {[
            { key: 'ALL', label: 'All Applications', count: studentCounts.all },
            { key: 'ACTIVE', label: 'Active Pipeline', count: studentCounts.active },
            { key: 'INTERVIEWS', label: 'Interviews', count: studentCounts.interviews },
            { key: 'OFFERS', label: 'Offer Letters', count: studentCounts.offers },
            { key: 'REJECTED', label: 'Archived', count: studentCounts.rejected },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`p-4 bg-white border rounded-2xl text-left transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                statusFilter === item.key ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{item.label}</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">{item.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(isRecruiter
            ? [
                { id: 'ALL', label: 'All Stages' },
                { id: 'SHORTLISTED', label: 'Shortlisted' },
                { id: 'UNDER_REVIEW', label: 'Under Review' },
                { id: 'INTERVIEW', label: 'Interview' },
                { id: 'OFFERED', label: 'Offered' },
                { id: 'REJECTED', label: 'Rejected' },
                { id: 'APPLIED', label: 'Applied' },
              ]
            : [
                { id: 'ALL', label: 'All' },
                { id: 'ACTIVE', label: 'Active Pipeline' },
                { id: 'INTERVIEWS', label: 'Interviews' },
                { id: 'OFFERS', label: 'Offers' },
                { id: 'REJECTED', label: 'Archived' },
              ]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRecruiter ? 'Filter candidate, role, skill...' : 'Filter by role, company, location...'}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2.5" />
          <p className="text-xs font-semibold text-slate-600">Loading candidate applications and stages...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <Briefcase size={36} className="mx-auto text-slate-300 mb-2.5" />
          <p className="text-sm font-bold text-slate-800">No applications match your criteria</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isRecruiter
              ? 'Candidates will appear here once they apply to company listings or are shortlisted.'
              : 'Explore open roles and submit verified applications to start your hiring process.'}
          </p>
        </div>
      ) : isRecruiter ? (
        /* Recruiter Candidate Pipeline View */
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const student = app.student || {};
            const candidateName = student.username || `Candidate #${student.id || app.id}`;
            const studentId = student.student_profile_id || student.id;
            const initials = getCompanyInitials(candidateName);
            const stageConfig = STAGE_CONFIG[app.status] || STAGE_CONFIG.APPLIED;
            const matchScore = Math.round((app.match_score || 0) * 100);
            const skills = Object.keys(student.skills_matrix || {});

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 sm:p-6 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Candidate Information */}
                <div className="flex items-start gap-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => studentId && setViewingCandidateId(studentId)}
                    className={`w-12 h-12 rounded-2xl font-bold text-sm flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:opacity-90 transition-opacity ${getCompanyAvatarColor(candidateName)}`}
                    title="View Candidate Dossier"
                  >
                    {initials}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => studentId && setViewingCandidateId(studentId)}
                        className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer text-left"
                      >
                        {candidateName}
                      </button>

                      {student.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <ShieldCheck size={11} className="text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      )}

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stageConfig.color}`}>
                        {stageConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 flex-wrap">
                      {student.institution && (
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} className="text-slate-400" />
                          <span>{student.institution}</span>
                        </span>
                      )}
                      {student.department && <span>· {student.department}</span>}
                      {student.current_designation && <span>· {student.current_designation}</span>}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                      <span>Applied Role: <strong className="text-slate-800 font-semibold">{app.listing_title}</strong></span>
                      {app.interview_date && (
                        <span className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Interview: {new Date(app.interview_date).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {skills.slice(0, 5).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-medium text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 5 && (
                          <span className="text-[10px] text-slate-400 font-medium self-center">
                            +{skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Match & Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 justify-between lg:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Fitment Match</span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">{matchScore}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => studentId && setViewingCandidateId(studentId)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <User size={13} />
                      <span>Full Dossier</span>
                    </button>

                    {/* Quick Stage Action Buttons */}
                    {app.status !== 'SHORTLISTED' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 border border-purple-200"
                        title="Shortlist candidate"
                      >
                        <UserCheck size={13} />
                        <span>Shortlist</span>
                      </button>
                    )}

                    {app.status !== 'INTERVIEW' && (
                      <button
                        type="button"
                        onClick={() => {
                          setInterviewModalTarget(app);
                          setInterviewForm({ interview_date: '', note: '' });
                        }}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 border border-indigo-200"
                        title="Schedule interview"
                      >
                        <Calendar size={13} />
                        <span>Interview</span>
                      </button>
                    )}

                    {app.status !== 'OFFERED' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(app.id, 'OFFERED')}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 border border-emerald-200"
                        title="Extend offer letter"
                      >
                        <CheckCircle2 size={13} />
                        <span>Offer</span>
                      </button>
                    )}

                    {app.status !== 'REJECTED' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="px-2.5 py-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 font-semibold text-xs rounded-xl transition-all cursor-pointer active:scale-95 border border-slate-200"
                        title="Reject candidate"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Student Applications View */
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const companyName = app.company_name || app.listing?.company_name || 'Partner Company';
            const listingTitle = app.listing_title || app.listing?.title || 'Open Position';
            const initials = getCompanyInitials(companyName);
            const avatarColor = getCompanyAvatarColor(companyName);
            const stage = STAGE_CONFIG[app.status] || STAGE_CONFIG.APPLIED;
            const isTimelineOpen = Boolean(expandedTimelines[app.id]);
            const canLogMilestone = app.status === 'OFFERED' || app.internship_status === 'IN_PROGRESS';

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 sm:p-6 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ${avatarColor}`}>
                      {initials}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{listingTitle}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stage.color}`}>
                          {stage.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setViewingRecruiterTarget({
                            recruiterId: app.recruiter_id || app.listing?.recruiter_id,
                            companyId: app.company_id || app.listing?.company_id,
                            name: app.hiring_display_name || companyName
                          })}
                          className="font-semibold text-slate-700 hover:text-indigo-600 underline-offset-2 hover:underline cursor-pointer flex items-center gap-1 text-left"
                          title={`View ${app.hiring_display_name || companyName} profile`}
                        >
                          <Building2 size={12} className="text-slate-400" />
                          <span>{app.hiring_display_name || companyName}</span>
                        </button>
                        {app.location ? <span>· {app.location}</span> : ''}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                        <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                        {app.match_score && (
                          <span>Fitment Match: <strong className="text-slate-700 font-bold">{Math.round(app.match_score * 100)}%</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    {canLogMilestone && (
                      <button
                        type="button"
                        onClick={() => setMilestoneTarget(app)}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-emerald-200 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Plus size={13} />
                        <span>Log Milestone</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleTimeline(app.id)}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-xs"
                    >
                      <span>Stage Timeline</span>
                      {isTimelineOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Timeline Dropdown */}
                {isTimelineOpen && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-700">Application Stage Progress</p>
                    <div className="space-y-2">
                      {(app.status_history && app.status_history.length > 0 ? app.status_history : [{ status: app.status, timestamp: app.created_at, note: 'Current Stage' }]).map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                          <div>
                            <span className="font-semibold text-slate-900">{h.status?.replace('_', ' ')}</span>
                            {h.timestamp && (
                              <span className="text-slate-400 text-[11px] ml-2">({new Date(h.timestamp).toLocaleString()})</span>
                            )}
                            {h.note && <p className="text-slate-500 text-[11px] mt-0.5">{h.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recruiter Schedule Interview Modal */}
      {interviewModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Schedule Interview Viva</h3>
                  <p className="text-[11px] text-slate-500">
                    Candidate: {interviewModalTarget.student?.username || `Candidate #${interviewModalTarget.student?.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModalTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateStatus(interviewModalTarget.id, 'INTERVIEW', {
                  interview_date: interviewForm.interview_date,
                  note: interviewForm.note || 'Technical interview viva scheduled'
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.interview_date}
                  onChange={(e) => setInterviewForm((prev) => ({ ...prev, interview_date: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interview Instructions / Agenda</label>
                <textarea
                  rows={3}
                  value={interviewForm.note}
                  onChange={(e) => setInterviewForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="e.g. 45-minute technical architecture discussion and live viva. Please join via web meeting link."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInterviewModalTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingStatus ? <Loader2 size={13} className="animate-spin" /> : <Calendar size={13} />}
                  <span>Schedule & Notify</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Milestone Modal */}
      {milestoneTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Internship Milestone</h3>
                  <p className="text-[11px] text-slate-500">Log weekly progress for supervisor evaluation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMilestoneTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMilestoneSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Week Number</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    required
                    value={milestoneForm.week_number}
                    onChange={(e) => setMilestoneForm((prev) => ({ ...prev, week_number: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    required
                    value={milestoneForm.hours_worked}
                    onChange={(e) => setMilestoneForm((prev) => ({ ...prev, hours_worked: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Summary</label>
                <textarea
                  required
                  rows={3}
                  value={milestoneForm.milestone_summary}
                  onChange={(e) => setMilestoneForm((prev) => ({ ...prev, milestone_summary: e.target.value }))}
                  placeholder="Key features implemented, test suites passing, bugs addressed..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deliverables Repository URL</label>
                <input
                  type="url"
                  required
                  value={milestoneForm.deliverables_url}
                  onChange={(e) => setMilestoneForm((prev) => ({ ...prev, deliverables_url: e.target.value }))}
                  placeholder="https://github.com/org/repo/pull/42"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMilestoneTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMilestone}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingMilestone ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Record Milestone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewingRecruiterTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <RecruiterPublicProfile
            recruiterId={viewingRecruiterTarget.recruiterId}
            companyId={viewingRecruiterTarget.companyId}
            isModal={true}
            onClose={() => setViewingRecruiterTarget(null)}
            onRouteChange={onRouteChange}
          />
        </div>
      )}
    </div>
  );
};

export default Applications;
