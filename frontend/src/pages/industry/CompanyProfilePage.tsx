import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ProfilePhotoUpload } from '../../components/common/ProfilePhotoUpload';
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  MapPin,
  Mail,
  User,
  Layers,
  Briefcase,
} from 'lucide-react';

export const CompanyProfilePage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [industryType, setIndustryType] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [hiringDomains, setHiringDomains] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const res = await api.get('/auth/me');
      const comp = res.data.user?.company;
      if (comp) {
        setName(comp.name || '');
        setIndustryType(comp.industryType || '');
        setDescription(comp.description || '');
        setWebsite(comp.website || '');
        setLocation(comp.location || '');
        setCompanySize(comp.companySize || '');
        setRecruiterName(comp.recruiterName || '');
        setRecruiterEmail(comp.recruiterEmail || '');
        setLogoUrl(comp.logoUrl || null);
        try {
          setHiringDomains(
            Array.isArray(JSON.parse(comp.hiringDomains || '[]'))
              ? JSON.parse(comp.hiringDomains).join(', ')
              : comp.hiringDomains || ''
          );
        } catch {
          setHiringDomains(comp.hiringDomains || '');
        }
      }
    } catch (err) {
      console.error('Failed to load company profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.put('/auth/profile', {
        name,
        industryType,
        description,
        website,
        location,
        companySize,
        recruiterName,
        recruiterEmail,
        logoUrl,
        hiringDomains: hiringDomains.split(',').map((s) => s.trim()).filter(Boolean),
      });

      if (refreshUserProfile) await refreshUserProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>Industry Partner Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Company Profile & Corporate Logo
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your organization's recruiting profile, official corporate logo, hiring domains, and recruiter credentials. Your logo appears automatically on campus opportunity postings and candidate ranker evaluation screens.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Company profile and corporate logo updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Logo Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>Company Logo</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <ProfilePhotoUpload
              currentAvatarUrl={logoUrl}
              shape="rounded"
              size="lg"
              onPhotoUpdated={(newUrl) => setLogoUrl(newUrl)}
            />
            <div className="space-y-1 text-xs text-slate-500 text-center sm:text-left">
              <p className="font-semibold text-slate-800">Upload High-Resolution Corporate Logo</p>
              <p>Supported formats: JPG, JPEG, PNG, or WEBP (Max 5 MB).</p>
              <p>Displayed on campus opportunity postings, candidate application cards, and placement results.</p>
            </div>
          </div>
        </div>

        {/* Company Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-700" />
            <span>Corporate Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Company / Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tata Consultancy Services (TCS Digital Labs)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Industry Sector / Domain
              </label>
              <input
                type="text"
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                placeholder="e.g. Enterprise Software & Cloud Solutions"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Company Scale / Size
              </label>
              <input
                type="text"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="e.g. 100,000+ employees"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Location / Work Hubs
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, Bengaluru, Hyderabad, India"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Corporate Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. https://www.tcs.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                About Company
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your company, technical engineering culture, and work environment..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Active Hiring Domains (comma-separated)
              </label>
              <input
                type="text"
                value={hiringDomains}
                onChange={(e) => setHiringDomains(e.target.value)}
                placeholder="e.g. Cloud Architecture, Java Microservices, Full Stack, AI/ML, Embedded Systems"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Recruiter Contact Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            <span>Campus Talent Acquisition Lead</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Recruiter / Lead Name
              </label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Anand Kulkarni"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Recruiter Work Email
              </label>
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="e.g. university.hiring@tcs.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Profile...' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
