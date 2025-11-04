# N8N API Payloads Reference

Complete API call documentation with exact payloads for n8n HTTP Request nodes.

---

## 1. Anthropic Claude API

### Generate Personalized Message

**Endpoint:**
```
POST https://api.anthropic.com/v1/messages
```

**Headers:**
```json
{
  "x-api-key": "YOUR_ANTHROPIC_API_KEY",
  "anthropic-version": "2023-06-01",
  "content-type": "application/json"
}
```

**Request Body:**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 300,
  "system": "Eres Anajensy (Ana), operadora de delivery de Full Queso en Caracas, Venezuela. Eres una madre venezolana cálida, empática y servicial.\n\nPERSONALIDAD:\n- Cálida y maternal\n- Empática y atenta\n- Profesional pero cercana\n- Usas español venezolano natural\n\nEXPRESIONES:\n- Saludos: \"Hola, feliz tarde\", \"¿Cómo estás, mi amor?\"\n- Afirmaciones: \"Chévere\", \"Perfecto\", \"Ay, qué bueno\"\n- Apoyo: \"Estamos para servirte\", \"oíste\"\n- Despedidas: \"Hasta luego, feliz tarde\", \"Un abrazo\"\n\nREGLAS:\n1. Mensajes cortos para WhatsApp (2-3 líneas máximo)\n2. Usa el nombre del cliente\n3. Menciona el pedido específico\n4. Pregunta sobre su experiencia\n5. NO uses emojis\n6. NO seas formal\n\nCONTEXTO: El cliente hizo un pedido hace 2 minutos que fue verificado. Tu objetivo es confirmar que todo está bien con el pedido.",
  "messages": [
    {
      "role": "user",
      "content": "Cliente: María González\nPedido verificado hace 2 minutos: 15 CHURROS + topping de Choco Arequipe, Café Latte\nTipo: delivery\nTotal pedidos: 5\n\nEscribe mensaje de seguimiento para confirmar que el pedido está OK."
    }
  ]
}
```

**Sample Success Response (200):**
```json
{
  "id": "msg_01XYZ123ABC",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hola María, ¿cómo estás mi amor?\nTe escribo para saber si todo llegó bien con los 15 CHURROS + topping de Choco Arequipe y el Café Latte.\n¿Estuvo todo chévere?"
    }
  ],
  "model": "claude-sonnet-4-20250514",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 245,
    "output_tokens": 58
  }
}
```

**Extract Message in n8n:**
```
{{ $json.content[0].text }}
```

**Error Response (401 - Invalid API Key):**
```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "invalid x-api-key"
  }
}
```

**Error Response (429 - Rate Limit):**
```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "Rate limit exceeded"
  }
}
```

---

## 2. Meta WhatsApp Cloud API

### Send Text Message

**Endpoint:**
```
POST https://graph.facebook.com/v21.0/{WHATSAPP_PHONE_NUMBER_ID}/messages
```

Replace `{WHATSAPP_PHONE_NUMBER_ID}` with your actual Phone Number ID (e.g., `123456789012345`)

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_WHATSAPP_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "messaging_product": "whatsapp",
  "to": "584241234567",
  "type": "text",
  "text": {
    "body": "Hola María, ¿cómo estás mi amor?\nTe escribo para saber si todo llegó bien con los 15 CHURROS + topping de Choco Arequipe.\n¿Estuvo todo chévere?"
  }
}
```

**Field Descriptions:**
- `messaging_product`: Always `"whatsapp"` (required)
- `to`: Phone number in international format WITHOUT `+` sign (e.g., `584241234567` for Venezuelan number)
- `type`: Message type - `"text"` for text messages
- `text.body`: The actual message content (up to 4096 characters)

