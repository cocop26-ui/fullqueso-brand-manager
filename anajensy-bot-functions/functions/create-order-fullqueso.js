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
    console.log('Creating test order for María Andreína in fullqueso-bot project...');

    const orderData = {
      ticket: 'FQ-TEST-MARIA-' + Date.now(),
      pedido_id: 'test_maria_' + Date.now(),
      cliente_telefono: '584243732864',
      cliente_nombre: 'María Andreína',
      productos: [
        {
          nombre: 'Lonchera de 20 Tequeños',
          cantidad: 1
        }
      ],
      tipo: 'delivery',
      ubicacion: 'Caracas',
      estado: 'ENTREGADO',
      fecha_verificado: admin.firestore.Timestamp.now(),
      fecha_entregado: admin.firestore.Timestamp.now(),
      seguimiento_enviado: false
    };

    const orderRef = await db.collection('pedidos_bot').add(orderData);
    console.log('✅ Order created successfully!');
    console.log('  Order ID:', orderRef.id);
    console.log('  Ticket:', orderData.ticket);
    console.log('  Customer: María Andreína');
    console.log('  Phone: +58 424-3732864');
    console.log('  Products:', orderData.productos.map(p => p.nombre).join(', '));

    // Create customer profile
    await db.collection('clientes_bot').doc('584243732864').set({
      nombre: 'María Andreína',
      telefono: '584243732864',
      total_pedidos: 1,
      productos_favoritos: ['Tequeños']
    });
    console.log('✅ Customer profile created');

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           Firebase Cloud Function Will Process This!          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('⏰ Within 1 minute, the function will:');
    console.log('   1. Find this ENTREGADO order');
    console.log('   2. Generate personalized follow-up message from Ana');
    console.log('   3. Send WhatsApp to María Andreína at +58 424-3732864');
    console.log('');
    console.log('📱 Check María Andreína\'s WhatsApp in ~1 minute!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestOrder();
