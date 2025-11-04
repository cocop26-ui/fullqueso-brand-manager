# N8N Workflow Guide - Anajensy Bot Migration

## Overview
This guide will help you replicate the Firebase Cloud Function workflow in n8n. The workflow sends automated follow-up messages to customers after their orders are verified.

---

## Workflow Architecture

```
CRON TRIGGER (every 1 minute)
    ↓
FIRESTORE QUERY (Get verified orders)
    ↓
LOOP (Process each order)
    ↓
    ├─→ FIRESTORE GET (Customer profile)
    ├─→ FUNCTION (Build context)
    ├─→ ANTHROPIC API (Generate message)
    ├─→ FUNCTION (Format phone number)
    ├─→ HTTP REQUEST (Send WhatsApp)
    ├─→ FIRESTORE ADD (Save conversation)
    └─→ FIRESTORE UPDATE (Mark order as sent)
```

---

## Step-by-Step Node Configuration

### NODE 1: Schedule Trigger
**Node Type:** `Schedule Trigger`

**Configuration:**
- **Rule:** `Every`
- **Unit:** `Minute`
- **Every:** `1`
- **Options:**
  - Timezone: `America/Caracas` (optional)

**Purpose:** Runs the workflow every minute to check for new verified orders.

---

### NODE 2: Query Verified Orders
**Node Type:** `Firestore` (requires Firebase/Firestore credential)

**Configuration:**
- **Credential:** Your Firebase Service Account
- **Operation:** `Query Documents`
- **Collection:** `pedidos_bot`
- **Query Type:** `Composite Query`

**Filters (ALL must match):**
1. **Filter 1:**
   - Field Path: `estado`
   - Operator: `==`
   - Value: `VERIFICADO`

2. **Filter 2:**
   - Field Path: `seguimiento_enviado`
   - Operator: `==`
   - Value: `false`

3. **Filter 3:**
   - Field Path: `fecha_verificado`
   - Operator: `<=`
   - Value: `{{ $now.toISO() }}` (current timestamp)

**Options:**
- Return All: `true` (to get all matching documents)

**Output:** Array of order documents

---

### NODE 3: Split Out (Loop Through Orders)
**Node Type:** `Split Out`

**Configuration:**
- **Input:** Connect from Node 2 (Firestore Query)
- **Mode:** `Each Item` (processes one order at a time)

**Purpose:** Takes the array of orders and processes each one individually through the following nodes.

---

### NODE 4: Get Customer Profile
**Node Type:** `Firestore`

**Configuration:**
- **Credential:** Your Firebase Service Account
- **Operation:** `Get Document`
- **Collection:** `clientes_bot`
- **Document ID:** `{{ $json.cliente_telefono }}`

**Options:**
- **If Document Doesn't Exist:** Continue workflow (we'll handle this in next node)

**Purpose:** Fetches customer history and preferences.

---

### NODE 5: Prepare Customer Context
**Node Type:** `Code` or `Function`

**Configuration:**
- **Language:** JavaScript
- **Mode:** Run Once for Each Item

**Code:**
```javascript
// Get order data (from split loop)
const pedido = $input.first().json;

// Get customer data (from previous Firestore node)
const clienteData = $('Get Customer Profile').first().json;

// Build customer object with defaults if not found
const cliente = clienteData ? clienteData : {
  nombre: pedido.cliente_nombre,
  total_pedidos: 1
};

// Build products string
const productosStr = pedido.productos
  .map(p => p.nombre)
  .join(", ");

// Build context message for Claude
const contextoCliente = `Cliente: ${cliente.nombre}
Pedido verificado hace 2 minutos: ${productosStr}
Tipo: ${pedido.tipo}
${cliente.total_pedidos === 1 ? "ES SU PRIMER PEDIDO" : `Total pedidos: ${cliente.total_pedidos}`}

Escribe mensaje de seguimiento para confirmar que el pedido está OK.`;

// Return all data needed for next steps
return {
  pedidoId: pedido._id,
  pedido: pedido,
  cliente: cliente,
  contextoCliente: contextoCliente
};
```

**Purpose:** Prepares the context message that will be sent to Claude AI.

---

### NODE 6: Generate Message with Claude
**Node Type:** `HTTP Request`

**Configuration:**
- **Method:** `POST`
- **URL:** `https://api.anthropic.com/v1/messages`

**Authentication:**
- **Type:** `Generic Credential Type`
- **Header Auth:**
  - Name: `x-api-key`
  - Value: `{{ $credentials.ANTHROPIC_API_KEY }}`

