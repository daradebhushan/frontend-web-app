const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:4200';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('👀 Launching VISIBLE Google Chrome window for Live Demonstration...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false, // Shows visible Chrome browser window on screen!
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = (await browser.pages())[0] || (await browser.newPage());

  try {
    // 1. Navigate to Login Page
    console.log('📍 1. Opening Login Page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    // 2. Perform Login
    console.log('📍 2. Filling email and password...');
    await page.type('#email', 'owner@govt.in', { delay: 100 });
    await sleep(800);
    await page.type('#password', 'password', { delay: 100 });
    await sleep(1000);

    console.log('📍 3. Clicking Sign In Button...');
    await page.click('button[type="submit"]');
    await sleep(3000);

    // 3. View Owner Dashboard
    console.log(`📍 4. Navigated to Dashboard: ${page.url()}`);
    await sleep(2500);

    // 4. View Departments Management
    console.log('📍 5. Navigating to Department Management...');
    await page.goto(`${BASE_URL}/admin/departments`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    // 5. View Users Management
    console.log('📍 6. Navigating to User & Staff Management...');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    // 6. View Complaints List
    console.log('📍 7. Navigating to Complaints List...');
    await page.goto(`${BASE_URL}/complaints`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    // 7. View Task Board
    console.log('📍 8. Navigating to Task Management Board...');
    await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    // 8. View System Settings
    console.log('📍 9. Navigating to System Settings...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    console.log('\n🎉 Live Visual Demonstration Complete!');

  } catch (err) {
    console.error('❌ Error during visual testing:', err);
  } finally {
    await browser.close();
  }
})();
