const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:4200';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🏛️ Launching VISIBLE Google Chrome for Chief Officer (ADMIN) Testing...\n');

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

    // 2. Perform Chief Officer (ADMIN) Login
    console.log('📍 2. Entering Chief Officer (ADMIN) credentials...');
    await page.type('#email', 'co@nagar.in', { delay: 100 });
    await sleep(800);
    await page.type('#password', 'password', { delay: 100 });
    await sleep(1000);

    console.log('📍 3. Submitting Login Form...');
    await page.click('button[type="submit"]');
    await sleep(3500);

    // 3. View Chief Officer / Admin Dashboard
    console.log(`📍 4. Navigated to Admin Dashboard: ${page.url()}`);
    await sleep(3000);

    // 4. View Department Management (Admin Scope)
    console.log('📍 5. Opening Department Management...');
    await page.goto(`${BASE_URL}/admin/departments`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // 5. View User & Staff Management (Admin Scope)
    console.log('📍 6. Opening Staff & Employee Management...');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // 6. View Complaint Types Management
    console.log('📍 7. Opening Complaint Types Management...');
    await page.goto(`${BASE_URL}/admin/complaint-types`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // 7. View Complaints List (Admin Scope)
    console.log('📍 8. Opening Complaints Management...');
    await page.goto(`${BASE_URL}/complaints`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // 8. View Task Management Board (Admin Scope)
    console.log('📍 9. Opening Task Management Board...');
    await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // 9. View System Settings
    console.log('📍 10. Opening System Settings...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await sleep(3500);

    console.log('\n🎉 Chief Officer (ADMIN) Visual Testing Completed!');

  } catch (err) {
    console.error('❌ Error during Chief Officer testing:', err);
  } finally {
    await browser.close();
  }
})();
