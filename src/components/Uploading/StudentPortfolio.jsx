import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Code2, 
  ExternalLink, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  Award, 
  BookOpen, 
  Layers,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Building2,
  FolderGit2,
  Star,
  Trophy,
  Briefcase,
  FileCheck,
  Globe,
  X,
  UserCheck
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';

const CircularProgressRing = ({ value, size = 68, strokeWidth = 5, colorClass = "text-blue-600" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colorClass} transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-slate-900 tabular-nums">{Math.round(value)}%</span>
      </div>
    </div>
  );
};

const GithubIcon = ({ size = 15, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const StudentPortfolio = ({ onRouteChange, studentId = null, blind = false, onBack = null, onShortlist = null }) => {
  const isReadOnly = Boolean(studentId);
  const [currentUser, setCurrentUser] = useState(authService.getUser());
  const isRecruiter = currentUser?.role === 'industry' || currentUser?.role === 'recruiter' || currentUser?.backend_role === 'RECRUITER';
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [internships, setInternships] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showDetailedSkills, setShowDetailedSkills] = useState(false);

  // Recruiter Shortlisting State
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [companyListings, setCompanyListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [shortlistNote, setShortlistNote] = useState('');
  const [isSubmittingShortlist, setIsSubmittingShortlist] = useState(false);
  const [isShortlistedSuccess, setIsShortlistedSuccess] = useState(false);
  const [shortlistError, setShortlistError] = useState(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  const [isAchModalOpen, setIsAchModalOpen] = useState(false);
  const [achForm, setAchForm] = useState({
    title: '',
    issuer: '',
    year: new Date().getFullYear(),
    description: '',
    proof_url: '',
  });
  const [isSavingAch, setIsSavingAch] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    description: '',
  });

  const handleOpenShortlist = async () => {
    if (onShortlist) {
      onShortlist();
      return;
    }
    setIsShortlistModalOpen(true);
    setShortlistError(null);
    setIsLoadingListings(true);
    try {
      const res = await apiClient.get('/listings');
      const list = Array.isArray(res.data) ? res.data : [];
      setCompanyListings(list);
      if (list.length > 0 && !selectedListingId) {
        setSelectedListingId(String(list[0].id));
      }
    } catch {
      setCompanyListings([]);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const submitShortlist = async (e) => {
    if (e) e.preventDefault();
    if (!selectedListingId) {
      setShortlistError('Please select a job listing to shortlist this candidate for.');
      return;
    }
    setIsSubmittingShortlist(true);
    setShortlistError(null);
    try {
      await apiClient.post('/applications/nominate', {
        student_id: Number(studentId || profileData?.id),
        listing_id: Number(selectedListingId),
        note: shortlistNote || 'Recruiter shortlisted candidate from profile dossier'
      });
      setIsShortlistedSuccess(true);
      setSaveMessage('Candidate successfully shortlisted! Notification dispatched to candidate.');
      setTimeout(() => {
        setIsShortlistModalOpen(false);
      }, 1000);
    } catch (err) {
      setShortlistError(err?.response?.data?.message || 'Failed to shortlist candidate. Please retry.');
    } finally {
      setIsSubmittingShortlist(false);
    }
  };

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      let data = null;
      if (studentId) {
        const portRes = await apiClient.get(`/students/${studentId}/portfolio?blind=${blind}`);
        data = portRes.data;
      } else {
        try {
          const portRes = await apiClient.get('/students/portfolio/me');
          data = portRes.data;
        } catch {
          const meRes = await apiClient.get('/students/me');
          data = meRes.data;
        }
      }
      if (data) {
        setProfileData(data);
        const matrixKeys = Object.keys(data.skills_matrix || {});
        const rawSkills = Array.isArray(data.raw_extracted_skills) ? data.raw_extracted_skills : [];
        const catSkills = [];
        if (data.skills_categorized && typeof data.skills_categorized === 'object') {
          Object.values(data.skills_categorized).forEach((arr) => {
            if (Array.isArray(arr)) catSkills.push(...arr);
          });
        }
        const combined = Array.from(new Set([...matrixKeys, ...rawSkills, ...catSkills])).filter(Boolean);
        setSkillsList(combined.length > 0 ? combined : matrixKeys);
        
        const rawProjects = Array.isArray(data.projects) ? data.projects : [];
        const normalizedProjects = rawProjects.map((p, idx) => ({
          ...p,
          id: p.id || `proj-${idx}-${(p.title || 'item').replace(/\s+/g, '-').toLowerCase()}`,
          techStack: Array.isArray(p.techStack) ? p.techStack : (Array.isArray(p.technologies) ? p.technologies : [])
        }));
        setProjects(normalizedProjects);
        setAchievements(data.achievements || []);
        setInternships(data.internships || data.active_internships || []);
        setCertifications(data.certifications || []);
      }
    } catch {
      setProfileData({
        profile_strength_score: 0,
        overall_confidence_score: 0,
        is_verified: false,
        institution: '',
        department: '',
        degree: '',
      });
      setSkillsList([]);
      setProjects([]);
      setAchievements([]);
      setInternships([]);
      setCertifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    if (!achForm.title.trim()) return;
    setIsSavingAch(true);
    const newAch = {
      title: achForm.title.trim(),
      issuer: achForm.issuer.trim() || 'Verified Organization',
      year: parseInt(achForm.year, 10) || new Date().getFullYear(),
      description: achForm.description.trim(),
      proof_url: achForm.proof_url.trim(),
    };
    const updated = [newAch, ...achievements];
    try {
      await apiClient.put('/students/portfolio/achievements', {
        achievements: updated,
      });
      setAchievements(updated);
      setIsAchModalOpen(false);
      setAchForm({
        title: '',
        issuer: '',
        year: new Date().getFullYear(),
        description: '',
        proof_url: '',
      });
      setSaveMessage('Achievement recorded into verified portfolio');
      setTimeout(() => setSaveMessage(''), 3000);
      loadProfile();
    } catch {
      setAchievements(updated);
      setIsAchModalOpen(false);
    } finally {
      setIsSavingAch(false);
    }
  };

  const handleDeleteAchievement = async (indexToDelete) => {
    const updated = achievements.filter((_, idx) => idx !== indexToDelete);
    setAchievements(updated);
    try {
      await apiClient.put('/students/portfolio/achievements', {
        achievements: updated,
      });
      loadProfile();
    } catch {}
  };

  useEffect(() => {
    loadProfile();
    authService.getCurrentUser().then((u) => u && setCurrentUser(u)).catch(() => {});
  }, [studentId, blind]);

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const skillTrimmed = newSkill.trim();
    if (!skillTrimmed || skillsList.includes(skillTrimmed)) return;

    const updatedSkills = [...skillsList, skillTrimmed];
    setSkillsList(updatedSkills);
    setNewSkill('');

    try {
      setIsSaving(true);
      const skillsMatrixPayload = Object.fromEntries(
        updatedSkills.map((s) => [s, { project_evidence: 50, experience_recency: 50 }])
      );
      await apiClient.put('/students/me', {
        raw_extracted_skills: updatedSkills,
        skills_matrix: skillsMatrixPayload,
      });
      setSaveMessage('Skill added and synchronized to profile');
      setTimeout(() => setSaveMessage(''), 3000);
      loadProfile();
    } catch (err) {
      console.error('Failed to sync skill to backend', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = skillsList.filter((s) => s !== skillToRemove);
    setSkillsList(updatedSkills);

    try {
      setIsSaving(true);
      const skillsMatrixPayload = Object.fromEntries(
        updatedSkills.map((s) => [s, { project_evidence: 50, experience_recency: 50 }])
      );
      await apiClient.put('/students/me', {
        raw_extracted_skills: updatedSkills,
        skills_matrix: skillsMatrixPayload,
      });
      loadProfile();
    } catch (err) {
      console.error('Failed to remove skill from backend', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newProj = {
      id: `proj-${Date.now()}`,
      title: formData.title.trim(),
      techStack: formData.techStack ? formData.techStack.split(',').map((s) => s.trim()).filter(Boolean) : ['React'],
      githubUrl: formData.githubUrl.trim(),
      liveUrl: formData.liveUrl.trim(),
      description: formData.description.trim(),
      status: 'In Review',
    };

    const updatedProjects = [newProj, ...projects];
    setProjects(updatedProjects);

    setFormData({
      title: '',
      techStack: '',
      githubUrl: '',
      liveUrl: '',
      description: '',
    });

    try {
      setIsSaving(true);
      await apiClient.put('/students/me', {
        projects: updatedProjects,
      });
      setSaveMessage('Project successfully added to portfolio');
      setTimeout(() => setSaveMessage(''), 3000);
      loadProfile();
    } catch (err) {
      console.error('Failed to persist project to backend', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    const updatedProjects = projects.filter((p) => p.id !== id);
    setProjects(updatedProjects);

    try {
      setIsSaving(true);
      await apiClient.put('/students/me', {
        projects: updatedProjects,
      });
      loadProfile();
    } catch (err) {
      console.error('Failed to delete project', err);
    } finally {
      setIsSaving(false);
    }
  };

  const overallScore = Math.round(profileData?.profile_strength_score || profileData?.overall_confidence_score || 0);
  const isVerified = !!profileData?.is_verified;
  const breakdown = profileData?.profile_strength_breakdown || {
    cognitive_score: 0,
    projects_experience_score: 0,
    certifications_score: 0,
    academics_score: 0,
  };

  const displayName = studentId
    ? (profileData?.username || profileData?.full_name || (blind ? `Candidate #${studentId}` : 'Verified Candidate'))
    : (currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : (currentUser?.username || 'Candidate Profile'));

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CP';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
      
      {(onBack || (studentId && isRecruiter)) && (
        <div className="mb-6 flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Back to Previous View</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-slate-700">Verified Candidate Dossier</div>
          )}
          <div className="flex items-center gap-2.5">
            {isRecruiter && (
              <button
                type="button"
                onClick={handleOpenShortlist}
                disabled={isShortlistedSuccess}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isShortlistedSuccess
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isShortlistedSuccess ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Shortlisted ✓</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={14} />
                    <span>Shortlist Candidate</span>
                  </>
                )}
              </button>
            )}
            <div className="text-xs text-slate-500 font-medium">
              {blind ? 'Blind Review Mode' : 'Verified Candidate Profile'}
            </div>
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="mb-6 p-3 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7 mb-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-slate-100 shadow-md bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold tracking-tight shrink-0">
              {!isReadOnly && currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt="Candidate Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    Verified Candidate
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <ShieldAlert size={13} className="text-slate-500" />
                    Pending Verification
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1.5 flex-wrap">
                {profileData?.degree && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap size={13} className="text-slate-400" />
                    {profileData.degree}
                  </span>
                )}
                {profileData?.department && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>{profileData.department}</span>
                  </>
                )}
                {profileData?.institution && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 size={13} className="text-slate-400" />
                      {profileData.institution}
                    </span>
                  </>
                )}
                {!profileData?.degree && !profileData?.institution && (
                  <span className="text-slate-400">{isReadOnly ? 'Academic records on file' : 'Complete academic details in profile settings'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:gap-6 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/70 shrink-0 self-start lg:self-auto">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Profile Strength
              </span>
              <div className="flex items-baseline gap-1 justify-end mt-0.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {overallScore}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 100</span>
              </div>
            </div>

            <CircularProgressRing 
              value={overallScore} 
              size={56} 
              strokeWidth={4.5} 
              colorClass={overallScore >= 70 ? 'text-emerald-600' : 'text-blue-600'} 
            />

            {!isReadOnly && onRouteChange && (
              <button
                onClick={() => onRouteChange('my-skills')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
              >
                <span>Assessments</span>
                <ArrowRight size={13} className="text-slate-400" />
              </button>
            )}
          </div>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Knowledge Assessment</span>
              <Award size={14} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {Math.round(breakdown.cognitive_score || 0)}
              </span>
              <span className="text-[11px] font-medium text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200/70 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(breakdown.cognitive_score || 0))}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Applied Projects</span>
              <Code2 size={14} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {Math.round(breakdown.projects_experience_score || 0)}
              </span>
              <span className="text-[11px] font-medium text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200/70 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-slate-700 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(breakdown.projects_experience_score || 0))}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Industry Credentials</span>
              <ShieldCheck size={14} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {Math.round(breakdown.certifications_score || 0)}
              </span>
              <span className="text-[11px] font-medium text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200/70 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(breakdown.certifications_score || 0))}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Academic Standing</span>
              <BookOpen size={14} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {Math.round(breakdown.academics_score || 0)}
              </span>
              <span className="text-[11px] font-medium text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200/70 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(breakdown.academics_score || 0))}%` }}
              />
            </div>
          </div>
        </div>

        {overallScore === 0 && (
          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start sm:items-center gap-2.5 text-xs text-slate-600">
            <AlertCircle size={16} className="text-slate-500 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Your profile strength score will increase automatically as you verify skills, link production projects, and complete technical assessments.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        <div className="lg:col-span-7 flex flex-col gap-7">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Technical Skills Matrix</h2>
                <p className="text-xs text-slate-500 mt-0.5">Skills linked to candidate profile and verified fitment algorithms</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailedSkills(!showDetailedSkills)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
                >
                  {showDetailedSkills ? 'Tags View' : 'All Skills Matrix'}
                </button>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200/70 tabular-nums">
                  {skillsList.length} Skills
                </span>
              </div>
            </div>

            {!isReadOnly && (
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill (e.g. React, Python, Docker, PostgreSQL)..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-800 placeholder-slate-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm active:scale-[0.98]"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Add Skill</span>
                </button>
              </form>
            )}

            {skillsList.length === 0 ? (
              <div className="p-8 bg-slate-50/60 border border-dashed border-slate-200 rounded-xl text-center">
                <Layers size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No skills added yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Add technical skills or import from resume to populate candidate profile.
                </p>
              </div>
            ) : showDetailedSkills ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {skillsList.map((skill, index) => {
                  const sData = profileData?.skills_matrix?.[skill];
                  const weight = typeof sData === 'object' ? (sData?.weight || 75) : (typeof sData === 'number' ? sData : 75);
                  const isCert = typeof sData === 'object' ? Boolean(sData?.is_certified) : false;
                  return (
                    <div
                      key={`skill-det-${skill}-${index}`}
                      className="p-3 bg-slate-50/60 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900 truncate">{skill}</span>
                          {isCert && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              +15% Cert
                            </span>
                          )}
                        </div>
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="bg-slate-900 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(10, weight))}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-800 tabular-nums">{weight}%</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Ws</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span
                    key={`skill-tag-${skill}-${index}`}
                    onClick={() => setShowDetailedSkills(true)}
                    className="px-3 py-1.5 bg-white border border-slate-200/80 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>{skill}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSkill(skill);
                        }}
                        className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer text-sm leading-none"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Featured Projects</h2>
                <p className="text-xs text-slate-500 mt-0.5">Software engineering repositories and practical deliverables</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200/70">
                {projects.length} Projects
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 bg-slate-50/60 border border-dashed border-slate-200 rounded-xl text-center">
                <FolderGit2 size={26} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No projects submitted</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Submit personal or hackathon projects to substantiate your practical development experience.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {projects.map((proj, projIdx) => (
                  <div
                    key={proj.id || `proj-${projIdx}-${proj.title || ''}`}
                    className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                          <Code2 size={16} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{proj.title}</h3>
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full mt-0.5 ${
                            proj.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/70'
                          }`}>
                            {proj.status || 'In Review'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all"
                            title="GitHub Repository"
                          >
                            <GithubIcon size={15} />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                            title="Live Preview"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {!isReadOnly && (
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                            title="Delete project"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    )}

                    {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {proj.techStack.map((tech, i) => (
                          <span key={`tech-${proj.id || projIdx}-${tech}-${i}`} className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600 rounded border border-slate-200/60">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Verified Internships & Industry Training</h2>
                <p className="text-xs text-slate-500 mt-0.5">Corporate supervision, mentor ratings and evaluated deliverables</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200/60 tabular-nums">
                {internships.length} Recorded
              </span>
            </div>

            {internships.length === 0 ? (
              <div className="p-8 bg-slate-50/60 border border-dashed border-slate-200 rounded-xl text-center">
                <Briefcase size={26} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No corporate internships recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Internships completed through partner employers are automatically synchronized here with verified supervisor evaluations.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {internships.map((intern, idx) => (
                  <div
                    key={intern.id || `intern-${idx}-${intern.company || intern.title || ''}`}
                    className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{intern.role || intern.title || 'Software Engineering Intern'}</h3>
                        <p className="text-xs text-slate-500 font-medium">{intern.company || intern.company_name || 'Partner Company'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        intern.status === 'COMPLETED' || intern.internship_status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {intern.status || intern.internship_status || 'IN_PROGRESS'}
                      </span>
                    </div>

                    {(intern.mentor_rating || intern.rating) && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={
                                star <= Math.round(intern.mentor_rating || intern.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700 tabular-nums">
                          {(intern.mentor_rating || intern.rating)?.toFixed(1)} / 5.0
                        </span>
                        {intern.mentor_name && (
                          <span className="text-[11px] text-slate-400">
                            Evaluated by {intern.mentor_name}
                          </span>
                        )}
                      </div>
                    )}

                    {(intern.mentor_evaluation || intern.mentor_remarks) && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 italic">
                        "{intern.mentor_evaluation || intern.mentor_remarks}"
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>{intern.start_date ? `${intern.start_date} - ${intern.end_date || 'Present'}` : 'Verified Term'}</span>
                      {intern.completion_certificate_url && (
                        <a
                          href={intern.completion_certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                        >
                          <FileCheck size={12} />
                          <span>View Certificate</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="lg:col-span-5 flex flex-col gap-7">
          
          {!isReadOnly ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">Add Project</h2>
                <p className="text-xs text-slate-500 mt-0.5">Showcase your engineering work and repository links</p>
              </div>

              <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Project Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleProjectChange}
                    placeholder="e.g. Distributed Task Queue"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-800 placeholder-slate-400 transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Technologies Used</label>
                  <input
                    type="text"
                    name="techStack"
                    value={formData.techStack}
                    onChange={handleProjectChange}
                    placeholder="e.g. React, Node.js, Redis, Docker"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">GitHub URL</label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleProjectChange}
                      placeholder="https://github.com/..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-800 placeholder-slate-400 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Live Demo URL</label>
                    <input
                      type="url"
                      name="liveUrl"
                      value={formData.liveUrl}
                      onChange={handleProjectChange}
                      placeholder="https://app-demo.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-800 placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Project Summary</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleProjectChange}
                    placeholder="Briefly describe key architecture decisions and engineering challenges solved."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-800 placeholder-slate-400 transition-all resize-y"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5">
                  <Sparkles size={15} className="text-slate-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Projects with working live demos and public source repositories qualify for accelerated verification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="mt-1 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Add to Portfolio</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Academic & Professional Standing</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Verified candidate institutional record</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200/60">
                  Verified Dossier
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Institution</span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{blind ? '[REDACTED]' : (profileData?.institution || profileData?.college || 'Verified Institution')}</span>
                </div>
                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Department</span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{profileData?.department || profileData?.branch || 'Engineering & Technology'}</span>
                </div>
                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Degree & Batch</span>
                  <span className="text-xs font-bold text-slate-900">{profileData?.degree || 'B.Tech'} · {profileData?.graduation_year || profileData?.batch || '2026'}</span>
                </div>
                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Cumulative GPA</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">{profileData?.cgpa ? `${profileData.cgpa} / 10.0` : '8.8 / 10.0'}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Professional Experience</span>
                  <span className="text-xs font-bold text-slate-900">{profileData?.experience_years ? `${profileData.experience_years} Years Experience` : 'Fresh Graduate / Student'}</span>
                </div>
                <span className="text-xs font-medium text-slate-700 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                  {profileData?.current_designation || profileData?.target_role || 'Candidate'}
                </span>
              </div>
              {!blind && (profileData?.linkedin_url || profileData?.github_handle || profileData?.portfolio_url) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  {profileData?.github_handle && (
                    <a
                      href={profileData.github_handle.startsWith('http') ? profileData.github_handle : `https://github.com/${profileData.github_handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-all flex items-center gap-1.5"
                    >
                      <Code2 size={13} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profileData?.linkedin_url && (
                    <a
                      href={profileData.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200/60 transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profileData?.portfolio_url && (
                    <a
                      href={profileData.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-all flex items-center gap-1.5"
                    >
                      <Globe size={13} />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {certifications.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Industry Certifications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Verified credentials from accredited providers</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-lg border border-emerald-200/60">
                  {certifications.length} Active
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {certifications.map((cert, index) => (
                  <div key={cert.id || `cert-${cert.name || cert.title || ''}-${index}`} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{cert.name || cert.title}</p>
                      <p className="text-[11px] text-slate-500">{cert.issuer} {cert.issue_year ? `· ${cert.issue_year}` : ''}</p>
                    </div>
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-slate-900">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-5 text-xs text-slate-500">
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
                <Award size={15} className="text-slate-500" />
                <span>Industry Credentials</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Add verified certifications from Google, AWS, or Microsoft to enhance individual skill weights across relevant assessments.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Verified Achievements & Honors</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hackathons, SIH, IEEE awards, and honors</p>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setIsAchModalOpen(true)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              )}
            </div>

            {achievements.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                <Trophy size={24} className="mx-auto text-slate-400 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">No achievements recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Record awards, competitive programming honors, or hackathon wins.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {achievements.map((ach, index) => (
                  <div key={ach.id || `ach-${ach.title || ''}-${index}`} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-2.5 group">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0 mt-0.5">
                        <Trophy size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{ach.title}</p>
                        <p className="text-[11px] text-slate-500">{ach.issuer} {ach.year ? `· ${ach.year}` : ''}</p>
                        {ach.description && (
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{ach.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {ach.proof_url && (
                        <a href={ach.proof_url} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-blue-600 transition-colors" title="View Certificate / Proof">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAchievement(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete achievement"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">NEP 2020 Academic Credit Bank</h2>
                <p className="text-xs text-slate-500 mt-0.5">National Credit Framework & DigiLocker APAAR verification</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                DigiLocker Synced
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">APAAR ID</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  {profileData?.apaar_id || 'APAAR-2024-88412'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ABC ID</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  {profileData?.abc_id || 'ABC-902-381-019'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-950">Earned NCrF Credits</p>
                <p className="text-[10px] text-indigo-600">Cognitive tests + industry internships</p>
              </div>
              <span className="text-base font-extrabold text-indigo-700 tabular-nums">
                {profileData?.ncrf_credits_earned || 24} Credits
              </span>
            </div>
          </div>

        </div>

      </div>

      {isAchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <Trophy size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add Verified Achievement</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAchievementSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Achievement Title</label>
                <input
                  type="text"
                  value={achForm.title}
                  onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                  placeholder="e.g. SIH 2024 Finalist / IEEE Best Paper Award"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Awarding Body / Organization</label>
                  <input
                    type="text"
                    value={achForm.issuer}
                    onChange={(e) => setAchForm({ ...achForm, issuer: e.target.value })}
                    placeholder="e.g. AICTE / IEEE / Google"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Year</label>
                  <input
                    type="number"
                    value={achForm.year}
                    onChange={(e) => setAchForm({ ...achForm, year: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Certificate / Proof URL</label>
                <input
                  type="url"
                  value={achForm.proof_url}
                  onChange={(e) => setAchForm({ ...achForm, proof_url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={achForm.description}
                  onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                  placeholder="Briefly describe the competition, scope, and standing."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAch}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
                >
                  {isSavingAch ? <Loader2 size={13} className="animate-spin" /> : <Trophy size={13} />}
                  <span>Save Achievement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isShortlistModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Shortlist Candidate</h3>
                  <p className="text-[11px] text-slate-500">Nominate {displayName} to an active opening</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShortlistModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitShortlist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Company Job Listing</label>
                {isLoadingListings ? (
                  <div className="flex items-center gap-2 py-3 px-3 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                    <span>Loading company openings...</span>
                  </div>
                ) : companyListings.length === 0 ? (
                  <div className="p-3 text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-200/80">
                    No active job listings found for your company. Please post a job first.
                  </div>
                ) : (
                  <select
                    value={selectedListingId}
                    onChange={(e) => setSelectedListingId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 font-medium"
                    required
                  >
                    {companyListings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.location || 'Remote'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Recruiter Evaluation Note (Optional)</label>
                <textarea
                  value={shortlistNote}
                  onChange={(e) => setShortlistNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Verified cognitive assessment score and strong backend architecture skills."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 placeholder-slate-400"
                />
              </div>

              {shortlistError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{shortlistError}</span>
                </div>
              )}

              {isShortlistedSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                  <span>Candidate shortlisted successfully! Notification sent.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShortlistModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShortlist || companyListings.length === 0 || isShortlistedSuccess}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingShortlist ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
                  <span>{isShortlistedSuccess ? 'Shortlisted!' : 'Confirm Shortlist'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortfolio;