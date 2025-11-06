# 🚀 Guía Rápida: Activar Sistema de KPIs

## ⏱️ Tiempo estimado: 10 minutos

Esta guía te llevará paso a paso para activar el sistema completo de KPIs y analytics.

---

## 📋 Paso 1: Crear Google Sheet (2 minutos)

### 1.1 Crear la hoja

1. Abre tu navegador y ve a: **https://sheets.google.com**

2. Click en el botón **"+ Nuevo"** (esquina superior izquierda)

3. Nombra la hoja: **"Ana WhatsApp Bot - KPI Tracking"**

### 1.2 Obtener el Spreadsheet ID

4. Mira la URL de tu navegador:
   ```
   https://docs.google.com/spreadsheets/d/1AbC123dEfGhIjKlMnOpQrStUvWxYz/edit
                                         ↑________________________↑
                                         Este es tu SPREADSHEET_ID
   ```

5. **Copia el ID** (la parte entre `/d/` y `/edit`)
   - Ejemplo: `1AbC123dEfGhIjKlMnOpQrStUvWxYz`

6. **Guárdalo** en un lugar seguro (lo necesitarás en el siguiente paso)

---

## 🔐 Paso 2: Compartir con Service Account (1 minuto)

### 2.1 Compartir la hoja

1. En tu Google Sheet, click en el botón **"Compartir"** (esquina superior derecha)

2. En el campo "Agregar personas y grupos", pega este email:
   ```
   fullqueso-bot@appspot.gserviceaccount.com
   ```

3. En el menú desplegable, selecciona: **"Editor"**

4. **IMPORTANTE:** Desmarca la casilla "Notificar a las personas"

5. Click en **"Compartir"** o **"Enviar"**

✅ **Verificación:** Deberías ver el email del service account en la lista de personas con acceso.

---

## ⚙️ Paso 3: Configurar Spreadsheet ID en Firebase (2 minutos)

### 3.1 Abrir Terminal

Abre tu terminal en el directorio del proyecto:

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions
```

### 3.2 Configurar el ID

**Opción A: Usando Firebase CLI (Recomendado)**

```bash
firebase functions:config:set sheets.spreadsheet_id="TU_SPREADSHEET_ID_AQUI"
```

Reemplaza `TU_SPREADSHEET_ID_AQUI` con el ID que copiaste en el Paso 1.

**Ejemplo:**
```bash
firebase functions:config:set sheets.spreadsheet_id="1AbC123dEfGhIjKlMnOpQrStUvWxYz"
```

**Opción B: Editar directamente en el código**

Si prefieres no usar Firebase config:

```bash
# Editar functions/sheets-logger.js línea 11
nano functions/sheets-logger.js

# Cambiar:
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID || '';

# Por:
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID || 'TU_ID_AQUI';
```

### 3.3 Verificar configuración

```bash
firebase functions:config:get
```

Deberías ver algo como:
```json
{
  "sheets": {
    "spreadsheet_id": "1AbC123dEfGhIjKlMnOpQrStUvWxYz"
  }
}
```

---

## 🏗️ Paso 4: Ejecutar Script de Setup (2 minutos)

### 4.1 Editar el script con tu ID

```bash
cd functions
nano setup-sheets.js
```

### 4.2 Encontrar la línea 21

Busca esta línea:
```javascript
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID || 'PASTE_YOUR_SPREADSHEET_ID_HERE';
```

### 4.3 Reemplazar con tu ID

Cambia por:
```javascript
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID || '1AbC123dEfGhIjKlMnOpQrStUvWxYz';
```

(Usa tu propio ID, no este ejemplo)

### 4.4 Guardar y cerrar

- En nano: `Ctrl + X`, luego `Y`, luego `Enter`

### 4.5 Ejecutar el setup

```bash
GCLOUD_PROJECT=fullqueso-bot node setup-sheets.js
```

### 4.6 Salida esperada

Deberías ver algo como:

```
╔══════════════════════════════════════════════════════════════╗
║         Google Sheets KPI Tracker Setup                     ║
╚══════════════════════════════════════════════════════════════╝

📊 Setting up spreadsheet: 1AbC123dEfGhIjKlMnOpQrStUvWxYz

📄 Step 1: Creating sheet tabs...
  ✓ Created 3 sheet tabs

📋 Step 2: Setting up Interacciones sheet...
  ✓ Headers created and formatted

📊 Step 3: Setting up KPI Summary sheet...
  ✓ KPI formulas and formatting applied

📈 Step 4: Setting up Dashboard sheet...
  ✓ Dashboard instructions added

🔐 Step 5: Configuring permissions...
  ⚠️  Manual step required:
  Share the Google Sheet with the service account email:
  fullqueso-bot@appspot.gserviceaccount.com
  Give it "Editor" permissions

