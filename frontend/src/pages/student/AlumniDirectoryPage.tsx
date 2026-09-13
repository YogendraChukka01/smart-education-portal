import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  Quote,
  FileText,
  Heart,
  Send,
  Tag,
  Clock,
  Check,
  Award,
} from 'lucide-react';
import { ENGINEERING_BRANCHES_ALL, ALUMNI_POST_TYPES } from '@ayush-portal/shared';

export const AlumniDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const [viewTab, setViewTab] = useState<'directory' | 'feed'>('directory');
  const [alumni, setAlumni] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Filters for Directory
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Filters for Feed
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mentorship Modal State
  const [mentorshipModalAlum, setMentorshipModalAlum] = useState<any | null>(null);
  const [mentorshipTopic, setMentorshipTopic] = useState('');
  const [mentorshipMessage, setMentorshipMessage] = useState('');
  const [mentorshipSending, setMentorshipSending] = useState(false);
  const [mentorshipSent, setMentorshipSent] = useState(false);

  // Comment input state for posts
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAlumni();
    fetchPosts();
  }, [selectedCompany, selectedBranch, selectedYear]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCompany !== 'all') params.append('company', selectedCompany);
      if (selectedBranch !== 'all') params.append('branch', selectedBranch);
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/analytics/alumni?${params.toString()}`);
      setAlumni(res.data.alumni || []);
    } catch (err) {
      console.error('Failed to load alumni directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await api.get('/alumni/posts');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Failed to load alumni posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlumni();
  };

  const handleSendMentorshipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorshipModalAlum) return;

    setMentorshipSending(true);
    try {
      await api.post('/alumni/mentorship-requests', {
        mentorUserId: mentorshipModalAlum.userId,
        topic: mentorshipTopic || 'Campus Placement Preparation Guidance',
        message: mentorshipMessage || `Hi ${mentorshipModalAlum.name}, I am an engineering student preparing for campus drives. Would love your mentorship regarding ${mentorshipModalAlum.company}.`,
      });
      setMentorshipSent(true);
      setTimeout(() => {
        setMentorshipModalAlum(null);
        setMentorshipSent(false);
        setMentorshipTopic('');
        setMentorshipMessage('');
      }, 1800);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit mentorship request.');
    } finally {
      setMentorshipSending(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await api.post(`/alumni/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: res.data.liked, likesCount: res.data.likesCount }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setSubmittingCommentId(postId);
    try {
      const res = await api.post(`/alumni/posts/${postId}/comments`, {
        content: text.trim(),
      });

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const updatedComments = [...(p.comments || []), res.data.comment];
            return {
              ...p,
              comments: updatedComments,
              commentsCount: updatedComments.length,
            };
          }
          return p;
        })
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      alert('Failed to add inquiry / comment.');
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.postType === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Institutional Alumni Network & Knowledge Feed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Alumni Directory & Placement Knowledge Exchange
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
          Connect with verified engineering alumni working across Microsoft, Google, AWS, Bosch, TCS, and Qualcomm. Read real interview experiences, request 1:1 mentorship, and ask career questions.
        </p>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setViewTab('directory')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            viewTab === 'directory'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumni Mentors & Directory ({alumni.length})</span>
        </button>

        <button
          onClick={() => setViewTab('feed')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            viewTab === 'feed'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Knowledge Feed & Insights ({posts.length})</span>
        </button>
      </div>

      {/* VIEW TAB 1: Directory */}
      {viewTab === 'directory' && (
        <div className="space-y-6">
          {/* Filter Controls Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search alumni by name, role, skill (e.g. Distributed Systems)..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                >
                  <option value="all">All Engineering Branches</option>
                  {ENGINEERING_BRANCHES_ALL.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                >
                  <option value="all">All Graduation Batches</option>
                  <option value="2024">Batch 2024</option>
                  <option value="2023">Batch 2023</option>
                  <option value="2022">Batch 2022</option>
                  <option value="2021">Batch 2021</option>
                  <option value="2020">Batch 2020</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Alumni</span>
                </button>
              </div>
            </form>
          </div>

          {/* Alumni Directory Grid */}
          {loading ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Searching alumni records...</p>
            </div>
          ) : alumni.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No alumni found matching the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((a) => (
                <div
                  key={a.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Alum Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs overflow-hidden">
                        {a.avatarUrl ? (
                          <img
                            src={getMediaUrl(a.avatarUrl)}
                            alt={a.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          a.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{a.name}</h3>
                          {a.isAvailableForMentorship && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Open for Mentorship"></span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{a.role}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{a.company}</span>
                        </div>
                      </div>
                    </div>

                    {/* Academic Tag */}
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                      <div className="font-bold text-slate-700">{a.branchName}</div>
                      <div className="text-slate-500">
                        Graduated {a.graduationYear} • {a.experienceYears} Years Exp • {a.location || 'India'}
                      </div>
                    </div>

                    {/* Bio / Quote */}
                    {a.careerStoryQuote && (
                      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-slate-700 text-[11px] italic leading-relaxed flex gap-2">
                        <Quote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>"{a.careerStoryQuote}"</span>
                      </div>
                    )}

                    {/* Skills Tags */}
                    {a.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {a.skills.map((sk: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {a.linkedinUrl && (
                        <a
                          href={a.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-colors"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {a.githubUrl && (
                        <a
                          href={a.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          title="GitHub Profile"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => setMentorshipModalAlum(a)}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Mentorship</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: Knowledge Feed & Posts */}
      {viewTab === 'feed' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">Filter by Topic:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {Object.values(ALUMNI_POST_TYPES).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loadingPosts ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading alumni knowledge feed...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No posts in this category yet. Check back soon!
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                        {post.authorAvatarUrl ? (
                          <img
                            src={getMediaUrl(post.authorAvatarUrl)}
                            alt={post.authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          post.authorName?.slice(0, 2).toUpperCase() || 'AL'
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{post.authorName}</div>
                        <div className="text-xs text-slate-500">
                          {post.role} at <strong>{post.company}</strong> • Class of {post.graduationYear}
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {post.postType}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-2">
                    <h2 className="text-base font-extrabold text-slate-900">{post.title}</h2>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
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

                  {/* Actions & Likes */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                        post.isLiked
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                      <span>{post.likesCount || 0} Helpful</span>
                    </button>

                    <div className="text-slate-400 font-mono text-[11px]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Comments / Questions Section */}
                  <div className="bg-slate-50/80 p-4 rounded-xl space-y-3">
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                      <span>Student Inquiries & Follow-ups ({post.comments?.length || 0})</span>
                    </div>

                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2">
                        {post.comments.map((cm: any) => (
                          <div key={cm.id} className="bg-white p-3 rounded-lg border border-slate-200/70 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{cm.userName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(cm.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700">{cm.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        placeholder="Ask a question or request advice on this topic..."
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingCommentId === post.id}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        {submittingCommentId === post.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Ask</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mentorship Request Modal */}
      {mentorshipModalAlum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-700" />
              <span>Request 1:1 Mentorship from {mentorshipModalAlum.name}</span>
            </h2>

            <p className="text-xs text-slate-600">
              Submit a structured mentorship request to <strong>{mentorshipModalAlum.name}</strong> ({mentorshipModalAlum.role} at {mentorshipModalAlum.company}). They will receive an in-app notification and can respond with meeting slots.
            </p>

            {mentorshipSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mentorship request submitted successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendMentorshipRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mentorship Focus / Topic *</label>
                  <input
                    type="text"
                    required
                    value={mentorshipTopic}
                    onChange={(e) => setMentorshipTopic(e.target.value)}
                    placeholder="e.g. System Design Mock Interview & Resume Review"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message & Target Goals *</label>
                  <textarea
                    rows={4}
                    required
                    value={mentorshipMessage}
                    onChange={(e) => setMentorshipMessage(e.target.value)}
                    placeholder="Share your current preparation status, target company aspirations, and specific areas where you need guidance..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMentorshipModalAlum(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mentorshipSending}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-2xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {mentorshipSending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
