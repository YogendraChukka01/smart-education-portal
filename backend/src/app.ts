import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';

// Import route modules
import authRoutes from './routes/auth.routes';
import skillsRoutes from './routes/skills.routes';
import opportunitiesRoutes from './routes/opportunities.routes';
import applicationsRoutes from './routes/applications.routes';
import portfolioRoutes from './routes/portfolio.routes';
import mentorshipRoutes from './routes/mentorship.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationsRoutes from './routes/notifications.routes';
import messagesRoutes from './routes/messages.routes';
import alumniRoutes from './routes/alumni.routes';
import industryIntelligenceRoutes from './routes/industry-intelligence.routes';

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: (_origin, callback) => {
      // Allow all origins with credentials for web/preview/production deployments
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// Health check endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'EduBridge — Engineering Academia Industry Collaboration & Placement Platform',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: config.nodeEnv,
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'EduBridge — Engineering Academia Industry Collaboration & Placement Platform',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/industry-intelligence', industryIntelligenceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;
