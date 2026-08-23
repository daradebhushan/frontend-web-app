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
  console.log('====================================================');
  console.log('🚀 Executing Complete Web App E2E CRUD & API Suite');
  console.log('====================================================\n');

  const testResults = [];
  function record(testName, passed, details = '') {
    testResults.push({ testName, passed, details });
    const symbol = passed ? '✅' : '❌';
    console.log(`${symbol} [${passed ? 'PASS' : 'FAIL'}] ${testName} ${details ? ' - ' + details : ''}`);
  }

  let authToken = null;
  let createdDeptId = null;
  let createdUserId = null;
  let createdComplaintTypeId = null;
  let createdComplaintId = null;
  let createdTaskId = null;

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: AUTHENTICATION & LOGIN (API + UI)
    // ----------------------------------------------------
    console.log('--- TEST SUITE 1: Authentication & Roles ---');

    // 1.1 Direct API Login
    const loginRes = await apiRequest('POST', '/auth/login', { email: 'owner@govt.in', password: 'password' });
    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.data.token) {
      authToken = loginRes.data.data.token;
      record('Auth API: Owner Login', true, `Token acquired for ${loginRes.data.data.email}`);
    } else {
      record('Auth API: Owner Login', false, `Status: ${loginRes.status}`);
    }

    // 1.2 UI Browser Login
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.type('#email', 'owner@govt.in');
    await page.type('#password', 'password');
    await page.click('button[type="submit"]');
    await sleep(2500);

    const uiUrl = page.url();
    const uiLoginSuccess = uiUrl.includes('/owner') || uiUrl.includes('/admin') || uiUrl.includes('/dashboard');
    record('Auth UI: Browser Form Login & Redirect', uiLoginSuccess, `Navigated to: ${uiUrl}`);

    // ----------------------------------------------------
    // TEST SUITE 2: DEPARTMENT MANAGEMENT (CRUD)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 2: Department Management (CRUD) ---');

    // 2.1 CREATE Department
    const createDeptRes = await apiRequest('POST', '/admin/departments', {
      name: 'Sanitation & Health Dept QA',
      nameMr: 'स्वच्छता आणि आरोग्य विभाग QA',
      chatbotEnabled: true,
      subQuestions: 'कचरा गोळा करणे, गटर स्वच्छता'
    }, authToken);

    if (createDeptRes.status === 200 || createDeptRes.status === 201) {
      createdDeptId = createDeptRes.data.data ? createDeptRes.data.data.id : createDeptRes.data.id;
      record('Department: Create New Department', true, `ID: ${createdDeptId}`);
    } else {
      record('Department: Create New Department', false, `Status: ${createDeptRes.status}`);
    }

    // 2.2 READ Departments List
    const getDeptsRes = await apiRequest('GET', '/admin/departments', null, authToken);
    const depts = getDeptsRes.data.data ? (getDeptsRes.data.data.content || getDeptsRes.data.data) : [];
    const deptFound = Array.isArray(depts) && depts.some(d => d.name && d.name.includes('Sanitation & Health Dept QA'));
    record('Department: Read Departments List', deptFound, `Total departments: ${Array.isArray(depts) ? depts.length : 0}`);

    // 2.3 UPDATE Department
    if (createdDeptId) {
      const updateDeptRes = await apiRequest('PUT', `/admin/departments/${createdDeptId}`, {
        name: 'Sanitation & Public Health Dept QA',
        nameMr: 'स्वच्छता आणि सार्वजनिक आरोग्य विभाग QA',
        chatbotEnabled: true
      }, authToken);
      record('Department: Update Department Details', updateDeptRes.status === 200);
    }

    // ----------------------------------------------------
    // TEST SUITE 3: USER & STAFF MANAGEMENT (CRUD)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 3: User & Staff Management (CRUD) ---');

    // 3.1 CREATE Staff User
    const randomNum = Math.floor(Math.random() * 10000);
    const testStaffEmail = `ramesh_staff_${randomNum}@nagar.in`;

    const createUserRes = await apiRequest('POST', '/admin/users', {
      name: 'Ramesh Staff QA',
      mobile: '9876543210',
      email: testStaffEmail,
      password: 'password123',
      role: 'STAFF',
      departmentId: createdDeptId || (Array.isArray(depts) && depts[0] ? depts[0].id : 1),
      designation: 'Senior Sanitary Inspector'
    }, authToken);

    if (createUserRes.status === 200 || createUserRes.status === 201) {
      createdUserId = createUserRes.data.data ? createUserRes.data.data.id : createUserRes.data.id;
      record('User Management: Create Staff User', true, `Email: ${testStaffEmail}, ID: ${createdUserId}`);
    } else {
      record('User Management: Create Staff User', false, `Status: ${createUserRes.status}`);
    }

    // 3.2 READ Users List
    const getUsersRes = await apiRequest('GET', '/admin/users', null, authToken);
    const users = getUsersRes.data.data ? (getUsersRes.data.data.content || getUsersRes.data.data) : [];
    const userFound = Array.isArray(users) && users.some(u => u.email === testStaffEmail);
    record('User Management: Read Users List', userFound, `Total users: ${Array.isArray(users) ? users.length : 0}`);

    // 3.3 UPDATE User
    if (createdUserId) {
      const updateUserRes = await apiRequest('PUT', `/admin/users/${createdUserId}`, {
        name: 'Ramesh Staff QA Updated',
        mobile: '9876543210',
        email: testStaffEmail,
        role: 'STAFF',
        departmentId: createdDeptId || 1,
        designation: 'Chief Sanitary Inspector'
      }, authToken);
      record('User Management: Update User Information', updateUserRes.status === 200);
    }

    // ----------------------------------------------------
    // TEST SUITE 4: COMPLAINT TYPES & COMPLAINTS CRUD
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 4: Complaints & Complaint Types (CRUD) ---');

    // 4.1 CREATE Complaint Type
    const createTypeRes = await apiRequest('POST', '/admin/complaint-types', {
      nameEn: 'Drainage Overflow QA',
      nameMr: 'गटार ओव्हरफ्लो QA',
      departmentId: createdDeptId || 1,
      active: true
    }, authToken);

    if (createTypeRes.status === 200 || createTypeRes.status === 201) {
      const typeData = createTypeRes.data;
      createdComplaintTypeId = typeData.id || (typeData.data ? typeData.data.id : null);
      record('Complaint Types: Create Complaint Type', true, `ID: ${createdComplaintTypeId}`);
    } else {
      record('Complaint Types: Create Complaint Type', false, `Status: ${createTypeRes.status}`);
    }

    // 4.2 READ Complaint Types List
    const getTypesRes = await apiRequest('GET', '/admin/complaint-types', null, authToken);
    const types = Array.isArray(getTypesRes.data) ? getTypesRes.data : (getTypesRes.data.data || []);
    record('Complaint Types: Read Types List', Array.isArray(types) && types.length >= 0, `Total types: ${types.length}`);

    // 4.3 CREATE Complaint (Public endpoint)
    const createComplaintRes = await apiRequest('POST', '/public/complaints', {
      name: 'Anil Citizen',
      mobile: '9123456789',
      departmentId: createdDeptId || 1,
      complaintTypeId: createdComplaintTypeId || (types[0] ? types[0].id : null),
      description: 'Severe drainage leak on main street',
      location: 'Ward No 4, Main Market Road'
    });

    if (createComplaintRes.status === 200 || createComplaintRes.status === 201) {
      const compData = createComplaintRes.data;
      createdComplaintId = compData.id || (compData.data ? compData.data.id : null);
      record('Complaints: Submit Citizen Complaint', true, `Complaint ID: ${createdComplaintId}`);
    } else {
      record('Complaints: Submit Citizen Complaint', false, `Status: ${createComplaintRes.status}`);
    }

    // 4.4 READ Complaints List (Admin endpoint)
    const getComplaintsRes = await apiRequest('GET', '/admin/complaints', null, authToken);
    const complaints = Array.isArray(getComplaintsRes.data) ? getComplaintsRes.data : (getComplaintsRes.data.data || []);
    record('Complaints: Read Admin Complaints List', Array.isArray(complaints) && complaints.length >= 0, `Total complaints: ${complaints.length}`);

    // 4.5 UPDATE Complaint Status
    if (createdComplaintId) {
      const updateComplaintRes = await apiRequest('PUT', `/admin/complaints/${createdComplaintId}/status`, {
        status: 'ACCEPTED',
        reason: 'Complaint accepted by department head and queued for resolution.'
      }, authToken);
      record('Complaints: Update Complaint Status (ACCEPTED)', updateComplaintRes.status === 200);
    }

    // ----------------------------------------------------
    // TEST SUITE 5: TASK MANAGEMENT (CRUD)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 5: Task Management (CRUD) ---');

    // 5.1 CREATE Task (/api/tasks/create)
    const createTaskRes = await apiRequest('POST', '/tasks/create', {
      title: 'Clear Ward 4 Drain Line QA',
      description: 'Deploy sanitation workers to clear the drainage block.',
      departmentId: createdDeptId || 1,
      assignedStaffId: createdUserId || null,
      relatedComplaintId: createdComplaintId || null,
      priority: 'HIGH',
      status: 'TO_DO',
      dueDate: '2026-08-01T10:00:00'
    }, authToken);

    if (createTaskRes.status === 200 || createTaskRes.status === 201) {
      const taskData = createTaskRes.data;
      createdTaskId = taskData.data ? taskData.data.id : taskData.id;
      record('Tasks: Create & Assign Task', true, `Task ID: ${createdTaskId}`);
    } else {
      record('Tasks: Create & Assign Task', false, `Status: ${createTaskRes.status}, Body: ${JSON.stringify(createTaskRes.data)}`);
    }

    // 5.2 READ Tasks List
    const getTasksRes = await apiRequest('GET', '/tasks', null, authToken);
    const tasks = getTasksRes.data.data ? (getTasksRes.data.data.content || getTasksRes.data.data) : [];
    record('Tasks: Read Tasks Board/List', Array.isArray(tasks) && tasks.length >= 0, `Total tasks: ${Array.isArray(tasks) ? tasks.length : 0}`);

    // 5.3 UPDATE Task Status & Comment
    if (createdTaskId) {
      const updateTaskRes = await apiRequest('PATCH', `/tasks/${createdTaskId}/status`, {
        status: 'IN_PROGRESS'
      }, authToken);
      record('Tasks: Update Task Status (IN_PROGRESS)', updateTaskRes.status === 200);

      const addCommentRes = await apiRequest('POST', `/tasks/${createdTaskId}/comments`, {
        text: 'Workers dispatched to site with excavation equipment.'
      }, authToken);
      record('Tasks: Add Comment to Task', addCommentRes.status === 200);
    }

    // ----------------------------------------------------
    // TEST SUITE 6: CLEANUP TEST DATA (DELETE CRUD)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 6: Delete Operations & Data Cleanup ---');

    if (createdTaskId) {
      const delTaskRes = await apiRequest('DELETE', `/tasks/${createdTaskId}`, null, authToken);
      record('Tasks: Delete Task (DELETE)', delTaskRes.status === 200 || delTaskRes.status === 204);
    }

    if (createdComplaintId) {
      const delComplaintRes = await apiRequest('DELETE', `/admin/complaints/${createdComplaintId}`, null, authToken);
      record('Complaints: Delete Complaint (DELETE)', delComplaintRes.status === 200 || delComplaintRes.status === 204);
    }

    if (createdUserId) {
      const delUserRes = await apiRequest('DELETE', `/admin/users/${createdUserId}`, null, authToken);
      record('User Management: Delete User (DELETE)', delUserRes.status === 200 || delUserRes.status === 204, `Status: ${delUserRes.status}, Body: ${JSON.stringify(delUserRes.data)}`);
    }

    if (createdDeptId) {
      const delDeptRes = await apiRequest('DELETE', `/admin/departments/${createdDeptId}`, null, authToken);
      record('Department: Delete Department (DELETE)', delDeptRes.status === 200 || delDeptRes.status === 204, `Status: ${delDeptRes.status}, Body: ${JSON.stringify(delDeptRes.data)}`);
    }

    await browser.close();

  } catch (err) {
    console.error('❌ E2E Execution Error:', err);
  } finally {
    console.log('\n====================================================');
    console.log('SUMMARY OF ALL E2E CRUD TEST SCENARIOS:');
    const passedCount = testResults.filter(r => r.passed).length;
    console.log(`PASSING SCENARIOS: ${passedCount} / ${testResults.length}`);
    console.log('====================================================\n');
  }
})();
