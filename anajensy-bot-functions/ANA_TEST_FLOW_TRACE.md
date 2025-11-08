# 🤖 Ana Test Flow - Complete Execution Trace

## Test Order Details

**Generated:** 2025-11-08T16:57:47.648Z
**Ticket:** FQ-TEST-1762621067648
**Customer:** Pedro Padilla
**Phone:** 584241476748 (+584241476748)
**Product:** Churros Choco Arequipe x15
**Price:** $25
**Status:** ENTREGADO
**Seguimiento enviado:** false (ready to be processed)

**Test order JSON location:** `/tmp/pedro-test-order-1762621067648.json`

---

## 📊 Complete Flow: What Ana Will Do

### Phase 1: Order Detection (procesarSeguimientos)

**Trigger:** Scheduled function runs every 1 minute

**Function:** `functions/index.js:90-118` (procesarSeguimientos)

#### Step 1.1: Query for Unprocessed Orders

```javascript
db.collection("pedidos_bot")
  .where("estado", "==", "ENTREGADO")
  .where("seguimiento_enviado", "==", false)
  .where("fecha_entregado", "<=", now)
  .get()
```

**Result:** Finds Pedro's order (FQ-TEST-1762621067648)

**Console log:**
```
🔍 Buscando pedidos... timestamp límite: 2025-11-08T16:57:47.648Z
Found 1 pedidos to process
Processing pedido: FQ-TEST-1762621067648
```

---

### Phase 2: Customer Lookup & Context Building

**Function:** `functions/index.js:120-216` (enviarSeguimiento)

#### Step 2.1: Get Customer Profile

```javascript
db.collection("clientes_bot")
  .doc("584241476748")
  .get()
```

**Result:** Likely doesn't exist (first test)

**Fallback data:**
```javascript
{
  nombre: "Pedro Padilla",
  total_pedidos: 1
}
```

#### Step 2.2: Build Product String

```javascript
productosStr = "Churros Choco Arequipe x15"
```

#### Step 2.3: Create Context for Claude

```javascript
contextoCliente = `Cliente: Pedro Padilla
Pedido recibido: Churros Choco Arequipe x15
Tipo: delivery
ES SU PRIMER PEDIDO

ENCUESTA POST-VENTA: Escribe un mensaje de seguimiento tipo encuesta que pregunte:

1. Sobre el PRODUCTO ESPECÍFICO (menciona "Churros Choco Arequipe x15"):
   - Calidad: ¿Cómo estaban? ¿En buen estado?
   - Temperatura: ¿Llegaron calientes/frescos como esperabas?
   - Sabor: ¿Qué tal el sabor? ¿Como siempre?

2. Sobre el SERVICIO DE DELIVERY:
   - Tiempo: ¿Llegó rápido? ¿Cuánto esperaste?
   - Empaque: ¿Bien empacado y presentable?
   - Repartidor: ¿Fue amable? ¿Todo bien con la entrega?

3. Experiencia general:
   - ¿Es cliente frecuente? ¿Compra seguido?
   - ¿Recomendaría Full Queso?
   - ¿Algo que mejorar?

FORMATO:
- Usa el nombre del cliente
- Menciona el producto EXACTO que recibió
- Pregunta de forma natural, no como cuestionario rígido
- Mantén el tono venezolano cálido de Ana
- MÁXIMO 30-40 PALABRAS (cuenta las palabras antes de responder)
- Haz que se sienta como una conversación amigable, no una encuesta formal
- Sé BREVE y DIRECTO`
```

---

### Phase 3: AI Message Generation

**API Call:** Claude Sonnet 4 (claude-sonnet-4-20250514)

**System prompt:** Full ANAJENSY_PROMPT (lines 20-88)

**Key personality traits:**
- Venezuelan expressions: "Epa", "Chévere", "Qué fino", "Vale"
- Warm, maternal tone
- Expressive and emotional
- 30-40 words maximum

**User prompt:** contextoCliente (from Step 2.3)

**Max tokens:** 150 (enforces brevity)

**Expected AI response example:**
```
"Hola Pedro! ¿Cómo te fueron los Churros Choco Arequipe x15?
Cuéntame, ¿estaban calientitos y crocantes? ¿El delivery fue rápido?
¡Dime qué tal todo!"
```

