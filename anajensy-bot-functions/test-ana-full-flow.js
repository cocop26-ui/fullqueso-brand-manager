#!/usr/bin/env node

/**
 * Complete Ana Customer Service Test
 * This script:
 * 1. Creates a test order in Firestore
 * 2. Triggers Ana to send initial message with approved template
 * 3. Monitors the conversation flow
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'fullqueso-bot-firebase-adminsdk.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('❌ Error: Firebase service account key not found!');
  console.error(`   Expected at: ${serviceAccountPath}`);
  console.error('');
  console.error('Please download your service account key:');
  console.error('1. Go to: https://console.firebase.google.com/project/fullqueso-bot/settings/serviceaccounts/adminsdk');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save as: fullqueso-bot-firebase-adminsdk.json');
  console.error('4. Move it to: anajensy-bot-functions/');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fullqueso-bot.firebaseio.com'
});

const db = admin.firestore();

async function createTestOrder() {
  console.log('🧪 Creating test order for Ana customer service flow...\n');

  const testOrder = {
    ticket: `FQ-TEST-${Date.now()}`,
    cliente_nombre: 'Pedro Test',
    cliente_telefono: '584241476748', // Your WhatsApp number
    estado: 'ENTREGADO',
    seguimiento_enviado: false,
    fecha_entregado: admin.firestore.Timestamp.now(),
    fecha_verificado: admin.firestore.Timestamp.now(),
    productos: [
      {
        nombre: 'Tequeños x12',
        cantidad: 1,
        precio: 15
      },
      {
        nombre: 'Choco Arequipe',
        cantidad: 1,
        precio: 8
      }
    ],
    tipo: 'delivery',
    total: 23,
    pedido_id: `test_${Date.now()}`
  };

  console.log('📦 Test Order Details:');
  console.log(`   Ticket: ${testOrder.ticket}`);
  console.log(`   Customer: ${testOrder.cliente_nombre}`);
  console.log(`   Phone: +${testOrder.cliente_telefono}`);
  console.log(`   Products: ${testOrder.productos.map(p => p.nombre).join(', ')}`);
  console.log(`   Status: ${testOrder.estado}`);
  console.log('');

  try {
    const docRef = await db.collection('pedidos_bot').add(testOrder);
    console.log('✅ Test order created successfully!');
    console.log(`   Document ID: ${docRef.id}`);
    console.log('');

    return { docRef, testOrder };
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    throw error;
  }
}

async function monitorOrderStatus(docId, maxWaitMinutes = 3) {
  console.log('👀 Monitoring order status...');
  console.log(`   Waiting up to ${maxWaitMinutes} minutes for Ana to process the order`);
  console.log('');

  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  let lastStatus = null;

  while (Date.now() - startTime < maxWaitMs) {
    const doc = await db.collection('pedidos_bot').doc(docId).get();
    const data = doc.data();

    if (data.seguimiento_enviado && data.seguimiento_enviado !== lastStatus) {
      console.log('✅ Ana sent the initial message!');
      console.log(`   Sent at: ${data.seguimiento_fecha.toDate().toLocaleString()}`);
      console.log('');
      return true;
    }

    if (lastStatus === null) {
      console.log('⏳ Waiting for procesarSeguimientos function to run (runs every 1 minute)...');
      lastStatus = data.seguimiento_enviado;
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
  }

  console.log('⏱️  Timeout: Order not processed within', maxWaitMinutes, 'minutes');
  return false;
}

async function checkConversations(phone) {
  console.log('💬 Checking conversation logs...\n');

  const conversationsSnapshot = await db.collection('conversaciones_bot')
    .where('cliente_telefono', '==', phone)
    .orderBy('fecha', 'desc')
    .limit(5)
    .get();

  if (conversationsSnapshot.empty) {
    console.log('   No conversations found yet.');
    return [];
  }

  const conversations = [];
  conversationsSnapshot.forEach(doc => {
    const data = doc.data();
    conversations.push(data);

    console.log(`📨 Message ${conversations.length}:`);
    console.log(`   Time: ${data.fecha.toDate().toLocaleString()}`);
    console.log(`   Type: ${data.tipo_interaccion}`);

    if (data.mensaje_ana) {
      console.log(`   Ana: "${data.mensaje_ana}"`);
    }

    if (data.mensaje_cliente) {
      console.log(`   Customer: "${data.mensaje_cliente}"`);
    }
    console.log('');
  });

  return conversations;
}

async function checkSurveys(phone) {
  console.log('📊 Checking survey data...\n');

  const surveysSnapshot = await db.collection('encuestas_postventa')
    .where('cliente_telefono', '==', phone)
    .orderBy('fecha_encuesta', 'desc')
    .limit(1)
    .get();

  if (surveysSnapshot.empty) {
    console.log('   No survey data found yet.');
    return null;
  }

  const surveyDoc = surveysSnapshot.docs[0];
  const survey = surveyDoc.data();

  console.log('📋 Survey Status:');
  console.log(`   Completed: ${survey.encuesta_completada ? 'Yes' : 'No'}`);
  console.log(`   Email captured: ${survey.cliente_email || 'Not yet'}`);
  console.log(`   Product sentiment: ${survey.sentimiento_producto || 'N/A'}`);
  console.log(`   Delivery sentiment: ${survey.sentimiento_delivery || 'N/A'}`);
  console.log(`   Customer type: ${survey.es_cliente_frecuente || 'Unknown'}`);
  console.log('');

  return survey;
}

async function displayNextSteps() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📱 NEXT STEPS - Test the Full Conversation Flow:');
  console.log('');
  console.log('1. Check WhatsApp on +584241476748');
  console.log('   You should receive Ana\'s initial message with the template');
  console.log('');
  console.log('2. Reply to Ana\'s message (simulate customer response)');
  console.log('   Example: "Hola Ana! Todo estuvo excelente"');
  console.log('');
  console.log('3. Ana will ask about the product');
  console.log('   Reply with feedback about the tequeños');
  console.log('');
  console.log('4. Ana will ask about delivery');
  console.log('   Reply with feedback about the delivery service');
  console.log('');
  console.log('5. Ana will ask for your email');
  console.log('   Reply with: "pedro@example.com"');
  console.log('');
  console.log('6. Ana will thank you and close the conversation');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🔍 To monitor in real-time:');
  console.log('');
  console.log('   # Watch Firebase logs');
  console.log('   firebase functions:log --follow');
  console.log('');
  console.log('   # Check specific functions');
  console.log('   firebase functions:log --only procesarSeguimientos');
  console.log('   firebase functions:log --only whatsappWebhook');
  console.log('');
  console.log('   # Run this script again to check status');
  console.log('   node test-ana-full-flow.js');
  console.log('');
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🤖 ANA CUSTOMER SERVICE - FULL FLOW TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    // Step 1: Create test order
    const { docRef, testOrder } = await createTestOrder();

    // Step 2: Monitor for processing
    const processed = await monitorOrderStatus(docRef.id, 3);

    if (processed) {
      // Step 3: Check conversations
      await checkConversations(testOrder.cliente_telefono);

      // Step 4: Check surveys
      await checkSurveys(testOrder.cliente_telefono);
    }

    // Display next steps
    await displayNextSteps();

    console.log('✅ Test setup complete!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error running test:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createTestOrder, monitorOrderStatus, checkConversations, checkSurveys };
