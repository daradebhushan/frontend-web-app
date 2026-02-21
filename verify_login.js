// Native fetch check

// Using standard https/http if fetch not available or just write simple check.
// Actually, I'll use simple http request or native fetch if node version > 18.
// The environment is Node 24 (checked earlier). So 'fetch' is available.

async function verify() {
    try {
        console.log("1. Testing Login...");
        const loginRes = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:4200'
            },
            body: JSON.stringify({
                email: 'owner2@govt.in',
                password: 'password'
            })
        });

        console.log(`Login Status: ${loginRes.status}`);
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error("Login Failed:", loginData);
            return;
        }

        console.log("Login Success! Token received.");
        const token = loginData.data.token;

        console.log("2. Testing Admin Dashboard Stats...");
        const statsRes = await fetch('http://localhost:8080/api/stats/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Origin': 'http://localhost:4200'
            }
        });

        console.log(`Stats Status: ${statsRes.status}`);
        const statsData = await statsRes.json();

        if (statsRes.ok) {
            console.log("Stats Fetched:", statsData.data);
            console.log("\nVERIFICATION SUCCESSFUL: Frontend-Backend link is working.");
        } else {
            console.error("Stats Failed:", statsData);
        }

    } catch (e) {
        console.error("Verification Error:", e);
    }
}

verify();
