const axios = require('axios');

// Twilio credentials - use environment variables or Firebase secrets
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+15558855791';

// Test recipient (your phone)
const TEST_PHONE = process.env.TEST_PHONE || 'whatsapp:+58XXXXXXXXXX';

async function testWhatsAppMessage() {
  try {
    console.log('🧪 Testing Twilio WhatsApp message...');
    console.log(`From: ${TWILIO_WHATSAPP_NUMBER}`);
    console.log(`To: ${TEST_PHONE}`);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: TEST_PHONE,
        Body: 'Test message from Anajensy Bot! 🎉'
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('\n✅ SUCCESS!');
    console.log('Message SID:', response.data.sid);
    console.log('Status:', response.data.status);
    console.log('Error Code:', response.data.error_code);
    console.log('Error Message:', response.data.error_message);
    console.log('\nFull response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ ERROR!');
    console.error('Status:', error.response?.status);
    console.error('Error Code:', error.response?.data?.code);
    console.error('Message:', error.response?.data?.message);
    console.error('More Info:', error.response?.data?.more_info);
    console.error('\nFull error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testWhatsAppMessage();
