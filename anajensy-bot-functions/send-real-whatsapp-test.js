const axios = require('axios');

/**
 * IMPORTANT: This script sends a REAL WhatsApp message to open the 24-hour session
 * Then you can create an order and Ana will send you a real message
 */

// Get credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+15558855791'; // Ana's number

async function sendRealWhatsAppMessage() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Error: Twilio credentials not found in environment');
    console.log('\nPlease set environment variables:');
    console.log('  export TWILIO_ACCOUNT_SID=$(firebase functions:secrets:access TWILIO_ACCOUNT_SID)');
    console.log('  export TWILIO_AUTH_TOKEN=$(firebase functions:secrets:access TWILIO_AUTH_TOKEN)');
    return;
  }

  const customerNumber = 'whatsapp:+584241476748'; // Your WhatsApp number

  console.log('📱 Sending REAL WhatsApp message to open session...\n');
  console.log('From: Ana (Full Queso)');
  console.log('To: +58 424-1476748 (Pedro)\n');

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const message = 'Hola Pedro! Soy Ana de Full Queso. Este es un mensaje de prueba para abrir nuestra conversación. Responde "ok" para confirmar que recibiste este mensaje. Un abrazo!';

  try {
    const response = await axios.post(
      url,
      new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: customerNumber,
        Body: message
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

    console.log('✅ Real WhatsApp message sent successfully!');
    console.log('\nMessage Details:');
    console.log('  SID:', response.data.sid);
    console.log('  Status:', response.data.status);
    console.log('  To:', response.data.to);
    console.log('  From:', response.data.from);
    console.log('\n📱 Check your WhatsApp now!');
    console.log('   You should receive a message from Ana');
    console.log('\n💬 Reply "ok" to the message to open 24-hour session');
    console.log('\n📦 Then create an order:');
    console.log('   cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-churros.js');
    console.log('\n⏰ Within 1 minute, Ana will send you a real post-sales survey!');

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);

    if (error.response?.status === 401) {
      console.error('\n⚠️  Authentication failed. Check your Twilio credentials.');
    } else if (error.response?.data?.code === 63016) {
      console.error('\n⚠️  Message blocked: Customer needs to message you first OR use approved template');
      console.log('\nOptions:');
      console.log('1. Have customer (+584241476748) send "Hola" to +15558855791 first');
      console.log('2. Use the simulate script: node simulate-customer-first-message.js');
    }
  }
}

sendRealWhatsAppMessage();
