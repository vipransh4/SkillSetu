import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowDown
} from 'lucide-react';
import apiClient from '../../api/client';
import authService from '../../api/auth';
import searchService from '../../api/search';

const Students = ({ onRouteChange, initialSearch = '', initialSelectedId = null }) => {
  const currentUser = authService.getUser();
  const isRecruiter = currentUser?.role === 'industry';

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState('bestMatch');
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'score'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

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
      const q = searchTerm.trim();
      try {
        if (q) {
          // Unified 3-signal vector & skill hybrid search engine (identical to Navbar search dropdown)
          const results = await searchService.searchCandidates(q, 30);
          if (isMounted) setStudents(results);
        } else {
          // Full candidate roster
          const response = await apiClient.get('/students/');
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

  const toggleShortlist = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, shortlisted: !student.shortlisted }
          : student
      )
    );
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
            <p className="text-sm text-slate-500 mt-0.5">
              {searchTerm.trim() 
                ? `Showing ${students.length} matching candidate${students.length === 1 ? '' : 's'} for "${searchTerm.trim()}"`
                : 'Live verified candidate profiles indexed from PostgreSQL database'}
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
          /* Table Container */
          <div className="overflow-x-auto">
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Candidate Identity */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${student.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                          {student.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{student.name}</p>
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

                    {/* College & Department */}
                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-800 text-xs sm:text-sm">{student.college}</p>
                      <p className="text-slate-400 text-xs">{student.department}</p>
                    </td>

                    {/* Skills */}
                    <td className="py-4 px-4">
                      {student.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-100 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold self-center">
                              +{student.skills.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No skills updated yet</span>
                      )}
                    </td>

                    {/* Cognitive Assessment */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900">{student.assessmentScore}</span>
                      <span className="text-slate-400 text-xs font-semibold">/100</span>
                    </td>

                    {/* Profile Score */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        student.matchScore > 0
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {student.matchScore}% {searchTerm.trim() ? 'Match' : 'Strength'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleShortlist(student.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            student.shortlisted
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          {student.shortlisted ? 'Shortlisted' : 'Shortlist'}
                        </button>
                        
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all cursor-pointer"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                    <span key={index} className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
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
    </div>
  );
};

export default Students;