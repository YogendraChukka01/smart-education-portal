import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ProfilePhotoUpload } from '../../components/common/ProfilePhotoUpload';
import {
  Users,
  Briefcase,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Edit3,
  Save,
  Loader2,
  Quote,
  Plus,
  Award,
  GraduationCap,
  MapPin,
  Linkedin,
  Github,
  Check,
  X,
  FileText,
  Clock,
  Heart,
  Send,
  Share2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  ENGINEERING_DEPARTMENTS,
  ENGINEERING_BRANCHES,
  ALUMNI_POST_TYPES,
  AlumniPostType,
} from '@ayush-portal/shared';

export const AlumniDashboard: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'mentorship' | 'network' | 'events'>('profile');
  const [profile, setProfile] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [allAlumni, setAllAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [graduationYear, setGraduationYear] = useState(2024);
  const [departmentName, setDepartmentName] = useState('Computer Science & Engineering');
  const [branchName, setBranchName] = useState('Computer Science & Engineering');
  const [experienceYears, setExperienceYears] = useState(2);
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [bio, setBio] = useState('');
  const [careerStoryQuote, setCareerStoryQuote] = useState('');
  const [isAvailableForMentorship, setIsAvailableForMentorship] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Create Post Modal State
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<AlumniPostType>(ALUMNI_POST_TYPES.PLACEMENT_EXPERIENCE);
  const [postTags, setPostTags] = useState('');
  const [publishingPost, setPublishingPost] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState(false);

  // Mentorship Response State
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchAlumniData();
  }, []);

  const fetchAlumniData = async () => {
    try {
      const [meRes, postsRes, requestsRes, eventsRes, networkRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/alumni/posts'),
        api.get('/alumni/mentorship-requests'),
        api.get('/mentorship/events'),
        api.get('/analytics/alumni'),
      ]);

      const alum = meRes.data.user?.alumniProfile;
      if (alum) {
        setProfile(alum);
        setName(alum.name || '');
        setCompany(alum.company || '');
        setRole(alum.role || '');
        setGraduationYear(alum.graduationYear || 2024);
        setDepartmentName(alum.departmentName || 'Computer Science & Engineering');
        setBranchName(alum.branchName || 'Computer Science & Engineering');
        setExperienceYears(alum.experienceYears || 2);
        setLocation(alum.location || 'Pune / Hyderabad, India');
        setLinkedinUrl(alum.linkedinUrl || '');
        setGithubUrl(alum.githubUrl || '');
        setBio(alum.bio || '');
        setCareerStoryQuote(alum.careerStoryQuote || '');
        setIsAvailableForMentorship(alum.isAvailableForMentorship !== false);
        setAvatarUrl(alum.avatarUrl || meRes.data.user?.avatarUrl || null);
        try {
          setSkills(
            Array.isArray(JSON.parse(alum.skills || '[]'))
              ? JSON.parse(alum.skills).join(', ')
              : alum.skills || ''
          );
        } catch {
          setSkills(alum.skills || '');
        }
      }

      setPosts(postsRes.data.posts || []);
      setMentorshipRequests(requestsRes.data.requests || []);
      setEvents(eventsRes.data.events || []);
      setAllAlumni(networkRes.data.alumni || []);
    } catch (err) {
      console.error('Failed to load alumni dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    try {
      await api.put('/auth/profile', {
        name,
        company,
        role,
        graduationYear: Number(graduationYear),
        departmentName,
        branchName,
        experienceYears: Number(experienceYears),
        location,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        linkedinUrl,
        githubUrl,
        bio,
        careerStoryQuote,
        isAvailableForMentorship,
        avatarUrl,
      });

      if (refreshUserProfile) await refreshUserProfile();
      setProfileSuccess(true);
      setIsEditing(false);
      await fetchAlumniData();
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update alumni profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingPost(true);

    try {
      await api.post('/alumni/posts', {
        title: postTitle,
        content: postContent,
        postType: postCategory,
        company: profile?.company || company,
        role: profile?.role || role,
        branchName: profile?.branchName || branchName,
        graduationYear: profile?.graduationYear || graduationYear,
        tags: postTags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setPostSuccessMsg(true);
      setShowCreatePostModal(false);
      setPostTitle('');
      setPostContent('');
      setPostTags('');
      const res = await api.get('/alumni/posts');
      setPosts(res.data.posts || []);
      setTimeout(() => setPostSuccessMsg(false), 3000);
    } catch (err) {
      alert('Failed to publish alumni post.');
    } finally {
      setPublishingPost(false);
    }
  };

  const handleRespondMentorship = async (requestId: string, status: 'accepted' | 'rejected') => {
    setProcessingAction(true);
    try {
      await api.put(`/alumni/mentorship-requests/${requestId}`, {
        status,
        responseNotes: responseNotes || (status === 'accepted' ? 'Looking forward to mentoring you!' : 'Currently unable to take new mentees.'),
      });

      setRespondingRequestId(null);
      setResponseNotes('');
      const res = await api.get('/alumni/mentorship-requests');
      setMentorshipRequests(res.data.requests || []);
    } catch (err) {
      alert('Failed to update mentorship request.');
    } finally {
      setProcessingAction(false);
    }
  };

  const parsedSkillsList = skills.split(',').map((s) => s.trim()).filter(Boolean);
  const pendingRequestsCount = mentorshipRequests.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading university alumni portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Profile Hero Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <ProfilePhotoUpload
              currentAvatarUrl={avatarUrl}
              shape="rounded"
              size="lg"
              onPhotoUpdated={(newUrl) => {
                setAvatarUrl(newUrl);
                fetchAlumniData();
              }}
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {name || 'Alumni Member'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Class of {graduationYear}
                </span>
                {isAvailableForMentorship && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Open for Mentorship</span>
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-blue-700 flex items-center justify-center sm:justify-start gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{role || 'Software Engineer'} at {company || 'Microsoft'}</span>
              </div>

              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {branchName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {location || 'India'}
                </span>
                <span>•</span>
                <span>{experienceYears} Years Exp</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-center">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Alumni Profile'}</span>
            </button>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Knowledge / Post</span>
            </button>
          </div>
        </div>
      </div>

      {profileSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Alumni profile saved successfully! Updates are live in the institutional directory.</span>
        </div>
      )}

      {postSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Alumni thought / guidance post published! It is now visible to all students in the knowledge feed.</span>
        </div>
      )}

      {/* Portal Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Career Experience & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'posts'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Alumni Posts & Knowledge ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mentorship')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'mentorship'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mentorship Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">
              {pendingRequestsCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'network'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumni Network ({allAlumni.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Campus Masterclasses ({events.length})</span>
        </button>
      </div>

      {/* TAB 1: Profile & Career Experience */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-700" />
                <span>Edit Alumni Credentials & Mentorship Status</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Company / Employer <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Job Title / Designation <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer / SDE-2"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Engineering Department</label>
                  <select
                    value={departmentName}
                    onChange={(e) => {
                      setDepartmentName(e.target.value);
                      const branches = ENGINEERING_BRANCHES[e.target.value];
                      if (branches && branches.length > 0) setBranchName(branches[0]);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                  >
                    {ENGINEERING_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Graduation Batch / Year</label>
                  <input
                    type="number"
                    min="1980"
                    max="2030"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Specialized Branch</label>
                  <select
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                  >
                    {(ENGINEERING_BRANCHES[departmentName] || [departmentName]).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Technical Skills & Expertise (comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Java, Distributed Systems, Azure, System Design, Spring Boot"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Work Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hyderabad / Pune / Bengaluru"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Professional Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share a brief overview of your journey, current projects, and areas you can guide students on..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Career Story / Advice Quote for Juniors</label>
                  <textarea
                    rows={2}
                    value={careerStoryQuote}
                    onChange={(e) => setCareerStoryQuote(e.target.value)}
                    placeholder="e.g. Focus on building real end-to-end systems and understanding DSA fundamentals during 3rd year!"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed italic"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isAvailableForMentorship}
                      onChange={(e) => setIsAvailableForMentorship(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Available for 1:1 Student Mentorship & Mock Interviews</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Quick Stats & Bio */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Details</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400">Employer</div>
                      <div className="font-bold text-slate-900">{company || 'Microsoft'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Role</div>
                      <div className="font-bold text-slate-900">{role || 'Software Engineer'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Department</div>
                      <div className="font-bold text-slate-900">{departmentName}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Class Batch</div>
                      <div className="font-bold text-slate-900">Graduated {graduationYear}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Experience</div>
                      <div className="font-bold text-slate-900">{experienceYears} Years</div>
                    </div>
                  </div>

                  {linkedinUrl && (
                    <div className="pt-2 border-t border-slate-100">
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1.5"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>View LinkedIn Profile</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Bio, Skills & Quote */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">About Me</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {bio || 'Software Engineer passionate about high-scale distributed systems and mentoring engineering scholars.'}
                  </p>

                  {careerStoryQuote && (
                    <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 flex gap-3 text-xs text-blue-950 italic leading-relaxed">
                      <Quote className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span>"{careerStoryQuote}"</span>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Technical Skills & Areas of Guidance</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedSkillsList.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Alumni Posts & Knowledge Sharing */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Alumni Knowledge Insights ({posts.length})</h2>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Post</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {post.postType}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2">{post.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>By {post.authorName}</span>
                      <span>•</span>
                      <span>{post.role} at {post.company}</span>
                      <span>•</span>
                      <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{post.likesCount} Likes</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>{post.commentsCount || post.comments?.length || 0} Student Inquiries</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Mentorship Requests */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <h2 className="text-base font-bold text-slate-900">Student Mentorship Inquiries</h2>
            <p className="text-xs text-slate-500">
              Students preparing for campus placements can connect for resume guidance, technical mock interviews, and career roadmaps.
            </p>
          </div>

          {mentorshipRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">No Pending Mentorship Requests</div>
              <p className="text-xs text-slate-400">
                When students reach out via the Alumni Directory, their requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {mentorshipRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                        {req.studentUser?.studentProfile?.name?.slice(0, 2).toUpperCase() || 'ST'}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {req.studentUser?.studentProfile?.name || req.studentUser?.email || 'Student Scholar'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {req.studentUser?.studentProfile?.branchName || 'Engineering'} • Year {req.studentUser?.studentProfile?.year || 3} • CGPA {req.studentUser?.studentProfile?.cgpa || 8.0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        req.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        Status: {req.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900">Topic: {req.topic}</div>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      "{req.message}"
                    </p>
                    {req.responseNotes && (
                      <div className="text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                        <strong>Your Response:</strong> {req.responseNotes}
                      </div>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      {respondingRequestId === req.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={responseNotes}
                            onChange={(e) => setResponseNotes(e.target.value)}
                            placeholder="Add a meeting link or response note for the student..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRespondMentorship(req.id, 'accepted')}
                              disabled={processingAction}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Request</span>
                            </button>
                            <button
                              onClick={() => handleRespondMentorship(req.id, 'rejected')}
                              disabled={processingAction}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                            <button
                              onClick={() => setRespondingRequestId(null)}
                              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingRequestId(req.id)}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          Respond to Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Alumni Network Directory */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <h2 className="text-base font-bold text-slate-900">Institutional Alumni Directory ({allAlumni.length})</h2>
            <p className="text-xs text-slate-500">
              Browse alumni working across Microsoft, Google, AWS, Bosch, TCS, Qualcomm, and global tech organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAlumni.map((alum) => (
              <div key={alum.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                    {alum.avatarUrl ? (
                      <img src={getMediaUrl(alum.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      alum.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{alum.name}</div>
                    <div className="text-xs text-blue-700 font-semibold">{alum.role} at {alum.company}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div><strong>Department:</strong> {alum.departmentName}</div>
                  <div><strong>Batch:</strong> Class of {alum.graduationYear}</div>
                  <div><strong>Location:</strong> {alum.location || 'Pune / Hyderabad'}</div>
                </div>

                {alum.skills && alum.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {alum.skills.slice(0, 3).map((sk: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Campus Masterclasses & Events */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <h2 className="text-base font-bold text-slate-900">Campus Masterclasses & FDPs ({events.length})</h2>
            <p className="text-xs text-slate-500">
              Host or attend technical sessions, system design AMAs, and faculty development programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {ev.type?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {ev.attendeesCount} Registered
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900">{ev.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                  <div><strong>Date & Time:</strong> {new Date(ev.dateTime).toLocaleDateString()} at {ev.startTime}</div>
                  <div><strong>Location / Link:</strong> {ev.locationOrLink}</div>
                  <div><strong>Target Branch:</strong> {ev.relevantBranch}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <span>Publish Alumni Guidance Post</span>
              </h2>
              <button onClick={() => setShowCreatePostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. How I Prepared for Backend & Distributed Systems at Microsoft"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guidance Category <span className="text-red-500">*</span></label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as AlumniPostType)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-semibold bg-slate-50"
                >
                  {Object.values(ALUMNI_POST_TYPES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Content & Key Recommendations <span className="text-red-500">*</span></label>
                <textarea
                  rows={6}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your exact roadmap, interview rounds experience, system design advice, and recommended project tips..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="e.g. Microsoft, System Design, Java, Placement Tips"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishingPost}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  {publishingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{publishingPost ? 'Publishing...' : 'Publish to Student Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
