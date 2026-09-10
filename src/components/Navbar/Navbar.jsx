import React from "react";
import { Search, LogOut } from "lucide-react";
import Logo from "../../../public/hero.png";

const Navbar = ({ onRouteChange, user, onLogout }) => {
  // Determine dynamic upload route based on user role
  const getUploadOption = () => {
    if (!user) return null;
    switch (user.role) {
      case 'student':
        return { label: "Upload Skills", route: "upload-skills" };
      case 'academician':
        return { label: "Upload Lectures", route: "upload-lectures" };
      case 'industry':
        return { label: "Post Jobs", route: "post-jobs" };
      default:
        return null;
    }
  };

  const uploadOption = getUploadOption();

  const baseLinks = [
    { label: "Home", route: "home" },
    { label: "Learning", route: "learning" },
    { label: "Opportunities", route: "opportunities" },
    { label: "Assessment", route: "assessment" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 px-2">
      <div className="w-full max-w-[96%] flex items-center justify-between gap-4 bg-white/80 backdrop-blur-md rounded-full shadow-md px-8 py-3 border border-slate-100">
        
        {/* Brand / Logo */}
        <div 
          className="flex items-center gap-2 shrink-0 cursor-pointer" 
          onClick={() => onRouteChange("home")}
        >
          <img src={Logo} alt="logo" className="h-8 w-8" />
          <span className="font-semibold text-lg text-slate-800">
            Skill Setu
          </span>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="flex items-center gap-2 bg-gray-100/80 rounded-full px-4 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search Anything..."
              className="bg-transparent outline-none w-full text-sm placeholder-gray-400 text-slate-700"
            />
          </div>
        </div>

        {/* Navigation Links & User Controls */}
        <div className="hidden md:flex items-center gap-6 shrink-0">
          {baseLinks.map((link) => (
            <button
              key={link.label}
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors cursor-pointer"
              onClick={() => onRouteChange(link.route)}
            >
              {link.label}
            </button>
          ))}

          {/* IF USER IS LOGGED IN: Show Upload Button & Logout icon ONLY */}
          {user ? (
            <div className="flex items-center gap-3">
              {uploadOption && (
                <button
                  onClick={() => onRouteChange(uploadOption.route)}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {uploadOption.label}
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            /* IF LOGGED OUT ONLY: Show Sign In button */
            <button
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors cursor-pointer"
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