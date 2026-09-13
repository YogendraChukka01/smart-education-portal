import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateJwt, AuthRequest, requireRoles } from '../middleware/auth.middleware';
import { MENTORSHIP_EVENT_TYPES, ROLES } from '@ayush-portal/shared';

const router = Router();

// GET /api/mentorship & GET /api/mentorship/events (List all mentorship events)
const handleGetEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.mentorshipEvent.findMany({
      include: {
        hostAcademician: {
          include: {
            user: {
              include: { institution: true },
            },
          },
        },
        registrations: {
          include: {
            user: {
              include: {
                studentProfile: true,
              },
            },
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    const currentUserId = req.user?.id;

    const formatted = events.map((ev) => {
      const isRegistered = currentUserId
        ? ev.registrations.some((r) => r.userId === currentUserId)
        : false;

      let relevantSkills: string[] = [];
      if (ev.relevantSkillsJson) {
        try {
          relevantSkills = JSON.parse(ev.relevantSkillsJson);
        } catch {
          relevantSkills = [];
        }
      }

      return {
        id: ev.id,
        hostAcademicianId: ev.hostAcademicianId,
        title: ev.title,
        type: ev.type,
        description: ev.description,
        dateTime: ev.dateTime.toISOString(),
        startTime: ev.startTime || '10:00 AM',
        endTime: ev.endTime || '12:00 PM',
        mode: ev.mode || 'Online',
        locationOrLink: ev.locationOrLink,
        relevantBranch: ev.relevantBranch || 'All Engineering Branches',
        relevantSkills,
        maxAttendees: ev.maxAttendees || 50,
        attendeesCount: ev.registrations.length,
        isRegistered,
        attendees: ev.registrations.map((r) => ({
          id: r.id,
          userId: r.userId,
          studentName: r.user.studentProfile?.name || 'Student Scholar',
          branchName: r.user.studentProfile?.branchName || 'Engineering',
          year: r.user.studentProfile?.year || 3,
          semester: r.user.studentProfile?.semester || 6,
          cgpa: r.user.studentProfile?.cgpa || 8.5,
          registeredAt: r.registeredAt.toISOString(),
        })),
        hostAcademician: {
          name: ev.hostAcademician.name,
          department: ev.hostAcademician.department,
          designation: ev.hostAcademician.designation,
          institutionName: ev.hostAcademician.user.institution?.name || 'Audisankara University',
          avatarUrl: ev.hostAcademician.avatarUrl,
        },
      };
    });

    res.json({ events: formatted });
  } catch (error) {
    console.error('List mentorship events error:', error);
    res.status(500).json({ error: 'Failed to fetch mentorship events' });
  }
};

router.get('/', authenticateJwt, handleGetEvents);
router.get('/events', authenticateJwt, handleGetEvents);

// POST /api/mentorship & POST /api/mentorship/events (Host an event / session)
const handleCreateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!academician) {
      res.status(404).json({ error: 'Academician profile not found. Please ensure you are logged in as faculty.' });
      return;
    }

    const {
      title,
      type,
      description,
      dateTime,
      startTime,
      endTime,
      mode,
      locationOrLink,
      relevantBranch,
      relevantSkills,
      maxAttendees,
    } = req.body;

    const event = await prisma.mentorshipEvent.create({
      data: {
        hostAcademicianId: academician.id,
        title: title || 'Faculty Mentorship Session',
        type: type || MENTORSHIP_EVENT_TYPES.WORKSHOP,
        description: description || '',
        dateTime: dateTime ? new Date(dateTime) : new Date(),
        startTime: startTime || '10:00 AM',
        endTime: endTime || '12:00 PM',
        mode: mode || 'Online',
        locationOrLink: locationOrLink || 'Google Meet / Campus Auditorium',
        relevantBranch: relevantBranch || 'All Engineering Branches',
        relevantSkillsJson: JSON.stringify(relevantSkills || []),
        maxAttendees: Number(maxAttendees) || 50,
      },
      include: {
        hostAcademician: true,
      },
    });

    res.status(201).json({
      message: 'Mentorship session scheduled successfully!',
      event,
    });
  } catch (error) {
    console.error('Create mentorship event error:', error);
    res.status(500).json({ error: 'Failed to schedule mentorship event' });
  }
};

