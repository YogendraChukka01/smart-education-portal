import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Award,
  CheckCircle2,
  Building2,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Printer,
  ArrowLeft,
  Loader2,
  Github,
  Linkedin,
} from 'lucide-react';

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      try {
        const res = await api.get(`/portfolio/public/${slug}`);
        setData(res.data);
      } catch (err: any) {
        setError('Portfolio not found or private.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Verifying digital portfolio credentials...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <Award className="w-12 h-12 text-slate-300 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Portfolio Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm">
          The requested public digital portfolio identifier "{slug}" could not be verified on the portal.
        </p>
        <Link to="/" className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold">
          Return to Home
        </Link>
      </div>
    );
  }

  const { student, institutionName, skills, portfolioItems, stats } = data;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Action bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>

        {/* Portfolio Card Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-blue-700 border-2 border-blue-400/40 flex items-center justify-center text-2xl font-black shadow-lg">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{student.name}</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Verified Scholar
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-semibold">
                    {student.degree} in {student.branchName || 'Computer Science & Engineering'} (Year {student.year})
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> {institutionName} • CGPA: {student.cgpa || 8.6}
                  </p>
                </div>
              </div>

              {/* Verification Seal */}
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center font-mono text-[11px] space-y-1">
                <div className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> VERIFIED CREDENTIALS
                </div>
                <div className="text-slate-300 text-[10px]">ID: EDU-INST-{student.portfolioSlug.slice(0, 12)}</div>
              </div>
            </div>

            {student.bio && (
              <p className="mt-6 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "{student.bio}"
              </p>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-center">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-blue-700">{stats.verifiedSkillsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Verified Skills</div>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-slate-800">{stats.projectsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Engineering Projects</div>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-slate-800">{stats.certificatesCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Certifications</div>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-emerald-700">{stats.internshipsCompletedCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Internship Rotations</div>
            </div>
          </div>

          {/* Verified Skills Section */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" /> Assessed & Verified Skill Proficiencies
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against the standardized engineering taxonomy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((sk: any) => (
                <div
                  key={sk.skillName}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{sk.skillName}</div>
                    <div className="text-[10px] text-slate-400">{sk.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {sk.score}%
                    </span>
                    {sk.score >= 75 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Credentials & Projects */}
          <div className="p-6 sm:p-8 border-t border-slate-100 space-y-6 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" /> Projects & Credentials ({portfolioItems.length})
              </h2>
            </div>

            <div className="space-y-4">
              {portfolioItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                    <p className="text-xs text-blue-700 font-semibold mt-0.5">Issuer: {item.issuer}</p>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Seal */}
          <div className="p-6 bg-slate-900 text-slate-300 text-center text-xs space-y-1">
            <p className="font-bold text-white">{institutionName} • Training & Placement Cell</p>
            <p className="text-slate-400 text-[11px]">
              Verifiable Online Academic Portfolio • Smart India Hackathon (Problem Statement ID 26044)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
