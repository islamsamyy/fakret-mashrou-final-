const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 500)
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('Testing investor dashboard...');
  const result = await makeRequest('/dashboard/investor');
  console.log('Status:', result.status);
  console.log('Redirects to:', result.headers.location || 'No redirect');
  
  console.log('\nTesting founder dashboard...');
  const result2 = await makeRequest('/dashboard/founder');
  console.log('Status:', result2.status);
  console.log('Redirects to:', result2.headers.location || 'No redirect');
}

test().catch(console.error);
