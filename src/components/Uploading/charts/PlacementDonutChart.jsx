import React, { useState } from 'react';
import { PieChart, CheckCircle2, Clock, Award, ShieldAlert } from 'lucide-react';

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

const createDonutSlice = (x, y, radius, innerRadius, startAngle, endAngle) => {
  // Ensure we don't do full 360 exactly on one arc due to SVG wrap quirks
  const safeEndAngle = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;
  const start = polarToCartesian(x, y, radius, safeEndAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, safeEndAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const arcSweep = safeEndAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
    'L', innerEnd.x, innerEnd.y,
    'A', innerRadius, innerRadius, 0, arcSweep, 1, innerStart.x, innerStart.y,
    'Z'
  ].join(' ');
};

const PlacementDonutChart = ({
  overview = null,
  branchWise = null,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState('placement'); // 'placement' | 'readiness'
  const [hoveredSlice, setHoveredSlice] = useState(null);

  if (isLoading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-medium">Computing cohort breakdown...</p>
      </div>
    );
  }

  const totalStudents = overview?.total_students || 0;
  const placedStudents = overview?.placed_students || 0;
  const unplacedStudents = overview?.unplaced_students !== undefined
    ? overview.unplaced_students
    : Math.max(0, totalStudents - placedStudents);

  // Compute readiness tiers from branchWise or estimates
  let highReadiness = 0;
  let mediumReadiness = 0;
  let foundationReadiness = 0;

  if (branchWise?.departments) {
    branchWise.departments.forEach((dept) => {
      const avg = dept.average_confidence_score || 50;
      const count = dept.total_students || 0;
      if (avg >= 70) highReadiness += count;
      else if (avg >= 50) mediumReadiness += count;
      else foundationReadiness += count;
    });
  } else {
    highReadiness = Math.round(totalStudents * 0.45);
    mediumReadiness = Math.round(totalStudents * 0.35);
    foundationReadiness = Math.max(0, totalStudents - highReadiness - mediumReadiness);
  }

  // Define segments according to viewMode
  let segments = [];
  if (viewMode === 'placement') {
    segments = [
      {
        id: 'placed',
        label: 'Placed in Industry',
        count: placedStudents,
        color: '#10B981',
        hoverColor: '#059669',
        icon: CheckCircle2
      },
      {
        id: 'unplaced',
        label: 'Interview Pipeline & In-Review',
        count: unplacedStudents,
        color: '#64748B',
        hoverColor: '#475569',
        icon: Clock
      }
    ];
  } else {
    segments = [
      {
        id: 'high',
        label: 'Verified Ready (CS ≥ 70)',
        count: highReadiness,
        color: '#3B82F6',
        hoverColor: '#2563EB',
        icon: Award
      },
      {
        id: 'medium',
        label: 'Moderate (CS 50-69)',
        count: mediumReadiness,
        color: '#F59E0B',
        hoverColor: '#D97706',
        icon: PieChart
      },
      {
        id: 'foundation',
        label: 'Foundation (CS < 50)',
        count: foundationReadiness,
        color: '#94A3B8',
        hoverColor: '#64748B',
        icon: ShieldAlert
      }
    ];
  }

  const safeTotal = segments.reduce((sum, s) => sum + s.count, 0) || 1;

  // Compute angles for each segment
  let cumulativeAngle = 0;
  const slicesWithAngles = segments.map((seg) => {
    const angleSpan = (seg.count / safeTotal) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angleSpan;
    cumulativeAngle = endAngle;
    const percentage = Math.round((seg.count / safeTotal) * 100);
    return {
      ...seg,
      startAngle,
      endAngle,
      percentage
    };
  });

  const activeDisplay = hoveredSlice || {
    label: viewMode === 'placement' ? 'Campus Cohort' : 'Verified Pipeline',
    count: totalStudents,
    percentage: viewMode === 'placement' ? (overview?.placement_rate_percentage || 0) : 100,
    subtext: viewMode === 'placement' ? `${overview?.placement_rate_percentage || 0}% Placement Rate` : 'Total Active'
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setViewMode('placement');
              setHoveredSlice(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'placement'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Placement Status
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('readiness');
              setHoveredSlice(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'readiness'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Readiness Tiers
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium tabular-nums">
          {totalStudents} Total Students
        </span>
      </div>

      {/* Donut Graphic & Legend */}
      <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-56 h-56 shrink-0 select-none">
          <svg
            viewBox="0 0 240 240"
            className="w-full h-full transform -rotate-90"
            onMouseLeave={() => setHoveredSlice(null)}
          >
            {slicesWithAngles.map((slice) => {
              if (slice.count <= 0) return null;
              const isHovered = hoveredSlice?.id === slice.id;
              const outerRadius = isHovered ? 98 : 94;
              const innerRadius = isHovered ? 58 : 62;

              return (
                <path
                  key={slice.id}
                  d={createDonutSlice(120, 120, outerRadius, innerRadius, slice.startAngle, slice.endAngle)}
                  fill={isHovered ? slice.hoverColor : slice.color}
                  className="transition-all duration-200 cursor-pointer"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredSlice(slice)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider line-clamp-1">
              {hoveredSlice ? hoveredSlice.label : 'Cohort'}
            </span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums mt-0.5">
              {activeDisplay.count}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 tabular-nums">
              {hoveredSlice ? `${hoveredSlice.percentage}%` : activeDisplay.subtext}
            </span>
          </div>
        </div>

        {/* Legend Breakdown List */}
        <div className="flex-1 w-full space-y-2.5">
          {slicesWithAngles.map((slice) => {
            const isHovered = hoveredSlice?.id === slice.id;
            const Icon = slice.icon;

            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isHovered
                    ? 'bg-white border-slate-300 shadow-xs ring-1 ring-slate-200'
                    : 'bg-white/60 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {slice.label}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {slice.count} Candidates
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {slice.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlacementDonutChart;
