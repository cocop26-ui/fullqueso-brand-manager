const axios = require('axios');

/**
 * Creates WhatsApp Message Template for Twilio
 * This template will be submitted for WhatsApp approval
 * Once approved, Ana can initiate conversations with customers
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

async function createWhatsAppTemplate() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Error: Set Twilio credentials first');
    console.log('export TWILIO_ACCOUNT_SID=$(firebase functions:secrets:access TWILIO_ACCOUNT_SID)');
    console.log('export TWILIO_AUTH_TOKEN=$(firebase functions:secrets:access TWILIO_AUTH_TOKEN)');
    return;
  }

  console.log('📝 Creating WhatsApp Template for Ana - Full Queso\n');

  // Template configuration
  const templateData = {
    friendly_name: 'fullqueso_seguimiento_pedido',
    language: 'es',
    variables: {
      '1': 'customer_name'
    },
    types: {
      'twilio/text': {
        body: 'Hola {{1}}, soy Ana de Full Queso. ¿Cómo estás? Te escribo para saber cómo te fue con tu pedido. ¿Llegó todo bien? Responde para ayudarte. Un abrazo.'
      }
    }
  };

  const url = `https://content.twilio.com/v1/Content`;

  console.log('📄 Template Details:');
  console.log('-------------------');
  console.log('Name: fullqueso_seguimiento_pedido');
  console.log('Language: Spanish (es)');
  console.log('Variables: {{1}} = customer_name');
  console.log('\nTemplate Message:');
  console.log(templateData.types['twilio/text'].body);
  console.log('\nExample with variables:');
  console.log('Hola Pedro, soy Ana de Full Queso. ¿Cómo estás? Te escribo para saber cómo te fue con tu pedido. ¿Llegó todo bien? Responde para ayudarte. Un abrazo.');
  console.log('\n📊 Word count: 31 words ✅');
  console.log('');

  try {
    const response = await axios.post(
      url,
      templateData,
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Template created successfully in Twilio!');
    console.log('\nTemplate Details:');
    console.log('  SID:', response.data.sid);
    console.log('  Friendly Name:', response.data.friendly_name);
    console.log('  Language:', response.data.language);
    console.log('  Status:', response.data.approval_requests?.status || 'Pending submission');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. This template needs WhatsApp approval (takes 1-2 business days)');
    console.log('2. Check status in Twilio Console:');
    console.log('   https://console.twilio.com/us1/develop/sms/content-editor');
    console.log('3. Once approved, update functions/index.js to use this template');
    console.log('');
    console.log('💡 Template will allow Ana to:');
    console.log('   - Initiate conversations with customers');
    console.log('   - Send first message after order is verified');
    console.log('   - Open 24-hour session for follow-up AI messages');
    console.log('');
    console.log('📝 Save this Content SID for later: ' + response.data.sid);

  } catch (error) {
    console.error('\n❌ Error creating template:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.message || error.message);

    if (error.response?.data) {
      console.error('\nFull error details:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }

    if (error.response?.status === 401) {
      console.error('\n⚠️  Authentication failed. Check Twilio credentials.');
    }
  }
}

createWhatsAppTemplate();
