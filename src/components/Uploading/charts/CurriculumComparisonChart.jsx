import React, { useState } from 'react';
import { Sparkles, Filter, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';

const CurriculumComparisonChart = ({
  skillGaps = null,
  departments = [],
  onDepartmentChange = null,
  selectedDepartment = '',
  isLoading = false
}) => {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  if (isLoading) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-medium">Analyzing employer demand vs campus curriculum supply...</p>
      </div>
    );
  }

  const items = (skillGaps?.deficit_skills || []).slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Header & Department Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
            Curriculum Supply vs Employer Demand Matrix
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-references campus candidate competencies against live job posting requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={13} className="text-slate-400" />
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => {
              const name = typeof dept === 'string' ? dept : dept.department;
              return (
                <option key={name} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Legend Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            <span>Employer Market Demand %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Campus Student Supply %</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          Target: Balanced 1:1 Coverage
        </span>
      </div>

      {/* Comparative Horizontal Dual-Bars */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No deficit or curriculum gap data found for this department.
        </div>
      ) : (
        <div className="space-y-3 bg-slate-50/40 rounded-2xl border border-slate-100 p-4">
          {items.map((item, idx) => {
            const isHovered = hoveredSkill?.skill === item.skill;
            const demandPct = Math.min(100, Math.round(item.market_demand_percentage || 0));
            const supplyPct = Math.min(100, Math.round(item.student_supply_percentage || 0));
            const deficitPct = Math.round(item.deficit_percentage || 0);

            const isMajorDeficit = deficitPct > 15;
            const isBalanced = Math.abs(demandPct - supplyPct) <= 10;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSkill(item)}
                onMouseLeave={() => setHoveredSkill(null)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-white border-slate-300 shadow-xs ring-1 ring-slate-200'
                    : 'bg-white/70 border-slate-200/80 hover:bg-white'
                }`}
              >
                {/* Skill Name & Deficit Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {item.skill}
                    </span>
                    {item.average_student_proficiency > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Avg Ws: {item.average_student_proficiency})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isMajorDeficit ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle size={10} />
                        <span>+{deficitPct}% Deficit</span>
                      </span>
                    ) : isBalanced ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle size={10} />
                        <span>Curriculum Balanced</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span>{supplyPct > demandPct ? `+${supplyPct - demandPct}% Campus Surplus` : `+${deficitPct}% Gap`}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Comparative Dual-Bar Graphic */}
                <div className="space-y-1.5">
                  {/* Employer Demand Bar */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Market Demand ({item.market_demand_count || 0} jobs)</span>
                      <span className="font-bold text-blue-700">{demandPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(4, demandPct)}%` }}
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Campus Student Supply Bar */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Campus Supply ({item.student_supply_count || 0} students)</span>
                      <span className="font-bold text-emerald-700">{supplyPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(4, supplyPct)}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actionable Recommendations Card */}
      {skillGaps?.faculty_recommendations && skillGaps.faculty_recommendations.length > 0 && (
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
            <Sparkles size={14} className="text-blue-600 shrink-0" />
            <span>AI Curriculum Synthesis & Syllabi Remediation</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
            {skillGaps.faculty_recommendations.map((rec, rIdx) => (
              <li key={rIdx} className="leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurriculumComparisonChart;
