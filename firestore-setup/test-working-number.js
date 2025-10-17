const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testWorkingNumber() {
  console.log('🧹 Limpiando pedidos anteriores...\n');

  try {
    // Delete all old test orders
    const oldOrders = await db.collection('pedidos_bot').get();
    const batch = db.batch();

    oldOrders.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✓ Eliminados ${oldOrders.size} pedidos antiguos\n`);

    console.log('📦 Creando pedidos de prueba...\n');

    // Número del pedido (cliente original)
    const telefonoPedido = '04241476748';

    // Número que recibe WhatsApp (que está en sandbox)
    const telefonoWhatsApp = '04168542395';

    // Create cliente
    await db.collection('clientes_bot').doc(telefonoWhatsApp).set({
      telefono: telefonoWhatsApp,
      nombre: 'Pedro Padilla (WhatsApp)',
      direccion: 'Caracas, Venezuela',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total_pedidos: 3,
      ultimo_pedido: admin.firestore.Timestamp.now(),
      productos_favoritos: ['Churros', 'Tequeños'],
      horario_preferido: 'tarde',
      creado: admin.firestore.Timestamp.now()
    });
    console.log('✓ Cliente creado\n');

    const now = admin.firestore.Timestamp.now();

    // Order 1: Churros
    await db.collection('pedidos_bot').add({
      ticket: `TEST-CHURROS-${Date.now()}`,
      pedido_id: `test_churros_${Date.now()}`,
      cliente_telefono: telefonoWhatsApp, // WhatsApp number
      numero_pedido_original: telefonoPedido, // Original order number
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
    console.log('✓ Pedido 1: 15 CHURROS + Nutella');

    // Order 2: Tequeños
    await db.collection('pedidos_bot').add({
      ticket: `TEST-TEQUENOS-${Date.now()}`,
      pedido_id: `test_tequenos_${Date.now()}`,
      cliente_telefono: telefonoWhatsApp,
      numero_pedido_original: telefonoPedido,
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
    console.log('✓ Pedido 2: 20 TEQUEÑOS Premium');

    // Order 3: Super Combo
    await db.collection('pedidos_bot').add({
      ticket: `TEST-COMBO-${Date.now()}`,
      pedido_id: `test_combo_${Date.now()}`,
      cliente_telefono: telefonoWhatsApp,
      numero_pedido_original: telefonoPedido,
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
    console.log('✓ Pedido 3: SUPER COMBO');

    console.log('\n✅ 3 pedidos de prueba creados!');
    console.log('\n📋 Detalles:');
    console.log(`   Número de Pedido: +58${telefonoPedido}`);
    console.log(`   📱 WhatsApp destino: +58${telefonoWhatsApp} (número que funciona)`);
    console.log('\n⏰ Ana procesará en ~1 minuto');
    console.log('📲 Revisa WhatsApp en: +584168542395\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testWorkingNumber();
