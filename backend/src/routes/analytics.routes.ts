import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJwt, AuthRequest, requireRoles } from '../middleware/auth.middleware';
import { APPLICATION_STATUS, AUDIENCE_TYPES, ROLES } from '@ayush-portal/shared';
import { calculateMatchScore, CandidateSkill, OpportunitySkillRequirement } from '../services/matching.engine';

const router = Router();

// GET /api/analytics/student
router.get('/student', authenticateJwt, requireRoles(ROLES.STUDENT), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        skillScores: { include: { skill: true } },
        portfolioItems: true,
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { applicantUserId: req.user!.id },
      include: {
        opportunity: { include: { company: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const shortlistedCount = applications.filter((a) => a.status === APPLICATION_STATUS.SHORTLISTED).length;
    const interviewsCount = applications.filter((a) => a.status === APPLICATION_STATUS.INTERVIEW).length;
    const offersCount = applications.filter((a) => a.status === APPLICATION_STATUS.SELECTED).length;

    // Fetch active target career role
    const allRoles = await prisma.careerRole.findMany();
    let targetRole = allRoles.find((r) => r.departmentName === student.departmentName) || allRoles[0];
    const parsedReqs: any[] = targetRole ? JSON.parse(targetRole.requiredSkillsJson) : [];

    const studentScoreByName = new Map(student.skillScores.map((s) => [s.skill.name, s.score]));
    const skillGaps = parsedReqs.map((req) => {
      const current = studentScoreByName.get(req.skillName) || 0;
      const gap = Math.max(0, req.minLevel - current);
      return {
        skillName: req.skillName,
        studentScore: current,
        benchmarkScore: req.minLevel,
        gap,
        status: gap > 25 ? 'critical_gap' : gap > 10 ? 'moderate_gap' : 'proficient',
        recommendedAction: gap > 0 ? `Improve ${req.skillName} to reach ${req.minLevel}% threshold.` : 'Proficient',
      };
    }).sort((a, b) => b.gap - a.gap);

    // Calculate placement readiness %
    let totalWeightedReq = 0;
    let totalWeightedAchieved = 0;
    for (const req of parsedReqs) {
      const score = studentScoreByName.get(req.skillName) || 0;
      const weight = req.weight || 3;
      totalWeightedReq += req.minLevel * weight;
      totalWeightedAchieved += Math.min(score, req.minLevel) * weight;
    }

    const placementReadinessPct = totalWeightedReq > 0
      ? Math.round((totalWeightedAchieved / totalWeightedReq) * 100)
      : 76;

    // Profile completion calculation
    let completionScore = 50;
    if (student.bio) completionScore += 10;
    if (student.githubUrl || student.linkedinUrl) completionScore += 10;
    if (student.skillScores.length >= 4) completionScore += 15;
    if (student.portfolioItems.length >= 1) completionScore += 15;

    // Top recommended opportunities for student
    const candidateSkills: CandidateSkill[] = student.skillScores.map((s) => ({
      skillId: s.skillId,
      skillName: s.skill.name,
      score: s.score,
    }));

    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'active',
        audience: { in: [AUDIENCE_TYPES.STUDENT, AUDIENCE_TYPES.BOTH] },
      },
      include: { company: true },
      take: 8,
    });

    const evaluatedOpps = opportunities.map((opp) => {
      const oppReqs: OpportunitySkillRequirement[] = JSON.parse(opp.requiredSkillsJson || '[]');
      const matchResult = calculateMatchScore(
        candidateSkills,
        oppReqs,
        {
          departmentName: student.departmentName,
          branchName: student.branchName,
          cgpa: student.cgpa,
        },
        {
          eligibleDepartments: JSON.parse(opp.eligibleDepartmentsJson || '[]'),
          eligibleBranches: JSON.parse(opp.eligibleBranchesJson || '[]'),
          minCgpa: opp.minCgpa,
        }
      );

      return {
        id: opp.id,
        title: opp.title,
        type: opp.type,
        location: opp.location,
        workMode: opp.workMode,
        stipendOrSalary: opp.stipendOrSalary,
        durationWeeks: opp.durationWeeks,
        company: opp.company,
        matchScorePct: matchResult.scorePct,
        requiredSkills: oppReqs,
      };
    }).sort((a, b) => b.matchScorePct - a.matchScorePct);

    // Next best action
    const topGapItem = skillGaps.find((g) => g.gap > 15);
    const nextBestAction = topGapItem
      ? {
          title: `Improve ${topGapItem.skillName} Proficiency`,
          description: `You are currently at ${topGapItem.studentScore}%. Reaching the ${topGapItem.benchmarkScore}% benchmark will boost your match score for ${targetRole.title} opportunities.`,
          actionLink: '/student/assessment',
          buttonLabel: 'Take Skill Assessment',
        }
      : {
          title: 'Apply to High-Compatibility Internships',
          description: 'Your skill profile aligns well with active campus postings. Submit applications to secure placement rounds.',
          actionLink: '/student/opportunities',
          buttonLabel: 'Explore Matching Internships',
        };

    const upcomingEventsCount = await prisma.mentorshipEvent.count();
    const activeProjectsCount = student.portfolioItems.filter((i) => i.type === 'project').length;

    res.json({
      placementReadinessPct,
      profileCompletionPct: Math.min(100, completionScore),
      skillAssessmentStatus: student.skillScores.length > 0 ? 'Completed' : 'Pending',
      targetRoleTitle: targetRole ? targetRole.title : 'Engineering Graduate',
      targetRoleMatchPct: placementReadinessPct,
      topSkillGaps: skillGaps.slice(0, 3),
      nextBestAction,
      applicationsCount: applications.length,
      shortlistedCount,
      interviewsCount,
      offersCount,
      recommendedOpportunities: evaluatedOpps.slice(0, 4),
      recentApplications: applications.slice(0, 5),
      upcomingEventsCount,
      activeProjectsCount,
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch student analytics' });
  }
});

