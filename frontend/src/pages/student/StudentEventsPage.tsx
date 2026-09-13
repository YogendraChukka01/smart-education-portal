import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Video,
  Sparkles,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const StudentEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const handleRegister = async (eventId: string) => {
    setActionLoadingId(eventId);
    try {
      await api.post(`/mentorship/events/${eventId}/register`);
      setEvents(
        events.map((ev) =>
          ev.id === eventId
            ? { ...ev, isRegistered: true, attendeesCount: ev.attendeesCount + 1 }
            : ev
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to register for session.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    setActionLoadingId(eventId);
    try {
      await api.delete(`/mentorship/events/${eventId}/cancel`);
      setEvents(
        events.map((ev) =>
          ev.id === eventId
            ? { ...ev, isRegistered: false, attendeesCount: Math.max(0, ev.attendeesCount - 1) }
            : ev
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Faculty Mentorship & Masterclasses</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mentorship Sessions & Technical Workshops
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
          Register for live interactive masterclasses conducted by senior faculty and industry alumni covering system design, cloud architecture, placement interview preparation, and core domain engineering.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading events calendar...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No upcoming mentorship sessions currently scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => {
            const isFull = ev.maxAttendees && ev.attendeesCount >= ev.maxAttendees;
            const isRegistered = ev.isRegistered;
            const isActionLoading = actionLoadingId === ev.id;

            return (
              <div
                key={ev.id}
                className={`bg-white p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between space-y-5 shadow-2xs hover:shadow-md ${
                  isRegistered ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {ev.type?.replace(/_/g, ' ') || 'Workshop'}
                    </span>

                    {isRegistered ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered
                      </span>
                    ) : isFull ? (
                      <span className="text-[11px] font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                        Session Full
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {ev.attendeesCount} / {ev.maxAttendees} Registered
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{ev.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                  </div>

                  {/* Speaker Details */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                      {ev.hostAcademician?.avatarUrl ? (
                        <img src={ev.hostAcademician.avatarUrl} alt={ev.hostAcademician.name} className="w-full h-full object-cover" />
                      ) : (
                        ev.hostAcademician?.name?.slice(0, 2).toUpperCase() || 'FA'
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{ev.hostAcademician?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {ev.hostAcademician?.designation} • {ev.hostAcademician?.department}
                      </div>
                    </div>
                  </div>

                  {/* Date, Time, Venue Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{new Date(ev.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{ev.startTime || '10:00 AM'} - {ev.endTime || '12:00 PM'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Video className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{ev.locationOrLink}</span>
                    </div>
                  </div>

                  {/* Relevant Skills */}
                  {ev.relevantSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {ev.relevantSkills.map((sk: string, i: number) => (
                        <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registration Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {isRegistered ? (
                    <>
                      <a
                        href={ev.locationOrLink?.startsWith('http') ? ev.locationOrLink : '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Session</span>
                      </a>

                      <button
                        onClick={() => handleCancelRegistration(ev.id)}
                        disabled={isActionLoading}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Cancel RSVP
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRegister(ev.id)}
                      disabled={isFull || isActionLoading}
                      className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isFull ? 'Session Full' : 'Reserve Free Seat'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
