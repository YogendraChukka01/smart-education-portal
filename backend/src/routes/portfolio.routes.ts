import { Router, Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { authenticateJwt, AuthRequest, requireRoles } from '../middleware/auth.middleware';
import { storageService } from '../services/storage.service';
import { PORTFOLIO_ITEM_TYPES, ROLES } from '@ayush-portal/shared';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});

const getStudentPortfolio = async (userId: string) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      portfolioItems: {
        orderBy: { date: 'desc' },
      },
      skillScores: {
        include: { skill: true },
      },
      user: {
        include: { institution: true },
      },
    },
  });

  if (!student) return null;

  return {
    student: {
      ...student,
      institutionName: student.user.institution?.name || 'Audisankara University',
    },
    items: student.portfolioItems.map((item) => ({
      ...item,
      skillsTagged: item.skillsTaggedJson ? JSON.parse(item.skillsTaggedJson) : [],
    })),
    skills: student.skillScores.map((s) => ({
      skillName: s.skill.name,
      category: s.skill.category,
      score: s.score,
      source: s.source,
    })),
  };
};

// GET /api/portfolio and GET /api/portfolio/me
const handleGetPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getStudentPortfolio(req.user!.id);
    if (!data) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

router.get('/', authenticateJwt, handleGetPortfolio);
router.get('/me', authenticateJwt, handleGetPortfolio);

// GET /api/portfolio/public/:slug (Publicly shareable digital portfolio page)
router.get('/public/:slug', async (req, res: Response) => {
  try {
    const { slug } = req.params;

    const student = await prisma.studentProfile.findUnique({
      where: { portfolioSlug: slug },
      include: {
        portfolioItems: {
          orderBy: { date: 'desc' },
        },
        skillScores: {
          include: { skill: true },
        },
        user: {
          include: { institution: true },
        },
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Portfolio not found for this identifier.' });
      return;
    }

    const verifiedSkillsCount = student.skillScores.filter((s) => s.score >= 75 || s.source === 'verified').length;
    const certificatesCount = student.portfolioItems.filter((i) => i.type === PORTFOLIO_ITEM_TYPES.CERTIFICATE).length;
    const projectsCount = student.portfolioItems.filter((i) => i.type === PORTFOLIO_ITEM_TYPES.PROJECT).length;
    const internshipsCompletedCount = student.portfolioItems.filter(
      (i) => i.type === PORTFOLIO_ITEM_TYPES.INTERNSHIP_COMPLETION
    ).length;

    res.json({
      student: {
        name: student.name,
        degree: student.degree,
        departmentName: student.departmentName,
        branchName: student.branchName,
        year: student.year,
        semester: student.semester,
        cgpa: student.cgpa,
        graduationYear: student.graduationYear,
        portfolioSlug: student.portfolioSlug,
        bio: student.bio || 'Engineering Scholar with focus on scalable software architecture and engineering design.',
        avatarUrl: student.avatarUrl,
        githubUrl: student.githubUrl,
        linkedinUrl: student.linkedinUrl,
        institutionName: student.user.institution?.name || 'Audisankara University',
      },
      skills: student.skillScores.map((s) => ({
        skillName: s.skill.name,
        category: s.skill.category,
        score: s.score,
        source: s.source,
      })),
      portfolioItems: student.portfolioItems.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        issuer: item.issuer,
        description: item.description,
        fileUrl: item.fileUrl,
        projectUrl: item.projectUrl,
        githubUrl: item.githubUrl,
        technologies: item.technologies,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate,
        teamMembers: item.teamMembers,
        verified: item.verified,
        date: item.date.toISOString(),
        skillsTagged: item.skillsTaggedJson ? JSON.parse(item.skillsTaggedJson) : [],
      })),
      stats: {
        verifiedSkillsCount,
        certificatesCount,
        projectsCount,
        internshipsCompletedCount,
      },
    });
  } catch (error) {
    console.error('Public portfolio error:', error);
    res.status(500).json({ error: 'Failed to retrieve public portfolio' });
  }
});

