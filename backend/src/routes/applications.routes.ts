import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateJwt, AuthRequest, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { APPLICATION_STATUS, ROLES } from '@ayush-portal/shared';
import { calculateMatchScore, CandidateSkill, OpportunitySkillRequirement } from '../services/matching.engine';

const router = Router();

const applySchema = z.object({
  opportunityId: z.string(),
  coverNote: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    APPLICATION_STATUS.APPLIED,
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.ASSESSMENT,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.SELECTED,
    APPLICATION_STATUS.REJECTED,
  ]),
  notes: z.string().optional(),
});

// POST /api/applications/apply (Student/Academician applies to opportunity)
router.post(
  '/apply',
  authenticateJwt,
  validateBody(applySchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { opportunityId, coverNote } = req.body;
      const userId = req.user!.id;

      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
      });

      if (!opportunity) {
        res.status(404).json({ error: 'Opportunity not found' });
        return;
      }

      // Check if already applied
      const existing = await prisma.application.findFirst({
        where: {
          opportunityId,
          applicantUserId: userId,
        },
      });

      if (existing) {
        res.status(400).json({ error: 'You have already submitted an application for this opportunity.' });
        return;
      }

      // Calculate candidate match score
      let candidateSkills: CandidateSkill[] = [];
      let studentAcademic: any = {};

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          skillScores: {
            include: { skill: true },
          },
        },
      });

      if (studentProfile) {
        studentAcademic = {
          departmentName: studentProfile.departmentName,
          branchName: studentProfile.branchName,
          cgpa: studentProfile.cgpa,
          graduationYear: studentProfile.graduationYear,
        };

        candidateSkills = studentProfile.skillScores.map((s) => ({
          skillId: s.skillId,
          skillName: s.skill.name,
          score: s.score,
        }));
      }

      const allSkills = await prisma.skill.findMany();
      const skillNameMap = new Map(allSkills.map((s) => [s.id, s.name]));

      const reqs: OpportunitySkillRequirement[] = JSON.parse(opportunity.requiredSkillsJson || '[]').map(
        (r: any) => ({
          ...r,
          skillName: skillNameMap.get(r.skillId) || 'Skill',
        })
      );

      const matchResult = calculateMatchScore(
        candidateSkills,
        reqs,
        studentAcademic,
        {
          eligibleDepartments: JSON.parse(opportunity.eligibleDepartmentsJson || '[]'),
          eligibleBranches: JSON.parse(opportunity.eligibleBranchesJson || '[]'),
          minCgpa: opportunity.minCgpa,
        }
      );

      const application = await prisma.application.create({
        data: {
          opportunityId,
          applicantUserId: userId,
          status: APPLICATION_STATUS.APPLIED,
          matchScorePct: matchResult.scorePct,
          matchDetailsJson: JSON.stringify({
            skillMatchPct: matchResult.skillMatchPct,
            branchMatchPct: matchResult.branchMatchPct,
            eligibilityMatchPct: matchResult.eligibilityMatchPct,
            matchedSkillsCount: matchResult.matchedSkillsCount,
            totalRequiredSkills: matchResult.totalRequiredSkills,
            breakdown: matchResult.breakdown,
            topStrengths: matchResult.topStrengths.map((s) => s.skillName),
            topGaps: matchResult.topGaps.map((g) => g.skillName),
          }),
          coverNote,
          statusHistory: {
            create: {
              status: APPLICATION_STATUS.APPLIED,
              notes: 'Application submitted by candidate.',
              changedByUserId: userId,
            },
          },
        },
        include: {
          opportunity: true,
          statusHistory: true,
        },
      });

      res.status(201).json({
        message: 'Application submitted successfully!',
        application,
      });
    } catch (error) {
      console.error('Apply error:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
);

// GET /api/applications/my (Current user's applications)
router.get('/my', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      where: { applicantUserId: req.user!.id },
      include: {
        opportunity: {
          include: {
            company: true,
            institution: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your applications' });
  }
});

// GET /api/applications/opportunity/:opportunityId (Recruiter/Poster views ranked candidates)
router.get(
  '/opportunity/:opportunityId',
  authenticateJwt,
  requireRoles(ROLES.INDUSTRY, ROLES.INSTITUTION_ADMIN, ROLES.ACADEMICIAN),
  async (req: AuthRequest, res: Response) => {
    try {
      const opportunityId = req.params.opportunityId as string;

      const applications: any = await prisma.application.findMany({
        where: { opportunityId },
        include: {
          applicant: {
            include: {
              studentProfile: {
                include: {
                  skillScores: {
                    include: { skill: true },
                  },
                  portfolioItems: true,
                },
              },
              academicianProfile: true,
            },
          },
          statusHistory: {
            orderBy: { changedAt: 'desc' },
          },
        },
        orderBy: { matchScorePct: 'desc' }, // Ranked by Match % descending!
      });

      const formatted = applications.map((app: any) => ({
        id: app.id,
        opportunityId: app.opportunityId,
        applicantUserId: app.applicantUserId,
        status: app.status,
        matchScorePct: app.matchScorePct,
        matchDetails: app.matchDetailsJson ? JSON.parse(app.matchDetailsJson) : null,
        coverNote: app.coverNote,
        appliedAt: app.appliedAt,
        statusHistory: app.statusHistory,
        candidateName:
          app.applicant.studentProfile?.name ||
          app.applicant.academicianProfile?.name ||
          app.applicant.email,
        degreeOrDept:
          app.applicant.studentProfile?.departmentName ||
          app.applicant.academicianProfile?.department ||
          '',
        branchName: app.applicant.studentProfile?.branchName || '',
        year: app.applicant.studentProfile?.year,
        semester: app.applicant.studentProfile?.semester,
        cgpa: app.applicant.studentProfile?.cgpa,
        portfolioSlug: app.applicant.studentProfile?.portfolioSlug,
        skillsCount: app.applicant.studentProfile?.skillScores?.length || 0,
        portfolioItemsCount: app.applicant.studentProfile?.portfolioItems?.length || 0,
        email: app.applicant.email,
      }));

      res.json({ applications: formatted });
    } catch (error) {
      console.error('Fetch applicants error:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  }
);

// PATCH /api/applications/:id/status (Recruiter updates applicant stage)
router.patch(
  '/:id/status',
  authenticateJwt,
  requireRoles(ROLES.INDUSTRY, ROLES.INSTITUTION_ADMIN, ROLES.ACADEMICIAN),
  validateBody(updateStatusSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;

      const app = await prisma.application.update({
        where: { id },
        data: {
          status,
          statusHistory: {
            create: {
              status,
              notes: notes || `Moved to stage: ${status}`,
              changedByUserId: req.user!.id,
            },
          },
        },
        include: {
          statusHistory: {
            orderBy: { changedAt: 'desc' },
          },
        },
      });

      res.json({
        message: `Application updated to ${status}`,
        application: app,
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update application status' });
    }
  }
);

export default router;
