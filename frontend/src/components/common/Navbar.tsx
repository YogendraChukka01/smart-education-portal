import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, getMediaUrl } from '../../lib/api';
import {
  GraduationCap,
  Bell,
  MessageSquare,
  User,
  LogOut,
  ChevronDown,
  Briefcase,
  Layers,
  Award,
  Calendar,
  Building2,
  BookOpen,
  Compass,
  FileCode2,
  Users,
  TrendingUp,
  Settings,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { ROLES, UserRole } from '@ayush-portal/shared';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // Ignore if unauthenticated
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async (role: UserRole) => {
    await switchDemoRole(role);
    setProfileDropdownOpen(false);
    if (role === ROLES.STUDENT) navigate('/student/dashboard');
    else if (role === ROLES.ACADEMICIAN) navigate('/academician/dashboard');
    else if (role === ROLES.INDUSTRY) navigate('/industry/dashboard');
    else if (role === ROLES.ALUMNI) navigate('/alumni/dashboard');
    else navigate('/admin/dashboard');
  };

  const student = user?.studentProfile;
  const faculty = user?.academicianProfile;
  const alumni = user?.alumniProfile;
  const company = user?.company;
  const institution = user?.institution;

  const displayName =
    student?.name ||
    faculty?.name ||
    alumni?.name ||
    company?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const displayRoleLabel =
    user?.role === ROLES.STUDENT
      ? `${student?.branchName || 'Student'} • Year ${student?.year || 3}`
      : user?.role === ROLES.ACADEMICIAN
      ? `${faculty?.designation || 'Faculty'} • ${faculty?.department || 'Engineering'}`
      : user?.role === ROLES.INDUSTRY
      ? `Recruiter • ${company?.name || 'Industry'}`
      : user?.role === ROLES.ALUMNI
      ? `Alum '${alumni?.graduationYear || 2022} • ${alumni?.company || 'Industry'}`
      : 'Placement Cell & Institution Admin';

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const mobileLinks =
    user?.role === ROLES.STUDENT
      ? [
          ['/student/dashboard', 'Dashboard'],
          ['/student/assessment', 'Assessments'],
          ['/student/career-gaps', 'Skill Gap Radar'],
          ['/student/opportunities', 'Opportunities'],
          ['/student/applications', 'Applications'],
          ['/student/coding', 'Coding Arena'],
          ['/student/projects', 'Projects'],
          ['/student/portfolio', 'Digital Portfolio'],
          ['/student/events', 'Events & Mentorship'],
          ['/student/alumni', 'Alumni Network'],
        ]
      : user?.role === ROLES.ACADEMICIAN
      ? [
          ['/academician/dashboard', 'Dashboard'],
          ['/academician/mentorship', 'Mentorship & Workshops'],
          ['/academician/opportunities', 'FDPs & Grants'],
          ['/academician/profile', 'Faculty Profile'],
        ]
      : user?.role === ROLES.INDUSTRY
      ? [
          ['/industry/dashboard', 'Dashboard'],
          ['/industry/post', 'Post Opportunity'],
          ['/industry/applicants', 'Candidate Ranker'],
          ['/industry/company-profile', 'Company Profile'],
        ]
      : user?.role === ROLES.INSTITUTION_ADMIN
      ? [
          ['/admin/dashboard', 'Dashboard'],
          ['/admin/placement-stats', 'Placement Statistics'],
          ['/admin/curriculum-gap', 'Curriculum Gap Radar'],
          ['/admin/industry-intelligence', 'Industry Intelligence'],
          ['/admin/roster', 'Roster & Directory'],
          ['/admin/settings', 'Institution Settings'],
        ]
      : [
          ['/alumni/dashboard', 'Dashboard & Portal'],
          ['/student/alumni', 'Alumni Network & Knowledge'],
          ['/student/events', 'Masterclasses & Events'],
          ['/messages', 'Mentorship Inquiries'],
        ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-8 min-w-0 flex-1">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs group-hover:border-blue-300 transition-colors">
                <img src="/setu-logo.png" alt="Setu logo" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                  Setu
                </div>
                <div className="text-[10px] font-semibold text-slate-500 tracking-wider">
                  Connect • Learn • Grow
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700 min-w-0">
                {user.role === ROLES.STUDENT && (
                  <>
                    <Link
                      to="/student/dashboard"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/dashboard')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Dashboard
                    </Link>

                    {/* Career Menu */}
                    <Link
                      to="/student/career-gaps"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/career-gaps')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Skill Gap Radar
                    </Link>

                    {/* Opportunities */}
                    <Link
                      to="/student/opportunities"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/opportunities')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Opportunities
                    </Link>

                    {/* Applications */}
                    <Link
                      to="/student/applications"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/applications')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Applications
                    </Link>

                    {/* Coding Assessment */}
                    <Link
                      to="/student/coding"
                      className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                        isActive('/student/coding')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Coding Arena</span>
                    </Link>

                    {/* Projects & Portfolio */}
                    <Link
                      to="/student/projects"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/projects')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Projects
                    </Link>

                    {/* Community Events & Mentorship */}
                    <Link
                      to="/student/events"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/events')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Events & Mentorship
                    </Link>

                    {/* Alumni Directory */}
                    <Link
                      to="/student/alumni"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/alumni')
                          ? 'bg-blue-50 text-blue-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Alumni Network
                    </Link>
                  </>
                )}

                {user.role === ROLES.ACADEMICIAN && (
                  <>
                    <Link
                      to="/academician/dashboard"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/academician/dashboard') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/academician/mentorship"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/academician/mentorship') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Mentorship & Workshops
                    </Link>
                    <Link
                      to="/academician/opportunities"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/academician/opportunities') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      FDPs & Grants
                    </Link>
                    <Link
                      to="/academician/profile"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/academician/profile') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Faculty Profile
                    </Link>
                  </>
                )}

                {user.role === ROLES.INDUSTRY && (
                  <>
                    <Link
                      to="/industry/dashboard"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/industry/dashboard') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/industry/post"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/industry/post') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Post Opportunity
                    </Link>
                    <Link
                      to="/industry/applicants"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/industry/applicants') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Candidate Ranker
                    </Link>
                    <Link
                      to="/industry/company-profile"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/industry/company-profile') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Company Profile
                    </Link>
                  </>
                )}

                {user.role === ROLES.INSTITUTION_ADMIN && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/placement-stats"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/admin/placement-stats') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Placement Statistics
                    </Link>
                    <Link
                      to="/admin/curriculum-gap"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/admin/curriculum-gap') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Curriculum Gap Radar
                    </Link>
                    <Link
                      to="/admin/industry-intelligence"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/admin/industry-intelligence') ? 'bg-indigo-50 text-indigo-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Industry Intelligence
                    </Link>
                    <Link
                      to="/admin/roster"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/admin/roster') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Roster & Directory
                    </Link>
                    <Link
                      to="/admin/settings"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/admin/settings') ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      Institution Settings
                    </Link>
                  </>
                )}

                {user.role === ROLES.ALUMNI && (
                  <>
                    <Link
                      to="/alumni/dashboard"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/alumni/dashboard') ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      Dashboard & Portal
                    </Link>
                    <Link
                      to="/student/alumni"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/alumni') ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      Alumni Network & Knowledge
                    </Link>
                    <Link
                      to="/student/events"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/student/events') ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      Masterclasses & Events
                    </Link>
                    <Link
                      to="/messages"
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isActive('/messages') ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      Mentorship Inquiries
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setProfileDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Notifications Drawer Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px]">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-blue-700 hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications right now.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                                !n.read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="font-bold text-slate-900">{n.title}</div>
                              <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(!mobileMenuOpen);
                    setNotificationsOpen(false);
                    setProfileDropdownOpen(false);
                  }}
                  className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Messages Link */}
                <Link
                  to="/messages"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors hidden sm:block"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-blue-700 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                      {(user?.avatarUrl || student?.avatarUrl || faculty?.avatarUrl || alumni?.avatarUrl || company?.logoUrl || institution?.logoUrl) ? (
                        <img
                          src={getMediaUrl(user?.avatarUrl || student?.avatarUrl || faculty?.avatarUrl || alumni?.avatarUrl || company?.logoUrl || institution?.logoUrl)}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                        {displayName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 space-y-1">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900">{displayName}</div>
                        <div className="text-[11px] text-slate-500">{displayRoleLabel}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.email}</div>
                      </div>

                      {user.role === ROLES.STUDENT && (
                        <>
                          <Link
                            to="/student/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-blue-700" />
                            <span>Edit Academic Profile</span>
                          </Link>
                          {student?.portfolioSlug && (
                            <a
                              href={`/portfolio/${student.portfolioSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-700" />
                                <span>Public Digital Portfolio</span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                        </>
                      )}

                      {user.role === ROLES.ACADEMICIAN && (
                        <Link
                          to="/academician/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 text-blue-700" />
                          <span>Edit Faculty Profile</span>
                        </Link>
                      )}

                      {user.role === ROLES.INDUSTRY && (
                        <Link
                          to="/industry/company-profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Building2 className="w-4 h-4 text-blue-700" />
                          <span>Edit Company Profile</span>
                        </Link>
                      )}

                      {user.role === ROLES.INSTITUTION_ADMIN && (
                        <Link
                          to="/admin/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="w-4 h-4 text-blue-700" />
                          <span>Institution Settings</span>
                        </Link>
                      )}

                      {user.role === ROLES.ALUMNI && (
                        <Link
                          to="/alumni/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Award className="w-4 h-4 text-blue-700" />
                          <span>Edit Alumni Profile</span>
                        </Link>
                      )}

                      {/* Evaluator Quick Role Switcher */}
                      <div className="pt-2 border-t border-slate-100 px-3 py-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" /> Evaluator Quick Switch
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <button
                            onClick={() => handleSwitchRole(ROLES.STUDENT)}
                            className="p-1 text-left hover:bg-slate-100 rounded font-medium text-slate-700"
                          >
                            • Student (CSE)
                          </button>
                          <button
                            onClick={() => handleSwitchRole(ROLES.ACADEMICIAN)}
                            className="p-1 text-left hover:bg-slate-100 rounded font-medium text-slate-700"
                          >
                            • Faculty HOD
                          </button>
                          <button
                            onClick={() => handleSwitchRole(ROLES.INDUSTRY)}
                            className="p-1 text-left hover:bg-slate-100 rounded font-medium text-slate-700"
                          >
                            • Industry Recruiter
                          </button>
                          <button
                            onClick={() => handleSwitchRole(ROLES.INSTITUTION_ADMIN)}
                            className="p-1 text-left hover:bg-slate-100 rounded font-medium text-slate-700"
                          >
                            • Placement Cell
                          </button>
                          <button
                            onClick={() => handleSwitchRole(ROLES.ALUMNI)}
                            className="p-1 text-left hover:bg-slate-100 rounded font-medium text-slate-700 col-span-2"
                          >
                            • Alumni (Microsoft SDE)
                          </button>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        {user && mobileMenuOpen && (
          <nav className="xl:hidden border-t border-slate-100 py-3 pb-4" aria-label="Mobile navigation">
            <div className="grid grid-cols-2 gap-1.5">
              {mobileLinks.map(([path, label]) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                    isActive(path) ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
