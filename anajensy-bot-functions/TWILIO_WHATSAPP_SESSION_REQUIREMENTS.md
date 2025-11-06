# Twilio WhatsApp Session Requirements

**Date:** 2025-11-05
**Status:** ✅ Working - Customer must message first

---

## The Problem

When Ana tries to send the first message to a customer, **the message is queued but not delivered**.

**Why?**
Twilio WhatsApp Business API has a **24-hour session window** requirement:
- You can only send **freeform messages** to customers who have messaged you within the last 24 hours
- To send the **first message**, you must use an **approved message template**

---

## How Twilio WhatsApp Sessions Work

### 24-Hour Session Window

```
Customer sends "Hola" → Opens 24-hour window → Ana can send freeform messages
                         ↓
                    [ACTIVE SESSION]
                    (Next 24 hours)
                         ↓
        Ana can send unlimited custom messages
        (post-sales surveys, responses, etc.)
```

### After 24 Hours

```
24 hours pass → Session closes → Ana cannot send freeform messages
                                 ↓
                     Must use approved template
                           OR
                   Wait for customer to message again
```

---

## Current Implementation

### How Messages Work Now

**Scenario 1: Customer has NOT messaged us recently**
```javascript
// enviarWhatsApp() sends message
Status: "queued"  ← Twilio accepts it
Result: ❌ NOT DELIVERED (no active session)
```

**Scenario 2: Customer HAS messaged us in last 24 hours**
```javascript
// enviarWhatsApp() sends message
Status: "queued" → "sent" → "delivered"
Result: ✅ DELIVERED (session is active)
```

---

## Solutions

### Solution 1: Customer Initiates Conversation (Current)

**Workflow:**
1. Customer sends "Hola" or any message to Ana
2. Ana responds (opens 24-hour window)
3. When new order is created, Ana can send post-sales survey

**Implementation:**
```bash
# Simulate customer saying "Hola"
node simulate-customer-first-message.js

# Now create test order (will be delivered)
cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js
```

**Pros:**
- ✅ Works immediately
- ✅ Natural conversation flow
- ✅ No template approval needed

**Cons:**
- ❌ Requires customer to message first
- ❌ Cannot proactively reach out

---

### Solution 2: Use WhatsApp Message Templates

**Create approved template for initial outreach:**

```javascript
// Template example
const templateSID = 'HX...'; // Approved by WhatsApp/Twilio

await twilio.messages.create({
  from: 'whatsapp:+15558855791',
  to: 'whatsapp:+584241476748',
  contentSid: templateSID,
  contentVariables: JSON.stringify({
    '1': 'Pedro',
    '2': '20 tequeños'
  })
});
```

**Template body (must be approved):**
```
Hola {{1}}, te escribimos de Full Queso.

Tu pedido de {{2}} está verificado. ¿Cómo te llegó? ¿Todo bien?

Responde para ayudarte.
```

**Pros:**
- ✅ Can initiate conversations
- ✅ Proactive outreach

**Cons:**
- ❌ Template must be approved by WhatsApp (takes 1-3 days)
- ❌ Cannot send AI-generated custom messages as first message
- ❌ Template format is rigid

---

### Solution 3: Switch to Meta WhatsApp Business API

**Use Meta's Cloud API instead of Twilio:**

```javascript
// Meta allows templates + more flexible rules
const META_WHATSAPP_PHONE_ID = 'YOUR_PHONE_ID';
const META_ACCESS_TOKEN = 'YOUR_TOKEN';

await axios.post(
  `https://graph.facebook.com/v18.0/${META_WHATSAPP_PHONE_ID}/messages`,
  {
    messaging_product: 'whatsapp',
    to: '584241476748',
    type: 'template',
    template: {
      name: 'full_queso_followup',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'Pedro' },
            { type: 'text', text: '20 tequeños' }
          ]
        }
      ]
    }
  },
  {
    headers: {
      'Authorization': `Bearer ${META_ACCESS_TOKEN}`
    }
  }
);
```

**Pros:**
- ✅ More control over messaging
- ✅ Can use templates for first message
- ✅ Direct integration with WhatsApp

**Cons:**
- ❌ Requires Meta Business verification
- ❌ Still needs template approval
- ❌ Migration effort

---

## Recommended Approach

### For Testing (Current Setup)

**Use Solution 1:**
1. Customer messages "Hola" first (simulated or real)
2. Ana responds and opens 24-hour window
3. Create orders and send post-sales surveys

**Testing script:**
```bash
# Step 1: Simulate customer first message
node simulate-customer-first-message.js

