import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  BarChart3,
  Video,
  Briefcase,
  Users,
  Search,
  Filter,
  Send,
  Loader2,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';
import apiClient from '../../api/client';
import InstitutionalAnalytics from './InstitutionalAnalytics';
import CourseLectures from './CourseLectures';
import OrganizationGovernance from './OrganizationGovernance';
import StudentPortfolio from './StudentPortfolio';

const getCompanyInitials = (name = '') => {
  if (!name) return 'SS';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getCompanyAvatarColor = (name = '') => {
  const colors = [
    'bg-slate-900 text-white',
    'bg-indigo-950 text-white',
    'bg-blue-950 text-white',
    'bg-slate-800 text-white',
    'bg-zinc-900 text-white'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const TABS = [
  { id: 'analytics', label: 'Institutional Analytics', icon: BarChart3 },
  { id: 'governance', label: 'Organization & Students', icon: Building2 },
  { id: 'lectures', label: 'Course Resources', icon: Video },
  { id: 'exposure', label: 'Faculty Programs & FDPs', icon: GraduationCap },
  { id: 'collaborations', label: 'Active Collaborations', icon: Briefcase },
];

const Acadmecian = ({ onRouteChange, initialSubTab = 'analytics' }) => {
  const [activeTab, setActiveTab] = useState(
    initialSubTab === 'lectures'
      ? 'lectures'
      : initialSubTab === 'organization' || initialSubTab === 'governance'
      ? 'governance'
      : 'analytics'
  );

  const [opportunities, setOpportunities] = useState([]);
  const [opportunityQuery, setOpportunityQuery] = useState('');
  const [selectedRoleType, setSelectedRoleType] = useState('All');
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [applyModalTarget, setApplyModalTarget] = useState(null);
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [exposureNotification, setExposureNotification] = useState(null);

  const [collaborations, setCollaborations] = useState([]);
  const [isLoadingCollaborations, setIsLoadingCollaborations] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState(null);

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === 'lectures') setActiveTab('lectures');
      else if (initialSubTab === 'organization' || initialSubTab === 'governance') setActiveTab('governance');
      else if (initialSubTab === 'analytics' || initialSubTab === 'placement') setActiveTab('analytics');
    }
  }, [initialSubTab]);

  const fetchFacultyOpportunities = async () => {
    setIsLoadingOpportunities(true);
    try {
      const params = {};
      if (selectedRoleType !== 'All') params.role_type = selectedRoleType;
      if (opportunityQuery.trim()) params.q = opportunityQuery.trim();
      const res = await apiClient.get('/institutions/faculty/opportunities', { params });
      setOpportunities(Array.isArray(res.data) ? res.data : []);
    } catch {
      setOpportunities([]);
    } finally {
      setIsLoadingOpportunities(false);
    }
  };

  const fetchFacultyCollaborations = async () => {
    setIsLoadingCollaborations(true);
    try {
      const res = await apiClient.get('/institutions/faculty/my-collaborations');
      setCollaborations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCollaborations([]);
    } finally {
      setIsLoadingCollaborations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'exposure') {
      fetchFacultyOpportunities();
    } else if (activeTab === 'collaborations') {
      fetchFacultyCollaborations();
    }
  }, [activeTab, selectedRoleType, opportunityQuery]);

  const handleApplyOpportunity = async (e) => {
    e.preventDefault();
    if (!applyModalTarget) return;

    setIsSubmittingApplication(true);
    setExposureNotification(null);

    try {
      const payload = { statement_of_purpose: statementOfPurpose.trim() };
      const res = await apiClient.post(`/institutions/faculty/opportunities/${applyModalTarget.id}/apply`, payload);
      setExposureNotification({
        type: 'success',
        message: res.data.message || `Application for '${applyModalTarget.title}' submitted successfully.`,
      });
      setApplyModalTarget(null);
      setStatementOfPurpose('');
    } catch (err) {
      setExposureNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit application.',
      });
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  if (viewingStudentId) {
    return (
      <div
        className="w-full min-h-screen bg-[#F8F9FA]"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
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
    <div
      className="w-full max-w-7xl mt-4 mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen text-slate-800"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-slate-200/80 bg-slate-50 text-[11px] font-medium text-slate-600 mb-1.5">
              <Building2 size={12} className="text-slate-500" />
              <span>Academician & Institutional Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Institutional Governance & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Executive telemetry, candidate verification rosters, course repositories, and corporate partnerships.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('lectures')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Video size={14} />
              <span>Upload Resources</span>
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200/80 pt-1">
          <div className="inline-flex items-center gap-1 overflow-x-auto max-w-full pb-px">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-slate-900 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {exposureNotification && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
            exposureNotification.type === 'success'
              ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200/80'
              : 'bg-rose-50/70 text-rose-900 border-rose-200/80'
          }`}
        >
          <div className="flex items-center gap-2">
            {exposureNotification.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{exposureNotification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setExposureNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer text-slate-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {activeTab === 'analytics' && (
        <InstitutionalAnalytics
          onRouteChange={onRouteChange}
          onNavigateUpload={(tab) => setActiveTab(tab)}
          onViewFullProfile={(id) => setViewingStudentId(id)}
        />
      )}

      {activeTab === 'governance' && <OrganizationGovernance onViewFullProfile={(id) => setViewingStudentId(id)} />}

      {activeTab === 'lectures' && <CourseLectures />}

      {activeTab === 'exposure' && (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={opportunityQuery}
                onChange={(e) => setOpportunityQuery(e.target.value)}
                placeholder="Search FDPs, consultancies, or research topics..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedRoleType}
                onChange={(e) => setSelectedRoleType(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="FACULTY_INTERNSHIP">Faculty Internship</option>
                <option value="FDP">Faculty Development Program (FDP)</option>
                <option value="INDUSTRIAL_TRAINING">Industrial Training</option>
                <option value="CONSULTANCY">Corporate Consultancy</option>
                <option value="RESEARCH_PROJECT">Collaborative Research</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="GUEST_LECTURE">Guest Lecture</option>
              </select>
            </div>
          </div>

          {isLoadingOpportunities ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 size={24} className="animate-spin mx-auto text-slate-900 mb-2" />
              <p className="text-xs font-medium">Loading programs...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
              <GraduationCap size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-800 text-sm">No programs matching criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try broadening your search query or role filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-10 h-10 rounded-xl font-semibold text-xs flex items-center justify-center shrink-0 ${getCompanyAvatarColor(opp.company_name)}`}>
                        {getCompanyInitials(opp.company_name)}
                      </div>
                      <span className="bg-transparent border border-slate-200/80 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                        {opp.role_type?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm tracking-tight leading-snug line-clamp-1">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{opp.company_name}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {opp.description || 'Corporate research initiative and development program.'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 tabular-nums">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {opp.location || 'Remote'}
                      </span>
                      <span>•</span>
                      <span>{opp.stipend_or_ctc || 'Funded Program'}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(opp.required_skills || []).slice(0, 3).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-transparent border border-slate-200/80 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {opp.tenure || 'Program Track'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setApplyModalTarget(opp);
                        setStatementOfPurpose('');
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Express Interest</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'collaborations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Active Industry Initiatives</h3>
              <p className="text-xs text-slate-500 mt-0.5">Faculty development tracks and collaborative research partnerships.</p>
            </div>
            <span className="bg-transparent border border-slate-200/80 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md tabular-nums">
              {collaborations.length} Active Tracks
            </span>
          </div>

          {isLoadingCollaborations ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 size={22} className="animate-spin mx-auto text-slate-900 mb-2" />
              <p className="text-xs font-medium">Loading collaborations...</p>
            </div>
          ) : collaborations.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No active collaborations yet</p>
              <p className="text-xs text-slate-400 mt-1">Explore the Faculty Programs tab to join corporate initiatives.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {collaborations.map((collab, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-start gap-3.5"
                >
                  <div className={`w-10 h-10 rounded-xl font-medium text-xs flex items-center justify-center shrink-0 ${getCompanyAvatarColor(collab.company_name)}`}>
                    {getCompanyInitials(collab.company_name)}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{collab.title}</h4>
                      <div className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span className="text-[11px] font-medium text-slate-700">{collab.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{collab.company_name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 tabular-nums">
                      <span>{collab.program_type}</span>
                      <span>•</span>
                      <span>{collab.duration}</span>
                      <span>•</span>
                      <span>{collab.mode}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {applyModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full p-6 relative">
            <button
              type="button"
              onClick={() => setApplyModalTarget(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl font-medium text-xs flex items-center justify-center shrink-0 ${getCompanyAvatarColor(applyModalTarget.company_name)}`}>
                {getCompanyInitials(applyModalTarget.company_name)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">{applyModalTarget.title}</h3>
                <p className="text-xs text-slate-500">
                  {applyModalTarget.company_name} • {applyModalTarget.role_type?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <form onSubmit={handleApplyOpportunity} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Statement of Purpose</label>
                <textarea
                  rows={4}
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                  placeholder="Outline your academic specialization, research background, and institutional objectives..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 transition-all resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Faculty Protocol:</span> Your verified academic profile and department affiliation will be transmitted to the corporate coordinator.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalTarget(null)}
                  className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApplication}
                  className="flex-1 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingApplication ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                  <span>Submit Statement of Purpose</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Acadmecian;