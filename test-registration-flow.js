const https = require('https');
const querystring = require('querystring');

const testEmail = `testuser${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';
const testFullName = 'Test User';

console.log(`Testing registration flow with:`);
console.log(`Email: ${testEmail}`);
console.log(`Password: ${testPassword}`);
console.log(`Full Name: ${testFullName}`);
console.log('---');

// For development, use http instead
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testRegistration() {
  try {
    // Step 1: Test registration endpoint exists
    console.log('\n1. Testing if registration endpoint exists...');
    const registerPageRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/register',
      method: 'GET'
    });
    console.log(`   ✓ Registration page status: ${registerPageRes.status}`);

    // Step 2: Test registration form submission
    console.log('\n2. Testing registration form submission...');
    const formData = new URLSearchParams();
    formData.append('email', testEmail);
    formData.append('password', testPassword);
    formData.append('fullName', testFullName);
    formData.append('role', 'investor');

    const registerRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString())
      }
    }, formData.toString());

    console.log(`   Status: ${registerRes.status}`);
    console.log(`   Headers:`, JSON.stringify(registerRes.headers, null, 2).substring(0, 200));
    console.log(`   Body (first 500 chars):`, registerRes.body.substring(0, 500));

    // Step 3: Test dashboard routes
    console.log('\n3. Testing dashboard routing...');
    const investorDashRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/dashboard/investor',
      method: 'GET'
    });
    console.log(`   Investor dashboard status: ${investorDashRes.status}`);
    console.log(`   Redirects to: ${investorDashRes.headers.location || 'No redirect'}`);

    const founderDashRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/dashboard/founder',
      method: 'GET'
    });
    console.log(`   Founder dashboard status: ${founderDashRes.status}`);
    console.log(`   Redirects to: ${founderDashRes.headers.location || 'No redirect'}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRegistration();
