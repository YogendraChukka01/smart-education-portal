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
  UserRound,
  Trophy,
  MapPin,
  Link2,
  Fingerprint,
  Globe2,
  HeartPulse,
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
    rollNumber: '',
    enrollmentNumber: '',
    phone: '',
    location: '',
    alternateEmail: '',
    address: '',
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'Indian',
    fatherName: '',
    motherName: '',
    leetcodeUrl: '',
    kaggleUrl: '',
    hackerrankUrl: '',
    portfolioWebsiteUrl: '',
    languagesText: '',
    interestsText: '',
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
          rollNumber: res.data.student.rollNumber || '',
          enrollmentNumber: res.data.student.enrollmentNumber || '',
          phone: res.data.student.phone || '',
          location: res.data.student.location || '',
          alternateEmail: res.data.student.alternateEmail || '',
          address: res.data.student.address || '',
          dateOfBirth: res.data.student.dateOfBirth || '',
          gender: res.data.student.gender || 'Male',
          nationality: res.data.student.nationality || 'Indian',
          fatherName: res.data.student.fatherName || '',
          motherName: res.data.student.motherName || '',
          leetcodeUrl: res.data.student.leetcodeUrl || '',
          kaggleUrl: res.data.student.kaggleUrl || '',
          hackerrankUrl: res.data.student.hackerrankUrl || '',
          portfolioWebsiteUrl: res.data.student.portfolioWebsiteUrl || '',
          languagesText: (res.data.student.languages || []).join(', '),
          interestsText: (res.data.student.interests || []).join(', '),
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
      const payload = {
        ...formData,
        languages: (formData.languagesText || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        interests: (formData.interestsText || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      delete (payload as any).languagesText;
      delete (payload as any).interestsText;
      await api.put('/auth/profile', payload);
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
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
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
                  {student?.name || 'Yogendra Chukka'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
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
              className="px-4 py-2 btn-brand text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
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
        {student?.careerGoal && (
          <p className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-bold text-slate-700">Career Goal:</span>
            <span className="min-w-0 flex-1">{student?.careerGoal}</span>
          </p>
        )}
      </div>

      {/* Grid: Academic Info & Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Academic Details */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-700" />
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
              <span className="text-slate-500 font-medium">Roll Number</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.rollNumber || '—'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Enrollment Number</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.enrollmentNumber || '—'}</div>
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

          {(student?.academicRank || student?.departmentRank || student?.branchRank || student?.batchRank) ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Class Ranks</span>
              {student?.academicRank && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Trophy className="w-3 h-3 text-amber-600" /> Academic #{student.academicRank}
                </span>
              )}
              {student?.departmentRank && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  <Trophy className="w-3 h-3 text-teal-600" /> Dept #{student.departmentRank}
                </span>
              )}
              {student?.branchRank && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <Trophy className="w-3 h-3 text-indigo-600" /> Branch #{student.branchRank}
                </span>
              )}
              {student?.batchRank && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-800 border border-violet-200">
                  <Trophy className="w-3 h-3 text-violet-600" /> Batch #{student.batchRank}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Personal Details */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserRound className="w-4 h-4 text-indigo-700" />
            <span>Personal Details</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Date of Birth</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.dateOfBirth || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Gender</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.gender || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Nationality</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.nationality || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Languages</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.languages?.length ? student.languages.join(', ') : '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Father&apos;s Name</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.fatherName || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Mother&apos;s Name</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.motherName || '—'}</div>
            </div>
          </div>

          {student?.interests?.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Interests</span>
              {student.interests.map((it: string) => (
                <span key={it} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <HeartPulse className="w-3 h-3 text-indigo-600" />
                  {it}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Identity & Contact */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-700" />
            <span>Identity & Contact</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Phone</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.phone || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Alt. Email</span>
              <div className="font-bold text-slate-900 mt-0.5 truncate">{student?.alternateEmail || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
              <span className="text-slate-500 font-medium">Location</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.location || '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
              <span className="text-slate-500 font-medium">Address</span>
              <div className="font-bold text-slate-900 mt-0.5">{student?.address || '—'}</div>
            </div>
          </div>
        </div>

        {/* Links & Professional Handles */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-700" />
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
                  className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                >
                  {student.githubUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Linkedin className="w-4 h-4 text-indigo-700" />
                <span className="font-bold text-slate-800">LinkedIn Profile</span>
              </div>
              {student?.linkedinUrl ? (
                <a
                  href={student.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
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

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-800">LeetCode Profile</span>
              </div>
              {student?.leetcodeUrl ? (
                <a
                  href={student.leetcodeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                >
                  {student.leetcodeUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Kaggle Profile</span>
              </div>
              {student?.kaggleUrl ? (
                <a
                  href={student.kaggleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                >
                  {student.kaggleUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">HackerRank Profile</span>
              </div>
              {student?.hackerrankUrl ? (
                <a
                  href={student.hackerrankUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                >
                  {student.hackerrankUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-800">Portfolio Website</span>
              </div>
              {student?.portfolioWebsiteUrl ? (
                <a
                  href={student.portfolioWebsiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                >
                  {student.portfolioWebsiteUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
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
            className="px-3 py-1.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-colors border border-indigo-200"
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
                <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Degree Program</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-indigo-700" />
                  <span>Personal &amp; Contact Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      placeholder="e.g. 15 Apr 2005"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="e.g. Indian"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 90000 12345"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alternate Email</label>
                    <input
                      type="email"
                      value={formData.alternateEmail}
                      onChange={(e) => setFormData({ ...formData, alternateEmail: e.target.value })}
                      placeholder="you@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 112103045"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Enrollment Number</label>
                    <input
                      type="text"
                      value={formData.enrollmentNumber}
                      onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                      placeholder="e.g. EN2103045"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Andhra Pradesh, India"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

              <div>
                  <label className="block font-bold text-slate-700 mb-1">Address</label>
                  <textarea
                    rows={1}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Current / permanent address"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father&apos;s Name</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Guardian / father name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mother&apos;s Name</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="Mother name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">LeetCode URL</label>
                    <input
                      type="text"
                      value={formData.leetcodeUrl}
                      onChange={(e) => setFormData({ ...formData, leetcodeUrl: e.target.value })}
                      placeholder="https://leetcode.com/u/username"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kaggle URL</label>
                    <input
                      type="text"
                      value={formData.kaggleUrl}
                      onChange={(e) => setFormData({ ...formData, kaggleUrl: e.target.value })}
                      placeholder="https://www.kaggle.com/username"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">HackerRank URL</label>
                    <input
                      type="text"
                      value={formData.hackerrankUrl}
                      onChange={(e) => setFormData({ ...formData, hackerrankUrl: e.target.value })}
                      placeholder="https://www.hackerrank.com/username"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Portfolio Website URL</label>
                    <input
                      type="text"
                      value={formData.portfolioWebsiteUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioWebsiteUrl: e.target.value })}
                      placeholder="https://yourname.github.io"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Languages (comma separated)</label>
                    <input
                      type="text"
                      value={formData.languagesText}
                      onChange={(e) => setFormData({ ...formData, languagesText: e.target.value })}
                      placeholder="Telugu, Hindi, English"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Interests (comma separated)</label>
                    <input
                      type="text"
                      value={formData.interestsText}
                      onChange={(e) => setFormData({ ...formData, interestsText: e.target.value })}
                      placeholder="AI, Chess, Open Source"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
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
                  className="px-5 py-2 btn-brand text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
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
