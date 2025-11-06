# 🗄️ Sistema de Backup - Ana WhatsApp Bot

## 📋 Descripción General

El sistema de backup de Full Queso utiliza dos métodos complementarios:

1. **Backup Automático (Cloud)** - Cada domingo a las 2:00 AM (Caracas)
2. **Backup Manual (Local)** - Ejecutado bajo demanda

## 🤖 Backup Automático (Recomendado)

### Configuración

**Función:** `backupFirestore` en Firebase Cloud Functions
**Frecuencia:** Cada domingo a las 2:00 AM (zona horaria de Caracas)
**Destino:** Google Cloud Storage bucket del proyecto
**Retención:** Últimas 8 semanas (se eliminan backups más antiguos automáticamente)

### Qué respalda

Todas las colecciones de Firestore:
- `pedidos_bot` - Órdenes de clientes
- `clientes_bot` - Perfiles de clientes
- `conversaciones_bot` - Historial de conversaciones con Ana
- `encuestas_postventa` - Feedback y sentiment analysis

### Estructura de archivos

```
gs://fullqueso-bot.appspot.com/backups/
├── 2025-11-06/
│   ├── manifest.json              # Metadata del backup
│   ├── pedidos_bot.json           # Órdenes
│   ├── clientes_bot.json          # Clientes
│   ├── conversaciones_bot.json    # Conversaciones
│   └── encuestas_postventa.json   # Encuestas
├── 2025-11-13/
│   └── ...
└── 2025-11-20/
    └── ...
```

### Verificar backups automáticos

```bash
# Ver logs del último backup
firebase functions:log --only backupFirestore

# Listar backups en Cloud Storage
gsutil ls -l gs://fullqueso-bot.appspot.com/backups/

# Descargar un backup específico
gsutil -m cp -r gs://fullqueso-bot.appspot.com/backups/2025-11-06 ./local-backups/
```

### Monitoreo

El backup automático registra en Firebase Console:
- ✅ Backup completado con éxito
- 📊 Número total de documentos respaldados
- ⚠️ Errores si ocurren

**Ver logs en tiempo real:**
```bash
firebase functions:log --only backupFirestore --follow
```

## 💻 Backup Manual (Local)

### Cuándo usar

- Antes de cambios importantes en la base de datos
- Antes de deploys mayores
- Para tener una copia local de emergencia
- Para análisis de datos offline

### Ejecutar backup manual

```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node backup-firestore.js
```

### Salida esperada

```
🗄️  Iniciando backup de Firestore...

  📦 Exportando pedidos_bot...
  ✓ 30 documentos exportados

  📦 Exportando clientes_bot...
  ✓ 7 documentos exportados

  📦 Exportando conversaciones_bot...
  ✓ 73 documentos exportados

  📦 Exportando encuestas_postventa...
  ✓ 14 documentos exportados

✅ Backup completado: 124 documentos totales
📁 Guardado en: /functions/backups/backup-2025-11-06T12-32-56
```

### Ubicación de backups locales

```
anajensy-bot-functions/functions/backups/
├── backup-2025-11-06T12-32-56/
│   ├── pedidos_bot.json
│   ├── clientes_bot.json
│   ├── conversaciones_bot.json
│   └── encuestas_postventa.json
└── backup-2025-11-07T10-15-30/
    └── ...
```

**NOTA:** Los backups locales NO se suben a GitHub (protegidos por `.gitignore`)

## 🔄 Restauración de Datos

### Restaurar desde Cloud Storage

```bash
# 1. Descargar backup específico
gsutil -m cp -r gs://fullqueso-bot.appspot.com/backups/2025-11-06 ./restore/

# 2. Usar script de restauración (crear si es necesario)
cd functions
GCLOUD_PROJECT=fullqueso-bot node restore-firestore.js ./restore/2025-11-06
```

### Restaurar desde backup local

```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node restore-firestore.js ./backups/backup-2025-11-06T12-32-56
```

### Script de restauración

Crear `functions/restore-firestore.js`:

