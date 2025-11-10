const axios = require('axios');

const ACCESS_TOKEN = 'EAALluMeKdhEBP8mwEWh0km1Fq7JyMfigtgsyXqsC9DX4fJmRiUUCDlf39TEvo8ZBbszdATuL52XodpGzkGgn0CGFIZBw6mPaNxHfjqLFVH1LojlntqZAmZCJW2cB68roZBDfpuDq6RsjnBZAXaRcqsFu6aZA0Ym9t3z94BWjy8U4djttNOnon5dJ8TP4tomYoye1xMWaiLZArNPVeSQAtjD6U9joFph1zujHqV4asXpcvcH0OPZAQlgPIJKJhRr49c5gQvdmPoRbbGSwxBcZBRolxgfJSlYigZD';
const WABA_ID = '1570856513903116';

async function listTemplates() {
  try {
    console.log('Fetching WhatsApp message templates from WABA...\n');

    const templatesUrl = `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates`;

    console.log(`Fetching from: ${templatesUrl}\n`);

    const response = await axios.get(templatesUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    console.log('✅ Templates fetched successfully!\n');

    if (response.data.data && response.data.data.length > 0) {
      console.log(`Found ${response.data.data.length} template(s):\n`);

      response.data.data.forEach((template, index) => {
        console.log(`\n${index + 1}. Template:`);
        console.log(`   Name: ${template.name}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Language: ${template.language}`);
        console.log(`   Category: ${template.category}`);

        if (template.components) {
          template.components.forEach(comp => {
            if (comp.type === 'BODY') {
              console.log(`   Body: ${comp.text}`);
            }
          });
        }
        console.log('   ---');
      });

      // Look for anajensy template
      const anaTemplate = response.data.data.find(t => t.name.includes('anajensy'));
      if (anaTemplate) {
        console.log('\n\n🎯 FOUND ANAJENSY TEMPLATE:');
        console.log(JSON.stringify(anaTemplate, null, 2));
      }
    } else {
      console.log('No templates found.');
    }

  } catch (error) {
    console.error('\n❌ Error fetching templates:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Status:', error.response.status);
    }
  }
}

listTemplates();
