import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Radar as RadarIcon,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  ArrowRight,
  FileCheck,
  Target,
  Sparkles,
  Loader2,
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

export const SkillProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/skills/profile');
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to load skill profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading || !profileData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Generating Skill Radar Profile...</p>
      </div>
    );
  }

  const careerTracks = profileData.careerTracks || [];
  const currentTrack = careerTracks[selectedTrackIndex] || careerTracks[0];

  // Recalculate radar points against selected track
  const activeRadarData = profileData.radarData.map((item: any) => {
    const customBenchmark = currentTrack?.benchmarks[item.skill] || 70;
    return {
      ...item,
      benchmarkScore: customBenchmark,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
            <RadarIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>Auto-Generated Skill Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Skill Profile & Benchmark Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Evaluated against the Ministry of Ayush standardized taxonomy and national industry benchmarks.
          </p>
        </div>

        {/* Career Track Benchmark Switcher */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 w-full lg:w-80">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-teal-600" /> Compare Against Career Track:
          </label>
          <select
            value={selectedTrackIndex}
            onChange={(e) => setSelectedTrackIndex(Number(e.target.value))}
            className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {careerTracks.map((track: any, idx: number) => (
              <option key={track.roleName} value={idx}>
                {track.roleName}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 italic truncate">{currentTrack?.description}</p>
        </div>
      </div>

      {/* Top Strengths and KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-teal-900 to-teal-800 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">Overall Fit Score</span>
            <div className="text-3xl font-black mt-1">{profileData.overallReadinessPct}%</div>
            <p className="text-xs text-teal-100 mt-1">High alignment for clinical rotations</p>
          </div>
          <div className="pt-3 border-t border-teal-700/60 mt-3 flex items-center justify-between text-xs text-teal-200">
            <span>Verified Skills:</span>
            <span className="font-bold text-white">4 Domains</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Strengths Identified
            </span>
            <Link
              to="/student/assessment"
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              <FileCheck className="w-3.5 h-3.5" /> Retake Assessment
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {profileData.topStrengths?.map((str: string) => (
              <span
                key={str}
                className="px-3 py-1 rounded-xl bg-teal-50 text-teal-900 text-xs font-bold border border-teal-200 flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                {str}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Chart & Category Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Recharts Radar Chart */}
        <div className="lg:col-span-7 h-96 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={activeRadarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Radar
                name="My Proficiency Score"
                dataKey="studentScore"
                stroke="#0f766e"
                fill="#0f766e"
                fillOpacity={0.45}
              />
              <Radar
                name={`${currentTrack.roleName} Benchmark`}
                dataKey="benchmarkScore"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.15}
                strokeDasharray="4 4"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Explanatory Sidebar */}
        <div className="lg:col-span-5 space-y-4 lg:border-l lg:border-slate-200 lg:pl-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Radar Chart Interpretation</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Green polygon represents your current assessed proficiency. Gold dashed polygon shows target industry competency for <span className="font-semibold text-slate-800">{currentTrack.roleName}</span>.
            </p>
          </div>

          <div className="space-y-2.5">
            {profileData.categoryAverages.map((cat: any) => {
              const diff = cat.score - cat.benchmark;
              return (
                <div key={cat.category} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{cat.category}</span>
                    <span className={diff >= 0 ? 'text-emerald-700 font-mono' : 'text-amber-700 font-mono'}>
                      {cat.score}% (vs {cat.benchmark}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${cat.score}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/student/opportunities"
            className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            Find Matching Internships for this Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Ranked Skill Gap Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" /> Ranked Skill Gaps & Recommended Upskilling Modules
            </h2>
            <p className="text-xs text-slate-500">
              Sorted by severity of deficit against the <span className="font-semibold">{currentTrack.roleName}</span> benchmark.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Skill Domain</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Your Score</th>
                <th className="py-3 px-4 text-center">Benchmark</th>
                <th className="py-3 px-4 text-center">Deficit</th>
                <th className="py-3 px-4">Action Status</th>
                <th className="py-3 px-4">Recommended Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {profileData.skillGaps.map((g: any) => {
                let badge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Proficient
                  </span>
                );
                if (g.status === 'critical_gap') {
                  badge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                      Critical Gap
                    </span>
                  );
                } else if (g.status === 'moderate_gap') {
                  badge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Moderate Gap
                    </span>
                  );
                }

                return (
                  <tr key={g.skillId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{g.skillName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{g.category}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-800">{g.studentScore}%</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500">{g.benchmarkScore}%</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {g.gap > 0 ? (
                        <span className="text-red-600">-{g.gap}%</span>
                      ) : (
                        <span className="text-emerald-600">Aligned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{badge}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-tight">{g.recommendedAction}</td>
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