```javascript
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase
const projectId = process.env.GCLOUD_PROJECT || 'fullqueso-bot';
if (!admin.apps.length) {
  try {
    const serviceAccount = require('/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
  } catch (error) {
    admin.initializeApp({ projectId: projectId });
  }
}

const db = admin.firestore();

async function restoreCollection(collectionName, backupPath) {
  const filePath = path.join(backupPath, `${collectionName}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No se encontró ${collectionName}.json`);
    return 0;
  }

  const documents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const batch = db.batch();
  let count = 0;

  for (const doc of documents) {
    const { id, ...data } = doc;
    const docRef = db.collection(collectionName).doc(id);

    // Convertir strings ISO a Timestamps
    const convertedData = JSON.parse(JSON.stringify(data), (key, value) => {
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return admin.firestore.Timestamp.fromDate(new Date(value));
      }
      return value;
    });

    batch.set(docRef, convertedData);
    count++;

    // Firestore batch limit is 500
    if (count % 500 === 0) {
      await batch.commit();
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  return count;
}

async function restoreBackup(backupPath) {
  console.log(`🔄 Restaurando desde: ${backupPath}\n`);

  const collections = [
    'pedidos_bot',
    'clientes_bot',
    'conversaciones_bot',
    'encuestas_postventa'
  ];

  let totalRestored = 0;

  for (const collection of collections) {
    console.log(`  📦 Restaurando ${collection}...`);
    const count = await restoreCollection(collection, backupPath);
    console.log(`  ✓ ${count} documentos restaurados\n`);
    totalRestored += count;
  }

  console.log(`✅ Restauración completada: ${totalRestored} documentos`);
  process.exit(0);
}

// Obtener ruta del backup desde argumentos
const backupPath = process.argv[2];
if (!backupPath) {
  console.error('❌ Uso: node restore-firestore.js <ruta-del-backup>');
  console.error('Ejemplo: node restore-firestore.js ./backups/backup-2025-11-06T12-32-56');
  process.exit(1);
}

restoreBackup(backupPath);
```

## 🛡️ Mejores Prácticas

### Antes de cambios importantes

```bash
# 1. Crear backup manual
cd functions
GCLOUD_PROJECT=fullqueso-bot node backup-firestore.js

# 2. Hacer cambios
# ... tus modificaciones ...

# 3. Verificar que todo funciona
# 4. Si hay problemas, restaurar desde backup
```

### Programación de backups

- ✅ **Automático:** Cada domingo 2:00 AM (configurado)
- ✅ **Manual:** Antes de deployments importantes
- ✅ **Retención:** 8 semanas en Cloud Storage
- ✅ **Locales:** Mantener últimos 3 backups manuales

### Seguridad

- 🔒 Backups en Cloud Storage están protegidos por IAM de Firebase
- 🔒 Backups locales NO se suben a GitHub (`.gitignore`)
- 🔒 Acceso requiere service account credentials
- 🔒 Los datos incluyen información sensible de clientes

## 📊 Monitoreo y Alertas

### Ver estado de Cloud Scheduler

```bash
# Listar scheduled jobs
gcloud scheduler jobs list --project=fullqueso-bot

# Ver detalles del backup job
gcloud scheduler jobs describe backupFirestore --location=us-central1 --project=fullqueso-bot
```

### Verificar próxima ejecución

Firebase Console → Functions → backupFirestore → Logs

El próximo backup automático está programado para:
**Domingo próximo a las 2:00 AM (hora de Caracas)**

## 🆘 Solución de Problemas

### Error: "Permission denied"

```bash
# Verificar que tienes el service account key
ls /Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-*.json

# O autenticar con Firebase CLI
firebase login
firebase use fullqueso-bot
```

### Error: "Backup not found"

```bash
# Listar backups disponibles
gsutil ls gs://fullqueso-bot.appspot.com/backups/

# Verificar backups locales
ls -la functions/backups/
```

### Backup automático no se ejecuta

```bash
# Ver logs de errores
firebase functions:log --only backupFirestore

# Verificar que la función está desplegada
firebase functions:list | grep backupFirestore
```

## 📞 Contacto

Para problemas con backups:
1. Revisar logs en Firebase Console
2. Ejecutar backup manual como alternativa
3. Verificar que Cloud Storage tiene espacio disponible
4. Contactar administrador del proyecto Firebase

## 📝 Historial de Cambios

### 2025-11-06
- ✅ Implementado backup automático semanal
- ✅ Configurado en Cloud Functions con Cloud Scheduler
- ✅ Retención automática de 8 semanas
- ✅ Backup manual funcionando
- ✅ Documentación completa

---

**Última actualización:** 2025-11-06
**Proyecto:** fullqueso-bot
**Región:** us-central1
