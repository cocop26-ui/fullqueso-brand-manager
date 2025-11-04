const admin = require('firebase-admin');

// Initialize Firebase with the anajensy-n8n project
const serviceAccount = require('/Users/pedropadilla/Downloads/anajensy-n8n-firebase-adminsdk-fbsvc-9185693959.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'anajensy-n8n'
});

const db = admin.firestore();

async function createTestOrder() {
  try {
    console.log('Creating test order in Firestore...');

    // Create test order
    const testOrder = {
      ticket: 'TEST-001',
      pedido_id: 'test_order_' + Date.now(),
      cliente_telefono: '584141476758', // REPLACE WITH YOUR WHATSAPP NUMBER
      cliente_nombre: 'Test Customer',
      productos: [
        {
          nombre: '15 CHURROS + topping de Chocolate',
          cantidad: 1
        },
        {
          nombre: 'Café Latte',
          cantidad: 1
        }
      ],
      tipo: 'delivery',
      ubicacion: 'La Florida, Caracas',
      estado: 'VERIFICADO',
      fecha_verificado: admin.firestore.Timestamp.now(),
      seguimiento_enviado: false
    };

    const orderRef = await db.collection('pedidos_bot').add(testOrder);
    console.log('✓ Test order created successfully!');
    console.log('  Order ID:', orderRef.id);
    console.log('  Ticket:', testOrder.ticket);
    console.log('  Customer:', testOrder.cliente_nombre);
    console.log('  Phone:', testOrder.cliente_telefono);
    console.log('  Products:', testOrder.productos.map(p => p.nombre).join(', '));

    // Also create test customer profile
    console.log('\nCreating test customer profile...');
    await db.collection('clientes_bot').doc(testOrder.cliente_telefono).set({
      nombre: testOrder.cliente_nombre,
      telefono: testOrder.cliente_telefono,
      total_pedidos: 1,
      productos_favoritos: ['CHURROS']
    });
    console.log('✓ Test customer profile created!');

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    Test Data Created!                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('\nNext Steps:');
    console.log('1. Go to n8n: https://fullqueso.app.n8n.cloud/workflow/NchS8Zb8CYhAboT3');
    console.log('2. Click "Test Workflow" button');
    console.log('3. Watch each node execute');
    console.log('4. Check your WhatsApp for Ana\'s message!');
    console.log('\nIMPORTANT: Make sure the phone number above is YOUR WhatsApp number');
    console.log('           If not, edit this file and change cliente_telefono');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating test order:', error);
    process.exit(1);
  }
}

createTestOrder();
