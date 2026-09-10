import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { ensureEmailIndex } from './config/elasticsearch';
import { initMailer } from './services/mailer.service';

// Routes
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import slackRoutes from './routes/slack.routes';
import { queueRouter } from './routes/queue.routes';

const app = express();

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/slack', slackRoutes);
app.use('/admin/queues', queueRouter);

// Health check (used by Render)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
async function startServer() {
  // Elasticsearch is optional — if not running, search is disabled but everything else works
  try {
    await ensureEmailIndex();
  } catch {
    console.warn('⚠️  Elasticsearch not available — search disabled. Everything else works fine.');
  }

  try {
    await initMailer();

    app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running on port ${env.PORT}`);
      console.log(`- API:        http://localhost:${env.PORT}/api`);
      console.log(`- Bull Board: http://localhost:${env.PORT}/admin/queues\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
