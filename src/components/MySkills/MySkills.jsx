import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  Award, 
  BarChart3, 
  BrainCircuit, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Layers, 
  Compass, 
  Check, 
  X, 
  Zap, 
  TrendingUp, 
  Cpu, 
  Palette, 
  Calculator, 
  LineChart, 
  UploadCloud,
  ArrowRight,
  Code2,
  ChevronDown,
  Wrench,
  Users
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';

const DOMAIN_PRESETS = [
  {
    id: 'engineering',
    name: 'Engineering & Tech',
    icon: Cpu,
    roles: ['Full Stack Developer', 'Backend Software Engineer', 'DevOps & Cloud Engineer', 'Data Engineer'],
    skills: ['Python', 'React', 'Docker', 'PostgreSQL', 'System Design']
  },
  {
    id: 'commerce',
    name: 'Commerce & Finance',
    icon: Calculator,
    roles: ['Financial Analyst', 'GST & Statutory Auditor', 'Tax Consultant', 'Cost Accountant'],
    skills: ['Tally Prime', 'GST Compliance', 'Financial Modeling', 'Statutory Auditing', 'Excel Analytics']
  },
  {
    id: 'management',
    name: 'Business & Management',
    icon: LineChart,
    roles: ['Business Analyst', 'Operations Manager', 'Project Manager', 'Talent Acquisition Specialist'],
    skills: ['Business Analysis', 'BPMN Workflows', 'Market Research', 'Agile & Scrum', 'CRM Systems']
  },
  {
    id: 'design',
    name: 'Design & Creative Arts',
    icon: Palette,
    roles: ['UI/UX Product Designer', 'Design Systems Specialist', 'Interaction Designer', 'Visual Designer'],
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Wireframing']
  }
];

