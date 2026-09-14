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
  Phone,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

export const InstitutionSettingsPage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [placementOfficerName, setPlacementOfficerName] = useState('');
  const [placementOfficerEmail, setPlacementOfficerEmail] = useState('');
  const [placementOfficerPhone, setPlacementOfficerPhone] = useState('');

  useEffect(() => {
    fetchInstitutionData();
  }, []);

  const fetchInstitutionData = async () => {
    try {
      const res = await api.get('/auth/institution');
      const inst = res.data.institution;
      if (inst) {
        setName(inst.name || '');
        setCode(inst.code || '');
        setType(inst.type || '');
        setLocation(inst.location || '');
        setAddress(inst.address || '');
        setWebsite(inst.website || '');
        setLogoUrl(inst.logoUrl || null);
        setPlacementOfficerName(inst.placementOfficerName || '');
        setPlacementOfficerEmail(inst.placementOfficerEmail || '');
        setPlacementOfficerPhone(inst.placementOfficerPhone || '');
      }
    } catch (err) {
      console.error('Failed to load institution settings:', err);
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
        code,
        type,
        location,
        address,
        website,
        logoUrl,
        placementOfficerName,
        placementOfficerEmail,
        placementOfficerPhone,
      });

      if (refreshUserProfile) await refreshUserProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update institution settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading institution profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>Institutional Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Institution Profile & Branding Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your college name, official code, campus location, placement office credentials, and institutional logo. Changes dynamically update across all student dashboards, alumni networks, portfolios, and reports.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Institution settings saved successfully! All campus portals and reports have been updated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Institution Logo Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-700" />
            <span>Institution Logo & Insignia</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <ProfilePhotoUpload
              currentAvatarUrl={logoUrl}
              shape="rounded"
              size="lg"
              onPhotoUpdated={(newUrl) => setLogoUrl(newUrl)}
            />
            <div className="space-y-1 text-xs text-slate-500 text-center sm:text-left">
              <p className="font-semibold text-slate-800">Upload Official College Emblem / Logo</p>
              <p>Supported formats: JPG, JPEG, PNG, or WEBP (Max 5 MB).</p>
              <p>The institution logo is displayed on the public digital portfolios, placement certificates, and official NAAC reports.</p>
            </div>
          </div>
        </div>

        {/* Core College Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
            <span>Core College Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                College / Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Audisankara University"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Institution Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. MITAOE-PUN-01"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Institution Classification / Type
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. Autonomous Engineering College affiliated to SPPU (NAAC A+)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Audisankara, Nellore, Andhra Pradesh"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. https://mitaoe.ac.in"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Campus Postal Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Audisankara, Gudur, SPSR Nellore District, Andhra Pradesh"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Training & Placement Officer Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-700" />
            <span>Placement Office Contact Info</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                TPO / Dean Name
              </label>
              <input
                type="text"
                value={placementOfficerName}
                onChange={(e) => setPlacementOfficerName(e.target.value)}
                placeholder="e.g. Dr. Vivek S. Patil"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Placement Email
              </label>
              <input
                type="email"
                value={placementOfficerEmail}
                onChange={(e) => setPlacementOfficerEmail(e.target.value)}
                placeholder="e.g. tpo@mitaoe.ac.in"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Placement Phone
              </label>
              <input
                type="tel"
                value={placementOfficerPhone}
                onChange={(e) => setPlacementOfficerPhone(e.target.value)}
                placeholder="e.g. +91 20 3025 3500"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 btn-brand text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save Institution Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
