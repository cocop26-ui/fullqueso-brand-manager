const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function freshTest() {
  console.log('🧹 Cleaning up old test orders...\n');

  try {
    // Delete all old test orders
    const oldOrders = await db.collection('pedidos_bot').get();
    const batch = db.batch();

    oldOrders.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✓ Deleted ${oldOrders.size} old orders\n`);

    console.log('📦 Creating 3 FRESH test orders for Pedro (+584241476748)...\n');

    const telefono = '04241476748';

    // Ensure cliente exists
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
    console.log('✓ Cliente Pedro Padilla ready\n');

    const now = admin.firestore.Timestamp.now();

    // Order 1: Churros
    await db.collection('pedidos_bot').add({
      ticket: `FQ-CHURROS-${Date.now()}`,
      pedido_id: `fresh_churros_${Date.now()}`,
      cliente_telefono: telefono,
      cliente_nombre: 'Pedro Padilla',
      cliente_cedula: 'V-12345678',
      productos: [
        {
          nombre: '15 CHURROS + topping',
          cantidad: 1,
          topping: 'Nutella',
          precio: 5.99
        }
      ],
      tipo: 'Delivery',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 5.99,
      fecha_pedido: now,
      fecha_verificado: now,
      estado: 'VERIFICADO',
      seguimiento_enviado: false
    });
    console.log('✓ Order 1: 15 CHURROS + Nutella');

    // Order 2: Tequeños
    await db.collection('pedidos_bot').add({
      ticket: `FQ-TEQUENOS-${Date.now()}`,
      pedido_id: `fresh_tequenos_${Date.now()}`,
      cliente_telefono: telefono,
      cliente_nombre: 'Pedro Padilla',
      cliente_cedula: 'V-12345678',
      productos: [
        {
          nombre: '20 TEQUEÑOS Premium',
          cantidad: 1,
          precio: 12.99
        }
      ],
      tipo: 'Pickup',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 12.99,
      fecha_pedido: now,
      fecha_verificado: now,
      estado: 'VERIFICADO',
      seguimiento_enviado: false
    });
    console.log('✓ Order 2: 20 TEQUEÑOS Premium');

    // Order 3: Super Combo
    await db.collection('pedidos_bot').add({
      ticket: `FQ-COMBO-${Date.now()}`,
      pedido_id: `fresh_combo_${Date.now()}`,
      cliente_telefono: telefono,
      cliente_nombre: 'Pedro Padilla',
      cliente_cedula: 'V-12345678',
      productos: [
        {
          nombre: '15 CHURROS + topping',
          cantidad: 1,
          topping: 'Arequipe',
          precio: 5.99
        },
        {
          nombre: '10 TEQUEÑOS',
          cantidad: 1,
          precio: 7.50
        },
        {
          nombre: 'Bebida Premium',
          cantidad: 2,
          precio: 3.00
        }
      ],
      tipo: 'Delivery',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 16.49,
      fecha_pedido: now,
      fecha_verificado: now,
      estado: 'VERIFICADO',
      seguimiento_enviado: false
    });
    console.log('✓ Order 3: SUPER COMBO (Churros + Tequeños + Bebidas)');

    console.log('\n✅ 3 fresh test orders created successfully!');
    console.log('\n📱 Will be sent to: +584241476748');
    console.log('⏰ Ana will process in ~1 minute');
    console.log('\n💡 IMPORTANT: Make sure you joined Twilio sandbox!');
    console.log('   WhatsApp → Send to +1 415 523 8886');
    console.log('   Message: "join <your-code>"\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

freshTest();
