import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, 
  LogOut, 
  Users, 
  Briefcase, 
  GraduationCap, 
  X, 
  Sparkles, 
  Loader2, 
  ShieldCheck,
  User,
  Settings,
  ArrowRight,
  BrainCircuit,
  BookOpen
} from "lucide-react";
import Logo from "../../../public/hero.png";
import authService from "../../api/auth";
import searchService from "../../api/search";

const getCompanyInitials = (name = '') => {
  if (!name) return 'SS';
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

const Navbar = ({ onRouteChange, user, onLogout, onSearchSelect, onSearchSubmit }) => {
  const currentUser = user || authService.getUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({ jobs: [], candidates: [], faculty: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setIsExpanded(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsExpanded(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getInitials = (u) => {
    if (!u) return "U";
    if (u.first_name) {
      const f = u.first_name[0] || "";
      const l = u.last_name ? u.last_name[0] : "";
      return (f + l).toUpperCase() || u.username?.[0]?.toUpperCase() || "U";
    }
    return (u.username?.[0] || "U").toUpperCase();
  };

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults({ jobs: [], candidates: [], faculty: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsDropdownOpen(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchService.searchByRole(trimmed, currentUser?.role || 'student');
        setSearchResults(results);
      } catch {
        setSearchResults({ jobs: [], candidates: [], faculty: [] });
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser?.role]);

  const visibleCandidates = currentUser?.role === "industry" ? searchResults.candidates : [];
  const visibleJobs = searchResults.jobs;
  const visibleFaculty = (currentUser?.role === "academician" || !currentUser) ? searchResults.faculty : [];
  const totalResultsCount = visibleCandidates.length + visibleJobs.length + visibleFaculty.length;

  const allVisibleItems = useMemo(() => {
    const items = [];
    visibleCandidates.forEach((c) => items.push({ type: "candidate", data: c }));
    visibleJobs.forEach((j) => items.push({ type: "job", data: j }));
    visibleFaculty.forEach((f) => items.push({ type: "faculty", data: f }));
    return items;
  }, [visibleCandidates, visibleJobs, visibleFaculty]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, searchResults]);

  const getUploadOption = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case "student":
        return { label: "Upload Skills", route: "upload-skills" };
      case "academician":
        return { label: "Upload Lectures", route: "upload-lectures" };
      case "industry":
        return { label: "Post Jobs", route: "post-jobs" };
      default:
        return null;
    }
  };

  const uploadOption = getUploadOption();

  const getNavLinks = () => {
    const links = [{ label: "Home", route: "home" }];
    if (currentUser?.role === "industry") {
      links.push({ label: "Candidates", route: "students" });
      links.push({ label: "Opportunities", route: "opportunities" });
    } else if (currentUser?.role === "academician") {
      links.push({ label: "Lectures", route: "upload-lectures" });
      links.push({ label: "Opportunities", route: "opportunities" });
      links.push({ label: "Learning", route: "learning" });
    } else {
      links.push({ label: "Opportunities", route: "opportunities" });
      links.push({ label: "Learning", route: "learning" });
      if (currentUser?.role === "student") {
        links.push({ label: "My Skills", route: "my-skills" });
        links.push({ label: "My Portfolio", route: "upload-skills" });
      } else {
        links.push({ label: "Assessment", route: "assessment" });
      }
    }
    return links;
  };

  const navLinks = getNavLinks();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      authService.logout();
      if (onRouteChange) onRouteChange("home");
    }
  };

  const getRoleSearchMeta = () => {
    const role = currentUser?.role || "guest";
    switch (role) {
      case "industry":
        return {
          icon: <Users size={14} className="text-emerald-600" />,
          placeholder: "Search candidates by skill, college, name, or role...",
          target: "candidates",
        };
      case "academician":
        return {
          icon: <GraduationCap size={14} className="text-purple-600" />,
          placeholder: "Search faculty opportunities, research projects, FDPs...",
          target: "faculty",
        };
      case "student":
      default:
        return {
          icon: <Briefcase size={14} className="text-blue-600" />,
          placeholder: "Search jobs, internships, companies, or skills...",
          target: "jobs",
        };
    }
  };

  const searchMeta = getRoleSearchMeta();

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsDropdownOpen(false);

    if (onSearchSubmit) {
      onSearchSubmit({ query: q, role: currentUser?.role || "student" });
    } else {
      if (currentUser?.role === "industry") {
        onRouteChange("students");
      } else {
        onRouteChange("opportunities");
      }
    }
  };

  const handleSelectJob = (job) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    if (onSearchSelect) {
      onSearchSelect({ type: "job", item: job });
    } else {
      onRouteChange("opportunities");
    }
  };

  const handleSelectCandidate = (candidate) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    if (onSearchSelect) {
      onSearchSelect({ type: "candidate", item: candidate });
    } else {
      onRouteChange("students");
    }
  };

  const handleSelectFaculty = (facultyItem) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    if (onSearchSelect) {
      onSearchSelect({ type: "faculty", item: facultyItem });
    } else {
      onRouteChange("opportunities");
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (allVisibleItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % allVisibleItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (allVisibleItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + allVisibleItems.length) % allVisibleItems.length);
      }
    } else if (e.key === "Enter") {
      if (isDropdownOpen && allVisibleItems.length > 0 && selectedIndex >= 0 && selectedIndex < allVisibleItems.length) {
        e.preventDefault();
        const selected = allVisibleItems[selectedIndex];
        if (selected.type === "job") handleSelectJob(selected.data);
        else if (selected.type === "candidate") handleSelectCandidate(selected.data);
        else if (selected.type === "faculty") handleSelectFaculty(selected.data);
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setIsExpanded(false);
    }
  };

  return (
    <>
      {isDropdownOpen && searchQuery.trim() && (
        <div 
          className="fixed inset-0 bg-slate-900/15 backdrop-blur-xs z-40 transition-opacity duration-150 animate-in fade-in cursor-pointer"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsExpanded(false);
          }}
          aria-hidden="true"
        />
      )}

      <nav className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 px-2 pointer-events-none">
        <div className="w-full max-w-[96%] flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] px-6 py-2.5 border border-slate-200/80 pointer-events-auto">
          
          <div 
            className="flex items-center gap-2 shrink-0 cursor-pointer group" 
            onClick={() => onRouteChange("home")}
          >
            <img src={Logo} alt="Skill Setu Logo" className="h-8 w-8 object-contain transition-transform group-hover:scale-105" />
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              Skill Setu
            </span>
          </div>

          <div 
            className={`relative transition-all duration-200 ease-out z-30 ${
              isExpanded || isDropdownOpen 
                ? 'flex-1 max-w-2xl sm:max-w-3xl scale-[1.01]' 
                : 'flex-1 max-w-md sm:max-w-lg'
            } mx-2 sm:mx-4`} 
            ref={searchContainerRef}
          >
            <form 
              onSubmit={handleSearchSubmit}
              className={`flex items-center gap-2.5 rounded-full px-4 py-2 border transition-all duration-150 ${
                isExpanded || isDropdownOpen
                  ? 'bg-white/95 border-blue-500 ring-4 ring-blue-500/15 shadow-[0_12px_36px_rgba(37,99,235,0.14)]'
                  : 'bg-slate-100/90 hover:bg-slate-100 border-slate-200/60 shadow-inner'
              }`}
            >
              <Search 
                size={18} 
                className={`shrink-0 transition-all duration-150 ${
                  isExpanded || isDropdownOpen ? 'text-blue-600 scale-110' : 'text-slate-400'
                }`} 
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onFocus={() => {
                  setIsExpanded(true);
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                placeholder={searchMeta.placeholder}
                className="bg-transparent outline-none w-full text-xs sm:text-sm placeholder-slate-400 text-slate-700"
              />

              {isLoading && (
                <Loader2 size={16} className="text-blue-500 animate-spin shrink-0" />
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsDropdownOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 ease-out origin-top max-h-[75vh] flex flex-col pointer-events-auto">
                <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-600" />
                    <span>
                      {totalResultsCount > 0 
                        ? `${totalResultsCount} result${totalResultsCount > 1 ? 's' : ''} found`
                        : 'Searching catalog & vectors...'}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-xs">↵</kbd> to select
                  </span>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 p-1.5">
                  {isLoading && totalResultsCount === 0 ? (
                    <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-500" />
                      <p className="text-xs font-medium">Scanning verified database & 3-signal vector index...</p>
                    </div>
                  ) : totalResultsCount === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm font-semibold text-slate-700">No direct matches found for "{searchQuery}"</p>
                      <p className="text-xs text-slate-400 mt-1 mb-3">
                        Try clicking one of these popular keywords:
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {['React', 'Python', 'Google', 'Distributed Systems', 'Remote', 'SQL', 'CAD'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentUser?.role === "industry" && visibleCandidates.length > 0 && (
                        <div className="py-1">
                          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-emerald-700">
                              <Users size={13} />
                              Candidate Talent Profiles
                            </span>
                            <span className="text-slate-400 text-[10px]">{visibleCandidates.length} matched</span>
                          </div>
                          {visibleCandidates.map((candidate, idx) => {
                            const isSelected = selectedIndex === idx;
                            return (
                              <div
                                key={candidate.id}
                                onClick={() => handleSelectCandidate(candidate)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                                  isSelected ? 'bg-slate-50 ring-1 ring-slate-200/80' : 'hover:bg-slate-50/60'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                    {candidate.avatar || getInitials(candidate)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                        {candidate.name}
                                      </p>
                                      {candidate.verified && (
                                        <ShieldCheck size={13} className="text-blue-600 shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                      {candidate.role || candidate.college} · {candidate.college}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      {candidate.skills && candidate.skills.length > 0 ? (
                                        candidate.skills.slice(0, 3).map((s, sIdx) => (
                                          <span key={sIdx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                            {s}
                                          </span>
                                        ))
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                    candidate.matchScore > 0
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                                      : 'text-slate-500 bg-slate-100 border-slate-200/60'
                                  }`}>
                                    {candidate.matchScore}% Match
                                  </span>
                                  <p className="text-[11px] text-slate-400 font-medium mt-1 tabular-nums">
                                    Score: {candidate.assessmentScore}/100
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {visibleJobs.length > 0 && (
                        <div className="py-1">
                          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-blue-700">
                              <Briefcase size={13} />
                              Jobs & Internships
                            </span>
                            <span className="text-slate-400 text-[10px]">{visibleJobs.length} matched</span>
                          </div>
                          {visibleJobs.map((job, idx) => {
                            const itemIndex = visibleCandidates.length + idx;
                            const isSelected = selectedIndex === itemIndex;
                            return (
                              <div
                                key={job.id}
                                onClick={() => handleSelectJob(job)}
                                onMouseEnter={() => setSelectedIndex(itemIndex)}
                                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                                  isSelected ? 'bg-slate-50 ring-1 ring-slate-200/80' : 'hover:bg-slate-50/60'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-9 h-9 rounded-lg ${getCompanyAvatarColor(job.company)} font-bold text-xs flex items-center justify-center shrink-0 shadow-xs select-none`}>
                                    {job.logo || getCompanyInitials(job.company)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                      {job.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                      {job.company} · {job.type} · {job.location}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      {job.skills?.slice(0, 3).map((s, sIdx) => (
                                        <span key={sIdx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                                    {job.matchScore || 90}% Match
                                  </span>
                                  <p className="text-[11px] font-medium text-slate-700 mt-1 tabular-nums">
                                    {job.stipend}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {visibleFaculty.length > 0 && (
                        <div className="py-1">
                          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-purple-700">
                              <GraduationCap size={13} />
                              Faculty Programs & Research
                            </span>
                            <span className="text-slate-400 text-[10px]">{visibleFaculty.length} matched</span>
                          </div>
                          {visibleFaculty.map((fac, idx) => {
                            const itemIndex = visibleCandidates.length + visibleJobs.length + idx;
                            const isSelected = selectedIndex === itemIndex;
                            return (
                              <div
                                key={fac.id}
                                onClick={() => handleSelectFaculty(fac)}
                                onMouseEnter={() => setSelectedIndex(itemIndex)}
                                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                                  isSelected ? 'bg-slate-50 ring-1 ring-slate-200/80' : 'hover:bg-slate-50/60'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200/60 text-purple-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                    FDP
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                                      {fac.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                      {fac.company} · {fac.type} · {fac.location}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full">
                                    {fac.stipend}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="px-3.5 py-2 bg-slate-50/80 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <button 
                    type="button"
                    onClick={handleSearchSubmit}
                    className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>
                      {currentUser?.role === "industry" 
                        ? `View all candidate results` 
                        : `View all results for "${searchQuery}"`}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                  <div className="hidden sm:flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-xs">↑↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-xs">↵</kbd> select</span>
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-xs">esc</kbd> close</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-5 shrink-0">
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="text-sm font-medium text-slate-700 hover:text-black transition-colors cursor-pointer"
                onClick={() => onRouteChange(link.route)}
              >
                {link.label}
              </button>
            ))}

            {currentUser ? (
              <div className="flex items-center gap-3">
                {uploadOption && (
                  <button
                    onClick={() => onRouteChange(uploadOption.route)}
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {uploadOption.label}
                  </button>
                )}

                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      isProfileOpen ? "ring-2 ring-blue-600 shadow-md scale-105" : "hover:ring-2 hover:ring-slate-300 shadow-sm"
                    }`}
                    aria-label="User Profile Menu"
                    title="User Profile Menu"
                  >
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center tracking-tight shadow-inner">
                        {getInitials(currentUser)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2.5 w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden ring-2 ring-slate-100 flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base shadow-sm">
                          {currentUser.avatar_url ? (
                            <img
                              src={currentUser.avatar_url}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(currentUser)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {currentUser.first_name
                              ? `${currentUser.first_name} ${currentUser.last_name || ""}`.trim()
                              : currentUser.username}
                          </p>
                          <p className="text-xs text-slate-500 truncate">@{currentUser.username}</p>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {currentUser.role === "student" ? "Candidate" : currentUser.role}
                            </span>
                            {currentUser.is_email_verified && (
                              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                                <ShieldCheck size={11} /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 space-y-0.5 text-sm">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            onRouteChange("profile");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer"
                        >
                          <User size={16} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">My Profile</p>
                            <p className="text-[11px] text-slate-400">View & edit profile, skills, academics</p>
                          </div>
                        </button>

                        {currentUser.role === "student" && (
                          <>
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("my-skills");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer"
                            >
                              <BrainCircuit size={16} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800">My Skills</p>
                                <p className="text-[11px] text-slate-400">Skill matrix, extraction & testing</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("upload-skills");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer"
                            >
                              <Sparkles size={16} className="text-slate-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800">Digital Portfolio</p>
                                <p className="text-[11px] text-slate-400">Projects, credentials & test ratings</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("learning");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer"
                            >
                              <BookOpen size={16} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800">Learning Tracks</p>
                                <p className="text-[11px] text-slate-400">Courses, faculty lectures & roadmaps</p>
                              </div>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            onRouteChange("settings");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer"
                        >
                          <Settings size={16} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">Settings</p>
                            <p className="text-[11px] text-slate-400">Notifications, discovery & privacy</p>
                          </div>
                        </button>
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-100 p-1.5">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogoutClick();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left cursor-pointer text-xs"
                        >
                          <LogOut size={16} className="shrink-0" />
                          <span className="font-bold">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                onClick={() => onRouteChange("signin")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;