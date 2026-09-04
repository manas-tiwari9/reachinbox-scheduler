import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
