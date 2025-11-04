const axios = require('axios');

// Twilio credentials - use environment variables or Firebase secrets
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';

async function createWhatsAppTemplate() {
  try {
    console.log('📝 Creating WhatsApp Message Template...\n');

    // Template configuration for Anajensy's order follow-up
    const templateData = {
      friendly_name: 'Anajensy Order Followup',
      language: 'es', // Spanish
      variables: {
        '1': 'customer_name',
        '2': 'order_items'
      },
      types: {
        'twilio/text': {
          body: 'Hola {{1}}, feliz tarde\n\nTe escribo para confirmar que tu pedido de {{2}} está verificado. ¿Todo está bien, mi amor?\n\nEstamos para servirte'
        }
      }
    };

    const url = `https://content.twilio.com/v1/Content`;

    console.log('Template Body:');
    console.log(templateData.types['twilio/text'].body);
    console.log('\n');

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

    console.log('✅ Template created successfully!');
    console.log('Template SID:', response.data.sid);
    console.log('Friendly Name:', response.data.friendly_name);
    console.log('Language:', response.data.language);
    console.log('\nFull response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ Error creating template:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('\nFull error:', JSON.stringify(error.response?.data, null, 2));

    if (error.response?.status === 401) {
      console.error('\n⚠️  Authentication failed. Please verify your Twilio credentials.');
    }
  }
}

createWhatsAppTemplate();
