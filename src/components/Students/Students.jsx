import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Check, 
  Filter, 
  UserCheck, 
  X, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Briefcase, 
  GraduationCap, 
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';
import searchService from '../../api/search';
import StudentPortfolio from '../Uploading/StudentPortfolio';

const Students = ({ onRouteChange, initialSearch = '', initialSelectedId = null }) => {
  const currentUser = authService.getUser();
  const isRecruiter = currentUser?.role === 'industry';

  const PAGE_SIZE = 50;
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tableTopRef = useRef(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [expandedSkillsIds, setExpandedSkillsIds] = useState({});
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState('bestMatch');
  const [sortBy, setSortBy] = useState('match');
  const [sortOrder, setSortOrder] = useState('desc');

  const [nominateTarget, setNominateTarget] = useState(null);
  const [nominateListingId, setNominateListingId] = useState('');
  const [nominateNote, setNominateNote] = useState('');
  const [isNominating, setIsNominating] = useState(false);
  const [nominateMessage, setNominateMessage] = useState(null);
  const [recruiterListings, setRecruiterListings] = useState([]);

  // Sync incoming search query from Navbar search (e.g. when pressing Enter in Navbar)
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  // Unified candidates loader:
  // When searchTerm is present, use unified 3-signal vector search (searchService.searchCandidates).
  // When searchTerm is empty, load full verified candidate roster (/students/).
  useEffect(() => {
    if (!isRecruiter) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchCandidates = async () => {
      setIsLoading(true);
      setIsLoadingFull(false);
      const q = searchTerm.trim();
      try {
        if (q) {
          // 1. Immediately fetch top 30 candidates for instant rendering (<250ms)
          const top30 = await searchService.searchCandidates(q, 30);
          if (isMounted) {
            setStudents(top30);
            setIsLoading(false);
          }

          // 2. Concurrently fetch complete matching candidate pool in background
          setIsLoadingFull(true);
          searchService.searchCandidates(q, 0)
            .then((completeResults) => {
              if (isMounted && completeResults && completeResults.length > 0) {
                setStudents((prev) => {
                  const shortlistedMap = new Set(prev.filter((p) => p.shortlisted).map((p) => p.id));
                  return completeResults.map((c) => ({
                    ...c,
                    shortlisted: shortlistedMap.has(c.id) || c.shortlisted
                  }));
                });
              }
            })
            .catch((err) => console.warn('Background full search error', err))
            .finally(() => {
              if (isMounted) setIsLoadingFull(false);
            });
        } else {
          // Full candidate roster
          const response = await apiClient.get('/students/', { params: { limit: 500 } });
          if (Array.isArray(response.data) && isMounted) {
            const mapped = response.data.map((p) => {
              const allSkills = Object.keys(p.skills_matrix || {});
              const rawSkills = p.raw_extracted_skills?.length 
                ? p.raw_extracted_skills 
                : (allSkills.length ? allSkills : []);

              const displayName = p.username 
                ? p.username.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                : `Candidate #${p.id}`;

              return {
                id: String(p.id),
                name: displayName,
                username: p.username,
                avatar: (p.username || 'CA').substring(0, 2).toUpperCase(),
                avatarBg: p.is_verified ? 'bg-blue-600' : 'bg-slate-700',
                verified: !!p.is_verified,
                college: p.institution || 'Verified University',
                department: p.department || 'Engineering',
                degree: p.degree || '',
                skills: rawSkills,
                assessmentScore: Math.round(p.overall_confidence_score || 0),
                matchScore: Math.round(p.profile_strength_score || p.overall_confidence_score || 0),
                bio: p.bio || '',
                experience: p.experience_years || 0,
                github: p.github_handle || '',
                shortlisted: false,
              };
            });
            setStudents(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to load candidate profiles from backend', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCandidates();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [isRecruiter, searchTerm]);

  useEffect(() => {
    if (initialSelectedId && students.length > 0) {
      const found = students.find((s) => String(s.id) === String(initialSelectedId));
      if (found) {
        setSelectedStudent(found);
      }
    }
  }, [initialSelectedId, students]);

  useEffect(() => {
    if (!isRecruiter) return;
    apiClient.get('/listings/my-listings')
      .then((res) => setRecruiterListings(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecruiterListings([]));
  }, [isRecruiter]);

  const openNominate = (student) => {
    setNominateTarget(student);
    setNominateListingId('');
    setNominateNote('');
    setNominateMessage(null);
  };

  const submitNominate = async () => {
    if (!nominateListingId) {
      setNominateMessage({ type: 'error', text: 'Please select a job listing.' });
      return;
    }
    setIsNominating(true);
    setNominateMessage(null);
    try {
      await apiClient.post('/applications/nominate', {
        student_id: Number(nominateTarget.id),
        listing_id: Number(nominateListingId),
        note: nominateNote || 'Recruiter nominated',
      });
      setStudents((prev) =>
        prev.map((s) => s.id === nominateTarget.id ? { ...s, shortlisted: true } : s)
      );
      setNominateMessage({ type: 'success', text: `${nominateTarget.name} has been shortlisted and notified!` });
      setTimeout(() => setNominateTarget(null), 1800);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to shortlist. Please try again.';
      setNominateMessage({ type: 'error', text: msg });
    } finally {
      setIsNominating(false);
    }
  };

  const handleSortChange = (type) => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students;
    if (activeTab === 'shortlisted') {
      result = result.filter((student) => student.shortlisted);
    }

    return [...result].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === 'match') {
        valA = Number(a.matchScore) || 0;
        valB = Number(b.matchScore) || 0;
      } else if (sortBy === 'score') {
        valA = Number(a.assessmentScore) || 0;
        valB = Number(b.assessmentScore) || 0;
      }

      if (valA === valB) {
        const tieA = sortBy === 'match' ? (Number(a.assessmentScore) || 0) : (Number(a.matchScore) || 0);
        const tieB = sortBy === 'match' ? (Number(b.assessmentScore) || 0) : (Number(b.matchScore) || 0);
        return tieB - tieA;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [students, activeTab, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, sortBy, sortOrder]);

  const totalCandidates = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalCandidates / PAGE_SIZE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalCandidates);

  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    const target = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(target);
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // If a student or guest lands on /students, block candidate viewing and guide to jobs
  if (!isRecruiter) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center max-w-lg">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-blue-100">
            <Briefcase size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Explore Open Job Opportunities
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Candidate talent screening and directory access are strictly reserved for enterprise recruiters. As a candidate, you can browse verified job postings, internships, and skill challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onRouteChange('opportunities')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Browse Active Openings
            </button>
            <button
              onClick={() => onRouteChange('upload-skills')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              View My Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewingStudentId) {
    const viewingStudent = students.find((s) => s.id === viewingStudentId);
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <StudentPortfolio
            studentId={viewingStudentId}
            blind={false}
            onBack={() => setViewingStudentId(null)}
            onRouteChange={onRouteChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Enterprise Talent Pool</span>
              {searchTerm.trim() && (
                <span className="text-xs font-semibold px-2.5 py-0.5 text-blue-600 flex items-center gap-1">
                  <Sparkles size={12} />
             
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center flex-wrap gap-2">
              <span>
                {searchTerm.trim() 
                  ? `Showing ${totalCandidates} matching candidate${totalCandidates === 1 ? '' : 's'} for "${searchTerm.trim()}"`
                  : `Verified candidate directory (${totalCandidates} active profile${totalCandidates === 1 ? '' : 's'})`}
              </span>
              {isLoadingFull && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 animate-pulse border border-blue-100">
                  <Loader2 size={11} className="animate-spin text-blue-600" />
                  <span>Loading complete matching candidate pool...</span>
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input Filter */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by name, skill, or college..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56 sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort by Match and Score Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <span className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
                <ArrowUpDown size={12} />
                Sort:
              </span>
              <button
                onClick={() => handleSortChange('match')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  sortBy === 'match'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort by Match Score"
              >
                <span>Match</span>
                {sortBy === 'match' ? (
                  sortOrder === 'desc' ? <ArrowDown size={12} className="text-emerald-600" /> : <ArrowUp size={12} className="text-emerald-600" />
                ) : (
                  <ArrowUpDown size={11} className="text-slate-400 opacity-60" />
                )}
              </button>

              <button
                onClick={() => handleSortChange('score')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  sortBy === 'score'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort by Cognitive Assessment Score"
              >
                <span>Score</span>
                {sortBy === 'score' ? (
                  sortOrder === 'desc' ? <ArrowDown size={12} className="text-blue-600" /> : <ArrowUp size={12} className="text-blue-600" />
                ) : (
                  <ArrowUpDown size={11} className="text-slate-400 opacity-60" />
                )}
              </button>
            </div>

            {/* All Talent / Shortlisted Tab Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveTab('bestMatch')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'bestMatch'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Talent ({students.length})
                {isLoadingFull && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md ml-1 animate-pulse" title="Loading complete candidate pool in background">
                    <Loader2 size={10} className="animate-spin text-blue-500" />
                    <span>Syncing...</span>
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('shortlisted')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'shortlisted'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck size={13} /> Shortlisted ({students.filter((s) => s.shortlisted).length})
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm font-medium text-slate-600">Loading verified candidate pool from database...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-base font-semibold text-slate-700">No candidates match your current filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing the search box to view all registered profiles.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Container */}
            <div ref={tableTopRef} className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-4">Institution</th>
                  <th className="py-3.5 px-4">Skills Matrix</th>
                  <th 
                    onClick={() => handleSortChange('score')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none group"
                    title="Click to toggle sorting by Cognitive Assessment score"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Cognitive Assessment</span>
                      <span className={`transition-opacity ${sortBy === 'score' ? 'text-blue-600 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                        {sortBy === 'score' && sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      </span>
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSortChange('match')}
                    className="py-3.5 px-4 cursor-pointer hover:text-emerald-600 transition-colors select-none group"
                    title="Click to toggle sorting by Match / Profile Score"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Profile Score</span>
                      <span className={`transition-opacity ${sortBy === 'match' ? 'text-emerald-600 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                        {sortBy === 'match' && sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      </span>
                    </div>
                  </th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedStudents.map((student) => {
                  const isSkillsExpanded = Boolean(expandedSkillsIds[student.id]);
                  const displayedSkills = isSkillsExpanded ? student.skills : student.skills.slice(0, 3);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setViewingStudentId(student.id)}
                            className={`w-9 h-9 rounded-full ${student.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}
                            title="View Full Profile"
                          >
                            {student.avatar}
                          </button>
                          <div>
                            <button
                              onClick={() => setViewingStudentId(student.id)}
                              className="font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors text-left cursor-pointer"
                            >
                              {student.name}
                            </button>
                            <p className="text-xs font-medium mt-0.5 flex items-center gap-1">
                              {student.verified ? (
                                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                                  <Check size={12} className="stroke-3" /> Verified
                                </span>
                              ) : (
                                <span className="text-slate-400">Unverified</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800 text-xs sm:text-sm">{student.college}</p>
                        <p className="text-slate-400 text-xs">{student.department}</p>
                      </td>

                      <td className="py-4 px-4">
                        {student.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {displayedSkills.map((skill, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setExpandedSkillsIds((prev) => ({ ...prev, [student.id]: !isSkillsExpanded }))}
                                className="px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-transparent border border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-md cursor-pointer transition-colors"
                              >
                                {skill}
                              </button>
                            ))}
                            {student.skills.length > 3 && (
                              <button
                                type="button"
                                onClick={() => setExpandedSkillsIds((prev) => ({ ...prev, [student.id]: !isSkillsExpanded }))}
                                className="px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-transparent border border-blue-200 dark:border-blue-500/40 hover:border-blue-300 rounded-md cursor-pointer transition-colors"
                              >
                                {isSkillsExpanded ? 'Less' : `+${student.skills.length - 3}`}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No skills updated yet</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900">{student.assessmentScore}</span>
                        <span className="text-slate-400 text-xs font-semibold">/100</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {student.matchScore}% {searchTerm.trim() ? 'Match' : 'Strength'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => student.shortlisted ? null : openNominate(student)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              student.shortlisted
                                ? 'bg-emerald-600 text-white shadow-sm cursor-default'
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }`}
                          >
                            {student.shortlisted ? '✓ Shortlisted' : 'Shortlist'}
                          </button>
                          
                          <button
                            onClick={() => setViewingStudentId(student.id)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all cursor-pointer"
                          >
                            Full Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Max 50 candidates per page) */}
          {totalCandidates > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-800 tabular-nums">{startIndex + 1}</strong>–<strong className="text-slate-800 tabular-nums">{endIndex}</strong> of{' '}
                  <strong className="text-slate-800 tabular-nums">{totalCandidates}</strong> candidates
                  {isLoadingFull && (
                    <span className="text-blue-600 font-medium ml-1.5 inline-flex items-center gap-1 text-[11px]">
                      <Loader2 size={10} className="animate-spin" /> (loading full pool…)
                    </span>
                  )}
                </span>
                {totalPages > 1 && (
                  <span className="text-slate-400">· Page {validCurrentPage} of {totalPages}</span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(validCurrentPage - 1)}
                    disabled={validCurrentPage <= 1}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      validCurrentPage <= 1
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/40'
                        : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-2xs active:scale-95'
                    }`}
                  >
                    <ChevronLeft size={13} />
                    <span>Previous 50</span>
                  </button>

                  {/* Page chips */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) {
                          acc.push(-1);
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) => {
                        if (p === -1) {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400 select-none">
                              …
                            </span>
                          );
                        }
                        const isCurrent = p === validCurrentPage;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(validCurrentPage + 1)}
                    disabled={validCurrentPage >= totalPages}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      validCurrentPage >= totalPages
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/40'
                        : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-2xs active:scale-95'
                    }`}
                  >
                    <span>Next 50</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>

      {/* Candidate Details Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${selectedStudent.avatarBg} text-white font-bold text-base flex items-center justify-center shadow-sm`}>
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.college}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Cognitive Score</p>
                <p className="text-lg font-bold text-slate-800">{selectedStudent.assessmentScore}/100</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-medium">{searchTerm.trim() ? 'Relevance Match' : 'Profile Strength'}</p>
                <p className="text-lg font-bold text-emerald-600">{selectedStudent.matchScore}%</p>
              </div>
            </div>

            {selectedStudent.bio && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Candidate Bio</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedStudent.bio}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Skills Matrix</p>
              {selectedStudent.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills.map((skill, index) => (
                    <span key={index} className="px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 bg-transparent rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No skills verified on this candidate profile yet.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-md active:scale-95"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
      {nominateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Shortlist Candidate</h3>
                <p className="text-xs text-slate-500 mt-0.5">Nominating <span className="font-semibold text-slate-700">{nominateTarget.name}</span> to a role</p>
              </div>
              <button onClick={() => setNominateTarget(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Select Job Listing *</label>
                <select
                  value={nominateListingId}
                  onChange={(e) => setNominateListingId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200/80 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="">— Choose a listing —</option>
                  {recruiterListings.map((l) => (
                    <option key={l.id} value={l.id}>{l.title} ({l.role_type})</option>
                  ))}
                </select>
                {recruiterListings.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">No active listings found. Post a job first.</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Internal Note (optional)</label>
                <textarea
                  rows={2}
                  value={nominateNote}
                  onChange={(e) => setNominateNote(e.target.value)}
                  placeholder="e.g. Strong React background, priority candidate"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 bg-slate-50 text-slate-900 resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {nominateMessage && (
                <p className={`text-xs font-semibold px-3 py-2 rounded-xl ${
                  nominateMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                }`}>
                  {nominateMessage.text}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setNominateTarget(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitNominate}
                disabled={isNominating}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                {isNominating ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
                {isNominating ? 'Shortlisting…' : 'Confirm Shortlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;