import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  RotateCcw, 
  Sparkles,
  Loader2,
  X,
  SlidersHorizontal,
  Briefcase,
  CalendarClock,
  Clock,
  CheckCircle2,
  Award,
  ExternalLink,
  Plus,
  Send,
  Building2,
  MapPin,
  Check,
  ArrowRight,
  GraduationCap,
  Users
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';
import OpportunityCard from './OpportunityCard';
import OpportunityDetails from './OpportunitiesDetails';
import VideoCall from '../Video/VideoCall';
import RecruiterPublicProfile from '../Profile/RecruiterPublicProfile';

const getCompanyInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'SS';
  if (name.startsWith('http://') || name.startsWith('https://') || name.includes('/')) return 'SS';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
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
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const ROLE_TYPES = [
  { id: 'All', label: 'All Roles' },
  { id: 'FULL_TIME', label: 'Full-Time' },
  { id: 'INTERNSHIP', label: 'Internships' },
  { id: 'APPRENTICESHIP', label: 'Apprenticeships' },
  { id: 'CONTRACT', label: 'Contract / Project' }
];

const FACULTY_ROLE_TYPES = [
  { id: 'All', label: 'All Faculty Tracks' },
  { id: 'FACULTY_INTERNSHIP', label: 'Faculty Internships' },
  { id: 'FDP', label: 'Faculty Development Programs (FDP)' },
  { id: 'INDUSTRIAL_TRAINING', label: 'Industrial Training & Residencies' },
  { id: 'CONSULTANCY', label: 'Consultancy Projects' },
  { id: 'RESEARCH_PROJECT', label: 'Joint Research Grants' },
  { id: 'WORKSHOP', label: 'Workshops & Challenges' }
];

const WORK_MODES = [
  { id: 'All', label: 'All Arrangements' },
  { id: 'Remote', label: 'Remote Only' },
  { id: 'Hybrid', label: 'Hybrid' },
  { id: 'On-Site', label: 'Onsite' }
];

const LOCATIONS = [
  'All',
  'Remote',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Delhi NCR',
  'Mumbai'
];

