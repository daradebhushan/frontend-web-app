const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:4200';
const MOBILE_URL = 'http://localhost:8100';
const API_URL = 'http://localhost:8080/api';
const SCREENSHOT_DIR = '/Volumes/Extreme SSD/.gemini/antigravity-ide/brain/399e5d57-0d09-4e58-948e-77631a964418/screenshots';

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

      req.setTimeout(15000, () => {
        req.destroy();
        resolve({ status: 504, error: 'Request Timeout' });
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
  console.log('🌐 MASTER END-TO-END FUNCTIONAL AUDIT (WEB, MOBILE, BACKEND & DATABASE)');
  console.log('================================================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = (await browser.pages())[0] || (await browser.newPage());
  const auditResults = [];

  function record(moduleName, feature, passed, details = '') {
    auditResults.push({ moduleName, feature, passed, details });
    const symbol = passed ? '✅' : '❌';
    console.log(`${symbol} [${passed ? 'PASS' : 'FAIL'}] ${moduleName} - ${feature} ${details ? ' (' + details + ')' : ''}`);
  }

  let ownerToken = null;
  let adminToken = null;
  let createdDeptId = null;
  let createdUserId = null;
  let createdTypeId = null;
  let createdCompId = null;
  let createdTaskId = null;

  try {
    // -----------------------------------------------------------------
    // MODULE 1: AUTHENTICATION & MULTI-ROLE LOGIN (REST API & WEB UI)
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 1: Authentication & Role Authorization ---');

    // 1.1 Owner API Login
    const ownerRes = await apiRequest('POST', '/auth/login', { email: 'owner@govt.in', password: 'password' });
    if (ownerRes.status === 200 && ownerRes.data.data.token) {
      ownerToken = ownerRes.data.data.token;
      record('Auth', 'Owner REST API Login', true, 'Token Acquired');
    } else {
      record('Auth', 'Owner REST API Login', false, `Status ${ownerRes.status}`);
    }

    // 1.2 Admin API Login
    const adminRes = await apiRequest('POST', '/auth/login', { email: 'co@nagar.in', password: 'password' });
    if (adminRes.status === 200 && adminRes.data.data.token) {
      adminToken = adminRes.data.data.token;
      record('Auth', 'Chief Officer Admin REST API Login', true, 'Token Acquired');
    } else {
      record('Auth', 'Chief Officer Admin REST API Login', false, `Status ${adminRes.status}`);
    }

    // 1.3 UI Web Form Login & Direct Auth Navigation
    await page.goto(`${BASE_URL}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((token) => {
      localStorage.setItem('auth_data', JSON.stringify({ token: token, email: 'co@nagar.in', roles: ['ADMIN'] }));
    }, adminToken);
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);

    const loggedInUrl = page.url();
    record('Auth UI', 'Web Login & Dashboard Redirect', loggedInUrl.includes('/admin') || loggedInUrl.includes('/dashboard'), `URL: ${loggedInUrl}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'm1_admin_dashboard.png') });

    // -----------------------------------------------------------------
    // MODULE 2: DEPARTMENT MANAGEMENT (DEFAULT SEEDING & CRUD)
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 2: Department Management (Seeding & CRUD) ---');

    // 2.1 Verify Default Seeded Departments
    const getDeptsRes = await apiRequest('GET', '/admin/departments', null, adminToken);
    const depts = getDeptsRes.data.data ? (getDeptsRes.data.data.content || getDeptsRes.data.data) : [];
    record('Departments', 'Verify 5 Default Municipal Departments', Array.isArray(depts) && depts.length >= 5, `Total Departments: ${depts.length}`);

    // 2.2 Create Department
    const createDeptRes = await apiRequest('POST', '/admin/departments', {
      name: 'Sanitation & Hygiene Master QA',
      nameMr: 'आरोग्य व स्वच्छता मास्टर QA',
      chatbotEnabled: true,
      subQuestions: 'कचरा उचलणे, नाली गटार स्वच्छता'
    }, adminToken);

    if (createDeptRes.status === 200 || createDeptRes.status === 201) {
      createdDeptId = createDeptRes.data.data ? createDeptRes.data.data.id : createDeptRes.data.id;
      record('Departments', 'Create New Department', true, `ID: ${createdDeptId}`);
    } else {
      record('Departments', 'Create New Department', false, `Status ${createDeptRes.status}`);
    }

    // 2.3 Update Department
    if (createdDeptId) {
      const updateDeptRes = await apiRequest('PUT', `/admin/departments/${createdDeptId}`, {
        name: 'Sanitation, Public Health & Hygiene Dept QA',
        nameMr: 'सार्वजनिक आरोग्य व स्वच्छता विभाग QA',
        chatbotEnabled: true
      }, adminToken);
      record('Departments', 'Update Department Details', updateDeptRes.status === 200);
    }

    await page.goto(`${BASE_URL}/admin/departments`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'm2_departments_list.png') });

    // -----------------------------------------------------------------
    // MODULE 3: USER & STAFF MANAGEMENT (CRUD & REPORTS)
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 3: User & Staff Management ---');

    const randNum = Math.floor(Math.random() * 10000);
    const staffEmail = `master_inspector_${randNum}@nagar.in`;

    const createUserRes = await apiRequest('POST', '/admin/users', {
      name: 'Inspector Vijay Master QA',
      mobile: '9876543210',
      email: staffEmail,
      password: 'password123',
      role: 'STAFF',
      departmentId: createdDeptId || depts[0].id,
      designation: 'Senior Inspector'
    }, adminToken);

    if (createUserRes.status === 200 || createUserRes.status === 201) {
      createdUserId = createUserRes.data.data ? createUserRes.data.data.id : createUserRes.data.id;
      record('User Management', 'Create Staff Account', true, `Email: ${staffEmail}, ID: ${createdUserId}`);
    } else {
      record('User Management', 'Create Staff Account', false, `Status ${createUserRes.status}`);
    }

    // 3.2 Update User Designation
    if (createdUserId) {
      const updateUserRes = await apiRequest('PUT', `/admin/users/${createdUserId}`, {
        name: 'Inspector Vijay Master QA Updated',
        mobile: '9876543210',
        email: staffEmail,
        role: 'STAFF',
        departmentId: createdDeptId || depts[0].id,
        designation: 'Chief Sanitation Officer'
      }, adminToken);
      record('User Management', 'Update User Designation & Role', updateUserRes.status === 200);

      // 3.3 Employee Report Endpoint
      const reportRes = await apiRequest('GET', `/admin/users/${createdUserId}/report`, null, adminToken);
      record('User Management', 'Employee Task Performance Report', reportRes.status === 200);
    }

    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'm3_users_list.png') });

    // -----------------------------------------------------------------
    // MODULE 4: COMPLAINT TYPES & BILINGUAL SUPPORT (EN/MR)
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 4: Complaint Types & Bilingual Support ---');

    const createTypeRes = await apiRequest('POST', '/admin/complaint-types', {
      nameEn: 'Drainage Pipe Leakage QA',
      nameMr: 'गटार पाईप गळती QA',
      departmentId: createdDeptId || depts[0].id,
      active: true
    }, adminToken);

    if (createTypeRes.status === 200 || createTypeRes.status === 201) {
      createdTypeId = createTypeRes.data.id || (createTypeRes.data.data ? createTypeRes.data.data.id : null);
      record('Complaint Types', 'Create Bilingual Complaint Type (EN/MR)', true, `ID: ${createdTypeId}`);
    } else {
      record('Complaint Types', 'Create Bilingual Complaint Type (EN/MR)', false, `Status ${createTypeRes.status}`);
    }

    await page.goto(`${BASE_URL}/admin/complaint-types`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'm4_complaint_types.png') });

    // -----------------------------------------------------------------
    // MODULE 5: PUBLIC CITIZEN COMPLAINT SUBMISSION
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 5: Public Citizen Complaints ---');

    const compRes = await apiRequest('POST', '/public/complaints', {
      name: 'Rohan Citizen Master QA',
      mobile: '9111122222',
      departmentId: createdDeptId || depts[0].id,
      complaintTypeId: createdTypeId,
      description: 'Severe drainage leak near central market',
      location: 'Ward No 3, Central Market Road'
    });

    if (compRes.status === 200 || compRes.status === 201) {
      createdCompId = compRes.data.id || (compRes.data.data ? compRes.data.data.id : null);
      record('Public Complaints', 'Submit Citizen Complaint', true, `Complaint ID: ${createdCompId}`);
    } else {
      record('Public Complaints', 'Submit Citizen Complaint', false, `Status ${compRes.status}`);
    }

    await page.goto(`${BASE_URL}/complaints`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    // Update Status
    if (createdCompId) {
      const updateCompRes = await apiRequest('PUT', `/admin/complaints/${createdCompId}/status`, {
        status: 'ACCEPTED',
        reason: 'Accepted by Chief Officer and queued for maintenance team.'
      }, adminToken);
      record('Public Complaints', 'Update Status to ACCEPTED', updateCompRes.status === 200);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'm5_complaints_list.png') });

    // -----------------------------------------------------------------
    // MODULE 6: JIRA-STYLE TASK MANAGEMENT & COLLABORATION
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 6: Task Board & Collaboration ---');

    const createTaskRes = await apiRequest('POST', '/tasks/create', {
      title: 'Fix Central Market Drain Block QA',
      description: 'Deploy maintenance team to unblock main line.',
      departmentId: createdDeptId || depts[0].id,
      assignedStaffId: createdUserId,
      relatedComplaintId: createdCompId,
      priority: 'HIGH',
      status: 'TO_DO',
      dueDate: '2026-08-10T10:00:00'
    }, adminToken);

    if (createTaskRes.status === 200 || createTaskRes.status === 201) {
      createdTaskId = createTaskRes.data.data ? createTaskRes.data.data.id : createTaskRes.data.id;
      record('Task Management', 'Create & Assign Task', true, `Task ID: ${createdTaskId}`);
    } else {
      record('Task Management', 'Create & Assign Task', false, `Status ${createTaskRes.status}`);
    }

    await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    if (createdTaskId) {
      const patchTaskRes = await apiRequest('PATCH', `/tasks/${createdTaskId}/status`, { status: 'IN_PROGRESS' }, adminToken);
      record('Task Management', 'Update Task Status (IN_PROGRESS)', patchTaskRes.status === 200);

      const addCommentRes = await apiRequest('POST', `/tasks/${createdTaskId}/comments`, { text: 'Workers dispatched with jetting unit.' }, adminToken);
      record('Task Management', 'Post Task Comment', addCommentRes.status === 200);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'm6_tasks_board.png') });

    // -----------------------------------------------------------------
    // MODULE 7: MOBILE APP WEB COMPONENT TESTING
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 7: Mobile App Web Integration ---');
    await page.goto(`${MOBILE_URL}`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    record('Mobile App', 'Load Mobile App Web Interface (Port 8100)', page.url().includes('8100'), `URL: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'm7_mobile_app.png') });

    // -----------------------------------------------------------------
    // MODULE 8: SYSTEM CLEANUP (DELETE OPERATIONS)
    // -----------------------------------------------------------------
    console.log('\n--- MODULE 8: Data Cleanup & Delete Validation ---');

    if (createdTaskId) {
      const delTaskRes = await apiRequest('DELETE', `/tasks/${createdTaskId}`, null, adminToken);
      record('Cleanup', 'Delete Task (DELETE)', delTaskRes.status === 200 || delTaskRes.status === 204);
    }

    if (createdCompId) {
      const delCompRes = await apiRequest('DELETE', `/admin/complaints/${createdCompId}`, null, adminToken);
      record('Cleanup', 'Delete Complaint (DELETE)', delCompRes.status === 200 || delCompRes.status === 204);
    }

    if (createdUserId) {
      const delUserRes = await apiRequest('DELETE', `/admin/users/${createdUserId}`, null, adminToken);
      record('Cleanup', 'Delete Staff User (DELETE)', delUserRes.status === 200 || delUserRes.status === 204);
    }

    if (createdDeptId) {
      const delDeptRes = await apiRequest('DELETE', `/admin/departments/${createdDeptId}`, null, adminToken);
      record('Cleanup', 'Delete Department (DELETE)', delDeptRes.status === 200 || delDeptRes.status === 204);
    }

  } catch (err) {
    console.error('❌ Functional Audit Error:', err);
  } finally {
    await browser.close();
    console.log('\n================================================================================');
    console.log('🏆 MASTER FUNCTIONAL AUDIT SUMMARY REPORT');
    console.log('================================================================================');
    const passed = auditResults.filter(r => r.passed).length;
    console.log(`TOTAL SCENARIOS VERIFIED : ${auditResults.length}`);
    console.log(`PASSING SCENARIOS       : ${passed}`);
    console.log(`FAILING SCENARIOS       : ${auditResults.length - passed}`);
    console.log(`PASS RATE               : ${((passed / auditResults.length) * 100).toFixed(2)}%`);
    console.log('================================================================================\n');
  }
})();
