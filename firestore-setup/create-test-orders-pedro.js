const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestOrders() {
  console.log('📦 Creating test orders for Pedro (+584241476748)...\n');

  const telefono = '04241476748'; // Your number
  const telefonoDisplay = '+584241476748';

  try {
    // Create cliente first
    await db.collection('clientes_bot').doc(telefono).set({
      telefono: telefono,
      nombre: 'Pedro Padilla',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total_pedidos: 3,
      ultimo_pedido: admin.firestore.Timestamp.now(),
      productos_favoritos: ['Churros', 'Tequeños'],
      horario_preferido: 'tarde',
      creado: admin.firestore.Timestamp.now()
    });
    console.log('✓ Cliente Pedro Padilla created');

    // Calculate time 2+ minutes ago so it triggers immediately
    const hace3Min = new Date(Date.now() - 3 * 60 * 1000);

    // Order 1: Churros
    await db.collection('pedidos_bot').add({
      ticket: `TEST-CHURROS-${Date.now()}`,
      pedido_id: `test_churros_${Date.now()}`,
      cliente_telefono: telefono,
      cliente_nombre: 'Pedro Padilla',
      cliente_cedula: 'V-12345678',
      productos: [
        {
          nombre: '15 CHURROS + topping',
          cantidad: 1,
          topping: 'Choco Arequipe',
          precio: 5.99
        }
      ],
      tipo: 'Delivery',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 5.99,
      fecha_pedido: admin.firestore.Timestamp.fromDate(hace3Min),
      fecha_verificado: admin.firestore.Timestamp.fromDate(hace3Min),
      estado: 'VERIFICADO',
      seguimiento_enviado: false
    });
    console.log('✓ Order 1: Churros created (VERIFICADO 3 min ago)');

    // Order 2: Tequeños
    await db.collection('pedidos_bot').add({
      ticket: `TEST-TEQUENOS-${Date.now()}`,
      pedido_id: `test_tequenos_${Date.now()}`,
      cliente_telefono: telefono,
      cliente_nombre: 'Pedro Padilla',
      cliente_cedula: 'V-12345678',
      productos: [
        {
          nombre: '10 TEQUEÑOS',
          cantidad: 2,
          precio: 8.50
        }
      ],
      tipo: 'Pickup',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 17.00,
      fecha_pedido: admin.firestore.Timestamp.fromDate(hace3Min),
      fecha_verificado: admin.firestore.Timestamp.fromDate(hace3Min),
      estado: 'VERIFICADO',
      seguimiento_enviado: false
    });
    console.log('✓ Order 2: Tequeños created (VERIFICADO 3 min ago)');

    // Order 3: Combo
    await db.collection('pedidos_bot').add({
      ticket: `TEST-COMBO-${Date.now()}`,
      pedido_id: `test_combo_${Date.now()}`,
      cliente_telefono: telefono,
      cliente_nombre: 'Pedro Padilla',
      cliente_cedula: 'V-12345678',
      productos: [
        {
          nombre: '15 CHURROS + topping',
          cantidad: 1,
          topping: 'Nutella',
          precio: 5.99
        },
        {
          nombre: '10 TEQUEÑOS',
          cantidad: 1,
          precio: 4.25
        }
      ],
      tipo: 'Delivery',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 10.24,
      fecha_pedido: admin.firestore.Timestamp.fromDate(hace3Min),
      fecha_verificado: admin.firestore.Timestamp.fromDate(hace3Min),
      estado: 'VERIFICADO',
      seguimiento_enviado: false
    });
    console.log('✓ Order 3: Combo created (VERIFICADO 3 min ago)');

    console.log('\n✅ All test orders created successfully!');
    console.log('\n📱 Orders will be sent to: ' + telefonoDisplay);
    console.log('⏰ Next function run: within 2 minutes');
    console.log('\n💬 Make sure you joined the Twilio WhatsApp sandbox first!');
    console.log('   Send "join <your-code>" to +1 415 523 8886\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestOrders();
