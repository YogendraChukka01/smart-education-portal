import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  Building2,
} from 'lucide-react';
import { ENGINEERING_DEPARTMENTS } from '@ayush-portal/shared';

export const RosterPage: React.FC = () => {
  const [rosterData, setRosterData] = useState<{ students: any[]; academicians: any[] }>({
    students: [],
    academicians: [],
  });
  const [activeTab, setActiveTab] = useState<'students' | 'faculty'>('students');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoster(deptFilter);
  }, [deptFilter]);

  const fetchRoster = async (dept?: string) => {
    try {
      const url = dept && dept !== 'all' ? `/analytics/roster?department=${dept}` : '/analytics/roster';
      const res = await api.get(url);
      setRosterData(res.data);
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = rosterData.students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.branchName?.toLowerCase().includes(search.toLowerCase()) ||
      s.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFaculty = rosterData.academicians.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Institutional Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Student Scholar & Faculty Roster
          </h1>
          <p className="text-xs text-slate-500">
            Searchable student and faculty records with verified assessment scores, CGPA, and digital portfolios.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white outline-none w-full sm:w-auto"
          >
            <option value="all">All Departments</option>
            {ENGINEERING_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, branch..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-200/70 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-blue-700" />
          <span>Student Scholars ({rosterData.students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'faculty'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-700" />
          <span>Academic Faculty ({rosterData.academicians.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading roster directory...</p>
        </div>
      ) : activeTab === 'students' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Student Scholar</th>
                  <th className="py-3 px-4">Branch & Semester</th>
                  <th className="py-3 px-4 text-center">CGPA</th>
                  <th className="py-3 px-4 text-center">Assessment Status</th>
                  <th className="py-3 px-4 text-center">Average Skill Score</th>
                  <th className="py-3 px-4 text-right">Digital Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="font-semibold">{s.branchName || s.departmentName}</div>
                      <div className="text-[11px] text-slate-500">Year {s.year} • Sem {s.semester || 6}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {s.cgpa || 8.5}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {s.assessed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Assessed ({s.skillsCount} Skills)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-800">
                      {s.averageSkillScore}%
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {s.portfolioSlug && (
                        <a
                          href={`/portfolio/${s.portfolioSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          Portfolio <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Expertise Domains</th>
                  <th className="py-3 px-4 text-center">Hosted Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredFaculty.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{f.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-blue-800 font-semibold">{f.department}</td>

                    <td className="py-3.5 px-4 text-slate-600">{f.designation || 'Faculty'}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {f.expertiseTags?.map((tag: string) => (
                          <span key={tag} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-800">
                      {f.eventsHostedCount} Sessions
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
