import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Briefcase,
  Search,
  Filter,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Loader2,
  Sparkles,
  Award,
} from 'lucide-react';
import { OPPORTUNITY_TYPES, ENGINEERING_BRANCHES } from '@ayush-portal/shared';

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply Modal state
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, [typeFilter, workModeFilter, searchQuery]);

  const fetchOpportunities = async () => {
    try {
      // Fetch recommendations to get dynamic match scores calculated for logged in student
      const res = await api.get('/opportunities/recommendations');
      let list = res.data.recommendations || [];

      if (typeFilter !== 'all') {
        list = list.filter((o: any) => o.type === typeFilter);
      }
      if (workModeFilter !== 'all') {
        list = list.filter((o: any) => o.workMode === workModeFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (o: any) =>
            o.title.toLowerCase().includes(q) ||
            o.description.toLowerCase().includes(q) ||
            o.company?.name?.toLowerCase().includes(q) ||
            o.location.toLowerCase().includes(q)
        );
      }

      setOpportunities(list);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedOpp) return;
    setApplying(true);
    setApplyError(null);
    try {
      await api.post('/applications/apply', {
        opportunityId: selectedOpp.id,
        coverNote,
      });
      setApplySuccess('Application submitted successfully! Track status in My Applications.');
      setTimeout(() => {
        setSelectedOpp(null);
        setApplySuccess(null);
        setCoverNote('');
      }, 1800);
    } catch (err: any) {
      setApplyError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Briefcase className="w-4 h-4" />
          <span>Industry Opportunities Marketplace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verified Internships & Placement Openings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover high-compatibility roles ranked automatically by weighted skill overlap, department eligibility, and minimum CGPA criteria.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, skills..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white outline-none"
          >
            <option value="all">All Opportunities</option>
            <option value={OPPORTUNITY_TYPES.INTERNSHIP}>Internships Only</option>
            <option value={OPPORTUNITY_TYPES.JOB}>Full-Time Placement Jobs</option>
            <option value={OPPORTUNITY_TYPES.PROGRAM}>Specialized Programs</option>
          </select>

          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white outline-none"
          >
            <option value="all">All Work Modes</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Matching opportunities for your skill profile...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No matching opportunities found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or work mode filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {opp.type}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                      {opp.title}
                    </h2>
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opp.company?.name || 'Engineering Recruiter'}</span>
                    </p>
                  </div>

                  {/* Match Score Badge */}
                  <div className="text-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 min-w-[70px]">
                    <div className="text-lg font-black text-emerald-700 leading-none">
                      {opp.matchScorePct}%
                    </div>
                    <div className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                      Match
                    </div>
                  </div>
                </div>

                {/* Metadata Strip */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {opp.location} ({opp.workMode})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {opp.durationWeeks} Weeks
                  </span>
                  <span className="font-bold text-slate-900">{opp.stipendOrSalary}</span>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                {/* Required Skills Tags */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-500">Key Required Skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.requiredSkills?.map((sk: any) => (
                      <span
                        key={sk.skillName || sk.skillId}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200"
                      >
                        {sk.skillName} ({sk.level}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Min CGPA: <strong>{opp.minCgpa || 6.0}</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedOpp(opp);
                    setApplySuccess(null);
                    setApplyError(null);
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  View Details & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explainable Match & Apply Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {selectedOpp.type}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">{selectedOpp.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedOpp.company?.name} • {selectedOpp.location}</p>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explainable Match Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Match Compatibility Breakdown</span>
                <span className="text-sm font-black text-emerald-700 font-mono">
                  {selectedOpp.matchScorePct}% Overall
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="font-bold text-blue-700">
                    {selectedOpp.matchExplanation?.skillMatchPct ?? selectedOpp.matchScorePct}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Skill Overlap</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="font-bold text-emerald-700">
                    {selectedOpp.matchExplanation?.branchMatchPct ?? 100}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Branch Match</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="font-bold text-purple-700">
                    {selectedOpp.matchExplanation?.eligibilityMatchPct ?? 100}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">CGPA Eligibility</div>
                </div>
              </div>
            </div>

            {/* Full Job Description */}
            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <div className="font-bold text-slate-900">Role Overview:</div>
              <p>{selectedOpp.description}</p>
            </div>

            {/* Cover Note */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Cover Note / Message to Recruiter (Optional):
              </label>
              <textarea
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Highlight your technical strengths and relevant project links..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            {applySuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{applySuccess}</span>
              </div>
            )}

            {applyError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>{applyError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !!applySuccess}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-60"
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
