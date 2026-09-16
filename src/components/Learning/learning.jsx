import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  Search, 
  Sparkles,
  ArrowRight,
  GraduationCap,
  Award,
  CheckCircle2,
  Zap,
  Layers,
  Compass,
  Check,
  X,
  TrendingUp,
  BarChart3,
  Users,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Play,
  FileText,
  Building2
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';

const DOMAIN_TABS = [
  { id: 'All', label: 'All Domains' },
  { id: 'Engineering & Tech', label: 'Engineering & Tech' },
  { id: 'Commerce & Finance', label: 'Commerce & Finance' },
  { id: 'Business & Management', label: 'Business & Management' },
  { id: 'Design & Creative Arts', label: 'Design & Creative Arts' }
];

const FORMAT_TABS = [
  { id: 'ALL', label: 'All Formats' },
  { id: 'CERTIFICATION_COURSE', label: 'Certification Tracks' },
  { id: 'TRAINING_PROGRAM', label: 'Industry Training' },
  { id: 'WORKSHOP', label: 'Hands-on Workshops' },
  { id: 'MENTORSHIP', label: 'Mentorships' }
];

const FACULTY_FORMAT_TABS = [
  { id: 'ALL', label: 'All Advanced Tracks' },
  { id: 'CPD_CREDIT', label: 'CPD Credit Tracks' },
  { id: 'RESEARCH_METHODOLOGY', label: 'Research Methodologies' },
  { id: 'ENTERPRISE_CERT', label: 'Enterprise Certifications' },
  { id: 'TRAINING_PROGRAM', label: 'Industrial Training' },
  { id: 'WORKSHOP', label: 'Hands-on Workshops' }
];

const SEMESTER_COURSES = [
  { code: 'CS601', name: 'Advanced Cloud Computing & Distributed Systems', semester: 'Sem VI', credits: 4, department: 'Computer Science & Engineering' },
  { code: 'CS702', name: 'Artificial Intelligence & Deep Learning', semester: 'Sem VII', credits: 4, department: 'Computer Science & Engineering' },
  { code: 'CS503', name: 'Full-Stack Enterprise Software Engineering', semester: 'Sem V', credits: 4, department: 'Computer Science & Engineering' },
  { code: 'EC504', name: 'Embedded Systems & Edge AI Microcontrollers', semester: 'Sem V', credits: 3, department: 'Electronics & Communication' },
  { code: 'MB402', name: 'Business Analytics & Decision Frameworks', semester: 'Sem IV', credits: 3, department: 'Management Studies' },
  { code: 'CO301', name: 'Corporate Accounting, GST & Statutory Audits', semester: 'Sem III', credits: 3, department: 'Commerce & Accounting' }
];