router.post('/', authenticateJwt, requireRoles(ROLES.ACADEMICIAN, ROLES.INSTITUTION_ADMIN, ROLES.ALUMNI), handleCreateEvent);
router.post('/events', authenticateJwt, requireRoles(ROLES.ACADEMICIAN, ROLES.INSTITUTION_ADMIN, ROLES.ALUMNI), handleCreateEvent);

// PUT /api/mentorship/:id (Edit session)
router.put('/:id', authenticateJwt, requireRoles(ROLES.ACADEMICIAN, ROLES.INSTITUTION_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const event = await prisma.mentorshipEvent.findFirst({
      where: { id, hostAcademicianId: academician?.id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found or unauthorized' });
      return;
    }

    const {
      title,
      type,
      description,
      dateTime,
      startTime,
      endTime,
      mode,
      locationOrLink,
      relevantBranch,
      relevantSkills,
      maxAttendees,
    } = req.body;

    const updated = await prisma.mentorshipEvent.update({
      where: { id },
      data: {
        title: title !== undefined ? title : event.title,
        type: type !== undefined ? type : event.type,
        description: description !== undefined ? description : event.description,
        dateTime: dateTime ? new Date(dateTime) : event.dateTime,
        startTime: startTime !== undefined ? startTime : event.startTime,
        endTime: endTime !== undefined ? endTime : event.endTime,
        mode: mode !== undefined ? mode : event.mode,
        locationOrLink: locationOrLink !== undefined ? locationOrLink : event.locationOrLink,
        relevantBranch: relevantBranch !== undefined ? relevantBranch : event.relevantBranch,
        relevantSkillsJson: relevantSkills !== undefined ? JSON.stringify(relevantSkills) : event.relevantSkillsJson,
        maxAttendees: maxAttendees !== undefined ? Number(maxAttendees) : event.maxAttendees,
      },
    });

    res.json({ message: 'Session updated successfully', event: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mentorship session' });
  }
});

// DELETE /api/mentorship/:id (Delete / Cancel session)
router.delete('/:id', authenticateJwt, requireRoles(ROLES.ACADEMICIAN, ROLES.INSTITUTION_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const event = await prisma.mentorshipEvent.findFirst({
      where: { id, hostAcademicianId: academician?.id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found or unauthorized' });
      return;
    }

    await prisma.mentorshipEvent.delete({ where: { id } });
    res.json({ message: 'Session cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel session' });
  }
});

// POST /api/mentorship/:id/register (Student registers for session)
router.post('/:id/register', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const event: any = await prisma.mentorshipEvent.findUnique({
      where: { id },
      include: { eventRegistrations: true } as any,
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const existingReg = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (existingReg) {
      res.status(400).json({ error: 'You are already registered for this session.' });
      return;
    }

    const registrations = event.eventRegistrations || [];
    if (event.maxAttendees && registrations.length >= event.maxAttendees) {
      res.status(400).json({ error: 'This session has reached maximum capacity.' });
      return;
    }

    await prisma.eventRegistration.create({
      data: {
        eventId: id,
        userId,
      },
    });

    const count = await prisma.eventRegistration.count({ where: { eventId: id } });
    res.json({ message: 'Successfully registered for this session!', attendeesCount: count });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register for session' });
  }
});

// DELETE /api/mentorship/:id/register & DELETE /api/mentorship/:id/cancel
const handleCancelRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    await prisma.eventRegistration.deleteMany({
      where: {
        eventId: id,
        userId,
      },
    });

    const count = await prisma.eventRegistration.count({ where: { eventId: id } });
    res.json({ message: 'Registration cancelled', attendeesCount: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
};

router.delete('/:id/register', authenticateJwt, handleCancelRegistration);
router.delete('/:id/cancel', authenticateJwt, handleCancelRegistration);

export default router;
