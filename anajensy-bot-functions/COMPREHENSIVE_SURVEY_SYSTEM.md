# Comprehensive Post-Sales Survey System

**Date:** 2025-11-04
**Status:** Deployed - Waiting for Firestore Index

---

## Overview

Ana now responds to customer feedback as a customer service agent and saves comprehensive survey data including email collection for promotions.

---

## New Features

### 1. Customer Service Responses

Ana responds to customer messages with:
- **Acknowledgment:** Thanks customer for their feedback
- **Celebration:** If positive feedback, celebrates and thanks for their preference
- **Empathy:** If suggestions/complaints: "Vamos a tomar todo en cuenta para mejorar el servicio"
- **Follow-up:** Asks for additional recommendations
- **Email Request:** "¿Puedes enviarnos tu email para enviarte promociones exclusivas?"
- **Warm closing:** "Estamos para servirte"

**Example Ana Response:**
```
¡Qué bueno que te gustaron los tequeños, Pedro! Me alegra saber eso.

Vamos a tomar todo en cuenta para mejorar el tiempo del delivery, eso es importante para nosotros.

¿Tienes alguna otra recomendación para que sigamos mejorando?

Por cierto, ¿puedes enviarnos tu email para mandarte promociones exclusivas?

Estamos para servirte, vale. Un abrazo.
```

### 2. New Database Collection: `encuestas_postventa`

Comprehensive survey data storage with all customer feedback.

#### Schema

```javascript
{
  // Customer Data
  cliente_telefono: "584241476748",
  cliente_nombre: "Pedro",
  cliente_email: "pedro@example.com" | null,  // Updated when provided

  // Order Data
  pedido_id: "NrcNDi86Nn26vVod1S72",
  pedido_ticket: "FQ-TEST-PEDRO-1762284266051",
  pedido_productos: [
    {
      nombre: "20 Tequeños",
      cantidad: 1
    }
  ],
  pedido_tipo: "delivery",
  pedido_fecha: Timestamp,
  pedido_hora: "19:25:07",  // Time of order in VE timezone

  // Survey Responses
  respuesta_completa: "Los tequeños estaban perfectos pero el delivery llegó tarde. Podrían mejorar el tiempo de entrega?",
  sentimiento_producto: "positivo",
  sentimiento_delivery: "negativo",
  sentimiento_general: "regular",  // Calculated: positivo/negativo/regular

  // Feedback & Suggestions
  sugerencias: "Demora en delivery, sugiere mejorar tiempo de entrega",
  producto_favorito: null,  // Can be extracted from conversation
  areas_mejora: ["Delivery"],  // Array of areas needing improvement

  // Customer Relationship
  es_cliente_frecuente: "si" | "no" | "desconocido",
  total_pedidos: 3,

  // Metadata
  fecha_encuesta: Timestamp,
  encuesta_completada: false,  // true when email is provided
  respuesta_ana: "Ana's full response message"
}
```

### 3. Automatic Email Detection & Capture

When customer provides email in any message:
```
Customer: "Mi email es pedro@example.com"
```

**System Actions:**
1. Extracts email using regex: `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/`
2. Updates `clientes_bot` collection:
   ```javascript
   {
     email: "pedro@example.com",
     email_capturado_fecha: Timestamp
   }
   ```
3. Updates most recent survey in `encuestas_postventa`:
   ```javascript
   {
     cliente_email: "pedro@example.com",
     encuesta_completada: true
   }
   ```

### 4. Enhanced Customer Context

Ana's responses now include:
- Order history
- Previous conversation context
- Customer sentiment analysis
- Personalized acknowledgments

---

## Database Collections

### Collection 1: `clientes_bot` (Customer Profiles)

```javascript
{
  nombre: "Pedro",
  telefono: "584241476748",
  email: "pedro@example.com",  // NEW
  email_capturado_fecha: Timestamp,  // NEW
  total_pedidos: 3,
  productos_favoritos: ["Tequeños", "Churros"]
}
```

### Collection 2: `conversaciones_bot` (Conversation History)

```javascript
{
  cliente_telefono: "584241476748",
  cliente_nombre: "Pedro",
  mensaje_cliente: "Customer message",
  mensaje_ana: "Ana's response",
  fecha: Timestamp,
  tipo_interaccion: "respuesta_cliente",
  mensaje_sid: "SM...",
  sentimiento_producto: "positivo",
  sentimiento_delivery: "negativo",
  es_cliente_frecuente: "si",
  observaciones: "Summary"
}
```

### Collection 3: `encuestas_postventa` (Comprehensive Surveys) - NEW

