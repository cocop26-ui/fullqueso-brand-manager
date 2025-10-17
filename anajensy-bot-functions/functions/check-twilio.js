// Check Twilio WhatsApp Sandbox Status
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN';

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

async function checkTwilioStatus() {
  console.log('🔍 Verificando estado de Twilio WhatsApp...\n');

  try {
    // Check recent messages
    console.log('📨 Últimos 5 mensajes enviados:\n');
    const messages = await client.messages.list({ limit: 5 });

    messages.forEach((msg, index) => {
      console.log(`Mensaje ${index + 1}:`);
      console.log(`  Para: ${msg.to}`);
      console.log(`  Estado: ${msg.status}`);
      console.log(`  SID: ${msg.sid}`);
      console.log(`  Fecha: ${msg.dateCreated}`);

      if (msg.errorCode) {
        console.log(`  ❌ ERROR: ${msg.errorCode} - ${msg.errorMessage}`);
      }

      console.log('');
    });

    // Get sandbox info
    console.log('\n📋 Información del Sandbox:\n');
    console.log('Para recibir mensajes, debes:');
    console.log('1. Abrir WhatsApp en tu teléfono');
    console.log('2. Enviar mensaje a: +1 415 523 8886');
    console.log('3. Texto del mensaje: "join <código>"');
    console.log('\n🔗 Obtén tu código en:');
    console.log('   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn\n');

  } catch (error) {
    console.error('❌ Error al verificar Twilio:', error.message);
    if (error.code === 20003) {
      console.error('\n⚠️  Credenciales de Twilio inválidas');
    }
  }
}

checkTwilioStatus();