// POST /api/portfolio & POST /api/portfolio/items (Add new portfolio item / project)
const handleCreateItem = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const {
      type,
      title,
      issuer,
      description,
      date,
      fileUrl: explicitFileUrl,
      projectUrl,
      githubUrl,
      technologies,
      role,
      startDate,
      endDate,
      teamMembers,
      skillsTagged,
    } = req.body;

    let fileUrl: string | null = explicitFileUrl || null;
    if (req.file) {
      const saved = await storageService.saveFile(req.file, 'certificates');
      fileUrl = saved.fileUrl;
    }

    let parsedSkills: string[] = [];
    if (skillsTagged) {
      try {
        parsedSkills = Array.isArray(skillsTagged) ? skillsTagged : JSON.parse(skillsTagged);
      } catch {
        parsedSkills = [skillsTagged];
      }
    }

    const item = await prisma.portfolioItem.create({
      data: {
        studentId: student.id,
        type: type || PORTFOLIO_ITEM_TYPES.PROJECT,
        title: title || 'Untitled Project',
        issuer: issuer || 'Audisankara University',
        description: description || '',
        fileUrl,
        projectUrl: projectUrl || null,
        githubUrl: githubUrl || null,
        technologies: typeof technologies === 'string' ? technologies : JSON.stringify(technologies || []),
        role: role || null,
        startDate: startDate || null,
        endDate: endDate || null,
        teamMembers: teamMembers || null,
        verified: true,
        date: date ? new Date(date) : new Date(),
        skillsTaggedJson: JSON.stringify(parsedSkills),
      },
    });

    res.status(201).json({
      message: 'Portfolio item added successfully!',
      item: {
        ...item,
        skillsTagged: parsedSkills,
      },
    });
  } catch (error) {
    console.error('Add portfolio item error:', error);
    res.status(500).json({ error: 'Failed to add portfolio item' });
  }
};

router.post('/', authenticateJwt, requireRoles(ROLES.STUDENT), upload.single('file'), handleCreateItem);
router.post('/items', authenticateJwt, requireRoles(ROLES.STUDENT), upload.single('file'), handleCreateItem);

// PUT /api/portfolio/:id & PUT /api/portfolio/items/:id (Edit project / item)
const handleUpdateItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const existing = await prisma.portfolioItem.findFirst({
      where: { id, studentId: student.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Portfolio item not found' });
      return;
    }

    const {
      type,
      title,
      issuer,
      description,
      fileUrl,
      projectUrl,
      githubUrl,
      technologies,
      role,
      startDate,
      endDate,
      teamMembers,
    } = req.body;

    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: {
        type: type !== undefined ? type : existing.type,
        title: title !== undefined ? title : existing.title,
        issuer: issuer !== undefined ? issuer : existing.issuer,
        description: description !== undefined ? description : existing.description,
        fileUrl: fileUrl !== undefined ? fileUrl : existing.fileUrl,
        projectUrl: projectUrl !== undefined ? projectUrl : existing.projectUrl,
        githubUrl: githubUrl !== undefined ? githubUrl : existing.githubUrl,
        technologies: technologies !== undefined ? (typeof technologies === 'string' ? technologies : JSON.stringify(technologies)) : existing.technologies,
        role: role !== undefined ? role : existing.role,
        startDate: startDate !== undefined ? startDate : existing.startDate,
        endDate: endDate !== undefined ? endDate : existing.endDate,
        teamMembers: teamMembers !== undefined ? teamMembers : existing.teamMembers,
      },
    });

    res.json({
      message: 'Project updated successfully!',
      item: updated,
    });
  } catch (error) {
    console.error('Update portfolio item error:', error);
    res.status(500).json({ error: 'Failed to update portfolio item' });
  }
};

router.put('/:id', authenticateJwt, requireRoles(ROLES.STUDENT), handleUpdateItem);
router.put('/items/:id', authenticateJwt, requireRoles(ROLES.STUDENT), handleUpdateItem);

