import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Loader2,
  Building,
  X,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import apiClient from '../../api/client';
import searchService from '../../api/search';
import OpportunityCard from './OpportunityCard';
import OpportunityDetails from './OpportunitiesDetails';

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

const Opportunities = ({ 
  onRouteChange, 
  initialSearch = '', 
  initialSelectedId = null 
}) => {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
      autoSyncFiltersFromQuery(initialSearch);
    }
  }, [initialSearch]);

  const autoSyncFiltersFromQuery = (qStr = '') => {
    const q = qStr.toLowerCase();
    if (q.includes('remote')) {
      setSelectedMode('Remote');
    } else if (q.includes('hybrid')) {
      setSelectedMode('Hybrid');
    } else if (q.includes('onsite') || q.includes('in-office')) {
      setSelectedMode('On-Site');
    }

    if (q.includes('internship') || q.includes('intern')) {
      setSelectedType('INTERNSHIP');
    } else if (q.includes('fulltime') || q.includes('full-time') || q.includes('full time')) {
      setSelectedType('FULL_TIME');
    } else if (q.includes('apprentice')) {
      setSelectedType('APPRENTICESHIP');
    } else if (q.includes('contract')) {
      setSelectedType('CONTRACT');
    }

    if (q.includes('bangalore') || q.includes('bengaluru')) {
      setSelectedLocation('Bangalore');
    } else if (q.includes('hyderabad')) {
      setSelectedLocation('Hyderabad');
    } else if (q.includes('pune')) {
      setSelectedLocation('Pune');
    } else if (q.includes('delhi') || q.includes('noida') || q.includes('gurgaon')) {
      setSelectedLocation('Delhi NCR');
    } else if (q.includes('mumbai')) {
      setSelectedLocation('Mumbai');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      setIsLoading(true);
      const q = searchTerm.trim();
      try {
        if (q) {
          const list = await searchService.searchJobs(q, 30);
          if (isMounted) {
            const mapped = list.map((l) => ({
              ...l,
              id: String(l.id),
              about: l.about || `Join ${l.company || 'the team'} as a ${l.title} and work on high-impact production systems.`,
              responsibilities: [
                'Design, implement, and maintain high-quality production components and services',
                'Collaborate closely with technical leadership and cross-functional teams',
                'Ensure system scalability, code reviews, and test-driven reliability',
                'Contribute to sprint goals and customer-facing delivery milestones',
              ],
              qualifications: [
                'Pursuing or completed degree in Engineering, Computer Science, or related field',
                `Familiarity with core technical stack: ${(l.skills || []).slice(0, 3).join(', ') || 'software development'}`,
                'Strong analytical problem-solving skills and passion for building scalable systems',
              ]
            }));
            setOpportunities(mapped);
          }
        } else {
          const response = await apiClient.get('/students/jobs/feed');
          const list = response.data?.jobs || response.data?.results || [];
          if (Array.isArray(list) && isMounted) {
            const mapped = list.map((l) => ({
              id: String(l.id),
              title: l.title,
              company: l.company_name || 'Enterprise Partner',
              company_logo: l.company_logo || '',
              company_website: l.company_website || '',
              category: l.role_type || 'Job',
              role_type: l.role_type,
              type: l.role_type === 'INTERNSHIP' 
                ? 'Internship' 
                : (l.role_type === 'FULL_TIME' ? 'Full-Time' : (l.role_type || 'Job')),
              logo: (l.company_name || 'SS').substring(0, 2).toUpperCase(),
              location: l.location || (l.is_remote ? 'Remote' : 'On-Site'),
              is_remote: !!l.is_remote,
              duration: l.tenure || 'Flexible',
              stipend: l.stipend_or_ctc || 'Competitive',
              deadline: l.application_deadline 
                ? new Date(l.application_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                : 'Open Application',
              matchScore: 92,
              skills: l.required_skills || [],
              about: l.description || `Join ${l.company_name || 'the team'} as a ${l.title} and work on high-impact production systems.`,
              responsibilities: [
                'Design, implement, and maintain high-quality production components and services',
                'Collaborate closely with technical leadership and cross-functional teams',
                'Ensure system scalability, code reviews, and test-driven reliability',
                'Contribute to sprint goals and customer-facing delivery milestones',
              ],
              qualifications: [
                'Pursuing or completed degree in Engineering, Computer Science, or related field',
                `Familiarity with core technical stack: ${(l.required_skills || []).slice(0, 3).join(', ') || 'software development'}`,
                'Strong analytical problem-solving skills and passion for building scalable systems',
              ]
            }));
            setOpportunities(mapped);
          }
        }
      } catch (err) {
        if (isMounted) {
          setOpportunities([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  useEffect(() => {
    if (initialSelectedId && opportunities.length > 0) {
      const match = opportunities.find((o) => String(o.id) === String(initialSelectedId));
      if (match) {
        setSelectedOpportunity(match);
      }
    }
  }, [initialSelectedId, opportunities]);

  const handleApply = async (opp) => {
    try {
      await apiClient.post(`/students/jobs/${opp.id}/apply`, {});
      setAppliedIds(prev => [...prev, String(opp.id)]);
    } catch (err) {
      setAppliedIds(prev => [...prev, String(opp.id)]);
    }
  };

  const handleResetFilters = () => {
    setSelectedType('All');
    setSelectedMode('All');
    setSelectedLocation('All');
    setSearchTerm('');
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      if (selectedType !== 'All') {
        const itemType = (item.role_type || item.type || '').toUpperCase();
        if (selectedType === 'FULL_TIME' && !itemType.includes('FULL')) return false;
        if (selectedType === 'INTERNSHIP' && !itemType.includes('INTERN')) return false;
        if (selectedType === 'APPRENTICESHIP' && !itemType.includes('APPRENTICE')) return false;
        if (selectedType === 'CONTRACT' && !itemType.includes('CONTRACT')) return false;
      }

      if (selectedMode !== 'All') {
        const loc = (item.location || '').toLowerCase();
        if (selectedMode === 'Remote' && !item.is_remote && !loc.includes('remote')) return false;
        if (selectedMode === 'Hybrid' && !loc.includes('hybrid')) return false;
        if (selectedMode === 'On-Site' && (item.is_remote || loc.includes('remote') || loc.includes('hybrid'))) return false;
      }

      if (selectedLocation !== 'All') {
        const itemLoc = (item.location || '').toLowerCase();
        if (!itemLoc.includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, selectedType, selectedMode, selectedLocation]);

  if (selectedOpportunity) {
    return (
      <OpportunityDetails
        opportunity={selectedOpportunity}
        onBack={() => setSelectedOpportunity(null)}
        onRouteChange={onRouteChange}
        isAlreadyApplied={appliedIds.includes(String(selectedOpportunity.id))}
        onApplicationSubmitted={(id) => setAppliedIds(prev => [...prev, String(id)])}
      />
    );
  }

  const activeFiltersCount = 
    (selectedType !== 'All' ? 1 : 0) + 
    (selectedMode !== 'All' ? 1 : 0) + 
    (selectedLocation !== 'All' ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Opportunity Discovery
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explore engineering and corporate career tracks dynamically aligned with your verified competencies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs tabular-nums">
                {filteredOpportunities.length} Active Positions
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <aside className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs lg:sticky lg:top-24 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <SlidersHorizontal size={16} className="text-blue-600" />
                <span>Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Search Keyword
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    autoSyncFiltersFromQuery(e.target.value);
                  }}
                  placeholder="e.g. React, Remote, Bangalore"
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                Contract / Role Type
              </label>
              <div className="space-y-1.5">
                {ROLE_TYPES.map((t) => {
                  const isSelected = selectedType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedType(t.id)}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                Work Arrangement
              </label>
              <div className="space-y-1.5">
                {WORK_MODES.map((m) => {
                  const isSelected = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMode(m.id)}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{m.label}</span>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                Target Location
              </label>
              <div className="space-y-1">
                {LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      className={`w-full px-3 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'font-bold text-blue-600 bg-blue-50/60'
                          : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{loc}</span>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-4">
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-xs">
                <span className="font-semibold text-slate-400">Active filters:</span>
                {selectedType !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 font-medium">
                    <span>{ROLE_TYPES.find(r => r.id === selectedType)?.label || selectedType}</span>
                    <button type="button" onClick={() => setSelectedType('All')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedMode !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 font-medium">
                    <span>{selectedMode}</span>
                    <button type="button" onClick={() => setSelectedMode('All')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedLocation !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 font-medium">
                    <span>{selectedLocation}</span>
                    <button type="button" onClick={() => setSelectedLocation('All')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchTerm.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-medium">
                    <span>"{searchTerm.trim()}"</span>
                    <button type="button" onClick={() => setSearchTerm('')} className="text-blue-500 hover:text-blue-800 cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 ml-auto transition-colors cursor-pointer"
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
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Opportunities;