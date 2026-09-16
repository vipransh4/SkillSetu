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
  BookOpen,
  Bell,
  CheckCheck,
  FileCheck,
  Calendar,
  Clock,
  Award,
  Building2,
  Video,
  ChevronRight,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Layers,
  Filter,
  Compass,
  Mail
} from "lucide-react";
import Logo from "../../../public/hero.png";
import authService from "../../api/auth";
import searchService from "../../api/search";
import apiClient from "../../api/client";
import AppleMegaNav from "./AppleMegaNav";

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

const Navbar = ({ onRouteChange, user, onLogout, onSearchSelect, onSearchSubmit, currentRoute }) => {
  const currentUser = user || authService.getUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({ jobs: [], candidates: [], faculty: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [arrowNavActive, setArrowNavActive] = useState(false);
  const [searchCategoryFilter, setSearchCategoryFilter] = useState("all");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [isMegaNavOpen, setIsMegaNavOpen] = useState(false);
  const enterTimerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setIsExpanded(false);
        setIsFocused(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsFocused(true);
        setIsExpanded(true);
        if (searchQuery.trim()) setIsDropdownOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsExpanded(false);
        setIsFocused(false);
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const getMegaMenuKey = (link) => {
    const route = (link?.route || "").toLowerCase();
    const label = (link?.label || "").toLowerCase();
    if (route === "opportunities" || label.includes("opportunities")) return "opportunities";
    if (route === "learning" || route === "my-skills" || label.includes("learning") || label.includes("skills")) return "learning";
    if (route === "applications" || label.includes("applications")) return "applications";
    if (route === "students" || label.includes("candidates") || label.includes("students")) return "students";
    if (route === "upload-skills" || route === "portfolio" || label.includes("portfolio")) return "portfolio";
    return null;
  };

  const handleNavLinkMouseEnter = (link) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    const menuKey = getMegaMenuKey(link);
    if (!menuKey) {
      if (isMegaNavOpen) {
        leaveTimerRef.current = setTimeout(() => {
          setIsMegaNavOpen(false);
          setActiveMegaMenu(null);
        }, 80);
      }
      return;
    }
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
    }
    if (isMegaNavOpen) {
      setActiveMegaMenu(menuKey);
    } else {
      enterTimerRef.current = setTimeout(() => {
        setActiveMegaMenu(menuKey);
        setIsMegaNavOpen(true);
      }, 70);
    }
  };

  const handleNavLinkMouseLeave = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsMegaNavOpen(false);
      setActiveMegaMenu(null);
    }, 90);
  };

  const handleMegaNavMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleMegaNavMouseLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsMegaNavOpen(false);
      setActiveMegaMenu(null);
    }, 90);
  };

  const handleMegaNavClose = () => {
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setIsMegaNavOpen(false);
    setActiveMegaMenu(null);
  };

  const handleMegaNavigate = (route, queryParam) => {
    handleMegaNavClose();
    if (onRouteChange) {
      onRouteChange(route, queryParam);
    }
  };

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
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let isMounted = true;
    const fetchNotifications = async () => {
      const emailNotice = (currentUser && !currentUser.is_email_verified && currentUser.email) ? {
        id: "verify-email-notice",
        title: "Verify your email address",
        message: `Please verify your email (${currentUser.email}) to complete profile verification.`,
        notification_type: "VERIFY_EMAIL",
        is_read: false,
        created_at: new Date().toISOString(),
      } : null;

      try {
        const res = await apiClient.get("/students/notifications");
        if (isMounted && res.data) {
          let list = res.data.notifications || [];
          let unread = res.data.unread_count || 0;
          if (emailNotice) {
            list = [emailNotice, ...list.filter((n) => n.id !== "verify-email-notice")];
            unread += 1;
          }
          setNotifications(list);
          setUnreadCount(unread);
        }
      } catch {
        if (isMounted) {
          const list = emailNotice ? [emailNotice] : [];
          setNotifications(list);
          setUnreadCount(emailNotice ? 1 : 0);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser?.username, currentUser?.role, currentUser?.is_email_verified, currentUser?.email]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case "VERIFY_EMAIL":
        return {
          bg: "bg-amber-50 text-amber-600 border border-amber-100/80",
          icon: <Mail size={16} />,
          label: "Verify Email",
        };
      case "STATUS_CHANGE":
        return {
          bg: "bg-emerald-50 text-emerald-600 border border-emerald-100/80",
          icon: <Sparkles size={16} />,
          label: "Application Status",
        };
      case "INTERVIEW_SCHEDULED":
        return {
          bg: "bg-amber-50 text-amber-600 border border-amber-100/80",
          icon: <Calendar size={16} />,
          label: "Interview",
        };
      case "APPLICATION_REVIEW":
        return {
          bg: "bg-indigo-50 text-indigo-600 border border-indigo-100/80",
          icon: <FileCheck size={16} />,
          label: "Review Update",
        };
      case "NEW_OPPORTUNITY":
        return {
          bg: "bg-blue-50 text-blue-600 border border-blue-100/80",
          icon: <Briefcase size={16} />,
          label: "New Opening",
        };
      case "DEADLINE_APPROACHING":
        return {
          bg: "bg-rose-50 text-rose-600 border border-rose-100/80",
          icon: <Clock size={16} />,
          label: "Approaching Deadline",
        };
      case "NEW_SCHEME":
        return {
          bg: "bg-purple-50 text-purple-600 border border-purple-100/80",
          icon: <Award size={16} />,
          label: "DEI Scheme",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-600 border border-slate-200/80",
          icon: <Bell size={16} />,
          label: "Notice",
        };
    }
  };

  const filteredNotifications = useMemo(() => {
    if (notifFilter === "unread") {
      return notifications.filter((n) => !n.is_read);
    }
    if (notifFilter === "applications") {
      return notifications.filter(
        (n) =>
          n.related_application_id ||
          n.notification_type === "STATUS_CHANGE" ||
          n.notification_type === "INTERVIEW_SCHEDULED" ||
          n.notification_type === "APPLICATION_REVIEW"
      );
    }
    if (notifFilter === "opportunities") {
      return notifications.filter(
        (n) =>
          n.related_listing_id ||
          n.notification_type === "NEW_OPPORTUNITY" ||
          n.notification_type === "DEADLINE_APPROACHING" ||
          n.notification_type === "NEW_SCHEME"
      );
    }
    return notifications;
  }, [notifications, notifFilter]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (notif.id !== "verify-email-notice") {
        try {
          await apiClient.post(`/students/notifications/${notif.id}/read`);
        } catch {}
      }
    }
    setIsNotifOpen(false);

    if (notif.id === "verify-email-notice" || notif.notification_type === "VERIFY_EMAIL") {
      onRouteChange("verify-email");
    } else if (notif.notification_type === "NEW_SCHEME") {
      onRouteChange("settings");
    } else if (
      notif.related_application_id ||
      notif.notification_type === "STATUS_CHANGE" ||
      notif.notification_type === "INTERVIEW_SCHEDULED" ||
      notif.notification_type === "APPLICATION_REVIEW"
    ) {
      onRouteChange("applications");
    } else if (notif.related_listing_id) {
      onRouteChange("opportunities", { tab: "explore", selectedId: notif.related_listing_id });
    } else {
      onRouteChange("opportunities");
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await apiClient.post("/students/notifications/read-all");
    } catch {}
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
    if (searchCategoryFilter === "all" || searchCategoryFilter === "candidates") {
      visibleCandidates.forEach((c) => items.push({ type: "candidate", data: c }));
    }
    if (searchCategoryFilter === "all" || searchCategoryFilter === "jobs") {
      visibleJobs.forEach((j) => items.push({ type: "job", data: j }));
    }
    if (searchCategoryFilter === "all" || searchCategoryFilter === "faculty") {
      visibleFaculty.forEach((f) => items.push({ type: "faculty", data: f }));
    }
    return items;
  }, [visibleCandidates, visibleJobs, visibleFaculty, searchCategoryFilter]);

  useEffect(() => {
    setSelectedIndex(-1);
    setArrowNavActive(false);
  }, [searchQuery, searchResults, searchCategoryFilter]);

  const getUploadOption = () => {
    if (!currentUser) return null;
    const role = (currentUser.role || '').toLowerCase();
    if (role === 'student' || role === 'candidate') {
      return { label: "Upload Skills", route: "upload-skills" };
    }
    if (role === 'academician' || role === 'academia' || role === 'faculty') {
      return { label: "Upload Resources", route: "upload-lectures" };
    }
    if (role === 'industry' || role === 'recruiter' || role === 'company') {
      return { label: "Post Jobs", route: "post-jobs" };
    }
    return null;
  };

  const uploadOption = getUploadOption();

  const getNavLinks = () => {
    const links = [{ label: "Home", route: "home" }];
    if (currentUser?.role === "industry") {
      links.push({ label: "Candidates", route: "students" });
      links.push({ label: "Applications", route: "applications" });
      links.push({ label: "Opportunities", route: "opportunities" });
      links.push({ label: "Portfolios", route: "students" });
    } else if (currentUser?.role === "academician" || currentUser?.role === "academia") {
      links.push({ label: "Institutional Hub", route: "institution-analytics" });
      links.push({ label: "Lectures", route: "institution-lectures" });
      links.push({ label: "Opportunities", route: "opportunities" });
      links.push({ label: "Learning", route: "learning" });
      links.push({ label: "Portfolios", route: "institution-analytics" });
    } else {
      links.push({ label: "Opportunities", route: "opportunities" });
      links.push({ label: "Learning", route: "learning" });
      links.push({ label: "Portfolio", route: "upload-skills" });
      if (currentUser?.role === "student") {
        links.push({ label: "Applications", route: "applications" });
        links.push({ label: "My Skills", route: "my-skills" });
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
      setArrowNavActive(true);
      if (allVisibleItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % allVisibleItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setArrowNavActive(true);
      if (allVisibleItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + allVisibleItems.length) % allVisibleItems.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Only select a specific dropdown card if the user intentionally navigated to it with Arrow keys
      if (isDropdownOpen && allVisibleItems.length > 0 && selectedIndex >= 0 && selectedIndex < allVisibleItems.length && arrowNavActive) {
        const selected = allVisibleItems[selectedIndex];
        if (selected.type === "job") handleSelectJob(selected.data);
        else if (selected.type === "candidate") handleSelectCandidate(selected.data);
        else if (selected.type === "faculty") handleSelectFaculty(selected.data);
      } else {
        // Default Enter behavior: submit search to open the full results page with all matching profiles
        handleSearchSubmit(e);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setIsExpanded(false);
      setIsFocused(false);
      setSelectedIndex(-1);
      setArrowNavActive(false);
    }
  };

  return (
    <>
      <AppleMegaNav
        isOpen={isMegaNavOpen}
        activeMenu={activeMegaMenu}
        userRole={currentUser?.role}
        onMouseEnter={handleMegaNavMouseEnter}
        onMouseLeave={handleMegaNavMouseLeave}
        onNavigate={handleMegaNavigate}
        onClose={handleMegaNavClose}
      />

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

      <header
        className="fixed top-0 left-0 right-0 w-full z-50 supports-[backdrop-filter]:bg-white/75 bg-white dark:supports-[backdrop-filter]:bg-[#0B0F17]/80 dark:bg-[#0B0F17] backdrop-blur-md backdrop-saturate-150 border-b border-black/[0.05] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.015)]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 w-full h-14 md:h-16 flex items-center justify-between">
          
          <div className="flex items-center shrink-0">
            <div 
              className="flex items-center gap-2.5 shrink-0 cursor-pointer group select-none whitespace-nowrap" 
              onClick={() => onRouteChange("home")}
            >
              <img src={Logo} alt="Skill Setu Logo" className="h-7 w-7 object-contain transition-transform group-hover:scale-105" />
              <span className="font-semibold text-base text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                Skill Setu
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center gap-7 lg:gap-8 flex-1 min-w-0 mx-4 lg:mx-6">
            <div className="flex items-center gap-7 lg:gap-8 whitespace-nowrap shrink-0">
              {navLinks.map((link) => {
                const menuKey = getMegaMenuKey(link);
                const isCurrent = (currentRoute && link.route === currentRoute) || (!currentRoute && link.route === "home");
                const isMegaActive = activeMegaMenu === menuKey && isMegaNavOpen;
                return (
                  <button
                    key={link.label}
                    className={`text-[13.5px] font-medium tracking-tight transition-colors duration-150 cursor-pointer select-none relative py-1 whitespace-nowrap shrink-0 ${
                      isCurrent
                        ? "text-slate-950 dark:text-white font-semibold relative after:absolute after:-bottom-5 after:left-0 after:right-0 after:h-[2px] after:bg-slate-950 dark:after:bg-white after:rounded-full"
                        : isMegaActive
                        ? "text-slate-950 dark:text-white font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    onClick={() => {
                      handleMegaNavClose();
                      onRouteChange(link.route);
                    }}
                    onMouseEnter={() => handleNavLinkMouseEnter(link)}
                    onMouseLeave={handleNavLinkMouseLeave}
                  >
                    <span className="whitespace-nowrap">{link.label}</span>
                  </button>
                );
              })}
            </div>

            <div 
              className="relative flex items-center w-72 h-9 shrink-0" 
              ref={searchContainerRef}
            >
              <div
                className={`absolute left-0 top-0 h-9 flex items-center rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/70 dark:bg-white/[0.04] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:bg-white dark:focus-within:bg-[#0E131F] focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/15 ${
                  isFocused || isExpanded || isDropdownOpen ? "w-72 shadow-sm z-30" : "w-44"
                }`}
              >
                <form 
                  onSubmit={handleSearchSubmit}
                  className="w-full h-full flex items-center relative"
                >
                  <Search 
                    className="w-4 h-4 text-slate-400 ml-3 shrink-0 pointer-events-none" 
                  />

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onFocus={() => {
                      setIsFocused(true);
                      setIsExpanded(true);
                      if (searchQuery.trim()) setIsDropdownOpen(true);
                      handleMegaNavClose();
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                      if (!searchQuery.trim()) {
                        setIsExpanded(false);
                      }
                    }}
                    placeholder={currentUser?.role === "industry" ? "Search candidates, skills..." : currentUser?.role === "academician" ? "Search faculty, research..." : "Search jobs, skills..."}
                    className="w-full bg-transparent pl-2 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none whitespace-nowrap truncate"
                  />

                  {!searchQuery && (
                    <kbd className="absolute right-2.5 text-[10px] font-medium text-slate-400 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded shadow-2xs select-none pointer-events-none">
                      ⌘K
                    </kbd>
                  )}

                  {isLoading && (
                    <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin absolute right-2.5 shrink-0" />
                  )}

                  {searchQuery && !isLoading && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsDropdownOpen(false);
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors cursor-pointer shrink-0"
                    >
                      <X size={13} />
                    </button>
                  )}
                </form>

                {isDropdownOpen && searchQuery.trim() && (
                  <div className="absolute left-0 top-full mt-2.5 w-[min(90vw,36rem)] bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-2xl rounded-2xl shadow-[0_24px_70px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(226,232,240,0.85)] dark:shadow-[0_24px_70px_-12px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-white/[0.08] overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 ease-out origin-top-left max-h-[78vh] flex flex-col pointer-events-auto">
                    {totalResultsCount > 0 && (
                      <div className="px-3 py-2 bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] flex items-center gap-1.5 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden">
                        {[
                          { id: 'all', label: 'All', count: totalResultsCount },
                          ...(currentUser?.role === 'industry' && visibleCandidates.length > 0 ? [{ id: 'candidates', label: 'Candidates', count: visibleCandidates.length, icon: Users }] : []),
                          ...(visibleJobs.length > 0 ? [{ id: 'jobs', label: 'Jobs', count: visibleJobs.length, icon: Briefcase }] : []),
                          ...(visibleFaculty.length > 0 ? [{ id: 'faculty', label: 'Faculty', count: visibleFaculty.length, icon: GraduationCap }] : [])
                        ].map((tab) => {
                          const isActive = searchCategoryFilter === tab.id;
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setSearchCategoryFilter(tab.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap ${
                                isActive
                                  ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-white/10'
                                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                              }`}
                            >
                              {Icon && <Icon size={12} className="shrink-0" />}
                              <span className="whitespace-nowrap">{tab.label}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums whitespace-nowrap ${
                                isActive 
                                  ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' 
                                  : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="overflow-y-auto p-2 divide-y divide-slate-100/60 dark:divide-white/[0.04] max-h-[58vh] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {totalResultsCount === 0 ? (
                        <div className="p-8 text-center select-none whitespace-nowrap">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 mx-auto flex items-center justify-center mb-2.5">
                            <Search size={18} />
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white whitespace-nowrap">No results found for "{searchQuery}"</p>
                          <p className="text-[11px] text-slate-400 mt-1 whitespace-nowrap">Try searching for different skills, job titles, or company names</p>
                        </div>
                      ) : (
                        <>
                          {(searchCategoryFilter === 'all' || searchCategoryFilter === 'candidates') && visibleCandidates.length > 0 && (
                            <div className="py-1">
                              <div className="space-y-1">
                                {visibleCandidates.map((cand, idx) => {
                                  const isSelected = selectedIndex === idx;
                                  return (
                                    <div
                                      key={cand.id}
                                      onClick={() => handleSelectCandidate(cand)}
                                      onMouseEnter={() => {
                                        setSelectedIndex(idx);
                                        setArrowNavActive(false);
                                      }}
                                      className={`p-2.5 sm:p-3 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group border whitespace-nowrap ${
                                        isSelected
                                          ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                                          : 'bg-white/60 hover:bg-slate-50/80 border-slate-100 hover:border-slate-200/80'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                          {getInitials(cand)}
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate whitespace-nowrap">
                                              {cand.name}
                                            </p>
                                            {cand.is_verified && (
                                              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                                                <Sparkles size={10} /> Verified
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-slate-500 truncate whitespace-nowrap mt-0.5">
                                            {cand.department || 'Student'} · {cand.institution || 'Verified College'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-lg tabular-nums whitespace-nowrap shrink-0">
                                          {cand.confidence_score || cand.score || 85}% Fit
                                        </span>
                                        <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {(searchCategoryFilter === 'all' || searchCategoryFilter === 'jobs') && visibleJobs.length > 0 && (
                            <div className="py-1">
                              <div className="space-y-1">
                                {visibleJobs.map((job, idx) => {
                                  const itemIndex = (searchCategoryFilter === 'all' ? visibleCandidates.length : 0) + idx;
                                  const isSelected = selectedIndex === itemIndex;
                                  const isIntern = (job.type || '').toLowerCase().includes('intern');
                                  return (
                                    <div
                                      key={job.id}
                                      onClick={() => handleSelectJob(job)}
                                      onMouseEnter={() => {
                                        setSelectedIndex(itemIndex);
                                        setArrowNavActive(false);
                                      }}
                                      className={`p-2.5 sm:p-3 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group border whitespace-nowrap ${
                                        isSelected
                                          ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                                          : 'bg-white/60 hover:bg-slate-50/80 border-slate-100 hover:border-slate-200/80'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                        <div className={`w-9 h-9 rounded-xl ${getCompanyAvatarColor(job.company)} font-bold text-xs flex items-center justify-center shrink-0 shadow-xs select-none`}>
                                          {job.logo || getCompanyInitials(job.company)}
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate whitespace-nowrap">
                                              {job.title}
                                            </p>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md shrink-0 whitespace-nowrap ${
                                              isIntern
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                            }`}>
                                              {job.type}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-slate-500 truncate whitespace-nowrap mt-0.5">
                                            {job.company} · {job.location}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
                                        {job.stipend && (
                                          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-lg tabular-nums whitespace-nowrap shrink-0">
                                            {job.stipend}
                                          </span>
                                        )}
                                        <span className="text-[11px] font-bold text-emerald-700 tabular-nums whitespace-nowrap shrink-0">
                                          {job.matchScore || 90}% Match
                                        </span>
                                        <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {(searchCategoryFilter === 'all' || searchCategoryFilter === 'faculty') && visibleFaculty.length > 0 && (
                            <div className="py-1">
                              <div className="space-y-1">
                                {visibleFaculty.map((fac, idx) => {
                                  const itemIndex = (searchCategoryFilter === 'all' ? visibleCandidates.length + visibleJobs.length : 0) + idx;
                                  const isSelected = selectedIndex === itemIndex;
                                  return (
                                    <div
                                      key={fac.id}
                                      onClick={() => handleSelectFaculty(fac)}
                                      onMouseEnter={() => {
                                        setSelectedIndex(itemIndex);
                                        setArrowNavActive(false);
                                      }}
                                      className={`p-2.5 sm:p-3 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group border whitespace-nowrap ${
                                        isSelected
                                          ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                                          : 'bg-white/60 hover:bg-slate-50/80 border-slate-100 hover:border-slate-200/80'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                          FDP
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                          <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate whitespace-nowrap">
                                            {fac.title}
                                          </p>
                                          <p className="text-[11px] text-slate-500 truncate whitespace-nowrap mt-0.5">
                                            {fac.company} · {fac.location}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
                                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2 py-0.5 rounded-lg tabular-nums whitespace-nowrap shrink-0">
                                          {fac.opportunity_type || 'Faculty Program'}
                                        </span>
                                        <ChevronRight size={15} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="px-4 py-2 bg-slate-50/90 dark:bg-white/[0.03] backdrop-blur-md border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between text-xs whitespace-nowrap">
                      <button 
                        type="button"
                        onClick={handleSearchSubmit}
                        className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-all cursor-pointer group text-xs whitespace-nowrap truncate"
                      >
                        <span className="truncate whitespace-nowrap">
                          {currentUser?.role === "industry" 
                            ? `Explore all candidates` 
                            : `View all results for "${searchQuery}"`}
                        </span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-blue-600 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-4 lg:gap-4.5 shrink-0 whitespace-nowrap ml-auto md:ml-0">
            {currentUser ? (
              <>
                {uploadOption && (
                  <button
                    onClick={() => onRouteChange(uploadOption.route)}
                    className="bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer select-none flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  >
                    <span className="whitespace-nowrap">{uploadOption.label}</span>
                  </button>
                )}

                <div className="relative" ref={notifMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen((prev) => !prev);
                      setIsProfileOpen(false);
                      handleMegaNavClose();
                    }}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.02] hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-black/[0.04] dark:border-white/[0.06] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white active:bg-slate-200/60 transition-all cursor-pointer relative select-none shrink-0 ${
                      isNotifOpen ? "ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-600 dark:text-blue-400" : ""
                    }`}
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full absolute top-2 right-2 ring-2 ring-white dark:ring-[#0B0F17]" />
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden z-50 isolate animate-in fade-in zoom-in-95 duration-150 origin-top-right whitespace-nowrap">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white whitespace-nowrap">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <h3 className="text-sm font-bold text-slate-900 whitespace-nowrap">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-transparent text-blue-600 border border-blue-200 tabular-nums whitespace-nowrap">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <CheckCheck size={14} className="shrink-0" />
                            <span className="whitespace-nowrap">Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg text-xs font-medium text-slate-500 whitespace-nowrap">
                          {[
                            { id: "all", label: "All" },
                            { id: "unread", label: "Unread" },
                            { id: "applications", label: "Applications" },
                            { id: "opportunities", label: "Opportunities" },
                          ].map((tab) => {
                            const isActive = notifFilter === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setNotifFilter(tab.id)}
                                className={`flex-1 py-1 px-2 text-center text-xs transition-all cursor-pointer whitespace-nowrap ${
                                  isActive
                                    ? "bg-white text-slate-900 shadow-xs rounded-md font-semibold"
                                    : "text-slate-500 hover:text-slate-900 font-medium"
                                }`}
                              >
                                <span className="whitespace-nowrap">{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto space-y-1 px-2 py-1 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {filteredNotifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                              <Bell size={18} />
                            </div>
                            <p className="text-xs font-semibold text-slate-700 whitespace-nowrap">No notifications</p>
                          </div>
                        ) : (
                          filteredNotifications.map((n) => {
                            const badgeMeta = getNotificationBadge(n.notification_type);
                            return (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3 rounded-xl transition-all duration-150 flex items-center gap-3 cursor-pointer group whitespace-nowrap ${
                                  n.is_read
                                    ? "bg-transparent hover:bg-slate-50"
                                    : "bg-blue-50/40 hover:bg-blue-50/70"
                                }`}
                              >
                                <div className={`rounded-xl p-2 flex items-center justify-center shrink-0 ${badgeMeta.bg}`}>
                                  {badgeMeta.icon}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
                                  <p className="text-xs font-bold text-slate-900 truncate whitespace-nowrap group-hover:text-blue-600 transition-colors">
                                    {n.title}
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate whitespace-nowrap mt-0.5">
                                    {n.message}
                                  </p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium tabular-nums shrink-0 whitespace-nowrap">
                                  {formatRelativeTime(n.created_at)}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotifOpen(false);
                            onRouteChange("applications");
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          <span className="whitespace-nowrap">View all applications</span>
                          <ArrowRight size={13} className="shrink-0" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => {
                      setIsProfileOpen((prev) => !prev);
                      setIsNotifOpen(false);
                      handleMegaNavClose();
                    }}
                    className={`relative w-9 h-9 rounded-full overflow-hidden transition-all cursor-pointer select-none outline-none shrink-0 ${
                      isProfileOpen 
                        ? "ring-2 ring-blue-600 shadow-sm" 
                        : "ring-2 ring-slate-200 hover:ring-slate-300 dark:ring-white/20"
                    }`}
                    aria-label="User Profile Menu"
                    title="User Profile Menu"
                  >
                    {currentUser?.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.first_name || currentUser.username || "Profile"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center tracking-tight select-none">
                        {getInitials(currentUser)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0F17]" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2.5 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right whitespace-nowrap">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden ring-2 ring-slate-100 flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xs">
                          {currentUser?.avatar_url ? (
                            <img
                              src={currentUser.avatar_url}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            getInitials(currentUser)
                          )}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-900 truncate whitespace-nowrap">
                            {currentUser.first_name
                              ? `${currentUser.first_name} ${currentUser.last_name || ""}`.trim()
                              : currentUser.username}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate whitespace-nowrap">@{currentUser.username}</p>
                          <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
                            <span className="capitalize px-2 py-0.2 rounded-full text-[10px] font-bold bg-transparent text-blue-700 border border-blue-200 shrink-0 whitespace-nowrap">
                              {currentUser.role === "student" ? "Candidate" : currentUser.role}
                            </span>
                            {currentUser.is_email_verified && (
                              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                                <ShieldCheck size={11} className="shrink-0" /> 
                                <span className="whitespace-nowrap">Verified</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 space-y-0.5 text-xs whitespace-nowrap">
                        {(currentUser.role === "academician" || currentUser.role === "academia") ? (
                          <>
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("academician-profile");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <User size={15} className="text-slate-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">My Profile & Credentials</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("institution-organization");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <Building2 size={15} className="text-slate-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">Institutional Hub & AISHE</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("institution-governance");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <Users size={15} className="text-slate-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">Student Verification Ledger</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("institution-lectures");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <Video size={15} className="text-slate-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">Course Lectures & Resources</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("academician-profile");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <ShieldCheck size={15} className="text-slate-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">NEP 2020 Compliance</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("academician-profile");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <Settings size={15} className="text-slate-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">Account Preferences</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("profile");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <User size={15} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                              <span className="truncate whitespace-nowrap">My Profile</span>
                            </button>

                            {currentUser.role === "student" && (
                              <>
                                <button
                                  onClick={() => {
                                    setIsProfileOpen(false);
                                    onRouteChange("applications");
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                                >
                                  <Briefcase size={15} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                                  <span className="truncate whitespace-nowrap">My Applications</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setIsProfileOpen(false);
                                    onRouteChange("my-skills");
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                                >
                                  <BrainCircuit size={15} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                                  <span className="truncate whitespace-nowrap">My Skills</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setIsProfileOpen(false);
                                    onRouteChange("upload-skills");
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                                >
                                  <Sparkles size={15} className="text-slate-400 shrink-0" />
                                  <span className="truncate whitespace-nowrap">Digital Portfolio</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setIsProfileOpen(false);
                                    onRouteChange("learning");
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                                >
                                  <BookOpen size={15} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                                  <span className="truncate whitespace-nowrap">Learning Tracks</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onRouteChange("settings");
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-left cursor-pointer whitespace-nowrap"
                            >
                              <Settings size={15} className="text-slate-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">Settings</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-100 p-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogoutClick();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left cursor-pointer text-xs whitespace-nowrap"
                        >
                          <LogOut size={15} className="shrink-0" />
                          <span className="font-bold truncate whitespace-nowrap">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                className="bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white text-xs font-medium px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer select-none shrink-0 whitespace-nowrap"
                onClick={() => onRouteChange("signin")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;