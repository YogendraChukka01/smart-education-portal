import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Radar as RadarIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Download,
  Filter,
  Loader2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ENGINEERING_DEPARTMENTS } from '@ayush-portal/shared';

export const CurriculumGapRadarPage: React.FC = () => {
  const [radarData, setRadarData] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRadarData(departmentFilter);
  }, [departmentFilter]);

  const fetchRadarData = async (dept?: string) => {
    try {
      const url = dept && dept !== 'all' ? `/analytics/institution?department=${dept}` : '/analytics/institution';
      const res = await api.get(url);
      setRadarData(res.data.curriculumGapRadar || []);
    } catch (err) {
      console.error('Failed to load curriculum gap radar:', err);
    } finally {
      setLoading(false);
    }
  };

  const criticalGapsCount = radarData.filter((i) => i.gapStatus === 'Critical Priority').length;
  const moderateGapsCount = radarData.filter((i) => i.gapStatus === 'Moderate Gap').length;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"><a href="/admin/industry-intelligence" className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors">Industry Skill Intelligence →</a></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              SIH Problem Statement 26044 Core Innovation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curriculum Gap Radar & Syllabus Reform Signals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Real-time synthesis comparing active industry requisition requirements against aggregate student proficiency scores across engineering departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-300"
          >
            <Download className="w-4 h-4" /> Export Report (PDF)
          </button>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold text-slate-700 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-blue-700" /> Filter Department:
        </span>
        <button
          onClick={() => setDepartmentFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            departmentFilter === 'all'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Engineering Branches
        </button>
        {ENGINEERING_DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setDepartmentFilter(dept)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              departmentFilter === dept
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* KPI Severity Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-red-50 p-5 rounded-2xl border border-red-200 shadow-2xs">
          <span className="text-xs font-bold text-red-900 uppercase tracking-wider">Critical Curriculum Gaps</span>
          <div className="text-3xl font-black text-red-700 mt-1">{criticalGapsCount} Domains</div>
          <p className="text-xs text-red-600 mt-1">Immediate syllabus revision or FDP recommended</p>
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Moderate Gaps</span>
          <div className="text-3xl font-black text-amber-700 mt-1">{moderateGapsCount} Domains</div>
          <p className="text-xs text-amber-600 mt-1">Requires targeted lab electives & workshops</p>
        </div>

        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Aligned / Surplus Domains</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">
            {radarData.length - criticalGapsCount - moderateGapsCount} Domains
          </div>
          <p className="text-xs text-emerald-600 mt-1">Foundational engineering excellence</p>
        </div>
      </div>

      {/* Dual Visualizer: Radar & Dual Bar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Radar Chart */}
        <div className="lg:col-span-6 h-96 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="skillName" tick={{ fontSize: 9, fill: '#334155', fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Radar
                name="Industry Real-Time Demand"
                dataKey="industryDemandScore"
                stroke="#dc2626"
                fill="#dc2626"
                fillOpacity={0.25}
              />
              <Radar
                name="Aggregate Student Proficiency"
                dataKey="studentProficiencyScore"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Side Bar Comparison Chart */}
        <div className="lg:col-span-6 space-y-4 lg:border-l lg:border-slate-200 lg:pl-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Industry vs. Student Gap Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Red markers signify critical divergence where university syllabus must evolve to meet modern software & hardware requirements.
            </p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={radarData.slice(0, 6)}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="skillName" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="industryDemandScore" name="Industry Demand" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="studentProficiencyScore" name="Student Proficiency" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Policy Recommendations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <span>Actionable Syllabus Alignment & Faculty FDP Roadmap</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescriptive interventions for Academic Council and Department Board of Studies.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Skill Domain</th>
                <th className="py-3 px-4">Department / Category</th>
                <th className="py-3 px-4 text-center">Industry Demand</th>
                <th className="py-3 px-4 text-center">Student Avg</th>
                <th className="py-3 px-4 text-center">Gap Delta</th>
                <th className="py-3 px-4">Priority Status</th>
                <th className="py-3 px-4">Recommended University Policy Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {radarData.map((g: any) => {
                let badge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Aligned / Surplus
                  </span>
                );
                if (g.gapStatus === 'Critical Priority') {
                  badge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 w-max">
                      <AlertTriangle className="w-3 h-3" /> Critical Priority
                    </span>
                  );
                } else if (g.gapStatus === 'Moderate Gap') {
                  badge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 w-max">
                      Moderate Gap
                    </span>
                  );
                }

                let policyAction = 'Maintain current lecture hours and support student hackathon participation.';
                if (g.gapStatus === 'Critical Priority') {
                  policyAction = `Mandate 20-hour hands-on lab workshop in "${g.skillName}" and sponsor Faculty FDP with industry partners.`;
                } else if (g.gapStatus === 'Moderate Gap') {
                  policyAction = `Integrate practical case study modules into 3rd & 4th year laboratory curriculum for ${g.skillName}.`;
                }

                return (
                  <tr key={g.skillName} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{g.skillName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{g.category}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-700">{g.industryDemandScore}%</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-800">{g.studentProficiencyScore}%</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {g.curriculumGapScore > 0 ? (
                        <span className="text-red-600">+{g.curriculumGapScore}%</span>
                      ) : (
                        <span className="text-emerald-600">0%</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{badge}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-tight">{policyAction}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};
