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
  GraduationCap,
  Building2,
  FolderGit2
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

const StudentPortfolio = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    description: '',
  });

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/students/me');
      const data = response.data;
      if (data) {
        setProfileData(data);
        
        const loadedSkills = data.raw_extracted_skills?.length
          ? data.raw_extracted_skills
          : Object.keys(data.skills_matrix || {});
        setSkillsList(loadedSkills);
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.warn('Could not load profile from backend', err);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    authService.getCurrentUser().then((u) => u && setCurrentUser(u)).catch(() => {});
  }, []);

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

  const certifications = profileData?.certifications || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
      
      {saveMessage && (
        <div className="mb-6 p-3 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7 mb-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {(currentUser?.first_name || currentUser?.username || 'ST').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : (currentUser?.username || 'Candidate Profile')}
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
                  <span className="text-slate-400">Complete academic details in profile settings</span>
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

            {onRouteChange && (
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
                <p className="text-xs text-slate-500 mt-0.5">Skills linked to your candidate profile and job recommendations</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200/70">
                {skillsList.length} Skills
              </span>
            </div>

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

            {skillsList.length === 0 ? (
              <div className="p-8 bg-slate-50/60 border border-dashed border-slate-200 rounded-xl text-center">
                <Layers size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No skills added yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Add technical skills or import from your resume to populate your profile.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex items-center gap-2 group"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer text-sm leading-none"
                      title="Remove skill"
                    >
                      ×
                    </button>
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
                {projects.map((proj) => (
                  <div
                    key={proj.id}
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
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    )}

                    {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {proj.techStack.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600 rounded border border-slate-200/60">
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

        </div>

        <div className="lg:col-span-5 flex flex-col gap-7">
          
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
                  <div key={index} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
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

        </div>

      </div>
    </div>
  );
};

export default StudentPortfolio;