**Sample Success Response (200):**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "584241234567",
      "wa_id": "584241234567"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgNNTg0MjQxMjM0NTY3FQIAERgSQTY4RTlDRjRGOTU3NTQ2OTMA"
    }
  ]
}
```

**Extract Message ID in n8n:**
```
{{ $json.messages[0].id }}
```

**Error Response (401 - Invalid Token):**
```json
{
  "error": {
    "message": "Invalid OAuth access token.",
    "type": "OAuthException",
    "code": 190,
    "fbtrace_id": "ABC123XYZ"
  }
}
```

**Error Response (400 - Invalid Phone Number):**
```json
{
  "error": {
    "message": "(#131030) Recipient phone number not in allowed list",
    "type": "OAuthException",
    "code": 131030,
    "error_data": {
      "messaging_product": "whatsapp",
      "details": "Recipient phone number not in allowed list: Add recipient phone number to recipient list and retry sending message. To send messages to phone numbers not registered as test numbers, please complete registration."
    },
    "fbtrace_id": "ABC123XYZ"
  }
}
```

**Error Response (429 - Rate Limit):**
```json
{
  "error": {
    "message": "Too many messages sent from this phone number. Please try again later.",
    "type": "OAuthException",
    "code": 80007,
    "error_subcode": 2494055,
    "fbtrace_id": "ABC123XYZ"
  }
}
```

**Important Notes:**
- Phone numbers MUST be in international format without `+` (e.g., `584241234567`, NOT `+58-424-1234567`)
- During testing phase, recipient numbers must be added to "allowed list" in Meta Business Suite
- After business verification, can send to any WhatsApp user
- Message delivery is asynchronous - success response means message accepted, not delivered

---

## 3. Phone Number Formatting

### Venezuelan Phone Number Examples

**Input Formats (from Firestore):**
```
"04241234567"    → Local format with leading 0
"4241234567"     → Local format without leading 0
"584241234567"   → Already in international format
```

**JavaScript Transformation:**
```javascript
function formatPhoneForWhatsApp(telefono) {
  let telefonoInternacional;

  // Check if number already has country code
  if (/^[1-9]\d{10,14}$/.test(telefono)) {
    // Already international (e.g., 584241234567, 15556406840)
    telefonoInternacional = telefono;
  } else {
    // Venezuelan local number (e.g., 04241234567)
    // Remove leading 0 and add country code 58
    const telefonoLimpio = telefono.replace(/^0/, "");
    telefonoInternacional = `58${telefonoLimpio}`;
  }

  return telefonoInternacional;
}

// Examples:
formatPhoneForWhatsApp("04241234567")   // Returns: "584241234567"
formatPhoneForWhatsApp("584241234567")  // Returns: "584241234567"
formatPhoneForWhatsApp("15556406840")   // Returns: "15556406840" (US number)
```

**n8n Code Node Implementation:**
```javascript
const telefono = $json.cliente_telefono;
let telefonoInternacional;

if (/^[1-9]\d{10,14}$/.test(telefono)) {
  telefonoInternacional = telefono;
} else {
  const telefonoLimpio = telefono.replace(/^0/, "");
  telefonoInternacional = `58${telefonoLimpio}`;
}

return {
  ...($json),
  telefonoInternacional
};
```

**Country Code Reference:**
- Venezuela: `58`
- USA: `1`
- Colombia: `57`
- Mexico: `52`
- Spain: `34`

---

## 4. Firestore Operations

While Firestore has native n8n nodes, here are the equivalent REST API calls if needed:

### Query Documents with Filters

**Endpoint:**
```
POST https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents:runQuery
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_FIREBASE_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body (Complex Query):**
```json
{
  "structuredQuery": {
    "from": [
      {
        "collectionId": "pedidos_bot"
      }
    ],
    "where": {
      "compositeFilter": {
        "op": "AND",
        "filters": [
          {
            "fieldFilter": {
              "field": { "fieldPath": "estado" },
              "op": "EQUAL",
              "value": { "stringValue": "VERIFICADO" }
            }
          },
          {
            "fieldFilter": {
              "field": { "fieldPath": "seguimiento_enviado" },
              "op": "EQUAL",
              "value": { "booleanValue": false }
            }
          },
          {
            "fieldFilter": {
              "field": { "fieldPath": "fecha_verificado" },
              "op": "LESS_THAN_OR_EQUAL",
              "value": { "timestampValue": "2025-01-30T10:00:00Z" }
            }
          }
        ]
      }
    }
  }
}
```