// DELETE /api/portfolio/:id & DELETE /api/portfolio/items/:id
const handleDeleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const item = await prisma.portfolioItem.findFirst({
      where: { id, studentId: student.id },
    });

    if (!item) {
      res.status(404).json({ error: 'Portfolio item not found' });
      return;
    }

    if (item.fileUrl) {
      await storageService.deleteFile(item.fileUrl);
    }

    await prisma.portfolioItem.delete({ where: { id } });

    res.json({ message: 'Portfolio item removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
};

router.delete('/:id', authenticateJwt, requireRoles(ROLES.STUDENT), handleDeleteItem);
router.delete('/items/:id', authenticateJwt, requireRoles(ROLES.STUDENT), handleDeleteItem);

// =========================================================================
// RESUME BUILDER ENDPOINTS (Auto-populates from platform data + Draft save)
// =========================================================================

// GET /api/portfolio/resume (Retrieve live platform data + active draft)
router.get('/resume', authenticateJwt, requireRoles(ROLES.STUDENT), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        portfolioItems: {
          orderBy: { date: 'desc' },
        },
        skillScores: {
          include: { skill: true },
        },
        user: {
          include: { institution: true },
        },
        resumeDrafts: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const projects = student.portfolioItems.filter((i) => i.type === PORTFOLIO_ITEM_TYPES.PROJECT);
    const internships = student.portfolioItems.filter((i) => i.type === PORTFOLIO_ITEM_TYPES.INTERNSHIP_COMPLETION);
    const certifications = student.portfolioItems.filter((i) => i.type === PORTFOLIO_ITEM_TYPES.CERTIFICATE);
    const achievements = student.portfolioItems.filter((i) => i.type === PORTFOLIO_ITEM_TYPES.ACHIEVEMENT);

    const skills = student.skillScores.map((s) => ({
      id: s.skillId,
      name: s.skill.name,
      category: s.skill.category,
      score: s.score,
      source: s.source,
      isVerified: s.score >= 75 || s.source === 'verified',
    }));

    const activeDraft = student.resumeDrafts.length > 0 ? student.resumeDrafts[0] : null;

    let parsedDraft = null;
    if (activeDraft) {
      parsedDraft = {
        id: activeDraft.id,
        title: activeDraft.title,
        targetRole: activeDraft.targetRole,
        templateId: activeDraft.templateId,
        summary: activeDraft.summary,
        careerObjective: activeDraft.careerObjective,
        selectedSkillIds: activeDraft.selectedSkillIdsJson ? JSON.parse(activeDraft.selectedSkillIdsJson) : [],
        customSkills: activeDraft.customSkillsJson ? JSON.parse(activeDraft.customSkillsJson) : [],
        selectedProjectIds: activeDraft.selectedProjectIdsJson ? JSON.parse(activeDraft.selectedProjectIdsJson) : [],
        selectedInternshipIds: activeDraft.selectedInternshipIdsJson ? JSON.parse(activeDraft.selectedInternshipIdsJson) : [],
        selectedCertIds: activeDraft.selectedCertIdsJson ? JSON.parse(activeDraft.selectedCertIdsJson) : [],
        selectedAchievementIds: activeDraft.selectedAchievementIdsJson ? JSON.parse(activeDraft.selectedAchievementIdsJson) : [],
        additionalSections: activeDraft.additionalSectionsJson ? JSON.parse(activeDraft.additionalSectionsJson) : {},
        customSectionsData: activeDraft.customSectionsDataJson ? JSON.parse(activeDraft.customSectionsDataJson) : {},
        sectionOrder: activeDraft.sectionOrderJson ? JSON.parse(activeDraft.sectionOrderJson) : [],
        updatedAt: activeDraft.updatedAt.toISOString(),
      };
    }

    res.json({
      personalInfo: {
        name: student.name,
        email: student.user.email,
        phone: student.phone || '',
        location: student.location || 'Pune, Maharashtra',
        avatarUrl: student.avatarUrl || student.user.avatarUrl || null,
        linkedinUrl: student.linkedinUrl || '',
        githubUrl: student.githubUrl || '',
        portfolioUrl: student.portfolioSlug ? `/portfolio/${student.portfolioSlug}` : '',
        bio: student.bio || '',
      },
      academicInfo: {
        institutionName: student.user.institution?.name || 'Audisankara University',
        degree: student.degree,
        departmentName: student.departmentName,
        branchName: student.branchName,
        year: student.year,
        semester: student.semester,
        cgpa: student.cgpa,
        graduationYear: student.graduationYear,
        academicRank: student.academicRank || null,
        batchRank: student.batchRank || null,
      },
      skills,
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        issuer: p.issuer,
        description: p.description,
        technologies: p.technologies ? (p.technologies.startsWith('[') ? JSON.parse(p.technologies).join(', ') : p.technologies) : '',
        role: p.role,
        startDate: p.startDate,
        endDate: p.endDate,
        projectUrl: p.projectUrl,
        githubUrl: p.githubUrl,
        verified: p.verified,
      })),
      internships: internships.map((i) => ({
        id: i.id,
        company: i.issuer,
        role: i.role || i.title,
        description: i.description,
        startDate: i.startDate,
        endDate: i.endDate,
        technologies: i.technologies ? (i.technologies.startsWith('[') ? JSON.parse(i.technologies).join(', ') : i.technologies) : '',
        verified: i.verified,
      })),
      certifications: certifications.map((c) => ({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        description: c.description,
        date: c.date.toISOString().split('T')[0],
        verified: c.verified,
      })),
      achievements: achievements.map((a) => ({
        id: a.id,
        title: a.title,
        issuer: a.issuer,
        description: a.description,
        date: a.date.toISOString().split('T')[0],
      })),
      draft: parsedDraft,
    });
  } catch (error) {
    console.error('Fetch resume data error:', error);
    res.status(500).json({ error: 'Failed to retrieve resume data.' });
  }
});

