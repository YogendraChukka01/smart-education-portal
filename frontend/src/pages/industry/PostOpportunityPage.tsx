import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Layers,
  Building2,
} from 'lucide-react';
import {
  OPPORTUNITY_TYPES,
  AUDIENCE_TYPES,
  ENGINEERING_DEPARTMENTS,
  ENGINEERING_BRANCHES,
} from '@ayush-portal/shared';

export const PostOpportunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [taxonomySkills, setTaxonomySkills] = useState<any[]>([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>(OPPORTUNITY_TYPES.INTERNSHIP);
  const [workMode, setWorkMode] = useState('Hybrid');
  const [location, setLocation] = useState('');
  const [stipendOrSalary, setStipendOrSalary] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [minCgpa, setMinCgpa] = useState(6.5);
  const [audience, setAudience] = useState<string>(AUDIENCE_TYPES.STUDENT);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  // Eligible Branches
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    'Computer Science & Engineering',
    'Artificial Intelligence & Machine Learning',
  ]);

  // Required Skills List
  const [requiredSkills, setRequiredSkills] = useState<
    { skillId: string; level: number; weight: number }[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  const fetchTaxonomy = async () => {
    try {
      const res = await api.get('/skills/taxonomy');
      setTaxonomySkills(res.data.skills || []);
      if (res.data.skills?.length >= 2) {
        setRequiredSkills([
          { skillId: res.data.skills[0].id, level: 75, weight: 5 },
          { skillId: res.data.skills[1].id, level: 70, weight: 4 },
        ]);
      }
    } catch (err) {
      console.error('Failed to load skill taxonomy:', err);
    } finally {
      setLoadingTaxonomy(false);
    }
  };

  const handleAddSkillRow = () => {
    if (taxonomySkills.length === 0) return;
    const available = taxonomySkills.find(
      (s) => !requiredSkills.some((r) => r.skillId === s.id)
    );
    setRequiredSkills([
      ...requiredSkills,
      { skillId: available ? available.id : taxonomySkills[0].id, level: 70, weight: 3 },
    ]);
  };

  const handleRemoveSkillRow = (index: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, field: string, value: any) => {
    const updated = [...requiredSkills];
    updated[index] = { ...updated[index], [field]: value };
    setRequiredSkills(updated);
  };

  const handleToggleBranch = (branchName: string) => {
    if (selectedBranches.includes(branchName)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branchName));
    } else {
      setSelectedBranches([...selectedBranches, branchName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      setError('Please specify at least one required skill requirement.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/opportunities', {
        title,
        type,
        workMode,
        location,
        stipendOrSalary,
        durationWeeks: Number(durationWeeks),
        minCgpa: Number(minCgpa),
        eligibleBranches: selectedBranches,
        eligibleDepartments: [],
        audience,
        description,
        deadline: deadline || undefined,
        requiredSkills,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/industry/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post opportunity.');
    } finally {
      setSubmitting(false);
    }
  };

  const allBranchesList = Object.values(ENGINEERING_BRANCHES).flat();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Briefcase className="w-4 h-4" />
          <span>Talent Requisition Form</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Post Industry Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Define required skills, weights, eligible branches, and minimum CGPA criteria for deterministic candidate ranking.
        </p>
      </div>

      {success ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Opportunity Posted Successfully!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your posting is now live on the student and college placement portal. Redirecting to recruiter dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. Basic Opportunity Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Java Backend Engineering Intern"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Opportunity Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value={OPPORTUNITY_TYPES.INTERNSHIP}>Internship</option>
                  <option value={OPPORTUNITY_TYPES.JOB}>Full-Time Job (Campus Placement)</option>
                  <option value={OPPORTUNITY_TYPES.PROGRAM}>Specialized Industry Program</option>
                  <option value={OPPORTUNITY_TYPES.FDP}>Faculty Development Program (FDP)</option>
                  <option value={OPPORTUNITY_TYPES.RESEARCH}>Joint Research Grant</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra / Bengaluru"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stipend / Annual CTC</label>
                <input
                  type="text"
                  required
                  value={stipendOrSalary}
                  onChange={(e) => setStipendOrSalary(e.target.value)}
                  placeholder="e.g. ₹28,000 / month or ₹9.5 LPA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Weeks)</label>
                <input
                  type="number"
                  min="1"
                  max="104"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum CGPA Requirement</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Detailed Description & Responsibilities</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline key deliverables, tech stack, and responsibilities..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Target Engineering Branches */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. Eligible Engineering Branches
            </h2>
            <p className="text-xs text-slate-500">
              Select all branches eligible for this requisition. The matching algorithm will prioritize candidates accordingly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
              {allBranchesList.map((branch) => {
                const isSelected = selectedBranches.includes(branch);
                return (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => handleToggleBranch(branch)}
                    className={`p-3 rounded-xl text-left text-xs font-semibold transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{branch}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Required Skill Weights & Proficiency Sliders */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">3. Required Skills & Importance Weights</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used by the deterministic matching engine: MatchScore = Σ min(S_i, R_i) * W_i / Σ (R_i * W_i)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSkillRow}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors border border-slate-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {requiredSkills.map((req, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Skill</label>
                      <select
                        value={req.skillId}
                        onChange={(e) => handleSkillChange(idx, 'skillId', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none"
                      >
                        {taxonomySkills.map((sk) => (
                          <option key={sk.id} value={sk.id}>
                            {sk.name} ({sk.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Min Level: <strong className="text-blue-700">{req.level}%</strong>
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={req.level}
                        onChange={(e) => handleSkillChange(idx, 'level', Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Weight: <strong className="text-amber-700">{req.weight}x</strong>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={req.weight}
                        onChange={(e) => handleSkillChange(idx, 'weight', Number(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillRow(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/industry/dashboard')}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Publish Opportunity Posting</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
