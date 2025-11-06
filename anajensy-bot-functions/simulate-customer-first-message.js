const axios = require('axios');

/**
 * Simulates Pedro sending the FIRST message to Ana
 * This opens the 24-hour session window for Twilio WhatsApp
 * After this, Ana can send freeform messages
 */
async function simulateCustomerFirstMessage() {
  const WEBHOOK_URL = 'https://whatsappwebhook-6vfsopoafa-uc.a.run.app';

  // Simulate Pedro saying "Hola" to start the conversation
  const payload = {
    From: 'whatsapp:+584241476748',
    To: 'whatsapp:+15558855791',
    Body: 'Hola',
    ProfileName: 'Pedro',
    MessageSid: 'SM_FIRST_' + Date.now(),
    AccountSid: 'ACtest',
    ApiVersion: '2010-04-01',
    WaId: '584241476748'
  };

  console.log('📱 Simulating Pedro sending first message...');
  console.log('From: Pedro (+58 424-1476748)');
  console.log('Message: "Hola"\n');

  try {
    const response = await axios.post(WEBHOOK_URL, new URLSearchParams(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ Webhook processed successfully');
    console.log('Status:', response.status);
    console.log('\n📬 Ana should respond via WhatsApp now');
    console.log('⏳ Check Firebase logs to see Ana\'s response:\n');
    console.log('   firebase functions:log --only whatsappWebhook | grep "Generated response" -A 1 | tail -4');

    console.log('\n💡 Now the 24-hour session is open!');
    console.log('   Ana can send freeform messages for the next 24 hours');
    console.log('   Test by creating an order: cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

simulateCustomerFirstMessage();
