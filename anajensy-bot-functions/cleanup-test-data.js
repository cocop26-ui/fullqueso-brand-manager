const admin = require('firebase-admin');

// Initialize Firebase with the fullqueso-bot project
const serviceAccount = require('/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fullqueso-bot'
});

const db = admin.firestore();

async function cleanupTestData() {
  try {
    const testPhone = '584241476748';

    console.log('Cleaning up test data for:', testPhone);
    console.log('');

    // Delete conversations
    console.log('1. Deleting old conversations...');
    const conversaciones = await db.collection('conversaciones_bot')
      .where('cliente_telefono', '==', testPhone)
      .get();

    const conversacionesDeletes = [];
    conversaciones.forEach(doc => {
      conversacionesDeletes.push(doc.ref.delete());
    });
    await Promise.all(conversacionesDeletes);
    console.log(`   ✓ Deleted ${conversaciones.size} conversations`);

    // Delete surveys
    console.log('2. Deleting old surveys...');
    const encuestas = await db.collection('encuestas_postventa')
      .where('cliente_telefono', '==', testPhone)
      .get();

    const encuestasDeletes = [];
    encuestas.forEach(doc => {
      encuestasDeletes.push(doc.ref.delete());
    });
    await Promise.all(encuestasDeletes);
    console.log(`   ✓ Deleted ${encuestas.size} surveys`);

    // Reset seguimiento_enviado on orders
    console.log('3. Resetting orders...');
    const pedidos = await db.collection('pedidos_bot')
      .where('cliente_telefono', '==', testPhone)
      .get();

    const pedidosUpdates = [];
    pedidos.forEach(doc => {
      pedidosUpdates.push(doc.ref.update({ seguimiento_enviado: false }));
    });
    await Promise.all(pedidosUpdates);
    console.log(`   ✓ Reset ${pedidos.size} orders`);

    console.log('');
    console.log('✅ Test data cleaned! Ready for fresh test.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupTestData();
