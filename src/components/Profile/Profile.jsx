import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  Award, 
  FolderGit2, 
  FileCheck, 
  Settings, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Globe, 
  ShieldCheck, 
  Clock, 
  Check, 
  X, 
  Loader2, 
  ChevronRight, 
  FileText, 
  BarChart3, 
  Sliders, 
  Bell, 
  Lock, 
  Eye, 
  ArrowUpRight,
  Info,
  Link
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';

// Inline icon components for icons not available in this lucide-react version
const Github = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


const PRESET_AVATARS = [
  { id: '1', name: 'Alex', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: '2', name: 'Priya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
  { id: '3', name: 'Marcus', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
  { id: '4', name: 'Aria', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria' },
  { id: '5', name: 'Rohan', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
  { id: '6', name: 'Sophia', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
  { id: '7', name: 'Leo', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { id: '8', name: 'Maya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' },
];

const POPULAR_SKILL_SUGGESTIONS = [
  'React', 'Python', 'TypeScript', 'Node.js', 'Django', 
  'PostgreSQL', 'Docker', 'AWS', 'TailwindCSS', 'Figma', 
  'Machine Learning', 'Git', 'Next.js', 'REST API'
];

const Profile = ({ onRouteChange, user: propUser, onUserUpdate, initialTab = 'overview' }) => {
  const currentUser = propUser || authService.getUser();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview', 'skills', 'academics', 'projects', 'certifications', 'passport', 'settings'

  // Profile data from backend
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Avatar picker modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Form states for editable core profile
  const [personalForm, setPersonalForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    phone_number: '',
    gender: 'PREFER_NOT_TO_SAY',
    current_designation: '',
    experience_years: 0,
    placement_status: 'UNPLACED',
    institution: '',
    department: '',
    degree: '',
    cgpa: '',
    graduation_year: '',
    minor_specialization: '',
    nheqf_level: 'LEVEL_6_0',
    apaar_id: '',
    abc_id: '',
    github_handle: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  // Skills state
  const [skillsMatrix, setSkillsMatrix] = useState({});
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('technical_skills');

  // Projects state
  const [projects, setProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    tech_stack: '',
    description: '',
    github_url: '',
    live_url: ''
  });

  // Certifications state
  const [certifications, setCertifications] = useState([]);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    issue_year: new Date().getFullYear(),
    credential_url: '',
    skills_covered: ''
  });

  // Settings state
  const [preferences, setPreferences] = useState({
    notifications: {
      opportunity_alerts: true,
      deadline_reminders: true,
      scheme_alerts: true,
      application_status_updates: true
    },
    features: {
      show_affirmative_action_schemes: true,
      show_diversity_job_badges: true,
      smart_roadmap_recommendations: true,
      reverse_matching_radar: true
    },
    privacy: {
      participate_in_diversity_hiring: true,
      share_profile_with_verified_recruiters: true,
      auto_share_github_verified_badge: true,
      allow_digilocker_credit_sharing: true
    },
    career_discovery: {
      preferred_work_arrangement: 'ALL',
      minimum_desired_stipend_or_ctc: ''
    }
  });

  // NEP transcript export loading
  const [isExportingTranscript, setIsExportingTranscript] = useState(false);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);

  // Load profile from backend
  const loadProfile = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await apiClient.get('/students/me');
      const data = response.data;
      if (data) {
        setProfile(data);
        
        // Sync personal form
        setPersonalForm({
          first_name: data.first_name || currentUser?.first_name || '',
          last_name: data.last_name || currentUser?.last_name || '',
          username: data.username || currentUser?.username || '',
          bio: data.bio || '',
          phone_number: currentUser?.phone_number || '',
          gender: data.gender || 'PREFER_NOT_TO_SAY',
          current_designation: data.current_designation || '',
          experience_years: data.experience_years || 0,
          placement_status: data.placement_status || 'UNPLACED',
          institution: data.institution || '',
          department: data.department || '',
          degree: data.degree || '',
          cgpa: data.cgpa !== null && data.cgpa !== undefined ? data.cgpa : '',
          graduation_year: data.graduation_year || '',
          minor_specialization: data.minor_specialization || '',
          nheqf_level: data.nheqf_level || 'LEVEL_6_0',
          apaar_id: data.apaar_id || '',
          abc_id: data.abc_id || '',
          github_handle: data.github_handle || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          portfolio_url: data.portfolio_url || '',
        });

        setSkillsMatrix(data.skills_matrix || {});
        setProjects(data.projects || []);
        setCertifications(data.certifications || []);
        if (data.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...data.preferences
          }));
        }
      }
    } catch (err) {
      console.warn('Could not load profile from backend', err);
      // Fallback for new uninitialized users
      setPersonalForm({
        first_name: currentUser?.first_name || '',
        last_name: currentUser?.last_name || '',
        username: currentUser?.username || '',
        bio: '',
        phone_number: '',
        gender: 'PREFER_NOT_TO_SAY',
        current_designation: '',
        experience_years: 0,
        placement_status: 'UNPLACED',
        institution: '',
        department: '',
        degree: '',
        cgpa: '',
        graduation_year: '',
        minor_specialization: '',
        nheqf_level: 'LEVEL_6_0',
        apaar_id: '',
        abc_id: '',
        github_handle: '',
        github_url: '',
        linkedin_url: '',
        portfolio_url: '',
      });
      setSkillsMatrix({});
      setProjects([]);
      setCertifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Show temporary success message
  const triggerSuccess = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 4000);
  };

  // Save personal & academic information
  const handleSavePersonalInfo = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        first_name: personalForm.first_name.trim(),
        last_name: personalForm.last_name.trim(),
        username: personalForm.username.trim(),
        bio: personalForm.bio.trim(),
        gender: personalForm.gender,
        current_designation: personalForm.current_designation.trim(),
        experience_years: parseFloat(personalForm.experience_years) || 0,
        placement_status: personalForm.placement_status,
        institution: personalForm.institution.trim(),
        department: personalForm.department.trim(),
        degree: personalForm.degree.trim(),
        cgpa: personalForm.cgpa !== '' ? parseFloat(personalForm.cgpa) : null,
        graduation_year: personalForm.graduation_year ? parseInt(personalForm.graduation_year, 10) : null,
        minor_specialization: personalForm.minor_specialization.trim(),
        nheqf_level: personalForm.nheqf_level,
        apaar_id: personalForm.apaar_id.trim(),
        abc_id: personalForm.abc_id.trim(),
        github_handle: personalForm.github_handle.trim(),
        github_url: personalForm.github_url.trim(),
        linkedin_url: personalForm.linkedin_url.trim(),
        portfolio_url: personalForm.portfolio_url.trim(),
      };

      const response = await apiClient.put('/students/me', payload);
      const updatedProfile = response.data;
      setProfile(updatedProfile);

      // Also update auth user state
      if (onUserUpdate) {
        onUserUpdate({
          ...currentUser,
          first_name: updatedProfile.first_name || personalForm.first_name,
          last_name: updatedProfile.last_name || personalForm.last_name,
          username: updatedProfile.username || personalForm.username,
        });
      }

      triggerSuccess('Profile information updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Change Profile Picture / Avatar
  const handleSelectAvatar = async (url) => {
    setIsSaving(true);
    try {
      // Update both User model and StudentProfile
      await authService.updateCurrentUser({ avatar_url: url });
      await apiClient.put('/students/me', { avatar_url: url });

      if (onUserUpdate) {
        onUserUpdate({ ...currentUser, avatar_url: url });
      }
      setIsAvatarModalOpen(false);
      triggerSuccess('Profile picture updated successfully!');
    } catch (err) {
      setErrorMessage('Failed to update profile picture.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new skill
  const handleAddSkill = async (skillToAdd = null) => {
    const skillName = (skillToAdd || newSkillName).trim();
    if (!skillName) return;

    // Check if skill already exists
    const normalizedName = skillName;
    if (skillsMatrix[normalizedName]) {
      setNewSkillName('');
      return;
    }

    const updatedSkills = {
      ...skillsMatrix,
      [normalizedName]: {
        project_evidence: 70,
        experience_recency: 70,
        weight: 70,
      }
    };

    setSkillsMatrix(updatedSkills);
    setNewSkillName('');
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        skills_matrix: updatedSkills
      });
      setProfile(response.data);
      triggerSuccess(`Added "${normalizedName}" to your verified skills matrix!`);
    } catch (err) {
      setErrorMessage('Failed to sync new skill with database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove a skill
  const handleRemoveSkill = async (skillToRemove) => {
    const updated = { ...skillsMatrix };
    delete updated[skillToRemove];
    setSkillsMatrix(updated);
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        skills_matrix: updated
      });
      setProfile(response.data);
      triggerSuccess(`Removed "${skillToRemove}".`);
    } catch (err) {
      setErrorMessage('Failed to remove skill.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    const stackList = newProject.tech_stack
      ? newProject.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const projectObj = {
      id: Date.now(),
      title: newProject.title.trim(),
      tech_stack: stackList,
      description: newProject.description.trim(),
      github_url: newProject.github_url.trim(),
      live_url: newProject.live_url.trim(),
    };

    const updatedProjects = [projectObj, ...projects];
    setProjects(updatedProjects);
    setShowAddProject(false);
    setNewProject({ title: '', tech_stack: '', description: '', github_url: '', live_url: '' });
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        projects: updatedProjects
      });
      setProfile(response.data);
      triggerSuccess('Project added successfully!');
    } catch (err) {
      setErrorMessage('Failed to add project.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a Project
  const handleDeleteProject = async (projectId) => {
    const updated = projects.filter((p, index) => (p.id ? p.id !== projectId : index !== projectId));
    setProjects(updated);
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        projects: updated
      });
      setProfile(response.data);
      triggerSuccess('Project deleted.');
    } catch (err) {
      setErrorMessage('Failed to delete project.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new Certification
  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!newCert.name.trim()) return;

    const covered = newCert.skills_covered
      ? newCert.skills_covered.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const certObj = {
      name: newCert.name.trim(),
      issuer: newCert.issuer.trim(),
      issue_year: parseInt(newCert.issue_year, 10) || new Date().getFullYear(),
      credential_url: newCert.credential_url.trim(),
      skills_covered: covered
    };

    const updatedCerts = [certObj, ...certifications];
    setCertifications(updatedCerts);
    setShowAddCert(false);
    setNewCert({ name: '', issuer: '', issue_year: new Date().getFullYear(), credential_url: '', skills_covered: '' });
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        certifications: updatedCerts
      });
      setProfile(response.data);
      triggerSuccess('Certification recorded! Covered skills boosted by +15%.');
    } catch (err) {
      setErrorMessage('Failed to save certification.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a Certification
  const handleDeleteCert = async (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        certifications: updated
      });
      setProfile(response.data);
      triggerSuccess('Certification removed.');
    } catch (err) {
      setErrorMessage('Failed to remove certification.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Settings & Preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.patch('/students/me/settings', preferences);
      setPreferences(response.data);
      triggerSuccess('Preferences saved successfully!');
    } catch (err) {
      setErrorMessage('Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export NEP 2020 DigiLocker Transcript
  const handleExportNEPTranscript = async () => {
    setIsExportingTranscript(true);
    try {
      const response = await apiClient.get('/students/me/nep-transcript');
      setTranscriptData(response.data);
      triggerSuccess('Verified NEP 2020 academic transcript generated!');
    } catch (err) {
      setErrorMessage('Could not generate transcript. Ensure profile details are filled.');
    } finally {
      setIsExportingTranscript(false);
    }
  };

  // Sync GitHub Activity
  const handleSyncGithub = async () => {
    setIsSyncingGithub(true);
    try {
      const response = await apiClient.post('/students/me/github-sync', {
        github_handle: personalForm.github_handle || undefined,
      });
      triggerSuccess(`GitHub profile synced! Engineering Score: ${response.data.engineering_score || 85}/100`);
      loadProfile();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not sync GitHub activity.');
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const initials = () => {
    const fn = personalForm.first_name || currentUser?.first_name || '';
    const ln = personalForm.last_name || currentUser?.last_name || '';
    if (fn) return (fn[0] + (ln ? ln[0] : '')).toUpperCase();
    return (currentUser?.username?.[0] || 'U').toUpperCase();
  };

  const profileStrength = profile?.profile_strength_score !== undefined 
    ? Math.round(profile.profile_strength_score) 
    : 0;

  const breakdown = profile?.profile_strength_breakdown || {
    cognitive_score: 0,
    projects_experience_score: 0,
    certifications_score: 0,
    academics_score: 0
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* SUCCESS / ERROR TOAST NOTIFICATIONS */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="text-sm font-semibold">{saveSuccessMsg}</span>
          <button onClick={() => setSaveSuccessMsg('')} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {/* TOP HERO PROFILE CARD */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 transition-all">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar + Main Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 min-w-0">
            {/* Avatar with Change Overlay */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials()}</span>
                )}
              </div>

              {/* Edit Avatar Overlay Button */}
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]"
                title="Change Profile Picture"
              >
                <Camera size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
              </button>

              {/* Verified Badge Icon */}
              {profile?.is_verified && (
                <div 
                  className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full ring-2 ring-white shadow-sm"
                  title="Cognitive Verified Candidate"
                >
                  <ShieldCheck size={14} />
                </div>
              )}
            </div>

            {/* Candidate Summary Info */}
            <div className="text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                  {personalForm.first_name
                    ? `${personalForm.first_name} ${personalForm.last_name || ''}`.trim()
                    : currentUser?.username || 'User Profile'}
                </h1>
                
                {profile?.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck size={13} /> Verified
                  </span>
                )}

                <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUser?.role === 'student' ? 'Candidate' : currentUser?.role}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-500 mb-2">
                @{personalForm.username || currentUser?.username}
                {personalForm.institution && (
                  <span className="text-slate-400"> · {personalForm.institution}</span>
                )}
                {personalForm.department && (
                  <span className="text-slate-400"> ({personalForm.department})</span>
                )}
              </p>

              {personalForm.bio ? (
                <p className="text-sm text-slate-600 max-w-xl line-clamp-2">
                  {personalForm.bio}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No bio added yet. Click 'Edit Profile' below to introduce yourself.
                </p>
              )}

              {/* Placement Status Tag */}
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  personalForm.placement_status === 'PLACED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : personalForm.placement_status === 'OPEN_TO_INTERN'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    personalForm.placement_status === 'PLACED' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  {personalForm.placement_status === 'OPEN_TO_INTERN' ? 'Open to Internships' : personalForm.placement_status}
                </span>

                {personalForm.degree && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                    {personalForm.degree} {personalForm.graduation_year ? `'${String(personalForm.graduation_year).slice(-2)}` : ''}
                  </span>
                )}

                {personalForm.cgpa !== '' && personalForm.cgpa !== null && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                    CGPA: {personalForm.cgpa}/10
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Strength Score Card */}
          <div className="w-full lg:w-72 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                Profile Strength
              </span>
              <span className="text-2xl font-black text-amber-400">
                {profileStrength}<span className="text-sm font-normal text-slate-400">/100</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/80 rounded-full h-2.5 mb-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, profileStrength))}%` }}
              />
            </div>

            {/* 4 Pillars Mini-Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-700/60 text-slate-300">
              <div title="Verified Cognitive & Viva Assessments (45% Weight)">
                <span className="text-slate-400 block text-[10px]">Cognitive (45%)</span>
                <span className="font-bold text-white">{Math.round(breakdown.cognitive_score || 0)}/100</span>
              </div>
              <div title="Mean Skill Proficiency & Projects (30% Weight)">
                <span className="text-slate-400 block text-[10px]">Projects (30%)</span>
                <span className="font-bold text-white">{Math.round(breakdown.projects_experience_score || 0)}/100</span>
              </div>
              <div title="Industry Certifications & Credentials (15% Weight)">
                <span className="text-slate-400 block text-[10px]">Certifications (15%)</span>
                <span className="font-bold text-white">{Math.round(breakdown.certifications_score || 0)}/100</span>
              </div>
              <div title="Normalized Academic CGPA (10% Weight)">
                <span className="text-slate-400 block text-[10px]">Academics (10%)</span>
                <span className="font-bold text-white">{Math.round(breakdown.academics_score || 0)}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200/80">
        {[
          { id: 'overview', label: 'Profile & Academics', icon: User },
          { id: 'skills', label: 'Skills Matrix', icon: Sparkles, badge: Object.keys(skillsMatrix).length },
          { id: 'projects', label: 'Projects', icon: FolderGit2, badge: projects.length },
          { id: 'certifications', label: 'Certifications', icon: Award, badge: certifications.length },
          { id: 'passport', label: 'DigiLocker & NEP', icon: FileCheck },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/60'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & ACADEMICS */}
      {activeTab === 'overview' && (
        <form onSubmit={handleSavePersonalInfo} className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Personal & Professional Details
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Update your identity details, professional headline, and contact points.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={personalForm.first_name}
                  onChange={(e) => setPersonalForm({ ...personalForm, first_name: e.target.value })}
                  placeholder="e.g. Pranav"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={personalForm.last_name}
                  onChange={(e) => setPersonalForm({ ...personalForm, last_name: e.target.value })}
                  placeholder="e.g. Kukreja"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={personalForm.username}
                    onChange={(e) => setPersonalForm({ ...personalForm, username: e.target.value })}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={personalForm.phone_number}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone_number: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Headline / Designation
                </label>
                <input
                  type="text"
                  value={personalForm.current_designation}
                  onChange={(e) => setPersonalForm({ ...personalForm, current_designation: e.target.value })}
                  placeholder="e.g. Aspiring Full-Stack Software Engineer"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Placement Status
                </label>
                <select
                  value={personalForm.placement_status}
                  onChange={(e) => setPersonalForm({ ...personalForm, placement_status: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900 cursor-pointer"
                >
                  <option value="UNPLACED">Unplaced</option>
                  <option value="OPEN_TO_INTERN">Open to Internships</option>
                  <option value="PLACED">Placed</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                  placeholder="Briefly describe your passion, career goals, and technical or functional strengths..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Academic Credentials Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap size={18} className="text-purple-600" />
                Academic Credentials & Education
              </h2>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                10% of Profile Strength
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Your academic records feed directly into institutional analytics and candidate strength rating.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institution (College / University)
                </label>
                <input
                  type="text"
                  value={personalForm.institution}
                  onChange={(e) => setPersonalForm({ ...personalForm, institution: e.target.value })}
                  placeholder="e.g. Indian Institute of Technology, Delhi"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={personalForm.department}
                  onChange={(e) => setPersonalForm({ ...personalForm, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Degree
                </label>
                <input
                  type="text"
                  value={personalForm.degree}
                  onChange={(e) => setPersonalForm({ ...personalForm, degree: e.target.value })}
                  placeholder="e.g. B.Tech / B.Com / MBA"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>CGPA (out of 10.0)</span>
                  <span className="text-[10px] text-purple-600 lowercase font-normal">Score boost</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={personalForm.cgpa}
                  onChange={(e) => setPersonalForm({ ...personalForm, cgpa: e.target.value })}
                  placeholder="e.g. 8.75"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={personalForm.graduation_year}
                  onChange={(e) => setPersonalForm({ ...personalForm, graduation_year: e.target.value })}
                  placeholder="e.g. 2026"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles & Portfolio Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Globe size={18} className="text-emerald-600" />
              Online Links & Portfolios
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Connect your professional presence for recruiters and institutional review.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Github size={13} />
                  GitHub Handle
                </label>
                <input
                  type="text"
                  value={personalForm.github_handle}
                  onChange={(e) => setPersonalForm({ ...personalForm, github_handle: e.target.value })}
                  placeholder="e.g. pranavkukreja"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Linkedin size={13} />
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={personalForm.linkedin_url}
                  onChange={(e) => setPersonalForm({ ...personalForm, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe size={13} />
                  Personal Website / Portfolio
                </label>
                <input
                  type="url"
                  value={personalForm.portfolio_url}
                  onChange={(e) => setPersonalForm({ ...personalForm, portfolio_url: e.target.value })}
                  placeholder="https://myportfolio.dev"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Submit / Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SKILLS MATRIX */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Add Skill Form Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              Add Verified Skills
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Add technical skills, frameworks, tools, or soft skills to your verified skills matrix (Ws).
            </p>

            {/* Quick Add Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill name (e.g. React, Python, Docker, Figma)..."
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAddSkill()}
                disabled={!newSkillName.trim() || isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Popular Suggestions */}
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-400 block mb-2">
                Quick Add Popular Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                  const alreadyHas = !!skillsMatrix[skill];
                  return (
                    <button
                      key={skill}
                      type="button"
                      disabled={alreadyHas || isSaving}
                      onClick={() => handleAddSkill(skill)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        alreadyHas
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 active:scale-95'
                      }`}
                    >
                      {alreadyHas ? <Check size={12} /> : <Plus size={12} />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Skills Grid */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Current Skills Matrix</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {Object.keys(skillsMatrix).length} skills
                </span>
              </h3>
              <span className="text-xs text-slate-400">
                Formula: Ws = 0.6×Pe + 0.4×Er (+15% Credential Boost)
              </span>
            </div>

            {Object.keys(skillsMatrix).length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No skills in matrix yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Type skills above or select from quick suggestions to build your candidate capability profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(skillsMatrix).map(([skillName, data]) => {
                  const isCertified = data?.is_certified || (certifications.some(c => 
                    (c.skills_covered || []).some(s => s.toLowerCase() === skillName.toLowerCase())
                  ));
                  const weight = typeof data === 'object' ? (data.weight || data.project_evidence || 70) : 70;

                  return (
                    <div
                      key={skillName}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 group hover:border-blue-300 hover:bg-white transition-all shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {skillName}
                          </p>
                          {isCertified && (
                            <span 
                              className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5"
                              title="+15% Industry Credential Multiplier Active"
                            >
                              <Award size={10} /> +15% Boost
                            </span>
                          )}
                        </div>

                        {/* Skill Proficiency Bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(20, weight))}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">
                            {weight}%
                          </span>
                        </div>
                      </div>

                      {/* Remove Skill Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skillName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove Skill"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 size={18} className="text-blue-600" />
                  Engineering & Practical Projects
                </h2>
                <p className="text-xs text-slate-500">
                  Projects demonstrate practical evidence (Pe) and contribute 30% to your overall profile score.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddProject(!showAddProject)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>

            {/* Add Project Form Drawer */}
            {showAddProject && (
              <form onSubmit={handleAddProject} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Add New Project</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="e.g. Distributed Task Queue"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={newProject.tech_stack}
                      onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                      placeholder="e.g. Python, Redis, Docker, FastAPI"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">GitHub Repository URL</label>
                    <input
                      type="url"
                      value={newProject.github_url}
                      onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                      placeholder="https://github.com/username/project"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Live Demo URL</label>
                    <input
                      type="url"
                      value={newProject.live_url}
                      onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                      placeholder="https://myproject.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description & Architecture</label>
                    <textarea
                      rows={2}
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Key challenges solved, architecture, and measurable impact..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            )}

            {/* Projects List */}
            {projects.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <FolderGit2 size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No projects listed yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add your software, research, or design projects to demonstrate real-world skills.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, idx) => {
                  const stack = Array.isArray(project.tech_stack)
                    ? project.tech_stack
                    : (project.tech_stack ? String(project.tech_stack).split(',') : []);

                  return (
                    <div
                      key={project.id || idx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {project.title || project.name}
                          </h3>
                          <button
                            onClick={() => handleDeleteProject(project.id || idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                            title="Delete Project"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {project.description && (
                          <p className="text-xs text-slate-600 mb-3 line-clamp-3">
                            {project.description}
                          </p>
                        )}

                        {stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {stack.map((t, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 text-xs">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:text-blue-600 font-semibold flex items-center gap-1"
                          >
                            <Github size={13} /> Source Code
                          </a>
                        )}
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                          >
                            <ArrowUpRight size={13} /> Live Preview
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  Industry Certifications & Credentials
                </h2>
                <p className="text-xs text-slate-500">
                  Certifications grant an automatic +15% proficiency multiplier ($W_s = \min(100, \text{round}(W_s \times 1.15))$) to covered skills.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCert(!showAddCert)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Certification</span>
              </button>
            </div>

            {/* Add Certification Drawer */}
            {showAddCert && (
              <form onSubmit={handleAddCert} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Add Industry Credential</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Certification Name</label>
                    <input
                      type="text"
                      required
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Issuer / Organization</label>
                    <input
                      type="text"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services / Google Cloud"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Issue Year</label>
                    <input
                      type="number"
                      value={newCert.issue_year}
                      onChange={(e) => setNewCert({ ...newCert, issue_year: e.target.value })}
                      placeholder="e.g. 2024"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Credential URL</label>
                    <input
                      type="url"
                      value={newCert.credential_url}
                      onChange={(e) => setNewCert({ ...newCert, credential_url: e.target.value })}
                      placeholder="https://credly.com/badges/..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                      <span>Skills Covered (comma-separated)</span>
                      <span className="text-[10px] text-amber-600 font-bold lowercase">+15% boost applied</span>
                    </label>
                    <input
                      type="text"
                      value={newCert.skills_covered}
                      onChange={(e) => setNewCert({ ...newCert, skills_covered: e.target.value })}
                      placeholder="e.g. AWS, Cloud Computing, Docker, Python"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCert(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Save Credential
                  </button>
                </div>
              </form>
            )}

            {/* Certifications List */}
            {certifications.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Award size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No certifications recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add credentials to boost your profile strength and receive +15% proficiency multipliers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:bg-white hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {cert.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500">
                            {cert.issuer || 'Verified Credential'} {cert.issue_year ? `· ${cert.issue_year}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCert(i)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg shrink-0"
                          title="Delete Certification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {cert.skills_covered && cert.skills_covered.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {cert.skills_covered.map((s, si) => (
                            <span
                              key={si}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              +{s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {cert.credential_url && (
                      <div className="pt-3 mt-3 border-t border-slate-200/60 text-xs">
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Verify Credential
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DIGILOCKER & NEP 2020 ACADEMIC PASSPORT */}
      {activeTab === 'passport' && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-600" />
                  NEP 2020 Academic Credit Passport & DigiLocker
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  One Nation One Student ID (APAAR), Academic Bank of Credits (ABC), and National Credit Framework (NCrF).
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportNEPTranscript}
                disabled={isExportingTranscript}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isExportingTranscript ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                <span>Generate NEP Transcript</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  APAAR ID
                </span>
                <p className="text-base font-bold text-slate-900 font-mono">
                  {personalForm.apaar_id || 'Not Linked'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">One Nation One Student ID</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Academic Bank of Credits (ABC)
                </span>
                <p className="text-base font-bold text-slate-900 font-mono">
                  {personalForm.abc_id || 'Not Linked'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">ABC Account ID</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  NHEQF Qualification Level
                </span>
                <p className="text-base font-bold text-purple-700">
                  Level 6.0
                </p>
                <p className="text-[11px] text-slate-500 mt-1">4-Year Bachelor Degree / Honours</p>
              </div>
            </div>

            {/* Generated Transcript Display */}
            {transcriptData && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 mb-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck size={16} /> Official NEP 2020 Transcript Generated
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    {transcriptData.transcript_id}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-500 block">NCrF Credits Earned:</span>
                    <span className="font-bold text-slate-900 text-sm">{transcriptData.ncrf_credits_earned} Credits</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">AICTE Activity Points:</span>
                    <span className="font-bold text-slate-900 text-sm">{transcriptData.aicte_activity_points} Points</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PARAKH Grade:</span>
                    <span className="font-bold text-slate-900 text-sm">{transcriptData.parakh_holistic_grade || 'A+'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DigiLocker Status:</span>
                    <span className="font-bold text-emerald-700 text-sm">{transcriptData.digilocker_verification_status}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  SHA-256 Seal: {transcriptData.digilocker_sha256_hash}
                </p>
              </div>
            )}

            {/* GitHub Engineering Screening Radar */}
            <div className="pt-6 border-t border-slate-200/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Github size={16} />
                    GitHub Engineering & Anti-Vibe-Coding Radar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Screens commit velocity, CI/CD automated tests, Dockerfiles, and conventional commit patterns.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSyncGithub}
                  disabled={isSyncingGithub}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSyncingGithub ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
                  <span>Sync GitHub Radar</span>
                </button>
              </div>

              {personalForm.github_handle ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                      <Github size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">@{personalForm.github_handle}</p>
                      <p className="text-xs text-slate-500">Ready for automated repository audit</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Linked
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Link your GitHub username under "Profile & Academics" to enable engineering radar verification.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS & PERSONALIZATION */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Settings size={18} className="text-blue-600" />
              Settings & Personalization
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure alert preferences, career discovery modes, and candidate privacy settings.
            </p>

            {/* Notification Toggles */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Bell size={14} className="text-slate-500" />
                Notification Alerts
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'opportunity_alerts', label: 'New Job & Internship Matching Alerts', desc: 'Dispatches alerts when matching positions are published by employers' },
                  { key: 'deadline_reminders', label: '72-Hour Application Deadline Reminders', desc: 'Alerts you before deadlines close on saved or matching opportunities' },
                  { key: 'scheme_alerts', label: 'Affirmative Action & Diversity Scheme Alerts', desc: 'Notifies you when national fellowships, scholarships, or DEI programs open' },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.[item.key] ?? true}
                      onChange={(e) => {
                        setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            [item.key]: e.target.checked
                          }
                        });
                      }}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Preferences */}
            <div className="mb-6 pt-6 border-t border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Briefcase size={14} className="text-slate-500" />
                Work Arrangement Preference
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'ALL', label: 'All Arrangements', desc: 'Open to Remote, Hybrid, and Onsite' },
                  { value: 'REMOTE', label: 'Remote Only', desc: '100% Work from Anywhere' },
                  { value: 'HYBRID', label: 'Hybrid / Onsite', desc: 'Flexible In-Office Arrangement' }
                ].map((arr) => {
                  const isSelected = preferences.career_discovery?.preferred_work_arrangement === arr.value;
                  return (
                    <button
                      key={arr.value}
                      type="button"
                      onClick={() => {
                        setPreferences({
                          ...preferences,
                          career_discovery: {
                            ...preferences.career_discovery,
                            preferred_work_arrangement: arr.value
                          }
                        });
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>{arr.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{arr.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy & Blind Screening */}
            <div className="mb-6 pt-6 border-t border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lock size={14} className="text-slate-500" />
                Privacy & Blind Screening
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={preferences.privacy?.share_profile_with_verified_recruiters ?? true}
                    onChange={(e) => {
                      setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          share_profile_with_verified_recruiters: e.target.checked
                        }
                      });
                    }}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Allow Verified Recruiters to Discover Profile</p>
                    <p className="text-xs text-slate-500">Makes your verified skills matrix searchable in talent search</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AVATAR PICKER MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera size={18} className="text-blue-600" />
                Choose Profile Avatar
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Pick from our illustrated presets or enter a custom photo image URL.
            </p>

            {/* Preset Avatars Grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleSelectAvatar(av.url)}
                  className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-blue-500 hover:scale-105 transition-all p-1 bg-slate-50 cursor-pointer shadow-xs"
                >
                  <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Or Enter Custom Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <button
                  type="button"
                  disabled={!customAvatarInput.trim() || isSaving}
                  onClick={() => handleSelectAvatar(customAvatarInput.trim())}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
