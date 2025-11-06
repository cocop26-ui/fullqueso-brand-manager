const axios = require('axios');

/**
 * Simulates Pedro sending his email address
 * Tests: email capture, database update, conversation closure
 */
async function sendEmail() {
  const WEBHOOK_URL = 'https://whatsappwebhook-6vfsopoafa-uc.a.run.app';

  const payload = {
    From: 'whatsapp:+584241476748',
    To: 'whatsapp:+15558855791',
    Body: 'pedro_padillab@yahoo.es',
    ProfileName: 'Pedro',
    MessageSid: 'SM_EMAIL_' + Date.now(),
    AccountSid: 'ACtest',
    ApiVersion: '2010-04-01',
    WaId: '584241476748'
  };

  console.log('📧 Simulating Pedro sending his email...\n');
  console.log('From: Pedro (+58 424-1476748)');
  console.log('Email:', payload.Body);
  console.log('');

  try {
    const response = await axios.post(WEBHOOK_URL, new URLSearchParams(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ Email sent successfully');
    console.log('Status:', response.status);
    console.log('');
    console.log('📊 This will trigger:');
    console.log('   1. Email extraction (regex match)');
    console.log('   2. Update clientes_bot with email');
    console.log('   3. Update encuestas_postventa (encuesta_completada: true)');
    console.log('   4. Ana confirms email and closes conversation');
    console.log('');
    console.log('⏳ Check Ana\'s final response:');
    console.log('   firebase functions:log --only whatsappWebhook | grep "Generated response" -A 1 | tail -4');
    console.log('');
    console.log('📱 Expected Ana response: Confirm email + thank you + close (30-40 words)');
    console.log('');
    console.log('🔍 Verify in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/fullqueso-bot/firestore');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

sendEmail();
