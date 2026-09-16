import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, Users } from 'lucide-react';

const DepartmentBarChart = ({ departments = [], isLoading = false }) => {
  const [metric, setMetric] = useState('rate'); // 'rate' | 'score' | 'counts'
  const [hoveredDept, setHoveredDept] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (isLoading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-medium">Computing branch placement metrics...</p>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs">
        <BarChart3 size={32} className="text-slate-300 mb-2" />
        <p className="font-semibold text-slate-600">No Departmental Data Available</p>
        <p className="text-slate-400 mt-0.5">Profiles are being synchronized across campus cohorts.</p>
      </div>
    );
  }

  // SVG Configuration
  const svgWidth = 740;
  const svgHeight = 280;
  const margin = { top: 30, right: 30, bottom: 65, left: 55 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  // Compute maximum values based on metric
  let maxY = 100;
  if (metric === 'counts') {
    const maxStudents = Math.max(...departments.map(d => d.total_students || 1), 5);
    maxY = Math.ceil(maxStudents / 5) * 5;
  }

  const yTicks = metric === 'counts'
    ? [0, Math.round(maxY * 0.25), Math.round(maxY * 0.5), Math.round(maxY * 0.75), maxY]
    : [0, 25, 50, 75, 100];

  const barCount = departments.length;
  const groupWidth = chartWidth / barCount;
  const singleBarWidth = metric === 'counts' ? Math.min(24, (groupWidth - 20) / 2) : Math.min(42, groupWidth - 24);

  return (
    <div className="space-y-4">
      {/* Metric Selector Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMetric('rate')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'rate'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp size={13} className="text-emerald-600" />
            <span>Placement Rate (%)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('score')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'score'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={13} className="text-blue-600" />
            <span>Avg Score (CS/100)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('counts')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'counts'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={13} className="text-indigo-600" />
            <span>Placed vs Enrolled</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          {metric === 'counts' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Placed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                <span>Enrolled</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-900" />
              <span>{metric === 'rate' ? 'Rate %' : 'Confidence Score'}</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto select-none bg-slate-50/40 rounded-2xl border border-slate-100 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px]"
          style={{ overflow: 'visible' }}
          onMouseLeave={() => setHoveredDept(null)}
        >
          <defs>
            <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="barGradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="barGradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="barGradSlate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis labels */}
          {yTicks.map((val) => {
            const yPos = margin.top + chartHeight - (val / maxY) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={margin.left}
                  y1={yPos}
                  x2={margin.left + chartWidth}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray={val === 0 ? '0' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono font-medium"
                >
                  {val}{metric === 'rate' ? '%' : ''}
                </text>
              </g>
            );
          })}

          {/* Department Bars */}
          {departments.map((dept, index) => {
            const centerX = margin.left + index * groupWidth + groupWidth / 2;

            if (metric === 'counts') {
              const enrolledVal = dept.total_students || 0;
              const placedVal = dept.placed_students || 0;

              const enrolledHeight = Math.max(2, (enrolledVal / maxY) * chartHeight);
              const placedHeight = Math.max(2, (placedVal / maxY) * chartHeight);

              const enrolledY = margin.top + chartHeight - enrolledHeight;
              const placedY = margin.top + chartHeight - placedHeight;

              const xEnrolled = centerX - singleBarWidth - 2;
              const xPlaced = centerX + 2;

              const isHovered = hoveredDept?.department === dept.department;

              return (
                <g
                  key={dept.department || index}
                  className="cursor-pointer transition-transform duration-150"
                  onMouseEnter={(e) => {
                    setHoveredDept(dept);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                  }}
                >
                  {/* Total Enrolled Bar */}
                  <rect
                    x={xEnrolled}
                    y={enrolledY}
                    width={singleBarWidth}
                    height={enrolledHeight}
                    rx="4"
                    fill="url(#barGradSlate)"
                    className="transition-all duration-300"
                    opacity={isHovered ? 1 : 0.8}
                  />
                  {/* Placed Bar */}
                  <rect
                    x={xPlaced}
                    y={placedY}
                    width={singleBarWidth}
                    height={placedHeight}
                    rx="4"
                    fill="url(#barGradEmerald)"
                    className="transition-all duration-300"
                    opacity={isHovered ? 1 : 0.9}
                  />

                  {/* Value on top of placed bar */}
                  <text
                    x={xPlaced + singleBarWidth / 2}
                    y={placedY - 5}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-emerald-700 font-mono"
                  >
                    {placedVal}
                  </text>

                  {/* X-Axis Department Name */}
                  <text
                    x={centerX}
                    y={margin.top + chartHeight + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                    }`}
                  >
                    {dept.department?.length > 13
                      ? `${dept.department.slice(0, 11)}..`
                      : dept.department || `Dept #${index + 1}`}
                  </text>
                </g>
              );
            }

            // Single Bar: Rate or Score
            const rawValue = metric === 'rate'
              ? (dept.placement_rate_percentage || 0)
              : (dept.average_confidence_score || 0);

            const barHeight = Math.max(4, (rawValue / maxY) * chartHeight);
            const barY = margin.top + chartHeight - barHeight;
            const barX = centerX - singleBarWidth / 2;
            const isHovered = hoveredDept?.department === dept.department;

            const fillGrad = metric === 'rate'
              ? (rawValue >= 70 ? 'url(#barGradEmerald)' : 'url(#barGradDark)')
              : 'url(#barGradBlue)';

            return (
              <g
                key={dept.department || index}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={(e) => {
                  setHoveredDept(dept);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                }}
              >
                {/* Background hover column highlight */}
                {isHovered && (
                  <rect
                    x={centerX - groupWidth / 2 + 4}
                    y={margin.top}
                    width={groupWidth - 8}
                    height={chartHeight}
                    rx="8"
                    fill="#F1F5F9"
                    opacity="0.6"
                  />
                )}

                {/* Primary Metric Bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={singleBarWidth}
                  height={barHeight}
                  rx="6"
                  fill={fillGrad}
                  className="transition-all duration-300"
                  opacity={isHovered ? 1 : 0.9}
                />

                {/* Value Label Above Bar */}
                <text
                  x={centerX}
                  y={barY - 6}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-800 font-mono"
                >
                  {rawValue}{metric === 'rate' ? '%' : ''}
                </text>

                {/* X-Axis Department Name */}
                <text
                  x={centerX}
                  y={margin.top + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {dept.department?.length > 14
                    ? `${dept.department.slice(0, 12)}..`
                    : dept.department || `Dept #${index + 1}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredDept && (
          <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-100">
            <div>
              <span className="font-semibold text-slate-900 block text-sm">
                {hoveredDept.department}
              </span>
              <span className="text-slate-500 text-[11px]">
                {hoveredDept.total_students} Total Candidates Indexed • {hoveredDept.placed_students} Placed
              </span>
            </div>

            <div className="flex items-center gap-4 tabular-nums">
              <div className="text-right">
                <span className="text-[10px] uppercase font-medium text-slate-400 block">Placement Rate</span>
                <span className="text-sm font-bold text-emerald-600">
                  {hoveredDept.placement_rate_percentage}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-medium text-slate-400 block">Avg CS</span>
                <span className="text-sm font-bold text-slate-900">
                  {hoveredDept.average_confidence_score}/100
                </span>
              </div>
            </div>

            {hoveredDept.top_skills && hoveredDept.top_skills.length > 0 && (
              <div className="w-full flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium uppercase">Top Skills:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {hoveredDept.top_skills.map((sk, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentBarChart;
