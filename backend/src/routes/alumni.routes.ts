import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateJwt, AuthRequest, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { ROLES, ALUMNI_POST_TYPES, ALUMNI_POST_STATUS } from '@ayush-portal/shared';

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  postType: z.string().default(ALUMNI_POST_TYPES.CAREER_ADVICE),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  branchName: z.string().optional().nullable(),
  graduationYear: z.number().int().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum([ALUMNI_POST_STATUS.DRAFT, ALUMNI_POST_STATUS.PUBLISHED, ALUMNI_POST_STATUS.ARCHIVED]).default(ALUMNI_POST_STATUS.PUBLISHED),
});

// GET /api/alumni/posts (Feed of published alumni advice & knowledge insights)
router.get('/posts', async (req: AuthRequest, res: Response) => {
  try {
    const { type, company, branch, search } = req.query as {
      type?: string;
      company?: string;
      branch?: string;
      search?: string;
    };

    const where: any = {
      status: ALUMNI_POST_STATUS.PUBLISHED,
    };

    if (type && type !== 'all') {
      where.postType = type;
    }
    if (company && company !== 'all') {
      where.company = { contains: company };
    }
    if (branch && branch !== 'all') {
      where.branchName = { contains: branch };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { tagsJson: { contains: search } },
      ];
    }

    const posts = await prisma.alumniPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            alumniProfile: true,
            academicianProfile: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                avatarUrl: true,
                studentProfile: { select: { name: true, branchName: true } },
                alumniProfile: { select: { name: true, company: true, role: true } },
                academicianProfile: { select: { name: true, department: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    const currentUserId = req.user?.id;

    const formatted = posts.map((p) => {
      const authorName =
        p.author.alumniProfile?.name ||
        p.author.academicianProfile?.name ||
        p.author.email.split('@')[0];

      return {
        id: p.id,
        authorUserId: p.authorUserId,
        authorName,
        authorRole: p.author.role,
        authorAvatar: p.author.avatarUrl || p.author.alumniProfile?.avatarUrl || null,
        title: p.title,
        content: p.content,
        postType: p.postType,
        company: p.company || p.author.alumniProfile?.company || 'Industry Partner',
        role: p.role || p.author.alumniProfile?.role || 'Software Engineer',
        branchName: p.branchName || p.author.alumniProfile?.branchName || 'Engineering',
        graduationYear: p.graduationYear || p.author.alumniProfile?.graduationYear || 2022,
        tags: p.tagsJson ? JSON.parse(p.tagsJson) : [],
        status: p.status,
        isFeatured: p.isFeatured,
        likesCount: p.likes.length,
        commentsCount: p.comments.length,
        isLikedByMe: currentUserId ? p.likes.some((l) => l.userId === currentUserId) : false,
        createdAt: p.createdAt.toISOString(),
        comments: p.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          userName:
            c.user.studentProfile?.name ||
            c.user.alumniProfile?.name ||
            c.user.academicianProfile?.name ||
            c.user.email.split('@')[0],
          userRole: c.user.role,
          avatarUrl: c.user.avatarUrl,
        })),
      };
    });

    res.json({ posts: formatted });
  } catch (error) {
    console.error('Fetch alumni posts error:', error);
    res.status(500).json({ error: 'Failed to fetch alumni posts' });
  }
});

// GET /api/alumni/admin/posts (Alumni Admin view of all posts for moderation)
router.get('/admin/posts', authenticateJwt, requireRoles(ROLES.ALUMNI_ADMIN, ROLES.ADMIN, ROLES.INSTITUTION_ADMIN), async (_req: AuthRequest, res: Response) => {
  try {
    const posts = await prisma.alumniPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            alumniProfile: true,
          },
        },
        comments: true,
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      authorUserId: p.authorUserId,
      authorName: p.author.alumniProfile?.name || p.author.email.split('@')[0],
      authorEmail: p.author.email,
      title: p.title,
      content: p.content,
      postType: p.postType,
      company: p.company,
      role: p.role,
      branchName: p.branchName,
      graduationYear: p.graduationYear,
      tags: p.tagsJson ? JSON.parse(p.tagsJson) : [],
      status: p.status,
      isFeatured: p.isFeatured,
      likesCount: p.likes.length,
      commentsCount: p.comments.length,
      createdAt: p.createdAt.toISOString(),
    }));

    res.json({ posts: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin posts' });
  }
});

