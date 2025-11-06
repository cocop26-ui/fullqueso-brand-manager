const axios = require('axios');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MESSAGE_SID = process.argv[2] || 'MM0b1e1554d48327b50916991e32fa1bcc';

async function checkMessageStatus() {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${MESSAGE_SID}.json`;

  try {
    const response = await axios.get(url, {
      auth: {
        username: TWILIO_ACCOUNT_SID,
        password: TWILIO_AUTH_TOKEN
      }
    });

    console.log('\n📨 Message Status:');
    console.log('  SID:', response.data.sid);
    console.log('  Status:', response.data.status);
    console.log('  Error Code:', response.data.error_code || 'None');
    console.log('  Error Message:', response.data.error_message || 'None');
    console.log('  To:', response.data.to);
    console.log('  From:', response.data.from);
    console.log('  Date Created:', response.data.date_created);
    console.log('  Date Sent:', response.data.date_sent);

    if (response.data.status === 'failed') {
      console.log('\n❌ Message failed to deliver');
      console.log('Reason:', response.data.error_code);

      if (response.data.error_code === 63016) {
        console.log('\n⚠️  Template not approved yet or customer needs to opt-in');
        console.log('Check template status: https://console.twilio.com/us1/develop/sms/content-editor');
      }
    } else if (response.data.status === 'delivered') {
      console.log('\n✅ Message delivered successfully!');
      console.log('📱 Check your WhatsApp!');
    } else if (response.data.status === 'sent') {
      console.log('\n✅ Message sent, waiting for delivery confirmation');
    } else if (response.data.status === 'queued') {
      console.log('\n⏳ Message queued, waiting to be sent');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMessageStatus();
