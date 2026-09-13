import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateJwt, AuthRequest, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { ROLES, OPPORTUNITY_TYPES, AUDIENCE_TYPES } from '@ayush-portal/shared';
import { calculateMatchScore, CandidateSkill, OpportunitySkillRequirement } from '../services/matching.engine';

const router = Router();

const createOpportunitySchema = z.object({
  type: z.enum([
    OPPORTUNITY_TYPES.INTERNSHIP,
    OPPORTUNITY_TYPES.JOB,
    OPPORTUNITY_TYPES.PROGRAM,
    OPPORTUNITY_TYPES.FDP,
    OPPORTUNITY_TYPES.CONSULTANCY,
    OPPORTUNITY_TYPES.RESEARCH,
  ]),
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
  workMode: z.string().default('Hybrid'),
  stipendOrSalary: z.string().min(2),
  durationWeeks: z.number().int().min(1),
  minCgpa: z.number().min(0).max(10).default(6.0),
  eligibleDepartments: z.array(z.string()).default([]),
  eligibleBranches: z.array(z.string()).default([]),
  audience: z.enum([AUDIENCE_TYPES.STUDENT, AUDIENCE_TYPES.ACADEMICIAN, AUDIENCE_TYPES.BOTH]),
  deadline: z.string().optional().nullable(),
  requiredSkills: z.array(
    z.object({
      skillId: z.string(),
      level: z.number().min(1).max(100),
      weight: z.number().min(1).max(5),
    })
  ).min(1),
});

