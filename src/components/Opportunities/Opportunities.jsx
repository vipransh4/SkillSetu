import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Timer, 
  IndianRupee, 
  CalendarClock, 
  Search, 
  Filter, 
  RotateCcw, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Loader2,
  Building,
  X
} from 'lucide-react';
import apiClient from '../../api/client';
import searchService from '../../api/search';

const Opportunities = ({ 
  onRouteChange, 
  initialSearch = '', 
  initialSelectedId = null 
}) => {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);

  // Sync incoming search query from Navbar search
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  
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
              category: l.role_type || 'Job',
              type: l.role_type === 'INTERNSHIP' 
                ? 'Internship' 
                : (l.role_type === 'FULL_TIME' ? 'Full-Time' : (l.role_type || 'Job')),
              logo: (l.company_name || 'SS').substring(0, 2).toUpperCase(),
              location: l.location || (l.is_remote ? 'Remote' : 'On-Site'),
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
        console.warn('Failed to load live jobs feed from backend', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchJobs();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [searchTerm]);

  // Sync pre-selected opportunity if ID passed from Navbar search result click
  useEffect(() => {
    if (initialSelectedId && opportunities.length > 0) {
      const found = opportunities.find((op) => String(op.id) === String(initialSelectedId));
      if (found) {
        setSelectedOpportunity(found);
      }
    }
  }, [initialSelectedId, opportunities]);

  const handleApply = (id) => {
    if (!appliedIds.includes(id)) {
      setAppliedIds((prev) => [...prev, id]);
    }
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((op) => {
      const matchesType = selectedType === 'All' || op.type === selectedType;
      const matchesLocation =
        selectedLocation === 'All' ||
        (selectedLocation === 'Remote'
          ? op.location.toLowerCase().includes('remote')
          : !op.location.toLowerCase().includes('remote'));

      return matchesType && matchesLocation;
    });
  }, [opportunities, selectedType, selectedLocation]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedLocation('All');
  };

  /* Render Details View if a card was clicked */
  if (selectedOpportunity) {
    const isApplied = appliedIds.includes(selectedOpportunity.id);

    return (
      <div className="min-h-screen pb-16">
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedOpportunity(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Back to Opportunities</span>
          </button>

          {/* View Details Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                      {selectedOpportunity.logo || selectedOpportunity.company?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{selectedOpportunity.title}</h1>
                      <p className="text-slate-500 font-medium text-sm mt-0.5">
                        {selectedOpportunity.company} · {selectedOpportunity.category || 'Tech'} · {selectedOpportunity.type}
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-200 shrink-0">
                    {selectedOpportunity.matchScore || 90}% Match
                  </div>
                </div>

                {/* Metadata Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                      <MapPin size={14} /> Location
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.location}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                      <Timer size={14} /> Tenure
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.duration}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                      <IndianRupee size={14} /> Compensation
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.stipend}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                      <CalendarClock size={14} /> Apply before
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.deadline}</p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-bold text-slate-900 mb-3">About the role</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedOpportunity.about}
                </p>
              </div>

              {/* Responsibilities */}
              {selectedOpportunity.responsibilities && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Core Responsibilities</h2>
                  <ul className="flex flex-col gap-3">
                    {selectedOpportunity.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {selectedOpportunity.qualifications && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Preferred Qualifications</h2>
                  <ul className="flex flex-col gap-3">
                    {selectedOpportunity.qualifications.map((qual, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Required Skills Matrix</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedOpportunity.skills?.map((skill, index) => (
                    <span key={index} className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column - Sidebar Widgets */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
              
              {/* Compatibility Sidebar */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <h3 className="text-base font-bold text-slate-900 mb-1">Your Match Score</h3>
                <p className="text-3xl font-extrabold text-blue-600 mb-4">{selectedOpportunity.matchScore || 90}% Fit</p>

                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${selectedOpportunity.matchScore || 90}%` }}
                  />
                </div>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key technical badges</p>
                <div className="flex flex-col gap-2.5 mb-6">
                  {selectedOpportunity.skills?.slice(0, 4).map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <Check size={16} className="text-emerald-500" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleApply(selectedOpportunity.id)}
                  disabled={isApplied}
                  className={`w-full py-3 font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isApplied
                      ? 'bg-emerald-600 text-white cursor-not-allowed opacity-90'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check size={18} />
                      <span>Application Submitted</span>
                    </>
                  ) : (
                    'Apply with 1-Click Profile'
                  )}
                </button>
              </div>

              {/* Employer Info */}
              <div className="bg-blue-50/60 rounded-3xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-base mb-3">
                  <Sparkles size={18} />
                  <span>Verified Corporate Partner</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedOpportunity.company} is an active industry partner on Skill Setu. Offers issued here automatically sync with your verified digital portfolio.
                </p>
              </div>

            </div>

          </div>
        </main>
      </div>
    );
  }

  /* Render List View */
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Explore Opportunities</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse verified job postings, corporate internships, and live project openings.
            </p>
          </div>

          {searchTerm && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm animate-in fade-in">
              <span>Results for: <strong className="text-blue-900">"{searchTerm}"</strong></span>
              <button
                onClick={() => setSearchTerm('')}
                className="hover:bg-blue-200/60 p-0.5 rounded-full transition-colors cursor-pointer"
                title="Clear filter"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDE: Filter Section */}
          <aside className="w-full lg:w-72 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] shrink-0 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Filter size={18} className="text-blue-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Search Bar */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Title, skill, or company..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <RotateCcw size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Employment Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Type</label>
                <div className="flex flex-col gap-2">
                  {['All', 'Full-Time', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="jobType"
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'All Locations', value: 'All' },
                    { label: 'Remote Only', value: 'Remote' },
                    { label: 'On-Site / In-Office', value: 'Onsite' },
                  ].map((loc) => (
                    <label key={loc.value} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="location"
                        checked={selectedLocation === loc.value}
                        onChange={() => setSelectedLocation(loc.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                      {loc.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: Opportunities Cards (2 per row) */}
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-100">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-sm font-medium text-slate-600">Loading active openings from database...</p>
              </div>
            ) : filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOpportunities.map((op) => {
                  const isApplied = appliedIds.includes(op.id);

                  return (
                    <div
                      key={op.id}
                      className="relative w-full bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-5"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center border border-blue-100 shrink-0">
                            {op.logo || op.company?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-800 truncate">{op.title}</h3>
                            <p className="text-sm font-medium text-slate-500">
                              {op.company} <span className="text-slate-300">•</span> {op.type}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.stipend?.replace('₹', '')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarClock size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.deadline}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {op.skills && op.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {op.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setSelectedOpportunity(op)}
                          className="flex-1 py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApply(op.id)}
                          disabled={isApplied}
                          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isApplied
                              ? 'bg-emerald-600 text-white cursor-not-allowed opacity-90'
                              : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check size={16} />
                              <span>Applied</span>
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full bg-white rounded-2xl p-12 text-center border border-slate-100">
                <p className="text-slate-500 font-medium">No opportunities found matching your active filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Opportunities;