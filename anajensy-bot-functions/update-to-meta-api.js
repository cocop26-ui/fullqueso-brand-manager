const admin = require('firebase-admin');
const axios = require('axios');

// Este script actualiza functions/index.js para usar Meta WhatsApp API
// en lugar de Twilio

console.log('📝 Actualizando a Meta WhatsApp API...\n');

console.log('Para usar Meta API necesitas:');
console.log('1. WhatsApp Access Token (de Meta Developers)');
console.log('2. Phone Number ID: 805718575964429 ✅ (ya lo tienes)');
console.log('3. Template Name: anajensy_order_followup_hx81b16f5a9d7af1ee465044e0535ffcb3 ✅\n');

console.log('Pasos siguientes:');
console.log('1. Ve a: https://developers.facebook.com/apps/');
console.log('2. Selecciona tu app → WhatsApp → API Setup');
console.log('3. Genera un nuevo Access Token');
console.log('4. Copia el token y ejecuta:');
console.log('   echo "TU_TOKEN" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN\n');

console.log('Una vez configurado el token, el código usará Meta API automáticamente.');
