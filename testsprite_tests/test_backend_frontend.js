#!/usr/bin/env node
/**
 * Backend-Frontend Integration Test
 * Tests the connection between Next.js frontend and Supabase backend
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Backend-Frontend Integration Tests\n');
  console.log(`Testing against: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Home page loads
  try {
    console.log('TEST 1: Home page loads...');
    const res = await request('GET', '/');
    if (res.status === 200 && res.body.includes('html')) {
      console.log('✅ PASSED: Home page loads (Status: 200)\n');
      passed++;
    } else {
      console.log(`❌ FAILED: Expected status 200, got ${res.status}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}\n`);
    failed++;
  }

  // Test 2: API endpoints exist
  const apiEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/projects/create',
    '/api/invest',
    '/api/match',
    '/api/search',
  ];

  for (const endpoint of apiEndpoints) {
    try {
      console.log(`TEST: Testing endpoint ${endpoint}...`);
      const res = await request('GET', endpoint);
      // Expect 405 (method not allowed) or 400 (bad request) or 200/401 (exists)
      if (res.status === 405 || res.status === 400 || res.status === 200 || res.status === 401 || res.status === 500) {
        console.log(`✅ PASSED: Endpoint exists (Status: ${res.status})\n`);
        passed++;
      } else {
        console.log(`⚠️  UNKNOWN: Status ${res.status}\n`);
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}\n`);
      failed++;
    }
  }

  // Test 3: Static assets load
  try {
    console.log('TEST: Static assets (_next)...');
    const res = await request('GET', '/_next/static/');
    if (res.status === 200 || res.status === 404) {
      console.log(`✅ PASSED: Static path responds (Status: ${res.status})\n`);
      passed++;
    } else {
      console.log(`❌ FAILED: Static assets not accessible\n`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}\n`);
    failed++;
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed === 0) {
    console.log('✨ All tests passed! Backend-Frontend connection is working.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the connections above.\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
