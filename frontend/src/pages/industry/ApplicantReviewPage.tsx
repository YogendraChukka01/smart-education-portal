import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Users,
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Loader2,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { APPLICATION_STATUS } from '@ayush-portal/shared';

export const ApplicantReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOppId = searchParams.get('oppId');

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>(initialOppId || '');
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Status update modal state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>(APPLICATION_STATUS.SHORTLISTED);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPostings();
  }, []);

  useEffect(() => {
    if (selectedOppId) {
      fetchApplicants(selectedOppId);
    }
  }, [selectedOppId]);

  const fetchPostings = async () => {
    try {
      const res = await api.get('/opportunities');
      const list = res.data.opportunities || [];
      setOpportunities(list);
      if (!selectedOppId && list.length > 0) {
        setSelectedOppId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoadingOpps(false);
    }
  };

  const fetchApplicants = async (oppId: string) => {
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/applications/opportunity/${oppId}`);
      setApplicants(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await api.patch(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        notes,
      });
      await fetchApplicants(selectedOppId);
      setSelectedApp(null);
      setNotes('');
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case APPLICATION_STATUS.SELECTED:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Selected / Offer
          </span>
        );
      case APPLICATION_STATUS.INTERVIEW:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Interview
          </span>
        );
      case APPLICATION_STATUS.SHORTLISTED:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            Shortlisted
          </span>
        );
      case APPLICATION_STATUS.REJECTED:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Applied
          </span>
        );
    }
  };

  const activeOpp = opportunities.find((o) => o.id === selectedOppId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Candidate Compatibility Ranker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Applicant Screening & Stage Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Candidates ranked automatically by deterministic skill overlap, branch alignment, and CGPA compatibility.
          </p>
        </div>

        {/* Opportunity Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="text-xs font-bold text-slate-700 whitespace-nowrap">Opportunity:</div>
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="w-full md:w-80 px-3 py-2 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title} ({opp.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Opportunity Info Strip */}
      {activeOpp && (
        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-blue-900">{activeOpp.title}</span>
            <div className="text-slate-600">
              Location: {activeOpp.location} ({activeOpp.workMode}) • Stipend: {activeOpp.stipendOrSalary} • Min CGPA: {activeOpp.minCgpa || 6.0}
            </div>
          </div>
          <div className="font-bold text-blue-800 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
            {applicants.length} Total Applicants
          </div>
        </div>
      )}

      {/* Applicants Table */}
      {loadingApplicants ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Ranking candidates by compatibility...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No applications received yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Candidates who apply to this posting will be ranked here by their verified skill match score.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Candidate Scholar</th>
                  <th className="py-3 px-4">Branch & Semester</th>
                  <th className="py-3 px-4 text-center">CGPA</th>
                  <th className="py-3 px-4 text-center">Compatibility Match</th>
                  <th className="py-3 px-4 text-center">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {applicants.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.candidateName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.branchName || app.degreeOrDept}</div>
                      <div className="text-[11px] text-slate-500">Year {app.year || 3} (Sem {app.semester || 6})</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {app.cgpa || 8.5}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono">
                        <span>{app.matchScorePct}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">{getStatusBadge(app.status)}</td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {app.portfolioSlug && (
                        <a
                          href={`/portfolio/${app.portfolioSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-200"
                        >
                          Portfolio <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setNewStatus(app.status);
                          setNotes('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-2xs"
                      >
                        <span>Review & Advance</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Advance Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Review Candidate: {selectedApp.candidateName}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedApp.branchName} • Match: {selectedApp.matchScorePct}%</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Cover Note */}
            {selectedApp.coverNote && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-700">Candidate Statement:</span>
                <p className="text-slate-600 leading-relaxed italic">"{selectedApp.coverNote}"</p>
              </div>
            )}

            {/* Stage Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Advance Candidate Stage:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={APPLICATION_STATUS.APPLIED}>Applied (Screening)</option>
                <option value={APPLICATION_STATUS.SHORTLISTED}>Shortlisted for Assessment</option>
                <option value={APPLICATION_STATUS.ASSESSMENT}>Online Coding Assessment</option>
                <option value={APPLICATION_STATUS.INTERVIEW}>Technical Interview Scheduled</option>
                <option value={APPLICATION_STATUS.SELECTED}>Selected / Final Offer</option>
                <option value={APPLICATION_STATUS.REJECTED}>Reject Application</option>
              </select>
            </div>

            {/* Recruiter Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Feedback / Interview Notes:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Strong in Java & SQL, schedule Round 1 Technical Interview for Thursday."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Update Hiring Stage</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