**Note:** This message will NOT be used! The template will be used instead.

---

### Phase 4: Meta WhatsApp Template Message

**Function:** `functions/index.js:218-295` (enviarWhatsApp)

#### Step 4.1: Phone Number Formatting

```javascript
telefono = "584241476748"
// Remove non-digits: "584241476748"
// Check if international: matches /^[1-9]\d{10,14}$/
// Result: Already international format ✅
telefonoInternacional = "584241476748"
```

**Console log:**
```
Phone already international: 584241476748
Sending WhatsApp via Meta API to: +584241476748
```

#### Step 4.2: Meta API Request

**Endpoint:** `https://graph.facebook.com/v21.0/805718575964429/messages`

**Method:** POST

**Headers:**
```json
{
  "Authorization": "Bearer EAALluMeKdhEBP0Nc...",
  "Content-Type": "application/json"
}
```

**Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "584241476748",
  "type": "template",
  "template": {
    "name": "anajensy_order_followup",
    "language": {
      "code": "es"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Pedro Padilla"
          },
          {
            "type": "text",
            "text": "Churros Choco Arequipe x15"
          }
        ]
      }
    ]
  }
}
```

**Template rendering:**

Original template:
```
Hola {{1}}! Gracias por tu pedido de {{2}}. ¿Cómo estuvo todo? Cuéntame qué tal te fue.
```

Rendered message:
```
Hola Pedro Padilla! Gracias por tu pedido de Churros Choco Arequipe x15.
¿Cómo estuvo todo? Cuéntame qué tal te fue.
```

**⚠️ CRITICAL:** This requires the template to be APPROVED in Meta Business Manager first!

**Expected Meta response:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "584241476748",
    "wa_id": "584241476748"
  }],
  "messages": [{
    "id": "wamid.HBgNNTg0MjQxNDc2NzQ4FQIAERgSMzNEODk3QTY5RDZDREY3NDZBAA=="
  }]
}
```

**Console logs:**
```
✓ WhatsApp sent successfully via Meta API (Template)!
  - Message ID: wamid.HBgNNTg0MjQxNDc2NzQ4FQIAERgSMzNEODk3QTY5RDZDREY3NDZBAA==
  - To: +584241476748
  - Customer: Pedro Padilla
  - Products: Churros Choco Arequipe x15
  - Template: anajensy_order_followup
```

---

### Phase 5: Database Updates

#### Step 5.1: Save Conversation Record

**Collection:** `conversaciones_bot`

```javascript
{
  cliente_telefono: "584241476748",
  cliente_nombre: "Pedro Padilla",
  pedido_ticket: "FQ-TEST-1762621067648",
  pedido_id: "pedro_test_1762621067648",
  mensaje_ana: "Hola Pedro! ¿Cómo te fueron los Churros...",
  mensaje_cliente: null,
  fecha: Timestamp(2025-11-08T16:58:00Z),
  tipo_interaccion: "seguimiento_post_verificacion",
  sentimiento: "neutral",
  requiere_atencion: false
}
```

#### Step 5.2: Mark Order as Processed

**Collection:** `pedidos_bot`
**Document ID:** (auto-generated)

**Update:**
```javascript
{
  seguimiento_enviado: true,
  seguimiento_fecha: Timestamp(2025-11-08T16:58:00Z)
}
```

**Console log:**
```
✓ Seguimiento enviado a Pedro Padilla
```

---

## 📱 Phase 6: Customer Interaction (Webhook Responses)

**What happens when Pedro replies...**

### Reply 1: Initial Feedback

**Pedro's message:** "Hola Ana! Todo estuvo excelente, gracias"

**Webhook trigger:** `whatsappWebhook` (functions/index.js:341-700)

#### Step 6.1: Parse Incoming Message

