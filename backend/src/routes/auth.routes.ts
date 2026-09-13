import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { authenticateJwt, AuthRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { ROLES, UserRole } from '@ayush-portal/shared';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.STUDENT, ROLES.ACADEMICIAN, ROLES.INDUSTRY, ROLES.INSTITUTION_ADMIN, ROLES.ALUMNI], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  institutionId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  // Profile specific fields
  name: z.string().min(2, 'Name must be at least 2 characters'),
  degree: z.string().optional().nullable(),
  departmentName: z.string().optional().nullable(),
  branchName: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1).max(5).optional().nullable(),
  semester: z.coerce.number().int().min(1).max(8).optional().nullable(),
  cgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  graduationYear: z.coerce.number().int().min(1970).max(2035).optional().nullable(),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  expertiseTags: z.union([z.array(z.string()), z.string().transform((s) => [s])]).optional().nullable(),
  companyName: z.string().optional().nullable(),
  industryType: z.string().optional().nullable(),
  companyDescription: z.string().optional().nullable(),
  institutionName: z.string().optional().nullable(),
  institutionType: z.string().optional().nullable(),
  // Alumni specific
  company: z.string().optional().nullable(),
  roleInCompany: z.string().optional().nullable(),
  experienceYears: z.coerce.number().min(0).max(50).optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base || 'scholar'}-${rand}`;
}

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      password,
      role,
      institutionId,
      companyId,
      name,
      degree,
      departmentName,
      branchName,
      year,
      semester,
      cgpa,
      graduationYear,
      department,
      designation,
      specialization,
      expertiseTags,
      companyName,
      industryType,
      companyDescription,
      institutionName,
      institutionType,
      company,
      roleInCompany,
      experienceYears,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists. Please sign in instead.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let assignedCompanyId = companyId || null;
    let assignedInstitutionId = institutionId || null;

    if (role === ROLES.INDUSTRY && !assignedCompanyId && companyName && companyName.trim()) {
      const cName = companyName.trim();
      let comp = await prisma.company.findFirst({
        where: { name: cName },
      });
      if (!comp) {
        comp = await prisma.company.create({
          data: {
            name: cName,
            industryType: industryType || 'Enterprise Software & Cloud Systems',
            description: companyDescription || `${cName} talent acquisition and corporate recruitment.`,
            recruiterName: name,
            recruiterEmail: normalizedEmail,
          },
        });
      }
      assignedCompanyId = comp.id;
    }

    if (role === ROLES.INSTITUTION_ADMIN && !assignedInstitutionId && institutionName && institutionName.trim()) {
      const iName = institutionName.trim();
      let inst = await prisma.institution.findFirst({
        where: { name: iName },
      });
      if (!inst) {
        inst = await prisma.institution.create({
          data: {
            name: iName,
            type: institutionType || 'Engineering Autonomous College',
            code: `INST-${Math.floor(1000 + Math.random() * 9000)}`,
            placementOfficerName: name,
            placementOfficerEmail: normalizedEmail,
          },
        });
      }
      assignedInstitutionId = inst.id;
    }

    // Default to primary institution if none specified for academic/student/alumni roles
    if (!assignedInstitutionId && [ROLES.STUDENT, ROLES.ACADEMICIAN, ROLES.ALUMNI].includes(role)) {
      const defaultInst = await prisma.institution.findFirst({ orderBy: { createdAt: 'asc' } });
      if (defaultInst) {
        assignedInstitutionId = defaultInst.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        institutionId: assignedInstitutionId,
        companyId: assignedCompanyId,
      },
    });

    // Create role-specific profiles
    if (role === ROLES.STUDENT) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          name: name ? name.trim() : 'Student',
          degree: degree || 'B.Tech',
          departmentName: departmentName || 'Computer Science & Engineering',
          branchName: branchName || 'Computer Science & Engineering',
          year: year ? Number(year) : 3,
          semester: semester ? Number(semester) : 6,
          cgpa: cgpa !== undefined && cgpa !== null ? Number(cgpa) : 8.0,
          graduationYear: graduationYear ? Number(graduationYear) : 2026,
          portfolioSlug: generateSlug(name || 'student'),
        },
      });
    } else if (role === ROLES.ACADEMICIAN) {
      let parsedTags = ['Distributed Systems', 'Software Engineering'];
      if (expertiseTags) {
        parsedTags = Array.isArray(expertiseTags) ? expertiseTags : [expertiseTags];
      } else if (specialization) {
        parsedTags = [specialization, 'Engineering Pedagogy'];
      }
      await prisma.academicianProfile.create({
        data: {
          userId: user.id,
          name: name ? name.trim() : 'Faculty Member',
          department: department || departmentName || 'Computer Science & Engineering',
          designation: designation || 'Assistant Professor',
          specialization: specialization || null,
          expertiseTags: JSON.stringify(parsedTags),
        },
      });
    } else if (role === ROLES.ALUMNI) {
      const alumCompany = company || companyName || 'Industry Partner';
      const alumRole = roleInCompany || designation || 'Software Engineer';
      await prisma.alumniProfile.create({
        data: {
          userId: user.id,
          name: name ? name.trim() : 'Alumni Member',
          graduationYear: graduationYear ? Number(graduationYear) : 2022,
          departmentName: departmentName || 'Computer Science & Engineering',
          branchName: branchName || 'Computer Science & Engineering',
          company: alumCompany,
          role: alumRole,
          experienceYears: experienceYears !== undefined && experienceYears !== null ? Number(experienceYears) : 3,
          skills: JSON.stringify(['Java', 'Distributed Systems', 'System Design']),
          isAvailableForMentorship: true,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        studentProfile: true,
        academicianProfile: true,
        alumniProfile: true,
        institution: true,
        company: true,
      },
    });

    if (!fullUser) {
      res.status(500).json({ error: 'Failed to retrieve registered user profile.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = fullUser;

    res.status(201).json({
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Registration failed due to an internal server error.' });
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: true,
        academicianProfile: true,
        alumniProfile: true,
        institution: true,
        company: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed due to an internal server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        studentProfile: {
          include: {
            skillScores: {
              include: { skill: true },
            },
          },
        },
        academicianProfile: true,
        alumniProfile: true,
        institution: true,
        company: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/auth/profile (Update profile for current user across all roles)
router.put('/profile', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const body = req.body;

    // Common avatarUrl update on User model if supplied
    if (body.avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: body.avatarUrl },
      });
    }

    if (role === ROLES.STUDENT) {
      const updated = await prisma.studentProfile.update({
        where: { userId },
        data: {
          name: body.name !== undefined ? body.name : undefined,
          bio: body.bio !== undefined ? body.bio : undefined,
          careerGoal: body.careerGoal !== undefined ? body.careerGoal : undefined,
          degree: body.degree !== undefined ? body.degree : undefined,
          departmentName: body.departmentName !== undefined ? body.departmentName : undefined,
          branchName: body.branchName !== undefined ? body.branchName : undefined,
          year: body.year !== undefined ? Number(body.year) : undefined,
          semester: body.semester !== undefined ? Number(body.semester) : undefined,
          rollNumber: body.rollNumber !== undefined ? body.rollNumber : undefined,
          enrollmentNumber: body.enrollmentNumber !== undefined ? body.enrollmentNumber : undefined,
          cgpa: body.cgpa !== undefined ? Number(body.cgpa) : undefined,
          graduationYear: body.graduationYear !== undefined ? Number(body.graduationYear) : undefined,
          phone: body.phone !== undefined ? body.phone : undefined,
          location: body.location !== undefined ? body.location : undefined,
          avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : undefined,
          githubUrl: body.githubUrl !== undefined ? body.githubUrl : undefined,
          linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : undefined,
          resumeUrl: body.resumeUrl !== undefined ? body.resumeUrl : undefined,
        },
      });
      res.json({ message: 'Student profile updated successfully', profile: updated });
      return;
    }

    if (role === ROLES.ACADEMICIAN) {
      const updated = await prisma.academicianProfile.update({
        where: { userId },
        data: {
          name: body.name !== undefined ? body.name : undefined,
          department: body.department !== undefined ? body.department : undefined,
          branch: body.branch !== undefined ? body.branch : undefined,
          designation: body.designation !== undefined ? body.designation : undefined,
          experienceYears: body.experienceYears !== undefined ? Number(body.experienceYears) : undefined,
          specialization: body.specialization !== undefined ? body.specialization : undefined,
          researchInterests: body.researchInterests !== undefined ? (typeof body.researchInterests === 'string' ? body.researchInterests : JSON.stringify(body.researchInterests)) : undefined,
          publications: body.publications !== undefined ? (typeof body.publications === 'string' ? body.publications : JSON.stringify(body.publications)) : undefined,
          labExpertise: body.labExpertise !== undefined ? (typeof body.labExpertise === 'string' ? body.labExpertise : JSON.stringify(body.labExpertise)) : undefined,
          expertiseTags: body.expertiseTags !== undefined ? (typeof body.expertiseTags === 'string' ? body.expertiseTags : JSON.stringify(body.expertiseTags)) : undefined,
          bio: body.bio !== undefined ? body.bio : undefined,
          phone: body.phone !== undefined ? body.phone : undefined,
          avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : undefined,
          linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : undefined,
          orcidUrl: body.orcidUrl !== undefined ? body.orcidUrl : undefined,
        },
      });
      res.json({ message: 'Faculty profile updated successfully', profile: updated });
      return;
    }

    if (role === ROLES.ALUMNI) {
      const updated = await prisma.alumniProfile.update({
        where: { userId },
        data: {
          name: body.name !== undefined ? body.name : undefined,
          company: body.company !== undefined ? body.company : undefined,
          role: body.role !== undefined ? body.role : undefined,
          graduationYear: body.graduationYear !== undefined ? Number(body.graduationYear) : undefined,
          departmentName: body.departmentName !== undefined ? body.departmentName : undefined,
          branchName: body.branchName !== undefined ? body.branchName : undefined,
          experienceYears: body.experienceYears !== undefined ? Number(body.experienceYears) : undefined,
          location: body.location !== undefined ? body.location : undefined,
          skills: body.skills !== undefined ? (typeof body.skills === 'string' ? body.skills : JSON.stringify(body.skills)) : undefined,
          linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : undefined,
          githubUrl: body.githubUrl !== undefined ? body.githubUrl : undefined,
          bio: body.bio !== undefined ? body.bio : undefined,
          careerStoryQuote: body.careerStoryQuote !== undefined ? body.careerStoryQuote : undefined,
          isAvailableForMentorship: body.isAvailableForMentorship !== undefined ? Boolean(body.isAvailableForMentorship) : undefined,
          avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : undefined,
        },
      });
      res.json({ message: 'Alumni profile updated successfully', profile: updated });
      return;
    }

    if (role === ROLES.INDUSTRY && req.user!.companyId) {
      const updated = await prisma.company.update({
        where: { id: req.user!.companyId },
        data: {
          name: body.name !== undefined ? body.name : undefined,
          industryType: body.industryType !== undefined ? body.industryType : undefined,
          description: body.description !== undefined ? body.description : undefined,
          website: body.website !== undefined ? body.website : undefined,
          location: body.location !== undefined ? body.location : undefined,
          companySize: body.companySize !== undefined ? body.companySize : undefined,
          recruiterName: body.recruiterName !== undefined ? body.recruiterName : undefined,
          recruiterEmail: body.recruiterEmail !== undefined ? body.recruiterEmail : undefined,
          logoUrl: body.logoUrl !== undefined ? body.logoUrl : undefined,
          hiringDomains: body.hiringDomains !== undefined ? (typeof body.hiringDomains === 'string' ? body.hiringDomains : JSON.stringify(body.hiringDomains)) : undefined,
        },
      });
      res.json({ message: 'Company profile updated successfully', profile: updated });
      return;
    }

    if (role === ROLES.INSTITUTION_ADMIN) {
      let instId = req.user!.institutionId;
      if (!instId) {
        const firstInst = await prisma.institution.findFirst();
        instId = firstInst?.id || null;
      }

      if (instId) {
        const updated = await prisma.institution.update({
          where: { id: instId },
          data: {
            name: body.name !== undefined ? body.name : undefined,
            type: body.type !== undefined ? body.type : undefined,
            location: body.location !== undefined ? body.location : undefined,
            code: body.code !== undefined ? body.code : undefined,
            logoUrl: body.logoUrl !== undefined ? body.logoUrl : undefined,
            address: body.address !== undefined ? body.address : undefined,
            website: body.website !== undefined ? body.website : undefined,
            placementOfficerName: body.placementOfficerName !== undefined ? body.placementOfficerName : undefined,
            placementOfficerEmail: body.placementOfficerEmail !== undefined ? body.placementOfficerEmail : undefined,
            placementOfficerPhone: body.placementOfficerPhone !== undefined ? body.placementOfficerPhone : undefined,
          },
        });
        res.json({ message: 'Institution settings updated successfully', profile: updated, institution: updated });
        return;
      }
    }

    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/profile-photo (Unified photo upload with 5MB validation for all roles)
import multer from 'multer';
import { storageService } from '../services/storage.service';

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      return cb(new Error('Please upload JPG, JPEG, PNG, or WEBP.'));
    }
    cb(null, true);
  },
});

router.post('/profile-photo', authenticateJwt, (req: AuthRequest, res: Response, next) => {
  avatarUpload.single('photo')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Profile photo must be 5 MB or smaller.' });
      }
      return res.status(400).json({ error: err.message || 'Please upload JPG, JPEG, PNG, or WEBP.' });
    }
    next();
  });
}, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No photo file provided.' });
      return;
    }

    const userId = req.user!.id;
    const role = req.user!.role;

    const result = await storageService.saveFile(req.file, 'avatars');
    const avatarUrl = result.fileUrl;

    // Update User model
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    // Update role-specific profile model
    if (role === ROLES.STUDENT) {
      await prisma.studentProfile.updateMany({
        where: { userId },
        data: { avatarUrl },
      });
    } else if (role === ROLES.ACADEMICIAN) {
      await prisma.academicianProfile.updateMany({
        where: { userId },
        data: { avatarUrl },
      });
    } else if (role === ROLES.ALUMNI) {
      await prisma.alumniProfile.updateMany({
        where: { userId },
        data: { avatarUrl },
      });
    } else if (role === ROLES.INDUSTRY) {
      const compId = req.user!.companyId;
      if (compId) {
        await prisma.company.update({
          where: { id: compId },
          data: { logoUrl: avatarUrl },
        });
      }
    } else if (role === ROLES.INSTITUTION_ADMIN) {
      let instId = req.user!.institutionId;
      if (!instId) {
        const firstInst = await prisma.institution.findFirst();
        instId = firstInst?.id || null;
      }
      if (instId) {
        await prisma.institution.update({
          where: { id: instId },
          data: { logoUrl: avatarUrl },
        });
      }
    }

    res.json({
      message: 'Profile photo uploaded successfully',
      avatarUrl,
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
});

// DELETE /api/auth/profile-photo
router.delete('/profile-photo', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    if (role === ROLES.STUDENT) {
      await prisma.studentProfile.updateMany({
        where: { userId },
        data: { avatarUrl: null },
      });
    } else if (role === ROLES.ACADEMICIAN) {
      await prisma.academicianProfile.updateMany({
        where: { userId },
        data: { avatarUrl: null },
      });
    } else if (role === ROLES.ALUMNI) {
      await prisma.alumniProfile.updateMany({
        where: { userId },
        data: { avatarUrl: null },
      });
    } else if (role === ROLES.INDUSTRY && req.user!.companyId) {
      await prisma.company.update({
        where: { id: req.user!.companyId },
        data: { logoUrl: null },
      });
    } else if (role === ROLES.INSTITUTION_ADMIN) {
      let instId = req.user!.institutionId;
      if (!instId) {
        const firstInst = await prisma.institution.findFirst();
        instId = firstInst?.id || null;
      }
      if (instId) {
        await prisma.institution.update({
          where: { id: instId },
          data: { logoUrl: null },
        });
      }
    }

    res.json({ message: 'Profile photo removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove profile photo' });
  }
});

// GET /api/auth/institution (Public / general endpoint to get current institution settings)
router.get('/institution', async (_req, res: Response) => {
  try {
    const institution = await prisma.institution.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!institution) {
      res.status(404).json({ error: 'Institution not found' });
      return;
    }

    res.json({ institution });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch institution' });
  }
});

// GET /api/auth/demo-accounts
router.get('/demo-accounts', async (_req, res) => {
  try {
    const demoAccounts = [
      {
        role: ROLES.STUDENT,
        roleLabel: 'Student (CSE • 3rd Year)',
        email: 'student.demo@edubridge.local',
        altEmail: 'student@demo.com',
        password: 'password123',
        description: 'Roshan Shinde (MITAOE) • Java, DSA, SQL • Target: Java Backend Developer.',
      },
      {
        role: ROLES.STUDENT,
        roleLabel: 'Student (Mechanical • 3rd Year)',
        email: 'student.mech@demo.com',
        password: 'password123',
        description: 'Aman Verma (MITAOE) • SolidWorks, CAD, FEA • Target: CAD Design Engineer.',
      },
      {
        role: ROLES.ACADEMICIAN,
        roleLabel: 'Faculty (Professor & HOD, CSE)',
        email: 'faculty.demo@edubridge.local',
        altEmail: 'academician@demo.com',
        password: 'password123',
        description: 'Dr. Anjali Joshi (MITAOE) • Cloud Architecture, Distributed Systems, Mentorship.',
      },
      {
        role: ROLES.INDUSTRY,
        roleLabel: 'Industry (TCS Digital Labs Lead)',
        email: 'recruiter.demo@edubridge.local',
        altEmail: 'industry@demo.com',
        password: 'password123',
        description: 'Anand Kulkarni (TCS) • Talent Acquisition, Skill Weighting, Candidate Ranking.',
      },
      {
        role: ROLES.INSTITUTION_ADMIN,
        roleLabel: 'Placement Cell (MITAOE Dean & TPO)',
        email: 'placement.demo@edubridge.local',
        altEmail: 'admin@demo.com',
        password: 'password123',
        description: 'Placement Cell • Curriculum Gap Radar, Company Placement Stats, Rank Calculation.',
      },
      {
        role: ROLES.ALUMNI,
        roleLabel: 'Alumni (Software Engineer at Microsoft)',
        email: 'alumni.demo@edubridge.local',
        altEmail: 'alumni@demo.com',
        password: 'password123',
        description: 'Rahul Patil (MITAOE Alum 2024) • Microsoft Software Engineer, Mentorship & System Design.',
      },
      {
        role: ROLES.ALUMNI_ADMIN,
        roleLabel: 'Alumni Admin (Relations & Moderation)',
        email: 'alumni.admin@edubridge.local',
        password: 'password123',
        description: 'Prof. Rajesh Verma • Alumni Network Moderator, Knowledge Insights & Events.',
      },
    ];

    res.json({ accounts: demoAccounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch demo accounts' });
  }
});

export default router;