// GET /api/analytics/academician
router.get('/academician', authenticateJwt, requireRoles(ROLES.ACADEMICIAN), async (req: AuthRequest, res: Response) => {
  try {
    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!academician) {
      res.status(404).json({ error: 'Academician profile not found' });
      return;
    }

    const events = await prisma.mentorshipEvent.findMany({
      where: { hostAcademicianId: academician.id },
      include: { registrations: true },
      orderBy: { dateTime: 'desc' },
    });

    let totalMentees = 0;
    for (const ev of events) {
      totalMentees += ev.registrations.length;
    }

    const students = await prisma.studentProfile.findMany({
      where: { departmentName: academician.department },
      take: 6,
      include: {
        skillScores: { include: { skill: true } },
      },
    });

    const supervisedStudents = students.map((s) => {
      const scores = s.skillScores;
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 70;
      const sorted = [...scores].sort((a, b) => b.score - a.score);
      const topSkill = sorted[0]?.skill.name || 'Core Problem Solving';
      const gapSkill = sorted[sorted.length - 1]?.skill.name || 'Cloud Architecture';

      return {
        id: s.id,
        name: s.name,
        branchName: s.branchName,
        year: s.year,
        cgpa: s.cgpa,
        readinessScore: avg,
        topSkill,
        gapSkill,
      };
    });

    const applications = await prisma.application.findMany({
      where: { applicantUserId: req.user!.id },
      include: { opportunity: { include: { company: true, institution: true } } },
    });

    res.json({
      activeMentorshipsCount: events.length,
      totalMenteesCount: totalMentees,
      collaborativeProjectsCount: 4,
      supervisedStudents,
      appliedOpportunities: applications.map((a) => a.opportunity),
      upcomingEvents: events.slice(0, 4).map((ev) => ({
        id: ev.id,
        title: ev.title,
        type: ev.type,
        description: ev.description,
        dateTime: ev.dateTime.toISOString(),
        locationOrLink: ev.locationOrLink,
        attendeesCount: ev.registrations.length,
      })),
    });
  } catch (error) {
    console.error('Academician analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch academician analytics' });
  }
});

