import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Award,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Calendar,
  Sparkles,
  Loader2,
  X,
  Save,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { PORTFOLIO_ITEM_TYPES } from '@ayush-portal/shared';

export const PortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [type, setType] = useState<string>(PORTFOLIO_ITEM_TYPES.PROJECT);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/portfolio', {
        type,
        title,
        issuer,
        description,
        fileUrl: fileUrl || undefined,
      });
      await fetchPortfolio();
      setModalOpen(false);
      setTitle('');
      setIssuer('');
      setDescription('');
      setFileUrl('');
    } catch (err) {
      console.error('Failed to save portfolio item:', err);
    } finally {
      setSaving(false);
    }
  };

  const student = user?.studentProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Digital Credential Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Academic & Industry Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Showcase verified capstone projects, certifications, and hospital/industry internship completion records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project / Credential</span>
          </button>

          {student?.portfolioSlug && (
            <a
              href={`/portfolio/${student.portfolioSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-300 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Shareable Link</span>
            </a>
          )}
        </div>
      </div>

      {/* Shareable Link Banner */}
      {student?.portfolioSlug && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-blue-900">Your Shareable Public Digital Portfolio:</span>
            <div className="text-slate-600 font-mono">
              {window.location.origin}/portfolio/{student.portfolioSlug}
            </div>
          </div>
          <a
            href={`/portfolio/${student.portfolioSlug}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors whitespace-nowrap"
          >
            Open Public View
          </a>
        </div>
      )}

      {/* Portfolio Items Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading portfolio items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No portfolio items added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your engineering capstone projects, coding certifications, or internship records to enhance your recruiter visibility.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {item.type}
                  </span>
                  {item.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs font-semibold text-slate-600">Issuer / Organization: {item.issuer}</p>

                {item.description && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                  >
                    View Document <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Portfolio Credential / Project</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Credential Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value={PORTFOLIO_ITEM_TYPES.PROJECT}>Engineering Project / Capstone</option>
                  <option value={PORTFOLIO_ITEM_TYPES.CERTIFICATE}>Technical Certification (AWS, Oracle, etc.)</option>
                  <option value={PORTFOLIO_ITEM_TYPES.INTERNSHIP_COMPLETION}>Internship Completion Record</option>
                  <option value={PORTFOLIO_ITEM_TYPES.ACHIEVEMENT}>Hackathon / Academic Achievement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed E-Commerce Microservices Engine"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issuer / Host Organization</label>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services / MITAOE / TCS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Tech Stack</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the key technical deliverables and architecture..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Verification / Project URL (Optional)</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://github.com/project or certificate link"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save to Portfolio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
