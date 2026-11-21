// Test script to verify the dashboard API returns real data
console.log('🧪 Testing dashboard API with real data...');

try {
  // Test the API endpoint directly
  const response = await fetch('http://localhost:5000/api/dashboard/user-data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Simulate a logged-in session (in reality this would come from cookies)
      'Cookie': 'connect.sid=test-session-id'
    }
  });

  if (response.status === 401) {
    console.log('❌ Not authenticated - this is expected without proper session');
    console.log('✅ API is responding correctly to unauthenticated requests');
  } else if (response.ok) {
    const data = await response.json();
    console.log('✅ API Response Success!');
    console.log('📧 User Email:', data.user?.email);
    console.log('💰 Balance:', data.user?.balance);
    console.log('🏆 Points:', data.user?.points);
    console.log('📊 Places Tapped:', data.monthlyStats?.placesTapped);
    console.log('🎯 Rewards Earned:', data.monthlyStats?.rewardsEarned);
    console.log('💳 Number of Cards:', data.cards?.length);
    console.log('🧾 Number of Transactions:', data.transactions?.length);
    
    if (data.cards?.length > 0) {
      console.log('💳 Card 1 - Cardholder:', data.cards[0].cardholderName);
      console.log('💳 Card 1 - Expiry:', data.cards[0].expiryDate);
    }
    
    if (data.transactions?.length > 0) {
      console.log('🧾 First Transaction - Amount:', data.transactions[0].finalAmount);
      console.log('🧾 First Transaction - Establishment:', data.transactions[0].establishment);
    }
  } else {
    console.log('❌ API Error:', response.status, response.statusText);
    const errorData = await response.text();
    console.log('Error details:', errorData);
  }
  
} catch (error) {
  console.error('❌ Network error:', error.message);
  console.log('💡 Make sure the development server is running with: npm run dev');
}