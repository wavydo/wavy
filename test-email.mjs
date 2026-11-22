import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Testing email with Resend...');
  console.log('API Key exists:', !!process.env.RESEND_API_KEY);
  
  const payload = {
    from: 'Wavy Team <recover@wavy.do>',
    to: ['miguelnicolas484@gmail.com'],
    subject: 'Test Email',
    html: '<p>This is a test</p>',
  };
  
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const { data, error } = await resend.emails.send(payload);
    
    if (error) {
      console.error('❌ Error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Success:', data);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
    console.error('Full error:', e);
  }
}

testEmail();
