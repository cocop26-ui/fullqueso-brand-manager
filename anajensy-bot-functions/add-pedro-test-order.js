#!/usr/bin/env node

/**
 * Add Test Order for Pedro Padilla
 * Product: 15 Churros Choco Arequipe
 * Phone: +584241476748
 */

const admin = require('firebase-admin');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🤖 ANA TEST - Adding Order for Pedro Padilla');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Check if Firebase service account exists
const serviceAccountPath = path.join(__dirname, 'fullqueso-bot-firebase-adminsdk.json');
let serviceAccount;

try {
  serviceAccount = require(serviceAccountPath);

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fullqueso-bot.firebaseio.com'
  });

  const db = admin.firestore();

  async function addTestOrder() {
    const timestamp = Date.now();
    const ticket = `FQ-TEST-${timestamp}`;

    const testOrder = {
      ticket: ticket,
      cliente_nombre: 'Pedro Padilla',  // Full name in DB
      cliente_telefono: '584241476748',
      estado: 'ENTREGADO',
      seguimiento_enviado: false,
      fecha_entregado: admin.firestore.Timestamp.now(),
      fecha_verificado: admin.firestore.Timestamp.now(),
      productos: [
        {
          nombre: 'Churros Choco Arequipe x15',
          cantidad: 1,
          precio: 25
        }
      ],
      tipo: 'delivery',
      total: 25,
      pedido_id: `pedro_test_${timestamp}`
    };

    console.log('📦 Creating test order:');
    console.log(`   Ticket: ${testOrder.ticket}`);
    console.log(`   Customer: Pedro Padilla (Ana will call him "Pedro")`);
    console.log(`   Phone: +584241476748`);
    console.log(`   Product: 15 Churros Choco Arequipe`);
    console.log('');

    try {
      const docRef = await db.collection('pedidos_bot').add(testOrder);
      console.log('✅ Test order added successfully!');
      console.log(`   Document ID: ${docRef.id}`);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('⏳ Ana will process this order within 1-2 minutes');
      console.log('');
      console.log('📱 Expected Flow:');
      console.log('');
      console.log('1. Ana sends initial message to +584241476748');
      console.log('   "Hola Pedro! ¿Cómo te fueron los Churros Choco Arequipe x15?"');
      console.log('');
      console.log('2. You reply with feedback');
      console.log('   Example: "Hola Ana! Estuvieron deliciosos"');
      console.log('');
      console.log('3. Ana asks about the product specifically');
      console.log('   Example: "¡Qué fino! ¿Los churros estaban calientitos?"');
      console.log('');
      console.log('4. You reply about product quality');
      console.log('   Example: "Sí, llegaron calientes y el arequipe perfecto"');
      console.log('');
      console.log('5. Ana asks about delivery');
      console.log('   Example: "Perfecto! ¿Y el delivery cómo te fue?"');
      console.log('');
      console.log('6. You reply about delivery');
      console.log('   Example: "Rápido, todo bien empacado"');
      console.log('');
      console.log('7. Ana asks for email');
      console.log('   Example: "Chévere! ¿Me das tu email para promociones?"');
      console.log('');
      console.log('8. You provide email');
      console.log('   Example: "pedro@fullqueso.com"');
      console.log('');
      console.log('9. Ana thanks and closes');
      console.log('   Example: "Perfecto, anotado. Recuerda fullqueso.com. ¡Un abrazo!"');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('🔍 Monitor Ana\'s progress:');
      console.log('');
      console.log('   firebase functions:log --only procesarSeguimientos');
      console.log('');

      process.exit(0);
    } catch (error) {
      console.error('❌ Error adding test order:', error);
      process.exit(1);
    }
  }

  addTestOrder();

} catch (error) {
  // No service account - generate JSON for manual entry
  console.log('⚠️  Firebase service account not found');
  console.log('');
  console.log('📋 Manual Entry Instructions:');
  console.log('');
  console.log('Add this order to Firestore manually:');
  console.log('');
  console.log('1. Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore/data/~2Fpedidos_bot');
  console.log('2. Click "Add document"');
  console.log('3. Use auto-generated ID');
  console.log('4. Add these fields:');
  console.log('');

  const timestamp = Date.now();
  const ticket = `FQ-TEST-${timestamp}`;

  const testOrder = {
    ticket: ticket,
    cliente_nombre: 'Pedro Padilla',
    cliente_telefono: '584241476748',
    estado: 'ENTREGADO',
    seguimiento_enviado: false,
    fecha_entregado: new Date().toISOString(),
    fecha_verificado: new Date().toISOString(),
    productos: [
      {
        nombre: 'Churros Choco Arequipe x15',
        cantidad: 1,
        precio: 25
      }
    ],
    tipo: 'delivery',
    total: 25,
    pedido_id: `pedro_test_${timestamp}`
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(JSON.stringify(testOrder, null, 2));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Or copy this to clipboard and paste in Firestore console:');
  console.log('');

  // Write to file
  const fs = require('fs');
  const outputFile = `/tmp/pedro-test-order-${timestamp}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(testOrder, null, 2));

  console.log(`✅ Saved to: ${outputFile}`);
  console.log('');
  console.log('📱 After adding to Firestore:');
  console.log('   - Wait 1-2 minutes for Ana to process');
  console.log('   - Check WhatsApp on +584241476748');
  console.log('   - Ana will message about the 15 Churros Choco Arequipe');
  console.log('');
}
