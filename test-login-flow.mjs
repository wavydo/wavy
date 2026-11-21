// Test complete login flow
import fetch from 'node-fetch';

console.log('🧪 Testing complete login flow...\n');

try {
  // Step 1: Login
  console.log('1️⃣ Attempting login...');
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'miguelnla@outlook.com',
      password: 'password123',
      userType: 'user'
    })
  });

  console.log('Login Status:', loginResponse.status);
  
  if (!loginResponse.ok) {
    const errorText = await loginResponse.text();
    console.log('❌ Login failed:', errorText);
    process.exit(1);
  }

  const loginData = await loginResponse.json();
  console.log('✅ Login successful!');
  console.log('Response:', loginData);

  // Get session cookie
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('\n2️⃣ Session cookie:', cookies);

  if (!cookies) {
    console.log('❌ No session cookie received!');
    process.exit(1);
  }

  // Step 2: Try to access dashboard with cookie
  console.log('\n3️⃣ Accessing dashboard with session cookie...');
  const dashboardResponse = await fetch('http://localhost:5000/api/dashboard/user-data', {
    headers: {
      'Cookie': cookies
    }
  });

  console.log('Dashboard Status:', dashboardResponse.status);

  if (!dashboardResponse.ok) {
    const errorText = await dashboardResponse.text();
    console.log('❌ Dashboard access failed:', errorText);
    process.exit(1);
  }

  const dashboardData = await dashboardResponse.json();
  console.log('✅ Dashboard data received!');
  console.log('User:', dashboardData.user?.email);
  console.log('Balance:', dashboardData.user?.balance);
  console.log('Transactions:', dashboardData.transactions?.length);
  console.log('Cards:', dashboardData.cards?.length);
  
  console.log('\n✨ LOGIN FLOW WORKS CORRECTLY!');

} catch (error) {
  console.error('❌ Error:', error.message);
}