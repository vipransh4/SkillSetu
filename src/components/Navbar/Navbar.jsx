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
  ShieldCheck
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
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({ jobs: [], candidates: [], faculty: [] });
  const [activeCategory, setActiveCategory] = useState("primary"); // 'primary' or specific category
  
  const searchContainerRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
          badge: "Talent Search",
          icon: <Users size={14} className="text-emerald-600" />,
          bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          placeholder: "Search candidate talent (e.g. React, NIT, Python, 90%+ score)...",
          target: "candidates",
        };
      case "academician":
        return {
          badge: "Academia Search",
          icon: <GraduationCap size={14} className="text-purple-600" />,
          bgColor: "bg-purple-50 text-purple-700 border-purple-200",
          placeholder: "Search faculty FDPs, research projects & universities...",
          target: "faculty",
        };
      case "student":
      default:
        return {
          badge: "Job Search",
          icon: <Briefcase size={14} className="text-blue-600" />,
          bgColor: "bg-blue-50 text-blue-700 border-blue-200",
          placeholder: "Search jobs, internships & skills (e.g. React, Remote, FullStack)...",
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

  const totalResultsCount = 
    searchResults.candidates.length + 
    searchResults.jobs.length + 
    searchResults.faculty.length;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 px-2">
      <div className="w-full max-w-[96%] flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] px-6 py-2.5 border border-slate-200/80">
        
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

        {/* Global Role-Aware Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4 relative" ref={searchContainerRef}>
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 rounded-full px-3 sm:px-4 py-2 border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-inner"
          >
            <Search size={17} className="text-slate-400 shrink-0" />
            
            {/* Role indicator badge inside search */}
            <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${searchMeta.bgColor}`}>
              {searchMeta.icon}
              <span>{searchMeta.badge}</span>
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsDropdownOpen(true)}
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

          {/* Interactive Search Dropdown Popover */}
          {isDropdownOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] flex flex-col">
              
              {/* Dropdown Header & Category Tabs */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-500" />
                  <span>
                    {totalResultsCount > 0 
                      ? `Found ${totalResultsCount} result${totalResultsCount > 1 ? 's' : ''}`
                      : 'Searching...'}
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
                    <p className="text-xs font-medium">Scanning verified database...</p>
                  </div>
                ) : totalResultsCount === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">No matching results found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {currentUser?.role === "industry"
                        ? "Try searching candidate skills like React, Python, or college like NIT, IIT."
                        : "Try searching job titles like Frontend, FullStack, or skills like React, SQL."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* CANDIDATES RESULTS (Priority for Industry/Recruiter) */}
                    {searchResults.candidates.length > 0 && (
                      <div className="py-2">
                        <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-emerald-700">
                            <Users size={13} />
                            Candidate Talent Profiles
                          </span>
                          <span className="text-slate-400">{searchResults.candidates.length} matched</span>
                        </div>
                        {searchResults.candidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            onClick={() => handleSelectCandidate(candidate)}
                            className="p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
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
                                  {candidate.skills?.slice(0, 3).map((s, idx) => (
                                    <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
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

                    {/* OPPORTUNITIES RESULTS (Priority for Students / Candidates) */}
                    {searchResults.jobs.length > 0 && (
                      <div className="py-2">
                        <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-blue-700">
                            <Briefcase size={13} />
                            Jobs & Internships
                          </span>
                          <span className="text-slate-400">{searchResults.jobs.length} matched</span>
                        </div>
                        {searchResults.jobs.map((job) => (
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
                    {searchResults.faculty.length > 0 && (
                      <div className="py-2">
                        <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-purple-700">
                            <GraduationCap size={13} />
                            Faculty Internships & Research Projects
                          </span>
                          <span className="text-slate-400">{searchResults.faculty.length} matched</span>
                        </div>
                        {searchResults.faculty.map((fac) => (
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
                  className="p-2.5 bg-slate-50 hover:bg-blue-50 border-t border-slate-100 text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600"
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

          {/* IF USER IS LOGGED IN: Show Dynamic Action Button + User Role Pill + Logout */}
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

              {/* Profile identity pill */}
              <div className="hidden xl:flex items-center gap-2 pl-2 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[110px] text-slate-700 font-semibold">
                  {currentUser.first_name || currentUser.username || "User"}
                </span>
                <span className="capitalize px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={handleLogoutClick}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </button>
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
  );
};

export default Navbar;