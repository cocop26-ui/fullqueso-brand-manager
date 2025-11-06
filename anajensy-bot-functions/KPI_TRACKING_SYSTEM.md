# 📊 Sistema de Tracking de KPIs - Ana WhatsApp Bot

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Estructura de Datos](#estructura-de-datos)
3. [KPIs Medidos](#kpis-medidos)
4. [Configuración Inicial](#configuración-inicial)
5. [Uso del Sistema](#uso-del-sistema)
6. [Dashboard y Reportes](#dashboard-y-reportes)
7. [Troubleshooting](#troubleshooting)

---

## 📋 Descripción General

Este sistema proporciona tracking completo de KPIs para Ana WhatsApp Bot, incluyendo:

✅ **Logging automático** de cada interacción con el cliente
✅ **Cálculo en tiempo real** de métricas de rendimiento
✅ **Medición de satisfacción** con NPS y CSAT
✅ **Análisis de sentiment** positivo/negativo/neutral
✅ **Dashboard-ready** para Looker Studio / Google Data Studio
✅ **Backup automático** en Cloud Storage si Google Sheets falla

### Flujo de Datos

```
Cliente → WhatsApp → Ana Bot → Firestore + Google Sheets → Dashboard
                         ↓
                    KPI Calculation
                    (NPS, CSAT, etc.)
```

---

## 📊 Estructura de Datos

### Hoja 1: Interacciones (Datos Brutos)

Cada fila representa una interacción cliente-bot:

| Campo | Descripción | Tipo | Ejemplo |
|-------|-------------|------|---------|
| **timestamp** | Fecha y hora exacta | DateTime | 2025-11-06T14:30:45Z |
| **conversation_id** | ID único de conversación | String | 584241476748_1730903445000 |
| **customer_phone** | Número de WhatsApp | String | 584241476748 |
| **customer_name** | Nombre del cliente | String | Pedro |
| **order_number** | Ticket del pedido | String | FQ-CHURROS-1730903445000 |
| **inquiry_type** | Categoría de consulta | Enum | entrega, producto, queja, pedido, otro |
| **customer_message** | Mensaje original | Text | "Los churros estaban deliciosos" |
| **agent_response** | Respuesta de Ana | Text | "¡Qué fino! Dime, ¿estaban calientitos?" |
| **sentiment_detected** | Sentiment del cliente | Enum | positivo, neutral, negativo |
| **resolution_status** | Estado de resolución | Enum | resuelto, en_progreso, redirigido, escalado |
| **resolution_time_minutes** | Tiempo total de resolución | Number | 3.5 |
| **first_response_time_seconds** | Tiempo primera respuesta | Number | 2 |
| **requires_followup** | Necesita seguimiento | Boolean | sí, no |
| **nps_score** | Net Promoter Score | Number (0-10) | 9 |
| **csat_score** | Customer Satisfaction | Number (1-5) | 5 |
| **notes** | Notas adicionales | Text | "Cliente frecuente, muy satisfecho" |

### Hoja 2: KPI_Resumen (Métricas Calculadas)

Fórmulas automáticas que calculan KPIs en tiempo real:

| KPI | Fórmula Google Sheets | Meta | Estado |
|-----|----------------------|------|--------|
| **NPS** | `=(COUNTIF(Interacciones!N:N,">=9")-COUNTIF(Interacciones!N:N,"<=6"))/COUNTA(Interacciones!N:N)*100` | > 50 | ✅/❌ |
| **CSAT** | `=COUNTIFS(Interacciones!O:O,">=4")/COUNTA(Interacciones!O:O)*100` | > 80% | ✅/⚠️ |
| **Primera Respuesta** | `=AVERAGE(Interacciones!L:L)` | < 30 seg | ✅/❌ |
| **Tiempo Resolución** | `=AVERAGE(Interacciones!K:K)` | < 5 min | ✅/⚠️ |
| **Tasa Resolución** | `=COUNTIF(Interacciones!J:J,"resuelto")/COUNTA(Interacciones!J:J)*100` | > 80% | ✅/❌ |
| **Tasa Respuesta** | `=COUNTA(Interacciones!N:N)/COUNTA(Interacciones!B:B)*100` | > 30% | ✅/⚠️ |

### Hoja 3: Dashboards (Instrucciones)

Contiene instrucciones para conectar a Looker Studio y crear visualizaciones.

---

## 📈 KPIs Medidos

### 1. NPS (Net Promoter Score)

**Qué mide:** Probabilidad de que el cliente recomiende Full Queso

**Cómo se calcula:**
```
NPS = (% Promotores - % Detractores) × 100

Promotores: Score 9-10
Pasivos: Score 7-8
Detractores: Score 0-6
```

**Pregunta en Ana:**
> "Del 0 al 10, ¿qué tan probable es que recomiendes Full Queso a un amigo o familiar?"

**Interpretación:**
- **NPS > 50:** Excelente 🟢
- **NPS 0-50:** Bueno 🟡
- **NPS < 0:** Crítico 🔴

**Cuándo se pregunta:**
- Después de completar la encuesta post-venta (Mensaje 4)
- Solo a clientes que completaron conversación satisfactoriamente

---

### 2. CSAT (Customer Satisfaction Score)

**Qué mide:** Satisfacción inmediata con la atención recibida

**Cómo se calcula:**
```
CSAT = (Respuestas 4-5 estrellas / Total respuestas) × 100
```

**Pregunta en Ana:**
> "¿Qué tan satisfecho quedaste con la atención recibida?
> Responde con el número de estrellas (1-5):
> 1⭐ | 2⭐⭐ | 3⭐⭐⭐ | 4⭐⭐⭐⭐ | 5⭐⭐⭐⭐⭐"

**Interpretación:**
- **CSAT > 80%:** Excelente 🟢
- **CSAT 60-80%:** Bueno 🟡
- **CSAT < 60%:** Necesita mejora 🔴

**Cuándo se pregunta:**
- Inmediatamente después de resolver la consulta
- Antes del NPS

---

### 3. Tiempo de Primera Respuesta

**Qué mide:** Velocidad de respuesta del bot

**Meta:** < 30 segundos

**Cómo se mide:**
- Timestamp del mensaje del cliente
- Timestamp de la respuesta de Ana
- Diferencia en segundos

**Nota:** Ana generalmente responde en ~2-5 segundos (procesamiento Claude AI)

---

### 4. Tiempo de Resolución

**Qué mide:** Tiempo total para completar la interacción

**Meta:** < 5 minutos

**Cómo se mide:**
- Timestamp del primer mensaje
- Timestamp del último mensaje (cuando se marca como "resuelto")
- Diferencia en minutos

**Factores que afectan:**
- Complejidad de la consulta
- Velocidad de respuesta del cliente
- Necesidad de información adicional

---

### 5. Tasa de Resolución sin Escalado

**Qué mide:** % de consultas resueltas por Ana sin intervención humana

**Meta:** > 80%

**Estados posibles:**
- **resuelto:** Ana completó la atención exitosamente
- **en_progreso:** Conversación activa
- **redirigido:** Cliente enviado a canal apropiado (fullqueso.com, +584241476748)
- **escalado_a_humano:** Requiere atención humana

---

### 6. Tasa de Respuesta a Encuestas

**Qué mide:** % de clientes que completan NPS/CSAT

**Meta:** > 30%

**Cómo mejorar:**
- Hacer preguntas en momento oportuno
- Usar lenguaje claro y sencillo
- Ofrecer incentivo (ej: "participa en sorteo")

---

## 🚀 Configuración Inicial

### Paso 1: Crear Google Sheet

```bash
1. Ve a: https://sheets.google.com
2. Crea una hoja nueva: "Ana WhatsApp Bot - KPI Tracking"
3. Copia el ID de la URL:
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
```

### Paso 2: Compartir con Service Account

```
1. En Google Sheet, clic en "Compartir"
2. Agregar email: fullqueso-bot@appspot.gserviceaccount.com
3. Dar permisos: "Editor"
4. Enviar invitación
```

### Paso 3: Configurar Spreadsheet ID

```bash
# Método 1: Variable de entorno
export SHEETS_SPREADSHEET_ID="tu_spreadsheet_id_aqui"

# Método 2: Firebase Functions Config
firebase functions:config:set sheets.spreadsheet_id="tu_spreadsheet_id_aqui"

# Método 3: En el código (setup-sheets.js línea 21)
const SPREADSHEET_ID = "tu_spreadsheet_id_aqui";
```

### Paso 4: Ejecutar Setup

```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node setup-sheets.js
```

**Este script va a:**
1. ✅ Crear las 3 hojas (Interacciones, KPI_Resumen, Dashboards)
2. ✅ Configurar headers con formato
3. ✅ Agregar fórmulas de KPI
4. ✅ Establecer validaciones y formato
5. ✅ Crear instrucciones para dashboard

### Paso 5: Desplegar Functions

```bash
firebase deploy --only functions:whatsappWebhook
```

---

## 💻 Uso del Sistema

### Logging Automático

Cada vez que un cliente interactúa con Ana, se registra automáticamente:

```javascript
// En index.js, línea ~646
await sheetsLogger.logInteraction({
  conversationId: conversationId,
  customerPhone: clientPhone,
  customerName: clienteNombre,
  orderNumber: pedidoReciente?.ticket || '',
  inquiryType: inquiryType,
  customerMessage: messageBody,
  agentResponse: mensajeAna,
  sentimentDetected: sentiment,
  resolutionStatus: status,
  resolutionTimeMinutes: resolutionTime,
  firstResponseTimeSeconds: 2,
  requiresFollowup: 'no',
  npsScore: null,
  csatScore: null,
  notes: observations,
});
```

### Actualización de NPS/CSAT

Cuando el cliente responde a encuestas:

```javascript
// Detectar respuesta NPS (0-10)
if (messageBody.match(/^[0-9]|10$/)) {
  const npsScore = parseInt(messageBody);
  await sheetsLogger.logNPSScore(conversationId, npsScore);
}

// Detectar respuesta CSAT (1-5)
if (messageBody.match(/^[1-5]$/)) {
  const csatScore = parseInt(messageBody);
  await sheetsLogger.logCSATScore(conversationId, csatScore);
}
```

### Backup Automático

Si Google Sheets API falla, los datos se guardan automáticamente en Cloud Storage:

```
gs://fullqueso-bot.appspot.com/sheets-backup/YYYY-MM-DD-interactions.jsonl
```

Formato: JSON Lines (un objeto JSON por línea)

---

## 📊 Dashboard y Reportes

### Conectar a Looker Studio

1. **Abrir Looker Studio:**
   ```
   https://lookerstudio.google.com
   ```

2. **Crear nuevo informe:**
   - Click "Crear" → "Informe"

3. **Conectar fuente de datos:**
   - Buscar "Google Sheets"
   - Seleccionar tu spreadsheet
   - Elegir hoja: "Interacciones"

4. **Agregar segunda fuente:**
   - Agregar "KPI_Resumen" para métricas principales

### Visualizaciones Sugeridas

#### Panel Principal

```
┌─────────────────────────────────────────────────────┐
│  NPS: 67    CSAT: 85%    Resolución: 92%           │
│  ⬆ +5      ⬆ +3%        ⬆ +4%                      │
└─────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌─────────────────────────┐
│  NPS Trend (30 días) │  │  CSAT por Tipo Consulta │
│  [Gráfico de línea]  │  │  [Gráfico de barras]    │
└──────────────────────┘  └─────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Distribución de Consultas (inquiry_type)          │
│  [Gráfico de dona]                                 │
│  Entrega: 35% | Producto: 25% | Queja: 10%        │
└────────────────────────────────────────────────────┘
```

#### Gráficos Recomendados

1. **Scorecard**: NPS, CSAT, Tasa Resolución (números grandes con indicador ⬆⬇)

2. **Time Series**: NPS y CSAT por semana/mes

3. **Bar Chart**: Distribución por `inquiry_type`

4. **Heatmap**: Horas pico de consultas (día × hora)

5. **Table**: Últimas 10 interacciones con sentiment y status

6. **Gauge Chart**: KPIs vs metas (circular progress)

7. **Scatter Plot**: Resolution time vs sentiment

### Filtros Recomendados

```
- Rango de fechas (timestamp)
- Tipo de consulta (inquiry_type)
- Sentiment (sentiment_detected)
- Estado (resolution_status)
- Cliente (customer_phone/name)
```

### Queries SQL para BigQuery (Opcional)

Si migras a BigQuery:

```sql
-- NPS calculation
SELECT
  (COUNTIF(nps_score >= 9) - COUNTIF(nps_score <= 6)) / COUNT(nps_score) * 100 AS nps
FROM `fullqueso-bot.kpi_tracking.interactions`
WHERE nps_score IS NOT NULL;

-- CSAT by inquiry type
SELECT
  inquiry_type,
  COUNTIF(csat_score >= 4) / COUNT(csat_score) * 100 AS csat_percentage
FROM `fullqueso-bot.kpi_tracking.interactions`
WHERE csat_score IS NOT NULL
GROUP BY inquiry_type
ORDER BY csat_percentage DESC;

-- Peak hours
SELECT
  EXTRACT(HOUR FROM timestamp) AS hour,
  COUNT(*) AS interactions
FROM `fullqueso-bot.kpi_tracking.interactions`
GROUP BY hour
ORDER BY hour;
```

---

## 🔧 Troubleshooting

### Error: "Sheets API not available"

**Causa:** Cliente de Google Sheets no se inicializó correctamente

**Solución:**
```bash
# 1. Verificar service account credentials
ls /Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-*.json

# 2. Verificar SPREADSHEET_ID configurado
firebase functions:config:get

# 3. Re-deploy functions
firebase deploy --only functions:whatsappWebhook
```

### Error: "SPREADSHEET_ID not configured"

**Causa:** Variable de entorno no establecida

**Solución:**
```bash
# Configurar en Firebase
firebase functions:config:set sheets.spreadsheet_id="YOUR_ID"

# O exportar localmente para testing
export SHEETS_SPREADSHEET_ID="YOUR_ID"
```

### Error: "Permission denied"

**Causa:** Service account no tiene acceso al Sheet

**Solución:**
1. Abrir Google Sheet
2. Click "Compartir"
3. Agregar: `fullqueso-bot@appspot.gserviceaccount.com`
4. Dar permisos: "Editor"

### Datos no aparecen en Sheet

**Causa 1:** Logging falló silenciosamente

**Verificar backup:**
```bash
gsutil ls gs://fullqueso-bot.appspot.com/sheets-backup/
gsutil cat gs://fullqueso-bot.appspot.com/sheets-backup/2025-11-06-interactions.jsonl
```

**Causa 2:** Rate limit de Google Sheets API

**Solución:** Implementar retry logic o batch writes

### KPI Fórmulas muestran #REF!

**Causa:** Referencias a columnas incorrectas

**Solución:**
1. Verificar que headers estén en fila 1
2. Verificar nombres de columnas exactos
3. Re-ejecutar `setup-sheets.js`

---

## 📝 Mantenimiento

### Limpieza de Datos

**Anonymizar datos antiguos (GDPR):**
```javascript
// Después de 90 días, reemplazar customer_phone con hash
const hash = crypto.createHash('sha256')
  .update(customerPhone)
  .digest('hex')
  .substring(0, 10);
```

### Backup Periódico

```bash
# Exportar datos a CSV (manual)
# En Google Sheets: Archivo → Descargar → CSV

# O programar backup automático con Apps Script
```

### Auditoría de Calidad

Revisar mensualmente:
- ✅ Consistency de datos
- ✅ KPIs fuera de rangos esperados
- ✅ Conversaciones marcadas como "escalado"
- ✅ Sentiment muy negativo

---

## 🎯 Próximos Pasos

### Mejoras Sugeridas

1. **Implementar NPS/CSAT prompts en Ana**
   - Agregar preguntas después de resolver
   - Detectar respuestas numéricas
   - Actualizar scores en tiempo real

2. **Alertas Automáticas**
   - Email cuando NPS < 30
   - Slack notification para sentiment negativo
   - SMS para conversaciones sin resolver > 30 min

3. **A/B Testing**
   - Probar diferentes textos de encuesta
   - Medir impacto en response rate
   - Optimizar timing de preguntas

4. **ML Predictions**
   - Predecir churn basado en sentiment
   - Identificar clientes en riesgo
   - Sugerir acciones proactivas

5. **Integración con CRM**
   - Sync datos con HubSpot/Salesforce
   - Enriquecer perfiles de cliente
   - Trigger workflows automáticos

---

## 📞 Soporte

**Documentación relacionada:**
- [README.md](README.md) - Guía general del sistema
- [TWO_WAY_COMMUNICATION.md](TWO_WAY_COMMUNICATION.md) - Sistema de conversaciones
- [BACKUP_GUIDE.md](BACKUP_GUIDE.md) - Backups de Firestore

**Para problemas:**
1. Revisar logs: `firebase functions:log --only whatsappWebhook`
2. Verificar backup files en Cloud Storage
3. Consultar este documento

---

**Última actualización:** 2025-11-06
**Versión:** 1.0
**Proyecto:** fullqueso-bot
**Autor:** Full Queso Tech Team