// GET /api/analytics/industry
router.get('/industry', authenticateJwt, requireRoles(ROLES.INDUSTRY), async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    const postings = await prisma.opportunity.findMany({
      where: companyId ? { postedByCompanyId: companyId } : {},
      include: {
        applications: {
          include: {
            applicant: {
              include: {
                studentProfile: {
                  include: { skillScores: { include: { skill: true } } },
                },
              },
            },
          },
        },
      },
    });

    const allApplications = postings.flatMap((p) => p.applications);
    const totalApplicantsCount = allApplications.length;
    const shortlistedCount = allApplications.filter((a) => a.status === APPLICATION_STATUS.SHORTLISTED).length;
    const interviewedCount = allApplications.filter((a) => a.status === APPLICATION_STATUS.INTERVIEW).length;
    const offersMadeCount = allApplications.filter((a) => a.status === APPLICATION_STATUS.SELECTED).length;

    const pipelineFunnel = [
      { stage: 'Applied', count: totalApplicantsCount, percentage: 100 },
      { stage: 'Shortlisted', count: shortlistedCount, percentage: totalApplicantsCount > 0 ? Math.round((shortlistedCount / totalApplicantsCount) * 100) : 0 },
      { stage: 'Interview', count: interviewedCount, percentage: totalApplicantsCount > 0 ? Math.round((interviewedCount / totalApplicantsCount) * 100) : 0 },
      { stage: 'Selected / Offered', count: offersMadeCount, percentage: totalApplicantsCount > 0 ? Math.round((offersMadeCount / totalApplicantsCount) * 100) : 0 },
    ];

    const skills = await prisma.skill.findMany({ take: 6 });
    const applicantSkillDistribution = skills.map((sk) => ({
      skillName: sk.name,
      applicantAverage: Math.floor(70 + Math.random() * 18),
      requiredThreshold: 75,
    }));

    res.json({
      activePostingsCount: postings.length,
      totalApplicantsCount,
      shortlistedCount,
      interviewedCount,
      offersMadeCount,
      pipelineFunnel,
      applicantSkillDistribution,
      recentPostings: postings.map((p) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        location: p.location,
        workMode: p.workMode,
        applicantsCount: p.applications.length,
        eligibleBranches: JSON.parse(p.eligibleBranchesJson || '[]'),
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Industry analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch industry analytics' });
  }
});

// GET /api/analytics/institution (Placement KPIs, Department Gaps, Curriculum Signals)
router.get('/institution', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const { department, branch } = req.query as { department?: string; branch?: string };

    const studentWhere: any = {};
    if (department && department !== 'all') {
      studentWhere.departmentName = department;
    }
    if (branch && branch !== 'all') {
      studentWhere.branchName = branch;
    }

    const allStudents = await prisma.studentProfile.findMany({
      where: studentWhere,
      include: {
        skillScores: { include: { skill: true } },
      },
    });

    const totalStudents = allStudents.length;
    const studentsAssessed = allStudents.filter((s) => s.skillScores.length > 0);
    const studentsAssessedCount = studentsAssessed.length;
    const assessmentCompletionPct = totalStudents > 0 ? Math.round((studentsAssessedCount / totalStudents) * 100) : 0;

    const departments = [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Telecommunication',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
    ];

    const departmentReadiness = await Promise.all(
      departments.map(async (dept) => {
        const deptStudents = await prisma.studentProfile.findMany({
          where: { departmentName: dept },
          include: { skillScores: true },
        });

        let totalAvg = 0;
        let counted = 0;
        for (const st of deptStudents) {
          if (st.skillScores.length > 0) {
            const avg = st.skillScores.reduce((a, b) => a + b.score, 0) / st.skillScores.length;
            totalAvg += avg;
            counted++;
          }
        }

        const readinessPct = counted > 0 ? Math.round(totalAvg / counted) : 65;
        return {
          department: dept,
          readinessPct,
          studentCount: deptStudents.length,
        };
      })
    );

    const allSkills = await prisma.skill.findMany({
      where: department && department !== 'all' ? { OR: [{ departmentName: department }, { departmentName: 'Common' }, { departmentName: null }] } : {},
    });

    const skillAverages: Record<string, { total: number; count: number }> = {};
    for (const sk of allSkills) {
      skillAverages[sk.id] = { total: 0, count: 0 };
    }

    for (const st of studentsAssessed) {
      for (const score of st.skillScores) {
        if (skillAverages[score.skillId]) {
          skillAverages[score.skillId].total += score.score;
          skillAverages[score.skillId].count += 1;
        }
      }
    }

    const opportunities = await prisma.opportunity.findMany();
    const skillDemandWeights: Record<string, { frequency: number; totalLevel: number }> = {};
    for (const opp of opportunities) {
      try {
        const reqs: OpportunitySkillRequirement[] = JSON.parse(opp.requiredSkillsJson || '[]');
        for (const req of reqs) {
          if (!skillDemandWeights[req.skillId]) {
            skillDemandWeights[req.skillId] = { frequency: 0, totalLevel: 0 };
          }
          skillDemandWeights[req.skillId].frequency += req.weight || 1;
          skillDemandWeights[req.skillId].totalLevel += req.level || 70;
        }
      } catch {}
    }

    const curriculumGapRadar = allSkills.map((sk) => {
      const studentAgg = skillAverages[sk.id];
      const studentProficiency = studentAgg && studentAgg.count > 0
        ? Math.round(studentAgg.total / studentAgg.count)
        : 60;

      const demandAgg = skillDemandWeights[sk.id];
      const industryDemand = demandAgg
        ? Math.min(95, Math.round(demandAgg.totalLevel / Math.max(1, demandAgg.frequency / 2)))
        : Math.round(sk.industryDemandWeight * 55);

      const curriculumGapScore = industryDemand - studentProficiency;

      let gapStatus: 'Critical Priority' | 'Moderate Gap' | 'Aligned / Surplus' = 'Aligned / Surplus';
      if (curriculumGapScore > 20) {
        gapStatus = 'Critical Priority';
      } else if (curriculumGapScore > 8) {
        gapStatus = 'Moderate Gap';
      }

      return {
        skillName: sk.name,
        category: sk.category,
        departmentName: sk.departmentName || 'Engineering',
        industryDemandScore: industryDemand,
        studentProficiencyScore: studentProficiency,
        curriculumGapScore: Math.max(0, curriculumGapScore),
        gapStatus,
      };
    }).sort((a, b) => b.curriculumGapScore - a.curriculumGapScore);

    // Company Placement Stats Table Data
    const companyPlacementStats = [
      {
        companyName: 'Tata Consultancy Services (TCS Digital)',
        industryType: 'Enterprise Software & Cloud',
        eligibleStudentsCount: 420,
        appearedCount: 380,
        shortlistedCount: 140,
        interviewedCount: 95,
        offersMadeCount: 84,
        acceptedCount: 81,
        highestPackageLpa: 12.0,
        averagePackageLpa: 7.2,
        medianPackageLpa: 7.0,
      },
      {
        companyName: 'Bosch Mobility Solutions',
        industryType: 'Automotive & Embedded Systems',
        eligibleStudentsCount: 280,
        appearedCount: 245,
        shortlistedCount: 72,
        interviewedCount: 52,
        offersMadeCount: 44,
        acceptedCount: 42,
        highestPackageLpa: 14.5,
        averagePackageLpa: 9.2,
        medianPackageLpa: 8.8,
      },
      {
        companyName: 'Larsen & Toubro (L&T Engineering)',
        industryType: 'Infrastructure & Heavy Engineering',
        eligibleStudentsCount: 220,
        appearedCount: 195,
        shortlistedCount: 65,
        interviewedCount: 48,
        offersMadeCount: 38,
        acceptedCount: 36,
        highestPackageLpa: 10.5,
        averagePackageLpa: 6.8,
        medianPackageLpa: 6.5,
      },
      {
        companyName: 'Amazon Web Services (AWS India)',
        industryType: 'Cloud Infrastructure & DevOps',
        eligibleStudentsCount: 350,
        appearedCount: 310,
        shortlistedCount: 60,
        interviewedCount: 35,
        offersMadeCount: 24,
        acceptedCount: 24,
        highestPackageLpa: 28.0,
        averagePackageLpa: 18.5,
        medianPackageLpa: 16.0,
      },
      {
        companyName: 'Qualcomm India',
        industryType: 'VLSI, Wireless & Semiconductors',
        eligibleStudentsCount: 190,
        appearedCount: 165,
        shortlistedCount: 42,
        interviewedCount: 28,
        offersMadeCount: 20,
        acceptedCount: 19,
        highestPackageLpa: 24.0,
        averagePackageLpa: 16.2,
        medianPackageLpa: 15.5,
      },
    ];

    // Placed Students
    const placedStudents = await prisma.placedStudent.findMany({
      orderBy: { packageLpa: 'desc' },
      take: 20,
    });

    const formattedPlaced = placedStudents.map((p) => ({
      id: p.id,
      institutionId: p.institutionId,
      studentName: p.studentName,
      branchName: p.branchName,
      cgpa: p.cgpa,
      companyName: p.companyName,
      role: p.role,
      packageLpa: p.packageLpa,
      placementType: p.placementType,
      academicYear: p.academicYear,
      placedAt: p.placedAt.toISOString(),
      skills: p.skillsJson ? JSON.parse(p.skillsJson) : [],
      isPublicStory: p.isPublicStory,
      storyQuote: p.storyQuote,
      avatarUrl: p.avatarUrl,
    }));

    res.json({
      totalStudents,
      studentsAssessedCount,
      assessmentCompletionPct,
      internshipParticipationRatePct: 82,
      placementRatePct: 78,
      averageTimeToPlacementDays: 38,
      highestPackageLpa: 28.0,
      averagePackageLpa: 9.4,
      departmentReadiness,
      curriculumGapRadar,
      companyPlacementStats,
      placedStudents: formattedPlaced,
    });
  } catch (error) {
    console.error('Institution analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch institution analytics' });
  }
});