**Headers:**
- `anthropic-version: 2023-06-01`
- `content-type: application/json`

**Body (JSON):**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 300,
  "system": "{{ $('Node: Ana Personality Prompt').first().json.prompt }}",
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.contextoCliente }}"
    }
  ]
}
```

**Options:**
- Response Format: `JSON`
- Timeout: `30000` ms

**Purpose:** Calls Anthropic Claude API to generate personalized message.

**Output Path:** The generated message will be at `{{ $json.content[0].text }}`

---

### NODE 7: Format Phone Number
**Node Type:** `Code` or `Function`

**Configuration:**
- **Language:** JavaScript

**Code:**
```javascript
const telefono = $json.pedido.cliente_telefono;
let telefonoInternacional;

// Check if number already has country code (starts with digits like 1, 58, etc)
if (/^[1-9]\d{10,14}$/.test(telefono)) {
  // Already has country code (e.g., 15556406840, 584241476758)
  telefonoInternacional = telefono;
} else {
  // Venezuelan number without country code (e.g., 04241476758)
  // Remove leading 0 and add Venezuela country code (58)
  const telefonoLimpio = telefono.replace(/^0/, "");
  telefonoInternacional = `58${telefonoLimpio}`;
}

// Get the generated message from Claude
const mensajeAna = $('Generate Message with Claude').first().json.content[0].text;

return {
  ...($json),
  telefonoInternacional: telefonoInternacional,
  mensajeAna: mensajeAna
};
```

**Purpose:** Formats Venezuelan phone numbers to international format (58XXXXXXXXXX) required by WhatsApp API.

---

### NODE 8: Send WhatsApp Message
**Node Type:** `HTTP Request`

**Configuration:**
- **Method:** `POST`
- **URL:** `https://graph.facebook.com/v21.0/{{ $credentials.WHATSAPP_PHONE_NUMBER_ID }}/messages`

**Authentication:**
- **Type:** `Generic Credential Type`
- **Header Auth:**
  - Name: `Authorization`
  - Value: `Bearer {{ $credentials.WHATSAPP_ACCESS_TOKEN }}`

**Headers:**
- `Content-Type: application/json`

**Body (JSON):**
```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $json.telefonoInternacional }}",
  "type": "text",
  "text": {
    "body": "{{ $json.mensajeAna }}"
  }
}
```

**Options:**
- Response Format: `JSON`
- Timeout: `15000` ms