╔══════════════════════════════════════════════════════════════╗
║                    Setup Completed!                          ║
╚══════════════════════════════════════════════════════════════╝

✅ Google Sheet is ready for data logging
```

### 4.7 Verificar en Google Sheets

1. Regresa a tu Google Sheet
2. Deberías ver **3 pestañas** en la parte inferior:
   - `Interacciones`
   - `KPI_Resumen`
   - `Dashboards`

3. Click en cada pestaña para verificar que tienen contenido

✅ **Interacciones:** Debería tener 16 columnas con headers en azul
✅ **KPI_Resumen:** Debería tener 6 filas de KPIs con fórmulas
✅ **Dashboards:** Debería tener instrucciones de uso

---

## 🚀 Paso 5: Deploy a Producción (2 minutos)

### 5.1 Deploy de las funciones

```bash
cd ..  # Volver al directorio raíz
firebase deploy --only functions:whatsappWebhook
```

### 5.2 Esperar deployment

Esto tomará 1-2 minutos. Verás:

```
=== Deploying to 'fullqueso-bot'...

i  deploying functions
...
✔  functions[whatsappWebhook(us-central1)] Successful update operation.

✔  Deploy complete!
```

### 5.3 Verificar que está activo

```bash
firebase functions:list | grep whatsappWebhook
```

Deberías ver:
```
whatsappWebhook    v2    https    us-central1    256    nodejs22
```

✅ **Deployment exitoso!**

---

## 🧪 Paso 6: Probar el Sistema (3 minutos)

### 6.1 Crear orden de prueba

```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node create-order-churros.js
```

Salida esperada:
```
Creating churros order for customer service test...

📦 Order Details:
  Customer: Pedro
  Phone: 584241476748
  Product: 15 Churros Choco Arequipe
  Type: delivery
  Status: ENTREGADO

✅ Order created successfully!
```

### 6.2 Esperar mensaje de Ana (1 minuto)

Ana enviará un mensaje automáticamente al número `+584241476748` en aproximadamente 1 minuto.

### 6.3 Responder al mensaje

Cuando recibas el mensaje de Ana, responde algo como:

```
"Los churros estaban deliciosos y calientes!"
```

### 6.4 Verificar en Google Sheets

1. Regresa a tu Google Sheet
2. Click en la pestaña **"Interacciones"**
3. Deberías ver **una nueva fila** con:
   - Timestamp
   - Tu número de teléfono
   - Tu mensaje
   - La respuesta de Ana
   - Sentiment detectado
   - Otros datos

### 6.5 Verificar KPIs

1. Click en la pestaña **"KPI_Resumen"**
2. En la columna **"Valor Actual"** (columna C) deberías ver valores calculados automáticamente

✅ **Sistema funcionando correctamente!**

---

## 📊 Paso 7: Crear Dashboard (Opcional, 10 minutos)

### 7.1 Abrir Looker Studio

1. Ve a: **https://lookerstudio.google.com**
2. Click en **"Crear"** → **"Informe"**

### 7.2 Conectar fuente de datos

1. Busca **"Google Sheets"** en conectores
2. Selecciona tu spreadsheet: **"Ana WhatsApp Bot - KPI Tracking"**
3. Selecciona la hoja: **"Interacciones"**
4. Click en **"Agregar"**

### 7.3 Crear visualizaciones básicas

**Scorecard para NPS:**
1. Agregar → Scorecard
2. Métrica: `nps_score`
3. Agregación: Promedio

**Gráfico de línea para tendencia:**
1. Agregar → Gráfico de series temporales
2. Dimensión de fecha: `timestamp`
3. Métrica: `nps_score`

**Tabla de últimas interacciones:**
1. Agregar → Tabla
2. Dimensiones: `customer_name`, `inquiry_type`, `sentiment_detected`
3. Ordenar por: `timestamp` descendente
4. Filas: 10

### 7.4 Guardar dashboard

1. Click en **"Compartir"** en la esquina superior derecha
2. Configura permisos según necesites
3. Guarda el enlace del dashboard

---

## ✅ Verificación Final

### Checklist de implementación

```
□ Google Sheet creado con 3 pestañas
□ Service account tiene acceso como Editor
□ SPREADSHEET_ID configurado en Firebase
□ Setup script ejecutado exitosamente
□ Functions desplegadas a producción
□ Orden de prueba creada
□ Mensaje de Ana recibido
□ Respuesta enviada
□ Datos aparecen en Google Sheet
□ KPIs se calculan automáticamente
□ (Opcional) Dashboard creado en Looker Studio
```

---

## 🎉 ¡Listo! Sistema Operativo

Tu sistema de KPIs está **completamente funcional**.

### Lo que está pasando ahora:

1. ✅ Cada vez que un cliente interactúa con Ana, se registra automáticamente
2. ✅ Sentiment analysis se ejecuta en cada mensaje
3. ✅ KPIs se calculan en tiempo real
4. ✅ Datos están listos para dashboard
5. ✅ Si Google Sheets falla, backup automático en Cloud Storage

### Qué esperar:

- **Inmediato:** Cada interacción se registra en segundos
- **En 24 horas:** Verás suficientes datos para tendencias
- **En 1 semana:** KPIs estables y comparables
- **En 1 mes:** Insights valiosos sobre satisfacción del cliente

---

## 📈 Monitoreando el Sistema

### Ver logs en tiempo real

```bash
firebase functions:log --only whatsappWebhook --follow
```

Busca líneas como:
```
✓ Interaction logged to Google Sheets
```

### Verificar backup (si Sheets falla)

```bash
gsutil ls gs://fullqueso-bot.appspot.com/sheets-backup/
```

### Ver estadísticas

En Google Sheets, pestaña **KPI_Resumen**, verás:

```
╔════════════════════════════════════════════════════════╗
║  KPI                          Valor    Meta    Estado ║
╠════════════════════════════════════════════════════════╣
║  NPS                          --       > 50    ⏳     ║
║  CSAT                         --       > 80%   ⏳     ║
║  Primera Respuesta            2.1s     < 30s   ✅     ║
║  Tiempo Resolución            --       < 5min  ⏳     ║
║  Tasa Resolución              --       > 80%   ⏳     ║
║  Tasa Respuesta               --       > 30%   ⏳     ║
╚════════════════════════════════════════════════════════╝

