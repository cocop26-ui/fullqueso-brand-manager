const axios = require('axios');

const ACCESS_TOKEN = 'EAALluMeKdhEBP8mwEWh0km1Fq7JyMfigtgsyXqsC9DX4fJmRiUUCDlf39TEvo8ZBbszdATuL52XodpGzkGgn0CGFIZBw6mPaNxHfjqLFVH1LojlntqZAmZCJW2cB68roZBDfpuDq6RsjnBZAXaRcqsFu6aZA0Ym9t3z94BWjy8U4djttNOnon5dJ8TP4tomYoye1xMWaiLZArNPVeSQAtjD6U9joFph1zujHqV4asXpcvcH0OPZAQlgPIJKJhRr49c5gQvdmPoRbbGSwxBcZBRolxgfJSlYigZD';
const WABA_ID = '1570856513903116';
const PHONE_NUMBER_ID = '782559218285209';

async function checkWebhookConfig() {
  try {
    console.log('Checking webhook configuration...\n');

    // Get WABA subscribed apps
    console.log('1. Checking WABA subscribed apps:');
    const wabaUrl = `https://graph.facebook.com/v21.0/${WABA_ID}/subscribed_apps`;

    const wabaResponse = await axios.get(wabaUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    console.log('Subscribed Apps:', JSON.stringify(wabaResponse.data, null, 2));

    // Get phone number details
    console.log('\n2. Checking phone number webhook fields:');
    const phoneUrl = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}?fields=id,verified_name,display_phone_number,quality_rating`;

    const phoneResponse = await axios.get(phoneUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    console.log('Phone Number Info:', JSON.stringify(phoneResponse.data, null, 2));

    console.log('\n3. To subscribe to webhook fields, you need to:');
    console.log('   - Go to developers.facebook.com/apps');
    console.log('   - Select your app');
    console.log('   - Go to WhatsApp > Configuration');
    console.log('   - Find "Webhook fields" section');
    console.log('   - Subscribe to "messages" field');

  } catch (error) {
    console.error('\n❌ Error:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Status:', error.response.status);
    }
  }
}

checkWebhookConfig();
