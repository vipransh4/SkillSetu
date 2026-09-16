import React, { useState } from 'react';
import { TrendingUp, Users, CheckCircle, ArrowRight, Building } from 'lucide-react';

const generateSmoothPath = (points) => {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlPointX1 = current.x + (next.x - current.x) / 2;
    const controlPointY1 = current.y;
    const controlPointX2 = current.x + (next.x - current.x) / 2;
    const controlPointY2 = next.y;

    d += ` C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${next.x} ${next.y}`;
  }
  return d;
};

const RecruitmentFunnelLineChart = ({ trends = null, isLoading = false }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  if (isLoading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-medium">Tracing recruitment pipeline trajectory...</p>
      </div>
    );
  }

  const stagesData = [
    { key: 'applied', label: 'Applied', count: trends?.funnel_stages?.applied || 0, color: '#3B82F6' },
    { key: 'under_review', label: 'Review', count: trends?.funnel_stages?.under_review || 0, color: '#F59E0B' },
    { key: 'shortlisted', label: 'Shortlisted', count: trends?.funnel_stages?.shortlisted || 0, color: '#8B5CF6' },
    { key: 'interview', label: 'Interview', count: trends?.funnel_stages?.interview || 0, color: '#6366F1' },
    { key: 'offered', label: 'Offered', count: trends?.funnel_stages?.offered || 0, color: '#10B981' },
    { key: 'placed', label: 'Placed', count: trends?.funnel_stages?.placed_students || 0, color: '#059669' }
  ];

  const maxCount = Math.max(...stagesData.map((s) => s.count), 5);
  const maxY = Math.ceil(maxCount / 5) * 5;

  const svgWidth = 720;
  const svgHeight = 250;
  const margin = { top: 35, right: 40, bottom: 55, left: 45 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const totalPoints = stagesData.length;
  const stepX = chartWidth / (totalPoints - 1);

  const points = stagesData.map((stage, idx) => {
    const x = margin.left + idx * stepX;
    const y = margin.top + chartHeight - (stage.count / maxY) * chartHeight;
    return {
      ...stage,
      x,
      y,
      index: idx
    };
  });

  const linePath = generateSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`
    : '';

  const yTicks = [0, Math.round(maxY * 0.25), Math.round(maxY * 0.5), Math.round(maxY * 0.75), maxY];

  return (
    <div className="space-y-4">
      {/* Top stage badges */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium text-slate-500 py-1">
          {stagesData.map((st, i) => (
            <React.Fragment key={st.key}>
              <span className={`px-2 py-0.5 rounded-md ${hoveredNode?.key === st.key ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-700'}`}>
                {st.label}: <strong className="tabular-nums">{st.count}</strong>
              </span>
              {i < stagesData.length - 1 && (
                <ArrowRight size={10} className="text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* SVG Line & Area Chart */}
      <div className="relative overflow-x-auto select-none bg-slate-50/40 rounded-2xl border border-slate-100 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px]"
          style={{ overflow: 'visible' }}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
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
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Nodes */}
          {points.map((pt) => {
            const isHovered = hoveredNode?.key === pt.key;
            return (
              <g
                key={pt.key}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(pt)}
              >
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={margin.top}
                    x2={pt.x}
                    y2={margin.top + chartHeight}
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 9 : 6}
                  fill="#FFFFFF"
                  stroke={pt.color}
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  className="transition-all duration-150 shadow-sm"
                />

                {/* Inner center dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4 : 2.5}
                  fill={pt.color}
                />

                {/* Value text above node */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-bold font-mono transition-all ${
                    isHovered ? 'fill-slate-950 font-extrabold text-xs' : 'fill-slate-700'
                  }`}
                >
                  {pt.count}
                </text>

                {/* X-axis Stage label */}
                <text
                  x={pt.x}
                  y={margin.top + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover details pill */}
        {hoveredNode && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
              <span className="font-semibold text-slate-900">{hoveredNode.label} Stage</span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-900 tabular-nums">{hoveredNode.count} Candidates</span>
            </div>
            <span className="text-slate-500 text-[11px]">
              {trends?.total_applications > 0
                ? `${Math.round((hoveredNode.count / trends.total_applications) * 100)}% of total cohort`
                : 'Initial telemetry'}
            </span>
          </div>
        )}
      </div>

      {/* Trajectory Yield Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Shortlist Yield</p>
          <p className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
            {trends?.conversion_rates?.application_to_shortlist_pct || 0}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Application → Shortlist</p>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Interview → Offer</p>
          <p className="text-base font-bold text-emerald-600 mt-0.5 tabular-nums">
            {trends?.conversion_rates?.interview_to_offer_pct || 0}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Final Conversion Yield</p>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Overall Offer Rate</p>
          <p className="text-base font-bold text-blue-600 mt-0.5 tabular-nums">
            {trends?.conversion_rates?.overall_offer_rate_pct || 0}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total Pipeline Conversion</p>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Hiring Partners</p>
          <p className="text-base font-bold text-purple-600 mt-0.5 tabular-nums">
            {trends?.active_companies_count || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active Corporate Employers</p>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentFunnelLineChart;