Complete survey data with order details, sentiment analysis, and customer information.

### Collection 4: `pedidos_bot` (Orders)

```javascript
{
  ticket: "FQ-TEST-PEDRO-1762284266051",
  cliente_telefono: "584241476748",
  cliente_nombre: "Pedro",
  productos: [...],
  estado: "VERIFICADO",
  fecha_verificado: Timestamp,
  seguimiento_enviado: true
}
```

---

## Query Examples

### Get All Completed Surveys with Email

```javascript
db.collection('encuestas_postventa')
  .where('encuesta_completada', '==', true)
  .get()
```

### Get Negative Delivery Feedback

```javascript
db.collection('encuestas_postventa')
  .where('sentimiento_delivery', '==', 'negativo')
  .orderBy('fecha_encuesta', 'desc')
  .get()
```

### Get Customers for Email Marketing

```javascript
db.collection('clientes_bot')
  .where('email', '!=', null)
  .get()
```

### Get Frequent Customers with Positive Sentiment

```javascript
db.collection('encuestas_postventa')
  .where('es_cliente_frecuente', '==', 'si')
  .where('sentimiento_general', '==', 'positivo')
  .get()
```

### Get Improvement Suggestions

```javascript
db.collection('encuestas_postventa')
  .where('areas_mejora', 'array-contains', 'Delivery')
  .get()
```

---

## Conversation Flow

### Step 1: Ana Sends Initial Survey

```
Ana: Epa Pedro, ¿cómo estás? Espero que hayas disfrutado tus 20 tequeños.

Dime, ¿cómo te parecieron? ¿Llegaron calentitos y en buen estado?

¿Qué tal el delivery? ¿Fue rápido el repartidor y todo bien empacado?

Como ya eres cliente frecuente, tu opinión me importa. ¿Hay algo que podamos mejorar?

Aquí estamos para servirte, vale.
```

### Step 2: Customer Responds with Feedback

```
Customer: Los tequeños estaban perfectos, calientes y crujientes! Pero el delivery llegó un poco tarde, como 45 minutos. Podrían mejorar eso.
```

**System Actions:**
1. Sentiment Analysis
   - producto: "positivo"
   - delivery: "regular"
   - observaciones: "Producto excelente, demora en delivery"

2. Save to `conversaciones_bot`
3. Save to `encuestas_postventa`

### Step 3: Ana Responds as Customer Service

```
Ana: ¡Qué bueno que los tequeños te quedaron perfectos, Pedro! Me alegra saber que estaban calentitos y crujientes.

Vamos a tomar todo en cuenta para mejorar el tiempo del delivery, eso es super importante para nosotros, oíste.

¿Tienes alguna otra recomendación para seguir mejorando?

Por cierto, ¿puedes enviarnos tu email para mandarte promociones exclusivas?

Estamos para servirte siempre. Un abrazo.
```

### Step 4: Customer Provides Email

```
Customer: Mi email es pedro@example.com
```

**System Actions:**
1. Extract email: "pedro@example.com"
2. Update `clientes_bot`:
   ```javascript
   {
     email: "pedro@example.com",
     email_capturado_fecha: Timestamp.now()
   }
   ```
3. Update `encuestas_postventa`:
   ```javascript
   {
     cliente_email: "pedro@example.com",
     encuesta_completada: true
   }
   ```

### Step 5: Ana Confirms

```
Ana: Perfecto Pedro, ya tengo tu email anotado. Te vamos a estar enviando promociones especiales, vale.

Gracias por tu confianza en Full Queso. Cualquier cosa, aquí estamos!
```

---

## Business Intelligence Queries

### Weekly Sentiment Report

```javascript
const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - 7);

db.collection('encuestas_postventa')
  .where('fecha_encuesta', '>=', startOfWeek)
  .get()
  .then(snapshot => {
    const sentimientos = {
      producto: {positivo: 0, negativo: 0, neutral: 0},
      delivery: {positivo: 0, negativo: 0, neutral: 0}
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      sentimientos.producto[data.sentimiento_producto]++;
      sentimientos.delivery[data.sentimiento_delivery]++;
    });

    console.log('Weekly Sentiment Report:', sentimientos);
  });
```

### Email Capture Rate

```javascript
db.collection('encuestas_postventa')
  .get()
  .then(snapshot => {
    const total = snapshot.size;
    const withEmail = snapshot.docs.filter(doc =>
      doc.data().encuesta_completada
    ).length;

    const rate = (withEmail / total * 100).toFixed(2);
    console.log(`Email Capture Rate: ${rate}%`);
  });
```

### Top Improvement Areas

