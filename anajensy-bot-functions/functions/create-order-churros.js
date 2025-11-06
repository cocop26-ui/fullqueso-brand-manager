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

async function createChurrosOrder() {
  try {
    console.log('Creating churros order for customer service test...\n');

    // Customer phone (use your actual WhatsApp number for testing)
    const customerPhone = '584241476748'; // Pedro's number
    const customerName = 'Pedro';

    const orderData = {
      ticket: 'FQ-CHURROS-' + Date.now(),
      pedido_id: 'churros_order_' + Date.now(),
      cliente_telefono: customerPhone,
      cliente_nombre: customerName,
      productos: [
        {
          nombre: '15 Churros Choco Arequipe',
          cantidad: 1,
          precio: 12.00
        }
      ],
      tipo: 'delivery',
      ubicacion: 'Caracas',
      estado: 'ENTREGADO',
      fecha_entregado: admin.firestore.Timestamp.now(),
      seguimiento_enviado: false,
      total: 12.00
    };

    console.log('📦 Order Details:');
    console.log('  Customer:', customerName);
    console.log('  Phone:', customerPhone);
    console.log('  Product: 15 Churros Choco Arequipe');
    console.log('  Type: delivery');
    console.log('  Status: ENTREGADO\n');

    // Create the order
    const orderRef = await db.collection('pedidos_bot').add(orderData);

    console.log('✅ Order created successfully!');
    console.log('  Order ID:', orderRef.id);
    console.log('  Ticket:', orderData.ticket);
    console.log('');

    // Update/create customer profile
    await db.collection('clientes_bot').doc(customerPhone).set({
      nombre: customerName,
      telefono: customerPhone,
      total_pedidos: 4, // Increment for returning customer
      productos_favoritos: ['Churros', 'Tequeños']
    }, { merge: true });

    console.log('✅ Customer profile updated');
    console.log('');

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║              Test Order Ready for Ana Bot!                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('⏰ Within 1 minute, Ana will:');
    console.log('   1. Find this ENTREGADO order');
    console.log('   2. Generate a 30-40 word post-sales message');
    console.log('   3. Send WhatsApp to', customerPhone);
    console.log('');
    console.log('📱 Expected message will ask about:');
    console.log('   - Product quality (churros, choco arequipe)');
    console.log('   - Delivery service (time, packaging)');
    console.log('   - Overall satisfaction');
    console.log('');
    console.log('💬 When you receive Ana\'s message, you can test:');
    console.log('   1. Positive feedback: "Los churros estaban deliciosos!"');
    console.log('   2. Mixed feedback: "Buenos pero llegaron fríos"');
    console.log('   3. Provide email: "mi email es test@example.com"');
    console.log('');
    console.log('📊 This will populate:');
    console.log('   - conversaciones_bot (conversation history)');
    console.log('   - encuestas_postventa (survey data with sentiment)');
    console.log('');
    console.log('🔍 Monitor logs:');
    console.log('   firebase functions:log --only procesarSeguimientos');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createChurrosOrder();