**Meta webhook payload:**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "584241476748",
          "id": "wamid.xyz123",
          "text": {
            "body": "Hola Ana! Todo estuvo excelente, gracias"
          }
        }],
        "contacts": [{
          "profile": {
            "name": "Pedro Padilla"
          }
        }]
      }
    }]
  }]
}
```

**Extracted data:**
```javascript
clientPhone = "584241476748"
messageBody = "Hola Ana! Todo estuvo excelente, gracias"
profileName = "Pedro Padilla"
messageSid = "wamid.xyz123"
```

#### Step 6.2: Load Conversation Context

**Queries:**
1. Get customer from `clientes_bot`
2. Get recent orders from `pedidos_bot` (filtered by phone)
3. Get conversation history from `conversaciones_bot`

**Context variables:**
```javascript
clienteNombre = "Pedro Padilla"
pedidoReciente = {
  ticket: "FQ-TEST-1762621067648",
  productos: [{nombre: "Churros Choco Arequipe x15", ...}],
  seguimiento_enviado: true
}
contextoPedido = "\nPedido reciente: Churros Choco Arequipe x15 (FQ-TEST-1762621067648)"
numInteracciones = 1 (only Ana's initial message)
esConversacionPostventa = true
encuestaCompletada = false
```

#### Step 6.3: Determine Scenario

**Scenario:** Active post-sale conversation
**Why:** `esConversacionPostventa = true && !encuestaCompletada && numInteracciones < 3`

**Context sent to Claude:**
```
Cliente: Pedro Padilla
Pedido reciente: Churros Choco Arequipe x15 (FQ-TEST-1762621067648)

Historial de conversación:
Ana: Hola Pedro! Gracias por tu pedido de Churros Choco Arequipe x15. ¿Cómo estuvo todo? Cuéntame qué tal te fue.

Mensaje del cliente: "Hola Ana! Todo estuvo excelente, gracias"

Número de intercambios previos: 1

INSTRUCCIONES CRÍTICAS - SEGUIMIENTO POST-VENTA:

1. SOLO HABLAS DE FULL QUESO (pedidos, productos, delivery)
   - Si preguntan del clima, política, chistes, etc: "Para otros asuntos, escríbenos a atencionalcliente@fullqueso.com, vale"

2. MANEJO DE SITUACIONES:
   - Cliente da feedback → Agradece + SIEMPRE pide email para promociones + menciona fullqueso.com + DESPÍDETE
   - Cliente da email → Confirma recepción + menciona fullqueso.com + DESPÍDETE: "Perfecto, anotado. Recuerda fullqueso.com para tus próximas compras. ¡Un abrazo!"
   ...
```

#### Step 6.4: AI Response Generation

**Claude API call:** claude-sonnet-4-20250514

**Expected response:**
```
"¡Ay qué fino Pedro! Me alegra. ¿Los churros estaban calientitos? ¿Y el choco arequipe en su punto? Cuéntame"
```

#### Step 6.5: Send Response via Meta API (Freeform Text)

**Important:** This is within 24-hour conversation window, so freeform text is allowed!

**Endpoint:** `https://graph.facebook.com/v21.0/805718575964429/messages`

**Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "584241476748",
  "type": "text",
  "text": {
    "body": "¡Ay qué fino Pedro! Me alegra. ¿Los churros estaban calientitos? ¿Y el choco arequipe en su punto? Cuéntame"
  }
}
```

**Console log:**
```
✓ Response sent to customer via Meta API
```

#### Step 6.6: Sentiment Analysis

**Function:** analyzeSentiment (functions/index.js:297-338)

**Input:** "Hola Ana! Todo estuvo excelente, gracias"

**Claude API call for analysis:**

**Expected analysis:**
```json
{
  "producto": "positivo",
  "delivery": "positivo",
  "clienteFrecuente": "desconocido",
  "observaciones": "Cliente satisfecho con todo"
}
```

#### Step 6.7: Save to Database

**Collection:** `conversaciones_bot`
```javascript
{
  cliente_telefono: "584241476748",
  cliente_nombre: "Pedro Padilla",
  mensaje_cliente: "Hola Ana! Todo estuvo excelente, gracias",
  mensaje_ana: "¡Ay qué fino Pedro! Me alegra. ¿Los churros...",
  fecha: Timestamp.now(),
  tipo_interaccion: "respuesta_cliente",
  mensaje_sid: "wamid.xyz123",
  sentimiento_producto: "positivo",
  sentimiento_delivery: "positivo",
  es_cliente_frecuente: "desconocido",
  observaciones: "Cliente satisfecho con todo"
}
```

**Collection:** `encuestas_postventa`
```javascript
{
  // Customer data
  cliente_telefono: "584241476748",
  cliente_nombre: "Pedro Padilla",
  cliente_email: null,

  // Order data
  pedido_ticket: "FQ-TEST-1762621067648",
  pedido_productos: [{nombre: "Churros Choco Arequipe x15", cantidad: 1, precio: 25}],
  pedido_tipo: "delivery",

  // Survey responses
  respuesta_completa: "Hola Ana! Todo estuvo excelente, gracias",
  sentimiento_producto: "positivo",
  sentimiento_delivery: "positivo",
  sentimiento_general: "positivo",
  sugerencias: "Cliente satisfecho con todo",

  // Metadata
  fecha_encuesta: Timestamp.now(),
  encuesta_completada: false,
  numero_intercambios: 1
}
```

---

### Reply 2: Product Feedback

**Pedro's message:** "Sí, llegaron perfectos! El arequipe delicioso y los churros crocantes"

#### Repeat Steps 6.1-6.7 with:

**numInteracciones = 2**

**Context:**
```
Historial de conversación:
Ana: Hola Pedro! Gracias por tu pedido...
Ana: ¡Ay qué fino Pedro! Me alegra...
Cliente: Hola Ana! Todo estuvo excelente, gracias
Cliente: Sí, llegaron perfectos! El arequipe delicioso y los churros crocantes