# Step 2: Create order (message will be delivered)
cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js

# Step 3: Check WhatsApp
# Pedro should receive Ana's message
```

---

### For Production

**Option A: Template-Based Initial Outreach (Recommended)**

1. Create and submit WhatsApp message template
2. Get template approved by WhatsApp (1-3 days)
3. Use template for first message after order verification
4. After customer responds, use AI-generated messages

**Template Structure:**
```
Subject: Order Follow-up

Hola {{customer_name}}, te escribimos de Full Queso.

Tu pedido de {{product_name}} está verificado y en camino.

¿Cómo te fue? ¿Llegó todo bien?

Responde para ayudarte. Un abrazo.
```

**Code changes needed:**
```javascript
// functions/index.js - enviarWhatsApp()
async function enviarWhatsApp(telefono, mensaje, clienteNombre, productosStr, useTemplate = true) {
  if (useTemplate) {
    // Use approved template for first message
    return await sendWhatsAppTemplate(telefono, clienteNombre, productosStr);
  } else {
    // Use freeform message (current implementation)
    return await sendFreeformMessage(telefono, mensaje);
  }
}
```

---

**Option B: Customer Initiates (Current)**

1. Customer contacts Full Queso first via WhatsApp
2. Ana responds and captures customer info
3. Future messages work automatically

**Best for:**
- Customers who already know the WhatsApp number
- Support/inquiry flow
- Reactive customer service

---

## Testing Results

### Test 1: Without Active Session
**Time:** 2025-11-05 01:13:09 UTC
**Order:** FQ-TEST-PEDRO-1762305125186
**Message SID:** SM0c798f8b12a710c1b3766c37ed066848
**Status:** queued
**Result:** ❌ NOT delivered (no active session)

---

### Test 2: With Active Session (After "Hola")
**Time:** 2025-11-05 01:18:05 UTC
**Order:** FQ-TEST-PEDRO-1762305422172
**Message SID:** SM97581cc9570b754b1f63fcdff56534b4
**Status:** queued → sent → delivered
**Result:** ✅ DELIVERED (active session)

**Message sent (34 words):**
> ¡Epa Pedro! ¿Qué tal te fueron tus 20 tequeños? ¿Llegaron calienticos y en buen estado? ¿El repartidor fue rápido? Como ya eres cliente frecuente, dime si todo estuvo chévere o hay algo que mejorar.

---

## Scripts Created

### 1. Simulate Customer First Message
**File:** `simulate-customer-first-message.js`

Simulates Pedro sending "Hola" to Ana to open 24-hour session.

```bash
node simulate-customer-first-message.js
```

### 2. Create Test Order
**File:** `functions/create-order-fullqueso.js`

Creates verified order that triggers Ana's post-sales message.

```bash
cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js
```

---

## Next Steps

### For Production Deployment

1. **Create WhatsApp Template:**
   ```bash
   # Update template content
   # Submit to Twilio/WhatsApp for approval
   node create-whatsapp-template.js
   ```

2. **Wait for Approval:** 1-3 business days

3. **Update Functions:**
   - Modify `enviarWhatsApp()` to use template for first message
   - Keep freeform messages for responses

4. **Deploy:**
   ```bash
   firebase deploy --only functions
   ```

---

## Important Notes

### Twilio WhatsApp Limitations

1. **24-hour session window** - strict enforcement
2. **Templates required** for initial outreach
3. **Template approval** takes 1-3 days
4. **Variables are limited** in templates (can't send full AI messages)

### Alternative: Meta WhatsApp Cloud API

If you need more flexibility:
- Apply for Meta Business verification
- Use Meta Cloud API directly
- More control over messaging
- Same template requirements

---

## Related Documentation

- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [WORD_LIMIT_UPDATE.md](WORD_LIMIT_UPDATE.md) - 30-40 word messages
- [ANA_PROFESSIONAL_BOUNDARIES.md](ANA_PROFESSIONAL_BOUNDARIES.md) - Conversation closure

---

**Status:** ✅ Understood and Documented
**Current Solution:** Customer must message first
**Production Solution:** Create approved WhatsApp template
