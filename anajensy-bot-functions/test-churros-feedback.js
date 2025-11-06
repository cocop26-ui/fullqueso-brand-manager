const axios = require('axios');

/**
 * Simulates Pedro responding to Ana's churros inquiry
 * Tests: sentiment analysis, survey data collection, conversation flow
 */
async function testChurrosFeedback() {
  const WEBHOOK_URL = 'https://whatsappwebhook-6vfsopoafa-uc.a.run.app';

  // Positive feedback with some detail
  const payload = {
    From: 'whatsapp:+584241476748',
    To: 'whatsapp:+15558855791',
    Body: 'Los churros estaban brutales! El choco arequipe delicioso y llegaron calienticos. El delivery llegó en 20 minutos, todo perfecto.',
    ProfileName: 'Pedro',
    MessageSid: 'SM_CHURROS_' + Date.now(),
    AccountSid: 'ACtest',
    ApiVersion: '2010-04-01',
    WaId: '584241476748'
  };

  console.log('📱 Simulating Pedro\'s feedback about churros...\n');
  console.log('From: Pedro (+58 424-1476748)');
  console.log('Message:', payload.Body);
  console.log('');

  try {
    const response = await axios.post(WEBHOOK_URL, new URLSearchParams(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ Feedback sent successfully');
    console.log('Status:', response.status);
    console.log('');
    console.log('📊 This will trigger:');
    console.log('   1. Sentiment analysis (Claude AI)');
    console.log('   2. Save to conversaciones_bot collection');
    console.log('   3. Save to encuestas_postventa collection');
    console.log('   4. Ana responds with 30-40 word message');
    console.log('');
    console.log('⏳ Check Ana\'s response in logs:');
    console.log('   firebase functions:log --only whatsappWebhook | grep "Generated response" -A 1 | tail -4');
    console.log('');
    console.log('🔍 View sentiment analysis:');
    console.log('   firebase functions:log --only whatsappWebhook | grep "Sentiment analysis" -A 5 | tail -7');
    console.log('');
    console.log('📱 Expected Ana response: Thank you + ask for email + close conversation');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testChurrosFeedback();
