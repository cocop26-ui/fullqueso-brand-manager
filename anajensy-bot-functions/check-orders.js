const admin = require('firebase-admin');

// Initialize Firebase with the anajensy-n8n project
const serviceAccount = require('/Users/pedropadilla/Downloads/anajensy-n8n-firebase-adminsdk-fbsvc-9185693959.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'anajensy-n8n'
});

const db = admin.firestore();

async function checkOrders() {
  try {
    console.log('Checking orders in Firestore...\n');

    // Check all orders
    const allOrders = await db.collection('pedidos_bot').get();
    console.log(`Total orders in pedidos_bot: ${allOrders.size}\n`);

    // Check orders with ENTREGADO status
    const entregadoOrders = await db.collection('pedidos_bot')
      .where('estado', '==', 'ENTREGADO')
      .where('seguimiento_enviado', '==', false)
      .get();

    console.log(`Orders with ENTREGADO status and seguimiento_enviado=false: ${entregadoOrders.size}\n`);

    if (entregadoOrders.size > 0) {
      console.log('Orders found:');
      entregadoOrders.forEach(doc => {
        const data = doc.data();
        console.log(`\n- Order ID: ${doc.id}`);
        console.log(`  Ticket: ${data.ticket}`);
        console.log(`  Estado: ${data.estado}`);
        console.log(`  Phone: ${data.cliente_telefono}`);
        console.log(`  Seguimiento enviado: ${data.seguimiento_enviado}`);
        console.log(`  Fecha entregado: ${data.fecha_entregado ? data.fecha_entregado.toDate() : 'N/A'}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking orders:', error);
    process.exit(1);
  }
}

checkOrders();