**Note:** Using the native Firestore n8n node is MUCH easier than REST API. The above is for reference only.

---

## 5. Complete Request/Response Examples

### Scenario: Process Single Order

#### Step 1: Query Firestore
**Already handled by n8n Firestore node**

Order data retrieved:
```json
{
  "_id": "abc123",
  "ticket": "FQ-12345",
  "pedido_id": "order_uuid_123",
  "cliente_telefono": "04241234567",
  "cliente_nombre": "María González",
  "productos": [
    {
      "nombre": "15 CHURROS + topping de Choco Arequipe",
      "cantidad": 1
    },
    {
      "nombre": "Café Latte",
      "cantidad": 2
    }
  ],
  "tipo": "delivery",
  "ubicacion": "La Florida, Caracas",
  "estado": "VERIFICADO",
  "fecha_verificado": "2025-01-30T09:58:00Z",
  "seguimiento_enviado": false
}
```

#### Step 2: Get Customer Profile
**Already handled by n8n Firestore node**

Customer data retrieved:
```json
{
  "telefono": "04241234567",
  "nombre": "María González",
  "total_pedidos": 5,
  "productos_favoritos": ["CHURROS", "Café Latte"],
  "horario_preferido": "tarde"
}
```

#### Step 3: Build Context
**Code node output:**
```json
{
  "pedidoId": "abc123",
  "pedido": { /* full order object */ },
  "cliente": { /* full customer object */ },
  "contextoCliente": "Cliente: María González\nPedido verificado hace 2 minutos: 15 CHURROS + topping de Choco Arequipe, Café Latte\nTipo: delivery\nTotal pedidos: 5\n\nEscribe mensaje de seguimiento para confirmar que el pedido está OK."
}
```

#### Step 4: Call Claude API
**Request:**
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-api03-YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 300,
    "system": "Eres Anajensy (Ana)...",
    "messages": [
      {
        "role": "user",
        "content": "Cliente: María González\nPedido verificado hace 2 minutos: 15 CHURROS + topping de Choco Arequipe, Café Latte\nTipo: delivery\nTotal pedidos: 5\n\nEscribe mensaje de seguimiento para confirmar que el pedido está OK."
      }
    ]
  }'
```

**Response:**
```json
{
  "content": [
    {
      "text": "Hola María, feliz tarde.\n¿Cómo te fue con los churros y el café? ¿Todo llegó bien, mi amor?\nEstamos para servirte."
    }
  ]
}
```

#### Step 5: Format Phone
**Code node output:**
```json
{
  "telefonoInternacional": "584241234567",
  "mensajeAna": "Hola María, feliz tarde.\n¿Cómo te fue con los churros y el café? ¿Todo llegó bien, mi amor?\nEstamos para servirte."
}
```

#### Step 6: Send WhatsApp
**Request:**
```bash
curl -X POST https://graph.facebook.com/v21.0/123456789012345/messages \
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "584241234567",
    "type": "text",
    "text": {
      "body": "Hola María, feliz tarde.\n¿Cómo te fue con los churros y el café? ¿Todo llegó bien, mi amor?\nEstamos para servirte."
    }
  }'
```

**Response:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "584241234567",
      "wa_id": "584241234567"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgNNTg0MjQxMjM0NTY3FQIAERgSQTY4RTlDRjRGOTU3NTQ2OTMA"
    }
  ]
}
```

