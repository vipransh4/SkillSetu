import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  X, 
  Phone, 
  Users, 
  Shield, 
  Award, 
  Star, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles, 
  MapPin, 
  Check,
  RotateCcw,
  User,
  Building2,
  Edit3,
  ExternalLink,
  Globe
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import VideoCall from '../Video/VideoCall';
import StudentPortfolio from './StudentPortfolio';
import RecruiterPublicProfile from '../Profile/RecruiterPublicProfile';
import apiClient from '../../api/client';

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

const APPLICATION_STAGES = [
  { key: 'APPLIED', label: 'Applied', color: 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/40' },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-transparent text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-transparent text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-500/40' },
  { key: 'INTERVIEW', label: 'Interview', color: 'bg-transparent text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/40' },
  { key: 'OFFERED', label: 'Offered', color: 'bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-transparent text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40' },
];

const Industry = ({ onRouteChange, scheduledCalls = [], onScheduleCall }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPreviewingProfile, setIsPreviewingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [profileEditForm, setProfileEditForm] = useState({
    designation: '',
    department: '',
    contact_phone: '',
    bio: '',
    linkedin_url: '',
    website: '',
    location: '',
    experience_years: 0,
    hiring_mode_preference: 'COMPANY',
  });

  const [formData, setFormData] = useState({
    title: '',
    role_type: 'INTERNSHIP',
    location: 'Bengaluru (Hybrid)',
    is_remote: false,
    stipend_or_ctc: '₹25,000 / month',
    open_positions: 2,
    tenure: '6 Months',
    skills: 'Python, React, PostgreSQL',
    description: '',
    application_deadline: '',
    min_nheqf_level: 'LEVEL_6_0',
    hiring_mode: 'COMPANY',
  });
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [notification, setNotification] = useState(null);

  const [activeReviewJob, setActiveReviewJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [isBlindScreening, setIsBlindScreening] = useState(false);
  const [reviewConflictMessage, setReviewConflictMessage] = useState(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
  const [viewingCandidateId, setViewingCandidateId] = useState(null);
  const [expandedSkillsAppIds, setExpandedSkillsAppIds] = useState({});

  const [selectedApplicationForStage, setSelectedApplicationForStage] = useState(null);
  const [stageTransitionForm, setStageTransitionForm] = useState({
    targetStatus: '',
    note: '',
    interviewDate: '',
  });

  const [mentorEvaluationTarget, setMentorEvaluationTarget] = useState(null);
  const [mentorForm, setMentorForm] = useState({
    internship_status: 'IN_PROGRESS',
    mentor_name: 'Lead Technical Architect',
    mentor_designation: 'Staff Engineering Mentor',
    mentor_feedback: '',
    mentor_rating: 5,
    completion_certificate_url: '',
  });
  const [isSubmittingMentor, setIsSubmittingMentor] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    candidateName: '',
    scheduledTime: '',
  });

  const [activeCallRoom, setActiveCallRoom] = useState(null);
  const [activeCallJobTitle, setActiveCallJobTitle] = useState('');

  const [pipelineApps, setPipelineApps] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('ALL');
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
  const [pipelineNominateTarget, setPipelineNominateTarget] = useState(null);
  const [pipelineStatusUpdating, setPipelineStatusUpdating] = useState(null);

  const fetchRecruiterProfile = async () => {
    try {
      const res = await apiClient.get('/recruiters/me');
      if (res.data) {
        setRecruiterProfile(res.data);
        setFormData((prev) => ({
          ...prev,
          hiring_mode: res.data.hiring_mode_preference || 'COMPANY',
        }));
        setProfileEditForm({
          designation: res.data.designation || '',
          department: res.data.department || '',
          contact_phone: res.data.contact_phone || '',
          bio: res.data.bio || '',
          linkedin_url: res.data.linkedin_url || '',
          website: res.data.website || '',
          location: res.data.location || '',
          experience_years: res.data.experience_years || 0,
          hiring_mode_preference: res.data.hiring_mode_preference || 'COMPANY',
        });
      }
    } catch {
      // ignore
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await apiClient.put('/recruiters/me', {
        designation: profileEditForm.designation.trim(),
        department: profileEditForm.department.trim(),
        contact_phone: profileEditForm.contact_phone.trim(),
        bio: profileEditForm.bio.trim(),
        linkedin_url: profileEditForm.linkedin_url.trim(),
        website: profileEditForm.website.trim(),
        location: profileEditForm.location.trim(),
        experience_years: parseFloat(profileEditForm.experience_years) || 0,
        hiring_mode_preference: profileEditForm.hiring_mode_preference,
      });
      setRecruiterProfile(res.data);
      setFormData((prev) => ({ ...prev, hiring_mode: res.data.hiring_mode_preference || 'COMPANY' }));
      setIsEditingProfile(false);
      setNotification({
        type: 'success',
        message: 'Recruiter profile and branding preferences successfully updated.',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fetchLiveCompanyListings = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await apiClient.get('/listings/my-listings');
      const data = Array.isArray(res.data) ? res.data : [];
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchLiveCompanyListings();
    fetchPipeline();
    fetchRecruiterProfile();
  }, []);

  const fetchPipeline = async (statusFilter) => {
    setIsLoadingPipeline(true);
    try {
      const params = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await apiClient.get(`/applications/pipeline${params}`);
      setPipelineApps(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPipelineApps([]);
    } finally {
      setIsLoadingPipeline(false);
    }
  };

  const handlePipelineStatusChange = (newStatus) => {
    setPipelineStatus(newStatus);
    fetchPipeline(newStatus);
  };

  const updatePipelineAppStatus = async (appId, newStatus) => {
    setPipelineStatusUpdating(appId);
    try {
      await apiClient.post(`/applications/${appId}/status`, { status: newStatus });
      fetchPipeline(pipelineStatus === 'ALL' ? null : pipelineStatus);
    } catch (err) {
      setNotification({ type: 'error', message: err?.response?.data?.message || 'Failed to update status.' });
    } finally {
      setPipelineStatusUpdating(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePublishJob = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmittingJob(true);
    setNotification(null);

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      role_type: formData.role_type,
      hiring_mode: formData.hiring_mode || 'COMPANY',
      stipend_or_ctc: formData.stipend_or_ctc.trim(),
      location: formData.location.trim(),
      is_remote: formData.is_remote,
      application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
      tenure: formData.tenure.trim(),
      open_positions: parseInt(formData.open_positions, 10) || 1,
      required_skills: skillsArray,
      eligibility_criteria: { min_cgpa: 7.0 },
      description: formData.description.trim() || `${formData.title} position at enterprise engineering partner.`,
      status: 'PUBLISHED',
      target_audience: 'STUDENT',
      min_nheqf_level: formData.min_nheqf_level,
    };

    try {
      const res = await apiClient.post('/listings/', payload);
      const createdListing = res.data;
      setJobs((prev) => [createdListing, ...prev]);
      setNotification({
        type: 'success',
        message: `Position '${createdListing.title}' successfully published to vector search and talent radar.`,
      });
      setFormData({
        title: '',
        role_type: 'INTERNSHIP',
        location: 'Bengaluru (Hybrid)',
        is_remote: false,
        stipend_or_ctc: '₹25,000 / month',
        open_positions: 2,
        tenure: '6 Months',
        skills: 'Python, React, PostgreSQL',
        description: '',
        application_deadline: '',
        min_nheqf_level: 'LEVEL_6_0',
      });
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to publish job opening. Please ensure you are logged in with recruiter permissions.';
      setNotification({
        type: 'error',
        message: errMsg,
      });
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleOpenApplicantReview = async (job, blindMode = false) => {
    setActiveReviewJob(job);
    setIsLoadingApplicants(true);
    setReviewConflictMessage(null);
    try {
      const res = await apiClient.get(`/applications/listings/${job.id}/applications?blind=${blindMode}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setApplicants(data);
    } catch {
      setApplicants([]);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleToggleBlindScreening = () => {
    const nextBlind = !isBlindScreening;
    setIsBlindScreening(nextBlind);
    if (activeReviewJob) {
      handleOpenApplicantReview(activeReviewJob, nextBlind);
    }
  };

  const initiateStageTransition = (application, targetStatus) => {
    setSelectedApplicationForStage(application);
    setStageTransitionForm({
      targetStatus,
      note: `Transitioning candidate to ${targetStatus.replace('_', ' ').toLowerCase()} stage.`,
      interviewDate: targetStatus === 'INTERVIEW' ? new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16) : '',
    });
  };

  const confirmStageTransition = async (e) => {
    e.preventDefault();
    if (!selectedApplicationForStage) return;

    setUpdatingApplicationId(selectedApplicationForStage.id);
    setReviewConflictMessage(null);

    const payload = {
      status: stageTransitionForm.targetStatus,
      note: stageTransitionForm.note.trim(),
      interview_date: stageTransitionForm.interviewDate ? new Date(stageTransitionForm.interviewDate).toISOString() : null,
    };

    try {
      const res = await apiClient.post(`/applications/${selectedApplicationForStage.id}/status`, payload);
      const updatedApp = res.data;
      setApplicants((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
      setSelectedApplicationForStage(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setReviewConflictMessage('Database row contention: Operation locked by another reviewer. Please retry.');
      } else {
        setReviewConflictMessage(err.response?.data?.message || 'Failed to update application status.');
      }
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const openMentorModal = (application) => {
    setMentorEvaluationTarget(application);
    setMentorForm({
      internship_status: application.internship_status && application.internship_status !== 'NOT_STARTED' ? application.internship_status : 'IN_PROGRESS',
      mentor_name: application.mentor_name || 'Industry Lead Mentor',
      mentor_designation: application.mentor_designation || 'Senior Technical Director',
      mentor_feedback: application.mentor_feedback || 'Demonstrated outstanding systems mastery and sprint delivery.',
      mentor_rating: application.mentor_rating || 5,
      completion_certificate_url: application.completion_certificate_url || 'https://skillsetu.in/credentials/cert-verified',
    });
  };

  const handleSubmitMentorProgress = async (e) => {
    e.preventDefault();
    if (!mentorEvaluationTarget) return;

    setIsSubmittingMentor(true);
    setReviewConflictMessage(null);

    const payload = {
      internship_status: mentorForm.internship_status,
      mentor_name: mentorForm.mentor_name.trim(),
      mentor_designation: mentorForm.mentor_designation.trim(),
      mentor_feedback: mentorForm.mentor_feedback.trim(),
      mentor_rating: parseFloat(mentorForm.mentor_rating) || 5.0,
      completion_certificate_url: mentorForm.completion_certificate_url.trim(),
    };

    try {
      const res = await apiClient.patch(`/applications/${mentorEvaluationTarget.id}/internship-progress`, payload);
      const updatedApp = res.data;
      setApplicants((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
      setMentorEvaluationTarget(null);
    } catch (err) {
      setReviewConflictMessage(err.response?.data?.message || 'Failed to record supervisor progress evaluation.');
    } finally {
      setIsSubmittingMentor(false);
    }
  };

  const openScheduleModal = (job) => {
    setScheduleTarget(job);
    setScheduleForm({ candidateName: '', scheduledTime: '' });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleForm.candidateName.trim() || !scheduleForm.scheduledTime) return;

    const newCall = {
      id: `call-${Date.now()}`,
      jobId: scheduleTarget.id,
      jobTitle: scheduleTarget.title,
      roomID: `call_${scheduleTarget.id}_${Date.now()}`,
      candidateName: scheduleForm.candidateName,
      scheduledTime: scheduleForm.scheduledTime,
    };

    if (onScheduleCall) {
      onScheduleCall(newCall);
    }

    setShowScheduleModal(false);
    setScheduleTarget(null);
  };

  const handleJoinCall = (call) => {
    setActiveCallRoom(call.roomID);
    setActiveCallJobTitle(call.jobTitle);
  };

  const getCallsForJob = (jobId) => {
    return scheduledCalls.filter((c) => String(c.jobId) === String(jobId));
  };

  if (activeCallRoom) {
    return (
      <VideoCall
        roomID={activeCallRoom}
        userID="recruiter_portal"
        userName="Corporate Recruiter"
        onLeave={() => {
          setActiveCallRoom(null);
          setActiveCallJobTitle('');
        }}
      />
    );
  }
  if (viewingCandidateId) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA]">
        <Navbar onRouteChange={onRouteChange} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <StudentPortfolio
            studentId={viewingCandidateId}
            blind={isBlindScreening}
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

      <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-900/50 shadow-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-indigo-200 mb-2">
              <Shield size={13} className="text-emerald-400" />
              <span>Enterprise Recruiter & Placement Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Recruitment Command Center</h1>
            <p className="text-sm text-slate-300 mt-1">Publish vectorized openings, review scored candidates, and manage supervised intern cohorts.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit3 size={13} />
              <span>Edit Recruiter Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewingProfile(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye size={13} />
              <span>Preview Public View</span>
            </button>

            <button
              type="button"
              onClick={() => {
                fetchLiveCompanyListings();
                fetchRecruiterProfile();
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {recruiterProfile && (
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {getCompanyInitials(recruiterProfile.first_name ? `${recruiterProfile.first_name} ${recruiterProfile.last_name || ''}`.trim() : recruiterProfile.username)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900">
                  {recruiterProfile.first_name ? `${recruiterProfile.first_name} ${recruiterProfile.last_name || ''}`.trim() : recruiterProfile.username}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Recruiter
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Default Mode: <strong className="text-indigo-600 font-bold">{recruiterProfile.hiring_mode_preference === 'INDIVIDUAL' ? 'Independent Recruiter (Self)' : 'Company Representation'}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {recruiterProfile.designation || 'Talent Partner'} · {recruiterProfile.company?.name || 'Partner Company'} {recruiterProfile.location ? `· ${recruiterProfile.location}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1 underline-offset-2 hover:underline"
            >
              <span>Manage Brand Settings</span>
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <AlertCircle size={18} className="text-rose-600 shrink-0" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="p-1 rounded-lg hover:bg-black/5 cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Active Postings & Talent Pipelines</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Live database listings synchronized with 384d vector search</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-100 tabular-nums">
              {jobs.length} Active Positions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Role & Scope</th>
                  <th className="py-3.5 px-4">Applicants</th>
                  <th className="py-3.5 px-4">Stipend</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingJobs ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                        <span>Synchronizing company listings...</span>
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Briefcase size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No listings found for your company</p>
                      <p className="text-xs text-slate-400 mt-0.5">Use the form on the right to publish your first vectorized opening.</p>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => {
                    const jobCalls = getCallsForJob(job.id);
                    return (
                      <React.Fragment key={job.id}>
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${getCompanyAvatarColor(job.title)}`}>
                                {getCompanyInitials(job.title)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-snug">{job.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span>{job.role_type?.replace('_', ' ')}</span>
                                  <span>·</span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin size={11} className="text-slate-400" />
                                    {job.location}
                                  </span>
                                  <span>·</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    job.hiring_mode === 'INDIVIDUAL'
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    Hiring As: {job.hiring_mode === 'INDIVIDUAL' ? (job.hiring_display_name || 'Recruiter') : (job.company_name || 'Company')}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-bold text-slate-900 tabular-nums">
                            {job.applications_count || 0}
                          </td>

                          <td className="py-4 px-4 text-xs font-semibold text-slate-700 tabular-nums">
                            {job.stipend_or_ctc}
                          </td>

                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              job.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {job.status === 'PUBLISHED' ? 'Live' : job.status}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenApplicantReview(job, isBlindScreening)}
                                className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 rounded-xl hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                              >
                                <Users size={13} />
                                <span>Pipeline</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openScheduleModal(job)}
                                className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/60 rounded-xl hover:bg-purple-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                                title="Schedule Interview Call"
                              >
                                <Video size={13} />
                                <span>Call</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {jobCalls.length > 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-3 bg-purple-50/30 border-t border-purple-100/50">
                              <div className="flex flex-col gap-2">
                                {jobCalls.map((call) => (
                                  <div
                                    key={call.id}
                                    className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-purple-100 shadow-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                                        <Phone size={14} />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-800">
                                          Interview Viva: {call.candidateName}
                                        </p>
                                        <p className="text-[11px] text-slate-500 tabular-nums">
                                          {new Date(call.scheduledTime).toLocaleString('en-IN', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleJoinCall(call)}
                                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                                    >
                                      <Video size={13} />
                                      <span>Join Session</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Post a New Opportunity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Dispatches real-time alerts to matching verified candidates</p>
          </div>

          <form onSubmit={handlePublishJob} className="flex flex-col gap-4">
            {/* Hiring Representation Selector */}
            <div className="flex flex-col gap-2 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-indigo-600" />
                  <span>Hiring Representation</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Shown on Job Cards
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hiring_mode: 'COMPANY' }))}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    formData.hiring_mode === 'COMPANY'
                      ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Building2 size={12} className="text-slate-500" />
                      Company
                    </span>
                    {formData.hiring_mode === 'COMPANY' && <Check size={12} className="text-indigo-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                    {recruiterProfile?.company?.name || 'Company Name'} & Logo
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hiring_mode: 'INDIVIDUAL' }))}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    formData.hiring_mode === 'INDIVIDUAL'
                      ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <User size={12} className="text-slate-500" />
                      Self (Recruiter)
                    </span>
                    {formData.hiring_mode === 'INDIVIDUAL' && <Check size={12} className="text-indigo-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                    {recruiterProfile?.first_name ? `${recruiterProfile.first_name} ${recruiterProfile.last_name || ''}`.trim() : recruiterProfile?.username || 'Your Name'} & Avatar
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Role Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g. Distributed Systems Engineer"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder-slate-400 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Role Type</label>
                <select
                  name="role_type"
                  value={formData.role_type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 transition-all cursor-pointer"
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="APPRENTICESHIP">Apprenticeship</option>
                  <option value="CONTRACT">Contract / Project</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="e.g. Bengaluru (Hybrid)"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder-slate-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Compensation / Stipend</label>
                <input
                  type="text"
                  name="stipend_or_ctc"
                  value={formData.stipend_or_ctc}
                  onChange={handleFormChange}
                  placeholder="e.g. ₹35,000 / month"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder-slate-400 transition-all tabular-nums"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Vacancies</label>
                <input
                  type="number"
                  name="open_positions"
                  value={formData.open_positions}
                  onChange={handleFormChange}
                  min={1}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all tabular-nums"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Tenure / Duration</label>
                <input
                  type="text"
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleFormChange}
                  placeholder="e.g. 6 Months"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Application Deadline</label>
                <input
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all tabular-nums"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Required Skills (Comma separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleFormChange}
                placeholder="e.g. Python, Docker, PostgreSQL, REST APIs"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder-slate-400 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Role Overview & Deliverables</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Outline core responsibilities, engineering stack, and expected deliverables..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder-slate-400 transition-all resize-y"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="is_remote"
                name="is_remote"
                checked={formData.is_remote}
                onChange={handleFormChange}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="is_remote" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Remote Eligible Position
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingJob}
              className="mt-1 w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmittingJob ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing to Vector Index...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Publish Vectorized Opening</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Applications Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">All candidates across your company's listings, grouped by stage</p>
          </div>
          <button
            type="button"
            onClick={() => fetchPipeline(pipelineStatus === 'ALL' ? null : pipelineStatus)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={12} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handlePipelineStatusChange(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                pipelineStatus === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {s === 'ALL' ? 'All Stages' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoadingPipeline ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-slate-400" />
            </div>
          ) : pipelineApps.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No applications found</p>
              <p className="text-xs text-slate-400 mt-1">Applications appear here once candidates apply or are shortlisted</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-5">Candidate</th>
                    <th className="py-3.5 px-4">Role Applied</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4">Match</th>
                    <th className="py-3.5 px-5 text-right">Move Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pipelineApps.map((app) => {
                    const statusColors = {
                      APPLIED: 'text-slate-600 bg-slate-100',
                      UNDER_REVIEW: 'text-amber-700 bg-amber-50',
                      SHORTLISTED: 'text-blue-700 bg-blue-50',
                      INTERVIEW: 'text-violet-700 bg-violet-50',
                      OFFERED: 'text-emerald-700 bg-emerald-50',
                      REJECTED: 'text-rose-700 bg-rose-50',
                    };
                    const dotColors = {
                      APPLIED: 'bg-slate-400',
                      UNDER_REVIEW: 'bg-amber-400',
                      SHORTLISTED: 'bg-blue-500',
                      INTERVIEW: 'bg-violet-500',
                      OFFERED: 'bg-emerald-500',
                      REJECTED: 'bg-rose-500',
                    };
                    const nextStages = {
                      APPLIED: ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'],
                      UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
                      SHORTLISTED: ['INTERVIEW', 'OFFERED', 'REJECTED'],
                      INTERVIEW: ['OFFERED', 'REJECTED'],
                      OFFERED: [],
                      REJECTED: [],
                    };
                    const stages = nextStages[app.status] || [];
                    const name = app.student?.username || `Candidate #${app.student?.id}`;
                    const initials = name.substring(0, 2).toUpperCase();

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => setPipelineNominateTarget(app.student?.student_profile_id || app.student?.id)}
                              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 hover:opacity-90 cursor-pointer"
                              title="View Full Profile"
                            >
                              {initials}
                            </button>
                            <div>
                              <button
                                type="button"
                                onClick={() => setPipelineNominateTarget(app.student?.student_profile_id || app.student?.id)}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-left text-xs leading-tight"
                              >
                                {name}
                              </button>
                              <p className="text-[11px] text-slate-400">{app.student?.institution || app.student?.current_designation || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{app.listing_title}</p>
                          <p className="text-[11px] text-slate-400">{app.company_name}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[app.status] || 'bg-slate-400'}`} />
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="tabular-nums text-xs font-bold text-slate-700">{Math.round((app.match_score || 0) * 100)}%</span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {stages.map((s) => (
                              <button
                                key={s}
                                type="button"
                                disabled={pipelineStatusUpdating === app.id}
                                onClick={() => updatePipelineAppStatus(app.id, s)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer border ${
                                  s === 'REJECTED'
                                    ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                                    : s === 'OFFERED'
                                    ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                    : 'text-slate-700 border-slate-200 hover:bg-slate-100'
                                } disabled:opacity-50`}
                              >
                                {pipelineStatusUpdating === app.id ? '…' : s.replace('_', ' ')}
                              </button>
                            ))}
                            {stages.length === 0 && (
                              <span className="text-[11px] text-slate-400 italic">Final stage</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {pipelineNominateTarget && (
        <div className="fixed inset-0 z-50 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            <StudentPortfolio
              studentId={pipelineNominateTarget}
              blind={isBlindScreening}
              onBack={() => setPipelineNominateTarget(null)}
              onRouteChange={onRouteChange}
            />
          </div>
        </div>
      )}

      {activeReviewJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center shadow-xs ${getCompanyAvatarColor(activeReviewJob.title)}`}>
                  {getCompanyInitials(activeReviewJob.title)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeReviewJob.title} — Applicant Pipeline</h3>
                  <p className="text-xs text-slate-500">
                    {activeReviewJob.role_type} · {activeReviewJob.location} · <span className="tabular-nums font-semibold">{applicants.length} Applicants</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleBlindScreening}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                    isBlindScreening
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isBlindScreening ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{isBlindScreening ? 'Blind Screening ON' : 'Blind Screening OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReviewJob(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {reviewConflictMessage && (
              <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-amber-600" />
                <span>{reviewConflictMessage}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingApplicants ? (
                <div className="py-20 text-center text-slate-400">
                  <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Loading candidate review pipeline...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Users size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700 text-base">No candidates have applied to this posting yet</p>
                  <p className="text-xs text-slate-400 mt-1">Direct applications with verified skill matrix will appear here automatically.</p>
                </div>
              ) : (
                applicants.map((app) => {
                  const student = app.student;
                  const candidateName = isBlindScreening ? `Candidate #${student.id}` : student.username;
                  const currentStageObj = APPLICATION_STAGES.find((s) => s.key === app.status) || APPLICATION_STAGES[0];
                  const allSkills = Object.keys(student.skills_matrix || {});
                  const effectiveSkills = allSkills.length > 0
                    ? allSkills
                    : (Array.isArray(student.raw_extracted_skills) ? student.raw_extracted_skills : []);
                  const isSkillsExpanded = Boolean(expandedSkillsAppIds[app.id]);
                  const displayedSkills = isSkillsExpanded ? effectiveSkills : effectiveSkills.slice(0, 5);

                  return (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <button
                          type="button"
                          onClick={() => setViewingCandidateId(student.id)}
                          className={`w-12 h-12 rounded-2xl font-bold text-sm flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:opacity-90 transition-opacity ${getCompanyAvatarColor(candidateName)}`}
                          title="View Candidate Full Profile"
                        >
                          {getCompanyInitials(candidateName)}
                        </button>

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setViewingCandidateId(student.id)}
                              className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors text-left cursor-pointer"
                              title="View Candidate Full Profile"
                            >
                              {candidateName}
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewingCandidateId(student.id)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="View Full Details"
                            >
                              <User size={10} />
                              <span>Full Profile</span>
                            </button>
                            {student.is_verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <Shield size={10} /> Verified
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 tabular-nums">
                              {Math.round(app.match_score || 85)}% Match
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStageObj.color}`}>
                              {currentStageObj.label}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                            <span>{student.institution || 'Higher Education Institution'}</span>
                            <span>·</span>
                            <span>{student.department || 'Computer Science'}</span>
                            <span>·</span>
                            <span className="tabular-nums font-semibold text-slate-700">
                              Cognitive Score: {Math.round(student.overall_confidence_score || 0)}/100
                            </span>
                          </p>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {displayedSkills.map((skillName, idx) => {
                              const sData = student.skills_matrix?.[skillName];
                              const weight = typeof sData === 'object' ? sData?.weight : (typeof sData === 'number' ? sData : null);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setExpandedSkillsAppIds((prev) => ({ ...prev, [app.id]: !isSkillsExpanded }))}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Click to toggle all skills"
                                >
                                  <span>{skillName}</span>
                                  {weight !== null && isSkillsExpanded && (
                                    <span className="text-[10px] text-slate-500 font-bold tabular-nums">({weight}%)</span>
                                  )}
                                </button>
                              );
                            })}
                            {effectiveSkills.length > 5 && (
                              <button
                                type="button"
                                onClick={() => setExpandedSkillsAppIds((prev) => ({ ...prev, [app.id]: !isSkillsExpanded }))}
                                className="px-2 py-0.5 rounded-md text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                {isSkillsExpanded ? 'Show Less' : `+${effectiveSkills.length - 5} More Skills`}
                              </button>
                            )}
                          </div>

                          {app.recruiter_notes && (
                            <p className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <span className="font-semibold text-slate-700">Review Note:</span> {app.recruiter_notes}
                            </p>
                          )}

                          {app.interview_date && (
                            <p className="text-xs text-indigo-700 bg-indigo-50/70 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 tabular-nums">
                              <Clock size={13} />
                              <span>Scheduled Interview: {new Date(app.interview_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {APPLICATION_STAGES.map((stg) => {
                            const isCurrent = app.status === stg.key;
                            const isPendingThis = updatingApplicationId === app.id;
                            return (
                              <button
                                key={stg.key}
                                type="button"
                                disabled={isCurrent || isPendingThis}
                                onClick={() => initiateStageTransition(app, stg.key)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  isCurrent
                                    ? `${stg.color} ring-2 ring-blue-600/30`
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {stg.label}
                              </button>
                            );
                          })}
                        </div>

                        {(app.status === 'OFFERED' || (app.internship_status && app.internship_status !== 'NOT_STARTED')) && (
                          <button
                            type="button"
                            onClick={() => openMentorModal(app)}
                            className="mt-2 w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Award size={13} />
                            <span>Mentor Supervision & Rating</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {selectedApplicationForStage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setSelectedApplicationForStage(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Stage Transition</h3>
            <p className="text-xs text-slate-500 mb-4">
              Advance <span className="font-semibold text-slate-800">{selectedApplicationForStage.student.username}</span> to{' '}
              <span className="font-bold text-blue-600">{stageTransitionForm.targetStatus}</span>
            </p>

            <form onSubmit={confirmStageTransition} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Evaluation Remarks & Note</label>
                <textarea
                  rows={3}
                  value={stageTransitionForm.note}
                  onChange={(e) => setStageTransitionForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Reason for advance, technical interview remarks, or next steps..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all resize-none"
                />
              </div>

              {stageTransitionForm.targetStatus === 'INTERVIEW' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Interview Date & Time (UTC)</label>
                  <input
                    type="datetime-local"
                    value={stageTransitionForm.interviewDate}
                    onChange={(e) => setStageTransitionForm((p) => ({ ...p, interviewDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all tabular-nums"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApplicationForStage(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingApplicationId !== null}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {updatingApplicationId !== null ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Confirm Transition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mentorEvaluationTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full p-6 relative">
            <button
              type="button"
              onClick={() => setMentorEvaluationTarget(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Intern Supervision & Rating</h3>
                <p className="text-xs text-slate-500">Candidate: {mentorEvaluationTarget.student.username}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitMentorProgress} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Lifecycle Status</label>
                  <select
                    value={mentorForm.internship_status}
                    onChange={(e) => setMentorForm((p) => ({ ...p, internship_status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all cursor-pointer"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed (Issues Credential)</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Performance Rating (1-5)</label>
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setMentorForm((p) => ({ ...p, mentor_rating: starVal }))}
                        className="p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                      >
                        <Star
                          size={18}
                          className={starVal <= mentorForm.mentor_rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2 tabular-nums">{mentorForm.mentor_rating}.0</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Mentor Name</label>
                  <input
                    type="text"
                    value={mentorForm.mentor_name}
                    onChange={(e) => setMentorForm((p) => ({ ...p, mentor_name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Mentor Designation</label>
                  <input
                    type="text"
                    value={mentorForm.mentor_designation}
                    onChange={(e) => setMentorForm((p) => ({ ...p, mentor_designation: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Mentor Feedback & Remarks</label>
                <textarea
                  rows={3}
                  value={mentorForm.mentor_feedback}
                  onChange={(e) => setMentorForm((p) => ({ ...p, mentor_feedback: e.target.value }))}
                  placeholder="Specific feedback on engineering quality, teamwork, and project completion..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Certificate / Credential Verification URL</label>
                <input
                  type="url"
                  value={mentorForm.completion_certificate_url}
                  onChange={(e) => setMentorForm((p) => ({ ...p, completion_certificate_url: e.target.value }))}
                  placeholder="https://company.com/verify/cert-id"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMentorEvaluationTarget(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMentor}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingMentor ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                  <span>Record Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && scheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Video size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Interview Viva</h3>
                <p className="text-xs text-slate-500">
                  Position: <span className="font-semibold text-slate-700">{scheduleTarget.title}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Candidate Name</label>
                <input
                  type="text"
                  value={scheduleForm.candidateName}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, candidateName: e.target.value }))}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, scheduledTime: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 transition-all tabular-nums"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed">
                <span className="font-bold">Automated WebRTC Room:</span> A secured interview room will be initialized. The candidate will see this scheduled call on their Opportunities feed.
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Calendar size={14} />
                  <span>Confirm Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Preview Recruiter Public Profile Modal */}
      {isPreviewingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <RecruiterPublicProfile
            recruiterId={recruiterProfile?.id}
            isModal={true}
            onClose={() => setIsPreviewingProfile(false)}
            onRouteChange={onRouteChange}
          />
        </div>
      )}

      {/* Edit Recruiter Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/60">
                <Edit3 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Recruiter Brand & Identity Settings</h3>
                <p className="text-xs text-slate-500">Configure how candidates and campus academicians perceive your profile.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Professional Designation</label>
                  <input
                    type="text"
                    value={profileEditForm.designation}
                    onChange={(e) => setProfileEditForm(p => ({ ...p, designation: e.target.value }))}
                    placeholder="e.g. Lead Technical Recruiter"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={profileEditForm.department}
                    onChange={(e) => setProfileEditForm(p => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. Talent Acquisition / Engineering"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={profileEditForm.location}
                    onChange={(e) => setProfileEditForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={profileEditForm.experience_years}
                    onChange={(e) => setProfileEditForm(p => ({ ...p, experience_years: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 tabular-nums"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Default Representation</label>
                  <select
                    value={profileEditForm.hiring_mode_preference}
                    onChange={(e) => setProfileEditForm(p => ({ ...p, hiring_mode_preference: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 cursor-pointer"
                  >
                    <option value="COMPANY">Company Representation</option>
                    <option value="INDIVIDUAL">Independent Recruiter (Self)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={profileEditForm.linkedin_url}
                    onChange={(e) => setProfileEditForm(p => ({ ...p, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Website / Portfolio URL</label>
                  <input
                    type="url"
                    value={profileEditForm.website}
                    onChange={(e) => setProfileEditForm(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://company.com or portfolio"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Contact Phone (Private / Advisory)</label>
                <input
                  type="text"
                  value={profileEditForm.contact_phone}
                  onChange={(e) => setProfileEditForm(p => ({ ...p, contact_phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Executive Bio & Talent Philosophy</label>
                <textarea
                  rows={4}
                  value={profileEditForm.bio}
                  onChange={(e) => setProfileEditForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Share your recruitment philosophy, focus technologies, and what you look for in candidates..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 leading-relaxed resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Industry;