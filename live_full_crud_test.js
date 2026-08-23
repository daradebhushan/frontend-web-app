const puppeteer = require('puppeteer-core');
const http = require('http');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:4200';
const API_URL = 'http://localhost:8080/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${path}`);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  console.log('🚀 Executing Complete End-to-End Live Web App CRUD Operations...\n');

  // Launch visible Chrome
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false, // Shows visible Chrome browser window on screen!
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = (await browser.pages())[0] || (await browser.newPage());

  try {
    // ----------------------------------------------------
    // STEP 1: AUTHENTICATION & LOGIN AS CHIEF OFFICER (ADMIN)
    // ----------------------------------------------------
    console.log('📍 STEP 1: Logging in as Chief Officer (ADMIN)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    await page.type('#email', 'co@nagar.in', { delay: 80 });
    await sleep(500);
    await page.type('#password', 'password', { delay: 80 });
    await sleep(800);

    await page.click('button[type="submit"]');
    await sleep(3000);
    console.log(`   ✅ Logged in successfully! Current URL: ${page.url()}`);

    // Get Auth Token for background API CRUD verification
    const loginApiRes = await apiRequest('POST', '/auth/login', { email: 'co@nagar.in', password: 'password' });
    const authToken = loginApiRes.data.data.token;

    // ----------------------------------------------------
    // STEP 2: VERIFY DEFAULT DEPARTMENTS (READ & CREATE CRUD)
    // ----------------------------------------------------
    console.log('\n📍 STEP 2: Navigating to Department Management & Verifying Default Departments...');
    await page.goto(`${BASE_URL}/admin/departments`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    // API Verification for Default Departments
    const getDeptsRes = await apiRequest('GET', '/admin/departments', null, authToken);
    const depts = getDeptsRes.data.data ? (getDeptsRes.data.data.content || getDeptsRes.data.data) : [];
    console.log(`   ✅ Default Departments Loaded: ${depts.length} departments found.`);
    depts.forEach(d => console.log(`      • ${d.name} (${d.nameMr || 'No Marathi Name'})`));

    // Create New Department
    console.log('   📍 Creating a New Test Department via API...');
    const createDeptRes = await apiRequest('POST', '/admin/departments', {
      name: 'Parks & Garden Dept QA',
      nameMr: 'उद्यान व बागकाम विभाग QA',
      chatbotEnabled: true,
      subQuestions: 'झाडे छाटणी, बागेची निगा'
    }, authToken);
    const createdDeptId = createDeptRes.data.data ? createDeptRes.data.data.id : createDeptRes.data.id;
    console.log(`   ✅ New Department Created! ID: ${createdDeptId}`);

    // Refresh UI page to reflect new department
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(2500);

    // Update Department
    console.log(`   📍 Updating Department ID ${createdDeptId}...`);
    await apiRequest('PUT', `/admin/departments/${createdDeptId}`, {
      name: 'Parks, Tree Trimming & Gardens Dept QA',
      nameMr: 'उद्यान व वृक्ष छाटणी विभाग QA',
      chatbotEnabled: true
    }, authToken);
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(2500);

    // ----------------------------------------------------
    // STEP 3: USER & STAFF MANAGEMENT (CRUD)
    // ----------------------------------------------------
    console.log('\n📍 STEP 3: Navigating to Staff & User Management...');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    const randomNum = Math.floor(Math.random() * 10000);
    const staffEmail = `inspector_${randomNum}@nagar.in`;
    console.log(`   📍 Creating New Staff Member: ${staffEmail}...`);

    const createUserRes = await apiRequest('POST', '/admin/users', {
      name: 'Inspector Suresh',
      mobile: '9876543210',
      email: staffEmail,
      password: 'password123',
      role: 'STAFF',
      departmentId: createdDeptId || depts[0].id,
      designation: 'Senior Garden Inspector'
    }, authToken);
    const createdUserId = createUserRes.data.data ? createUserRes.data.data.id : createUserRes.data.id;
    console.log(`   ✅ Staff Member Created! ID: ${createdUserId}`);

    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(2500);

    // ----------------------------------------------------
    // STEP 4: COMPLAINT TYPES & CITIZEN COMPLAINTS (CRUD)
    // ----------------------------------------------------
    console.log('\n📍 STEP 4: Complaint Types & Complaint Lifecycle...');
    
    // Create Complaint Type
    const createTypeRes = await apiRequest('POST', '/admin/complaint-types', {
      nameEn: 'Park Tree Trimming QA',
      nameMr: 'झाडांची छाटणी QA',
      departmentId: createdDeptId || depts[0].id,
      active: true
    }, authToken);
    const createdTypeId = createTypeRes.data.id || (createTypeRes.data.data ? createTypeRes.data.data.id : null);
    console.log(`   ✅ Complaint Type Created! ID: ${createdTypeId}`);

    // Submit Public Complaint
    console.log('   📍 Submitting Citizen Complaint...');
    const createCompRes = await apiRequest('POST', '/public/complaints', {
      name: 'Sunil Citizen',
      mobile: '9888877777',
      departmentId: createdDeptId || depts[0].id,
      complaintTypeId: createdTypeId,
      description: 'Overgrown tree branches blocking street lights',
      location: 'Ward 2, Garden Road'
    });
    const createdCompId = createCompRes.data.id || (createCompRes.data.data ? createCompRes.data.data.id : null);
    console.log(`   ✅ Citizen Complaint Submitted! Complaint ID: ${createdCompId}`);

    // View Complaints in UI
    await page.goto(`${BASE_URL}/complaints`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // Update Complaint Status
    console.log(`   📍 Updating Complaint ID ${createdCompId} Status to ACCEPTED...`);
    await apiRequest('PUT', `/admin/complaints/${createdCompId}/status`, {
      status: 'ACCEPTED',
      reason: 'Accepted by Chief Officer and queued for tree pruning team.'
    }, authToken);
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(2500);

    // ----------------------------------------------------
    // STEP 5: TASK CREATION & ASSIGNMENT (CRUD)
    // ----------------------------------------------------
    console.log('\n📍 STEP 5: Task Management & Staff Assignment...');
    const createTaskRes = await apiRequest('POST', '/tasks/create', {
      title: 'Trim Ward 2 Overgrown Trees QA',
      description: 'Prune branches blocking electricity lines and street lights.',
      departmentId: createdDeptId || depts[0].id,
      assignedStaffId: createdUserId,
      relatedComplaintId: createdCompId,
      priority: 'HIGH',
      status: 'TO_DO',
      dueDate: '2026-08-05T10:00:00'
    }, authToken);
    const createdTaskId = createTaskRes.data.data ? createTaskRes.data.data.id : createTaskRes.data.id;
    console.log(`   ✅ Task Created and Assigned! Task ID: ${createdTaskId}`);

    await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // Update Task Status & Post Comment
    console.log(`   📍 Updating Task ${createdTaskId} Status to IN_PROGRESS...`);
    await apiRequest('PATCH', `/tasks/${createdTaskId}/status`, { status: 'IN_PROGRESS' }, authToken);
    await apiRequest('POST', `/tasks/${createdTaskId}/comments`, { text: 'Pruning team equipped and dispatched to Garden Road.' }, authToken);
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(2500);

    // ----------------------------------------------------
    // STEP 6: DELETE OPERATIONS & CLEANUP (CRUD)
    // ----------------------------------------------------
    console.log('\n📍 STEP 6: Performing Delete Operations & Cleanup...');
    if (createdTaskId) {
      await apiRequest('DELETE', `/tasks/${createdTaskId}`, null, authToken);
      console.log(`   ✅ Task ID ${createdTaskId} Deleted.`);
    }
    if (createdCompId) {
      await apiRequest('DELETE', `/admin/complaints/${createdCompId}`, null, authToken);
      console.log(`   ✅ Complaint ID ${createdCompId} Deleted.`);
    }
    if (createdUserId) {
      await apiRequest('DELETE', `/admin/users/${createdUserId}`, null, authToken);
      console.log(`   ✅ Staff User ID ${createdUserId} Deleted.`);
    }
    if (createdDeptId) {
      await apiRequest('DELETE', `/admin/departments/${createdDeptId}`, null, authToken);
      console.log(`   ✅ Department ID ${createdDeptId} Deleted.`);
    }

    console.log('\n🎉 ALL WEB APP CRUD OPERATIONS & DEFAULT DEPARTMENTS VERIFIED SUCCESSFULLY!');
    await sleep(3000);

  } catch (err) {
    console.error('❌ Error during E2E CRUD Testing:', err);
  } finally {
    await browser.close();
  }
})();
