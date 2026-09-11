import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  LogOut, 
  Users, 
  Briefcase, 
  GraduationCap, 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  IndianRupee, 
  ArrowRight,
  ShieldCheck,
  User,
  Settings,
  ChevronDown
} from "lucide-react";
import Logo from "../../../public/hero.png";
import authService from "../../api/auth";
import searchService from "../../api/search";

const Navbar = ({ onRouteChange, user, onLogout, onSearchSelect, onSearchSubmit }) => {
  // Always resolve active user from prop or cached session
  const currentUser = user || authService.getUser();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({ jobs: [], candidates: [], faculty: [] });
  const [activeCategory, setActiveCategory] = useState("primary"); // 'primary' or specific category
  
  // Profile menu state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close dropdown on click outside or escape key
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


  // Debounced search when query changes
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

  // Determine dynamic upload/action option based on role
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

  // Determine dynamic navigation links according to role
  const getNavLinks = () => {
    const links = [{ label: "Home", route: "home" }];
    if (currentUser?.role === "industry") {
      links.push({ label: "Candidates", route: "students" });
      links.push({ label: "Opportunities", route: "opportunities" });
    } else if (currentUser?.role === "academician") {
      links.push({ label: "Lectures", route: "upload-lectures" });
      links.push({ label: "Opportunities", route: "opportunities" });
    } else {
      // student / guest
      links.push({ label: "Opportunities", route: "opportunities" });
      if (currentUser?.role === "student") {
        links.push({ label: "My Portfolio", route: "upload-skills" });
      } else {
        links.push({ label: "Learning", route: "learning" });
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

  // Role metadata for search
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

  // Search submission (Enter key or button)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsDropdownOpen(false);

    if (onSearchSubmit) {
      onSearchSubmit({ query: q, role: currentUser?.role || "student" });
    } else {
      // Direct navigation fallback
      if (currentUser?.role === "industry") {
        onRouteChange("students");
      } else {
        onRouteChange("opportunities");
      }
    }
  };

  // Result card click
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

  // Strictly gate visible results by active user role
  const visibleCandidates = currentUser?.role === "industry" ? searchResults.candidates : [];
  const visibleJobs = searchResults.jobs;
  const visibleFaculty = (currentUser?.role === "academician" || !currentUser) ? searchResults.faculty : [];
  const totalResultsCount = visibleCandidates.length + visibleJobs.length + visibleFaculty.length;

  return (
    <>
      {/* Full-screen web background dim overlay when search results are open */}
      {isDropdownOpen && searchQuery.trim() && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity duration-150 animate-in fade-in cursor-pointer"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsExpanded(false);
          }}
          aria-hidden="true"
        />
      )}

      <nav className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 px-2 pointer-events-none">
        <div className="w-full max-w-[96%] flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] px-6 py-2.5 border border-slate-200/80 pointer-events-auto">
          
          {/* Brand / Logo */}
          <div 
            className="flex items-center gap-2 shrink-0 cursor-pointer group" 
            onClick={() => onRouteChange("home")}
          >
            <img src={Logo} alt="Skill Setu Logo" className="h-8 w-8 object-contain transition-transform group-hover:scale-105" />
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              Skill Setu
            </span>
          </div>

          {/* Global Role-Aware Search Bar with Fast Fluid Expansion Animation */}
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

            {/* Interactive Search Dropdown Popover with Matching Navbar Glass Background */}
            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2.5 bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200/80 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 ease-out origin-top max-h-[75vh] flex flex-col pointer-events-auto">
                
                {/* Dropdown Header */}
                <div className="p-3 bg-white/70 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-500" />
                    <span>
                      {totalResultsCount > 0 
                        ? `Found ${totalResultsCount} result${totalResultsCount > 1 ? 's' : ''}`
                        : 'Searching catalog & vectors...'}
                    </span>
                  </span>

                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600">Enter</kbd> to view all
                </span>
              </div>

              {/* Results List */}
              <div className="overflow-y-auto divide-y divide-slate-50 p-1.5">
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
                    {/* CANDIDATES RESULTS (Strictly limited to authenticated Recruiters) */}
                    {currentUser?.role === "industry" && visibleCandidates.length > 0 && (
                      <div className="py-2">
                        <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-emerald-700">
                            <Users size={13} />
                            Candidate Talent Profiles
                          </span>
                          <span className="text-slate-400">{visibleCandidates.length} matched</span>
                        </div>
                        {visibleCandidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            onClick={() => handleSelectCandidate(candidate)}
                            className="p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group hover:translate-x-1"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-full ${candidate.avatarBg || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                                {candidate.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                    {candidate.name}
                                  </p>
                                  {candidate.verified && (
                                    <span title="Verified Skill Badge" className="text-blue-500">
                                      <ShieldCheck size={14} className="fill-blue-100 text-blue-600" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 truncate">
                                  {candidate.role || candidate.college} · {candidate.college}
                                </p>
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {candidate.skills && candidate.skills.length > 0 ? (
                                    candidate.skills.slice(0, 3).map((s, idx) => (
                                      <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                        {s}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">
                                      No skills listed yet
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                candidate.matchScore > 0
                                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                  : 'text-slate-400 bg-slate-100 border-slate-200'
                              }`}>
                                {candidate.matchScore}% Match
                              </span>
                              <p className="text-[11px] text-slate-400 font-medium mt-1">
                                Score: {candidate.assessmentScore}/100
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* OPPORTUNITIES RESULTS (Shown to Candidates, Students & All Users) */}
                    {visibleJobs.length > 0 && (
                      <div className="py-2">
                        <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-blue-700">
                            <Briefcase size={13} />
                            Jobs & Internships
                          </span>
                          <span className="text-slate-400">{visibleJobs.length} matched</span>
                        </div>
                        {visibleJobs.map((job) => (
                          <div
                            key={job.id}
                            onClick={() => handleSelectJob(job)}
                            className="p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                                {job.logo || job.company?.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {job.title}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {job.company} · {job.type} · {job.location}
                                </p>
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {job.skills?.slice(0, 3).map((s, idx) => (
                                    <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                {job.matchScore || 90}% Match
                              </span>
                              <p className="text-[11px] font-bold text-slate-700 mt-1">
                                {job.stipend}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FACULTY / ACADEMIA RESULTS */}
                    {visibleFaculty.length > 0 && (
                      <div className="py-2">
                        <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-purple-700">
                            <GraduationCap size={13} />
                            Faculty Internships & Research Projects
                          </span>
                          <span className="text-slate-400">{visibleFaculty.length} matched</span>
                        </div>
                        {visibleFaculty.map((fac) => (
                          <div
                            key={fac.id}
                            onClick={() => handleSelectFaculty(fac)}
                            className="p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center border border-purple-100 shrink-0">
                                FDP
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                                  {fac.title}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {fac.company} · {fac.type} · {fac.location}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                {fac.stipend}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* View All Bar */}
              {totalResultsCount > 0 && (
                <div 
                  onClick={handleSearchSubmit}
                  className="p-2.5 bg-white/70 backdrop-blur-md hover:bg-blue-50/80 border-t border-slate-200/60 text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600"
                >
                  <span>
                    {currentUser?.role === "industry" 
                      ? `View all candidate results in Candidates Directory` 
                      : `View all matching results in Opportunities`}
                  </span>
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links & User Controls */}
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

          {/* IF USER IS LOGGED IN: Show Dynamic Action Button + Circular Profile Avatar with Dropdown */}
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

              {/* Circular Profile Avatar with Popover Menu */}
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
                  {/* Online status indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </button>

                {/* Profile Popover Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                    {/* User Header */}
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

                    {/* Navigation Options */}
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

                    {/* Divider & Sign Out */}
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
            /* IF LOGGED OUT: Show Sign In button */
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