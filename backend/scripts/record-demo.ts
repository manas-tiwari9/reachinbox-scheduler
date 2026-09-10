/**
 * record-demo.ts
 * Playwright script that records a full 5-minute demo video of the app.
 * 
 * Prerequisites:
 *   1. Backend running:  npm run dev  (in backend/)
 *   2. Worker running:   npm run worker (in backend/)
 *   3. Frontend running: npm run dev  (in frontend/)
 *   4. Seed user:        npx tsx scripts/seed-demo-user.ts
 *
 * Run: npx tsx scripts/record-demo.ts
 * Output: demo-video/reachinbox-demo.webm
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL  = 'http://localhost:3001';
const VIDEO_DIR    = path.join(process.cwd(), 'demo-video');

// Helper: pause for N seconds (so viewer can read the screen)
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  // Read JWT token saved by seed-demo-user.ts
  const tokenPath = path.join(process.cwd(), 'scripts', '.demo-token');
  if (!fs.existsSync(tokenPath)) {
    console.error('❌ No token found. Run: npx tsx scripts/seed-demo-user.ts first');
    process.exit(1);
  }
  const token = fs.readFileSync(tokenPath, 'utf-8').trim();

  // Ensure video output directory exists
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log('🎬 Starting Playwright recording...');
  console.log(`📁 Video will be saved to: ${VIDEO_DIR}\n`);

  const browser = await chromium.launch({
    headless: false,          // Show the browser so it looks real
    slowMo: 80,               // Slow everything down — looks natural on video
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // ─── Scene 1: Login Screen ─────────────────────────────────────────────
  console.log('🎬 Scene 1: Login screen...');
  await page.goto(`${FRONTEND_URL}/login`);
  await wait(2000);

  // Inject JWT cookie to bypass Google OAuth
  await context.addCookies([{
    name: 'token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
  }]);

  // Also set axios auth header via localStorage for axios interceptor
  await page.evaluate((t) => {
    localStorage.setItem('token', t);
  }, token);

  await page.goto(`${FRONTEND_URL}/dashboard`);
  await wait(3000);

  // ─── Scene 2: Dashboard Overview ──────────────────────────────────────
  console.log('🎬 Scene 2: Dashboard overview...');
  await wait(2000);

  const scheduledBtn = page.getByRole('button', { name: /^Scheduled/ });
  const sentBtn      = page.getByRole('button', { name: /^Sent/ });
  const composeBtn   = page.getByRole('button', { name: 'Compose' });

  await scheduledBtn.click();
  await wait(2000);

  // ─── Scene 3: Compose and Schedule an Email ────────────────────────────
  console.log('🎬 Scene 3: Compose email...');
  await composeBtn.click();
  await wait(1500);

  const toInput = page.locator('input[placeholder="recipient@example.com"]');
  await toInput.click();
  await toInput.type('john.smith@example.com', { delay: 60 });
  await toInput.press('Enter');
  await wait(800);

  const subjectInput = page.locator('input[placeholder="Subject"]');
  await subjectInput.click();
  await subjectInput.type('Meeting Follow-up - Scheduled', { delay: 50 });
  await wait(500);

  const delayInput = page.locator('input[type="number"]').first();
  await delayInput.fill('2');

  const hourlyInput = page.locator('input[type="number"]').last();
  await hourlyInput.fill('10');
  await wait(500);

  const editor = page.locator('.tiptap');
  await editor.click();
  await editor.type(
    'Hi John,\n\nFollowing up on our meeting. Looking forward to connecting!\n\nBest,\nDemo User',
    { delay: 30 }
  );
  await wait(1000);

  // ─── Scene 4: Send Later popover ─────────────────────────────────────
  console.log('🎬 Scene 4: Send Later popover...');
  const clockBtn = page.locator('button[title="Schedule send time"]');
  await clockBtn.click();
  await wait(1000);

  const tomorrowBtn = page.getByText('Tomorrow, 10:00 AM');
  await tomorrowBtn.click();
  await wait(800);

  const doneBtn = page.getByRole('button', { name: 'Done' });
  await doneBtn.click();
  await wait(800);

  const sendLaterBtn = page.getByRole('button', { name: /Send Later/i });
  await sendLaterBtn.click();
  await wait(3000);

  // ─── Scene 5: Scheduled Tab ─────────────────────────────────────────
  console.log('🎬 Scene 5: Scheduled tab...');
  await scheduledBtn.click();
  await wait(3000);

  // ─── Scene 6: Bull Board ────────────────────────────────────────────
  console.log('🎬 Scene 6: Bull Board...');
  const bullPage = await context.newPage();
  await bullPage.goto(`${BACKEND_URL}/admin/queues`);
  await wait(4000);
  await bullPage.close();
  await wait(1000);

  // ─── Scene 7: Compose and Send Immediately ──────────────────────────
  console.log('🎬 Scene 7: Send email immediately...');
  await composeBtn.click();
  await wait(1500);

  const toInput2 = page.locator('input[placeholder="recipient@example.com"]');
  await toInput2.click();
  await toInput2.type('sarah.wilson@example.com', { delay: 60 });
  await toInput2.press('Enter');
  await wait(500);

  const subjectInput2 = page.locator('input[placeholder="Subject"]');
  await subjectInput2.click();
  await subjectInput2.type('Re: Project Update', { delay: 50 });
  await wait(400);

  const editor2 = page.locator('.tiptap');
  await editor2.click();
  await editor2.type('Thanks for the update! Looks great.\n\nBest,\nDemo User', { delay: 40 });
  await wait(800);

  // Click Send (plain send, not Send Later)
  const sendBtn = page.locator('button').filter({ hasText: /^Send$/ });
  await sendBtn.click();
  await wait(4000);

  // ─── Scene 8: Sent Tab + Email Detail ───────────────────────────────
  console.log('🎬 Scene 8: Sent tab and email detail...');
  await sentBtn.click();
  await wait(3000);

  const emailRow = page.locator('.group').first();
  if (await emailRow.isVisible()) {
    await emailRow.click();
    await wait(3000);

    const etherealLink = page.getByText('View Email Preview (Ethereal)');
    if (await etherealLink.isVisible()) {
      await etherealLink.click();
      await wait(3000);
    }
  }

  await wait(2000);
  console.log('\n✅ Recording complete! Saving video...');

  await context.close();
  await browser.close();

  // Find the saved video file
  const files = fs.readdirSync(VIDEO_DIR);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
    const finalPath = path.join(VIDEO_DIR, 'reachinbox-demo.webm');
    fs.renameSync(path.join(VIDEO_DIR, videoFile), finalPath);
    console.log(`\n🎉 Demo video saved at:\n   ${finalPath}`);
    console.log('\n📌 Submit this file as your demo video!');
  }
}

main().catch(err => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
