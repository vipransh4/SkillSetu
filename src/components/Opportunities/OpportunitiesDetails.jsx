import React from 'react';
import { ArrowLeft, MapPin, Timer, IndianRupee, CalendarClock, Check, Sparkles } from 'lucide-react';

const OpportunityDetails = ({ opportunity, onBack, onRouteChange }) => {
  if (!opportunity) return null;

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back to Opportunities</span>
        </button>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT SECTION: Dynamic Content Cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                    {opportunity.logo || opportunity.company?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{opportunity.title}</h1>
                    <p className="text-slate-500 font-medium text-sm mt-0.5">
                      {opportunity.company} · {opportunity.category || 'SaaS'} · {opportunity.type}
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-200 shrink-0">
                  {opportunity.matchScore || 91}% Match
                </div>
              </div>

              {/* 4 Stat Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <MapPin size={14} /> Location
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{opportunity.location}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Timer size={14} /> Duration
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{opportunity.duration}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <IndianRupee size={14} /> Stipend / Salary
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{opportunity.stipend}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <CalendarClock size={14} /> Apply before
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{opportunity.deadline}</p>
                </div>
              </div>
            </div>

            {/* About the role */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-slate-900 mb-3">About the role</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {opportunity.about || `Join the ${opportunity.company} product team and build high-performance customer-facing interfaces. You will work alongside senior engineers and designers in a fast, impact-driven environment.`}
              </p>
            </div>

            {/* Responsibilities */}
            {opportunity.responsibilities && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Responsibilities</h2>
                <ul className="flex flex-col gap-3">
                  {opportunity.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferred Qualifications */}
            {opportunity.qualifications && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Preferred qualifications</h2>
                <ul className="flex flex-col gap-3">
                  {opportunity.qualifications.map((qual, i) => (
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
              <h2 className="text-lg font-bold text-slate-900 mb-4">Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills?.map((skill, index) => (
                  <span key={index} className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SECTION: Compatibility & Match Sidebars */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            
            {/* Compatibility Sidebar */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-bold text-slate-900 mb-1">Your Compatibility</h3>
              <p className="text-3xl font-extrabold text-blue-600 mb-4">{opportunity.matchScore || 91}% Match</p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${opportunity.matchScore || 91}%` }}
                />
              </div>

              {/* Matched Skills List */}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Matched skills</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {opportunity.skills?.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <Check size={16} className="text-emerald-500" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>

              {/* Apply Button */}
              <button
                onClick={() => alert(`Applied to ${opportunity.title} at ${opportunity.company}`)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Apply Now
              </button>
            </div>

            {/* Why This Opportunity Box */}
            <div className="bg-blue-50/60 rounded-3xl p-6 sm:p-8 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-base mb-4">
                <Sparkles size={18} />
                <span>Why this opportunity?</span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>You already have {opportunity.skills?.slice(0, 3).join(', ')}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{opportunity.location} work matches your stated preference.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{opportunity.company} offers strong growth potential for your profile.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default OpportunityDetails;