⏳ = Esperando más datos
✅ = Meta alcanzada
⚠️ = Por debajo de meta
❌ = Muy por debajo de meta
```

---

## 🆘 Troubleshooting

### "Permission denied" en el setup

**Problema:** El service account no tiene acceso

**Solución:**
1. Ve a Google Sheet
2. Click "Compartir"
3. Verifica que `fullqueso-bot@appspot.gserviceaccount.com` está en la lista
4. Debe tener permisos de "Editor"

### "SPREADSHEET_ID not configured"

**Problema:** El ID no está guardado correctamente

**Solución:**
```bash
# Verificar configuración actual
firebase functions:config:get

# Si no aparece, configurar de nuevo
firebase functions:config:set sheets.spreadsheet_id="TU_ID"

# Deploy de nuevo
firebase deploy --only functions:whatsappWebhook
```

### No aparecen datos en el Sheet

**Problema:** Logging falló silenciosamente

**Solución 1:** Verificar logs
```bash
firebase functions:log --only whatsappWebhook | grep -i "sheets"
```

**Solución 2:** Verificar backup
```bash
gsutil cat gs://fullqueso-bot.appspot.com/sheets-backup/$(date +%Y-%m-%d)-interactions.jsonl
```

### Fórmulas muestran #REF!

**Problema:** Referencias a columnas incorrectas

**Solución:**
```bash
# Re-ejecutar setup
cd functions
GCLOUD_PROJECT=fullqueso-bot node setup-sheets.js
```

---

## 📞 Necesitas Ayuda?

### Documentación detallada

- **Guía completa:** [KPI_TRACKING_SYSTEM.md](KPI_TRACKING_SYSTEM.md)
- **README general:** [README.md](README.md)
- **Two-way communication:** [TWO_WAY_COMMUNICATION.md](TWO_WAY_COMMUNICATION.md)

### Comandos útiles

```bash
# Ver todas las functions desplegadas
firebase functions:list

# Ver configuración actual
firebase functions:config:get

# Ver logs en tiempo real
firebase functions:log --follow

# Probar conexión a Sheets
cd functions && node -e "const s = require('./sheets-logger'); console.log(s.SPREADSHEET_ID);"
```

---

## 🎯 Próximos Pasos Recomendados

### Corto plazo (esta semana)

1. ✅ Monitorear que datos se registran correctamente
2. ✅ Crear dashboard básico en Looker Studio
3. ✅ Configurar alertas para sentiment negativo

### Mediano plazo (este mes)

4. ✅ Implementar preguntas NPS/CSAT en Ana
5. ✅ Analizar tendencias semanales
6. ✅ Identificar horarios pico de consultas

### Largo plazo (próximos 3 meses)

7. ✅ A/B testing de mensajes
8. ✅ Integración con CRM
9. ✅ Predicción de churn con ML

---

**¡Tu sistema de KPIs está listo para darte insights valiosos sobre la satisfacción de tus clientes!** 📊✨

**Última actualización:** 2025-11-06
**Tiempo total de setup:** ~10 minutos
**Dificultad:** ⭐⭐☆☆☆ (Fácil)
