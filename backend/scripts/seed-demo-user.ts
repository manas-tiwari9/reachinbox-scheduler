/**
 * seed-demo-user.ts
 * Creates a test user in the SQLite DB and prints a valid JWT cookie
 * so Playwright can bypass Google OAuth for the demo video.
 *
 * Run: npx tsx scripts/seed-demo-user.ts
 */
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  // Upsert a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@reachinbox.ai' },
    update: {},
    create: {
      googleId: 'demo-google-id-12345',
      email: 'demo@reachinbox.ai',
      name: 'Demo User',
      avatar: null,
    },
  });

  // Generate a valid JWT (same logic as auth.controller.ts)
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '1d' } as jwt.SignOptions
  );

  console.log('\n✅ Demo user created/found:');
  console.log(`   ID:    ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log('\n🍪 JWT token for Playwright:');
  console.log(token);
  console.log('\n📋 Copy the token above — the video script will use it automatically.\n');

  // Save token to a temp file so the Playwright script can read it
  const fs = await import('fs');
  fs.writeFileSync('./scripts/.demo-token', token, 'utf-8');
  console.log('✅ Token saved to scripts/.demo-token');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
