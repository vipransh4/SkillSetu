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
  Play
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
  if (prog.branding_banner_url && prog.branding_banner_url.startsWith('http')) {
    return prog.branding_banner_url;
  }
  const title = (prog.title || '').toLowerCase();
  const domain = (prog.domain || '').toLowerCase();

  if (title.includes('cloud') || title.includes('kubernetes')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('ai') || title.includes('llm') || title.includes('machine learning')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('full-stack') || title.includes('next.js') || title.includes('react') || title.includes('python')) {
    return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('go') || title.includes('distributed') || title.includes('concurrency')) {
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('gst') || title.includes('tally') || title.includes('audit')) {
    return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('financial') || title.includes('valuation') || title.includes('dcf')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('tax') || title.includes('ind as') || title.includes('transfer pricing')) {
    return 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('trading') || title.includes('quantitative') || title.includes('quant')) {
    return 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('business analysis') || title.includes('brd') || title.includes('bpmn')) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('agile') || title.includes('scrum')) {
    return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('supply chain') || title.includes('operations')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('crm') || title.includes('salesforce')) {
    return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('design systems') || title.includes('figma')) {
    return 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('ui/ux') || title.includes('user research') || title.includes('wireframing')) {
    return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('accessibility') || title.includes('wcag')) {
    return 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80';
  }
  if (title.includes('motion') || title.includes('interaction')) {
    return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80';
  }
  if (domain.includes('design')) {
    return 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80';
  }
  if (domain.includes('commerce') || domain.includes('finance')) {
    return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80';
  }
  if (domain.includes('business') || domain.includes('management')) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80';
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
  const [activeView, setActiveView] = useState('recommended');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
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

  const displayedList = useMemo(() => {
    let base = [];
    if (activeView === 'recommended') {
      base = recommendationData.recommended_programs;
    } else if (activeView === 'boosters') {
      base = recommendationData.skill_gap_boosters;
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
        if ((prog.program_type || '').toUpperCase() !== selectedFormat) return false;
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
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles size={14} /> Skill Up for Industry
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Curated Learning Pathways
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Access faculty-led lectures, industry certifications, and hands-on technical tracks designed to bridge the gap between classroom theory and real-world tech stacks.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">50+</p>
              <p className="text-xs text-slate-400">Skill Tracks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">120+</p>
              <p className="text-xs text-slate-400">Faculty Lectures</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">85%</p>
              <p className="text-xs text-slate-400">Avg. Completion</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">Verified</p>
              <p className="text-xs text-slate-400">Certificates</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveView('recommended')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
              activeView === 'recommended'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <Sparkles size={14} />
            <span>Recommended for You</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === 'recommended' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {recommendationData.recommended_programs.length}
            </span>
          </button>

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

          <button
            onClick={() => setActiveView('enrolled')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
              activeView === 'enrolled'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <BookOpen size={14} />
            <span>My Active Tracks</span>
            {enrolledCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeView === 'enrolled' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {enrolledCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap ${
              activeView === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <Compass size={14} />
            <span>Browse All Tracks</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search tracks by skill (e.g. Next.js, Tally, Figma, Docker), title, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
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
              {FORMAT_TABS.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedFormat === fmt.id
                      ? 'bg-slate-900 text-white font-semibold'
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
                        {prog.is_certified && (
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

                        {item.is_gap_booster ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1 shrink-0">
                            <Zap size={10} className="fill-amber-500 text-amber-500" />
                            <span>{item.expected_boost || 'Gap Booster'}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 tabular-nums shrink-0">
                            {item.match_score}% Match
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

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      {(prog.modules || []).length || 6} Modules · {prog.level || 'Intermediate'}
                    </span>
                    <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                      <span>{isDone ? 'Review Track' : isEnrolledLocally ? 'Continue Track' : 'Start Track'}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
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
                    <span>{isEnrolling ? 'Enrolling...' : '1-Click Enroll in Track'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Learning;