```javascript
db.collection('encuestas_postventa')
  .get()
  .then(snapshot => {
    const areas = {};

    snapshot.forEach(doc => {
      const mejoras = doc.data().areas_mejora || [];
      mejoras.forEach(area => {
        areas[area] = (areas[area] || 0) + 1;
      });
    });

    console.log('Top Improvement Areas:', areas);
  });
```

---

## Firestore Indexes Required

### Index 1: pedidos_bot (for order lookup)

```
Collection: pedidos_bot
Fields:
  - cliente_telefono (Ascending)
  - fecha_verificado (Descending)
```

**Create via Firebase Console:**
https://console.firebase.google.com/v1/r/project/fullqueso-bot/firestore/indexes?create_composite=ClFwcm9qZWN0cy9mdWxscXVlc28tYm90L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wZWRpZG9zX2JvdC9pbmRleGVzL18QARoUChBjbGllbnRlX3RlbGVmb25vEAEaFAoQZmVjaGFfdmVyaWZpY2FkbxACGgwKCF9fbmFtZV9fEAI

### Index 2: conversaciones_bot (for conversation history)

```
Collection: conversaciones_bot
Fields:
  - cliente_telefono (Ascending)
  - fecha (Descending)
```

### Index 3: encuestas_postventa (for survey queries)

```
Collection: encuestas_postventa
Fields:
  - cliente_telefono (Ascending)
  - fecha_encuesta (Descending)
```

**Status:** Indexes defined in `firestore.indexes.json`

---

## Cost Impact

**Additional Operations per Customer Response:**
- 1x Sentiment analysis API call: ~$0.0005
- 2x Firestore writes (conversation + survey): ~$0.000002
- 1x Optional Firestore update (if email): ~$0.000001
- Total: ~$0.0005 per customer interaction

**Monthly Cost (1,000 customer replies):**
- Sentiment analysis: $0.50
- Firestore operations: $0.003
- Total additional: **~$0.50/month**

---

## Export Data for Marketing

### Export Email List

```javascript
db.collection('clientes_bot')
  .where('email', '!=', null)
  .get()
  .then(snapshot => {
    const emails = snapshot.docs.map(doc => ({
      nombre: doc.data().nombre,
      email: doc.data().email,
      telefono: doc.data().telefono,
      total_pedidos: doc.data().total_pedidos
    }));

    console.table(emails);
    // Export to CSV for Mailchimp, SendGrid, etc.
  });
```

### Segment Customers by Satisfaction

```javascript
// Happy customers (for testimonials/referrals)
db.collection('encuestas_postventa')
  .where('sentimiento_general', '==', 'positivo')
  .where('encuesta_completada', '==', true)
  .get()

// Unhappy customers (for recovery campaigns)
db.collection('encuestas_postventa')
  .where('sentimiento_general', '==', 'negativo')
  .where('encuesta_completada', '==', true)
  .get()
```

---

## Deployment Status

- ✅ Customer service response logic deployed
- ✅ Email detection and capture implemented
- ✅ Comprehensive survey collection created
- ✅ Sentiment analysis integration complete
- ⏳ Firestore indexes creating (1-2 minutes)

**Next Steps:**
1. Wait for Firestore index creation
2. Test by replying to Ana's message
3. Provide email to test email capture
4. View data in `encuestas_postventa` collection

---

## Testing

### Test Scenario 1: Positive Feedback with Email

```
1. Ana asks about order
2. Reply: "Todo perfecto! Los tequeños estaban deliciosos y el delivery fue rápido"
3. Ana: Thanks, asks for email
4. Reply: "mi email es test@example.com"
5. Check Firestore: encuesta_completada: true
```

### Test Scenario 2: Mixed Feedback with Suggestion

```
1. Ana asks about order
2. Reply: "Los tequeños buenos pero llegaron fríos. El delivery demoró mucho"
3. Ana: "Vamos a tomar todo en cuenta..." asks for recommendations
4. Reply: "Podrían mejorar el empaque térmico"
5. Check Firestore: sugerencias field populated
```

---

## Files Modified

1. **functions/index.js**
   - Lines 374-386: Enhanced customer service response context
   - Lines 432-443: Order information extraction
   - Lines 462-501: Comprehensive survey data saving
   - Lines 505-533: Email detection and capture

2. **firestore.indexes.json** (NEW)
   - Defines required composite indexes
   - Auto-deployment configuration

---

**Status:** ✅ Deployed - Waiting for index creation
**Email Capture:** ✅ Active
**Survey System:** ✅ Comprehensive
**Customer Service:** ✅ Venezuelan tone maintained