// POST /api/portfolio/resume (Save or Update Resume Builder Draft)
router.post('/resume', authenticateJwt, requireRoles(ROLES.STUDENT), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const {
      title,
      targetRole,
      templateId,
      summary,
      careerObjective,
      selectedSkillIds,
      customSkills,
      selectedProjectIds,
      selectedInternshipIds,
      selectedCertIds,
      selectedAchievementIds,
      additionalSections,
      customSectionsData,
      sectionOrder,
    } = req.body;

    const existingDraft = await prisma.resumeDraft.findFirst({
      where: { studentId: student.id },
      orderBy: { updatedAt: 'desc' },
    });

    let draft;
    if (existingDraft) {
      draft = await prisma.resumeDraft.update({
        where: { id: existingDraft.id },
        data: {
          title: title || 'Placement Resume',
          targetRole: targetRole || 'Java Backend Developer',
          templateId: templateId || 'ats',
          summary: summary !== undefined ? summary : existingDraft.summary,
          careerObjective: careerObjective !== undefined ? careerObjective : existingDraft.careerObjective,
          selectedSkillIdsJson: selectedSkillIds !== undefined ? JSON.stringify(selectedSkillIds) : existingDraft.selectedSkillIdsJson,
          customSkillsJson: customSkills !== undefined ? JSON.stringify(customSkills) : existingDraft.customSkillsJson,
          selectedProjectIdsJson: selectedProjectIds !== undefined ? JSON.stringify(selectedProjectIds) : existingDraft.selectedProjectIdsJson,
          selectedInternshipIdsJson: selectedInternshipIds !== undefined ? JSON.stringify(selectedInternshipIds) : existingDraft.selectedInternshipIdsJson,
          selectedCertIdsJson: selectedCertIds !== undefined ? JSON.stringify(selectedCertIds) : existingDraft.selectedCertIdsJson,
          selectedAchievementIdsJson: selectedAchievementIds !== undefined ? JSON.stringify(selectedAchievementIds) : existingDraft.selectedAchievementIdsJson,
          additionalSectionsJson: additionalSections !== undefined ? JSON.stringify(additionalSections) : existingDraft.additionalSectionsJson,
          customSectionsDataJson: customSectionsData !== undefined ? JSON.stringify(customSectionsData) : existingDraft.customSectionsDataJson,
          sectionOrderJson: sectionOrder !== undefined ? JSON.stringify(sectionOrder) : existingDraft.sectionOrderJson,
          isPrimary: true,
        },
      });
    } else {
      draft = await prisma.resumeDraft.create({
        data: {
          studentId: student.id,
          title: title || 'Placement Resume',
          targetRole: targetRole || 'Java Backend Developer',
          templateId: templateId || 'ats',
          summary: summary || null,
          careerObjective: careerObjective || null,
          selectedSkillIdsJson: JSON.stringify(selectedSkillIds || []),
          customSkillsJson: JSON.stringify(customSkills || []),
          selectedProjectIdsJson: JSON.stringify(selectedProjectIds || []),
          selectedInternshipIdsJson: JSON.stringify(selectedInternshipIds || []),
          selectedCertIdsJson: JSON.stringify(selectedCertIds || []),
          selectedAchievementIdsJson: JSON.stringify(selectedAchievementIds || []),
          additionalSectionsJson: JSON.stringify(additionalSections || {}),
          customSectionsDataJson: JSON.stringify(customSectionsData || {}),
          sectionOrderJson: JSON.stringify(sectionOrder || []),
          isPrimary: true,
        },
      });
    }

    res.json({
      message: 'Resume draft saved successfully!',
      draft: {
        id: draft.id,
        title: draft.title,
        targetRole: draft.targetRole,
        templateId: draft.templateId,
        summary: draft.summary,
        careerObjective: draft.careerObjective,
        selectedSkillIds: draft.selectedSkillIdsJson ? JSON.parse(draft.selectedSkillIdsJson) : [],
        customSkills: draft.customSkillsJson ? JSON.parse(draft.customSkillsJson) : [],
        selectedProjectIds: draft.selectedProjectIdsJson ? JSON.parse(draft.selectedProjectIdsJson) : [],
        selectedInternshipIds: draft.selectedInternshipIdsJson ? JSON.parse(draft.selectedInternshipIdsJson) : [],
        selectedCertIds: draft.selectedCertIdsJson ? JSON.parse(draft.selectedCertIdsJson) : [],
        selectedAchievementIds: draft.selectedAchievementIdsJson ? JSON.parse(draft.selectedAchievementIdsJson) : [],
        additionalSections: draft.additionalSectionsJson ? JSON.parse(draft.additionalSectionsJson) : {},
        customSectionsData: draft.customSectionsDataJson ? JSON.parse(draft.customSectionsDataJson) : {},
        sectionOrder: draft.sectionOrderJson ? JSON.parse(draft.sectionOrderJson) : [],
        updatedAt: draft.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Save resume draft error:', error);
    res.status(500).json({ error: 'Failed to save resume draft.' });
  }
});

export default router;
