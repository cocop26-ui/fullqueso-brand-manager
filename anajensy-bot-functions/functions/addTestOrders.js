const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

async function addTestOrders() {
  const now = new Date();
  
  const orders = [
    {
      ticket: '251004-TEST01',
      cliente_telefono: '4241476748',
      cliente_nombre: 'Pedro Padilla',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      fecha_verificado: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 5 * 60 * 1000)),
      tipo: 'delivery',
      productos: [{ nombre: 'Churros Choco Arequipe' }],
      ubicacion: 'La Florida',
      pedido_id: 'test001'
    },
    {
      ticket: '251004-TEST02',
      cliente_telefono: '4241476748',
      cliente_nombre: 'Pedro Padilla',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      fecha_verificado: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 3 * 60 * 1000)),
      tipo: 'delivery',
      productos: [{ nombre: 'Churros Choco Arequipe' }],
      ubicacion: 'La Florida',
      pedido_id: 'test002'
    },
    {
      ticket: '251004-TEST03',
      cliente_telefono: '4241476748',
      cliente_nombre: 'Pedro Padilla',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      fecha_verificado: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 2 * 60 * 1000)),
      tipo: 'delivery',
      productos: [{ nombre: 'Churros Choco Arequipe' }],
      ubicacion: 'La Florida',
      pedido_id: 'test003'
    }
  ];

  for (const order of orders) {
    await db.collection('pedidos_bot').add(order);
    console.log(`Added order: ${order.ticket}`);
  }

  console.log('All test orders added successfully!');
  process.exit(0);
}

addTestOrders().catch(console.error);const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestOrders() {
  const now = new Date();
  
  const orders = [
    {
      ticket: '251004-TEST01',
      cliente_telefono: '4241476748',
      cliente_nombre: 'Pedro Padilla',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      fecha_verificado: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 5 * 60 * 1000)),
      tipo: 'delivery',
      productos: [{ nombre: 'Churros Choco Arequipe' }],
      ubicacion: 'La Florida',
      pedido_id: 'test001'
    },
    {
      ticket: '251004-TEST02',
      cliente_telefono: '4241476748',
      cliente_nombre: 'Pedro Padilla',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      fecha_verificado: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 3 * 60 * 1000)),
      tipo: 'delivery',
      productos: [{ nombre: 'Churros Choco Arequipe' }],
      ubicacion: 'La Florida',
      pedido_id: 'test002'
    },
    {
      ticket: '251004-TEST03',
      cliente_telefono: '4241476748',
      cliente_nombre: 'Pedro Padilla',
      estado: 'VERIFICADO',
      seguimiento_enviado: false,
      fecha_verificado: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 2 * 60 * 1000)),
      tipo: 'delivery',
      productos: [{ nombre: 'Churros Choco Arequipe' }],
      ubicacion: 'La Florida',
      pedido_id: 'test003'
    }
  ];

  for (const order of orders) {
    await db.collection('pedidos_bot').add(order);
    console.log(`Added order: ${order.ticket}`);
  }

  console.log('All test orders added successfully!');
  process.exit(0);
}

addTestOrders().catch(console.error);