Número de intercambios previos: 2
```

**Ana's response:**
```
"Perfecto! Me alegra. ¿Me das tu email para enviarte promociones? Recuerda fullqueso.com para tus próximos pedidos. Un abrazo"
```

**Note:** numInteracciones >= 2, so Ana will close the conversation

---

### Reply 3: Email Provided

**Pedro's message:** "pedro@fullqueso.com"

#### Special handling for email detection:

**Detection:** Check if message contains email pattern

**Email extraction:** "pedro@fullqueso.com"

**Ana's response:**
```
"Perfecto, anotado. Recuerda fullqueso.com para tus próximas compras. ¡Un abrazo!"
```

**Database update:**
```javascript
// Update encuestas_postventa
{
  cliente_email: "pedro@fullqueso.com",
  encuesta_completada: true,
  numero_intercambios: 3
}

// Update clientes_bot
{
  nombre: "Pedro Padilla",
  telefono: "584241476748",
  email: "pedro@fullqueso.com",
  total_pedidos: 1,
  ultima_actualizacion: Timestamp.now()
}
```

**Google Sheets export (via sheets-logger.js):**
Exports survey data to Google Sheets for analysis

---

## 🔍 What Gets Logged

### Firebase Functions Logs

**procesarSeguimientos:**
```
🔍 Buscando pedidos... timestamp límite: 2025-11-08T16:58:00.000Z
Found 1 pedidos to process
Processing pedido: FQ-TEST-1762621067648
Phone already international: 584241476748
Sending WhatsApp via Meta API to: +584241476748
✓ WhatsApp sent successfully via Meta API (Template)!
  - Message ID: wamid.xyz...
  - To: +584241476748
  - Customer: Pedro Padilla
  - Products: Churros Choco Arequipe x15
  - Template: anajensy_order_followup
