const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Get Firebase config from environment or use fullqueso-bot
const projectId = process.env.GCLOUD_PROJECT || 'fullqueso-bot';

// Initialize with service account for local testing
if (!admin.apps.length) {
  try {
    // Try to use service account for local testing
    const serviceAccount = require('/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
    console.log('✓ Initialized with service account credentials\n');
  } catch (error) {
    // Fall back to default credentials (for Cloud Functions)
    admin.initializeApp({
      projectId: projectId
    });
    console.log('✓ Initialized with default credentials\n');
  }
}

const db = admin.firestore();

async function restoreCollection(collectionName, backupPath) {
  const filePath = path.join(backupPath, `${collectionName}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  No se encontró ${collectionName}.json`);
    return 0;
  }

  console.log(`  📦 Restaurando ${collectionName}...`);

  const documents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let count = 0;
  const batchSize = 500; // Firestore batch limit

  // Process in batches
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = db.batch();
    const chunk = documents.slice(i, i + batchSize);

    for (const doc of chunk) {
      const { id, ...data } = doc;
      const docRef = db.collection(collectionName).doc(id);

      // Convert ISO strings back to Timestamps
      const convertedData = JSON.parse(JSON.stringify(data), (key, value) => {
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
          return admin.firestore.Timestamp.fromDate(new Date(value));
        }
        return value;
      });

      batch.set(docRef, convertedData, { merge: true });
      count++;
    }

    await batch.commit();
    console.log(`    ↳ ${Math.min(i + batchSize, documents.length)}/${documents.length} documentos procesados`);
  }

  return count;
}

async function restoreBackup(backupPath) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          Restauración de Firestore - Full Queso Bot          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🔄 Restaurando desde: ${backupPath}`);
  console.log('');

  // Verify backup path exists
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Error: No se encuentra la ruta ${backupPath}`);
    console.error('');
    console.error('Uso: GCLOUD_PROJECT=fullqueso-bot node restore-firestore.js <ruta-del-backup>');
    console.error('');
    console.error('Ejemplos:');
    console.error('  node restore-firestore.js ./backups/backup-2025-11-06T12-32-56');
    console.error('  node restore-firestore.js ../restore/2025-11-06');
    process.exit(1);
  }

  // Check for manifest
  const manifestPath = path.join(backupPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('📋 Información del backup:');
    console.log(`   Fecha: ${manifest.backup_date || 'desconocida'}`);
    console.log(`   Documentos totales: ${manifest.total_documents || 'desconocido'}`);
    console.log('');
  }

  // Ask for confirmation
  console.log('⚠️  ADVERTENCIA: Esta operación sobrescribirá documentos existentes.');
  console.log('   Se recomienda crear un backup actual antes de continuar.');
  console.log('');
  console.log('Presiona Ctrl+C para cancelar, o espera 5 segundos para continuar...');
  console.log('');

  await new Promise(resolve => setTimeout(resolve, 5000));

  const collections = [
    'pedidos_bot',
    'clientes_bot',
    'conversaciones_bot',
    'encuestas_postventa'
  ];

  let totalRestored = 0;
  const startTime = Date.now();

  for (const collection of collections) {
    const count = await restoreCollection(collection, backupPath);
    if (count > 0) {
      console.log(`  ✓ ${count} documentos restaurados en ${collection}`);
    }
    console.log('');
    totalRestored += count;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║              Restauración Completada con Éxito               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Total de documentos restaurados: ${totalRestored}`);
  console.log(`⏱️  Tiempo total: ${duration} segundos`);
  console.log('');
  console.log('📊 Verificar en Firebase Console:');
  console.log('   https://console.firebase.google.com/project/fullqueso-bot/firestore');
  console.log('');

  process.exit(0);
}

// Get backup path from command line arguments
const backupPath = process.argv[2];

if (!backupPath) {
  console.error('❌ Error: Falta la ruta del backup');
  console.error('');
  console.error('Uso: GCLOUD_PROJECT=fullqueso-bot node restore-firestore.js <ruta-del-backup>');
  console.error('');
  console.error('Ejemplos:');
  console.error('  # Restaurar desde backup local');
  console.error('  node restore-firestore.js ./backups/backup-2025-11-06T12-32-56');
  console.error('');
  console.error('  # Restaurar desde backup descargado de Cloud Storage');
  console.error('  gsutil -m cp -r gs://fullqueso-bot.appspot.com/backups/2025-11-06 ./restore/');
  console.error('  node restore-firestore.js ./restore/2025-11-06');
  console.error('');
  process.exit(1);
}

restoreBackup(backupPath);
