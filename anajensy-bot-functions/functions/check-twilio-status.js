// Check Twilio message status
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN';

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

async function checkMessages() {
  console.log('🔍 Checking recent Twilio messages...\n');
  
  try {
    const messages = await client.messages.list({ limit: 10 });
    
    console.log(`Found ${messages.length} recent messages:\n`);
    
    messages.forEach((message, index) => {
      console.log(`Message ${index + 1}:`);
      console.log(`  SID: ${message.sid}`);
      console.log(`  To: ${message.to}`);
      console.log(`  From: ${message.from}`);
      console.log(`  Status: ${message.status}`);
      console.log(`  Date: ${message.dateCreated}`);
      console.log(`  Body: ${message.body.substring(0, 50)}...`);
      
      if (message.errorCode) {
        console.log(`  ❌ ERROR CODE: ${message.errorCode}`);
        console.log(`  ❌ ERROR MESSAGE: ${message.errorMessage}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMessages();
