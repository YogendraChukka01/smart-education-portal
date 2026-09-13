import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJwt, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/messages (List user's message conversations)
router.get('/', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderUserId: userId },
          { receiverUserId: userId },
        ],
      },
      include: {
        sender: {
          include: {
            studentProfile: true,
            academicianProfile: true,
            alumniProfile: true,
            company: true,
          },
        },
        receiver: {
          include: {
            studentProfile: true,
            academicianProfile: true,
            alumniProfile: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = messages.map((m) => {
      const isSender = m.senderUserId === userId;
      const otherUser = isSender ? m.receiver : m.sender;
      const otherName =
        otherUser.studentProfile?.name ||
        otherUser.academicianProfile?.name ||
        otherUser.alumniProfile?.name ||
        otherUser.company?.name ||
        otherUser.email;

      return {
        id: m.id,
        senderUserId: m.senderUserId,
        receiverUserId: m.receiverUserId,
        content: m.content,
        read: m.read,
        createdAt: m.createdAt.toISOString(),
        isSender,
        otherUserName: otherName,
        otherUserRole: otherUser.role,
      };
    });

    res.json({ messages: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages (Send message)
router.post('/', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const senderUserId = req.user!.id;
    const { receiverUserId, content } = req.body;

    if (!receiverUserId || !content || !content.trim()) {
      res.status(400).json({ error: 'Receiver and content are required' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderUserId,
        receiverUserId,
        content: content.trim(),
      },
    });

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