// GET /api/opportunities (List with filtering and match scores for logged-in students)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, audience, search, location, workMode, department, branch } = req.query as {
      type?: string;
      audience?: string;
      search?: string;
      location?: string;
      workMode?: string;
      department?: string;
      branch?: string;
    };

    const whereClause: any = {
      status: 'active',
    };

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    if (audience && audience !== 'all') {
      whereClause.audience = {
        in: [audience, AUDIENCE_TYPES.BOTH],
      };
    }

    if (location && location !== 'all') {
      whereClause.location = { contains: location };
    }

    if (workMode && workMode !== 'all') {
      whereClause.workMode = workMode;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        company: true,
        institution: true,
        applications: {
          select: { id: true, applicantUserId: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const allSkills = await prisma.skill.findMany();
    const skillNameMap = new Map(allSkills.map((s) => [s.id, s.name]));

    // Format opportunities
    const formatted = opportunities.map((opp) => {
      const parsedReqs: OpportunitySkillRequirement[] = JSON.parse(opp.requiredSkillsJson || '[]').map(
        (r: any) => ({
          ...r,
          skillName: skillNameMap.get(r.skillId) || 'Skill',
        })
      );

      const eligibleDepts: string[] = JSON.parse(opp.eligibleDepartmentsJson || '[]');
      const eligibleBranches: string[] = JSON.parse(opp.eligibleBranchesJson || '[]');

      return {
        id: opp.id,
        type: opp.type,
        title: opp.title,
        description: opp.description,
        location: opp.location,
        workMode: opp.workMode,
        stipendOrSalary: opp.stipendOrSalary,
        durationWeeks: opp.durationWeeks,
        minCgpa: opp.minCgpa,
        eligibleDepartments: eligibleDepts,
        eligibleBranches: eligibleBranches,
        audience: opp.audience,
        status: opp.status,
        deadline: opp.deadline ? opp.deadline.toISOString() : null,
        createdAt: opp.createdAt.toISOString(),
        company: opp.company,
        institution: opp.institution,
        requiredSkills: parsedReqs,
        applicantsCount: opp.applications.length,
      };
    });

    res.json({ opportunities: formatted });
  } catch (error) {
    console.error('List opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// GET /api/opportunities/recommendations (Personalized matches for student with explainable breakdown)
router.get('/recommendations', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const isStudent = req.user?.role === ROLES.STUDENT;
    const isAcademician = req.user?.role === ROLES.ACADEMICIAN;

    let candidateSkills: CandidateSkill[] = [];
    let studentAcademic: any = {};

    if (isStudent) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.id },
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
          source: s.source as 'self-assessed' | 'verified',
        }));
      }
    }

    const whereAudience = isAcademician
      ? { in: [AUDIENCE_TYPES.ACADEMICIAN, AUDIENCE_TYPES.BOTH] }
      : { in: [AUDIENCE_TYPES.STUDENT, AUDIENCE_TYPES.BOTH] };

    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'active',
        audience: whereAudience,
      },
      include: {
        company: true,
        institution: true,
        applications: {
          select: { id: true, applicantUserId: true },
        },
      },
    });

    const allSkills = await prisma.skill.findMany();
    const skillNameMap = new Map(allSkills.map((s) => [s.id, s.name]));

    const evaluated = opportunities.map((opp) => {
      const parsedReqs: OpportunitySkillRequirement[] = JSON.parse(opp.requiredSkillsJson || '[]').map(
        (r: any) => ({
          ...r,
          skillName: skillNameMap.get(r.skillId) || 'Skill',
        })
      );

      const eligibleDepts: string[] = JSON.parse(opp.eligibleDepartmentsJson || '[]');
      const eligibleBranches: string[] = JSON.parse(opp.eligibleBranchesJson || '[]');

      const matchResult = calculateMatchScore(
        candidateSkills,
        parsedReqs,
        studentAcademic,
        {
          eligibleDepartments: eligibleDepts,
          eligibleBranches: eligibleBranches,
          minCgpa: opp.minCgpa,
        }
      );

      return {
        id: opp.id,
        type: opp.type,
        title: opp.title,
        description: opp.description,
        location: opp.location,
        workMode: opp.workMode,
        stipendOrSalary: opp.stipendOrSalary,
        durationWeeks: opp.durationWeeks,
        minCgpa: opp.minCgpa,
        eligibleDepartments: eligibleDepts,
        eligibleBranches: eligibleBranches,
        audience: opp.audience,
        status: opp.status,
        deadline: opp.deadline ? opp.deadline.toISOString() : null,
        createdAt: opp.createdAt.toISOString(),
        company: opp.company,
        institution: opp.institution,
        requiredSkills: parsedReqs,
        applicantsCount: opp.applications.length,
        matchScorePct: matchResult.scorePct,
        matchExplanation: {
          skillMatchPct: matchResult.skillMatchPct,
          branchMatchPct: matchResult.branchMatchPct,
          eligibilityMatchPct: matchResult.eligibilityMatchPct,
          overallScorePct: matchResult.scorePct,
          isEligible: matchResult.isEligible,
          missingSkills: matchResult.topGaps.map((g) => g.skillName),
          satisfiedSkills: matchResult.topStrengths.map((s) => s.skillName),
        },
      };
    });

    // Sort by match score descending
    evaluated.sort((a, b) => b.matchScorePct - a.matchScorePct);

    res.json({
      recommendations: evaluated,
      studentSkillsCount: candidateSkills.length,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// GET /api/opportunities/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: true,
        institution: true,
        applications: {
          include: {
            applicant: {
              include: {
                studentProfile: true,
                academicianProfile: true,
              },
            },
          },
        },
      },
    });

    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    const allSkills = await prisma.skill.findMany();
    const skillNameMap = new Map(allSkills.map((s) => [s.id, s.name]));

    const parsedReqs = JSON.parse(opp.requiredSkillsJson || '[]').map((r: any) => ({
      ...r,
      skillName: skillNameMap.get(r.skillId) || 'Skill',
    }));

    res.json({
      opportunity: {
        ...opp,
        eligibleDepartments: JSON.parse(opp.eligibleDepartmentsJson || '[]'),
        eligibleBranches: JSON.parse(opp.eligibleBranchesJson || '[]'),
        requiredSkills: parsedReqs,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// POST /api/opportunities (Industry or Institution creates an opportunity)
router.post(
  '/',
  authenticateJwt,
  requireRoles(ROLES.INDUSTRY, ROLES.INSTITUTION_ADMIN),
  validateBody(createOpportunitySchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        type,
        title,
        description,
        location,
        workMode,
        stipendOrSalary,
        durationWeeks,
        minCgpa,
        eligibleDepartments,
        eligibleBranches,
        audience,
        deadline,
        requiredSkills,
      } = req.body;

      const opp = await prisma.opportunity.create({
        data: {
          type,
          title,
          description,
          location,
          workMode: workMode || 'Hybrid',
          stipendOrSalary,
          durationWeeks,
          minCgpa: minCgpa ?? 6.0,
          eligibleDepartmentsJson: JSON.stringify(eligibleDepartments || []),
          eligibleBranchesJson: JSON.stringify(eligibleBranches || []),
          audience,
          deadline: deadline ? new Date(deadline) : null,
          requiredSkillsJson: JSON.stringify(requiredSkills),
          postedByCompanyId: req.user?.role === ROLES.INDUSTRY ? req.user.companyId : null,
          postedByInstitutionId: req.user?.role === ROLES.INSTITUTION_ADMIN ? req.user.institutionId : null,
        },
        include: {
          company: true,
          institution: true,
        },
      });

      res.status(201).json({
        message: 'Opportunity posted successfully!',
        opportunity: opp,
      });
    } catch (error) {
      console.error('Create opportunity error:', error);
      res.status(500).json({ error: 'Failed to create opportunity' });
    }
  }
);

// PUT /api/opportunities/:id (Update opportunity details and required skills)
router.put(
  '/:id',
  authenticateJwt,
  requireRoles(ROLES.INDUSTRY, ROLES.INSTITUTION_ADMIN),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const {
        type,
        title,
        description,
        location,
        workMode,
        stipendOrSalary,
        durationWeeks,
        minCgpa,
        eligibleDepartments,
        eligibleBranches,
        audience,
        deadline,
        requiredSkills,
        status,
        openings,
      } = req.body;

      // Validation for required skills if supplied
      if (requiredSkills) {
        if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
          res.status(400).json({ error: 'At least one required skill is required.' });
          return;
        }
        const seenSkillIds = new Set<string>();
        for (const reqSkill of requiredSkills) {
          if (!reqSkill.skillId) {
            res.status(400).json({ error: 'Skill selection cannot be empty.' });
            return;
          }
          if (seenSkillIds.has(reqSkill.skillId)) {
            res.status(400).json({ error: 'The same skill cannot be added twice.' });
            return;
          }
          seenSkillIds.add(reqSkill.skillId);
          if (reqSkill.weight < 1) {
            res.status(400).json({ error: 'Weight must be greater than 0.' });
            return;
          }
        }
      }

      const existing = await prisma.opportunity.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Opportunity not found.' });
        return;
      }

      const updated = await prisma.opportunity.update({
        where: { id },
        data: {
          type: type !== undefined ? type : undefined,
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          location: location !== undefined ? location : undefined,
          workMode: workMode !== undefined ? workMode : undefined,
          stipendOrSalary: stipendOrSalary !== undefined ? stipendOrSalary : undefined,
          durationWeeks: durationWeeks !== undefined ? Number(durationWeeks) : undefined,
          minCgpa: minCgpa !== undefined ? Number(minCgpa) : undefined,
          eligibleDepartmentsJson: eligibleDepartments !== undefined ? JSON.stringify(eligibleDepartments) : undefined,
          eligibleBranchesJson: eligibleBranches !== undefined ? JSON.stringify(eligibleBranches) : undefined,
          audience: audience !== undefined ? audience : undefined,
          status: status !== undefined ? status : undefined,
          openings: openings !== undefined ? Number(openings) : undefined,
          deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
          requiredSkillsJson: requiredSkills !== undefined ? JSON.stringify(requiredSkills) : undefined,
        },
        include: {
          company: true,
          institution: true,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorEmail: req.user!.email,
          actorRole: req.user!.role,
          action: 'UPDATE_OPPORTUNITY',
          entity: 'Opportunity',
          entityId: id,
          details: JSON.stringify({ title: updated.title, skillsCount: requiredSkills?.length }),
        },
      });

      res.json({
        message: 'Opportunity updated successfully!',
        opportunity: updated,
      });
    } catch (error) {
      console.error('Update opportunity error:', error);
      res.status(500).json({ error: 'Failed to update opportunity' });
    }
  }
);

// DELETE /api/opportunities/:id
router.delete(
  '/:id',
  authenticateJwt,
  requireRoles(ROLES.INDUSTRY, ROLES.INSTITUTION_ADMIN),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      await prisma.opportunity.delete({ where: { id } });
      res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete opportunity' });
    }
  }
);

export default router;