// POST /api/alumni/posts (Alumni or Alumni Admin creates advice/thought)
router.post(
  '/posts',
  authenticateJwt,
  requireRoles(ROLES.ALUMNI, ROLES.ALUMNI_ADMIN, ROLES.ACADEMICIAN, ROLES.ADMIN),
  validateBody(createPostSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        title,
        content,
        postType,
        company,
        role,
        branchName,
        graduationYear,
        tags,
        status,
      } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { alumniProfile: true },
      });

      const post = await prisma.alumniPost.create({
        data: {
          authorUserId: req.user!.id,
          title,
          content,
          postType: postType || ALUMNI_POST_TYPES.CAREER_ADVICE,
          company: company || user?.alumniProfile?.company || null,
          role: role || user?.alumniProfile?.role || null,
          branchName: branchName || user?.alumniProfile?.branchName || null,
          graduationYear: graduationYear || user?.alumniProfile?.graduationYear || null,
          tagsJson: JSON.stringify(tags || []),
          status: status || ALUMNI_POST_STATUS.PUBLISHED,
          isFeatured: req.user?.role === ROLES.ALUMNI_ADMIN,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorEmail: req.user!.email,
          actorRole: req.user!.role,
          action: 'CREATE_ALUMNI_POST',
          entity: 'AlumniPost',
          entityId: post.id,
          details: JSON.stringify({ title: post.title, postType: post.postType }),
        },
      });

      res.status(201).json({
        message: 'Alumni thought published successfully!',
        post,
      });
    } catch (error) {
      console.error('Create alumni post error:', error);
      res.status(500).json({ error: 'Failed to publish post' });
    }
  }
);

