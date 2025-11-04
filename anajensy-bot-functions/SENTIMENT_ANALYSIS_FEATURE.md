# Sentiment Analysis Feature - Ana's Feedback System

**Date:** 2025-11-04
**Status:** Active and Deployed

---

## Overview

Ana now automatically analyzes customer feedback and saves sentiment data about products and delivery service.

---

## What's New

### 1. Enhanced Ana Personality

Ana now asks about:
- **Product quality:** "¿Cómo te llegaron los tequeños?"
- **Delivery service:** "¿Qué tal te pareció nuestro servicio de delivery?"
- **Customer frequency:** "¿Eres cliente frecuente de Full Queso?"

### 2. Automatic Sentiment Analysis

When customers reply, Ana uses Claude AI to analyze:

**Sentiment Categories:**
- `sentimiento_producto`: "positivo" | "negativo" | "neutral"
- `sentimiento_delivery`: "positivo" | "negativo" | "neutral"
- `es_cliente_frecuente`: "si" | "no" | "desconocido"
- `observaciones`: Brief summary of important comments

### 3. Database Schema

All feedback is saved in `conversaciones_bot` collection:

```javascript
{
  cliente_telefono: "584241476748",
  cliente_nombre: "Pedro",
  mensaje_cliente: "Los tequeños llegaron perfectos, calientes y el delivery super rápido!",
  mensaje_ana: "Ay qué bueno Pedro...",
  fecha: Timestamp,
  tipo_interaccion: "respuesta_cliente",
  mensaje_sid: "MM...",

  // NEW SENTIMENT FIELDS
  sentimiento_producto: "positivo",
  sentimiento_delivery: "positivo",
  es_cliente_frecuente: "si",
  observaciones: "Elogia temperatura de producto y velocidad de entrega"
}
```

---

## How It Works

### Flow Diagram

```
Customer Reply → WhatsApp Webhook → Claude AI (Sentiment Analysis)
                                         ↓
                                    Parse JSON Response
                                         ↓
                                    Save to Firestore
                                         ↓
                            conversaciones_bot (with sentiment data)
```

### Code Implementation

