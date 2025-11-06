/**
 * Script para hacer backup de Firestore
 * Exporta todas las colecciones a archivos JSON
 *
 * Uso: GCLOUD_PROJECT=fullqueso-bot node backup-firestore.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const projectId = process.env.GCLOUD_PROJECT || 'fullqueso-bot';

if (!admin.apps.length) {
  try {
    const serviceAccount = require('/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
    console.log('Initialized with service account');
  } catch (error) {
    admin.initializeApp({ projectId: projectId });
    console.log('Initialized with default credentials');
  }
}

const db = admin.firestore();

// Crear directorio de backups
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const backupPath = path.join(backupDir, `backup-${timestamp}`);
fs.mkdirSync(backupPath);

async function exportCollection(collectionName) {
  console.log(`\nExportando ${collectionName}...`);

  try {
    const snapshot = await db.collection(collectionName).get();
    const documents = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      // Convertir Timestamps a strings para JSON
      const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
        if (value && typeof value === 'object' && value._seconds) {
          return new Date(value._seconds * 1000).toISOString();
        }
        return value;
      }));

      documents.push({
        id: doc.id,
        ...cleanData
      });
    });

    const filePath = path.join(backupPath, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

    console.log(`  ${documents.length} documentos exportados`);
    console.log(`  Guardado en: ${filePath}`);

    return documents.length;
  } catch (error) {
    console.error(`  Error exportando ${collectionName}:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('=== BACKUP DE FIRESTORE - ANA WHATSAPP BOT ===');
  console.log(`\nFecha: ${new Date().toLocaleString()}`);
  console.log(`Directorio: ${backupPath}\n`);

  const collections = [
    'pedidos_bot',
    'clientes_bot',
    'conversaciones_bot',
    'encuestas_postventa'
  ];

  let totalDocs = 0;

  for (const collection of collections) {
    const count = await exportCollection(collection);
    totalDocs += count;
  }

  // Crear archivo de metadata
  const metadata = {
    backup_date: new Date().toISOString(),
    project_id: projectId,
    collections: collections,
    total_documents: totalDocs
  };

  fs.writeFileSync(
    path.join(backupPath, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('\n=== BACKUP COMPLETADO ===');
  console.log(`\nTotal documentos exportados: ${totalDocs}`);
  console.log(`Backup guardado en: ${backupPath}`);
  console.log(`Metadata: ${path.join(backupPath, 'metadata.json')}\n`);

  process.exit(0);
}

// Ejecutar
main().catch(error => {
  console.error('Error en backup:', error);
  process.exit(1);
});
