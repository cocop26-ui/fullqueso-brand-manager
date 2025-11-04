const admin = require('firebase-admin');

// Get Firebase config from environment or use fullqueso-bot
const projectId = process.env.GCLOUD_PROJECT || 'fullqueso-bot';

// Initialize with service account for local testing
if (!admin.apps.length) {
  try {
    // Try to use service account for local testing
    const serviceAccount = require('/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
    console.log('Initialized with service account credentials');
  } catch (error) {
    // Fall back to default credentials (for Cloud Functions)
    admin.initializeApp({
      projectId: projectId
    });
    console.log('Initialized with default credentials');
  }
}

const db = admin.firestore();

async function createTestOrder() {
  try {
    console.log('Creating test order for Pedro in fullqueso-bot project...');

    const orderData = {
      ticket: 'FQ-TEST-PEDRO-' + Date.now(),
      pedido_id: 'test_pedro_' + Date.now(),
      cliente_telefono: '584241476748',
      cliente_nombre: 'Pedro',
      productos: [
        {
          nombre: '20 Tequeños',
          cantidad: 1
        }
      ],
      tipo: 'delivery',
      ubicacion: 'Caracas',
      estado: 'VERIFICADO',
      fecha_verificado: admin.firestore.Timestamp.now(),
      seguimiento_enviado: false
    };

    const orderRef = await db.collection('pedidos_bot').add(orderData);
    console.log('✅ Order created successfully!');
    console.log('  Order ID:', orderRef.id);
    console.log('  Ticket:', orderData.ticket);
    console.log('  Customer: Pedro');
    console.log('  Phone: +58 424-1476748');
    console.log('  Products: 20 Tequeños');

    // Create customer profile
    await db.collection('clientes_bot').doc('584241476748').set({
      nombre: 'Pedro',
      telefono: '584241476748',
      total_pedidos: 3,
      productos_favoritos: ['CHURROS', 'Café']
    });
    console.log('✅ Customer profile created');

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           Firebase Cloud Function Will Process This!          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('⏰ Within 1 minute, the function will:');
    console.log('   1. Find this VERIFICADO order');
    console.log('   2. Generate personalized message from Ana');
    console.log('   3. Send WhatsApp to Pedro at +58 424-1476748');
    console.log('');
    console.log('📱 Check Pedro\'s WhatsApp in ~1 minute!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestOrder();