// PUT /api/alumni/posts/:id (Update post or status: Draft, Published, Archived, Feature)
router.put('/:id', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, content, postType, company, role, tags, status, isFeatured } = req.body;

    const existing = await prisma.alumniPost.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const isAuthor = existing.authorUserId === req.user!.id;
    const isAdmin = [ROLES.ALUMNI_ADMIN, ROLES.ADMIN, ROLES.INSTITUTION_ADMIN].includes(req.user!.role as any);

    if (!isAuthor && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to edit this post' });
      return;
    }

    const updated = await prisma.alumniPost.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        postType: postType !== undefined ? postType : undefined,
        company: company !== undefined ? company : undefined,
        role: role !== undefined ? role : undefined,
        tagsJson: tags !== undefined ? JSON.stringify(tags) : undefined,
        status: status !== undefined ? status : undefined,
        isFeatured: isAdmin && isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      },
    });

    res.json({ message: 'Post updated successfully', post: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/alumni/posts/:id
router.delete('/:id', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.alumniPost.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const isAuthor = existing.authorUserId === req.user!.id;
    const isAdmin = [ROLES.ALUMNI_ADMIN, ROLES.ADMIN, ROLES.INSTITUTION_ADMIN].includes(req.user!.role as any);

    if (!isAuthor && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to delete this post' });
      return;
    }

    await prisma.alumniPost.delete({ where: { id } });

    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Helper handler for toggling post likes
const handleToggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const existingLike = await prisma.alumniPostLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    let isLiked = false;
    if (existingLike) {
      await prisma.alumniPostLike.delete({ where: { id: existingLike.id } });
      isLiked = false;
    } else {
      await prisma.alumniPostLike.create({
        data: {
          postId: id,
          userId,
        },
      });
      isLiked = true;
    }

    const count = await prisma.alumniPostLike.count({ where: { postId: id } });
    await prisma.alumniPost.update({
      where: { id },
      data: { likesCount: count },
    });

    res.json({ isLiked, likesCount: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

router.post('/posts/:id/like', authenticateJwt, handleToggleLike);
router.post('/:id/like', authenticateJwt, handleToggleLike);

// Helper handler for adding comments to posts
const handleAddComment = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment content cannot be empty' });
      return;
    }

    const comment: any = await prisma.alumniPostComment.create({
      data: {
        postId: id,
        userId: req.user!.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            studentProfile: { select: { name: true, branchName: true } },
            alumniProfile: { select: { name: true, company: true, role: true } },
            academicianProfile: { select: { name: true, department: true } },
          },
        },
      },
    });

    const userName =
      comment.user?.studentProfile?.name ||
      comment.user?.alumniProfile?.name ||
      comment.user?.academicianProfile?.name ||
      comment.user?.email?.split('@')[0] ||
      'User';

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        userName,
        userRole: comment.user?.role,
        avatarUrl: comment.user?.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

router.post('/posts/:id/comments', authenticateJwt, handleAddComment);
router.post('/posts/:id/comment', authenticateJwt, handleAddComment);
router.post('/:id/comment', authenticateJwt, handleAddComment);

// ==========================================
// MENTORSHIP REQUESTS WORKFLOW
// ==========================================

// GET /api/alumni/mentorship-requests
router.get('/mentorship-requests', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let requests: any[] = [];
    if (role === ROLES.ALUMNI || role === ROLES.ACADEMICIAN || role === ROLES.ALUMNI_ADMIN || role === ROLES.INSTITUTION_ADMIN) {
      // Incoming requests for mentor
      requests = await prisma.mentorshipRequest.findMany({
        where: { mentorUserId: userId },
        include: {
          studentUser: {
            include: {
              studentProfile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Outgoing requests for student
      requests = await prisma.mentorshipRequest.findMany({
        where: { studentUserId: userId },
        include: {
          mentorUser: {
            include: {
              alumniProfile: true,
              academicianProfile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const formatted = requests.map((r) => ({
      id: r.id,
      studentUserId: r.studentUserId,
      mentorUserId: r.mentorUserId,
      topic: r.topic,
      message: r.message,
      status: r.status,
      responseNotes: r.responseNotes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      studentUser: r.studentUser ? {
        id: r.studentUser.id,
        email: r.studentUser.email,
        avatarUrl: r.studentUser.avatarUrl || r.studentUser.studentProfile?.avatarUrl,
        studentProfile: r.studentUser.studentProfile,
      } : undefined,
      mentorUser: r.mentorUser ? {
        id: r.mentorUser.id,
        email: r.mentorUser.email,
        avatarUrl: r.mentorUser.avatarUrl || r.mentorUser.alumniProfile?.avatarUrl,
        alumniProfile: r.mentorUser.alumniProfile,
        academicianProfile: r.mentorUser.academicianProfile,
      } : undefined,
    }));

    res.json({ requests: formatted });
  } catch (error) {
    console.error('Fetch mentorship requests error:', error);
    res.status(500).json({ error: 'Failed to fetch mentorship requests' });
  }
});

// POST /api/alumni/mentorship-requests (Student requests mentorship from alumni/mentor)
const mentorshipRequestSchema = z.object({
  mentorUserId: z.string(),
  topic: z.string().min(3),
  message: z.string().min(10),
});

router.post('/mentorship-requests', authenticateJwt, validateBody(mentorshipRequestSchema), async (req: AuthRequest, res: Response) => {
  try {
    const studentUserId = req.user!.id;
    const { mentorUserId, topic, message } = req.body;

    const mentor = await prisma.user.findUnique({
      where: { id: mentorUserId },
      include: { alumniProfile: true },
    });

    if (!mentor) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }

    // Create mentorship request record
    const request = await prisma.mentorshipRequest.create({
      data: {
        studentUserId,
        mentorUserId,
        topic: topic.trim(),
        message: message.trim(),
        status: 'pending',
      },
    });

    // Also send in-app notification to mentor
    await prisma.notification.create({
      data: {
        userId: mentorUserId,
        title: 'New Mentorship Request Received',
        message: `A student requested mentorship on "${topic.slice(0, 50)}". Check your Mentorship tab.`,
        type: 'mentorship',
        linkUrl: '/alumni/dashboard',
      },
    });

    res.status(201).json({
      message: 'Mentorship request sent successfully!',
      request,
    });
  } catch (error) {
    console.error('Create mentorship request error:', error);
    res.status(500).json({ error: 'Failed to submit mentorship request' });
  }
});

// PUT /api/alumni/mentorship-requests/:id (Mentor accepts / rejects request with optional response notes)
router.put('/mentorship-requests/:id', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, responseNotes } = req.body;

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      res.status(400).json({ error: 'Status must be accepted, rejected, or completed' });
      return;
    }

    const existing = await prisma.mentorshipRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Mentorship request not found' });
      return;
    }

    if (existing.mentorUserId !== req.user!.id && req.user!.role !== ROLES.ALUMNI_ADMIN) {
      res.status(403).json({ error: 'Not authorized to respond to this mentorship request' });
      return;
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id },
      data: {
        status,
        responseNotes: responseNotes !== undefined ? responseNotes : existing.responseNotes,
      },
    });

    // Send notification to the student
    await prisma.notification.create({
      data: {
        userId: existing.studentUserId,
        title: status === 'accepted' ? 'Mentorship Request Accepted! 🎉' : 'Mentorship Request Update',
        message: `Your mentorship request regarding "${existing.topic}" was ${status}. ${responseNotes ? `Note: ${responseNotes}` : ''}`,
        type: 'mentorship',
        linkUrl: '/student/events',
      },
    });

    res.json({
      message: `Mentorship request ${status} successfully`,
      request: updated,
    });
  } catch (error) {
    console.error('Update mentorship request error:', error);
    res.status(500).json({ error: 'Failed to update mentorship request' });
  }
});

export default router;
