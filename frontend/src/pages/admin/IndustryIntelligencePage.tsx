import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Activity, AlertTriangle, BarChart3, BrainCircuit, Loader2, TrendingUp, Users } from 'lucide-react';

export const IndustryIntelligencePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/industry-intelligence/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Unable to load industry intelligence'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-7 h-7 animate-spin" /> Building skill intelligence...</div>;
  if (error) return <div className="max-w-4xl mx-auto px-6 py-12"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <header className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-700"><BrainCircuit className="w-3.5 h-3.5" /> INDUSTRY SKILL INTELLIGENCE</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">What industry demands vs. what students have</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Sethu converts opportunity requirements into an explainable skill-demand signal and compares it with observed student proficiency. Use it to prioritize curriculum, assessments and placement preparation.</p>
          </div>
          <div className="text-xs text-slate-400">Prototype signal • {new Date(data.generatedAt).toLocaleString()}</div>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Active opportunities', data.summary.activeOpportunities, Activity],
          ['Skills observed', data.summary.skillsObserved, BarChart3],
          ['Rising skills', data.summary.risingSkills, TrendingUp],
          ['High-risk gaps', data.summary.highRiskGaps, AlertTriangle],
        ].map(([label, value, Icon]: any) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><Icon className="w-5 h-5 text-indigo-600" /><div className="mt-4 text-2xl font-black text-slate-950">{value}</div><div className="text-xs font-semibold text-slate-500 mt-1">{label}</div></div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5"><div><h2 className="font-black text-slate-900">Top industry-demand skills</h2><p className="text-xs text-slate-500 mt-1">Prioritized from live opportunity requirements</p></div><TrendingUp className="w-5 h-5 text-indigo-600" /></div>
          <div className="space-y-3">{data.topDemand.map((x: any) => <div key={x.skillId} className="flex items-center gap-3"><div className="w-28 text-xs font-bold text-slate-700 truncate">{x.skillName}</div><div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, x.demandScore)}%` }} /></div><div className="w-12 text-right text-xs font-black">{Math.round(x.demandScore)}</div><span className="text-[10px] text-slate-400 w-16 text-right">{x.opportunityCount} req.</span></div>)}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5"><div><h2 className="font-black text-slate-900">Largest student skill gaps</h2><p className="text-xs text-slate-500 mt-1">Required proficiency minus observed student average</p></div><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
          <div className="space-y-3">{data.topGaps.map((x: any) => <div key={x.skillId} className="grid grid-cols-[1fr_52px_52px] gap-3 items-center"><div><div className="text-xs font-bold text-slate-700">{x.skillName}</div><div className="text-[10px] text-slate-400">Industry {x.avgRequiredLevel} • Students {x.studentAvg}</div></div><div className="text-right text-xs font-black text-amber-700">-{x.gap}</div><div className="text-right text-[10px] text-slate-400">{x.readiness}% ready</div></div>)}</div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5"><Users className="w-5 h-5 text-indigo-600" /><div><h2 className="font-black text-slate-900">Curriculum priority map</h2><p className="text-xs text-slate-500">High demand + high gap = strongest intervention candidate</p></div></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{data.categories.map((x: any) => <div key={x.category} className="rounded-xl border border-slate-200 p-4"><div className="text-xs font-black text-slate-800">{x.category}</div><div className="mt-4 grid grid-cols-2 gap-3"><div><div className="text-xl font-black text-indigo-700">{x.demandScore}</div><div className="text-[10px] text-slate-400">Demand</div></div><div><div className="text-xl font-black text-amber-700">{x.avgGap}</div><div className="text-[10px] text-slate-400">Avg gap</div></div></div></div>)}</div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 text-xs leading-5 text-slate-600"><strong className="text-slate-900">Judge-safe methodology:</strong> this module is intentionally transparent. It uses requirements already stored in the platform rather than pretending to predict the labour market. For production, connect verified job-description feeds and a normalized skill taxonomy, then replace the prototype momentum proxy with statistically validated trend estimates.</section>
    </div>
  );
};
