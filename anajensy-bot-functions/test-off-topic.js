const axios = require('axios');

async function testOffTopic() {
  const WEBHOOK_URL = 'https://whatsappwebhook-6vfsopoafa-uc.a.run.app';

  const payload = {
    From: 'whatsapp:+584241476748',
    To: 'whatsapp:+15558855791',
    Body: '¿Qué tal el clima hoy?',
    ProfileName: 'Pedro',
    MessageSid: 'TEST' + Date.now(),
    AccountSid: 'ACtest',
    ApiVersion: '2010-04-01'
  };

  console.log('📤 Testing off-topic question...');
  console.log('Message:', payload.Body);

  try {
    const response = await axios.post(WEBHOOK_URL, new URLSearchParams(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ Webhook responded:', response.status);
    console.log('\n⏳ Check logs to see Ana\'s professional boundary response');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOffTopic();
