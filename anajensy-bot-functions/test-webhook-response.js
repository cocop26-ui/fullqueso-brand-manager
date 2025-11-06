const axios = require('axios');

// Simulates a customer response to test Ana's word limit
async function testWebhookResponse() {
  const WEBHOOK_URL = 'https://whatsappwebhook-6vfsopoafa-uc.a.run.app';

  // Simulate Twilio webhook payload
  const payload = {
    From: 'whatsapp:+584241476748',
    To: 'whatsapp:+15558855791',
    Body: 'Los tequeños estaban perfectos! Calientes y crujientes. El delivery llegó rápido.',
    ProfileName: 'Pedro',
    MessageSid: 'TEST' + Date.now(),
    AccountSid: 'ACtest',
    ApiVersion: '2010-04-01'
  };

  console.log('📤 Sending test message to webhook...');
  console.log('Message:', payload.Body);

  try {
    const response = await axios.post(WEBHOOK_URL, new URLSearchParams(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ Webhook responded:', response.status);
    console.log('\n⏳ Check Firebase logs in a few seconds to see Ana\'s response:');
    console.log('   firebase functions:log --only whatsappWebhook | grep "Generated response" -A 2');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testWebhookResponse();