✓ Seguimiento enviado a Pedro Padilla
```

**whatsappWebhook:**
```
📨 Incoming WhatsApp message
Message from: 584241476748
Message: Hola Ana! Todo estuvo excelente, gracias
Scenario detected: Post-sale active
Interactions: 1, Survey completed: false
Generated response: ¡Ay qué fino Pedro! Me alegra...
Sentiment analysis: {"producto":"positivo","delivery":"positivo",...}
✓ Response sent to customer via Meta API
```

---

## 📊 Final Database State

### pedidos_bot
```javascript
{
  ticket: "FQ-TEST-1762621067648",
  cliente_nombre: "Pedro Padilla",
  cliente_telefono: "584241476748",
  estado: "ENTREGADO",
  seguimiento_enviado: true,  // ← Updated
  seguimiento_fecha: Timestamp(2025-11-08T16:58:00Z),  // ← Added
  productos: [{nombre: "Churros Choco Arequipe x15", cantidad: 1, precio: 25}],
  total: 25
}
```

### conversaciones_bot (3 records)
```javascript
[
  // Message 1 - Initial template
  {
    mensaje_ana: "Hola Pedro! Gracias por tu pedido...",
    mensaje_cliente: null,
    tipo_interaccion: "seguimiento_post_verificacion"
  },
  // Message 2 - First reply
  {
    mensaje_cliente: "Hola Ana! Todo estuvo excelente, gracias",
    mensaje_ana: "¡Ay qué fino Pedro! Me alegra...",
    sentimiento_producto: "positivo",
    sentimiento_delivery: "positivo"
  },
  // Message 3 - Email capture
  {
    mensaje_cliente: "pedro@fullqueso.com",
    mensaje_ana: "Perfecto, anotado. Recuerda fullqueso.com...",
    email_capturado: "pedro@fullqueso.com"
  }
]
```

### encuestas_postventa (1 record)
```javascript
{
  cliente_nombre: "Pedro Padilla",
  cliente_telefono: "584241476748",
  cliente_email: "pedro@fullqueso.com",
  pedido_ticket: "FQ-TEST-1762621067648",
  sentimiento_producto: "positivo",
  sentimiento_delivery: "positivo",
  sentimiento_general: "positivo",
  encuesta_completada: true,
  numero_intercambios: 3
}
```

### clientes_bot (1 record)
```javascript
{
  nombre: "Pedro Padilla",
  telefono: "584241476748",
  email: "pedro@fullqueso.com",
  total_pedidos: 1,
  ultima_actualizacion: Timestamp.now()
}
```

---

## ⚠️ Prerequisites for Test

### 1. Meta Template Must Be APPROVED

**Check status:**
```bash
./check-meta-template-status.sh
```

**Required template:**
- Name: `anajensy_order_followup`
- Status: `APPROVED`
- Language: Spanish (es)
- Category: UTILITY

**If not approved:**
- Create via: `./setup-meta-template.sh`
- Or manually at: https://business.facebook.com/wa/manage/message-templates/
- Wait 15 min - 24 hours for approval

### 2. Firebase Secrets Configured

```bash
firebase functions:secrets:list
```

**Required:**
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `ANTHROPIC_API_KEY`

**Configure:**
```bash
./configure-secrets.sh
```

### 3. Functions Deployed

```bash
firebase deploy --only functions
```

### 4. Test Order Added to Firestore

**Manual:** Add the JSON from `/tmp/pedro-test-order-1762621067648.json` to Firestore

**Collection:** `pedidos_bot`

---

## 🚀 Run The Test

```bash
# 1. Add test order to Firestore (manual step)
# Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore/data/~2Fpedidos_bot
# Add document with JSON from /tmp/pedro-test-order-1762621067648.json

# 2. Monitor Ana
firebase functions:log --only procesarSeguimientos --follow

# 3. Wait 1-2 minutes for Ana to process

# 4. Check WhatsApp on +584241476748 for message

# 5. Reply to Ana and watch webhook
firebase functions:log --only whatsappWebhook --follow

# 6. Check Firestore collections to verify data
```

---

## ✅ Success Criteria

1. **Template message sent** to +584241476748 within 2 minutes
2. **Message received** on Pedro's WhatsApp
3. **Conversation flows** naturally through 3 exchanges
4. **Email captured** successfully
5. **Data saved** in all Firestore collections
6. **Survey completed** flag set to `true`
7. **Google Sheets updated** with survey results

---

## 🐛 What Could Go Wrong

### Error: Template not approved
**Symptom:** API error "template_not_found" or "template_status_not_approved"
**Fix:** Wait for template approval, check status with `./check-meta-template-status.sh`

### Error: Invalid phone number
**Symptom:** API error "invalid_phone_number"
**Fix:** Verify phone is in international format without +

### Error: 24-hour window expired
**Symptom:** Cannot send freeform text
**Fix:** Only applies to new conversations; within active conversation window is fine

### Error: Firestore permission denied
**Symptom:** Cannot write to Firestore
**Fix:** Check Firebase security rules

---

This trace shows EXACTLY what Ana will do, line by line, when processing the test order! 🎯
