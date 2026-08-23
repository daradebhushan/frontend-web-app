const puppeteer = require('puppeteer-core');
const http = require('http');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:4200';
const API_URL = 'http://localhost:8080/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiRequest(method, path, data = null, token = null) {
  return new Promise((resolve) => {
    try {
      const url = new URL(`${API_URL}${path}`);
      const options = {
        method: method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: { 'Content-Type': 'application/json' }
      };
      if (token) options.headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
          catch (e) { resolve({ status: res.statusCode, data: body }); }
        });
      });

      req.on('error', () => resolve({ status: 500, error: 'Connection Error' }));
      if (data) req.write(JSON.stringify(data));
      req.end();
    } catch (e) {
      resolve({ status: 400, error: 'Request Error' });
    }
  });
}

(async () => {
  console.log('================================================================================');
  console.log('📊 DYNAMIC DASHBOARD METRICS & REAL-TIME STATE VERIFICATION ENGINE');
  console.log('================================================================================\n');

  // Launch EXACTLY 1 Single Chrome Window (RAM-friendly)
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false, // Visible single window for live verification
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--single-process']
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());

  // Close any additional pages if open to keep strictly 1 tab
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close();
  }

  const verificationLog = [];
  function assertMetric(metricName, initialVal, expectedVal, actualVal) {
    const passed = expectedVal === actualVal;
    verificationLog.push({ metricName, initialVal, expectedVal, actualVal, passed });
    const symbol = passed ? '✅' : '❌';
    console.log(`   ${symbol} [${metricName}] Initial: ${initialVal} | Expected: ${expectedVal} | Actual: ${actualVal}`);
  }

  try {
    // -----------------------------------------------------------------
    // 1. AUTHENTICATE AS CHIEF OFFICER (ADMIN)
    // -----------------------------------------------------------------
    console.log('📍 1. Authenticating Chief Officer Admin...');
    const loginRes = await apiRequest('POST', '/auth/login', { email: 'co@nagar.in', password: 'password' });
    const token = loginRes.data.data.token;

    await page.goto(`${BASE_URL}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((t) => {
      localStorage.setItem('auth_data', JSON.stringify({ token: t, email: 'co@nagar.in', roles: ['ADMIN'] }));
    }, token);

    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    console.log(`   ✅ Dashboard Loaded! URL: ${page.url()}\n`);

    // -----------------------------------------------------------------
    // 2. READ BASELINE DASHBOARD STATS
    // -----------------------------------------------------------------
    console.log('📍 2. Capturing Baseline Dashboard Stats...');
    const baselineRes = await apiRequest('GET', '/stats/dashboard', null, token);
    const baseStats = baselineRes.data.data;

    console.log(`   • Baseline Total Departments : ${baseStats.totalDepartments}`);
    console.log(`   • Baseline Total Users       : ${baseStats.totalUsers}`);
    console.log(`   • Baseline Total Tasks       : ${baseStats.totalTasks}`);
    console.log(`   • Baseline To-Do Tasks       : ${baseStats.toDoTasks}`);
    console.log(`   • Baseline In-Progress Tasks : ${baseStats.inProgressTasks}`);
    console.log(`   • Baseline Completed Tasks   : ${baseStats.completedTasks}\n`);

    // -----------------------------------------------------------------
    // 3. MUTATION 1: CREATE NEW DEPARTMENT & VERIFY STATS INCREMENT
    // -----------------------------------------------------------------
    console.log('📍 3. MUTATION 1: Creating New Department (Parks & Garden Verification)...');
    const createDeptRes = await apiRequest('POST', '/admin/departments', {
      name: 'Parks & Garden Auto Test Dept',
      nameMr: 'उद्यान विभाग QA',
      chatbotEnabled: true
    }, token);
    const createdDeptId = createDeptRes.data.data ? createDeptRes.data.data.id : createDeptRes.data.id;

    const stats1Res = await apiRequest('GET', '/stats/dashboard', null, token);
    const stats1 = stats1Res.data.data;
    assertMetric('Total Departments Increment (+1)', baseStats.totalDepartments, baseStats.totalDepartments + 1, stats1.totalDepartments);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);

    // -----------------------------------------------------------------
    // 4. MUTATION 2: CREATE NEW STAFF USER & VERIFY USER COUNTS
    // -----------------------------------------------------------------
    console.log('\n📍 4. MUTATION 2: Adding Staff Member to Department...');
    const randId = Math.floor(Math.random() * 10000);
    const staffEmail = `garden_staff_${randId}@nagar.in`;
    const createUserRes = await apiRequest('POST', '/admin/users', {
      name: 'Garden Inspector QA',
      mobile: '9888877777',
      email: staffEmail,
      password: 'password123',
      role: 'STAFF',
      departmentId: createdDeptId,
      designation: 'Garden Inspector'
    }, token);
    const createdUserId = createUserRes.data.data ? createUserRes.data.data.id : createUserRes.data.id;

    const stats2Res = await apiRequest('GET', '/stats/dashboard', null, token);
    const stats2 = stats2Res.data.data;
    assertMetric('Total Users Increment (+1)', baseStats.totalUsers, baseStats.totalUsers + 1, stats2.totalUsers);

    // -----------------------------------------------------------------
    // 5. MUTATION 3: CREATE TASK & VERIFY TO-DO TASK COUNTS
    // -----------------------------------------------------------------
    console.log('\n📍 5. MUTATION 3: Creating New Task (TO_DO)...');
    const createTaskRes = await apiRequest('POST', '/tasks/create', {
      title: 'Garden Lawn Maintenance Auto Test',
      description: 'Trim grass and check irrigation sprinklers.',
      departmentId: createdDeptId,
      assignedStaffId: createdUserId,
      priority: 'HIGH',
      status: 'TO_DO',
      dueDate: '2026-08-15T10:00:00'
    }, token);
    const createdTaskId = createTaskRes.data.data ? createTaskRes.data.data.id : createTaskRes.data.id;

    const stats3Res = await apiRequest('GET', '/stats/dashboard', null, token);
    const stats3 = stats3Res.data.data;
    assertMetric('Total Tasks Increment (+1)', baseStats.totalTasks, baseStats.totalTasks + 1, stats3.totalTasks);
    assertMetric('To-Do Tasks Increment (+1)', baseStats.toDoTasks, baseStats.toDoTasks + 1, stats3.toDoTasks);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);

    // -----------------------------------------------------------------
    // 6. MUTATION 4: UPDATE TASK STATUS (TO_DO -> IN_PROGRESS)
    // -----------------------------------------------------------------
    console.log('\n📍 6. MUTATION 4: Updating Task Status (TO_DO -> IN_PROGRESS)...');
    await apiRequest('PATCH', `/tasks/${createdTaskId}/status`, { status: 'IN_PROGRESS' }, token);

    const stats4Res = await apiRequest('GET', '/stats/dashboard', null, token);
    const stats4 = stats4Res.data.data;
    assertMetric('To-Do Tasks Decrement (-1)', baseStats.toDoTasks + 1, baseStats.toDoTasks, stats4.toDoTasks);
    assertMetric('In-Progress Tasks Increment (+1)', baseStats.inProgressTasks, baseStats.inProgressTasks + 1, stats4.inProgressTasks);

    // -----------------------------------------------------------------
    // 7. MUTATION 5: UPDATE TASK STATUS (IN_PROGRESS -> COMPLETED)
    // -----------------------------------------------------------------
    console.log('\n📍 7. MUTATION 5: Completing Task (IN_PROGRESS -> COMPLETED)...');
    await apiRequest('PATCH', `/tasks/${createdTaskId}/status`, { status: 'COMPLETED' }, token);

    const stats5Res = await apiRequest('GET', '/stats/dashboard', null, token);
    const stats5 = stats5Res.data.data;
    assertMetric('In-Progress Tasks Decrement (-1)', baseStats.inProgressTasks + 1, baseStats.inProgressTasks, stats5.inProgressTasks);
    assertMetric('Completed Tasks Increment (+1)', baseStats.completedTasks, baseStats.completedTasks + 1, stats5.completedTasks);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);

    // -----------------------------------------------------------------
    // 8. MUTATION 6: CLEANUP & BASELINE RESTORATION
    // -----------------------------------------------------------------
    console.log('\n📍 8. MUTATION 6: Deleting Test Entities & Verifying Baseline Restoration...');
    if (createdTaskId) await apiRequest('DELETE', `/tasks/${createdTaskId}`, null, token);
    if (createdUserId) await apiRequest('DELETE', `/admin/users/${createdUserId}`, null, token);
    if (createdDeptId) await apiRequest('DELETE', `/admin/departments/${createdDeptId}`, null, token);

    const finalRes = await apiRequest('GET', '/stats/dashboard', null, token);
    const finalStats = finalRes.data.data;

    assertMetric('Restored Total Departments', baseStats.totalDepartments, baseStats.totalDepartments, finalStats.totalDepartments);
    assertMetric('Restored Total Users', baseStats.totalUsers, baseStats.totalUsers, finalStats.totalUsers);
    assertMetric('Restored Total Tasks', baseStats.totalTasks, baseStats.totalTasks, finalStats.totalTasks);

    console.log('\n================================================================================');
    console.log('🏆 DYNAMIC DASHBOARD STATE VERIFICATION SUMMARY REPORT');
    console.log('================================================================================');
    const passed = verificationLog.filter(v => v.passed).length;
    console.log(`TOTAL METRICS ASSERTED : ${verificationLog.length}`);
    console.log(`PASSING METRICS        : ${passed}`);
    console.log(`FAILING METRICS        : ${verificationLog.length - passed}`);
    console.log(`ACCURACY RATE          : ${((passed / verificationLog.length) * 100).toFixed(2)}%`);
    console.log('================================================================================\n');

    await sleep(2000);

  } catch (err) {
    console.error('❌ Error during dashboard verification:', err);
  } finally {
    await browser.close();
  }
})();