const STAGE_CONFIG = {
  APPLIED: { label: 'Applied', color: 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/40' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-transparent text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-transparent text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-500/40' },
  INTERVIEW: { label: 'Interview Scheduled', color: 'bg-transparent text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/40' },
  OFFERED: { label: 'Offer Received', color: 'bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40' },
  REJECTED: { label: 'Archived', color: 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700' },
};

const Opportunities = ({ 
  onRouteChange, 
  initialSearch = '', 
  initialSelectedId = null,
  scheduledCalls = [],
  initialTab = 'explore'
}) => {
  const currentUser = authService.getUser();
  const isAcademician = currentUser?.role === 'academician' || currentUser?.role === 'academia' || currentUser?.backend_role === 'ACADEMIA';
  const isRecruiter = (currentUser?.role || '').toLowerCase() === 'industry' || (currentUser?.role || '').toLowerCase() === 'recruiter' || (currentUser?.backend_role || '').toUpperCase() === 'RECRUITER';

  const [recruiterCompany, setRecruiterCompany] = useState(currentUser?.company_name || currentUser?.company?.name || '');
  const [myCompanyListings, setMyCompanyListings] = useState([]);
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(false);

  const [activeMainTab, setActiveMainTab] = useState(() => {
    if (isAcademician) {
      return initialTab === 'explore' || !initialTab ? 'faculty' : initialTab;
    }
    if (isRecruiter) {
      return initialTab === 'explore' || !initialTab ? 'my-company' : initialTab;
    }
    return initialTab || 'explore';
  });

  useEffect(() => {
    if (initialTab) {
      if (isAcademician && initialTab === 'explore') {
        setActiveMainTab('faculty');
      } else if (isRecruiter && initialTab === 'explore') {
        setActiveMainTab('my-company');
      } else {
        setActiveMainTab(initialTab);
      }
    }
  }, [initialTab, isAcademician, isRecruiter]);

  const fetchMyCompanyListings = async () => {
    if (!isRecruiter) return;
    setIsLoadingMyListings(true);
    try {
      const res = await apiClient.get('/listings/my-listings');
      const data = Array.isArray(res.data) ? res.data : [];
      setMyCompanyListings(data);
      if (data.length > 0 && data[0].company?.name && !recruiterCompany) {
        setRecruiterCompany(data[0].company.name);
      }
    } catch {
      setMyCompanyListings([]);
    } finally {
      setIsLoadingMyListings(false);
    }
  };

  useEffect(() => {
    if (isRecruiter) {
      fetchMyCompanyListings();
      if (!recruiterCompany) {
        apiClient.get('/recruiters/me').then(res => {
          if (res.data?.company?.name) setRecruiterCompany(res.data.company.name);
        }).catch(() => {});
      }
    }
  }, [isRecruiter]);
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedRoleType, setSelectedRoleType] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);
  const [expressedIds, setExpressedIds] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [candidateSkills, setCandidateSkills] = useState([]);

  const [myApplications, setMyApplications] = useState([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  const [schemes, setSchemes] = useState([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [selectedSchemeDomain, setSelectedSchemeDomain] = useState('All');
  const [schemeSearchTerm, setSchemeSearchTerm] = useState('');

  const [milestoneModalTarget, setMilestoneModalTarget] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    week_number: 1,
    milestone_summary: '',
    hours_logged: 40,
    deliverables_url: '',
  });
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);

  const [sopModalTarget, setSopModalTarget] = useState(null);
  const [sopForm, setSopForm] = useState({
    statement_of_purpose: '',
    research_areas: '',
    target_department: '',
    collaboration_outcomes: 'Curriculum Update & BOS Alignment'
  });
  const [isSubmittingSop, setIsSubmittingSop] = useState(false);
  const [batchRecommendTarget, setBatchRecommendTarget] = useState(null);
  const [batchRecommendDept, setBatchRecommendDept] = useState('All Eligible Batches');
  const [batchRecommendCutoff, setBatchRecommendCutoff] = useState('70');
  const [batchRecommendNote, setBatchRecommendNote] = useState('');
  const [isDispatchingBatch, setIsDispatchingBatch] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [viewingRecruiterTarget, setViewingRecruiterTarget] = useState(null);

  const getCallsForOpportunity = (opportunity) => {
    return scheduledCalls.filter(
      (c) => String(c.jobId) === String(opportunity.id) || c.jobTitle === opportunity.title
    );
  };

  const calculateRelevanceScore = (oppSkills = [], userSkills = [], backendScore) => {
    if (backendScore && backendScore > 0) return backendScore;
    if (!userSkills.length || !oppSkills.length) return 85;
    const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
    const matches = oppSkills.filter(s => userSet.has(s.toLowerCase().trim()));
    const ratio = matches.length / Math.max(oppSkills.length, 1);
    return Math.min(99, Math.max(65, Math.round(62 + ratio * 36)));
  };

  const fetchMyApplications = async () => {
    setIsLoadingApplications(true);
    try {
      const res = await apiClient.get('/students/applications');
      const apps = Array.isArray(res.data) ? res.data : [];
      setMyApplications(apps);
      setAppliedIds(apps.map(a => String(a.listing_id || a.id)));
    } catch {
      setMyApplications([]);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const fetchSchemes = async () => {
    setIsLoadingSchemes(true);
    try {
      let res = null;
      try {
        res = await apiClient.get('/students/me/schemes');
      } catch {
        res = await apiClient.get('/schemes/live');
      }
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.schemes || []);
      setSchemes(list);
    } catch {
      setSchemes([]);
    } finally {
      setIsLoadingSchemes(false);
    }
  };

  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchDomain = selectedSchemeDomain === 'All' || s.domain?.toUpperCase() === selectedSchemeDomain.toUpperCase();
      const matchSearch = !schemeSearchTerm || 
        s.title?.toLowerCase().includes(schemeSearchTerm.toLowerCase()) ||
        s.sponsoring_agency?.toLowerCase().includes(schemeSearchTerm.toLowerCase()) ||
        s.benefit_summary?.toLowerCase().includes(schemeSearchTerm.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [schemes, selectedSchemeDomain, schemeSearchTerm]);

  useEffect(() => {
    apiClient.get('/students/me')
      .then((res) => {
        if (res.data) {
          const loaded = res.data.raw_extracted_skills?.length
            ? res.data.raw_extracted_skills
            : Object.keys(res.data.skills_matrix || {});
          setCandidateSkills(loaded);
        }
      })
      .catch(() => {});

    fetchMyApplications();
    fetchSchemes();
  }, []);

  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== null) {
      setSearchTerm(initialSearch);
      if (initialSearch.trim()) {
        if (isAcademician) {
          setActiveMainTab('faculty');
        } else {
          setActiveMainTab('explore');
        }
      }
    }
  }, [initialSearch, isAcademician]);

  const handleSearchNaturalLanguage = (query) => {
    const q = query.toLowerCase();
    if (q.includes('remote')) {
      setSelectedWorkMode('Remote');
    }
    if (q.includes('intern')) {
      setSelectedRoleType('INTERNSHIP');
    } else if (q.includes('full') || q.includes('full-time') || q.includes('fulltime')) {
      setSelectedRoleType('FULL_TIME');
    }
    ['bangalore', 'hyderabad', 'pune', 'delhi', 'mumbai'].forEach(city => {
      if (q.includes(city)) {
        setSelectedLocation(city.charAt(0).toUpperCase() + city.slice(1));
      }
    });
  };

  const prevSelectedIdRef = useRef(initialSelectedId);
  useEffect(() => {
    if (prevSelectedIdRef.current && !initialSelectedId) {
      setSelectedOpportunity(null);
    }
    prevSelectedIdRef.current = initialSelectedId;
  }, [initialSelectedId]);

  const handleOpenSopModal = (opp) => {
    setSopModalTarget(opp);
    setSopForm({
      statement_of_purpose: '',
      research_areas: (opp.skills || []).slice(0, 4).join(', '),
      target_department: '',
      collaboration_outcomes: 'Curriculum Update & BOS Alignment'
    });
  };

  const handleSopSubmit = async (e) => {
    e.preventDefault();
    if (!sopModalTarget) return;

    setIsSubmittingSop(true);
    setActionFeedback(null);

    const payload = {
      statement_of_purpose: sopForm.statement_of_purpose.trim(),
      research_areas: sopForm.research_areas.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const res = await apiClient.post(`/institutions/faculty/opportunities/${sopModalTarget.id}/apply`, payload);
      const idStr = String(sopModalTarget.id);
      setExpressedIds(prev => [...prev, idStr]);
      setAppliedIds(prev => [...prev, idStr]);
      setActionFeedback({
        type: 'success',
        message: res.data?.message || `Institutional Expression of Interest & SOP submitted for '${sopModalTarget.title}'. Recruiter notified.`
      });
      setSopModalTarget(null);
    } catch (err) {
      if (err.response?.status === 409) {
        const idStr = String(sopModalTarget.id);
        setExpressedIds(prev => [...prev, idStr]);
        setAppliedIds(prev => [...prev, idStr]);
        setActionFeedback({
          type: 'success',
          message: `Institutional interest already registered for '${sopModalTarget.title}'.`
        });
        setSopModalTarget(null);
      } else {
        setActionFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Failed to submit expression of interest. Please try again.'
        });
      }
    } finally {
      setIsSubmittingSop(false);
    }
  };

  const handleOpenBatchModal = (opp) => {
    setBatchRecommendTarget(opp);
    setBatchRecommendDept('All Eligible Batches');
    setBatchRecommendCutoff('70');
    setBatchRecommendNote(`Recommended by Academic Advisor: Prioritize preparation on core skills (${(opp.skills || []).slice(0, 3).join(', ')}).`);
  };

  const handleDispatchBatchRecommendation = (e) => {
    e.preventDefault();
    if (!batchRecommendTarget) return;
    setIsDispatchingBatch(true);
    setTimeout(() => {
      setIsDispatchingBatch(false);
      setActionFeedback({
        type: 'success',
        message: `Recommendation for '${batchRecommendTarget.title}' successfully broadcast to ${batchRecommendDept}.`
      });
      setBatchRecommendTarget(null);
    }, 700);
  };

  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      try {
        let endpoint = '/listings/';
        if (isAcademician && activeMainTab === 'faculty') {
          endpoint = '/institutions/faculty/opportunities';
        }
        const res = await apiClient.get(endpoint);
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (data && data.length > 0) {
          const mapped = data.map((item) => {
            const itemSkills = item.required_skills || item.skills_required || item.skills || [];
            const relScore = calculateRelevanceScore(itemSkills, candidateSkills, item.match_score);
            let displayType = item.role_type || 'Full-Time';
            if (item.role_type === 'FACULTY_INTERNSHIP') displayType = 'Faculty Internship';
            else if (item.role_type === 'FDP') displayType = 'Faculty Development Program (FDP)';
            else if (item.role_type === 'INDUSTRIAL_TRAINING') displayType = 'Industrial Training';
            else if (item.role_type === 'CONSULTANCY') displayType = 'Consultancy Project';
            else if (item.role_type === 'RESEARCH_PROJECT') displayType = 'Joint Research Grant';
            else if (item.role_type === 'WORKSHOP') displayType = 'Industry Workshop';
            else if (item.role_type === 'FULL_TIME') displayType = 'Full-Time';
            else if (item.role_type === 'INTERNSHIP') displayType = 'Internship';

            const hiringDisplay = item.hiring_display_name || item.company_name || item.company?.name || 'Partner Organization';
            return {
              id: item.id,
              title: item.title,
              company: hiringDisplay,
              company_id: item.company_id || item.company?.id,
              recruiter_id: item.recruiter_id,
              recruiter_name: item.recruiter_name,
              hiring_mode: item.hiring_mode || 'COMPANY',
              hiring_display_name: hiringDisplay,
              company_logo: item.hiring_logo_url || item.company_logo || item.company?.logo_url,
              type: displayType,
              role_type: item.role_type,
              location: item.location || 'Remote',
              duration: item.tenure || item.duration || 'Flexible',
              stipend: item.stipend_or_ctc || (item.min_salary ? `₹${item.min_salary} - ₹${item.max_salary}` : 'Honorarium / Grant'),
              deadline: item.application_deadline || item.deadline ? new Date(item.application_deadline || item.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Open',
              description: item.description || '',
              responsibilities: item.responsibilities || [],
              skills: itemSkills,
              is_remote: item.is_remote ?? (item.location?.toLowerCase().includes('remote')),
              is_verified_partner: item.is_verified_partner ?? true,
              matchScore: relScore
            };
          });
          setOpportunities(mapped);

          if (initialSelectedId) {
            const found = mapped.find(o => String(o.id) === String(initialSelectedId));
            if (found) setSelectedOpportunity(found);
          }
        } else {
          setOpportunities([]);
        }
      } catch {
        setOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, [initialSelectedId, candidateSkills, isAcademician, activeMainTab]);

  const filteredOpportunities = useMemo(() => {
    const rawQ = searchTerm.trim().toLowerCase();

    const list = opportunities.filter((op) => {
      // 1. Search Query Filter (Multi-signal & Tokenized)
      if (rawQ) {
        const titleStr = (op.title || '').toLowerCase();
        const companyStr = (op.company || op.hiring_display_name || '').toLowerCase();
        const locationStr = (op.location || '').toLowerCase();
        const descStr = (op.description || '').toLowerCase();
        const typeStr = (op.type || op.role_type || '').toLowerCase();
        const skillsList = (op.skills || []).map((s) => String(s).toLowerCase());

        // Direct full-query substring match across any primary field
        const directMatch =
          titleStr.includes(rawQ) ||
          companyStr.includes(rawQ) ||
          locationStr.includes(rawQ) ||
          descStr.includes(rawQ) ||
          typeStr.includes(rawQ) ||
          skillsList.some((s) => s.includes(rawQ) || rawQ.includes(s));

        if (!directMatch) {
          // Tokenized multi-term match
          const stopwords = new Set(['in', 'at', 'for', 'with', 'and', 'the', 'a', 'an', 'to', 'of', 'on', 'jobs', 'job', 'opportunities', 'opportunity', 'openings', 'opening']);
          const tokens = rawQ
            .split(/[\s,+/]+/)
            .map((t) => t.replace(/[^a-z0-9.#-]/g, '').trim())
            .filter((t) => t.length > 0 && !stopwords.has(t));

          if (tokens.length > 0) {
            const allTokensMatch = tokens.every((token) => {
              if (titleStr.includes(token) || companyStr.includes(token) || descStr.includes(token) || typeStr.includes(token)) {
                return true;
              }
              if (skillsList.some((s) => s.includes(token) || token.includes(s))) {
                return true;
              }
              if (locationStr.includes(token)) {
                return true;
              }
              if ((token === 'bangalore' || token === 'bengaluru') && (locationStr.includes('bangalore') || locationStr.includes('bengaluru'))) {
                return true;
              }
              if ((token === 'delhi' || token === 'noida' || token === 'gurugram' || token === 'gurgaon' || token === 'ncr') &&
                  (locationStr.includes('delhi') || locationStr.includes('noida') || locationStr.includes('gurugram') || locationStr.includes('gurgaon') || locationStr.includes('ncr'))) {
                return true;
              }
              if (token === 'mumbai' && (locationStr.includes('mumbai') || locationStr.includes('bombay') || locationStr.includes('navi mumbai'))) {
                return true;
              }
              if (token === 'remote' && (op.is_remote || locationStr.includes('remote') || descStr.includes('remote'))) {
                return true;
              }
              if (token === 'hybrid' && (locationStr.includes('hybrid') || descStr.includes('hybrid'))) {
                return true;
              }
              if ((token === 'intern' || token === 'internship') && (typeStr.includes('intern') || (op.role_type || '').includes('INTERN'))) {
                return true;
              }
              if ((token === 'fulltime' || token === 'full-time' || token === 'fte') && (typeStr.includes('full') || (op.role_type || '').includes('FULL'))) {
                return true;
              }
              if ((token === 'sde' || token === 'swe') && (titleStr.includes('engineer') || titleStr.includes('developer') || titleStr.includes('software'))) {
                return true;
              }
              if ((token === 'dev' || token === 'developer') && (titleStr.includes('engineer') || titleStr.includes('developer') || titleStr.includes('development'))) {
                return true;
              }
              if ((token === 'frontend' || token === 'front-end') && (titleStr.includes('frontend') || titleStr.includes('front-end') || titleStr.includes('ui') || titleStr.includes('react') || titleStr.includes('web'))) {
                return true;
              }
              if ((token === 'backend' || token === 'back-end') && (titleStr.includes('backend') || titleStr.includes('back-end') || titleStr.includes('api') || titleStr.includes('server') || titleStr.includes('python') || titleStr.includes('django') || titleStr.includes('node') || titleStr.includes('java'))) {
                return true;
              }
              if ((token === 'ai' || token === 'ml') && (titleStr.includes('intelligence') || titleStr.includes('learning') || titleStr.includes('ai') || titleStr.includes('ml') || titleStr.includes('data') || skillsList.some((s) => s.includes('learning') || s.includes('intelligence') || s.includes('python') || s.includes('model')))) {
                return true;
              }
              return false;
            });

            if (!allTokensMatch) {
              return false;
            }
          }
        }
      }

      // 2. Role Type Filter
      if (selectedRoleType !== 'All') {
        const opType = (op.role_type || op.type || '').toUpperCase().replace('-', '_');
        if (isAcademician && activeMainTab === 'faculty') {
          if (!opType.includes(selectedRoleType.toUpperCase())) return false;
        } else {
          if (selectedRoleType === 'FULL_TIME' && !opType.includes('FULL')) return false;
          if (selectedRoleType === 'INTERNSHIP' && !opType.includes('INTERN')) return false;
          if (selectedRoleType === 'APPRENTICESHIP' && !opType.includes('APPRENTICE')) return false;
          if (selectedRoleType === 'CONTRACT' && !opType.includes('CONTRACT')) return false;
        }
      }

      // 3. Work Arrangement Filter
      if (selectedWorkMode !== 'All') {
        const locLower = (op.location || '').toLowerCase();
        if (selectedWorkMode === 'Remote' && !op.is_remote && !locLower.includes('remote')) {
          return false;
        }
        if (selectedWorkMode === 'Hybrid' && !locLower.includes('hybrid') && !(op.description || '').toLowerCase().includes('hybrid')) {
          return false;
        }
        if (selectedWorkMode === 'On-Site' && (op.is_remote || locLower.includes('remote') || locLower.includes('hybrid'))) {
          return false;
        }
      }

      // 4. Major Hubs Filter (supporting Indian city aliases)
      if (selectedLocation !== 'All') {
        const locLower = (op.location || '').toLowerCase();
        const selLower = selectedLocation.toLowerCase();
        if (selLower === 'bangalore' || selLower === 'bengaluru') {
          if (!locLower.includes('bangalore') && !locLower.includes('bengaluru')) return false;
        } else if (selLower.includes('delhi') || selLower.includes('ncr')) {
          if (!locLower.includes('delhi') && !locLower.includes('noida') && !locLower.includes('gurgaon') && !locLower.includes('gurugram') && !locLower.includes('ncr')) return false;
        } else if (selLower === 'mumbai') {
          if (!locLower.includes('mumbai') && !locLower.includes('bombay') && !locLower.includes('navi mumbai')) return false;
        } else if (selLower === 'remote') {
          if (!op.is_remote && !locLower.includes('remote')) return false;
        } else {
          if (!locLower.includes(selLower)) return false;
        }
      }

      return true;
    });

    return [...list].sort((a, b) => {
      // Prioritize direct query title/skill matches at the top
      if (rawQ) {
        const aExact = (a.title || '').toLowerCase().includes(rawQ) ? 2 : ((a.skills || []).some((s) => String(s).toLowerCase().includes(rawQ)) ? 1 : 0);
        const bExact = (b.title || '').toLowerCase().includes(rawQ) ? 2 : ((b.skills || []).some((s) => String(s).toLowerCase().includes(rawQ)) ? 1 : 0);
        if (bExact !== aExact) return bExact - aExact;
      }
      if (sortBy === 'relevance' || sortBy === 'match') {
        const scoreA = Number(a.matchScore || 0);
        const scoreB = Number(b.matchScore || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.is_verified_partner ? 1 : 0) - (a.is_verified_partner ? 1 : 0);
      }
      if (sortBy === 'latest') {
        const idA = typeof a.id === 'number' ? a.id : 0;
        const idB = typeof b.id === 'number' ? b.id : 0;
        return idB - idA;
      }
      return 0;
    });
  }, [opportunities, searchTerm, selectedRoleType, selectedWorkMode, selectedLocation, sortBy, isAcademician, activeMainTab]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (searchTerm.trim()) {
      list.push({ label: `"${searchTerm.trim()}"`, onRemove: () => setSearchTerm('') });
    }
    if (selectedRoleType !== 'All') {
      const currentList = isAcademician && activeMainTab === 'faculty' ? FACULTY_ROLE_TYPES : ROLE_TYPES;
      const found = currentList.find(r => r.id === selectedRoleType);
      list.push({ label: found?.label || selectedRoleType, onRemove: () => setSelectedRoleType('All') });
    }
    if (selectedWorkMode !== 'All') {
      list.push({ label: selectedWorkMode, onRemove: () => setSelectedWorkMode('All') });
    }
    if (selectedLocation !== 'All') {
      list.push({ label: selectedLocation, onRemove: () => setSelectedLocation('All') });
    }
    return list;
  }, [searchTerm, selectedRoleType, selectedWorkMode, selectedLocation, isAcademician, activeMainTab]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRoleType('All');
    setSelectedWorkMode('All');
    setSelectedLocation('All');
    setSortBy('relevance');
  };

  const handleApply = async (opp) => {
    const idStr = String(opp.id);
    if (appliedIds.includes(idStr)) return;
    try {
      await apiClient.post(`/students/jobs/${opp.id}/apply`, {});
      setAppliedIds(prev => [...prev, idStr]);
      setActionFeedback({
        type: 'success',
        message: `Application submitted for '${opp.title}' at '${opp.company}'.`
      });
      fetchMyApplications();
    } catch (err) {
      if (err.response?.status === 409) {
        setAppliedIds(prev => [...prev, idStr]);
        setActionFeedback({
          type: 'success',
          message: `You are already registered for '${opp.title}'.`
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Failed to submit application. Please try again.'
        });
      }
    }
  };

  const handleBackToList = () => {
    setSelectedOpportunity(null);
    if (onRouteChange) {
      onRouteChange('opportunities', { selectedId: null, query: searchTerm });
    }
  };

  const handleOpenMilestoneModal = (app) => {
    setMilestoneModalTarget(app);
    const existingLogsCount = (app.weekly_progress_logs || []).length;
    setMilestoneForm({
      week_number: existingLogsCount + 1,
      milestone_summary: '',
      hours_logged: 40,
      deliverables_url: '',
    });
  };

  const handleLogMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneModalTarget) return;

    setIsSubmittingMilestone(true);
    setActionFeedback(null);

    const payload = {
      week_number: parseInt(milestoneForm.week_number, 10) || 1,
      milestone_summary: milestoneForm.milestone_summary.trim(),
      hours_logged: parseInt(milestoneForm.hours_logged, 10) || 40,
      deliverables_url: milestoneForm.deliverables_url.trim(),
    };

    try {
      const res = await apiClient.post(`/students/internships/${milestoneModalTarget.id}/log-milestone`, payload);
      const updatedData = res.data;
      setMyApplications(prev => prev.map(a => a.id === milestoneModalTarget.id ? { ...a, weekly_progress_logs: updatedData.weekly_progress_logs, internship_status: updatedData.internship_status } : a));
      setActionFeedback({
        type: 'success',
        message: `Week ${payload.week_number} milestone successfully recorded into digital portfolio.`
      });
      setMilestoneModalTarget(null);
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to log milestone.'
      });
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  if (selectedOpportunity) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-6 px-4 sm:px-6 lg:px-8">
        <OpportunityDetails
          opportunity={selectedOpportunity}
          onBack={handleBackToList}
          onApply={handleApply}
          onViewRecruiter={(targetOpp) => setViewingRecruiterTarget({
            recruiterId: targetOpp.recruiter_id,
            companyId: targetOpp.company_id,
            name: targetOpp.hiring_display_name || targetOpp.company
          })}
          isAlreadyApplied={appliedIds.includes(String(selectedOpportunity.id)) || expressedIds.includes(String(selectedOpportunity.id))}
          candidateSkills={candidateSkills}
          isAcademician={isAcademician}
          isAdvisoryView={isAcademician && activeMainTab === 'advisory'}
          onExpressInterest={handleOpenSopModal}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800">
      {activeCall && (
        <VideoCall
          channelName={activeCall.channelName}
          candidateName={activeCall.candidateName}
          jobTitle={activeCall.jobTitle}
          onLeave={() => setActiveCall(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {actionFeedback && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in fade-in duration-150 ${
            actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <X size={16} className="text-rose-600 shrink-0" />}
              <span>{actionFeedback.message}</span>
            </div>
            <button type="button" onClick={() => setActionFeedback(null)} className="p-1 rounded-lg hover:bg-black/5 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="mb-6 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 shadow-sm text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-indigo-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{isAcademician ? 'Institutional Advisory & Growth' : currentUser?.role === 'recruiter' ? 'Enterprise Talent Intelligence' : 'Cognitive Fitment & Opportunities Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {isAcademician
                ? 'Institutional Industry Exposure & Corporate Residencies'
                : currentUser?.role === 'recruiter'
                ? 'Enterprise Talent Discovery & Strategic Placement'
                : 'Verified Career Opportunities & Placement Pipeline'}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {isAcademician
                ? 'Faculty development programs, corporate fellowships, collaborative research grants, and student batch recommendation engine.'
                : currentUser?.role === 'recruiter'
                ? 'Verified candidate portfolios evaluated through anti-cheat cognitive assessments and practical engineering benchmarks.'
                : 'Algorithmic fitment scored against your verified cognitive assessment, project evidence recency, and industry certifications.'}
            </p>
          </div>
        </div>

        <div className="mb-6 border-b border-slate-200/80 flex items-center justify-start overflow-x-auto gap-6 sm:gap-8 pb-px">
          {isAcademician ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('faculty');
                  setSelectedRoleType('All');
                }}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  activeMainTab === 'faculty'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                Faculty Programs
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('advisory');
                  setSelectedRoleType('All');
                }}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  activeMainTab === 'advisory'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                Student Opportunities (Advisory)
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('schemes')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  activeMainTab === 'schemes'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                <span>Govt & DEI Schemes</span>
                {schemes.length > 0 && (
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    ({schemes.length})
                  </span>
                )}
              </button>
            </>
          ) : isRecruiter ? (
            <>
              <button
                type="button"
                onClick={() => setActiveMainTab('my-company')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  activeMainTab === 'my-company'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                <Building2 size={14} className="text-blue-600" />
                <span>{recruiterCompany ? `${recruiterCompany} Postings` : "My Company's Postings"}</span>
                <span className="text-xs font-semibold text-slate-400 tabular-nums">
                  ({myCompanyListings.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('explore')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  activeMainTab === 'explore'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                All Market Openings
              </button>

              <button
                type="button"
                onClick={() => onRouteChange?.('students')}
                className="pb-3 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border-b-2 border-transparent"
              >
                <span>Review Verified Candidates</span>
                <ArrowRight size={12} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveMainTab('explore')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  activeMainTab === 'explore'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                Explore Opportunities
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('schemes')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  activeMainTab === 'schemes'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                <span>Govt & DEI Schemes</span>
                {schemes.length > 0 && (
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    ({schemes.filter(s => s.is_eligible).length || schemes.length})
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('applications')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  activeMainTab === 'applications'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                <span>My Applications</span>
                <span className="text-xs font-semibold text-slate-400 tabular-nums">
                  ({myApplications.length})
                </span>
              </button>
            </>
          )}
        </div>

        {activeMainTab === 'schemes' ? (
          <div className="space-y-6">
            
             <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div className="flex items-start gap-3.5">
    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
      <Award size={20} />
    </div>
    <div>
      <h3 className="text-sm sm:text-base font-semibold text-slate-900">
        Government & Corporate DEI Initiatives
      </h3>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-3xl">
        Bridge opportunity and gender disparity across Engineering, Finance, Management, and Creative Arts with government grants, corporate fellowships, and research stipends.
      </p>
    </div>
  </div>
</div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'All', label: 'All Fields' },
                  { id: 'TECH', label: 'Tech & Engineering' },
                  { id: 'FINANCE', label: 'Commerce & Finance' },
                  { id: 'MANAGEMENT', label: 'Management & BBA/MBA' },
                  { id: 'DESIGN', label: 'Design & Creative' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedSchemeDomain(d.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedSchemeDomain === d.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64 shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={schemeSearchTerm}
                  onChange={(e) => setSchemeSearchTerm(e.target.value)}
                  placeholder="Filter by scheme name..."
                  className="w-full pl-8.5 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {isLoadingSchemes ? (
              <div className="py-24 text-center bg-white rounded-2xl border border-slate-200/80">
                <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Cross-referencing eligibility against government grants...</p>
              </div>
            ) : filteredSchemes.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 p-6">
                <Award size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-800">No schemes found matching criteria</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try clearing the domain filters or searching for keywords like Pragati, WIT, or Fellowship.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSchemes.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                          {s.sponsoring_agency || 'Government of India'}
                        </span>
                        {s.is_eligible ? (
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                            <span>100% Eligible</span>
                          </span>
                        ) : s.target_gender ? (
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span>{s.target_gender === 'FEMALE_ONLY' ? 'Women Empowerment' : s.target_gender}</span>
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                        {s.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {s.description || s.benefit_summary}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Grant & Benefit:</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {s.benefit_summary || 'Grant & Mentorship'}
                        </span>
                      </div>

                      {s.match_reasons && s.match_reasons.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          {s.match_reasons.slice(0, 2).map((reason, rIdx) => (
                            <div key={rIdx} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate">{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className="text-[11px] text-slate-400">
                        {s.application_deadline ? (
                          <span>Deadline: <strong className="text-slate-700 tabular-nums">{new Date(s.application_deadline).toLocaleDateString()}</strong></span>
                        ) : (
                          <span>Rolling Admissions</span>
                        )}
                      </div>

                      {s.official_portal_url && (
                        <a
                          href={s.official_portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <span>Apply on Official Portal</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeMainTab === 'applications' ? (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
              <div>
                <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 block">Dedicated Portal</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">Looking for the comprehensive Application Pipeline & Stage Breakdown?</p>
                <p className="text-xs text-slate-500 mt-0.5">Filter by review stage, check interview links, and manage weekly deliverables.</p>
              </div>
              <button
                type="button"
                onClick={() => onRouteChange && onRouteChange('applications')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Open Applications Page</span>
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Recruitment Pipeline Tracker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status updates, scheduled interview vivas, and intern milestone logging</p>
              </div>
              <button
                type="button"
                onClick={fetchMyApplications}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw size={13} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingApplications ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80">
                <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Retrieving application pipeline...</p>
              </div>
            ) : myApplications.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 p-6">
                <Briefcase size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Browse open positions in the explore tab and submit direct 1-click applications with your verified skills snapshot.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMainTab('explore')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Explore Available Roles
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map((app) => {
                  const stageInfo = STAGE_CONFIG[app.status] || STAGE_CONFIG.APPLIED;
                  const companyName = app.company_name || 'Partner Company';
                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {app.company_logo && (app.company_logo.startsWith('http://') || app.company_logo.startsWith('https://') || app.company_logo.startsWith('/')) ? (
                            <div 
                              data-theme-ignore="true"
                              className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden"
                            >
                              <img
                                src={app.company_logo}
                                alt={companyName}
                                referrerPolicy="no-referrer"
                                onError={(e) => { 
                                  e.currentTarget.style.display = 'none'; 
                                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex'; 
                                }}
                                className="w-full h-full object-contain"
                              />
                              <div className={`w-full h-full rounded-xl font-bold text-sm items-center justify-center hidden ${getCompanyAvatarColor(companyName)}`}>
                                {getCompanyInitials(companyName)}
                              </div>
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-2xl font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ${getCompanyAvatarColor(companyName)}`}>
                              {getCompanyInitials(companyName)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-base leading-snug">{app.listing_title}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stageInfo.color}`}>
                                {stageInfo.label}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 tabular-nums">
                                {Math.round(app.match_score)}% Match
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-700">{companyName}</span>
                              <span>·</span>
                              <span>{app.role_type?.replace('_', ' ')}</span>
                              <span>·</span>
                              <span>{app.location}</span>
                              <span>·</span>
                              <span className="tabular-nums font-semibold text-slate-700">{app.stipend_or_ctc}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[11px] text-slate-400 tabular-nums">
                            Applied: {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {app.interview_date && (
                        <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                            <CalendarClock size={16} className="text-indigo-600 shrink-0" />
                            <span>
                              Technical Viva Scheduled: <strong className="tabular-nums">{new Date(app.interview_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-700 font-medium px-2 py-0.5 bg-white rounded-lg border border-indigo-200">
                            WebRTC Interview
                          </span>
                        </div>
                      )}

                      {app.recruiter_notes && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">Recruiter Feedback:</span> {app.recruiter_notes}
                        </div>
                      )}

                      {(app.status === 'OFFERED' || (app.internship_status && app.internship_status !== 'NOT_STARTED')) && (
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <Award size={14} className="text-emerald-600" />
                                Supervised Internship Active
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {app.internship_status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              Logged Milestones: <strong className="tabular-nums">{(app.weekly_progress_logs || []).length} Weeks</strong>
                              {app.mentor_name && ` · Mentor: ${app.mentor_name}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {app.completion_certificate_url && (
                              <a
                                href={app.completion_certificate_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 transition-all flex items-center gap-1 shadow-xs"
                              >
                                <ExternalLink size={12} />
                                <span>Certificate</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenMilestoneModal(app)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} />
                              <span>Log Weekly Milestone</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {app.weekly_progress_logs && app.weekly_progress_logs.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Recorded Milestone Logs
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {app.weekly_progress_logs.map((log, lIdx) => (
                              <div key={lIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>Week {log.week}</span>
                                  <span className="text-[11px] text-slate-500 tabular-nums">{log.hours || 40} hrs</span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">{log.milestone}</p>
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
          </div>
        ) : activeMainTab === 'my-company' ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/20 shrink-0">
                  {getCompanyInitials(recruiterCompany || 'SS')}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-1">
                    <Building2 size={12} />
                    <span>{recruiterCompany || 'Your Enterprise'} · Corporate Hiring Hub</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {recruiterCompany ? `${recruiterCompany} Job Postings` : "My Company's Openings"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Manage active job postings, inspect candidate application velocity, and publish new openings directly to university campuses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onRouteChange?.('post-jobs')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>Post New Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRouteChange?.('students')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Users size={14} />
                  <span>Review Candidates</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Active Openings</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">{myCompanyListings.length}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Published listings</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Total Applicants</span>
                <span className="text-2xl font-bold text-blue-600 mt-1 block tabular-nums">
                  {myCompanyListings.reduce((acc, curr) => acc + (curr.applications_count || 0), 0)}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Received applications</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Hiring Organization</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block truncate">
                  {recruiterCompany || 'Direct Employer'}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Verified Recruiter</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Actions</span>
                <button
                  type="button"
                  onClick={() => fetchMyCompanyListings()}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={13} className={isLoadingMyListings ? 'animate-spin' : ''} />
                  <span>Refresh Postings</span>
                </button>
              </div>
            </div>

            {/* Postings Grid */}
            {isLoadingMyListings ? (
              <div className="py-20 text-center text-slate-400">
                <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs font-semibold">Loading company openings...</p>
              </div>
            ) : myCompanyListings.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No active postings found for {recruiterCompany || 'your company'}</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Publish your engineering, product, or internship roles to begin receiving top-ranked verified candidates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRouteChange?.('post-jobs')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>Create First Job Posting</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCompanyListings.map((job) => {
                  const appsCount = job.applications_count || 0;
                  return (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {job.status || 'PUBLISHED'}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                                {job.role_type?.replace('_', ' ') || 'Full-Time'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg tabular-nums shrink-0">
                            {appsCount} {appsCount === 1 ? 'Applicant' : 'Applicants'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-500">
                          <p className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span>{job.location || 'Remote / Hybrid'}</span>
                          </p>
                          <p className="font-semibold text-slate-800 tabular-nums">
                            {job.stipend_or_ctc || 'Competitive Industry Standard'}
                          </p>
                        </div>

                        {job.required_skills && job.required_skills.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {job.required_skills.slice(0, 4).map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                            {job.required_skills.length > 4 && (
                              <span className="text-[10px] text-slate-400">+{job.required_skills.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('students', { selectedListingId: job.id })}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Users size={12} />
                          <span>Review Applicants</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('post-jobs')}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {isAcademician && activeMainTab === 'faculty' && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      Faculty Programs & Collaborative Research
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-3xl">
                      Explore corporate residencies, development tracks, and research initiatives.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isAcademician && activeMainTab === 'advisory' && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      Student Opportunities
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-3xl">
                      Review industry requirements, compensation, and hiring trends to guide student preparation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-start lg:h-[calc(100vh-6rem)]">
              <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs h-full lg:overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <SlidersHorizontal size={16} className="text-slate-500" />
                    <span>Filters</span>
                  </div>
                  {activeFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Search Keyword
                    </label>
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Title, skill, or company..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                          title="Clear search"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      {isAcademician && activeMainTab === 'faculty' ? 'Faculty Track Category' : 'Role Category'}
                    </label>
                    <div className="space-y-1">
                      {(isAcademician && activeMainTab === 'faculty' ? FACULTY_ROLE_TYPES : ROLE_TYPES).map((rt) => (
                        <button
                          key={rt.id}
                          type="button"
                          onClick={() => setSelectedRoleType(rt.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                            selectedRoleType === rt.id
                              ? isAcademician && activeMainTab === 'faculty' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span>{rt.label}</span>
                          {selectedRoleType === rt.id && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isAcademician && activeMainTab === 'faculty' ? 'bg-indigo-600' : 'bg-blue-600'}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Work Arrangement
                  </label>
                  <div className="space-y-1">
                    {WORK_MODES.map((wm) => (
                      <button
                        key={wm.id}
                        type="button"
                        onClick={() => setSelectedWorkMode(wm.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          selectedWorkMode === wm.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{wm.label}</span>
                        {selectedWorkMode === wm.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Major Hubs
                  </label>
                  <div className="space-y-1">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setSelectedLocation(loc)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          selectedLocation === loc
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{loc === 'All' ? 'All Locations' : loc}</span>
                        {selectedLocation === loc && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <section className="flex-1 space-y-4 h-full lg:overflow-y-auto scrollbar-thin lg:pr-2">
              {/* Prominent Search & Sort Control Bar */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by role, skill (e.g. React, Python), company, or location..."
                    className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 tabular-nums whitespace-nowrap">
                    {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'opening' : 'openings'}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="relevance">Highest Match</option>
                    <option value="latest">Most Recent</option>
                  </select>
                </div>
              </div>
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Active:</span>
                  {activeFilters.map((af, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      <span>{af.label}</span>
                      <button
                        type="button"
                        onClick={af.onRemove}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-auto cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs">
                  <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Filtering opportunity catalog...</p>
                  <p className="text-xs text-slate-400 mt-1">Cross-referencing verified skill matrices & sector benchmarks</p>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="py-20 px-4 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs">
                  <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800 mb-1">No matching opportunities found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                    We couldn't find any positions matching your selected criteria. Try adjusting your filters or search keywords.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onSelect={(selected) => setSelectedOpportunity(selected)}
                      onApply={(appliedOpp) => handleApply(appliedOpp)}
                      onViewRecruiter={(targetOpp) => setViewingRecruiterTarget({
                        recruiterId: targetOpp.recruiter_id,
                        companyId: targetOpp.company_id,
                        name: targetOpp.hiring_display_name || targetOpp.company
                      })}
                      isApplied={appliedIds.includes(String(opp.id)) || expressedIds.includes(String(opp.id))}
                      searchQuery={searchTerm}
                      calls={getCallsForOpportunity(opp)}
                      onJoinCall={(call) => setActiveCall(call)}
                      isAcademician={isAcademician}
                      isAdvisoryView={isAcademician && activeMainTab === 'advisory'}
                      onExpressInterest={handleOpenSopModal}
                      onRecommendToStudents={handleOpenBatchModal}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
      </div>

      {milestoneModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setMilestoneModalTarget(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Log Weekly Milestone</h3>
                <p className="text-xs text-slate-500">{milestoneModalTarget.listing_title}</p>
              </div>
            </div>

            <form onSubmit={handleLogMilestoneSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Week Number</label>
                  <input
                    type="number"
                    min={1}
                    value={milestoneForm.week_number}
                    onChange={(e) => setMilestoneForm(p => ({ ...p, week_number: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all tabular-nums"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Hours Worked</label>
                  <input
                    type="number"
                    min={1}
                    value={milestoneForm.hours_logged}
                    onChange={(e) => setMilestoneForm(p => ({ ...p, hours_logged: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Milestone Summary & Deliverables</label>
                <textarea
                  rows={3}
                  value={milestoneForm.milestone_summary}
                  onChange={(e) => setMilestoneForm(p => ({ ...p, milestone_summary: e.target.value }))}
                  placeholder="Summary of technical sprints, tickets resolved, and architecture contributions..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Repository / Deliverable URL</label>
                <input
                  type="url"
                  value={milestoneForm.deliverables_url}
                  onChange={(e) => setMilestoneForm(p => ({ ...p, deliverables_url: e.target.value }))}
                  placeholder="https://github.com/username/project/pull/..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMilestoneModalTarget(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMilestone}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingMilestone ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Milestone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sopModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSopModalTarget(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl ${getCompanyAvatarColor(sopModalTarget.company)} font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}>
                {getCompanyInitials(sopModalTarget.company)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Express Institutional Interest</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Statement of Purpose
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{sopModalTarget.title} · {sopModalTarget.company}</p>
              </div>
            </div>

            <form onSubmit={handleSopSubmit} className="flex flex-col gap-3.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{sopModalTarget.type || 'Faculty Track'}</span>
                  <span className="tabular-nums font-bold text-slate-900">{sopModalTarget.stipend}</span>
                </div>
                <p className="text-[11px] text-slate-500">{sopModalTarget.location} · {sopModalTarget.duration}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Department / Institution</label>
                <input
                  type="text"
                  value={sopForm.target_department}
                  onChange={(e) => setSopForm(p => ({ ...p, target_department: e.target.value }))}
                  placeholder="e.g. Department of Computer Science & Engineering"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Faculty Research Areas</label>
                <input
                  type="text"
                  value={sopForm.research_areas}
                  onChange={(e) => setSopForm(p => ({ ...p, research_areas: e.target.value }))}
                  placeholder="e.g. Distributed Systems, High-Performance Computing, AI/ML"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Collaboration Objective</label>
                <select
                  value={sopForm.collaboration_outcomes}
                  onChange={(e) => setSopForm(p => ({ ...p, collaboration_outcomes: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 transition-all"
                >
                  <option value="Curriculum Alignment">Curriculum & Course Alignment</option>
                  <option value="Joint Research Project">Joint Industry Research</option>
                  <option value="Industry-Mentored Lab">Industry-Mentored Student Lab</option>
                  <option value="Faculty Development Program (FDP)">Faculty Development & Sabbatical</option>
                  <option value="Student Placement & Internship Pipeline">Student Placement & Internship Opportunities</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Statement of Purpose (SOP)</label>
                <textarea
                  rows={4}
                  value={sopForm.statement_of_purpose}
                  onChange={(e) => setSopForm(p => ({ ...p, statement_of_purpose: e.target.value }))}
                  placeholder="Describe your research interests, objectives, and collaboration goals..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSopModalTarget(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSop}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingSop ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Submit Expression of Interest</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {batchRecommendTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative">
            <button
              type="button"
              onClick={() => setBatchRecommendTarget(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {getCompanyInitials(batchRecommendTarget.company)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Recommend Listing to Student Batch</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{batchRecommendTarget.title} • {batchRecommendTarget.company}</p>
              </div>
            </div>

            <form onSubmit={handleDispatchBatchRecommendation} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Target Department & Batch</label>
                <select
                  value={batchRecommendDept}
                  onChange={(e) => setBatchRecommendDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 transition-all cursor-pointer"
                >
                  <option value="All Eligible Batches">All Eligible Batches (Campus-Wide)</option>
                  <option value="Computer Science & Engineering (2026)">Computer Science & Engineering (2026)</option>
                  <option value="Information Technology (2026)">Information Technology (2026)</option>
                  <option value="Electronics & Communication (2026)">Electronics & Communication (2026)</option>
                  <option value="Mechanical Engineering (2026)">Mechanical Engineering (2026)</option>
                  <option value="Management & Commerce (2026)">Management & Commerce (2026)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Minimum Verified Fit Threshold (Ws %)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={batchRecommendCutoff}
                  onChange={(e) => setBatchRecommendCutoff(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 transition-all tabular-nums"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Faculty Advisory Note & Endorsement</label>
                <textarea
                  rows={3}
                  value={batchRecommendNote}
                  onChange={(e) => setBatchRecommendNote(e.target.value)}
                  placeholder="Provide guidance on required skill preparations and test criteria..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 transition-all resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Notification Protocol:</span> This recommendation will appear directly in candidates' opportunity radar with an "Endorsed by Faculty" badge.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBatchRecommendTarget(null)}
                  className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatchingBatch}
                  className="flex-1 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDispatchingBatch ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                  <span>Broadcast Recommendation</span>
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
            onSelectOpportunity={(opp) => {
              setViewingRecruiterTarget(null);
              setSelectedOpportunity(opp);
            }}
            onRouteChange={onRouteChange}
          />
        </div>
      )}
    </div>
  );
};

export default Opportunities;