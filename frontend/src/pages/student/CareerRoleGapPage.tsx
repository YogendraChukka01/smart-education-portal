import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Loader2,
  ChevronRight,
  Compass,
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
} from 'recharts';

export const CareerRoleGapPage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGapAnalysis(selectedRoleId);
  }, [selectedRoleId]);

  const fetchGapAnalysis = async (roleId?: string) => {
    try {
      const url = roleId ? `/skills/profile?targetRoleId=${roleId}` : '/skills/profile';
      const res = await api.get(url);
      setProfileData(res.data);
      if (!selectedRoleId && res.data.targetRole) {
        setSelectedRoleId(res.data.targetRole.id);
      }
    } catch (err) {
      console.error('Failed to load gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading career role mapping and gap analysis...</p>
      </div>
    );
  }

  const {
    student,
    radarData = [],
    skillGaps = [],
    overallReadinessPct = 78,
    targetRole,
    availableRoles = [],
  } = profileData || {};

  const criticalGaps = skillGaps.filter((g: any) => g.status === 'critical_gap');
  const moderateGaps = skillGaps.filter((g: any) => g.status === 'moderate_gap');
  const satisfiedSkills = skillGaps.filter((g: any) => g.status === 'proficient');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Career Track Selector */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Target Career Role Mapping
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Skill Gap Analysis & Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Compare your verified assessment scores directly against industry benchmark requirements for your target engineering job role.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Target Career:</div>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-2xs"
          >
            {availableRoles.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.title} ({role.departmentName.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Role Overview Summary */}
      {targetRole && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{targetRole.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{targetRole.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-black text-blue-700">{overallReadinessPct}%</div>
                <div className="text-[10px] text-slate-500 font-medium">Role Compatibility</div>
              </div>
            </div>
          </div>

          {/* Recommended Capstone Projects */}
          {targetRole.recommendedProjects?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                <span>Recommended Projects for Resume Building:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {targetRole.recommendedProjects.map((proj: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-medium border border-slate-200"
                  >
                    • {proj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visualizer: Recharts Radar & Gap Summary KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Skills vs. Target Benchmark</h3>
            <span className="text-xs text-slate-400 font-mono">0-100 Scale</span>
          </div>

          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Radar
                  name="Your Assessed Score"
                  dataKey="studentScore"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Required Target Benchmark"
                  dataKey="benchmarkScore"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gap Status Summary Cards */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wider">
                Critical Skill Deficits ({criticalGaps.length})
              </span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-700">
              {criticalGaps.length > 0 ? criticalGaps.map((g: any) => g.skillName).join(', ') : 'None detected!'}
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              These are mandatory skills where your score is significantly below the minimum hiring threshold.
            </p>
          </div>

          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Moderate Gaps ({moderateGaps.length})
              </span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-800">
              {moderateGaps.length > 0 ? moderateGaps.map((g: any) => g.skillName).join(', ') : 'None'}
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Targeted practice and coding problem sets recommended to reach top percentile.
            </p>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Satisfied Requirements ({satisfiedSkills.length})
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-800">
              {satisfiedSkills.map((g: any) => g.skillName).slice(0, 3).join(', ')}
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              You meet or exceed the industry hiring benchmark for these technical domains.
            </p>
          </div>
        </div>
      </div>

      {/* Ranked Skill Gaps & Practical Roadmap Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Ranked Skill Gaps & Learning Action Plan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Concrete actionable steps to bridge deficits and maximize your placement match score.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4 text-center">Your Score</th>
                <th className="py-3 px-4 text-center">Required Level</th>
                <th className="py-3 px-4 text-center">Gap Delta</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recommended Action Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {skillGaps.map((g: any) => {
                let badge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Proficient
                  </span>
                );
                if (g.status === 'critical_gap') {
                  badge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 w-max">
                      <AlertTriangle className="w-3 h-3" /> High Deficit
                    </span>
                  );
                } else if (g.status === 'moderate_gap') {
                  badge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 w-max">
                      Moderate Gap
                    </span>
                  );
                }

                return (
                  <tr key={g.skillName} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{g.skillName}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-800">{g.studentScore}%</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">{g.benchmarkScore}%</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {g.gap > 0 ? (
                        <span className="text-red-600">-{g.gap}%</span>
                      ) : (
                        <span className="text-emerald-600">✓ 0%</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{badge}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-tight">
                      {g.recommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
