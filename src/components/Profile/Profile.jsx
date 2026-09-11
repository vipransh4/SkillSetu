import React, { useState, useEffect, useRef } from 'react';
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
  Link,
  Building,
  Users,
  UploadCloud
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';

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

const POPULAR_SKILL_SUGGESTIONS = [
  'React', 'Python', 'TypeScript', 'Node.js', 'Django', 
  'PostgreSQL', 'Docker', 'AWS', 'TailwindCSS', 'Figma', 
  'Machine Learning', 'Git', 'Next.js', 'REST API'
];

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

const Profile = ({ onRouteChange, user: propUser, onUserUpdate, initialTab = 'overview' }) => {
  const currentUser = propUser || authService.getUser();
  const isRecruiter = currentUser?.role === 'industry' || currentUser?.role === 'recruiter' || currentUser?.backend_role === 'RECRUITER';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [recruiterSettings, setRecruiterSettings] = useState({
    common: { email_alerts: true, in_app_alerts: true, high_contrast: false },
    candidate_screening: { default_blind_screening: false, minimum_engineering_score_filter: 60, require_verified_assessment: false },
    hiring_workflow: { auto_advance_high_match: false, application_review_assignment: 'MANUAL', new_applicant_alert_frequency: 'INSTANT' },
    branding: { show_diversity_employer_badge: true, public_company_profile_visible: true }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

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
    apaar_id: '',
    abc_id: '',
    minor_specialization: '',
    nheqf_level: 'LEVEL_6_0',
    github_handle: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  const [recruiterForm, setRecruiterForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    designation: '',
    department: '',
    contact_phone: '',
    company_name: '',
    company_website: '',
    company_reg_number: '',
    company_logo_url: '',
    company_description: '',
    company_headquarters: ''
  });

  const [skillsMatrix, setSkillsMatrix] = useState({});
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [preferences, setPreferences] = useState({
    notifications: { email_application_updates: true, interview_invites: true, skill_match_alerts: true, new_opportunity_alerts: true },
    privacy: { share_profile_with_verified_recruiters: true, blind_screening_opt_in: false },
    career_discovery: { preferred_work_arrangement: 'ALL', target_industry: '' }
  });

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(80);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', tech_stack: '', description: '', github_url: '', live_url: '' });
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issue_year: new Date().getFullYear(), credential_url: '', skills_covered: '' });

  const triggerSuccess = (msg) => {
    setSaveSuccessMsg(msg);
    setErrorMessage('');
    setTimeout(() => setSaveSuccessMsg(''), 4500);
  };

  const loadProfileData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (isRecruiter) {
        const [recruiterRes, compRes, settingsRes] = await Promise.allSettled([
          apiClient.get('/recruiters/me'),
          apiClient.get('/recruiters/company'),
          apiClient.get('/recruiters/me/settings')
        ]);

        let recData = null;
        if (recruiterRes.status === 'fulfilled') {
          recData = recruiterRes.value.data;
          setProfile(recData);
          setRecruiterForm(prev => ({
            ...prev,
            first_name: recData.first_name || currentUser?.first_name || '',
            last_name: recData.last_name || currentUser?.last_name || '',
            username: recData.username || currentUser?.username || '',
            designation: recData.designation || '',
            department: recData.department || '',
            contact_phone: recData.contact_phone || '',
          }));
        }

        if (compRes.status === 'fulfilled' && compRes.value.data) {
          const c = compRes.value.data;
          setCompanyData(c);
          setRecruiterForm(prev => ({
            ...prev,
            company_name: c.name || '',
            company_website: c.website || '',
            company_reg_number: c.registration_number || '',
            company_logo_url: c.branding_logo_url || '',
            company_description: c.description || '',
            company_headquarters: c.headquarters || ''
          }));
        } else if (recData?.company) {
          const c = recData.company;
          setCompanyData(c);
          setRecruiterForm(prev => ({
            ...prev,
            company_name: c.name || '',
            company_website: c.website || '',
            company_reg_number: c.registration_number || '',
            company_logo_url: c.branding_logo_url || '',
            company_description: c.description || '',
            company_headquarters: c.headquarters || ''
          }));
        }

        if (settingsRes.status === 'fulfilled') {
          setRecruiterSettings(settingsRes.value.data);
        }

        try {
          const jobsRes = await apiClient.get('/listings/');
          if (Array.isArray(jobsRes.data)) {
            setRecruiterJobs(jobsRes.data);
          }
        } catch {
          setRecruiterJobs([]);
        }

      } else {
        const response = await apiClient.get('/students/me');
        const data = response.data;
        setProfile(data);

        setPersonalForm({
          first_name: data.first_name || currentUser?.first_name || '',
          last_name: data.last_name || currentUser?.last_name || '',
          username: data.username || currentUser?.username || '',
          bio: data.bio || '',
          phone_number: data.phone_number || '',
          gender: data.gender || 'PREFER_NOT_TO_SAY',
          current_designation: data.current_designation || '',
          experience_years: data.experience_years || 0,
          placement_status: data.placement_status || 'UNPLACED',
          institution: data.institution || '',
          department: data.department || '',
          degree: data.degree || '',
          cgpa: data.cgpa !== null && data.cgpa !== undefined ? data.cgpa : '',
          graduation_year: data.graduation_year || '',
          apaar_id: data.apaar_id || '',
          abc_id: data.abc_id || '',
          minor_specialization: data.minor_specialization || '',
          nheqf_level: data.nheqf_level || 'LEVEL_6_0',
          github_handle: data.github_handle || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          portfolio_url: data.portfolio_url || '',
        });

        setSkillsMatrix(data.skills_matrix || {});
        setProjects(data.projects || []);
        setCertifications(data.certifications || []);
        if (data.preferences && Object.keys(data.preferences).length > 0) {
          setPreferences(prev => ({
            ...prev,
            ...data.preferences,
            notifications: { ...prev.notifications, ...(data.preferences.notifications || {}) },
            privacy: { ...prev.privacy, ...(data.preferences.privacy || {}) },
            career_discovery: { ...prev.career_discovery, ...(data.preferences.career_discovery || {}) }
          }));
        }
      }
    } catch (err) {
      setErrorMessage('Failed to load profile data from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUser?.id, currentUser?.role]);

  const initials = () => {
    const f = personalForm.first_name || recruiterForm.first_name || currentUser?.first_name || '';
    const l = personalForm.last_name || recruiterForm.last_name || currentUser?.last_name || '';
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    const u = currentUser?.username || 'U';
    return u.slice(0, 2).toUpperCase();
  };

  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('The selected image exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage('');

    try {
      const res = await authService.uploadAvatar(file);
      if (res?.avatar_url) {
        if (onUserUpdate) {
          const fresh = authService.getUser();
          onUserUpdate(fresh);
        }
        triggerSuccess('Profile picture updated successfully!');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setErrorMessage('');
    try {
      await authService.removeAvatar();
      if (onUserUpdate) {
        const fresh = authService.getUser();
        onUserUpdate(fresh);
      }
      setIsAvatarModalOpen(false);
      triggerSuccess('Profile picture removed. Reverted to standard gradient initials.');
    } catch (err) {
      setErrorMessage('Failed to remove profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSelectAvatarUrl = async (url) => {
    if (!url) return;
    setIsUploadingAvatar(true);
    setErrorMessage('');
    try {
      await authService.updateCurrentUser({ avatar_url: url });
      if (isRecruiter) {
        await apiClient.put('/auth/me', { avatar_url: url });
      } else {
        await apiClient.put('/students/me', { avatar_url: url });
      }
      if (onUserUpdate) {
        const fresh = authService.getUser();
        onUserUpdate(fresh);
      }
      setIsAvatarModalOpen(false);
      setCustomAvatarInput('');
      triggerSuccess('Profile avatar updated successfully!');
    } catch (err) {
      setErrorMessage('Failed to apply selected avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSavePersonalInfo = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const payload = {
      ...personalForm,
      cgpa: personalForm.cgpa !== '' ? parseFloat(personalForm.cgpa) : null,
      graduation_year: personalForm.graduation_year !== '' ? parseInt(personalForm.graduation_year, 10) : null,
      experience_years: parseFloat(personalForm.experience_years) || 0,
    };

    try {
      const response = await apiClient.put('/students/me', payload);
      setProfile(response.data);

      if (onUserUpdate) {
        const current = authService.getUser() || {};
        const updated = {
          ...current,
          first_name: payload.first_name,
          last_name: payload.last_name,
          username: payload.username || current.username
        };
        authService.setUser(updated);
        onUserUpdate(updated);
      }

      triggerSuccess('Profile & Academic details saved successfully!');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRecruiterProfile = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      await apiClient.put('/recruiters/me', {
        designation: recruiterForm.designation,
        department: recruiterForm.department,
        contact_phone: recruiterForm.contact_phone
      });

      if (recruiterForm.company_name) {
        if (companyData) {
          await apiClient.put('/recruiters/company', {
            registration_number: recruiterForm.company_reg_number,
            website: recruiterForm.company_website,
            branding_logo_url: recruiterForm.company_logo_url,
            description: recruiterForm.company_description,
            headquarters: recruiterForm.company_headquarters
          });
        } else {
          await apiClient.post('/recruiters/company', {
            name: recruiterForm.company_name,
            registration_number: recruiterForm.company_reg_number,
            website: recruiterForm.company_website,
            branding_logo_url: recruiterForm.company_logo_url,
            description: recruiterForm.company_description,
            headquarters: recruiterForm.company_headquarters
          });
        }
      }

      if (recruiterForm.first_name || recruiterForm.last_name || recruiterForm.username) {
        await apiClient.put('/auth/me', {
          first_name: recruiterForm.first_name,
          last_name: recruiterForm.last_name,
          username: recruiterForm.username
        });
      }

      if (onUserUpdate) {
        const current = authService.getUser() || {};
        const updated = {
          ...current,
          first_name: recruiterForm.first_name,
          last_name: recruiterForm.last_name,
          username: recruiterForm.username || current.username
        };
        authService.setUser(updated);
        onUserUpdate(updated);
      }

      triggerSuccess('Recruiter & Corporate details saved successfully!');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save corporate identity details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRecruiterSettings = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const res = await apiClient.put('/recruiters/me/settings', recruiterSettings);
      setRecruiterSettings(res.data);
      triggerSuccess('Hiring preferences saved successfully!');
    } catch (err) {
      setErrorMessage('Failed to update recruiter settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const response = await apiClient.put('/students/me', {
        preferences: preferences
      });
      setProfile(response.data);
      triggerSuccess('Career & Discovery preferences saved!');
    } catch (err) {
      setErrorMessage('Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e?.preventDefault();
    const cleanName = newSkillName.trim();
    if (!cleanName) return;

    const normalized = cleanName.toLowerCase();
    const updatedSkills = {
      ...skillsMatrix,
      [normalized]: {
        project_evidence: Number(newSkillLevel),
        experience_recency: Math.max(40, Number(newSkillLevel) - 10),
        weight: Number(newSkillLevel),
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
      triggerSuccess(`Added "${cleanName}" to verified competencies!`);
    } catch (err) {
      setErrorMessage('Failed to add skill.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSkill = async (skillKey) => {
    const updated = { ...skillsMatrix };
    delete updated[skillKey];
    setSkillsMatrix(updated);
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        skills_matrix: updated
      });
      setProfile(response.data);
      triggerSuccess(`Removed "${skillKey}".`);
    } catch (err) {
      setErrorMessage('Failed to remove skill.');
    } finally {
      setIsSaving(false);
    }
  };

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
      triggerSuccess('Engineering project published to showcase!');
    } catch (err) {
      setErrorMessage('Failed to add project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const updated = projects.filter((p, index) => (p.id ? p.id !== projectId : index !== projectId));
    setProjects(updated);
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        projects: updated
      });
      setProfile(response.data);
      triggerSuccess('Project removed.');
    } catch (err) {
      setErrorMessage('Failed to delete project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!newCert.name.trim()) return;

    const skillsList = newCert.skills_covered
      ? newCert.skills_covered.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const certObj = {
      name: newCert.name.trim(),
      issuer: newCert.issuer.trim(),
      issue_year: parseInt(newCert.issue_year, 10) || new Date().getFullYear(),
      credential_url: newCert.credential_url.trim(),
      skills_covered: skillsList,
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
      triggerSuccess('Industry credential verified & indexed!');
    } catch (err) {
      setErrorMessage('Failed to save certification.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCertification = async (certIndex) => {
    const updated = certifications.filter((_, idx) => idx !== certIndex);
    setCertifications(updated);
    setIsSaving(true);

    try {
      const response = await apiClient.put('/students/me', {
        certifications: updated
      });
      setProfile(response.data);
      triggerSuccess('Certification removed.');
    } catch (err) {
      setErrorMessage('Failed to delete certification.');
    } finally {
      setIsSaving(false);
    }
  };

  const profileStrength = Math.round(profile?.profile_strength_score || 0);
  const breakdown = profile?.profile_strength_breakdown || {
    cognitive_score: 0,
    projects_experience_score: 0,
    certifications_score: 0,
    academics_score: 0
  };

  const recruiterMetrics = profile?.metrics || {
    active_listings_count: recruiterJobs.filter(j => j.status === 'PUBLISHED').length,
    shortlisted_talent_count: 0,
    interviews_scheduled_count: 0,
    total_applicants_count: 0,
    verification_pass_rate: 85.0
  };

  const candidateTabs = [
    { id: 'overview', label: 'Profile & Academics', icon: User },
    { id: 'skills', label: 'Skills Matrix', icon: Sparkles, badge: Object.keys(skillsMatrix).length },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: projects.length },
    { id: 'certifications', label: 'Certifications', icon: Award, badge: certifications.length },
    { id: 'passport', label: 'DigiLocker & NEP', icon: FileCheck },
    { id: 'settings', label: 'Preferences', icon: Settings },
  ];

  const recruiterTabs = [
    { id: 'overview', label: 'Company & Hiring Identity', icon: Building },
    { id: 'jobs', label: 'Active Job Postings', icon: Briefcase, badge: recruiterMetrics.active_listings_count },
    { id: 'pipeline', label: 'Talent Pipeline', icon: Users, badge: recruiterMetrics.shortlisted_talent_count },
    { id: 'team', label: 'Team & Permissions', icon: ShieldCheck },
    { id: 'settings', label: 'Hiring Preferences', icon: Sliders },
  ];

  const currentTabs = isRecruiter ? recruiterTabs : candidateTabs;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading profile workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {saveSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">{saveSuccessMsg}</span>
          <button onClick={() => setSaveSuccessMsg('')} className="text-white/70 hover:text-white ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle size={18} />
          <span className="text-sm font-semibold">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-white/70 hover:text-white ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelected}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 transition-all">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold tracking-tight">
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

              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]"
                title="Change Profile Photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  <>
                    <Camera size={20} className="mb-0.5" />
                    <span className="text-[10px] font-semibold tracking-wide uppercase">Change</span>
                  </>
                )}
              </button>

              {(profile?.is_verified || isRecruiter) && (
                <div 
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full ring-2 ring-white shadow-xs"
                  title={isRecruiter ? "Verified Enterprise Recruiter" : "Cognitive Verified Candidate"}
                >
                  <ShieldCheck size={13} />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                  {isRecruiter ? (
                    recruiterForm.first_name
                      ? `${recruiterForm.first_name} ${recruiterForm.last_name || ''}`.trim()
                      : currentUser?.username || 'Recruiter'
                  ) : (
                    personalForm.first_name
                      ? `${personalForm.first_name} ${personalForm.last_name || ''}`.trim()
                      : currentUser?.username || 'Candidate'
                  )}
                </h1>

                {(profile?.is_verified || isRecruiter) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                    <ShieldCheck size={12} /> {isRecruiter ? 'Verified Partner' : 'Verified'}
                  </span>
                )}

                <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                  {isRecruiter ? 'Recruiter' : 'Candidate'}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-0.5 mb-1 leading-snug">
                {isRecruiter
                  ? (recruiterForm.designation || 'Corporate Recruiter & Talent Lead')
                  : (personalForm.current_designation || (personalForm.degree ? `${personalForm.degree} Candidate` : 'Aspiring Technical Professional'))}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-xs text-slate-500 mb-3">
                <span className="font-semibold text-slate-600">
                  @{isRecruiter ? (recruiterForm.username || currentUser?.username) : (personalForm.username || currentUser?.username)}
                </span>
                {isRecruiter ? (
                  companyData?.name && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600 font-medium">{companyData.name}</span>
                    </>
                  )
                ) : (
                  personalForm.institution && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600 font-medium">{personalForm.institution}</span>
                    </>
                  )
                )}
                {personalForm.department && !isRecruiter && (
                  <span className="text-slate-400">({personalForm.department})</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {isRecruiter ? (
                  <>
                    {companyData?.headquarters && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 font-medium">
                        {companyData.headquarters}
                      </span>
                    )}
                    {companyData?.website && (
                      <a
                        href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 hover:text-blue-600 font-medium"
                      >
                        <Globe size={12} />
                        Website
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      personalForm.placement_status === 'PLACED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : personalForm.placement_status === 'OPEN_TO_INTERN'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                        : 'bg-slate-50 text-slate-600 border-slate-200/80'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        personalForm.placement_status === 'PLACED' ? 'bg-emerald-500' : 'bg-blue-600'
                      }`} />
                      {personalForm.placement_status === 'OPEN_TO_INTERN' ? 'Open to Internships' : personalForm.placement_status}
                    </span>

                    {personalForm.degree && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 font-medium">
                        {personalForm.degree} {personalForm.graduation_year ? `'${String(personalForm.graduation_year).slice(-2)}` : ''}
                      </span>
                    )}

                    {personalForm.cgpa !== '' && personalForm.cgpa !== null && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200/80 font-semibold tabular-nums">
                        CGPA: {personalForm.cgpa}/10
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4.5 shadow-xs shrink-0">
            {isRecruiter ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BarChart3 size={14} className="text-blue-600" />
                    Hiring Telemetry
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {recruiterMetrics.active_listings_count} Open Positions
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-600 transition-all duration-700 ease-out"
                        strokeDasharray={`${Math.min(100, Math.max(5, recruiterMetrics.verification_pass_rate))}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {Math.round(recruiterMetrics.verification_pass_rate)}%
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 block">Candidate Verification</span>
                    <p className="text-[11px] text-slate-500 leading-tight">Average pass rate on cognitive benchmarks</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-200/80">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">Shortlisted</span>
                    <span className="font-bold text-slate-900 tabular-nums">{recruiterMetrics.shortlisted_talent_count} Candidates</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">Interviews</span>
                    <span className="font-bold text-slate-900 tabular-nums">{recruiterMetrics.interviews_scheduled_count} Scheduled</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-600" />
                    Profile Strength
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 tabular-nums">
                    {profileStrength}/100
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-600 transition-all duration-700 ease-out"
                        strokeDasharray={`${Math.min(100, Math.max(5, profileStrength))}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">{profileStrength}%</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 block">Candidate Index</span>
                    <p className="text-[11px] text-slate-500 leading-tight">Composite 4-signal industry readiness score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2.5 border-t border-slate-200/80">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">Cognitive (45%)</span>
                    <span className="font-bold text-slate-900 tabular-nums">{Math.round(breakdown.cognitive_score || 0)}/100</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">Projects (30%)</span>
                    <span className="font-bold text-slate-900 tabular-nums">{Math.round(breakdown.projects_experience_score || 0)}/100</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">Certs (15%)</span>
                    <span className="font-bold text-slate-900 tabular-nums">{Math.round(breakdown.certifications_score || 0)}/100</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] font-medium">Academics (10%)</span>
                    <span className="font-bold text-slate-900 tabular-nums">{Math.round(breakdown.academics_score || 0)}/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto mb-8 scrollbar-none border border-slate-200/60">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                  isActive ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isRecruiter ? (
        <div>
          {activeTab === 'overview' && (
            <form onSubmit={handleSaveRecruiterProfile} className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Recruiter Identity & Title
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Personal workplace credentials and contact coordinates for prospective talent.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.first_name}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, first_name: e.target.value })}
                      placeholder="e.g. Sarah"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.last_name}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, last_name: e.target.value })}
                      placeholder="e.g. Jenkins"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Corporate Designation
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.designation}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, designation: e.target.value })}
                      placeholder="e.g. Lead Technical Recruiter"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Hiring Department / Team
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.department}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, department: e.target.value })}
                      placeholder="e.g. Engineering Talent Acquisition"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={recruiterForm.contact_phone}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, contact_phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || ''}
                      className="w-full px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Building size={18} className="text-blue-600" />
                  Corporate Identity & Company Profile
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Company branding visible to candidates on listings, offers, and campus screening dashboards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Company Legal Name
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.company_name}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, company_name: e.target.value })}
                      placeholder="e.g. Nexa Systems Ltd"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Official Website
                    </label>
                    <input
                      type="url"
                      value={recruiterForm.company_website}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, company_website: e.target.value })}
                      placeholder="https://nexasystems.com"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Headquarters (City, Country)
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.company_headquarters}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, company_headquarters: e.target.value })}
                      placeholder="e.g. Bangalore, India"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Corporate Reg / CIN ID
                    </label>
                    <input
                      type="text"
                      value={recruiterForm.company_reg_number}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, company_reg_number: e.target.value })}
                      placeholder="e.g. U72200KA2021PTC145000"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Branding Logo URL
                    </label>
                    <input
                      type="url"
                      value={recruiterForm.company_logo_url}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, company_logo_url: e.target.value })}
                      placeholder="https://nexasystems.com/assets/logo.png"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Company Overview
                    </label>
                    <textarea
                      rows={3}
                      value={recruiterForm.company_description}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, company_description: e.target.value })}
                      placeholder="Brief corporate mission, technologies, and hiring philosophy..."
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end pt-4 border-t border-slate-200/80">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span>Save Corporate Profile</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'jobs' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-600" />
                    Active Job Listings & Postings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Open positions published under your corporate account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRouteChange?.('opportunities')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Post New Role</span>
                </button>
              </div>

              {recruiterJobs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recruiterJobs.map((job) => (
                    <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{job.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            {job.status}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                            {job.role_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {job.location} · {job.stipend_or_ctc} · {job.applications_count || 0} applicants
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('students')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Review Applicants
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No active job listings found</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-4">Publish your first engineering or business role to start receiving matched candidates.</p>
                  <button
                    type="button"
                    onClick={() => onRouteChange?.('opportunities')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                  >
                    Create Job Listing
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Candidate Screening & Pipeline
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Active candidates currently in your recruitment and interview funnel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block font-medium">Applied</span>
                  <span className="text-xl font-bold text-slate-900 tabular-nums">{recruiterMetrics.total_applicants_count}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block font-medium">Shortlisted</span>
                  <span className="text-xl font-bold text-blue-600 tabular-nums">{recruiterMetrics.shortlisted_talent_count}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block font-medium">Interviews</span>
                  <span className="text-xl font-bold text-purple-600 tabular-nums">{recruiterMetrics.interviews_scheduled_count}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block font-medium">Verified Pass Rate</span>
                  <span className="text-xl font-bold text-emerald-600 tabular-nums">{Math.round(recruiterMetrics.verification_pass_rate)}%</span>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => onRouteChange?.('students')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Users size={14} />
                  <span>Open Talent Discovery Engine</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" />
                Team & Organization Permissions
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Corporate administrative authorizations and enterprise seats.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Company Administrator</span>
                    <span className="text-xs text-slate-500">You are authorized to publish jobs, invite teammates, and manage corporate branding.</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    Active Admin
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Talent Outreach Seats</span>
                    <span className="text-xs text-slate-500">Unlimited candidate messaging and verified portfolio reviews.</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Enterprise Tier
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Sliders size={18} className="text-blue-600" />
                Hiring & Candidate Screening Preferences
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Configure algorithmic shortlisting thresholds and anti-bias screening.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Anti-Bias & Blind Screening</h3>
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Default Blind Screening</span>
                      <span className="text-xs text-slate-500">Automatically redacts candidate PII until initial technical shortlisting</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={recruiterSettings.candidate_screening?.default_blind_screening || false}
                      onChange={(e) => setRecruiterSettings({
                        ...recruiterSettings,
                        candidate_screening: { ...recruiterSettings.candidate_screening, default_blind_screening: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Automated Screening Rules</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">Auto-Advance High Match Talent</span>
                        <span className="text-xs text-slate-500">Move candidates with &gt;= 85% skill match automatically to Under Review</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={recruiterSettings.hiring_workflow?.auto_advance_high_match || false}
                        onChange={(e) => setRecruiterSettings({
                          ...recruiterSettings,
                          hiring_workflow: { ...recruiterSettings.hiring_workflow, auto_advance_high_match: e.target.checked }
                        })}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">Show Diversity Employer Badge</span>
                        <span className="text-xs text-slate-500">Feature diversity and affirmative action initiatives across listings</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={recruiterSettings.branding?.show_diversity_employer_badge || false}
                        onChange={(e) => setRecruiterSettings({
                          ...recruiterSettings,
                          branding: { ...recruiterSettings.branding, show_diversity_employer_badge: e.target.checked }
                        })}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveRecruiterSettings}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span>Save Hiring Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {activeTab === 'overview' && (
            <form onSubmit={handleSavePersonalInfo} className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Personal & Professional Identity
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Update your identity details, professional headline, and contact points.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={personalForm.first_name}
                      onChange={(e) => setPersonalForm({ ...personalForm, first_name: e.target.value })}
                      placeholder="e.g. Pranav"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={personalForm.last_name}
                      onChange={(e) => setPersonalForm({ ...personalForm, last_name: e.target.value })}
                      placeholder="e.g. Kukreja"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">@</span>
                      <input
                        type="text"
                        value={personalForm.username}
                        onChange={(e) => setPersonalForm({ ...personalForm, username: e.target.value })}
                        placeholder="username"
                        className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={personalForm.phone_number}
                      onChange={(e) => setPersonalForm({ ...personalForm, phone_number: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Professional Designation
                    </label>
                    <input
                      type="text"
                      value={personalForm.current_designation}
                      onChange={(e) => setPersonalForm({ ...personalForm, current_designation: e.target.value })}
                      placeholder="e.g. Software Systems Student / Full-Stack Engineer"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Placement Status
                    </label>
                    <select
                      value={personalForm.placement_status}
                      onChange={(e) => setPersonalForm({ ...personalForm, placement_status: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="UNPLACED">UNPLACED (Actively Seeking)</option>
                      <option value="OPEN_TO_INTERN">OPEN TO INTERNSHIPS</option>
                      <option value="PLACED">PLACED (Offer Accepted)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Professional Bio
                    </label>
                    <textarea
                      rows={3}
                      value={personalForm.bio}
                      onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                      placeholder="Brief overview of your academic interests, core engineering focus, and ambitions..."
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <GraduationCap size={18} className="text-blue-600" />
                  Academic Credentials
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  College or university records used for placement radar and institutional reporting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={personalForm.institution}
                      onChange={(e) => setPersonalForm({ ...personalForm, institution: e.target.value })}
                      placeholder="e.g. Indian Institute of Information Technology"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Department / Major
                    </label>
                    <input
                      type="text"
                      value={personalForm.department}
                      onChange={(e) => setPersonalForm({ ...personalForm, department: e.target.value })}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Degree Program
                    </label>
                    <input
                      type="text"
                      value={personalForm.degree}
                      onChange={(e) => setPersonalForm({ ...personalForm, degree: e.target.value })}
                      placeholder="e.g. B.Tech / B.E."
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        CGPA (Scale of 10)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={personalForm.cgpa}
                        onChange={(e) => setPersonalForm({ ...personalForm, cgpa: e.target.value })}
                        placeholder="e.g. 9.73"
                        className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        value={personalForm.graduation_year}
                        onChange={(e) => setPersonalForm({ ...personalForm, graduation_year: e.target.value })}
                        placeholder="2026"
                        className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Globe size={18} className="text-blue-600" />
                  Online Profiles & Social Proof
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Links to your open-source projects, code repositories, and professional network.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      GitHub Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">@</span>
                      <input
                        type="text"
                        value={personalForm.github_handle}
                        onChange={(e) => setPersonalForm({ ...personalForm, github_handle: e.target.value })}
                        placeholder="octocat"
                        className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={personalForm.linkedin_url}
                      onChange={(e) => setPersonalForm({ ...personalForm, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      value={personalForm.portfolio_url}
                      onChange={(e) => setPersonalForm({ ...personalForm, portfolio_url: e.target.value })}
                      placeholder="https://pranavkukreja.dev"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end pt-4 border-t border-slate-200/80">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span>Save Profile Details</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-600" />
                      Verified Skills Matrix
                    </h2>
                    <p className="text-xs text-slate-500">
                      Skills mapped against industry benchmarks and cognitive assessment evidence.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRouteChange?.('skills')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Assess Competencies</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl mb-6">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Enter skill (e.g. Django, Kubernetes, Tally)"
                    className="flex-1 px-4 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Proficiency:</span>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                      className="w-24 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 w-9 text-right tabular-nums">{newSkillLevel}%</span>
                    <button
                      type="submit"
                      disabled={!newSkillName.trim() || isSaving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0 ml-1"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                <div className="mb-6">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">Quick additions from popular stacks:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                      const exists = Object.keys(skillsMatrix).some(k => k.toLowerCase() === skill.toLowerCase());
                      return (
                        <button
                          key={skill}
                          type="button"
                          disabled={exists}
                          onClick={() => {
                            setNewSkillName(skill);
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                            exists
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          + {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(skillsMatrix).map(([skillName, meta]) => {
                    const weight = meta?.weight || 75;
                    const isVerif = meta?.is_verified;
                    return (
                      <div
                        key={skillName}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900 capitalize truncate">
                              {skillName}
                            </span>
                            {isVerif && (
                              <ShieldCheck size={13} className="text-blue-600 shrink-0" title="Verified Skill" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(10, weight))}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                              {weight}%
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skillName)}
                          className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title={`Remove ${skillName}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FolderGit2 size={18} className="text-blue-600" />
                      Engineering & Case Study Projects
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-world code repositories, architectures, and design case studies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddProject(!showAddProject)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Project</span>
                  </button>
                </div>

                {showAddProject && (
                  <form onSubmit={handleAddProject} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 animate-in fade-in duration-150">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
                      Publish New Project
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Project Title</label>
                        <input
                          type="text"
                          required
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          placeholder="e.g. Distributed Task Orchestrator"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tech Stack (comma-separated)</label>
                        <input
                          type="text"
                          value={newProject.tech_stack}
                          onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                          placeholder="Python, Redis, FastAPI, Docker"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Engineered high-throughput job queue handling 10k messages/sec..."
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">GitHub Repo URL</label>
                        <input
                          type="url"
                          value={newProject.github_url}
                          onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                          placeholder="https://github.com/username/project"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Live Demo URL</label>
                        <input
                          type="url"
                          value={newProject.live_url}
                          onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                          placeholder="https://project-demo.com"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddProject(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                      >
                        Save Project
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id || idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{proj.title}</h3>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj.id || idx)}
                            className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                          {proj.description || 'No description provided.'}
                        </p>
                        {proj.tech_stack && proj.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {proj.tech_stack.map((t, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1"
                          >
                            <Github size={13} />
                            <span>Code</span>
                          </a>
                        )}
                        {proj.live_url && (
                          <a
                            href={proj.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1"
                          >
                            <ExternalLink size={13} />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Award size={18} className="text-blue-600" />
                      Industry Certifications & Credentials
                    </h2>
                    <p className="text-xs text-slate-500">
                      Certified credentials automatically grant a +15% weight multiplier in talent search.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCert(!showAddCert)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Credential</span>
                  </button>
                </div>

                {showAddCert && (
                  <form onSubmit={handleAddCertification} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 animate-in fade-in duration-150">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
                      Add Verified Industry Certification
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Certification Name</label>
                        <input
                          type="text"
                          required
                          value={newCert.name}
                          onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Issuing Authority / Organization</label>
                        <input
                          type="text"
                          required
                          value={newCert.issuer}
                          onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                          placeholder="e.g. Amazon Web Services"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Year</label>
                        <input
                          type="number"
                          value={newCert.issue_year}
                          onChange={(e) => setNewCert({ ...newCert, issue_year: e.target.value })}
                          placeholder="2024"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Verification / Badge URL</label>
                        <input
                          type="url"
                          value={newCert.credential_url}
                          onChange={(e) => setNewCert({ ...newCert, credential_url: e.target.value })}
                          placeholder="https://credly.com/badges/..."
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCert(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                      >
                        Publish Credential
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certifications.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-bold text-slate-900 truncate">{c.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                            +15% Boost
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">
                          {c.issuer} · Issued {c.issue_year || 'Recent'}
                        </p>
                        {c.credential_url && (
                          <a
                            href={c.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                          >
                            <ExternalLink size={12} />
                            <span>Verify Credential</span>
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCertification(idx)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passport' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <FileCheck size={18} className="text-blue-600" />
                DigiLocker & NEP 2020 Credit Framework
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                National credit registries and Academic Bank of Credits (ABC) credentials.
              </p>

              <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      12-Digit APAAR ID (One Nation One Student ID)
                    </label>
                    <input
                      type="text"
                      value={personalForm.apaar_id}
                      onChange={(e) => setPersonalForm({ ...personalForm, apaar_id: e.target.value })}
                      placeholder="e.g. 9823-4412-8901"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Academic Bank of Credits (ABC ID)
                    </label>
                    <input
                      type="text"
                      value={personalForm.abc_id}
                      onChange={(e) => setPersonalForm({ ...personalForm, abc_id: e.target.value })}
                      placeholder="e.g. ABC-782-901-44"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Multidisciplinary Minor Specialization
                    </label>
                    <input
                      type="text"
                      value={personalForm.minor_specialization}
                      onChange={(e) => setPersonalForm({ ...personalForm, minor_specialization: e.target.value })}
                      placeholder="e.g. FinTech, UI/UX Systems, Data Analytics"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      NHEQF Qualification Level
                    </label>
                    <select
                      value={personalForm.nheqf_level}
                      onChange={(e) => setPersonalForm({ ...personalForm, nheqf_level: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="LEVEL_4_5">NHEQF Level 4.5: UG Certificate (Year 1)</option>
                      <option value="LEVEL_5_0">NHEQF Level 5.0: UG Diploma (Year 2)</option>
                      <option value="LEVEL_5_5">NHEQF Level 5.5: Bachelor Degree 3-Year</option>
                      <option value="LEVEL_6_0">NHEQF Level 6.0: Bachelor Degree 4-Year / Honours</option>
                      <option value="LEVEL_6_5">NHEQF Level 6.5: Post-Graduate Diploma</option>
                      <option value="LEVEL_7_0">NHEQF Level 7.0: Master Degree</option>
                      <option value="LEVEL_8_0">NHEQF Level 8.0: Doctoral / Ph.D.</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span>Save DigiLocker Credentials</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Settings size={18} className="text-blue-600" />
                Career & Discovery Preferences
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Manage recruiter discoverability, preferred work modes, and automated alerts.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Work Arrangement Preference</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'ALL', label: 'All Arrangements', desc: 'Remote, Hybrid, and Onsite' },
                      { value: 'REMOTE', label: 'Remote Only', desc: '100% Work from Anywhere' },
                      { value: 'HYBRID', label: 'Hybrid / Onsite', desc: 'In-Office or Mixed Environment' }
                    ].map((arr) => {
                      const isSelected = preferences.career_discovery?.preferred_work_arrangement === arr.value;
                      return (
                        <button
                          key={arr.value}
                          type="button"
                          onClick={() => setPreferences({
                            ...preferences,
                            career_discovery: { ...preferences.career_discovery, preferred_work_arrangement: arr.value }
                          })}
                          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <span className={`text-sm font-bold block ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>{arr.label}</span>
                          <span className="text-xs text-slate-500 mt-0.5 block">{arr.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Privacy & Talent Search Visibility</h3>
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Allow Verified Recruiters to Discover Profile</span>
                      <span className="text-xs text-slate-500">Makes your verified skills matrix and portfolio discoverable by enterprise hiring teams</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.privacy?.share_profile_with_verified_recruiters ?? true}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        privacy: { ...preferences.privacy, share_profile_with_verified_recruiters: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Notification Alerts</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'email_application_updates', label: 'Application Status Alerts', desc: 'Real-time updates when an application moves stages' },
                      { key: 'interview_invites', label: 'Interview Invitations', desc: 'Direct alerts for scheduled recruiter viva and interviews' },
                      { key: 'new_opportunity_alerts', label: 'Matching Job Radar', desc: 'Notifications when postings match your verified competencies' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{item.label}</span>
                          <span className="text-xs text-slate-500">{item.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications?.[item.key] ?? true}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, [item.key]: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200/80 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera size={18} className="text-blue-600" />
                <span>Profile Picture & Avatars</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-5">
              Upload a personal photo from your computer, choose from our curated character presets, or link a custom image URL.
            </p>

            <div className="mb-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Upload from Device</span>
                <span className="text-[11px] text-slate-500 block">JPEG, PNG, or WebP up to 5MB</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAvatarModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <UploadCloud size={14} />
                <span>Browse Files</span>
              </button>
            </div>

            <div className="mb-5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2.5">
                Curated Avatar Presets
              </span>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((av) => {
                  const isSelected = currentUser?.avatar_url === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectAvatarUrl(av.url)}
                      className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-slate-50 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105'
                          : 'border-slate-100 hover:border-slate-300 hover:scale-105'
                      }`}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-xl" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                Or Enter Custom Image URL
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900"
                />
                <button
                  type="button"
                  disabled={!customAvatarInput.trim() || isUploadingAvatar}
                  onClick={() => handleSelectAvatarUrl(customAvatarInput.trim())}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {currentUser?.avatar_url && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Prefer initials?</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
