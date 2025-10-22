const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestOrder() {
  try {
    console.log('🚀 Creating test order for Meta WhatsApp...\n');

    const timestamp = Date.now();
    const pedido = {
      ticket: `FQ-META-${timestamp}`,
      cliente_telefono: '04241476758',
      cliente_nombre: 'Pedro Padilla',
      productos: [
        {
          nombre: '15 CHURROS + Choco Arequipe',
          cantidad: 1,
          precio: 5000
        }
      ],
      tipo: 'delivery',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      fecha_verificado: admin.firestore.Timestamp.now(),
      fecha_creado: admin.firestore.Timestamp.now(),
      pedido_id: `test-meta-${timestamp}`
    };

    const docRef = await db.collection('pedidos_bot').add(pedido);

    console.log('✅ Test order created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 Document ID:', docRef.id);
    console.log('🎫 Ticket:', pedido.ticket);
    console.log('👤 Cliente:', pedido.cliente_nombre);
    console.log('📱 Teléfono:', pedido.cliente_telefono);
    console.log('📦 Productos:', pedido.productos[0].nombre);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⏳ Anajensy should process this in ~1 minute...');
    console.log('📊 Monitor logs: firebase functions:log\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    process.exit(1);
  }
}

createTestOrder();
