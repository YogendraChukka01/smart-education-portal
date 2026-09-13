import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { MENTORSHIP_EVENT_TYPES, ENGINEERING_BRANCHES_ALL } from '@ayush-portal/shared';

export const MentorshipManagementPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState(MENTORSHIP_EVENT_TYPES.WORKSHOP);
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [startTime, setStartTime] = useState('04:00 PM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [mode, setMode] = useState('Online (Google Meet)');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/mitaoe-session');
  const [relevantBranch, setRelevantBranch] = useState('Computer Science & Engineering');
  const [relevantSkills, setRelevantSkills] = useState('Java, Spring Boot, SQL');
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attendees Modal State
  const [attendeesModalEvent, setAttendeesModalEvent] = useState<any | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/mentorship/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to load mentorship events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    setError(null);

    const payload = {
      title,
      type,
      description,
      dateTime: dateTime || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      startTime,
      endTime,
      mode,
      locationOrLink,
      relevantBranch,
      relevantSkills: relevantSkills.split(',').map((s) => s.trim()).filter(Boolean),
      maxAttendees: Number(maxAttendees),
    };

    try {
      const res = await api.post('/mentorship/events', payload);
      setEvents([res.data.event, ...events]);
      setScheduleModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to schedule mentorship session.');
    } finally {
      setScheduling(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel and delete this session?')) return;

    try {
      await api.delete(`/mentorship/${id}`);
      setEvents(events.filter((ev) => ev.id !== id));
    } catch (err) {
      alert('Failed to cancel session.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Faculty Mentorship & Masterclasses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Mentorship Scheduling & Student Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Host live domain masterclasses, campus interview preparation workshops, and 1:1 mentorship sessions. Track student registrations in real-time.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setScheduleModalOpen(true);
          }}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading scheduled sessions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {ev.type?.replace(/_/g, ' ') || 'Workshop'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{ev.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(ev.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cancel Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                {/* Date & Time Info */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{new Date(ev.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{ev.startTime || '04:00 PM'} - {ev.endTime || '06:00 PM'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Video className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span className="truncate">{ev.locationOrLink}</span>
                  </div>
                </div>

                {/* Target Branch */}
                <div className="text-[11px] text-slate-500 font-medium">
                  <strong>Target Audience:</strong> {ev.relevantBranch || 'All Branches'}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setAttendeesModalEvent(ev)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-blue-700" />
                  <span>View Registered Students ({ev.attendeesCount || 0})</span>
                </button>

                <span className="text-[11px] text-slate-400 font-mono">
                  Max: {ev.maxAttendees} seats
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Session Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Schedule Mentorship Session</h2>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Masterclass: Cracking High-Throughput System Design"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                  >
                    <option value={MENTORSHIP_EVENT_TYPES.WORKSHOP}>Technical Workshop</option>
                    <option value={MENTORSHIP_EVENT_TYPES.GUEST_LECTURE}>Guest Lecture</option>
                    <option value={MENTORSHIP_EVENT_TYPES.MENTORSHIP}>Mentorship Session</option>
                    <option value={MENTORSHIP_EVENT_TYPES.ALUMNI_TALK}>Alumni Talk / AMA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Engineering Branch</label>
                  <select
                    value={relevantBranch}
                    onChange={(e) => setRelevantBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                  >
                    <option value="All Engineering Branches">All Engineering Branches</option>
                    {ENGINEERING_BRANCHES_ALL.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Topics Covered *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hands-on architectural deep dive into Kafka partitioning, database sharding, and resilience patterns..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="04:00 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="06:00 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mode & Venue / Link</label>
                  <input
                    type="text"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-2xs flex items-center gap-2 disabled:opacity-50"
                >
                  {scheduling && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Publish Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendees Viewer Modal */}
      {attendeesModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Students Roster</h2>
                <div className="text-xs text-slate-500">{attendeesModalEvent.title}</div>
              </div>
              <button
                onClick={() => setAttendeesModalEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {attendeesModalEvent.attendees?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No students registered yet for this session.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {attendeesModalEvent.attendees?.map((att: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{att.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {att.branchName} • Year {att.year} (Sem {att.semester}) • CGPA: {att.cgpa}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      Registered: {new Date(att.registeredAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setAttendeesModalEvent(null)}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
