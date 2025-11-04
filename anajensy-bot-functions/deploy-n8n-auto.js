const axios = require('axios');
const fs = require('fs');

// N8N Configuration
const N8N_URL = 'https://fullqueso.app.n8n.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZjczMTg1ZC0wMmRiLTQ1OWUtOWMwMi0xY2I0MDQwYzZmNmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxOTIwOTI0LCJleHAiOjE3Njk2NTkyMDB9.y6LvTgVSlsbFXCJH0577yJxbSY0sxI8pIxKN3AGzJWE';

// Get credentials from environment or Firebase secrets
// Run: firebase functions:secrets:access TWILIO_ACCOUNT_SID
// Run: firebase functions:secrets:access TWILIO_AUTH_TOKEN
// Run: firebase functions:secrets:access ANTHROPIC_API_KEY
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const n8nClient = axios.create({
  baseURL: N8N_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

async function deployToN8N() {
  console.log('============================================');
  console.log('N8N Anajensy Bot - Automated Deployment');
  console.log('============================================\n');

  try {
    // Step 1: Create Anthropic Credential
    console.log('Step 1: Creating Anthropic credential...');
    let anthropicCredId;
    try {
      const anthropicCred = await n8nClient.post('/api/v1/credentials', {
        name: 'Anthropic - Claude API (Auto)',
        type: 'httpHeaderAuth',
        data: {
          name: 'x-api-key',
          value: ANTHROPIC_API_KEY
        }
      });
      anthropicCredId = anthropicCred.data.id;
      console.log(`✓ Anthropic credential created: ${anthropicCredId}\n`);
    } catch (error) {
      console.log('⚠️  Could not create Anthropic credential via API');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Step 2: Create Twilio Credential
    console.log('Step 2: Creating Twilio credential...');
    let twilioCredId;
    try {
      const twilioCred = await n8nClient.post('/api/v1/credentials', {
        name: 'Twilio Account (Auto)',
        type: 'twilioApi',
        data: {
          accountSid: TWILIO_ACCOUNT_SID,
          authToken: TWILIO_AUTH_TOKEN
        }
      });
      twilioCredId = twilioCred.data.id;
      console.log(`✓ Twilio credential created: ${twilioCredId}\n`);
    } catch (error) {
      console.log('⚠️  Could not create Twilio credential via API');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Step 3: Load and update workflow
    console.log('Step 3: Preparing workflow...');
    const workflowFile = './anajensy-bot-n8n-twilio-workflow.json';
    let workflow = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));

    // Update credential IDs in workflow if we created them
    if (anthropicCredId) {
      workflow = JSON.stringify(workflow).replace(/REPLACE_WITH_ANTHROPIC_CREDENTIAL_ID/g, anthropicCredId);
      workflow = JSON.parse(workflow);
    }
    if (twilioCredId) {
      workflow = JSON.stringify(workflow).replace(/REPLACE_WITH_TWILIO_CREDENTIAL_ID/g, twilioCredId);
      workflow = JSON.parse(workflow);
    }

    console.log('✓ Workflow prepared\n');

    // Step 4: Import workflow
    console.log('Step 4: Importing workflow to n8n...');
    try {
      const workflowResponse = await n8nClient.post('/api/v1/workflows', workflow);
      const workflowId = workflowResponse.data.id;
      console.log(`✓ Workflow imported: ${workflowId}\n`);

      // Step 5: Activate workflow
      console.log('Step 5: Activating workflow...');
      await n8nClient.patch(`/api/v1/workflows/${workflowId}`, {
        active: true
      });
      console.log('✓ Workflow activated!\n');

      // Success summary
      console.log('============================================');
      console.log('✨ Deployment Summary');
      console.log('============================================\n');
      console.log(`✅ Workflow ID: ${workflowId}`);
      console.log(`✅ Workflow URL: ${N8N_URL}/workflow/${workflowId}`);
      console.log(`✅ Status: Active`);
      console.log(`\n📍 Webhook URL:`);
      console.log(`   ${N8N_URL}/webhook/anajensy-whatsapp-webhook`);
      console.log(`\n🔧 Next Steps:`);
      console.log(`1. Configure Twilio webhook:`);
      console.log(`   - URL: ${N8N_URL}/webhook/anajensy-whatsapp-webhook`);
      console.log(`   - Method: POST`);
      console.log(`\n2. Manual credentials setup (if needed):`);
      if (!anthropicCredId || !twilioCredId) {
        console.log(`   - Open: ${N8N_URL}/credentials`);
        if (!anthropicCredId) console.log(`   - Create Anthropic Header Auth credential`);
        if (!twilioCredId) console.log(`   - Create Twilio API credential`);
        console.log(`   - Create Firebase OAuth2 credential`);
        console.log(`   - Update workflow nodes with credentials`);
      } else {
        console.log(`   - Create Firebase OAuth2 credential in n8n UI`);
        console.log(`   - Update all Firebase nodes in workflow`);
      }
      console.log(`\n3. Test the workflow:`);
      console.log(`   cd functions && node create-order-fullqueso.js`);
      console.log('\n============================================\n');

    } catch (error) {
      console.error('❌ Failed to import workflow');
      console.error(`Error: ${error.response?.data?.message || error.message}`);
      if (error.response?.data) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Deployment failed:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run deployment
deployToN8N().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
