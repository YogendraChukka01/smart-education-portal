import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  GraduationCap,
  Building2,
  Mail,
  Github,
  Linkedin,
  FileText,
  Edit3,
  CheckCircle2,
  Award,
  Layers,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { ProfilePhotoUpload } from '../../components/common/ProfilePhotoUpload';
import { ENGINEERING_DEPARTMENTS, ENGINEERING_BRANCHES } from '@ayush-portal/shared';

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    degree: 'B.Tech',
    departmentName: 'Computer Science & Engineering',
    branchName: 'Computer Science & Engineering',
    year: 3,
    semester: 6,
    cgpa: 8.5,
    graduationYear: 2026,
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    resumeUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/skills/profile');
      setProfileData(res.data);
      if (res.data.student) {
        setFormData({
          name: res.data.student.name || '',
          degree: res.data.student.degree || 'B.Tech',
          departmentName: res.data.student.departmentName || 'Computer Science & Engineering',
          branchName: res.data.student.branchName || 'Computer Science & Engineering',
          year: res.data.student.year || 3,
          semester: res.data.student.semester || 6,
          cgpa: res.data.student.cgpa || 8.5,
          graduationYear: res.data.student.graduationYear || 2026,
          bio: res.data.student.bio || '',
          githubUrl: res.data.student.githubUrl || '',
          linkedinUrl: res.data.student.linkedinUrl || '',
          resumeUrl: res.data.student.resumeUrl || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', formData);
      await refreshUserProfile();
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  const { student, skills = [], topStrengths = [] } = profileData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <ProfilePhotoUpload
              currentAvatarUrl={student?.avatarUrl || user?.avatarUrl}
              shape="rounded"
              size="lg"
              onPhotoUpdated={() => {
                fetchProfile();
                if (refreshUserProfile) refreshUserProfile();
              }}
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {student?.name || 'Roshan Shinde'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{student?.institutionName || 'Verified Scholar'}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                {student?.degree} in {student?.branchName}
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{student?.institutionName || 'Audisankara University'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Academic Details</span>
            </button>
            <a
              href={`/portfolio/${student?.portfolioSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-300 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Portfolio</span>
            </a>
          </div>
        </div>

        {student?.bio && (
          <p className="mt-6 pt-5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {student?.bio}
          </p>
        )}
      </div>

      {/* Grid: Academic Info & Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Academic Details */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span>Academic Information</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Department</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.departmentName}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Branch / Program</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.branchName}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Academic Year & Sem</span>
              <div className="font-bold text-slate-900 mt-0.5">
                Year {student?.year} • Semester {student?.semester}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Cumulative CGPA</span>
              <div className="font-bold text-emerald-700 mt-0.5 text-sm">{student?.cgpa} / 10.0</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Graduation Year</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.graduationYear || 2026}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Email</span>
              <div className="font-bold text-slate-900 mt-0.5 truncate">{student?.email}</div>
            </div>
          </div>
        </div>

        {/* Links & Professional Handles */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-700" />
            <span>Professional Profiles & Resume</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Github className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-800">GitHub Profile</span>
              </div>
              {student?.githubUrl ? (
                <a
                  href={student.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
                >
                  {student.githubUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Linkedin className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-slate-800">LinkedIn Profile</span>
              </div>
              {student?.linkedinUrl ? (
                <a
                  href={student.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
                >
                  {student.linkedinUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-800">Uploaded Resume</span>
              </div>
              <span className="text-emerald-700 font-semibold">Resume_Verified.pdf</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Skills Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Assessed & Verified Skills</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proficiency scores established through standardized assessments and portfolio validations.
            </p>
          </div>
          <Link
            to="/student/assessment"
            className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors border border-blue-200"
          >
            Take Assessment
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {skills.map((sk: any) => (
            <div
              key={sk.skillId}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-slate-900">{sk.skillName}</div>
                <div className="text-[10px] text-slate-500">{sk.category}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {sk.score}%
                </span>
                {sk.score >= 75 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Academic & Profile Information</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Degree Program</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentName}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const branches = ENGINEERING_BRANCHES[newDept] || [newDept];
                      setFormData({
                        ...formData,
                        departmentName: newDept,
                        branchName: branches[0],
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {ENGINEERING_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch / Specialization</label>
                  <select
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {(ENGINEERING_BRANCHES[formData.departmentName] || [formData.departmentName]).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CGPA (out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    min="2024"
                    max="2030"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bio / Career Goal</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summarize your engineering interests and career focus..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