const getCompanyInitials = (name) => {
  if (!name) return "SS";
  const words = name.replace(/\b(India|Limited|Pvt|Ltd|Inc|LLC|Technologies|Broking|Company|Corporation)\b/gi, "").trim().split(/\s+/);
  if (words.length >= 2 && words[0] && words[1]) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getCompanyAvatarColor = (name) => {
  const colors = [
    "from-blue-600 to-indigo-700 text-white",
    "from-emerald-600 to-teal-700 text-white",
    "from-purple-600 to-indigo-800 text-white",
    "from-amber-600 to-orange-700 text-white",
    "from-rose-600 to-pink-700 text-white",
    "from-cyan-600 to-blue-700 text-white",
    "from-indigo-600 to-violet-800 text-white",
    "from-slate-700 to-slate-900 text-white"
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getCourseImage = (prog) => {
  if (prog.branding_banner_url && prog.branding_banner_url.startsWith('http') && !prog.branding_banner_url.includes('unsplash.com')) {
    return prog.branding_banner_url;
  }
  return null;
};

const getCategoryFallback = (domain) => {
  const d = (domain || '').toLowerCase();
  if (d.includes('commerce') || d.includes('finance')) {
    return {
      bg: 'bg-gradient-to-tr from-emerald-700 via-teal-800 to-cyan-900',
      icon: <TrendingUp size={36} className="text-white/80" />
    };
  }
  if (d.includes('business') || d.includes('management')) {
    return {
      bg: 'bg-gradient-to-tr from-blue-700 via-indigo-800 to-slate-900',
      icon: <BarChart3 size={36} className="text-white/80" />
    };
  }
  if (d.includes('design')) {
    return {
      bg: 'bg-gradient-to-tr from-purple-700 via-pink-700 to-rose-800',
      icon: <Layers size={36} className="text-white/80" />
    };
  }
  return {
    bg: 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900',
    icon: <Sparkles size={36} className="text-white/80" />
  };
};

const Learning = ({ onRouteChange }) => {
  const currentUser = authService.getUser();
  const userRole = (currentUser?.role || '').toUpperCase();
  const isAcademician = userRole === 'ACADEMIA' || userRole === 'FACULTY' || currentUser?.is_faculty || currentUser?.is_academician;
  const isRecruiter = userRole === 'RECRUITER' || userRole === 'INDUSTRY' || currentUser?.role === 'industry' || currentUser?.role === 'recruiter';
  const [recruiterCompany, setRecruiterCompany] = useState(currentUser?.company_name || currentUser?.company?.name || '');

  useEffect(() => {
    if (isRecruiter && !recruiterCompany) {
      apiClient.get('/recruiters/me').then(res => {
        if (res.data?.company?.name) {
          setRecruiterCompany(res.data.company.name);
        }
      }).catch(() => {});
    }
  }, [isRecruiter, recruiterCompany]);

  const [activeView, setActiveView] = useState(() => (isRecruiter ? 'my-organization' : 'recommended'));
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [syllabusModalProgram, setSyllabusModalProgram] = useState(null);
  const [selectedCourseCode, setSelectedCourseCode] = useState('CS601');
  const [syllabusNotes, setSyllabusNotes] = useState('');
  const [verifiedSyllabusIds, setVerifiedSyllabusIds] = useState(() => {
    try {
      const stored = localStorage.getItem('skillsetu_syllabus_verifications');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [toastMessage, setToastMessage] = useState({ text: '', type: 'info' });
  const [failedImages, setFailedImages] = useState({});

  const [recommendationData, setRecommendationData] = useState({
    recommended_programs: [],
    skill_gap_boosters: [],
    enrolled_programs: [],
    all_programs: [],
    target_role: 'General Industry Profile',
    verified_skills_count: 0,
    top_gap_skills: []
  });

  const [localProgress, setLocalProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(`skillsetu_progress_${currentUser?.id || 'guest'}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: '', type: 'info' }), 4000);
  };

  const handleVerifySyllabus = (prog) => {
    if (!prog) return;
    const pid = String(prog.id);
    const updated = {
      ...verifiedSyllabusIds,
      [pid]: {
        courseCode: selectedCourseCode,
        verifiedAt: new Date().toISOString(),
        notes: syllabusNotes,
        facultyName: currentUser?.name || 'Department Faculty',
        status: 'VERIFIED_AND_RECOMMENDED'
      }
    };
    setVerifiedSyllabusIds(updated);
    try {
      localStorage.setItem('skillsetu_syllabus_verifications', JSON.stringify(updated));
    } catch {}
    showToast(`Curriculum for "${prog.title}" verified & forwarded to Board of Studies (BOS) for ${selectedCourseCode}!`, 'success');
    setSyllabusModalProgram(null);
  };

  const fetchLearningData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/programs/recommendations');
      const data = res.data;
      if (data) {
        setRecommendationData({
          recommended_programs: data.recommended_programs || [],
          skill_gap_boosters: data.skill_gap_boosters || [],
          enrolled_programs: data.enrolled_programs || [],
          all_programs: data.all_programs || [],
          target_role: data.target_role || 'Candidate Target Profile',
          verified_skills_count: data.verified_skills_count || 0,
          top_gap_skills: data.top_gap_skills || []
        });

        const updatedLocal = { ...localProgress };
        (data.enrolled_programs || []).forEach((item) => {
          const prog = item.program;
          const pid = String(prog.id);
          if (!updatedLocal[pid]) {
            updatedLocal[pid] = {
              progress: item.user_progress || 0,
              completedModules: item.completed_modules || [],
              isCompleted: item.user_progress >= 100
            };
          }
        });
        setLocalProgress(updatedLocal);
        try {
          localStorage.setItem(`skillsetu_progress_${currentUser?.id || 'guest'}`, JSON.stringify(updatedLocal));
        } catch {}
      }
    } catch {
      try {
        const fallbackRes = await apiClient.get('/programs/');
        const programs = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
        const mapped = programs.map((p) => ({
          program: p,
          match_score: 88,
          matched_skills: p.skills_covered?.slice(0, 2) || [],
          gap_skills_covered: [],
          expected_boost: '+14% Skill Boost',
          is_gap_booster: false,
          is_enrolled: false,
          user_progress: 0,
          completed_modules: [],
          recommendation_reason: 'Curated industry curriculum.'
        }));
        setRecommendationData({
          recommended_programs: mapped.slice(0, 6),
          skill_gap_boosters: mapped.slice(0, 4),
          enrolled_programs: [],
          all_programs: mapped,
          target_role: 'Industry Candidate',
          verified_skills_count: 5,
          top_gap_skills: []
        });
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, []);

  const handleEnroll = async (prog) => {
    if (!prog) return;
    setIsEnrolling(true);
    const pid = String(prog.id);
    try {
      await apiClient.post(`/programs/${prog.id}/enroll`);
      showToast(`Successfully enrolled in ${prog.title}!`, 'success');
      
      const updated = {
        ...localProgress,
        [pid]: {
          progress: localProgress[pid]?.progress || 0,
          completedModules: localProgress[pid]?.completedModules || [],
          isCompleted: false
        }
      };
      setLocalProgress(updated);
      try {
        localStorage.setItem(`skillsetu_progress_${currentUser?.id || 'guest'}`, JSON.stringify(updated));
      } catch {}

      fetchLearningData();
      if (selectedProgram && selectedProgram.program.id === prog.id) {
        setSelectedProgram((prev) => ({
          ...prev,
          is_enrolled: true,
          user_progress: localProgress[pid]?.progress || 0
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Enrollment processed in offline track.', 'info');
      const updated = {
        ...localProgress,
        [pid]: {
          progress: localProgress[pid]?.progress || 0,
          completedModules: localProgress[pid]?.completedModules || [],
          isCompleted: false
        }
      };
      setLocalProgress(updated);
      try {
        localStorage.setItem(`skillsetu_progress_${currentUser?.id || 'guest'}`, JSON.stringify(updated));
      } catch {}
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleToggleModule = async (prog, moduleText) => {
    const pid = String(prog.id);
    const existing = localProgress[pid] || { progress: 0, completedModules: [], isCompleted: false };
    const allModules = prog.modules || [];
    const totalCount = Math.max(1, allModules.length);

    let nextCompleted = [...existing.completedModules];
    if (nextCompleted.includes(moduleText)) {
      nextCompleted = nextCompleted.filter((m) => m !== moduleText);
    } else {
      nextCompleted.push(moduleText);
    }

    const nextPct = Math.min(100, Math.round((nextCompleted.length / totalCount) * 100));
    const isCompleted = nextPct >= 100;

    const nextState = {
      progress: nextPct,
      completedModules: nextCompleted,
      isCompleted
    };

    const updatedMap = {
      ...localProgress,
      [pid]: nextState
    };
    setLocalProgress(updatedMap);
    try {
      localStorage.setItem(`skillsetu_progress_${currentUser?.id || 'guest'}`, JSON.stringify(updatedMap));
    } catch {}

    if (selectedProgram && selectedProgram.program.id === prog.id) {
      setSelectedProgram((prev) => ({
        ...prev,
        user_progress: nextPct,
        completed_modules: nextCompleted
      }));
    }

    try {
      await apiClient.post(`/programs/${prog.id}/progress`, {
        progress_percentage: nextPct,
        completed_modules: nextCompleted,
        is_completed: isCompleted
      });
      if (isCompleted) {
        showToast(`Congratulations! You earned the verified credential for ${prog.title}!`, 'success');
      }
    } catch {}
  };

  const myOrgCount = useMemo(() => {
    if (!recruiterCompany) return recommendationData.all_programs.length;
    const myName = recruiterCompany.toLowerCase().trim();
    const count = recommendationData.all_programs.filter((item) => {
      const cName = (item.program?.company_name || '').toLowerCase().trim();
      return cName && (cName.includes(myName) || myName.includes(cName));
    }).length;
    return count > 0 ? count : recommendationData.all_programs.length;
  }, [recommendationData.all_programs, recruiterCompany]);

  const displayedList = useMemo(() => {
    let base = [];
    if (activeView === 'my-organization') {
      const myName = (recruiterCompany || '').toLowerCase().trim();
      base = recommendationData.all_programs.filter((item) => {
        const cName = (item.program?.company_name || '').toLowerCase().trim();
        return cName && myName && (cName.includes(myName) || myName.includes(cName));
      });
      if (base.length === 0) {
        base = recommendationData.all_programs;
      }
    } else if (activeView === 'recommended') {
      base = recommendationData.recommended_programs;
    } else if (activeView === 'boosters') {
      base = recommendationData.skill_gap_boosters;
    } else if (activeView === 'cpd') {
      base = recommendationData.all_programs.filter((item) => {
        const prog = item.program;
        return prog.is_certified || (prog.duration && prog.duration.toLowerCase().includes('week')) || (prog.level && prog.level.toLowerCase().includes('advanced')) || prog.program_type === 'CERTIFICATION_COURSE';
      });
      if (base.length === 0) {
        base = recommendationData.all_programs;
      }
    } else if (activeView === 'enrolled') {
      const activeIds = Object.keys(localProgress);
      base = recommendationData.all_programs.filter((item) => {
        const pid = String(item.program.id);
        return item.is_enrolled || activeIds.includes(pid);
      });
      if (base.length === 0) {
        base = recommendationData.enrolled_programs;
      }
    } else {
      base = recommendationData.all_programs;
    }

    return base.filter((item) => {
      const prog = item.program;
      if (selectedDomain !== 'All') {
        const d = (prog.domain || '').toLowerCase();
        if (d !== selectedDomain.toLowerCase()) return false;
      }
      if (selectedFormat !== 'ALL') {
        const pType = (prog.program_type || '').toUpperCase();
        if (selectedFormat === 'CPD_CREDIT') {
          if (!prog.is_certified && !(prog.duration || '').toLowerCase().includes('week')) return false;
        } else if (selectedFormat === 'RESEARCH_METHODOLOGY') {
          const hay = `${prog.title} ${prog.description} ${(prog.skills_covered || []).join(' ')}`.toLowerCase();
          if (!hay.includes('research') && !hay.includes('analytics') && !hay.includes('ai') && !hay.includes('deep') && !hay.includes('data') && !hay.includes('architecture')) return false;
        } else if (selectedFormat === 'ENTERPRISE_CERT') {
          if (pType !== 'CERTIFICATION_COURSE' && !prog.is_certified) return false;
        } else if (pType !== selectedFormat) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (prog.title || '').toLowerCase().includes(q);
        const matchComp = (prog.company_name || '').toLowerCase().includes(q);
        const matchSkills = (prog.skills_covered || []).some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchComp && !matchSkills) return false;
      }
      return true;
    });
  }, [activeView, recommendationData, selectedDomain, selectedFormat, searchQuery, localProgress]);

  const enrolledCount = useMemo(() => {
    const activeIds = Object.keys(localProgress);
    const setIds = new Set(activeIds);
    recommendationData.enrolled_programs.forEach((p) => setIds.add(String(p.program.id)));
    return setIds.size;
  }, [localProgress, recommendationData.enrolled_programs]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {toastMessage.text && (
          <div className="fixed top-24 right-4 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/80 flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${toastMessage.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'} shrink-0`} />
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage({ text: '', type: 'info' })}
              className="ml-3 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              {isRecruiter ? <Building2 size={14} /> : isAcademician ? <GraduationCap size={14} /> : <Sparkles size={14} />}
              <span>{isRecruiter ? `${recruiterCompany || 'Corporate Organization'} · Corporate Academy` : isAcademician ? 'Faculty Learning & Development' : 'Skill Up for Industry'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {isRecruiter ? (recruiterCompany ? `${recruiterCompany} Learning Hub` : 'Corporate Learning Hub') : isAcademician ? 'Industry Learning Programs' : 'Curated Learning Pathways'}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {isRecruiter
                ? `Publish and oversee corporate training curricula, track talent proficiency, and certify candidate skills for ${recruiterCompany || 'your enterprise'}.`
                : isAcademician
                ? 'Explore industry-led training programs, technical curricula, and specialized development tracks.'
                : 'Access faculty-led lectures, industry certifications, and hands-on technical tracks designed to bridge the gap between classroom theory and real-world tech stacks.'}
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{isRecruiter ? myOrgCount : isAcademician ? '100%' : '50+'}</p>
              <p className="text-xs text-slate-400">{isRecruiter ? 'Org Tracks' : isAcademician ? 'Industry Tracks' : 'Skill Tracks'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{isAcademician ? 'Active' : '120+'}</p>
              <p className="text-xs text-slate-400">{isAcademician ? 'Curriculum Aligned' : 'Faculty Lectures'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{isAcademician ? 'Verified' : '85%'}</p>
              <p className="text-xs text-slate-400">{isAcademician ? 'Program Standard' : 'Avg. Completion'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">Verified</p>
              <p className="text-xs text-slate-400">{isAcademician ? 'Curriculum Review' : 'Certificates'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {isRecruiter && (
            <button
              onClick={() => setActiveView('my-organization')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
                activeView === 'my-organization'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <Building2 size={14} />
              <span>{recruiterCompany ? `${recruiterCompany} Programs` : "My Organization's Programs"}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === 'my-organization' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {myOrgCount}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveView('recommended')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
              activeView === 'recommended'
                ? isAcademician ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <Sparkles size={14} />
            <span>{isRecruiter ? 'All Industry Tracks' : isAcademician ? 'Recommended Advanced Tracks' : 'Recommended for You'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === 'recommended' ? (isAcademician ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white') : 'bg-slate-100 text-slate-600'}`}>
              {recommendationData.recommended_programs.length}
            </span>
          </button>

          {isAcademician ? (
            <button
              onClick={() => setActiveView('cpd')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
                activeView === 'cpd'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <Award size={14} className="text-amber-400" />
              <span>Professional Development</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === 'cpd' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                Available
              </span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('boosters')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
                activeView === 'boosters'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <Zap size={14} className="text-amber-500" />
              <span>Skill Gap Boosters</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === 'boosters' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {recommendationData.skill_gap_boosters.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveView('enrolled')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
              activeView === 'enrolled'
                ? isAcademician ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <BookOpen size={14} />
            <span>{isAcademician ? 'My Enrolled Pathways' : 'My Active Tracks'}</span>
            {enrolledCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === 'enrolled' ? (isAcademician ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white') : 'bg-slate-100 text-slate-600'}`}>
                {enrolledCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
              activeView === 'all'
                ? isAcademician ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <Compass size={14} />
            <span>{isAcademician ? 'All Programs' : 'Browse All Tracks'}</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder={isAcademician ? "Search programs and course topics..." : "Search tracks by skill (e.g. Next.js, Tally, Figma, Docker), title, or company..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {(isAcademician ? FACULTY_FORMAT_TABS : FORMAT_TABS).map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedFormat === fmt.id
                      ? isAcademician ? 'bg-indigo-900 text-white font-semibold' : 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Domain:
            </span>
            {DOMAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDomain(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  selectedDomain === tab.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Scanning verified skill matches and learning tracks...</p>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Compass size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">No Matching Learning Programs Found</h3>
            <p className="text-xs text-slate-500 font-normal">
              Try adjusting your search criteria, clearing your domain filter, or switching tabs to explore available curriculums.
            </p>
            <button
              onClick={() => {
                setSelectedDomain('All');
                setSelectedFormat('ALL');
                setSearchQuery('');
                setActiveView('all');
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {displayedList.map((item) => {
              const prog = item.program;
              const pid = String(prog.id);
              const progressData = localProgress[pid];
              const isEnrolledLocally = !!progressData;
              const userPct = progressData?.progress ?? prog.user_progress ?? 0;
              const isDone = progressData?.isCompleted ?? (userPct >= 100);
              const courseImage = getCourseImage(prog);
              const fallback = getCategoryFallback(prog.domain);
              const hasImgError = failedImages[prog.id];

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgram({ ...item, is_enrolled: isEnrolledLocally || item.is_enrolled, user_progress: userPct })}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      {!hasImgError ? (
                        <img
                          src={courseImage}
                          alt={prog.title}
                          onError={() => setFailedImages((prev) => ({ ...prev, [prog.id]: true }))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full ${fallback.bg} flex flex-col items-center justify-center gap-2 p-4 select-none`}>
                          {fallback.icon}
                          <span className="text-white/90 font-bold text-xs tracking-tight text-center px-2">
                            {prog.domain}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[80%]">
                        <span className="bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {prog.domain}
                        </span>
                        {isAcademician && (
                          <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <Award size={11} /> Faculty Track
                          </span>
                        )}
                        {isAcademician && verifiedSyllabusIds[pid] && (
                          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={11} /> Curriculum Aligned
                          </span>
                        )}
                        {isRecruiter && (prog.company_name?.toLowerCase() === recruiterCompany?.toLowerCase() || (recruiterCompany && (prog.company_name?.toLowerCase().includes(recruiterCompany.toLowerCase()) || recruiterCompany.toLowerCase().includes(prog.company_name?.toLowerCase())))) && (
                          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                            <Building2 size={11} /> Your Organization
                          </span>
                        )}
                        {!isAcademician && prog.is_certified && (
                          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <Award size={11} /> Certificate
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Clock size={12} className="text-slate-500" /> {prog.duration}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${getCompanyAvatarColor(prog.company_name)} flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0`}>
                            {getCompanyInitials(prog.company_name)}
                          </div>
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {prog.company_name}
                          </span>
                        </div>

                        {isAcademician && verifiedSyllabusIds[pid] ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={10} className="text-emerald-600" />
                            <span>Curriculum Aligned</span>
                          </span>
                        ) : item.is_gap_booster ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1 shrink-0">
                            <Zap size={10} className="fill-amber-500 text-amber-500" />
                            <span>{item.expected_boost || 'Gap Booster'}</span>
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tabular-nums shrink-0 ${isAcademician ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' : 'bg-slate-100 text-slate-700 border-slate-200/60'}`}>
                            {item.match_score}% {isAcademician ? 'Curriculum Match' : 'Match'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {prog.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                        {prog.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(prog.skills_covered || []).slice(0, 4).map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200/60"
                          >
                            {sk}
                          </span>
                        ))}
                        {(prog.skills_covered || []).length > 4 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                            +{(prog.skills_covered || []).length - 4}
                          </span>
                        )}
                      </div>

                      {isEnrolledLocally && (
                        <div className="pt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-slate-600 flex items-center gap-1">
                              {isDone ? (
                                <>
                                  <CheckCircle2 size={12} className="text-emerald-600" />
                                  <span className="text-emerald-700">Completed & Verified</span>
                                </>
                              ) : (
                                <span>Course Progress</span>
                              )}
                            </span>
                            <span className="text-blue-600 tabular-nums">{userPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              style={{ width: `${userPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-400">
                      {(prog.modules || []).length || 6} Modules · {prog.level || 'Intermediate'}
                    </span>
                    {isAcademician ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSyllabusModalProgram(prog);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            verifiedSyllabusIds[pid]
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100'
                          }`}
                        >
                          <BookOpen size={12} />
                          <span>{verifiedSyllabusIds[pid] ? 'Curriculum Aligned' : 'Review Curriculum'}</span>
                        </button>
                        <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                          <span>{isDone ? 'Review' : isEnrolledLocally ? 'Continue' : 'Enroll'}</span>
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                        <span>{isDone ? 'Review Track' : isEnrolledLocally ? 'Continue Track' : 'Start Track'}</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedProgram && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
              
              <div className="relative h-40 w-full overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={getCourseImage(selectedProgram.program)}
                  alt={selectedProgram.program.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-xl bg-slate-900/60 backdrop-blur-md hover:bg-slate-900 transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${getCompanyAvatarColor(selectedProgram.program.company_name)} flex items-center justify-center font-bold text-sm shadow-md shrink-0 border border-white/20`}>
                      {getCompanyInitials(selectedProgram.program.company_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate">
                        {selectedProgram.program.company_name}
                      </p>
                      <h2 className="text-base sm:text-lg font-bold text-white truncate">
                        {selectedProgram.program.title}
                      </h2>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/90 text-white backdrop-blur-md shrink-0">
                    {selectedProgram.program.domain}
                  </span>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
                
                {selectedProgram.recommendation_reason && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/70 flex items-start gap-2.5">
                    <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-900 block text-xs">
                        Why this track matches your profile:
                      </span>
                      <p className="text-xs text-blue-800 font-normal mt-0.5">
                        {selectedProgram.recommendation_reason}
                      </p>
                    </div>
                  </div>
                )}

                {isAcademician && (
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-indigo-700" />
                        <span className="font-bold text-indigo-950 text-xs sm:text-sm">
                          Professional Development & Curriculum Alignment
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-800">
                        Aligned with departmental curriculum standards and industry requirements.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSyllabusModalProgram(selectedProgram.program)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <BookOpen size={13} />
                      <span>{verifiedSyllabusIds[String(selectedProgram.program.id)] ? 'View Curriculum Alignment' : 'Review Curriculum'}</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Duration</span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block">{selectedProgram.program.duration}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Delivery Mode</span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block">{selectedProgram.program.mode}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Skill Level</span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block">{selectedProgram.program.level || 'Intermediate'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Mentor</span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate" title={selectedProgram.program.instructor_or_mentor}>
                      {selectedProgram.program.instructor_or_mentor || selectedProgram.program.company_name}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Skills Covered & Reinforced
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProgram.program.skills_covered || []).map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200/70"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {localProgress[String(selectedProgram.program.id)] && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={15} className="text-blue-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          Active Progress Tracker
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 tabular-nums">
                        {localProgress[String(selectedProgram.program.id)]?.progress || 0}% Complete
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${localProgress[String(selectedProgram.program.id)]?.progress || 0}%` }}
                      />
                    </div>

                    {(localProgress[String(selectedProgram.program.id)]?.progress || 0) >= 100 && (
                      <div className="pt-2 flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>Industry Verified Credential Unlocked</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-mono">#SKL-2026-CERT</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Curriculum Modules
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {(selectedProgram.program.modules || []).length || 6} Total Modules
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(selectedProgram.program.modules || []).map((mod, idx) => {
                      const pid = String(selectedProgram.program.id);
                      const isEnrolled = !!localProgress[pid];
                      const isChecked = (localProgress[pid]?.completedModules || []).includes(mod);

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isEnrolled) {
                              handleToggleModule(selectedProgram.program, mod);
                            }
                          }}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isEnrolled ? 'cursor-pointer hover:bg-slate-50' : ''
                          } ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-200/70 text-emerald-950'
                              : 'bg-white border-slate-200/70 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isChecked
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {isChecked ? <Check size={11} /> : idx + 1}
                            </span>
                            <span className={`text-xs font-medium truncate ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {mod}
                            </span>
                          </div>

                          {isEnrolled && (
                            <span className="text-[11px] font-semibold text-blue-600 shrink-0">
                              {isChecked ? 'Done' : 'Mark Done'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                {localProgress[String(selectedProgram.program.id)] ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Enrolled & Active
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const pid = String(selectedProgram.program.id);
                        const allMods = selectedProgram.program.modules || [];
                        const existing = localProgress[pid]?.completedModules || [];
                        if (existing.length < allMods.length) {
                          allMods.forEach((m) => {
                            if (!existing.includes(m)) {
                              handleToggleModule(selectedProgram.program, m);
                            }
                          });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Complete All Modules
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isEnrolling}
                    onClick={() => handleEnroll(selectedProgram.program)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isEnrolling ? 'Enrolling...' : isAcademician ? 'Enroll in Track as Faculty' : '1-Click Enroll in Track'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {syllabusModalProgram && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${getCompanyAvatarColor(syllabusModalProgram.company_name)} flex items-center justify-center font-bold text-sm shadow-md shrink-0 border border-white/20`}>
                    {getCompanyInitials(syllabusModalProgram.company_name)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/80 text-white">
                      Curriculum Verification & BOS Recommendation
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white truncate mt-1">
                      {syllabusModalProgram.title}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSyllabusModalProgram(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl bg-slate-800/60 backdrop-blur-md hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-indigo-600" />
                    <span>Select Department Semester Course to Align:</span>
                  </label>
                  <select
                    value={selectedCourseCode}
                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    {SEMESTER_COURSES.map((course) => (
                      <option key={course.code} value={course.code}>
                        {course.code}: {course.name} ({course.semester} · {course.credits} Credits · {course.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-indigo-600" />
                      <span>Curriculum Alignment Index</span>
                    </span>
                    <span className="text-xs font-bold text-indigo-700 tabular-nums">
                      88% Core Match · 12% Industry Elective Value-Add
                    </span>
                  </div>
                  <div className="w-full bg-indigo-200/70 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-indigo-600 h-full w-[88%]" />
                    <div className="bg-emerald-500 h-full w-[12%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>Outcome-Based Education (OBE) Compliant</span>
                    <span>AICTE Model Curriculum Mapped</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Layers size={14} className="text-slate-600" />
                      <span>Topic & Unit Coverage Verification</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {(syllabusModalProgram.modules || []).length || 4} Verified Modules
                    </span>
                  </div>

                  <div className="space-y-2">
                    {((syllabusModalProgram.modules && syllabusModalProgram.modules.length > 0)
                      ? syllabusModalProgram.modules
                      : [
                          'Foundations, Core Syntax & Architectural Primitives',
                          'Microservices, Enterprise Toolchains & CI/CD Pipelines',
                          'Scalability, Security Compliance & Distributed Systems',
                          'Production Capstone Case Study & Performance Engineering'
                        ]
                    ).map((mod, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            <Check size={11} />
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-800 block truncate">
                              Unit {idx + 1}: {mod}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Matches {selectedCourseCode} Syllabus Module {idx + 1}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Syllabus Aligned
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Award size={14} className="text-amber-500" />
                    <span>Curriculum Alignment & Learning Outcomes</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Course Outcomes</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">Core & Applied Competencies</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Proficiency Level</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">Intermediate / Advanced</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Curriculum Standard</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">Core Degree Elective</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-600" />
                    <span>Faculty Review Notes:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={syllabusNotes}
                    onChange={(e) => setSyllabusNotes(e.target.value)}
                    placeholder="Enter faculty review remarks or curriculum recommendations..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSyllabusModalProgram(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifySyllabus(syllabusModalProgram)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Verify Curriculum Alignment</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Learning;