**Error Handling:**
- Continue On Fail: `true` (so one failed message doesn't stop the whole batch)
- Retry on Fail: `2` times

**Purpose:** Sends the personalized message via Meta WhatsApp Cloud API.

**Success Response:** Will contain `messages[0].id` (WhatsApp message ID)

---

### NODE 9: Save Conversation Record
**Node Type:** `Firestore`

**Configuration:**
- **Credential:** Your Firebase Service Account
- **Operation:** `Create Document`
- **Collection:** `conversaciones_bot`
- **Auto-generate ID:** `true`

**Fields to Set:**
```json
{
  "cliente_telefono": "{{ $json.pedido.cliente_telefono }}",
  "cliente_nombre": "{{ $json.pedido.cliente_nombre }}",
  "pedido_ticket": "{{ $json.pedido.ticket }}",
  "pedido_id": "{{ $json.pedido.pedido_id }}",
  "mensaje_ana": "{{ $json.mensajeAna }}",
  "mensaje_cliente": null,
  "fecha": "{{ $now.toISO() }}",
  "tipo_interaccion": "seguimiento_post_verificacion",
  "sentimiento": "neutral",
  "requiere_atencion": false
}
```

**Purpose:** Stores the conversation for tracking and analytics.

---

### NODE 10: Update Order Status
**Node Type:** `Firestore`

**Configuration:**
- **Credential:** Your Firebase Service Account
- **Operation:** `Update Document`
- **Collection:** `pedidos_bot`
- **Document ID:** `{{ $json.pedidoId }}`

**Fields to Update:**
```json
{
  "seguimiento_enviado": true,
  "seguimiento_fecha": "{{ $now.toISO() }}"
}
```

**Purpose:** Marks the order as processed so it won't be picked up again in future runs.

---

### NODE 11: (Optional) Set Ana Personality Prompt
**Node Type:** `Set` or `Code`

**Configuration:**
Place this node before NODE 6 (Generate Message) to store the personality prompt.

**Fields:**
```json
{
  "prompt": "Eres Anajensy (Ana), operadora de delivery de Full Queso en Caracas, Venezuela. Eres una madre venezolana cálida, empática y servicial.\n\nPERSONALIDAD:\n- Cálida y maternal\n- Empática y atenta\n- Profesional pero cercana\n- Usas español venezolano natural\n\nEXPRESIONES:\n- Saludos: \"Hola, feliz tarde\", \"¿Cómo estás, mi amor?\"\n- Afirmaciones: \"Chévere\", \"Perfecto\", \"Ay, qué bueno\"\n- Apoyo: \"Estamos para servirte\", \"oíste\"\n- Despedidas: \"Hasta luego, feliz tarde\", \"Un abrazo\"\n\nREGLAS:\n1. Mensajes cortos para WhatsApp (2-3 líneas máximo)\n2. Usa el nombre del cliente\n3. Menciona el pedido específico\n4. Pregunta sobre su experiencia\n5. NO uses emojis\n6. NO seas formal\n\nCONTEXTO: El cliente hizo un pedido hace 2 minutos que fue verificado. Tu objetivo es confirmar que todo está bien con el pedido."
}
```

---

## Credentials Setup in n8n

### 1. Firebase Service Account
**Credential Type:** `Service Account` (for Firestore nodes)

**Setup:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key (downloads JSON file)
3. In n8n, create new credential:
   - Paste entire JSON content

**Required Permissions:**
- Read/Write access to Firestore collections:
  - `pedidos_bot`
  - `clientes_bot`
  - `conversaciones_bot`

---

### 2. Anthropic API Key
**Credential Type:** `Generic` or `API Key`

**Setup:**
1. Get API key from: https://console.anthropic.com
2. Format: `sk-ant-api03-...`
3. Store as header: `x-api-key`

**Usage:** HTTP Request node for Claude API

---

### 3. WhatsApp Business API Credentials
**Credential Type:** `Generic` (store as environment variables)

**Required Values:**
1. **WHATSAPP_PHONE_NUMBER_ID**
   - Get from: Meta Developer Portal → Your App → WhatsApp → API Setup
   - Format: Numeric ID (e.g., `123456789012345`)

2. **WHATSAPP_ACCESS_TOKEN**
   - Get from: Same location as Phone Number ID
   - Format: Long alphanumeric string
   - NOTE: Use permanent access token for production

**Setup in n8n:**
- Store as n8n environment variables or
- Use n8n credential manager (Generic Auth)

---

## Testing the Workflow

### Test Mode Setup

1. **Disable Schedule Trigger**
   - Run manually for testing

2. **Create Test Order** in Firestore:
```json
// Collection: pedidos_bot
{
  "ticket": "TEST-001",
  "pedido_id": "test_order_123",
  "cliente_telefono": "04241234567", // Use your test number
  "cliente_nombre": "Test User",
  "productos": [
    {
      "nombre": "15 CHURROS + topping de Chocolate",
      "cantidad": 1
    }
  ],
  "tipo": "delivery",
  "estado": "VERIFICADO",
  "fecha_verificado": "2025-01-30T10:00:00Z", // Use current time
  "seguimiento_enviado": false
}
```

3. **Create Test Customer Profile**:
```json
// Collection: clientes_bot
// Document ID: 04241234567 (same as cliente_telefono above)
{
  "nombre": "Test User",
  "telefono": "04241234567",
  "total_pedidos": 1,
  "productos_favoritos": ["CHURROS"]
}
```

4. **Execute Workflow Manually**
   - Click "Test Workflow" in n8n
   - Check each node's output
   - Verify WhatsApp message received
   - Verify conversation saved in Firestore
   - Verify order updated (seguimiento_enviado = true)

---

## Error Handling Best Practices

### At Workflow Level
- Enable "Continue on Fail" for WhatsApp node
- Add retry logic (2-3 attempts) for API calls
- Log errors to separate Firestore collection or external service

### At Node Level
1. **Firestore Query** (Node 2):
   - If empty results, workflow should complete gracefully
   - No orders to process = success

2. **Customer Profile** (Node 4):
   - If not found, use default values from order data
   - Already handled in Node 5 code

3. **Claude API** (Node 6):
   - Retry on timeout (30s timeout recommended)
   - Log failures for manual review

4. **WhatsApp Send** (Node 8):
   - Most critical: Enable "Continue on Fail"
   - Individual message failures shouldn't stop batch
   - Consider dead letter queue for failed messages

---

## Performance Optimization

### Batching Strategy
The current design processes orders one-by-one (Split Out node). For high volume:

**Option A:** Keep sequential (safer, easier debugging)
- Pros: Predictable, easy to track
- Cons: Slower for large batches

**Option B:** Parallel processing
- Use n8n's "Run Once for All Items" mode
- Process multiple orders simultaneously
- Pros: Much faster
- Cons: Harder to debug, may hit rate limits

**Recommendation:** Start with sequential, optimize if needed.

---

### Rate Limits
- **Claude API:** ~100 requests/minute (varies by tier)
- **WhatsApp API:** High limits (typically 1000s/min)
- **Firestore:** 10,000 reads/writes per second

**For 60 orders/minute:** No rate limit concerns with sequential processing.

---

## Monitoring & Logging

### Key Metrics to Track
1. **Workflow executions per hour**
2. **Orders processed per execution**
3. **Message generation latency** (Claude API)
4. **WhatsApp delivery success rate**
5. **Failed orders** (need manual review)

### Recommended Logging
- Add "Sticky Note" nodes between steps for documentation
- Use n8n's execution history (retained based on plan)
- Export logs to external system for long-term storage

---

## Cost Comparison

### Firebase Cloud Functions (Current)
- Compute: ~$0.40 per million invocations
- Network: Included
- **Total Monthly** (100 orders/day): ~$0.50

### n8n Cloud
- Starter Plan: €20/month (5000 executions)
- Pro Plan: €50/month (25000 executions)
- **Total Monthly:** €20-50 + API costs

### n8n Self-Hosted
- Server: $5-20/month (VPS)
- Maintenance: Your time
- **Total Monthly:** $5-20 + API costs

**API Costs (Same for Both):**
- Claude: $3-4/month (100 messages/day)
- WhatsApp: $5-10/month (100 messages/day)

---

## Migration Checklist

- [ ] Set up n8n instance (cloud or self-hosted)
- [ ] Configure Firebase Service Account credential
- [ ] Configure Anthropic API credential
- [ ] Configure WhatsApp API credentials
- [ ] Create all workflow nodes as documented
- [ ] Add Ana's personality prompt
- [ ] Test with single test order
- [ ] Test with multiple test orders
- [ ] Verify Firestore updates working
- [ ] Verify WhatsApp messages received
- [ ] Monitor first 10-20 real executions
- [ ] Disable Firebase Cloud Function
- [ ] Enable n8n scheduled trigger
- [ ] Set up monitoring/alerts

---

## Troubleshooting

### "No orders found" every execution
- Check Firestore query filters
- Verify timestamp comparison logic
- Confirm test orders have correct `estado` and `fecha_verificado`

### "WhatsApp message failed"
- Verify phone number format (should be 58XXXXXXXXXX)
- Check WhatsApp credentials are valid
- Ensure phone number is registered/approved
- Check Meta API rate limits

### "Claude API timeout"
- Increase timeout to 30s
- Retry 2-3 times
- Check API key is valid and has credits

### "Firestore permission denied"
- Verify service account has Firestore access
- Check collection names match exactly
- Confirm Firebase project ID is correct

---

## Next Steps After Migration

1. **Monitor first week closely**
   - Compare message quality vs Firebase version
   - Check for any edge cases

2. **Add enhancements** (easy in n8n):
   - Customer response handling (webhook trigger)
   - Sentiment analysis
   - Custom notifications for team
   - Dashboard/reporting

3. **Optimize based on volume**
   - If >100 orders/day: Consider parallel processing
   - If <10 orders/day: Reduce schedule frequency

---

## Support Resources

- **n8n Documentation:** https://docs.n8n.io
- **Firestore in n8n:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.firebase/
- **HTTP Request Node:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- **Meta WhatsApp API:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Anthropic API:** https://docs.anthropic.com/claude/reference/messages_post

---

## Author Notes

This workflow replicates 100% of the functionality in [index.js](functions/index.js:1).

**Key Differences:**
- Visual workflow vs code
- Manual credential management vs Firebase secrets
- n8n execution environment vs Cloud Functions

**Advantages of n8n:**
- Visual debugging
- Easy to modify/extend
- Built-in retry/error handling
- No deployment needed for changes

**Advantages of Firebase:**
- Automatic scaling
- Integrated with Firebase ecosystem
- Lower cost at low volume
- Simpler credential management
