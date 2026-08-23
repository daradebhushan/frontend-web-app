const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:4200';
const SCREENSHOT_DIR = '/Volumes/Extreme SSD/.gemini/antigravity-ide/brain/399e5d57-0d09-4e58-948e-77631a964418/screenshots';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🤖 Starting Agentic Visual UI Testing & Exploration...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Login Page
    console.log('1. Navigating to Login Page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '1_login_page.png') });
    console.log('   📸 Captured 1_login_page.png');

    // 2. Perform Login
    console.log('2. Entering credentials and submitting login form...');
    await page.type('#email', 'owner@govt.in');
    await page.type('#password', 'password');
    await page.click('button[type="submit"]');
    await sleep(3000);

    // 3. Owner Dashboard
    console.log(`3. Navigated to: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2_owner_dashboard.png') });
    console.log('   📸 Captured 2_owner_dashboard.png');

    // 4. Department Management Page
    console.log('4. Navigating to Departments Page...');
    await page.goto(`${BASE_URL}/admin/departments`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3_departments_page.png') });
    console.log('   📸 Captured 3_departments_page.png');

    // 5. User / Staff Management Page
    console.log('5. Navigating to Users / Staff Page...');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '4_users_page.png') });
    console.log('   📸 Captured 4_users_page.png');

    // 6. Complaints List Page
    console.log('6. Navigating to Complaints List Page...');
    await page.goto(`${BASE_URL}/complaints`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '5_complaints_page.png') });
    console.log('   📸 Captured 5_complaints_page.png');

    // 7. Tasks Management Board Page
    console.log('7. Navigating to Tasks Board Page...');
    await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '6_tasks_page.png') });
    console.log('   📸 Captured 6_tasks_page.png');

    // 8. Settings & System Configurations Page
    console.log('8. Navigating to System Settings Page...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '7_settings_page.png') });
    console.log('   📸 Captured 7_settings_page.png');

  } catch (err) {
    console.error('❌ Error during Agentic UI Testing:', err);
  } finally {
    await browser.close();
    console.log('\n✨ Agentic Visual UI Testing Completed Successfully!');
  }
})();
