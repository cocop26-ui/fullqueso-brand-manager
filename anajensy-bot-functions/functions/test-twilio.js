// Test Twilio WhatsApp Integration
// Run this script to verify your Twilio setup before deploying

require('dotenv').config();
const twilio = require('twilio');

// Get credentials from environment variables
// For local testing, create a .env file with:
// TWILIO_ACCOUNT_SID=your_account_sid
// TWILIO_AUTH_TOKEN=your_auth_token
// TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
// TEST_RECIPIENT=whatsapp:+584141234567

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const TEST_RECIPIENT = process.env.TEST_RECIPIENT; // Your WhatsApp number for testing

// Validate configuration
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
  console.error('❌ Missing Twilio credentials!');
  console.error('Please set the following environment variables:');
  console.error('  - TWILIO_ACCOUNT_SID');
  console.error('  - TWILIO_AUTH_TOKEN');
  console.error('  - TWILIO_WHATSAPP_NUMBER');
  process.exit(1);
}

if (!TEST_RECIPIENT) {
  console.error('❌ Missing TEST_RECIPIENT!');
  console.error('Set TEST_RECIPIENT to your WhatsApp number (e.g., whatsapp:+584141234567)');
  process.exit(1);
}

// Initialize Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function testTwilioWhatsApp() {
  console.log('\n🧪 Testing Twilio WhatsApp Integration...\n');

  console.log('Configuration:');
  console.log(`  Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 8)}...`);
  console.log(`  From: ${TWILIO_WHATSAPP_NUMBER}`);
  console.log(`  To: ${TEST_RECIPIENT}`);
  console.log('');

  try {
    const testMessage = `¡Hola! 👋

Este es un mensaje de prueba de Anajensy, la operadora de Full Queso.

Si recibiste este mensaje, significa que la integración con Twilio está funcionando correctamente.

¡Saludos!
- Ana`;

    console.log('📤 Sending test message...');

    const message = await client.messages.create({
      body: testMessage,
      from: TWILIO_WHATSAPP_NUMBER,
      to: TEST_RECIPIENT,
    });

    console.log('\n✅ Message sent successfully!\n');
    console.log('Message Details:');
    console.log(`  - SID: ${message.sid}`);
    console.log(`  - Status: ${message.status}`);
    console.log(`  - From: ${message.from}`);
    console.log(`  - To: ${message.to}`);
    console.log(`  - Price: ${message.price || 'N/A'} ${message.priceUnit || ''}`);
    console.log('');
    console.log('✅ Check your WhatsApp to verify you received the message!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error sending message:\n');
    console.error(`  Error: ${error.message}`);
    console.error(`  Code: ${error.code}`);
    console.error(`  Status: ${error.status}`);
    console.error(`  More Info: ${error.moreInfo}`);
    console.error('');

    // Common errors and solutions
    if (error.code === 20003) {
      console.error('💡 Solution: Check your Auth Token is correct');
    } else if (error.code === 21608) {
      console.error('💡 Solution: The recipient hasn\'t joined your sandbox yet.');
      console.error('   Send "join your-sandbox-code" to your Twilio sandbox number.');
    } else if (error.code === 21211) {
      console.error('💡 Solution: Invalid "To" phone number format.');
      console.error('   Make sure it includes whatsapp: prefix (e.g., whatsapp:+584141234567)');
    } else if (error.code === 21606) {
      console.error('💡 Solution: Invalid "From" number.');
      console.error('   Make sure TWILIO_WHATSAPP_NUMBER includes whatsapp: prefix');
    }

    process.exit(1);
  }
}

// Run the test
testTwilioWhatsApp();
