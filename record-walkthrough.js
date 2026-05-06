const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, 'index.html');
const OUTPUT_DIR = path.resolve(__dirname, 'video-output');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function smoothScroll(page, distance, steps = 12) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, distance / steps);
    await sleep(40);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  console.log('Opening Moyo dashboard…');
  await page.goto(FILE_URL, { waitUntil: 'networkidle' });
  await sleep(1200);

  // ── 1. Dashboard overview ──────────────────────────────────────────────────
  console.log('Dashboard overview…');
  await sleep(1500);
  await smoothScroll(page, 400);
  await sleep(800);
  await smoothScroll(page, 400);
  await sleep(800);
  await smoothScroll(page, 400);
  await sleep(1000);
  await smoothScroll(page, -1200);
  await sleep(800);

  // ── 2. Live Transactions ───────────────────────────────────────────────────
  console.log('Navigating to Live Transactions…');
  await page.click('text=Live Transactions');
  await sleep(1800);
  await smoothScroll(page, 300);
  await sleep(1000);

  // ── 3. Contributors ────────────────────────────────────────────────────────
  console.log('Navigating to Contributors…');
  await page.click('text=Contributors');
  await sleep(1800);
  await smoothScroll(page, 400);
  await sleep(1000);

  // ── 4. Disbursements ──────────────────────────────────────────────────────
  console.log('Navigating to Disbursements…');
  await page.click('text=Disbursements');
  await sleep(1800);
  await smoothScroll(page, 300);
  await sleep(1000);

  // ── 5. Analytics ──────────────────────────────────────────────────────────
  console.log('Navigating to Analytics…');
  await page.click('text=Analytics');
  await sleep(1800);
  await smoothScroll(page, 500);
  await sleep(1000);

  // ── 6. Reports ────────────────────────────────────────────────────────────
  console.log('Navigating to Reports…');
  await page.click('text=Reports');
  await sleep(1800);

  // ── 7. Settings ───────────────────────────────────────────────────────────
  console.log('Navigating to Settings…');
  await page.click('text=Settings');
  await sleep(1800);

  // ── 8. Back to Overview + open Withdraw modal ─────────────────────────────
  console.log('Back to Overview…');
  await page.click('text=Overview');
  await sleep(1200);
  console.log('Opening Withdraw modal…');
  await page.click('text=Withdraw Funds');
  await sleep(1500);

  // Fill amount
  await page.fill('input[type="text"]', '500000000');
  await sleep(600);
  await page.click('text=Continue');
  await sleep(1200);

  // Step 2 – review
  await sleep(1200);
  await page.click('text=Send verification code');
  await sleep(1200);

  // Step 3 – OTP
  const otpInputs = await page.$$('input[inputmode="numeric"]');
  const digits = ['1','2','3','4','5','6'];
  for (let i = 0; i < otpInputs.length; i++) {
    await otpInputs[i].type(digits[i], { delay: 120 });
    await sleep(150);
  }
  await sleep(800);
  await page.click('text=Verify & withdraw');
  await sleep(1800);

  // Done
  await page.click('text=Done');
  await sleep(800);

  // ── 9. Public page ────────────────────────────────────────────────────────
  console.log('Switching to Public page…');
  await page.click('text=Public page');
  await sleep(1500);
  await smoothScroll(page, 500);
  await sleep(800);
  await smoothScroll(page, 600);
  await sleep(800);
  await smoothScroll(page, 600);
  await sleep(1000);
  await smoothScroll(page, 600);
  await sleep(1200);
  await smoothScroll(page, -2500);
  await sleep(1000);

  // ── 10. Finish ────────────────────────────────────────────────────────────
  console.log('Recording complete — closing…');
  await sleep(800);

  await context.close();
  await browser.close();

  console.log('\n✅ Video saved to:', OUTPUT_DIR);
  console.log('   Rename the .webm file to walkthrough.webm for easy access.');
})();
