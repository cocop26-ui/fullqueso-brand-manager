const axios = require('axios');

const ACCESS_TOKEN = 'EAALluMeKdhEBP8mwEWh0km1Fq7JyMfigtgsyXqsC9DX4fJmRiUUCDlf39TEvo8ZBbszdATuL52XodpGzkGgn0CGFIZBw6mPaNxHfjqLFVH1LojlntqZAmZCJW2cB68roZBDfpuDq6RsjnBZAXaRcqsFu6aZA0Ym9t3z94BWjy8U4djttNOnon5dJ8TP4tomYoye1xMWaiLZArNPVeSQAtjD6U9joFph1zujHqV4asXpcvcH0OPZAQlgPIJKJhRr49c5gQvdmPoRbbGSwxBcZBRolxgfJSlYigZD';
const PHONE_NUMBER_ID = '782559218285209';
const WABA_ID = '566320796553652'; // You may need to get this from Meta

async function listTemplates() {
  try {
    console.log('Fetching WhatsApp message templates...\n');

    // Try to get templates from WABA (WhatsApp Business Account)
    // First, let's get the WABA ID from the phone number
    const phoneInfoUrl = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}?fields=verified_name,display_phone_number,quality_rating`;

    console.log('Getting phone number info...');
    const phoneInfo = await axios.get(phoneInfoUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    console.log('Phone Info:', JSON.stringify(phoneInfo.data, null, 2));
    console.log('\n---\n');

    // Now try to get templates
    // Templates are usually retrieved from the WABA ID, not phone number ID
    const templatesUrl = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/message_templates`;

    console.log('Fetching templates...');
    const response = await axios.get(templatesUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    console.log('Available Templates:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.data) {
      console.log('\n\nTemplate Summary:');
      response.data.data.forEach(template => {
        console.log(`\n- Name: ${template.name}`);
        console.log(`  Status: ${template.status}`);
        console.log(`  Language: ${template.language}`);
      });
    }

  } catch (error) {
    console.error('Error fetching templates:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Status:', error.response.status);
    }
  }
}

listTemplates();
