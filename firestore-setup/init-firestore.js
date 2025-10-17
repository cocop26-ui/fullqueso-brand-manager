const admin = require('firebase-admin');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeFirestore() {
  console.log('🚀 Initializing Firestore collections for Anajensy Bot...\n');

  try {
    // Collection 1: clientes_bot
    console.log('Creating clientes_bot collection...');
    
    const clientesRef = await db.collection('clientes_bot').add({
      telefono: '04141234567',
      nombre: 'Test Cliente',
      cedula: '12345678',
      direccion: 'Cerro Verde, Caracas',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total_pedidos: 0,
      ultimo_pedido: null,
      productos_favoritos: [],
      horario_preferido: 'tarde',
      creado: admin.firestore.Timestamp.now(),
      actualizado: admin.firestore.Timestamp.now()
    });
    
    console.log('✓ clientes_bot created with ID:', clientesRef.id);

    // Collection 2: pedidos_bot
    console.log('\nCreating pedidos_bot collection...');
    
    const pedidosRef = await db.collection('pedidos_bot').add({
      ticket: 'TEST-001',
      pedido_id: 'test_123456',
      cliente_telefono: '04141234567',
      cliente_nombre: 'Test Cliente',
      cliente_cedula: '12345678',
      productos: [
        {
          nombre: '15 CHURROS + topping',
          cantidad: 1,
          topping: 'Choco Arequipe',
          precio: 5.99
        }
      ],
      tipo: 'Delivery',
      direccion: 'Cerro Verde, Caracas',
      gps_location: new admin.firestore.GeoPoint(10.4806, -66.9036),
      total: 5.99,
      fecha_pedido: admin.firestore.Timestamp.now(),
      fecha_entregado: admin.firestore.Timestamp.now(),
      estado: 'ENTREGADO',
      seguimiento_enviado: false,
      seguimiento_fecha: null
    });
    
    console.log('✓ pedidos_bot created with ID:', pedidosRef.id);

    // Collection 3: conversaciones_bot
    console.log('\nCreating conversaciones_bot collection...');
    
    const conversacionesRef = await db.collection('conversaciones_bot').add({
      cliente_telefono: '04141234567',
      cliente_nombre: 'Test Cliente',
      pedido_ticket: 'TEST-001',
      pedido_id: 'test_123456',
      mensaje_ana: 'Hola, este es un mensaje de prueba',
      mensaje_cliente: null,
      fecha: admin.firestore.Timestamp.now(),
      tipo_interaccion: 'seguimiento_post_compra',
      sentimiento: 'neutral',
      requiere_atencion: false
    });
    
    console.log('✓ conversaciones_bot created with ID:', conversacionesRef.id);

    console.log('\n✅ ALL COLLECTIONS CREATED SUCCESSFULLY!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeFirestore();