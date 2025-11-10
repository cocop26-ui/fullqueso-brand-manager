const admin = require('firebase-admin');

// Initialize Firebase with the fullqueso-bot project
const serviceAccount = require('/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fullqueso-bot'
});

const db = admin.firestore();

async function deleteAllTestOrders() {
  try {
    const testPhone = '584241476748';

    console.log('🗑️  DELETING ALL test orders for:', testPhone);
    console.log('');

    // Delete ALL test orders completely
    console.log('Deleting all test orders...');
    const pedidos = await db.collection('pedidos_bot')
      .where('cliente_telefono', '==', testPhone)
      .get();

    console.log(`Found ${pedidos.size} orders to delete`);

    const batch = db.batch();
    pedidos.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✓ Deleted ${pedidos.size} test orders`);

    // Also delete conversations and surveys again
    const conversaciones = await db.collection('conversaciones_bot')
      .where('cliente_telefono', '==', testPhone)
      .get();

    const convBatch = db.batch();
    conversaciones.forEach(doc => {
      convBatch.delete(doc.ref);
    });
    await convBatch.commit();
    console.log(`✓ Deleted ${conversaciones.size} conversations`);

    const encuestas = await db.collection('encuestas_postventa')
      .where('cliente_telefono', '==', testPhone)
      .get();

    const encBatch = db.batch();
    encuestas.forEach(doc => {
      encBatch.delete(doc.ref);
    });
    await encBatch.commit();
    console.log(`✓ Deleted ${encuestas.size} surveys`);

    console.log('');
    console.log('✅ All test data completely deleted!');
    console.log('   Ana will stop sending messages now.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAllTestOrders();
