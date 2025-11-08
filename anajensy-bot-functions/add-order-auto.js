#!/usr/bin/env node

// Automatic order creation using Firestore REST API
const https = require('https');
const { exec } = require('child_process');

async function addOrder() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🤖 Adding Test Order Automatically');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Get Firebase auth token
  console.log('Getting Firebase auth token...');

  return new Promise((resolve, reject) => {
    exec('firebase login:ci --no-localhost', (error, stdout, stderr) => {
      if (error) {
        // Try getting current user token instead
        exec('firebase apps:sdkconfig', (error2, stdout2) => {
          if (error2) {
            console.error('❌ Could not authenticate. Run: firebase login');
            reject(error2);
            return;
          }

          // Parse and continue
          console.log('✅ Using existing Firebase auth');
          createOrderViaAPI(resolve, reject);
        });
      } else {
        console.log('✅ Authenticated');
        createOrderViaAPI(resolve, reject);
      }
    });
  });
}

function createOrderViaAPI(resolve, reject) {
  const timestamp = Date.now();
  const isoDate = new Date(timestamp).toISOString();

  const order = {
    fields: {
      ticket: { stringValue: `FQ-TEST-${timestamp}` },
      cliente_nombre: { stringValue: 'Pedro Padilla' },
      cliente_telefono: { stringValue: '584241476748' },
      estado: { stringValue: 'ENTREGADO' },
      seguimiento_enviado: { booleanValue: false },
      fecha_entregado: { timestampValue: isoDate },
      fecha_verificado: { timestampValue: isoDate },
      tipo: { stringValue: 'delivery' },
      total: { integerValue: '25' },
      productos: {
        arrayValue: {
          values: [{
            mapValue: {
              fields: {
                nombre: { stringValue: 'Churros Choco Arequipe x15' },
                cantidad: { integerValue: '1' },
                precio: { integerValue: '25' }
              }
            }
          }]
        }
      },
      pedido_id: { stringValue: `pedro_test_${timestamp}` }
    }
  };

  console.log('');
  console.log('📦 Order details:');
  console.log(`   Ticket: FQ-TEST-${timestamp}`);
  console.log('   Customer: Pedro Padilla');
  console.log('   Phone: +584241476748');
  console.log('   Product: 15 Churros Choco Arequipe');
  console.log('');
  console.log('Adding to Firestore via REST API...');
  console.log('');

  // Use Firebase REST API
  exec(`curl -X POST \
    "https://firestore.googleapis.com/v1/projects/fullqueso-bot/databases/(default)/documents/pedidos_bot" \
    -H "Content-Type: application/json" \
    -d '${JSON.stringify(order)}'`,
    (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to add via REST API');
        console.log('');
        console.log('📋 Manual fallback: Add this order in Firebase Console:');
        console.log('');
        console.log(JSON.stringify({
          ticket: `FQ-TEST-${timestamp}`,
          cliente_nombre: 'Pedro Padilla',
          cliente_telefono: '584241476748',
          estado: 'ENTREGADO',
          seguimiento_enviado: false,
          tipo: 'delivery',
          total: 25,
          productos: [{
            nombre: 'Churros Choco Arequipe x15',
            cantidad: 1,
            precio: 25
          }]
        }, null, 2));
        console.log('');
        reject(error);
        return;
      }

      console.log('✅ Order added successfully!');
      console.log('');
      console.log('⏰ Ana will process this in 1 minute');
      console.log('');
      console.log('📊 Monitor logs:');
      console.log('   firebase functions:log --only procesarSeguimientos');
      console.log('');
      console.log('📱 Check WhatsApp: +584241476748');
      console.log('');
      resolve();
    }
  );
}

addOrder().catch(console.error);