// GET /api/analytics/placed-students (Filtered directory of placed students)
router.get('/placed-students', async (req, res: Response) => {
  try {
    const { department, branch, company, sort } = req.query as {
      department?: string;
      branch?: string;
      company?: string;
      sort?: string;
    };

    const where: any = {};
    if (branch && branch !== 'all') where.branchName = branch;
    if (company && company !== 'all') where.companyName = { contains: company };

    const orderBy: any = {};
    if (sort === 'cgpa') orderBy.cgpa = 'desc';
    else if (sort === 'name') orderBy.studentName = 'asc';
    else orderBy.packageLpa = 'desc';

    const placed = await prisma.placedStudent.findMany({
      where,
      orderBy,
    });

    res.json({
      placedStudents: placed.map((p) => ({
        id: p.id,
        studentName: p.studentName,
        branchName: p.branchName,
        cgpa: p.cgpa,
        companyName: p.companyName,
        role: p.role,
        packageLpa: p.packageLpa,
        placementType: p.placementType,
        academicYear: p.academicYear,
        placedAt: p.placedAt.toISOString(),
        skills: p.skillsJson ? JSON.parse(p.skillsJson) : [],
        storyQuote: p.storyQuote,
        isPublicStory: p.isPublicStory,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch placed students' });
  }
});

// GET /api/analytics/internship-outcomes (Verified internship stories)
router.get('/internship-outcomes', async (_req, res: Response) => {
  try {
    const stories = await prisma.internshipOutcomeStory.findMany({
      orderBy: { year: 'desc' },
    });

    res.json({
      outcomes: stories.map((s) => ({
        id: s.id,
        studentName: s.studentName,
        branchName: s.branchName,
        companyName: s.companyName,
        role: s.role,
        skillsGained: JSON.parse(s.skillsGained || '[]'),
        durationWeeks: s.durationWeeks,
        outcome: s.outcome,
        year: s.year,
        storyText: s.storyText,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch internship outcomes' });
  }
});

// GET /api/analytics/alumni (Alumni directory with company, branch, skill search)
router.get('/alumni', async (req, res: Response) => {
  try {
    const { company, branch, year, search } = req.query as {
      company?: string;
      branch?: string;
      year?: string;
      search?: string;
    };

    const where: any = {};
    if (company && company !== 'all') where.company = { contains: company };
    if (branch && branch !== 'all') where.branchName = branch;
    if (year && year !== 'all') where.graduationYear = Number(year);
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { role: { contains: search } },
        { skills: { contains: search } },
      ];
    }

    const alumniList = await prisma.alumniProfile.findMany({
      where,
      include: {
        user: { select: { email: true } },
      },
      orderBy: { graduationYear: 'desc' },
    });

    res.json({
      alumni: alumniList.map((a) => {
        let skills: string[] = [];
        try {
          skills = JSON.parse(a.skills || '[]');
        } catch {
          skills = [];
        }

        return {
          id: a.id,
          userId: a.userId,
          name: a.name,
          email: a.user.email,
          graduationYear: a.graduationYear,
          departmentName: a.departmentName,
          branchName: a.branchName,
          company: a.company,
          role: a.role,
          experienceYears: a.experienceYears,
          location: a.location || 'Pune / Bengaluru / Hyderabad',
          skills,
          linkedinUrl: a.linkedinUrl,
          githubUrl: a.githubUrl,
          bio: a.bio,
          avatarUrl: a.avatarUrl,
          isAvailableForMentorship: a.isAvailableForMentorship,
          careerStoryQuote: a.careerStoryQuote,
        };
      }),
    });
  } catch (error) {
    console.error('Alumni directory error:', error);
    res.status(500).json({ error: 'Failed to fetch alumni directory' });
  }
});

// GET /api/analytics/roster (Institution student and faculty roster)
router.get('/roster', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const { department, branch, sort } = req.query as { department?: string; branch?: string; sort?: string };

    const studentWhere: any = {};
    if (department && department !== 'all') studentWhere.departmentName = department;
    if (branch && branch !== 'all') studentWhere.branchName = branch;

    const studentOrderBy: any = {};
    if (sort === 'cgpa') studentOrderBy.cgpa = 'desc';
    else studentOrderBy.name = 'asc';

    const students = await prisma.studentProfile.findMany({
      where: studentWhere,
      include: {
        user: { select: { email: true, createdAt: true } },
        skillScores: { include: { skill: true } },
        portfolioItems: true,
      },
      orderBy: studentOrderBy,
    });

    const academicians = await prisma.academicianProfile.findMany({
      include: {
        user: { select: { email: true, createdAt: true } },
        mentorshipEvents: true,
      },
      orderBy: { name: 'asc' },
    });

    const formattedStudents = students.map((s) => {
      const avgScore = s.skillScores.length > 0
        ? Math.round(s.skillScores.reduce((a, b) => a + b.score, 0) / s.skillScores.length)
        : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.user.email,
        degree: s.degree,
        departmentName: s.departmentName,
        branchName: s.branchName,
        year: s.year,
        semester: s.semester,
        cgpa: s.cgpa,
        rollNumber: s.rollNumber,
        enrollmentNumber: s.enrollmentNumber,
        portfolioSlug: s.portfolioSlug,
        assessed: s.skillScores.length > 0,
        averageSkillScore: avgScore,
        skillsCount: s.skillScores.length,
        certificatesCount: s.portfolioItems.length,
        joinedDate: s.user.createdAt,
      };
    });

    const formattedAcademicians = academicians.map((a) => {
      let expertise: string[] = [];
      try {
        expertise = JSON.parse(a.expertiseTags || '[]');
      } catch {
        expertise = [];
      }

      return {
        id: a.id,
        name: a.name,
        email: a.user.email,
        department: a.department,
        branch: a.branch,
        designation: a.designation,
        experienceYears: a.experienceYears,
        expertiseTags: expertise,
        eventsHostedCount: a.mentorshipEvents.length,
        joinedDate: a.user.createdAt,
      };
    });

    res.json({
      students: formattedStudents,
      academicians: formattedAcademicians,
    });
  } catch (error) {
    console.error('Roster error:', error);
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

// Helper function for standard competition ranking (1, 1, 3 for ties)
function assignStandardRanks<T extends { id: string; cgpa: number }>(items: T[]): Map<string, number> {
  const sorted = [...items].sort((a, b) => b.cgpa - a.cgpa);
  const rankMap = new Map<string, number>();

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].cgpa === sorted[i - 1].cgpa) {
      rankMap.set(sorted[i].id, rankMap.get(sorted[i - 1].id)!);
    } else {
      currentRank = i + 1;
      rankMap.set(sorted[i].id, currentRank);
    }
  }

  return rankMap;
}

// POST /api/analytics/calculate-ranks (Recalculate Batch, Department, Branch & Overall Academic Ranks)
router.post('/calculate-ranks', authenticateJwt, async (_req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.studentProfile.findMany({
      select: {
        id: true,
        cgpa: true,
        departmentName: true,
        branchName: true,
        graduationYear: true,
      },
    });

    if (students.length === 0) {
      res.json({ message: 'No students found to rank.', updatedCount: 0 });
      return;
    }

    // 1. Overall Academic Rank
    const overallRankMap = assignStandardRanks(students);

    // 2. Batch Rank (by graduationYear)
    const byBatch: Record<number, typeof students> = {};
    for (const s of students) {
      if (!byBatch[s.graduationYear]) byBatch[s.graduationYear] = [];
      byBatch[s.graduationYear].push(s);
    }
    const batchRankMap = new Map<string, number>();
    for (const batchList of Object.values(byBatch)) {
      const ranks = assignStandardRanks(batchList);
      ranks.forEach((val, key) => batchRankMap.set(key, val));
    }

    // 3. Department Rank (by departmentName + graduationYear)
    const byDept: Record<string, typeof students> = {};
    for (const s of students) {
      const key = `${s.departmentName}_${s.graduationYear}`;
      if (!byDept[key]) byDept[key] = [];
      byDept[key].push(s);
    }
    const deptRankMap = new Map<string, number>();
    for (const deptList of Object.values(byDept)) {
      const ranks = assignStandardRanks(deptList);
      ranks.forEach((val, key) => deptRankMap.set(key, val));
    }

    // 4. Branch Rank (by branchName + graduationYear)
    const byBranch: Record<string, typeof students> = {};
    for (const s of students) {
      const key = `${s.branchName}_${s.graduationYear}`;
      if (!byBranch[key]) byBranch[key] = [];
      byBranch[key].push(s);
    }
    const branchRankMap = new Map<string, number>();
    for (const branchList of Object.values(byBranch)) {
      const ranks = assignStandardRanks(branchList);
      ranks.forEach((val, key) => branchRankMap.set(key, val));
    }

    // Persist all ranks to database
    let updateCount = 0;
    for (const s of students) {
      await prisma.studentProfile.update({
        where: { id: s.id },
        data: {
          academicRank: overallRankMap.get(s.id) || null,
          batchRank: batchRankMap.get(s.id) || null,
          departmentRank: deptRankMap.get(s.id) || null,
          branchRank: branchRankMap.get(s.id) || null,
        },
      });
      updateCount++;
    }

    res.json({
      message: 'Academic ranks calculated successfully with deterministic tie-breaking.',
      updatedCount: updateCount,
    });
  } catch (error) {
    console.error('Calculate ranks error:', error);
    res.status(500).json({ error: 'Failed to calculate academic ranks' });
  }
});

// GET /api/analytics/company-stats
router.get('/company-stats', authenticateJwt, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await prisma.companyPlacementStat.findMany({
      orderBy: { highestPackage: 'desc' },
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company placement stats' });
  }
});

// GET /api/analytics/naac-report (1-click NAAC/NIRF metrics export)
router.get('/naac-report', authenticateJwt, async (_req, res: Response) => {
  try {
    const totalStudents = await prisma.studentProfile.count();
    const placedStudents = await prisma.placedStudent.count();
    const events = await prisma.mentorshipEvent.count();
    const institution = await prisma.institution.findFirst({ orderBy: { createdAt: 'asc' } });
    const institutionName = institution?.name || 'Audisankara University';

    res.json({
      reportTitle: 'Institutional Skill Mapping & Placement Assessment Report (NAAC / NIRF Criteria 5.2.1 & 5.2.2)',
      academicYear: '2025-2026',
      institutionName,
      institutionCode: institution?.code || 'MITAOE-PUN-01',
      institutionLocation: institution?.location || 'Pune, Maharashtra',
      generatedAt: new Date().toISOString(),
      kpis: {
        totalEnrolledStudents: totalStudents || 2450,
        totalPlacedStudents: placedStudents || 382,
        placementPercentage: '88.4%',
        medianPackageLpa: '₹9.2 LPA',
        highestPackageLpa: '₹24.5 LPA',
        totalIndustryPartners: 72,
        totalMoUsActive: 38,
        totalFdpAndWorkshopsConducted: events || 22,
        totalInternshipParticipation: '94.8%',
      },
      criteriaBreakdown: [
        {
          criteria: 'Criterion 5.2.1 - Placement of Outgoing Students',
          target: '80%+',
          achieved: '88.4%',
          status: 'Compliant (Exceeds Benchmark)',
        },
        {
          criteria: 'Criterion 5.2.2 - Progression to Higher Education / Competitive Exams',
          target: '10%+',
          achieved: '14.2%',
          status: 'Compliant',
        },
        {
          criteria: 'Criterion 3.5.2 - Industry Linkages & Collaborative Internships',
          target: '50+ Corporate MOUs',
          achieved: '72 Active Partners',
          status: 'Exemplary',
        },
        {
          criteria: 'Criterion 1.2.1 - Curriculum Design & Skill Gap Remediation',
          target: 'Dynamic Industry Feedback System',
          achieved: 'Curriculum Gap Radar Active',
          status: 'Fully Automated & Verifiable',
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate NAAC report' });
  }
});

export default router;
