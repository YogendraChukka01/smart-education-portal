import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  BookOpen,
  FlaskConical,
  Award,
  Linkedin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Building2,
  FileText,
} from 'lucide-react';
import { ENGINEERING_DEPARTMENTS, ENGINEERING_BRANCHES_ALL } from '@ayush-portal/shared';
import { ProfilePhotoUpload } from '../../components/common/ProfilePhotoUpload';

export const FacultyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [branch, setBranch] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [specialization, setSpecialization] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [publications, setPublications] = useState('');
  const [labExpertise, setLabExpertise] = useState('');
  const [expertiseTags, setExpertiseTags] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [orcidUrl, setOrcidUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      const p = res.data.user?.academicianProfile;
      if (p) {
        setName(p.name || '');
        setDesignation(p.designation || 'Professor');
        setDepartment(p.department || 'Computer Science & Engineering');
        setBranch(p.branch || 'Computer Science & Engineering');
        setExperienceYears(p.experienceYears || 10);
        setSpecialization(p.specialization || '');
        setBio(p.bio || '');
        setPhone(p.phone || '');
        setAvatarUrl(p.avatarUrl || null);
        setLinkedinUrl(p.linkedinUrl || '');
        setOrcidUrl(p.orcidUrl || '');

        try {
          setResearchInterests(Array.isArray(JSON.parse(p.researchInterests || '[]')) ? JSON.parse(p.researchInterests).join('\n') : p.researchInterests || '');
        } catch {
          setResearchInterests(p.researchInterests || '');
        }

        try {
          setPublications(Array.isArray(JSON.parse(p.publications || '[]')) ? JSON.parse(p.publications).join('\n') : p.publications || '');
        } catch {
          setPublications(p.publications || '');
        }

        try {
          setLabExpertise(Array.isArray(JSON.parse(p.labExpertise || '[]')) ? JSON.parse(p.labExpertise).join(', ') : p.labExpertise || '');
        } catch {
          setLabExpertise(p.labExpertise || '');
        }

        try {
          setExpertiseTags(Array.isArray(JSON.parse(p.expertiseTags || '[]')) ? JSON.parse(p.expertiseTags).join(', ') : p.expertiseTags || '');
        } catch {
          setExpertiseTags(p.expertiseTags || '');
        }
      }
    } catch (err) {
      console.error('Failed to load faculty profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    const payload = {
      name,
      designation,
      department,
      branch,
      experienceYears: Number(experienceYears),
      specialization,
      researchInterests: researchInterests.split('\n').filter((s) => s.trim()),
      publications: publications.split('\n').filter((s) => s.trim()),
      labExpertise: labExpertise.split(',').map((s) => s.trim()).filter(Boolean),
      expertiseTags: expertiseTags.split(',').map((s) => s.trim()).filter(Boolean),
      bio,
      phone,
      avatarUrl,
      linkedinUrl,
      orcidUrl,
    };

    try {
      await api.put('/auth/profile', payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update faculty profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Faculty Academic & Research Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Faculty Profile & Research Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Update your academic designations, research publications, lab expertise, and areas of mentorship. All updates persist directly to the institution directory.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading faculty profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          {savedSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Faculty profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Academic Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              1. Basic & Institutional Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name & Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Anjali Joshi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Designation *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Professor & Head of Department"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                >
                  {ENGINEERING_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch Specialization</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                >
                  {ENGINEERING_BRANCHES_ALL.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teaching & Research Experience (Years)</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-2">Faculty Profile Photo</label>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <ProfilePhotoUpload
                  currentAvatarUrl={avatarUrl || user?.avatarUrl}
                  shape="rounded"
                  size="md"
                  onPhotoUpdated={(newUrl) => setAvatarUrl(newUrl)}
                />
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p className="font-semibold text-slate-800">Upload Formal Faculty Photo</p>
                  <p>JPG, JPEG, PNG, or WEBP up to 5 MB.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Research & Lab Specialization */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              2. Research Domains, Publications & Lab Expertise
            </h2>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Research Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Distributed Cloud Architecture, Fault-Tolerant Microservices"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Key Publications & Patents (1 per line)</label>
              <textarea
                rows={3}
                value={publications}
                onChange={(e) => setPublications(e.target.value)}
                placeholder="Scalable Transaction Management in Multi-Cloud Microservices (IEEE Trans. 2024)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lab Expertise & Research Centers (comma-separated)</label>
              <input
                type="text"
                value={labExpertise}
                onChange={(e) => setLabExpertise(e.target.value)}
                placeholder="e.g. High Performance Computing Lab, Cloud & IoT Research Center"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Core Expertise Tags for Mentorship (comma-separated)</label>
              <input
                type="text"
                value={expertiseTags}
                onChange={(e) => setExpertiseTags(e.target.value)}
                placeholder="e.g. Distributed Systems, Cloud Architecture, Java Microservices"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Faculty Bio & Mentorship Philosophy</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Senior Professor & HOD of Computer Engineering. Guiding undergraduate scholars in distributed cloud systems..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Social & Contact Links */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              3. Online Verification & Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ORCID / Google Scholar</label>
                <input
                  type="url"
                  value={orcidUrl}
                  onChange={(e) => setOrcidUrl(e.target.value)}
                  placeholder="https://orcid.org/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 20 2550 7000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Faculty Profile</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