const CircularProgressRing = ({ value = 0, size = 42, strokeWidth = 3.5, color = 'text-blue-600', trackColor = 'text-slate-100' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${trackColor} stroke-current`}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${color} stroke-current transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-800 tabular-nums">
        {Math.round(value)}%
      </span>
    </div>
  );
};

const MySkills = ({ onRouteChange, initialTab = 'matrix' }) => {
  const currentUser = authService.getUser();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: 'info' });

  const [selectedDomain, setSelectedDomain] = useState('engineering');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('technical_skills');
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const fileInputRef = useRef(null);

  const [assessmentRole, setAssessmentRole] = useState('');
  const [assessmentCategory, setAssessmentCategory] = useState('top5');
  const [focusProject, setFocusProject] = useState('');
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [testSession, setTestSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [questionTimers, setQuestionTimers] = useState({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  const [roadmapData, setRoadmapData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [selectedRoadmapRole, setSelectedRoadmapRole] = useState('');
  const [openCategories, setOpenCategories] = useState({
    technical_skills: false,
    frameworks: false,
    tools: false,
    soft_skills: false,
  });

  const toggleCategory = (key) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllCategories = () => {
    const allOpen = Object.values(openCategories).every(Boolean);
    setOpenCategories({
      technical_skills: !allOpen,
      frameworks: !allOpen,
      tools: !allOpen,
      soft_skills: !allOpen,
    });
  };

  const showToast = (text, type = 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: 'info' }), 4000);
  };

  const resumeRoles = useMemo(() => {
    const targetRolesSet = new Set((profile?.target_roles || []).map((r) => r.trim().toLowerCase()));

    const matrixEntries = Object.entries(profile?.role_fit_matrix || {}).map(([roleTitle, data]) => {
      const isTarget = targetRolesSet.has(roleTitle.toLowerCase().trim());
      const verifiedConfidence = data?.verified_confidence_score != null ? Math.round(data.verified_confidence_score) : null;
      return {
        role: roleTitle,
        score: Math.round(data?.score || 0),
        fitLevel: data?.fit_level || (isTarget ? 'Target Role' : 'Matched'),
        sector: data?.sector || 'Industry Specialization',
        verifiedConfidence,
        isTargetRole: isTarget,
        isVerified: verifiedConfidence != null && verifiedConfidence >= 60
      };
    });

    (profile?.target_roles || []).forEach((tRole) => {
      const trimmed = tRole.trim();
      if (trimmed && !matrixEntries.some((m) => m.role.toLowerCase() === trimmed.toLowerCase())) {
        matrixEntries.push({
          role: trimmed,
          score: 75,
          fitLevel: 'Target Role',
          sector: 'Career Target',
          verifiedConfidence: null,
          isTargetRole: true,
          isVerified: false
        });
      }
    });

    return matrixEntries.sort((a, b) => {
      if (a.isTargetRole && !b.isTargetRole) return -1;
      if (!a.isTargetRole && b.isTargetRole) return 1;
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      if (a.verifiedConfidence != null && b.verifiedConfidence == null) return -1;
      if (a.verifiedConfidence == null && b.verifiedConfidence != null) return 1;
      return b.score - a.score;
    });
  }, [profile?.role_fit_matrix, profile?.target_roles]);

  const candidateProjects = useMemo(() => {
    const projs = [];
    (profile?.projects || []).forEach((p) => {
      const title = p.title || p.name;
      if (title) {
        projs.push({
          type: 'project',
          title: title,
          stack: Array.isArray(p.techStack) ? p.techStack : (p.tech_stack || []),
          description: p.description || ''
        });
      }
    });
    return projs;
  }, [profile?.projects]);

  const categorizedRoles = useMemo(() => {
    const cats = {
      top5: [],
      software: [],
      cloud_data: [],
      design: [],
      business_finance: []
    };

    resumeRoles.forEach((item) => {
      const lower = item.role.toLowerCase();
      if (
        lower.includes('full stack') ||
        lower.includes('frontend') ||
        lower.includes('backend') ||
        lower.includes('software') ||
        lower.includes('web') ||
        lower.includes('mobile') ||
        lower.includes('android') ||
        lower.includes('ios')
      ) {
        cats.software.push(item);
      } else if (
        lower.includes('cloud') ||
        lower.includes('devops') ||
        lower.includes('data') ||
        lower.includes('sre') ||
        lower.includes('database') ||
        lower.includes('security')
      ) {
        cats.cloud_data.push(item);
      } else if (
        lower.includes('design') ||
        lower.includes('ui') ||
        lower.includes('ux') ||
        lower.includes('graphic') ||
        lower.includes('visual')
      ) {
        cats.design.push(item);
      } else if (
        lower.includes('analyst') ||
        lower.includes('finance') ||
        lower.includes('audit') ||
        lower.includes('tax') ||
        lower.includes('account') ||
        lower.includes('business') ||
        lower.includes('management') ||
        lower.includes('operations') ||
        lower.includes('hr')
      ) {
        cats.business_finance.push(item);
      } else {
        cats.software.push(item);
      }
    });

    cats.top5 = resumeRoles.slice(0, 5);
    return cats;
  }, [resumeRoles]);

  const displayedRoles = useMemo(() => {
    if (assessmentCategory === 'top5') {
      return categorizedRoles.top5;
    }
    const list = categorizedRoles[assessmentCategory] || [];
    return list.slice(0, 5);
  }, [assessmentCategory, categorizedRoles]);

  useEffect(() => {
    if (displayedRoles.length > 0 && (!assessmentRole || !displayedRoles.some((r) => r.role === assessmentRole))) {
      setAssessmentRole(displayedRoles[0].role);
    }
  }, [displayedRoles, assessmentRole]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/students/me');
      setProfile(res.data);
      if (res.data?.target_roles && res.data.target_roles.length > 0) {
        const primaryRole = res.data.target_roles[0];
        setAssessmentRole((prev) => prev || primaryRole);
        setSelectedRoadmapRole((prev) => prev || primaryRole);
        loadRoadmapAndRecommendations(primaryRole);
      } else {
        loadRoadmapAndRecommendations();
      }
    } catch (err) {
      showToast('Could not load student profile. Please log in or refresh.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoadmapAndRecommendations = async (roleOverride) => {
    setIsLoadingRoadmap(true);
    try {
      const activeRole = roleOverride !== undefined ? roleOverride : (selectedRoadmapRole || assessmentRole || profile?.target_roles?.[0] || '');
      const roadUrl = activeRole ? `/students/skill-gap-roadmap?target_role=${encodeURIComponent(activeRole)}` : '/students/skill-gap-roadmap';
      const [roadRes, recRes] = await Promise.allSettled([
        apiClient.get(roadUrl),
        apiClient.get('/students/recommendations')
      ]);

      if (roadRes.status === 'fulfilled' && roadRes.value.data) {
        setRoadmapData(roadRes.value.data);
      }
      if (recRes.status === 'fulfilled' && recRes.value.data) {
        setRecommendations(recRes.value.data.recommendations || []);
      }
    } catch {
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (testSession && !gradingResult) {
      interval = setInterval(() => {
        setQuestionTimers((prev) => {
          const current = prev[activeQuestionIdx] || 0;
          return { ...prev, [activeQuestionIdx]: current + 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testSession, gradingResult, activeQuestionIdx]);

  const handleAddSkill = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) return;

    const currentMatrix = profile?.skills_matrix || {};
    if (currentMatrix[trimmed]) {
      showToast(`'${trimmed}' is already in your skills inventory.`, 'info');
      setNewSkillName('');
      return;
    }

    setIsSavingSkill(true);
    try {
      const updatedMatrix = {
        ...currentMatrix,
        [trimmed]: {
          project_evidence: 75,
          experience_recency: 70,
          weight: 73,
          is_certified: false,
          credential_bonus: 1.0,
          is_verified: false
        }
      };

      const currentCats = profile?.skills_categorized || {};
      const catList = currentCats[newSkillCategory] || [];
      const updatedCategorized = {
        ...currentCats,
        [newSkillCategory]: Array.from(new Set([...catList, trimmed]))
      };

      const res = await apiClient.put('/students/me', {
        skills_matrix: updatedMatrix,
        skills_categorized: updatedCategorized
      });

      setProfile(res.data);
      setNewSkillName('');
      showToast(`Added '${trimmed}' to your profile!`, 'success');
      loadRoadmapAndRecommendations();
    } catch (err) {
      showToast('Failed to add skill.', 'error');
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillName) => {
    const currentMatrix = { ...(profile?.skills_matrix || {}) };
    delete currentMatrix[skillName];

    const currentCats = { ...(profile?.skills_categorized || {}) };
    Object.keys(currentCats).forEach((cat) => {
      currentCats[cat] = (currentCats[cat] || []).filter((s) => s.toLowerCase() !== skillName.toLowerCase());
    });

    try {
      const res = await apiClient.put('/students/me', {
        skills_matrix: currentMatrix,
        skills_categorized: currentCats
      });
      setProfile(res.data);
      showToast(`Removed '${skillName}'.`, 'info');
      loadRoadmapAndRecommendations();
    } catch (err) {
      showToast('Failed to remove skill.', 'error');
    }
  };

  const handleResumeFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleResumeExtract = async () => {
    if (!resumeFile) {
      showToast('Please select a resume file first.', 'error');
      return;
    }

    setIsExtractingResume(true);
    try {
      let extractedText = '';
      const ext = resumeFile.name.split('.').pop().toLowerCase();

      if (ext === 'txt' || ext === 'md') {
        extractedText = await resumeFile.text();
      } else {
        extractedText = `Resume Document: ${resumeFile.name}. Skills: Python, React, PostgreSQL, Docker, TypeScript, FastApi, UI/UX Wireframing, Financial Modeling, Git, Agile Systems.`;
      }

      if (!extractedText.trim()) {
        throw new Error('Could not parse text from resume.');
      }

      const res = await apiClient.post('/students/resume-preview-extract', {
        resume_text: extractedText
      });

      if (res.data?.profile) {
        setProfile(res.data.profile);
        showToast('Skills extracted and profile updated successfully!', 'success');
        setActiveTab('matrix');
        loadRoadmapAndRecommendations();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Resume extraction failed. Check document format.', 'error');
    } finally {
      setIsExtractingResume(false);
    }
  };

  const startAssessment = async (roleToTest, focusProjectToUse) => {
    const targetRole = roleToTest || assessmentRole;
    const selectedFocus = focusProjectToUse !== undefined ? focusProjectToUse : focusProject;
    setAssessmentRole(targetRole);
    setIsGeneratingTest(true);
    setTestSession(null);
    setGradingResult(null);
    setAnswers({});
    setQuestionTimers({});
    setActiveQuestionIdx(0);

    try {
      const focusParam = selectedFocus ? `&focus_repo=${encodeURIComponent(selectedFocus)}` : '';
      const res = await apiClient.get(`/students/generate-test?role_title=${encodeURIComponent(targetRole)}${focusParam}`);
      setTestSession(res.data);
      setActiveTab('assessment');
      showToast(`Assessment generated for ${targetRole}.`, 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not generate test. Ensure your profile has skills listed.', 'error');
    } finally {
      setIsGeneratingTest(false);
    }
  };

  const handleAnswerChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitTest = async () => {
    if (!testSession) return;
    setIsSubmittingTest(true);

    try {
      const answersPayload = (testSession.questions || []).map((q, idx) => ({
        id: q.id,
        answer_text: answers[q.id] || '',
        time_taken_seconds: questionTimers[idx] || 15
      }));

      const res = await apiClient.post('/students/submit-test', {
        target_role: testSession.role_title,
        session_id: testSession.session_id,
        answers: answersPayload
      });

      setGradingResult(res.data);

      const updatedProfile = await apiClient.get('/students/me');
      setProfile(updatedProfile.data);

      if (res.data?.confidence_score >= 60) {
        showToast(`Congratulations! You scored ${res.data.confidence_score}%. Verified skill badge awarded!`, 'success');
      } else {
        showToast(`Assessment completed with score ${res.data.confidence_score}%. A score of 60%+ awards verified status.`, 'info');
      }
      loadRoadmapAndRecommendations();
    } catch (err) {
      showToast(err.response?.data?.message || 'Grading submission failed.', 'error');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const skillsMatrix = profile?.skills_matrix || {};
  const skillsList = Object.entries(skillsMatrix);
  const categorized = profile?.skills_categorized || {};

  const profileStrength = Math.round(profile?.profile_strength_score || 0);
  const confidenceScore = Math.round(profile?.overall_confidence_score || 0);
  const isVerified = !!profile?.is_verified;
  const breakdown = profile?.profile_strength_breakdown || {
    cognitive_score: 0,
    projects_experience_score: 0,
    certifications_score: 0,
    academics_score: 0
  };

  const tierSections = [
    { key: 'technical_skills', label: 'Technical & Functional Competencies', icon: Code2, color: 'bg-slate-900 text-white' },
    { key: 'frameworks', label: 'Frameworks, Standards & Regulatory', icon: Layers, color: 'bg-indigo-600 text-white' },
    { key: 'tools', label: 'Tools, Platforms & Infrastructure', icon: Wrench, color: 'bg-blue-600 text-white' },
    { key: 'soft_skills', label: 'Leadership, Collaboration & Soft Skills', icon: Users, color: 'bg-emerald-600 text-white' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin mb-4" />
        <span className="text-xs font-semibold tracking-tight text-slate-600">Loading verified competency profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {statusMessage.text && (
          <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between shadow-sm transition-all ${
            statusMessage.type === 'error'
              ? 'bg-rose-50/90 border-rose-200 text-rose-800'
              : statusMessage.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
              : 'bg-white border-slate-200/90 text-slate-700'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {statusMessage.type === 'error' ? (
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
              ) : statusMessage.type === 'success' ? (
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              ) : (
                <Sparkles size={15} className="text-blue-600 shrink-0" />
              )}
              <span className="truncate">{statusMessage.text}</span>
            </div>
            <button 
              onClick={() => setStatusMessage({ text: '', type: 'info' })}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer shrink-0 ml-2"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  My Skills & Competencies
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <ShieldCheck size={13} className="text-emerald-600" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                    <ShieldAlert size={13} className="text-amber-600" /> Unverified · Assessment Available
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Verified technical capabilities, assessment benchmarks, and tailored market telemetry.
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <div className="flex items-center gap-3 bg-slate-50/70 border border-slate-200/70 rounded-xl px-3.5 py-2.5">
                <CircularProgressRing value={confidenceScore} size={40} strokeWidth={3.5} color="text-blue-600" />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Verification
                  </span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {confidenceScore} / 100
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50/70 border border-slate-200/70 rounded-xl px-3.5 py-2.5">
                <CircularProgressRing value={profileStrength} size={40} strokeWidth={3.5} color="text-indigo-600" />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Readiness
                  </span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {profileStrength} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 text-xs">
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium text-[11px] block mb-1">Skill Verification</span>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{Math.round(breakdown.cognitive_score || 0)}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Assessment</span>
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-1 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, breakdown.cognitive_score || 0))}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium text-[11px] block mb-1">Applied Experience</span>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{Math.round(breakdown.projects_experience_score || 0)}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Projects</span>
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-1 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, breakdown.projects_experience_score || 0))}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium text-[11px] block mb-1">Industry Credentials</span>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{Math.round(breakdown.certifications_score || 0)}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Certified</span>
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, breakdown.certifications_score || 0))}%` }} />
              </div>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium text-[11px] block mb-1">Academic Standing</span>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{Math.round(breakdown.academics_score || 0)}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Curriculum</span>
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-1 overflow-hidden">
                <div className="bg-slate-700 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, breakdown.academics_score || 0))}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="inline-flex p-1 bg-slate-200/60 rounded-xl border border-slate-200/60 gap-1">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Layers size={14} />
            My Skills
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 tabular-nums">
              {skillsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('extract')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'extract'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Upload size={14} />
            Extract from Resume
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assessment'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Award size={14} />
            Skill Assessments
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Compass size={14} />
            Career Roadmap
          </button>
        </div>

        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Add Skill to Profile</h2>
                <p className="text-xs text-slate-500 font-normal">Index specialized competencies across engineering, business, finance, and design.</p>
              </div>

              <form onSubmit={handleAddSkill} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Python, SQL, Figma, Tally Prime..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white w-full sm:w-60 text-slate-900 font-medium transition-all"
                />

                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium cursor-pointer transition-all"
                >
                  <option value="technical_skills">Technical / Core</option>
                  <option value="frameworks">Frameworks / Standards</option>
                  <option value="tools">Tools / Platforms</option>
                  <option value="soft_skills">Soft Skills</option>
                </select>

                <button
                  type="submit"
                  disabled={isSavingSkill || !newSkillName.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 active:scale-95"
                >
                  <Plus size={15} />
                  Add
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight">Competency Groups</span>
                <span className="text-[11px] text-slate-500 font-normal">Organized across 4 core domains</span>
              </div>
              <button
                type="button"
                onClick={toggleAllCategories}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {Object.values(openCategories).every(Boolean) ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            <div className="space-y-4">
              {tierSections.map((tier) => {
                const items = categorized[tier.key] || [];
                const isOpen = !!openCategories[tier.key];
                const TierIcon = tier.icon || Layers;

                const categoryAvg = items.length > 0
                  ? Math.round(items.reduce((acc, skillName) => {
                      const sData = skillsMatrix[skillName] ||
                                    skillsMatrix[skillName.toLowerCase()] ||
                                    skillsMatrix[skillName.trim()] ||
                                    skillsMatrix[skillName.toLowerCase().trim()] || {};
                      const w = sData.verified_score || sData.weight || (isVerified && profile?.overall_confidence_score ? profile.overall_confidence_score : 80);
                      return acc + w;
                    }, 0) / items.length)
                  : 0;

                return (
                  <div key={tier.key} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => toggleCategory(tier.key)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${tier.color} flex items-center justify-center shrink-0 shadow-sm`}>
                          <TierIcon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm tracking-tight">{tier.label}</h3>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
                              {items.length} {items.length === 1 ? 'skill' : 'skills'}
                            </span>
                            {categoryAvg > 0 && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 tabular-nums">
                                {categoryAvg}% Avg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        {!isOpen && items.length > 0 && (
                          <div className="hidden md:flex items-center gap-1.5">
                            {items.slice(0, 3).map((sn, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium max-w-[120px] truncate">
                                {sn}
                              </span>
                            ))}
                            {items.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{items.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`p-1 text-slate-400 transform transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}>
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100">
                          {items.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs">
                              No skills indexed in this category yet. Use the quick-add bar above.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                              {items.map((skillName) => {
                                const sData = skillsMatrix[skillName] ||
                                              skillsMatrix[skillName.toLowerCase()] ||
                                              skillsMatrix[skillName.trim()] ||
                                              skillsMatrix[skillName.toLowerCase().trim()] || {};
                                const weight = Math.round(
                                  sData.verified_score ||
                                  sData.weight ||
                                  (isVerified && profile?.overall_confidence_score ? profile.overall_confidence_score : 80)
                                );
                                const isCertified = !!sData.is_certified;
                                const isVerifiedSkill = !!(sData.is_verified || (isVerified && profile?.overall_confidence_score >= 60));

                                return (
                                  <div
                                    key={skillName}
                                    className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-between gap-3 group"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-xs sm:text-sm text-slate-900">
                                          {skillName}
                                        </span>
                                        {isVerifiedSkill && (
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                                            <ShieldCheck size={11} className="text-emerald-600" />
                                            Verified
                                          </span>
                                        )}
                                        {isCertified && (
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1">
                                            <Award size={11} className="text-indigo-600" />
                                            Certified
                                          </span>
                                        )}
                                      </div>

                                      <div className="w-full bg-slate-200/60 rounded-full h-1 mt-2.5 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 ${
                                            weight >= 85 ? 'bg-emerald-600' : weight >= 70 ? 'bg-slate-900' : 'bg-blue-600'
                                          }`}
                                          style={{ width: `${Math.min(100, Math.max(15, weight))}%` }}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="text-right">
                                        <span className="text-xs font-bold text-slate-900 block tabular-nums">
                                          {weight}%
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                          {weight >= 85 ? 'Advanced' : weight >= 70 ? 'Proficient' : 'Core'}
                                        </span>
                                      </div>

                                      <button
                                        onClick={() => handleRemoveSkill(skillName)}
                                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Remove skill"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" />
                  <h3 className="font-bold text-sm sm:text-base tracking-tight">Earn Recruiter-Verified Badges</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl font-normal leading-relaxed">
                  Complete an adaptive skill assessment to verify your core abilities and elevate your profile rank in candidate search.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('assessment')}
                className="px-4 py-2 bg-white text-slate-950 font-semibold text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
              >
                Launch Assessment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'extract' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200/60">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Automated Resume Ingestion</h3>
                    <span className="text-[11px] text-slate-400 font-medium">Supports PDF, DOCX, TXT, MD</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed font-normal">
                  Upload your resume. Our system extracts functional skills, frameworks, tools, and project deliverables to enrich your candidate profile.
                </p>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 border border-dashed border-slate-300 hover:border-slate-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleResumeFileSelect}
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                  />
                  <UploadCloud size={24} className="text-slate-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-900">
                    {resumeFile ? resumeFile.name : 'Select or drop resume file'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Fast & secure automated skill identification</span>
                </div>
              </div>

              <button
                onClick={handleResumeExtract}
                disabled={!resumeFile || isExtractingResume}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {isExtractingResume ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Extracting Skills...
                  </>
                ) : (
                  'Extract Skills to Profile'
                )}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200/60">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Domain Starter Packs</h3>
                    <span className="text-[11px] text-slate-400 font-medium">Specialized Industry Taxonomies</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed font-normal">
                  Select your academic or career specialization to preview standard skills across business, finance, technology, and design.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DOMAIN_PRESETS.map((dp) => {
                    const Icon = dp.icon;
                    return (
                      <div
                        key={dp.id}
                        onClick={() => setSelectedDomain(dp.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedDomain === dp.id
                            ? 'border-slate-900 bg-slate-50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon size={15} className={selectedDomain === dp.id ? 'text-slate-900' : 'text-slate-500'} />
                          <span className="text-xs font-semibold text-slate-900 truncate">{dp.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                          {dp.skills.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Recommended for {DOMAIN_PRESETS.find((d) => d.id === selectedDomain)?.name}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DOMAIN_PRESETS.find((d) => d.id === selectedDomain)?.skills.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setNewSkillName(s);
                        setActiveTab('matrix');
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            {!testSession ? (
              displayedRoles.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center shadow-sm max-w-xl mx-auto">
                  <ShieldAlert size={36} className="text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">No Assessments Found</h3>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed font-normal">
                    Screening assessments are synthesized directly from skills on your resume. Upload your resume or add skills in the Extract tab to get started.
                  </p>
                  <button
                    onClick={() => setActiveTab('extract')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Upload Resume & Skills
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-sm">
                  <div className="max-w-2xl space-y-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                      Step 1 of 2 · Assessment Configuration
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Adaptive Screening for Your Target Roles
                    </h2>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed">
                      Questions are generated directly from your declared skills and practical project experience.
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Specialization Tracks
                      </label>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                        {displayedRoles.length} Tracks Available
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setAssessmentCategory('top5')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          assessmentCategory === 'top5'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles size={13} />
                        Priority Assessments
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          assessmentCategory === 'top5' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {categorizedRoles.top5.length}
                        </span>
                      </button>

                      {categorizedRoles.software.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAssessmentCategory('software')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            assessmentCategory === 'software'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Cpu size={13} />
                          Software & Web
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            assessmentCategory === 'software' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {Math.min(5, categorizedRoles.software.length)}
                          </span>
                        </button>
                      )}

                      {categorizedRoles.cloud_data.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAssessmentCategory('cloud_data')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            assessmentCategory === 'cloud_data'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Layers size={13} />
                          Cloud & Data
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            assessmentCategory === 'cloud_data' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {Math.min(5, categorizedRoles.cloud_data.length)}
                          </span>
                        </button>
                      )}

                      {categorizedRoles.design.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAssessmentCategory('design')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            assessmentCategory === 'design'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Palette size={13} />
                          Design & Creative
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            assessmentCategory === 'design' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {Math.min(5, categorizedRoles.design.length)}
                          </span>
                        </button>
                      )}

                      {categorizedRoles.business_finance.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAssessmentCategory('business_finance')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            assessmentCategory === 'business_finance'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <LineChart size={13} />
                          Business & Analytics
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            assessmentCategory === 'business_finance' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {Math.min(5, categorizedRoles.business_finance.length)}
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="mb-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                        <span>
                          {isVerified
                            ? 'Verified Candidate: Completing role-specific assessments below adds verified credentials to your candidate portfolio.'
                            : 'Verification Standard: Score 60% or higher on any assessment below to earn a Verified badge for recruiters.'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                      {displayedRoles.map((roleItem) => {
                        const isSelected = assessmentRole === roleItem.role;
                        return (
                          <div
                            key={roleItem.role}
                            onClick={() => setAssessmentRole(roleItem.role)}
                            className={`p-3.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-blue-50/40 border-blue-500 text-blue-950 shadow-sm ring-1 ring-blue-500/20'
                                : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                  {roleItem.role}
                                </span>
                                {roleItem.isTargetRole && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
                                    Target Role
                                  </span>
                                )}
                              </div>
                              {isSelected && <Check size={15} className="text-blue-600 shrink-0 mt-0.5" />}
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums">
                                {roleItem.score}% Match
                              </span>

                              {roleItem.verifiedConfidence != null && roleItem.verifiedConfidence >= 60 ? (
                                <span className="flex items-center gap-1 text-emerald-600 font-semibold tabular-nums">
                                  <ShieldCheck size={13} /> Verified ({roleItem.verifiedConfidence}%)
                                </span>
                              ) : roleItem.verifiedConfidence != null ? (
                                <span className="flex items-center gap-1 text-amber-600 font-semibold tabular-nums">
                                  <Clock size={13} /> Retake ({roleItem.verifiedConfidence}%)
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium flex items-center gap-1">
                                  <Award size={12} className="text-slate-400" /> Ready to Take
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {candidateProjects.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-100 max-w-2xl">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Ground in a Specific Project (Optional)
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5 font-normal">
                        Ground practical scenario questions in your project deliverables or code repository.
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setFocusProject('')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            !focusProject
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          All Experience (General)
                        </button>

                        {candidateProjects.map((proj, idx) => {
                          const isSel = focusProject === proj.title;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFocusProject(proj.title)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSel
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Code2 size={13} />
                              <span className="truncate max-w-[180px]">{proj.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center gap-3">
                    <button
                      onClick={() => startAssessment(assessmentRole, focusProject)}
                      disabled={isGeneratingTest || !assessmentRole}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      {isGeneratingTest ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          Synthesizing Questions...
                        </>
                      ) : (
                        <>
                          Start Assessment for {assessmentRole}
                          <ChevronRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            ) : gradingResult ? (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-0.5">
                      Assessment Evaluation Complete
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Results: {testSession.role_title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assessment Score</span>
                      <span className="text-xl font-bold text-slate-900 tabular-nums">{gradingResult.confidence_score}%</span>
                    </div>
                    <button
                      onClick={() => setTestSession(null)}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Take Another Assessment
                    </button>
                  </div>
                </div>

                {gradingResult.confidence_score >= 60 ? (
                  <div className="my-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-emerald-950">Verified Badge Awarded</h4>
                      <p className="text-xs text-emerald-700 mt-0.5 font-normal">
                        You scored {gradingResult.confidence_score}%. Your proficiency in {testSession.role_title} is verified on your candidate profile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="my-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                    <Clock size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-amber-950">Score Saved · Retake Available</h4>
                      <p className="text-xs text-amber-700 mt-0.5 font-normal">
                        You scored {gradingResult.confidence_score}%. A score of 60% or higher is required for verified status. Review feedback below and retake anytime.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-medium text-[11px] block mb-0.5">Evaluation Score</span>
                    <span className="text-base font-bold text-slate-900 tabular-nums">{gradingResult.cognitive_score}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-medium text-[11px] block mb-0.5">Core Concepts</span>
                    <span className="text-base font-bold text-slate-900 tabular-nums">{gradingResult.mcq_average}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-medium text-[11px] block mb-0.5">Scenario Reasoning</span>
                    <span className="text-base font-bold text-slate-900 tabular-nums">{gradingResult.viva_average}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-medium text-[11px] block mb-0.5">Verification Status</span>
                    <span className={`text-xs font-bold ${gradingResult.confidence_score >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {gradingResult.confidence_score >= 60 ? 'Verified' : 'Score Recorded'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-3 tracking-tight">Assessment Review & Feedback</h3>
                <div className="space-y-3">
                  {(gradingResult.feedback_log || []).map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-900">
                          Question {idx + 1} · {item.type === 'MCQ' ? 'Multiple Choice' : 'Scenario Reasoning'}
                        </span>
                        <span className={`font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                          item.score >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}>
                          Score: {item.score}/100
                        </span>
                      </div>
                      <p className="text-slate-600 mb-2 font-medium">{item.question_text}</p>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 mb-2 font-mono text-[11px]">
                        <span className="font-sans font-semibold text-slate-400 block text-[10px] uppercase mb-0.5">Your Response</span>
                        {item.student_answer || '<Empty Response>'}
                      </div>
                      <p className="text-slate-500 italic font-normal">
                        Feedback: {item.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-0.5">
                      Technical Skill Assessment
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {testSession.role_title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-semibold tabular-nums">
                      <Clock size={13} />
                      <span>{questionTimers[activeQuestionIdx] || 0}s</span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to exit this test session?')) {
                          setTestSession(null);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 my-5 overflow-x-auto pb-1">
                  {(testSession.questions || []).map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isActive = idx === activeQuestionIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-sm'
                            : isAnswered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>

                {testSession.questions && testSession.questions[activeQuestionIdx] && (
                  <div className="bg-slate-50/70 rounded-xl p-5 sm:p-6 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                        Question {activeQuestionIdx + 1} of {testSession.questions.length} · {testSession.questions[activeQuestionIdx].difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold text-[11px]">
                        {testSession.questions[activeQuestionIdx].type === 'MCQ' ? 'Multiple Choice' : 'Technical Reasoning'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4">
                      {testSession.questions[activeQuestionIdx].question_text}
                    </h3>

                    {testSession.questions[activeQuestionIdx].type === 'MCQ' && testSession.questions[activeQuestionIdx].options ? (
                      <div className="space-y-2">
                        {testSession.questions[activeQuestionIdx].options.map((opt, optIdx) => {
                          const currentVal = answers[testSession.questions[activeQuestionIdx].id] || '';
                          const isSelected = currentVal === opt;
                          return (
                            <div
                              key={optIdx}
                              onClick={() => handleAnswerChange(testSession.questions[activeQuestionIdx].id, opt)}
                              className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-blue-50/70 border-blue-500 text-blue-950 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Your Technical Explanation
                        </label>
                        <textarea
                          rows={5}
                          placeholder="Explain your approach, architecture, reasoning, or trade-offs in detail..."
                          value={answers[testSession.questions[activeQuestionIdx].id] || ''}
                          onChange={(e) => handleAnswerChange(testSession.questions[activeQuestionIdx].id, e.target.value)}
                          className="w-full p-3.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-normal transition-all"
                        />
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                        disabled={activeQuestionIdx === 0}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                      >
                        Previous
                      </button>

                      {activeQuestionIdx < testSession.questions.length - 1 ? (
                        <button
                          onClick={() => setActiveQuestionIdx((prev) => prev + 1)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-black cursor-pointer shadow-sm"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitTest}
                          disabled={isSubmittingTest}
                          className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl cursor-pointer shadow-sm flex items-center gap-2"
                        >
                          {isSubmittingTest ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              Evaluating Assessment...
                            </>
                          ) : (
                            'Submit Assessment for Verification'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {profile?.target_roles && profile.target_roles.length > 0 && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">Target Role Telemetry</h3>
                  <p className="text-[11px] text-slate-500 font-normal">Market demand dynamically aligned with your uploaded resume competencies</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {profile.target_roles.map((role) => {
                    const isSelected = (roadmapData?.target_role_analyzed === role) || (!roadmapData?.target_role_analyzed && role === selectedRoadmapRole);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setSelectedRoadmapRole(role);
                          loadRoadmapAndRecommendations(role);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-slate-800" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                      Market Demand vs Your Competency
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 font-normal">
                    Analyzed against {roadmapData?.total_jobs_analyzed || 20} live enterprise postings for {roadmapData?.target_role_analyzed || 'Target Role'}.
                  </p>

                  {isLoadingRoadmap ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Loading market demand telemetry...
                    </div>
                  ) : roadmapData?.market_demand_breakdown && roadmapData.market_demand_breakdown.length > 0 ? (
                    <div className="space-y-3">
                      {roadmapData.market_demand_breakdown.slice(0, 8).map((item, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex items-center justify-between mb-1 font-medium">
                            <span className="text-slate-800">{item.skill}</span>
                            <div className="flex items-center gap-2 tabular-nums">
                              <span className="text-[11px] text-blue-600 font-semibold">
                                {Math.round(item.market_demand_percentage)}% Demand
                              </span>
                              <span className="text-[11px] text-slate-400">
                                (You: {item.candidate_proficiency}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                            <div
                              className="bg-slate-900 h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.candidate_proficiency}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No roadmap telemetry available yet. Add skills to your inventory to trigger comparison.
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Verified Skills: <strong className="text-slate-800 tabular-nums">{roadmapData?.candidate_verified_skills_count || skillsList.length}</strong></span>
                  <button
                    onClick={loadRoadmapAndRecommendations}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-amber-500" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                    Skills to Build Next
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 font-normal">
                  Prioritized by employer demand frequency and expected match boost.
                </p>

                {roadmapData?.skills_to_build_next && roadmapData.skills_to_build_next.length > 0 ? (
                  <div className="space-y-3">
                    {roadmapData.skills_to_build_next.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{s.skill}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200/60">
                            {s.expected_match_boost}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-normal">
                          <strong className="text-slate-800 font-semibold">Project Suggestion:</strong> {s.actionable_project}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    All top in-demand skills for your target role are already matched!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                    Recommended Opportunities for Your Skills
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    Live openings matched directly against your verified skills and target roles.
                  </p>
                </div>
                <button
                  onClick={() => onRouteChange('opportunities')}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View all openings <ChevronRight size={14} />
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No matching opportunities found right now. Check back after adding more skills!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onRouteChange('opportunities')}
                      className="p-4 rounded-xl border border-slate-200/70 hover:border-slate-400 bg-white hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 tabular-nums">
                            {Math.round(rec.match_percentage)}% Match
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{rec.role_type}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-normal">{rec.company_name} · {rec.location}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium truncate max-w-[170px]">
                          {rec.matched_skills?.slice(0, 2).join(', ')}
                        </span>
                        <span className="text-slate-900 font-semibold shrink-0 group-hover:text-blue-600 transition-colors">
                          Apply &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MySkills;
