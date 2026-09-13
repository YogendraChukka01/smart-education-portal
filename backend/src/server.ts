import app from './app';
import { config } from './config';
import { prisma } from './lib/prisma';

async function bootstrap() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('✅ SQLite Database connected successfully.');

    app.listen(config.port, () => {
      console.log(`🚀 AYUSH Academia-Industry Backend Server running on port ${config.port}`);
      console.log(`🔗 API Base: http://localhost:${config.port}/api`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
