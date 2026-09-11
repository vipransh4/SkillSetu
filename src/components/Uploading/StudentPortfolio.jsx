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
  BarChart3,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';

// Custom inline SVG for GitHub Icon
const GithubIcon = ({ size = 16, className = "" }) => (
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
  const currentUser = authService.getUser();

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

  // Fetch live student profile from backend
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/students/me');
      const data = response.data;
      if (data) {
        setProfileData(data);
        
        // Extract raw skills or skills_matrix keys (empty array for new users)
        const loadedSkills = data.raw_extracted_skills?.length
          ? data.raw_extracted_skills
          : Object.keys(data.skills_matrix || {});
        setSkillsList(loadedSkills);

        // Extract projects (empty array for new users)
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.warn('Could not load profile from backend', err);
      // New uninitialized user fallback: default score 0, empty skills
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

    // Persist to backend database
    try {
      setIsSaving(true);
      const skillsMatrixPayload = Object.fromEntries(
        updatedSkills.map((s) => [s, { project_evidence: 50, experience_recency: 50 }])
      );
      await apiClient.put('/students/me', {
        raw_extracted_skills: updatedSkills,
        skills_matrix: skillsMatrixPayload,
      });
      setSaveMessage('Skill added and synced to profile!');
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
      techStack: formData.techStack ? formData.techStack.split(',').map((s) => s.trim()) : ['React'],
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
      setSaveMessage('Project submitted and saved to your verified digital portfolio!');
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 min-h-screen">
      
      {/* Top Banner Message */}
      {saveMessage && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* HEADER CARD: Live Profile Strength Radar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* User Identity Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              {(currentUser?.first_name || currentUser?.username || 'ST').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : (currentUser?.username || 'Student Candidate')}
                </h1>
                {isVerified ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-full border border-blue-200">
                    <ShieldCheck size={14} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
                    <ShieldAlert size={14} /> Unverified (Default: 0)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {profileData?.degree ? `${profileData.degree} · ` : ''}
                {profileData?.department ? `${profileData.department} · ` : ''}
                {profileData?.institution || 'Profile Incomplete — Add details to calculate verified score'}
              </p>
            </div>
          </div>

          {/* Profile Strength Score Gauge */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Profile Strength
              </span>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl font-black text-slate-900">
                  {overallScore}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Visual Ring Gauge */}
            <div className="w-14 h-14 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center relative shadow-sm">
              <div 
                className={`w-full h-full rounded-full border-4 ${
                  overallScore >= 70 ? 'border-emerald-500' : (overallScore > 0 ? 'border-blue-500' : 'border-slate-300')
                } absolute inset-0 transition-all duration-700`}
                style={{ clipPath: `polygon(0 0, 100% 0, 100% ${overallScore}%, 0 ${overallScore}%)` }}
              />
              <span className="text-xs font-black text-slate-700 relative z-10">
                {overallScore}%
              </span>
            </div>
          </div>

        </div>

        {/* 4-Pillar Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl">
            <span className="text-slate-400 font-semibold block mb-1">Cognitive Assessment (45%)</span>
            <span className="text-base font-bold text-slate-800">{Math.round(breakdown.cognitive_score || 0)}/100</span>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-xl">
            <span className="text-slate-400 font-semibold block mb-1">Applied Projects (30%)</span>
            <span className="text-base font-bold text-slate-800">{Math.round(breakdown.projects_experience_score || 0)}/100</span>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-xl">
            <span className="text-slate-400 font-semibold block mb-1">Certifications (15%)</span>
            <span className="text-base font-bold text-slate-800">{Math.round(breakdown.certifications_score || 0)}/100</span>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-xl">
            <span className="text-slate-400 font-semibold block mb-1">Academic CGPA (10%)</span>
            <span className="text-base font-bold text-slate-800">{Math.round(breakdown.academics_score || 0)}/100</span>
          </div>
        </div>

        {/* Friendly explanation for new users */}
        {overallScore === 0 && (
          <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-800">
            <AlertCircle size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>New Account Notice:</strong> Your default score is 0.0 and no skills are listed until you add your skills manually below or upload your resume for AI verification.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Manage Skills & Portfolio Projects */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Skills Management Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Verified Technical Skills</h2>
                <p className="text-xs text-slate-400 mt-0.5">Skills listed here directly power your candidate job match scores</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full flex items-center gap-1 border border-emerald-100">
                <CheckCircle2 size={12} /> {skillsList.length} Skills
              </span>
            </div>

            {/* Add Skill Input Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill (e.g. React, Python, Docker)..."
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                <span>Add Skill</span>
              </button>
            </form>

            {/* Skill Badges or Empty State */}
            {skillsList.length === 0 ? (
              <div className="p-8 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center">
                <Layers size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No skills added yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Type a skill above or click Add Skill to begin building your verified profile strength.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full flex items-center gap-2 group hover:bg-slate-200 transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Project Showcase List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Featured Projects</h2>
                <p className="text-xs text-slate-400 mt-0.5">Projects displayed on your digital credential card</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-full border border-blue-100">
                {projects.length} Projects
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center">
                <Code2 size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No featured projects yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Submit personal or hackathon projects using the form on the right to demonstrate hands-on software engineering.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                          <Code2 size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{proj.title}</h3>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                            proj.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {proj.status || 'In Review'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                          >
                            <GithubIcon size={16} />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    )}

                    {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.techStack.map((tech, i) => (
                          <span key={i} className="px-2.5 py-0.5 text-[11px] font-medium bg-white text-slate-600 rounded-md border border-slate-200/60">
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

        {/* RIGHT COLUMN: Add New Project Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Add New Project</h2>
            <p className="text-xs text-slate-400 mt-0.5">Submit personal or hackathon projects to boost your applied score</p>
          </div>

          <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleProjectChange}
                placeholder="e.g. TravelTrek Web Platform"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                required
              />
            </div>

            {/* Tech Stack */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Technologies Used</label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleProjectChange}
                placeholder="e.g. React, Node.js, PostgreSQL (comma separated)"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>

            {/* GitHub & Live Demo Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">GitHub URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleProjectChange}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Live Demo URL</label>
                <input
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleProjectChange}
                  placeholder="https://my-demo.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Project Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleProjectChange}
                placeholder="What problem does this project solve? Highlight key architectural decisions."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all resize-y"
              />
            </div>

            {/* Verification Tip Box */}
            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-start gap-2.5">
              <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Projects with a working live demo and clear GitHub repository receive priority recruiter verification.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="mt-1 w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>Add to Portfolio</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default StudentPortfolio;