const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createInstantTest() {
  console.log('🚀 Creating INSTANT test order for Pedro...\n');

  const telefono = '04241476748';

  try {
    // Create order that triggers IMMEDIATELY
    const orderRef = await db.collection('pedidos_bot').add({
      ticket: `INSTANT-${Date.now()}`,
      pedido_id: `instant_${Date.now()}`,
      cliente_telefono: telefono,
      cliente_nombre: 'Pedro Padilla',
      cliente_cedula: 'V-12345678',
      productos: [
        {
          nombre: 'MEGA COMBO FULL QUESO',
          cantidad: 1,
          topping: 'Extra Chocolate',
          precio: 15.99
        }
      ],
      tipo: 'Delivery Express',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 15.99,
      fecha_pedido: admin.firestore.Timestamp.now(),
      fecha_verificado: admin.firestore.Timestamp.now(), // Just verified NOW!
      estado: 'VERIFICADO',
      seguimiento_enviado: false
    });

    console.log('✅ INSTANT test order created!');
    console.log(`   Order ID: ${orderRef.id}`);
    console.log(`   Ticket: INSTANT-${Date.now()}`);
    console.log('\n⏰ Ana will send WhatsApp within 1 minute!');
    console.log('📱 Check WhatsApp at: +584241476748\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createInstantTest();