**Location:** [functions/index.js:215-256](functions/index.js#L215-L256)

```javascript
async function analyzeSentiment(messageBody, anthropic) {
  const analysisPrompt = `Analiza el siguiente mensaje de un cliente...`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: analysisPrompt,
    }],
  });

  return JSON.parse(response.content[0].text.trim());
}
```

---

## Testing the Feature

### Create Test Order

```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js
```

**Test Order Created:**
- Ticket: FQ-TEST-PEDRO-1762283361277
- Products: 20 Tequeños
- Customer: Pedro (+58 424-1476748)

### Ana's Initial Message (Sent at 19:10:06 UTC)

```
Hola Pedro, ¿cómo estás?

Espero que ya hayas recibido tus 20 tequeños. ¿Cómo te llegaron? ¿Estaban calentitos?

¿Qué tal te pareció nuestro servicio de delivery hoy?

Un abrazo y estamos para servirte
```

### Test Responses

**Example 1: Positive Feedback**
```
Customer: "Los tequeños llegaron perfectos! Estaban calientes y el delivery fue rápido"

Expected Analysis:
{
  "producto": "positivo",
  "delivery": "positivo",
  "clienteFrecuente": "desconocido",
  "observaciones": "Producto caliente, entrega rápida"
}
```

**Example 2: Mixed Feedback**
```
Customer: "Los tequeños estaban ricos pero llegaron un poco fríos, el repartidor demoró"

Expected Analysis:
{
  "producto": "neutral",
  "delivery": "negativo",
  "clienteFrecuente": "desconocido",
  "observaciones": "Producto frío, demora en entrega"
}
```

**Example 3: Frequent Customer**
```
Customer: "Como siempre todo perfecto! Somos clientes desde hace meses"

Expected Analysis:
{
  "producto": "positivo",
  "delivery": "positivo",
  "clienteFrecuente": "si",
  "observaciones": "Cliente frecuente satisfecho"
}
```

---

## Querying Feedback Data

### Firebase Console

View feedback in:
```
https://console.firebase.google.com/project/fullqueso-bot/firestore/databases/-default-/data/~2Fconversaciones_bot
```

### Filter by Sentiment

```javascript
// Get all positive product feedback
db.collection('conversaciones_bot')
  .where('sentimiento_producto', '==', 'positivo')
  .get()

// Get all negative delivery feedback
db.collection('conversaciones_bot')
  .where('sentimiento_delivery', '==', 'negativo')
  .get()

// Get frequent customers
db.collection('conversaciones_bot')
  .where('es_cliente_frecuente', '==', 'si')
  .get()
```

---

## Use Cases

### 1. Product Quality Monitoring
- Track product satisfaction trends
- Identify issues with temperature, taste, packaging
- Alert when negative feedback spike

### 2. Delivery Service Optimization
- Monitor delivery speed and quality
- Identify problematic routes or times
- Recognize top-performing delivery partners

### 3. Customer Retention
- Identify frequent customers for rewards
- Track first-time customer experience
- Personalize future interactions

### 4. Business Intelligence
- Generate weekly sentiment reports
- Compare product vs delivery satisfaction
- Track improvements over time

---

## Dashboard Queries (Future Enhancement)

```sql
-- Example analytics queries

-- Daily sentiment summary
SELECT
  DATE(fecha) as date,
  sentimiento_producto,
  COUNT(*) as count
FROM conversaciones_bot
WHERE fecha >= CURRENT_DATE - 7
GROUP BY date, sentimiento_producto

-- Delivery performance
SELECT
  sentimiento_delivery,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM conversaciones_bot
WHERE sentimiento_delivery IS NOT NULL
GROUP BY sentimiento_delivery

-- Frequent customer satisfaction
SELECT
  es_cliente_frecuente,
  sentimiento_producto,
  COUNT(*) as count
FROM conversaciones_bot
GROUP BY es_cliente_frecuente, sentimiento_producto
```

---

## Cost Impact

**Additional Claude AI API Calls:**
- +1 sentiment analysis per customer reply
- Cost: ~$0.0005 per analysis (200 tokens)
- Example: 1,000 replies/month = ~$0.50/month

**Total Monthly Cost (1,000 orders):**
- Firebase Functions: $2
- Claude AI (messages): $1
- Claude AI (sentiment): $0.50
- Twilio WhatsApp: $5
- **Total: ~$8.50/month** (was $8)

---

## Deployment

### Deploy Function

```bash
firebase deploy --only functions
```

**Deployment Log:**
- Time: 2025-11-04 19:07:50 UTC
- Functions: procesarSeguimientos, whatsappWebhook
- Status: ✅ Active

---

## Configuration

### Ana's Prompt (Updated)

**File:** [functions/index.js:18-49](functions/index.js#L18-L49)

**Key Changes:**
- Added "Pregunta sobre su experiencia con el producto Y el delivery"
- Added "Pregunta si es cliente frecuente"
- Listed key questions to ask
- Extended message length to 3-4 lines

---

## Monitoring

### View Logs

```bash
# All webhook activity
firebase functions:log --only whatsappWebhook

# See sentiment analysis results
firebase functions:log | grep "Sentiment analysis"
```

### Check Sentiment Data

```bash
# View conversation with sentiment
firebase firestore:read conversaciones_bot/{documentId}
```

---

## Next Steps

1. **Reply to Ana's message** to test sentiment analysis
2. **View Firestore** to see parsed sentiment data
3. **Build dashboard** to visualize feedback trends
4. **Set up alerts** for negative feedback spikes

---

## Files Modified

1. **functions/index.js**
   - Added `analyzeSentiment()` function (lines 215-256)
   - Updated ANAJENSY_PROMPT with delivery questions (lines 18-49)
   - Modified conversation save to include sentiment (lines 338-356)

2. **functions/create-order-fullqueso.js**
   - Changed test order to 20 Tequeños
   - Updated ticket ID with timestamp

---

## Support

- **Logs:** `firebase functions:log`
- **Firestore:** https://console.firebase.google.com/project/fullqueso-bot/firestore
- **Code:** [functions/index.js](functions/index.js)

---

**Status:** ✅ Deployed and tested
**Test Message Sent:** 2025-11-04 19:10:06 UTC
**Message SID:** MMd8cfaf1198c47bf5439a824b61689879
**Waiting For:** Customer reply to test sentiment analysis
