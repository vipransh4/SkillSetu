import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Briefcase,
  UploadCloud,
  FileText,
  RotateCw,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Award,
  ExternalLink
} from 'lucide-react';
import apiClient from '../../api/client';
import DepartmentBarChart from './charts/DepartmentBarChart';
import PlacementDonutChart from './charts/PlacementDonutChart';
import RecruitmentFunnelLineChart from './charts/RecruitmentFunnelLineChart';
import CurriculumComparisonChart from './charts/CurriculumComparisonChart';

const InstitutionalAnalytics = ({ onRouteChange, onNavigateUpload, onViewFullProfile }) => {
  const [overview, setOverview] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [branchWise, setBranchWise] = useState(null);
  const [trends, setTrends] = useState(null);
  const [roster, setRoster] = useState([]);
  const [selectedDeptForGaps, setSelectedDeptForGaps] = useState('');
  const [rosterFilterDept, setRosterFilterDept] = useState('');
  const [rosterSearchQuery, setRosterSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [ovRes, sgRes, bwRes, trRes] = await Promise.allSettled([
        apiClient.get('/placement/overview'),
        apiClient.get('/placement/skill-gaps', { params: selectedDeptForGaps ? { department: selectedDeptForGaps } : {} }),
        apiClient.get('/placement/branch-wise'),
        apiClient.get('/placement/trends')
      ]);

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data);
      if (sgRes.status === 'fulfilled') setSkillGaps(sgRes.value.data);
      if (bwRes.status === 'fulfilled') setBranchWise(bwRes.value.data);
      if (trRes.status === 'fulfilled') setTrends(trRes.value.data);
    } catch {
      setNotification({
        type: 'error',
        message: 'Failed to load telemetry analytics.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoster = async () => {
    setIsLoadingRoster(true);
    try {
      const params = {};
      if (rosterFilterDept) params.department = rosterFilterDept;
      const res = await apiClient.get('/placement/student-status', { params });
      setRoster(res.data?.roster || []);
    } catch {
      setRoster([]);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDeptForGaps]);

  useEffect(() => {
    fetchRoster();
  }, [rosterFilterDept]);

  const departmentsList = branchWise?.departments || [];

  const filteredRoster = roster.filter((stu) => {
    if (!rosterSearchQuery.trim()) return true;
    const q = rosterSearchQuery.toLowerCase();
    return (
      stu.username?.toLowerCase().includes(q) ||
      stu.email?.toLowerCase().includes(q) ||
      stu.department?.toLowerCase().includes(q) ||
      stu.target_roles?.some(r => r.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="space-y-6 text-slate-800"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Inter, sans-serif'
      }}
    >
      {/* Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50/80 text-emerald-900 border-emerald-200'
              : 'bg-rose-50/80 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer text-slate-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Action Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/[0.06] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            <span>Institutional Telemetry & Placement Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-dimensional analytics: departmental placement rates, cohort readiness, and curriculum deficit radar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (onNavigateUpload) onNavigateUpload('lectures');
              else if (onRouteChange) onRouteChange('upload-lectures');
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <UploadCloud size={14} />
            <span>Upload Course Lectures</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigateUpload) onNavigateUpload('governance');
              else if (onRouteChange) onRouteChange('institution-governance');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <UserCheck size={14} />
            <span>Batch Upload Students</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchAnalytics();
              fetchRoster();
            }}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Analytics Telemetry"
          >
            <RotateCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* 6 Metric KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total Enrolled
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums block mt-1">
            {overview?.total_students ?? '—'}
          </span>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
            Campus Cohort
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Placement Rate
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums block mt-1">
            {overview?.placement_rate_percentage !== undefined ? `${overview.placement_rate_percentage}%` : '—'}
          </span>
          <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5 tabular-nums">
            <TrendingUp size={11} />
            <span>Verified Placed</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Placed Students
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums block mt-1">
            {overview?.placed_students ?? '—'}
          </span>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
            Confirmed Offers
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Active Openings
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums block mt-1">
            {overview?.total_job_openings ?? '—'}
          </span>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
            Industry Postings
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Offers Extended
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums block mt-1">
            {overview?.offers_extended ?? '—'}
          </span>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
            Total Recruiter Offers
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Interview Pipeline
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums block mt-1">
            {overview?.interview_pipeline_count ?? '—'}
          </span>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
            Active Rounds
          </span>
        </div>
      </div>

      {/* SECTION 1: BAR CHART & PIE/DONUT CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Department Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-black/[0.06] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Departmental Placement & Score Benchmarks (Bar Chart)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare branch placement rates, average cognitive scores (CS), and placed vs enrolled candidate distributions.
            </p>
          </div>

          <DepartmentBarChart departments={departmentsList} isLoading={isLoading} />
        </div>

        {/* Placement Donut / Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-black/[0.06] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Cohort Placement & Readiness Tiers (Donut Chart)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of placed candidates vs active pipeline, and capability readiness tiers.
            </p>
          </div>

          <PlacementDonutChart
            overview={overview}
            branchWise={branchWise}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* SECTION 2: LINE/AREA CHART & COMPARISON CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recruitment Funnel Line / Area Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-black/[0.06] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recruitment Pipeline Conversion Trajectory (Line Chart)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversion trajectory across Applied, Review, Shortlist, Interview, Offer, and Placed stages.
            </p>
          </div>

          <RecruitmentFunnelLineChart trends={trends} isLoading={isLoading} />
        </div>

        {/* Curriculum Supply vs Employer Demand Comparison Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-black/[0.06] shadow-xs p-5 sm:p-6 space-y-4">
          <CurriculumComparisonChart
            skillGaps={skillGaps}
            departments={departmentsList}
            selectedDepartment={selectedDeptForGaps}
            onDepartmentChange={(dept) => setSelectedDeptForGaps(dept)}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* SECTION 3: STUDENT PLACEMENT & OFFERS ROSTER */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Faculty Student Placement & Verified Offer Roster
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect candidate verification levels, received employer offers, and individual capability ratings.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search size={13} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rosterSearchQuery}
                onChange={(e) => setRosterSearchQuery(e.target.value)}
                placeholder="Search student by name or email..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 w-48 sm:w-60"
              />
            </div>

            <select
              value={rosterFilterDept}
              onChange={(e) => setRosterFilterDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="">All Branches</option>
              {departmentsList.map((d) => {
                const name = typeof d === 'string' ? d : d.department;
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingRoster ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 size={24} className="animate-spin text-slate-900 mx-auto mb-2" />
              <p className="text-xs font-medium">Fetching candidate offer roster...</p>
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No candidates found matching the selected filter.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-6">Candidate</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Placement Status</th>
                  <th className="py-3 px-4">Cognitive CS</th>
                  <th className="py-3 px-4">Profile Score</th>
                  <th className="py-3 px-6">Active Offers</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRoster.map((stu) => (
                  <tr key={stu.profile_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 font-bold text-xs flex items-center justify-center text-slate-700">
                          {stu.username?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{stu.username}</span>
                            {stu.is_verified && (
                              <ShieldCheck size={13} className="text-blue-600" title="Verified Profile" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{stu.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {stu.department}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          stu.placement_status === 'PLACED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                        }`}
                      >
                        {stu.placement_status === 'PLACED' ? 'Placed' : 'In Pipeline'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono tabular-nums">
                      {stu.overall_confidence_score}/100
                    </td>

                    <td className="py-3.5 px-4 font-bold text-blue-700 font-mono tabular-nums">
                      {stu.profile_strength_score}/100
                    </td>

                    <td className="py-3.5 px-6">
                      {stu.offers && stu.offers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {stu.offers.map((off, oIdx) => (
                            <span
                              key={oIdx}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-200 px-2 py-0.5 rounded-md"
                            >
                              <CheckCircle2 size={11} />
                              <span>{off.company_name}: {off.listing_title} ({off.stipend_or_ctc || 'Standard'})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Interviewing</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewFullProfile && onViewFullProfile(stu.student_id)}
                        className="px-3 py-1 rounded-lg border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Portfolio</span>
                        <ExternalLink size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION 4: DEPARTMENT BENCHMARK SUMMARY TABLE */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Departmental Placement & Score Benchmarks Table
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabular breakdown of student outcomes, verified capability averages, and top core competencies.
            </p>
          </div>
          <span className="bg-transparent border border-slate-200/80 text-slate-600 text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md tabular-nums">
            {departmentsList.length} Branches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4">Placed</th>
                <th className="py-3 px-4">Placement Rate</th>
                <th className="py-3 px-4">Average Score</th>
                <th className="py-3 px-6">Top Competencies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {departmentsList.length > 0 ? (
                departmentsList.map((dept, dIdx) => (
                  <tr key={dIdx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {dept.department}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-600 font-medium">
                      {dept.total_students}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-600 font-medium">
                      {dept.placed_students}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 tabular-nums">
                      {dept.placement_rate_percentage}%
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 tabular-nums">
                      {dept.average_confidence_score}/100
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(dept.top_skills || []).map((sk, skIdx) => (
                          <span
                            key={skIdx}
                            className="bg-transparent border border-slate-200/80 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No departmental benchmarks available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalAnalytics;