#### Step 7: Save Conversation
**Firestore Add Document:**
```json
{
  "cliente_telefono": "04241234567",
  "cliente_nombre": "María González",
  "pedido_ticket": "FQ-12345",
  "pedido_id": "order_uuid_123",
  "mensaje_ana": "Hola María, feliz tarde.\n¿Cómo te fue con los churros y el café? ¿Todo llegó bien, mi amor?\nEstamos para servirte.",
  "mensaje_cliente": null,
  "fecha": "2025-01-30T10:00:00Z",
  "tipo_interaccion": "seguimiento_post_verificacion",
  "sentimiento": "neutral",
  "requiere_atencion": false
}
```

#### Step 8: Update Order
**Firestore Update Document (pedidos_bot/abc123):**
```json
{
  "seguimiento_enviado": true,
  "seguimiento_fecha": "2025-01-30T10:00:00Z"
}
```

---

## 6. Error Handling Payloads

### Handle Claude API Timeout

**n8n Settings:**
- Timeout: 30000ms
- Retry on Fail: Yes, 2 times
- Retry Delay: 1000ms

**If all retries fail, log:**
```json
{
  "error": "claude_api_timeout",
  "pedido_id": "order_uuid_123",
  "cliente": "María González",
  "timestamp": "2025-01-30T10:00:00Z",
  "details": "Max retries exceeded"
}
```

### Handle WhatsApp API Failure

**n8n Settings:**
- Continue on Fail: Yes
- Retry on Fail: Yes, 2 times

**If fail after retries, create failed message record:**
```json
{
  "tipo": "whatsapp_send_failed",
  "pedido_id": "order_uuid_123",
  "cliente_telefono": "584241234567",
  "mensaje": "...",
  "error_code": 131030,
  "error_message": "Recipient phone number not in allowed list",
  "timestamp": "2025-01-30T10:00:00Z",
  "requiere_reintento": true
}
```

---

## 7. Testing Commands (cURL)

### Test Claude API
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello in Spanish"}]
  }'
```

### Test WhatsApp API
```bash
curl -X POST https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer YOUR_WHATSAPP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_NUMBER",
    "type": "text",
    "text": {"body": "Test message from n8n"}
  }'
```

---

## 8. N8N HTTP Request Node Templates

### Template: Claude API Node

**Node Settings:**
- Name: `Generate Message with Claude`
- Method: `POST`
- URL: `https://api.anthropic.com/v1/messages`

**Authentication:**
- Type: `Generic Credential Type`
- Add: `Header Auth`
  - Name: `x-api-key`
  - Value: `{{ $credentials.anthropic_api_key }}`

**Headers:**
```
anthropic-version: 2023-06-01
content-type: application/json
```

**Body:**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 300,
  "system": "{{ $('Ana Personality').first().json.prompt }}",
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
- Timeout: `30000`

---

### Template: WhatsApp API Node

**Node Settings:**
- Name: `Send WhatsApp Message`
- Method: `POST`
- URL: `https://graph.facebook.com/v21.0/{{ $credentials.whatsapp_phone_id }}/messages`

**Authentication:**
- Type: `Generic Credential Type`
- Add: `Header Auth`
  - Name: `Authorization`
  - Value: `Bearer {{ $credentials.whatsapp_access_token }}`

**Headers:**
```
Content-Type: application/json
```

**Body:**
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
- Timeout: `15000`
- Continue on Fail: `true`
- Retry on Fail: `true` (2 times)

---

## Summary

This document provides all the exact API payloads, headers, and configurations needed to replicate the anajensy-bot in n8n.

**Key Files:**
- This file: API payloads and examples
- `N8N_WORKFLOW_GUIDE.md`: Complete workflow setup
- `ANAJENSY_PROMPT.txt`: Ana's personality prompt

**API Endpoints Used:**
1. Anthropic Claude: `https://api.anthropic.com/v1/messages`
2. Meta WhatsApp: `https://graph.facebook.com/v21.0/{PHONE_ID}/messages`
3. Firestore: Via n8n native nodes (recommended)

All payloads tested and working with current Firebase Functions implementation in [index.js](functions/index.js:1).
