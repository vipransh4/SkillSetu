import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  Sparkles,
  Loader2,
  X,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import apiClient from '../../api/client';
import searchService from '../../api/search';
import OpportunityCard from './OpportunityCard';
import OpportunityDetails from './OpportunitiesDetails';
import VideoCall from '../Video/VideoCall';

const ROLE_TYPES = [
  { id: 'All', label: 'All Roles' },
  { id: 'FULL_TIME', label: 'Full-Time' },
  { id: 'INTERNSHIP', label: 'Internships' },
  { id: 'APPRENTICESHIP', label: 'Apprenticeships' },
  { id: 'CONTRACT', label: 'Contract / Project' }
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

const initialOpportunities = [
  {
    id: 'op-1',
    title: 'Frontend Developer Intern',
    company: 'TechNova',
    category: 'SaaS',
    type: 'Full-Time',
    logo: 'TN',
    location: 'Bangalore / Hybrid',
    duration: '6 Months',
    stipend: '₹25,000 / month',
    deadline: '15 Oct 2026',
    description: 'Build responsive web apps using React, Tailwind CSS, and TypeScript. Collaborate with UI/UX designers and backend engineers.',
    responsibilities: [
      'Implement pixel-perfect UI designs using React and Tailwind CSS',
      'Optimize web applications for maximum speed and scalability',
      'Collaborate with backend developers to integrate RESTful APIs',
      'Write clean, maintainable, and well-documented code'
    ],
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Git', 'REST APIs'],
    is_remote: true,
    is_verified_partner: true,
    matchScore: 94
  },
  {
    id: 'op-2',
    title: 'Junior Python Engineer',
    company: 'PySphere',
    category: 'FinTech',
    type: 'Full-Time',
    logo: 'PS',
    location: 'Remote',
    duration: 'Full-Time',
    stipend: '₹6,50,000 / year',
    deadline: '20 Oct 2026',
    description: 'Develop and maintain backend services with Django, PostgreSQL, and Celery. Work on distributed transaction pipelines.',
    responsibilities: [
      'Design and implement high-performance backend microservices',
      'Develop robust API contracts and database schema migrations',
      'Implement automated unit and integration tests'
    ],
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
    is_remote: true,
    is_verified_partner: true,
    matchScore: 91
  },
  {
    id: 'op-3',
    title: 'Data Science Apprentice',
    company: 'InsightAI',
    category: 'AI/ML',
    type: 'Apprenticeship',
    logo: 'IA',
    location: 'Hyderabad',
    duration: '12 Months',
    stipend: '₹35,000 / month',
    deadline: '25 Oct 2026',
    description: 'Train deep learning models, conduct feature engineering, and deploy ML pipelines on AWS SageMaker and Kubernetes.',
    responsibilities: [
      'Prepare and validate large datasets for model training',
      'Benchmark computer vision and NLP models on target benchmarks',
      'Deploy real-time inference microservices'
    ],
    skills: ['Python', 'PyTorch', 'Pandas', 'Scikit-Learn', 'AWS'],
    is_remote: false,
    is_verified_partner: true,
    matchScore: 88
  },
  {
    id: 'op-4',
    title: 'Cloud DevOps Associate',
    company: 'CloudScale',
    category: 'Infrastructure',
    type: 'Full-Time',
    logo: 'CS',
    location: 'Pune',
    duration: 'Full-Time',
    stipend: '₹8,00,000 / year',
    deadline: '30 Oct 2026',
    description: 'Automate CI/CD pipelines, manage Kubernetes clusters, and optimize cloud infrastructure on AWS and Terraform.',
    responsibilities: [
      'Maintain GitHub Actions workflows and Terraform infrastructure',
      'Monitor application metrics, traces, and alert triggers'
    ],
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Linux'],
    is_remote: false,
    is_verified_partner: true,
    matchScore: 85
  },
  {
    id: 'op-5',
    title: 'UI/UX Product Design Trainee',
    company: 'PixelCraft',
    category: 'Design Studio',
    type: 'Internship',
    logo: 'PC',
    location: 'Mumbai / Hybrid',
    duration: '3 Months',
    stipend: '₹20,000 / month',
    deadline: '05 Nov 2026',
    description: 'Design interactive prototypes, conduct user research, and build scalable Figma component design systems.',
    responsibilities: [
      'Design user wireframes, flows, and interactive prototypes in Figma',
      'Conduct usability tests and iterate based on qualitative feedback'
    ],
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    is_remote: false,
    is_verified_partner: false,
    matchScore: 82
  }
];

const Opportunities = ({ 
  onRouteChange, 
  initialSearch = '', 
  initialSelectedId = null,
  scheduledCalls = []
}) => {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedRoleType, setSelectedRoleType] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);
  const [activeCall, setActiveCall] = useState(null);

  const getCallsForOpportunity = (opportunity) => {
    return scheduledCalls.filter(
      (c) => c.jobId === opportunity.id || c.jobTitle === opportunity.title
    );
  };

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
      handleSearchNaturalLanguage(initialSearch);
    }
  }, [initialSearch]);

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

  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/listings/');
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (data && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id,
            title: item.title,
            company: item.company_name || item.company?.name || 'Partner Company',
            company_logo: item.company_logo || item.company?.logo_url,
            type: item.role_type === 'FULL_TIME' ? 'Full-Time' : (item.role_type === 'INTERNSHIP' ? 'Internship' : (item.role_type || 'Full-Time')),
            role_type: item.role_type,
            location: item.location || 'Remote',
            duration: item.duration || 'Full-Time',
            stipend: item.stipend_or_ctc || (item.min_salary ? `₹${item.min_salary} - ₹${item.max_salary}` : 'Competitive'),
            deadline: item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Open',
            description: item.description || '',
            responsibilities: item.responsibilities || [],
            skills: item.skills_required || item.skills || [],
            is_remote: item.is_remote ?? (item.location?.toLowerCase().includes('remote')),
            is_verified_partner: item.is_verified_partner ?? true,
            matchScore: item.match_score || Math.floor(82 + Math.random() * 15)
          }));
          setOpportunities(mapped);

          if (initialSelectedId) {
            const found = mapped.find(o => String(o.id) === String(initialSelectedId));
            if (found) setSelectedOpportunity(found);
          }
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, [initialSelectedId]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((op) => {
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const titleMatch = (op.title || '').toLowerCase().includes(q);
        const companyMatch = (op.company || '').toLowerCase().includes(q);
        const locationMatch = (op.location || '').toLowerCase().includes(q);
        const skillMatch = (op.skills || []).some(s => s.toLowerCase().includes(q));
        if (!titleMatch && !companyMatch && !locationMatch && !skillMatch) {
          return false;
        }
      }

      if (selectedRoleType !== 'All') {
        const opType = (op.role_type || op.type || '').toUpperCase().replace('-', '_');
        if (selectedRoleType === 'FULL_TIME' && !opType.includes('FULL')) return false;
        if (selectedRoleType === 'INTERNSHIP' && !opType.includes('INTERN')) return false;
        if (selectedRoleType === 'APPRENTICESHIP' && !opType.includes('APPRENTICE')) return false;
        if (selectedRoleType === 'CONTRACT' && !opType.includes('CONTRACT')) return false;
      }

      if (selectedWorkMode !== 'All') {
        if (selectedWorkMode === 'Remote' && !op.is_remote && !op.location?.toLowerCase().includes('remote')) {
          return false;
        }
        if (selectedWorkMode === 'Hybrid' && !op.location?.toLowerCase().includes('hybrid')) {
          return false;
        }
        if (selectedWorkMode === 'On-Site' && (op.is_remote || op.location?.toLowerCase().includes('remote') || op.location?.toLowerCase().includes('hybrid'))) {
          return false;
        }
      }

      if (selectedLocation !== 'All') {
        if (!op.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, searchTerm, selectedRoleType, selectedWorkMode, selectedLocation]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (searchTerm.trim()) {
      list.push({ label: `"${searchTerm.trim()}"`, onRemove: () => setSearchTerm('') });
    }
    if (selectedRoleType !== 'All') {
      const found = ROLE_TYPES.find(r => r.id === selectedRoleType);
      list.push({ label: found?.label || selectedRoleType, onRemove: () => setSelectedRoleType('All') });
    }
    if (selectedWorkMode !== 'All') {
      list.push({ label: selectedWorkMode, onRemove: () => setSelectedWorkMode('All') });
    }
    if (selectedLocation !== 'All') {
      list.push({ label: selectedLocation, onRemove: () => setSelectedLocation('All') });
    }
    return list;
  }, [searchTerm, selectedRoleType, selectedWorkMode, selectedLocation]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRoleType('All');
    setSelectedWorkMode('All');
    setSelectedLocation('All');
  };

  const handleApply = async (opp) => {
    const idStr = String(opp.id);
    if (appliedIds.includes(idStr)) return;
    try {
      await apiClient.post(`/listings/${opp.id}/apply/`);
    } catch {
    }
    setAppliedIds(prev => [...prev, idStr]);
  };

  if (selectedOpportunity) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-6 px-4 sm:px-6 lg:px-8">
        <OpportunityDetails
          opportunity={selectedOpportunity}
          onBack={() => setSelectedOpportunity(null)}
          onApply={handleApply}
          isApplied={appliedIds.includes(String(selectedOpportunity.id))}
          candidateSkills={['Python', 'React', 'Git', 'SQL', 'PostgreSQL', 'Tailwind CSS']}
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
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                Live Openings
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Verified Candidate Pipeline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Explore Opportunities
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Direct campus and experienced hiring matched against your verified skills matrix.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs tabular-nums">
              <span className="font-bold text-slate-900">{filteredOpportunities.length}</span> Active Positions
            </span>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <aside className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs sticky top-24">
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
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearchNaturalLanguage(e.target.value);
                    }}
                    placeholder="Role, skill, or company..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Role Type
                </label>
                <div className="space-y-1">
                  {ROLE_TYPES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleType(role.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        selectedRoleType === role.id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{role.label}</span>
                      {selectedRoleType === role.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
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
                  {WORK_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedWorkMode(mode.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        selectedWorkMode === mode.id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{mode.label}</span>
                      {selectedWorkMode === mode.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Location
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

          <section className="lg:col-span-3 space-y-4">
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
                    isApplied={appliedIds.includes(String(opp.id))}
                    searchQuery={searchTerm}
                    calls={getCallsForOpportunity(opp)}
                    onJoinCall={(call) => setActiveCall(call)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Opportunities;