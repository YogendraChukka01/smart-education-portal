import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  BookOpen,
  Building2,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { OPPORTUNITY_TYPES } from '@ayush-portal/shared';

export const AcademicianOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedSuccessId, setAppliedSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetchFacultyOpportunities();
  }, []);

  const fetchFacultyOpportunities = async () => {
    try {
      const res = await api.get('/opportunities?audience=academician');
      setOpportunities(res.data.opportunities || []);
    } catch (err) {
      console.error('Failed to load faculty opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (oppId: string) => {
    setApplyingId(oppId);
    try {
      await api.post('/applications/apply', {
        opportunityId: oppId,
        coverNote: 'Faculty expression of interest for FDP / Research Collaboration.',
      });
      setAppliedSuccessId(oppId);
    } catch (err) {
      console.error('Failed to submit application:', err);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Faculty Enrichment & Research Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          FDPs, Industrial Training & Research Grants
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Explore sponsored faculty development programs, corporate sabbatical consultancies, and joint research grants with tech leaders.
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading faculty opportunities...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No active faculty programs at this moment</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            New corporate FDPs and academic grants are posted regularly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {opp.type}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{opp.title}</h2>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.company?.name || 'Industry Partner'}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {opp.location} ({opp.workMode || 'Onsite'})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {opp.durationWeeks} Weeks
                  </span>
                  <span className="font-bold text-emerald-800">{opp.stipendOrSalary}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Eligible: <strong>All Engineering Faculty</strong>
                </span>

                {appliedSuccessId === opp.id ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Expression Submitted
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(opp.id)}
                    disabled={applyingId === opp.id}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    {applyingId === opp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Express Interest</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
