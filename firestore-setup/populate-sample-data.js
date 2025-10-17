const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function populateSampleData() {
  console.log('📦 Populating sample data from real orders...\n');

  try {
    // Sample Cliente 1: Carlos Gonzalez
    await db.collection('clientes_bot').doc('0424-1829697').set({
      telefono: '0424-1829697',
      nombre: 'Carlos Gonzalez',
      direccion: 'Sambil Candelaria, CARACAS',
      gps_location: new admin.firestore.GeoPoint(10.501783451193472, -66.91336105202606),
      total_pedidos: 1,
      ultimo_pedido: admin.firestore.Timestamp.now(),
      productos_favoritos: ['Tequeños', 'Churros'],
      horario_preferido: 'mediodia',
      creado: admin.firestore.Timestamp.now()
    });
    console.log('✓ Cliente Carlos Gonzalez created');

    // Sample Cliente 2: Gabriela Rivero  
    await db.collection('clientes_bot').doc('0426-3159987').set({
      telefono: '0426-3159987',
      nombre: 'Gabriela Rivero',
      direccion: 'El Recreo, CARACAS',
      gps_location: new admin.firestore.GeoPoint(10.4868745, -66.8681268),
      total_pedidos: 1,
      ultimo_pedido: admin.firestore.Timestamp.now(),
      productos_favoritos: ['Tequeños'],
      horario_preferido: 'mediodia',
      creado: admin.firestore.Timestamp.now()
    });
    console.log('✓ Cliente Gabriela Rivero created');

    // Sample Cliente 3: Denys Flamez
    await db.collection('clientes_bot').doc('0424-2067372').set({
      telefono: '0424-2067372',
      nombre: 'Denys Flamez',
      direccion: 'Sambil Caracas, CARACAS',
      gps_location: new admin.firestore.GeoPoint(10.4680253, -66.9036091),
      total_pedidos: 1,
      ultimo_pedido: admin.firestore.Timestamp.now(),
      productos_favoritos: ['Churros'],
      horario_preferido: 'mediodia',
      creado: admin.firestore.Timestamp.now()
    });
    console.log('✓ Cliente Denys Flamez created');

    // Pedido 1: Carlos Gonzalez
    const ahora = new Date();
    const verificadoHace2Min = new Date(ahora.getTime() - 2 * 60 * 1000);

    await db.collection('pedidos_bot').add({
      ticket: '251002-121831',
      pedido_id: '1759422053_18760369',
      cliente_telefono: '0424-1829697',
      cliente_nombre: 'Carlos Gonzalez',
      productos: [
        {
          nombre: '20 Tequeños',
          cantidad: 1,
          precio: 12.00
        },
        {
          nombre: '15 Churros + Topping',
          cantidad: 1,
          topping: 'Choco Arequipe',
          precio: 5.99
        },
        {
          nombre: 'Pepsi 1 Lts',
          cantidad: 1,
          precio: 1.00
        }
      ],
      tipo: 'Delivery',
      delivery_nombre: 'Pidelo y Punto Day',
      delivery_telefono: '0414-2345194',
      direccion: 'Sambil Candelaria, CARACAS',
      gps_location: new admin.firestore.GeoPoint(10.501783451193472, -66.91336105202606),
      subtotal: 24.99,
      delivery_costo: 2.50,
      total: 27.49,
      pago_confirmacion: '000402451896',
      pago_monto_bs: 4983.94,
      fecha_pedido: admin.firestore.Timestamp.fromDate(verificadoHace2Min),
      fecha_verificado: admin.firestore.Timestamp.fromDate(verificadoHace2Min),
      verificado_por: 'ANA',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      seguimiento_fecha: null
    });
    console.log('✓ Pedido Carlos Gonzalez created (LISTO PARA TRIGGER EN 2 MIN)');

    // Pedido 2: Gabriela Rivero
    await db.collection('pedidos_bot').add({
      ticket: '251002-122605',
      pedido_id: '1759422528_18030143',
      cliente_telefono: '0426-3159987',
      cliente_nombre: 'Gabriela Rivero',
      productos: [
        {
          nombre: 'Racion 20 Tequeños',
          cantidad: 1,
          precio: 12.00
        }
      ],
      tipo: 'Delivery',
      delivery_nombre: 'Pidelo y Punto Day',
      delivery_telefono: '0414-2345194',
      direccion: 'El Recreo, CARACAS',
      punto_referencia: 'DAKA',
      gps_location: new admin.firestore.GeoPoint(10.4868745, -66.8681268),
      subtotal: 12.00,
      delivery_costo: 2.50,
      total: 14.50,
      pago_confirmacion: '000402465297',
      pago_monto_bs: 2628.85,
      fecha_pedido: admin.firestore.Timestamp.now(),
      fecha_verificado: admin.firestore.Timestamp.fromDate(verificadoHace2Min),
      verificado_por: 'ANA',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      seguimiento_fecha: null
    });
    console.log('✓ Pedido Gabriela Rivero created (LISTO PARA TRIGGER EN 2 MIN)');

    // Pedido 3: Denys Flamez
    await db.collection('pedidos_bot').add({
      ticket: '251002-122959',
      pedido_id: '1759422797_15797943',
      cliente_telefono: '0424-2067372',
      cliente_nombre: 'Denys Flamez',
      productos: [
        {
          nombre: '15 CHURROS + Topping',
          cantidad: 2,
          topping: 'Choco Arequipe',
          precio: 11.98
        }
      ],
      tipo: 'Delivery',
      delivery_nombre: 'Pidelo y Punto Day',
      delivery_telefono: '0414-2345194',
      direccion: 'Sambil Caracas, CARACAS',
      punto_referencia: 'Resguardo femenino el valle, Por detrás del centro comercial el valle frente a las residencias los samanes',
      gps_location: new admin.firestore.GeoPoint(10.4680253, -66.9036091),
      subtotal: 11.98,
      delivery_costo: 2.50,
      total: 14.48,
      pago_confirmacion: '563218599',
      pago_monto_bs: 2625.22,
      fecha_pedido: admin.firestore.Timestamp.now(),
      fecha_verificado: admin.firestore.Timestamp.fromDate(verificadoHace2Min),
      verificado_por: 'ANA',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      seguimiento_fecha: null
    });
    console.log('✓ Pedido Denys Flamez created (LISTO PARA TRIGGER EN 2 MIN)');

    console.log('\n✅ Sample data populated successfully!');
    console.log('\n📋 Summary:');
    console.log('  - 3 clientes created');
    console.log('  - 3 pedidos created');
    console.log('  - All pedidos are VERIFICADO por ANA hace 2 minutos');
    console.log('  - Ready to test trigger!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

populateSampleData();