# ✅ Ana Automatic Setup - Complete Checklist

## What You Have
- ✅ Firebase account
- ✅ Meta approved WhatsApp number
- ✅ WhatsApp API (Meta Cloud API)
- ✅ Claude API key
- ✅ All Ana code ready

---

## 🎯 To Make Ana Fully Automatic

### 1️⃣ Create Meta WhatsApp Template (ONE TIME)

**Status:** ⚠️ REQUIRED - Must be APPROVED before Ana can send messages

**How to do it:**

Go to: https://business.facebook.com/wa/manage/message-templates/

Create template:
- **Name:** `anajensy_order_followup`
- **Category:** UTILITY
- **Language:** Spanish (es)
- **Body:**
  ```
  Hola {{1}}! Gracias por tu pedido de {{2}}. ¿Cómo estuvo todo? Cuéntame qué tal te fue.
  ```

**Variables:**
- `{{1}}` = Customer name (e.g., "Pedro")
- `{{2}}` = Products (e.g., "Churros Choco Arequipe x15")

**Wait for approval:** Usually 15 min - 24 hours

**Check if approved:**
```bash
./check-meta-template-status.sh
```

---

### 2️⃣ Deploy Firebase Functions (ONE TIME)

**What this does:** Deploys the scheduled function that checks for new orders every 1 minute

**How to do it:**

```bash
cd /home/user/fullqueso-brand-manager/anajensy-bot-functions

# Login to Firebase (one time)
firebase login

# Deploy functions
firebase deploy --only functions
```

**This deploys:**
- `procesarSeguimientos` - Runs every 1 minute, finds new ENTREGADO orders
- `whatsappWebhook` - Receives customer replies from Meta

---

### 3️⃣ Configure Firebase Secrets (ONE TIME)

**What this does:** Stores your API credentials securely

**Option A - Use script:**
```bash
./configure-secrets.sh
```

**Option B - Manual:**
```bash
# Meta WhatsApp Access Token
echo -n "YOUR_META_TOKEN" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN

# Meta Phone Number ID
echo -n "805718575964429" | firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID

# Claude API Key (if not already set)
echo -n "YOUR_CLAUDE_API_KEY" | firebase functions:secrets:set ANTHROPIC_API_KEY
```

**Your credentials:**
- Meta Token: `EAALluMeKdhEBP0NcHkUdFcW01VrYHgxEj1vfvdZCzDaskpwEVIIF7TFIAitoQpmfHEiKjYlKTKc1Gkj5OpZCYVUUQ5R2T6VRPUI5iANsKN6D2Wi40uJj6kPHlTEIVItl6FImdNgnVv3xp4eQLqd2KZCuJfYQBjZC9Indtv9uX3Gm7Y07JEOdroLbhRC8MUlJNQ7rGiZASYdjIZAEaOO1ZC1TRxM9Il9xwDWgC3E5Gc6oKaqoTZBBOcjWYZBIq807bAn2GdXZBlUPay7v5YqD4Yc6h4iQZDZD`
- Phone ID: `805718575964429`

---

### 4️⃣ Configure Meta Webhook (ONE TIME)

**What this does:** Tells Meta to send customer replies to your Firebase function

**After deploying functions, get webhook URL:**
```bash
firebase functions:list
```

Look for: `whatsappWebhook` URL

**Configure in Meta:**

1. Go to: https://developers.facebook.com/apps
2. Select your app → WhatsApp → Configuration
3. Set **Callback URL:** `https://YOUR_FIREBASE_FUNCTION_URL/whatsappWebhook`
4. Set **Verify Token:** `fullqueso_webhook_verify_2025`
5. Click **Verify and Save**
6. Subscribe to: **messages** webhook

---

## 🚀 After Setup - How It Works Automatically

### Automatic Flow:

```
1. Order added to Firestore (pedidos_bot)
   └─ estado: "ENTREGADO"
   └─ seguimiento_enviado: false

2. Ana's procesarSeguimientos runs (every 1 minute) ⏰
   └─ Finds new ENTREGADO orders
   └─ Sends Meta template message automatically
   └─ Updates: seguimiento_enviado = true

3. Customer receives WhatsApp message 📱

4. Customer replies → Meta webhook triggers

5. Ana's whatsappWebhook receives reply
   └─ Calls Claude API for contextual response
   └─ Sends reply to customer
   └─ Saves to Firestore

6. Conversation continues for 3 exchanges

7. Email captured → Survey completed ✅
   └─ Saved to Firestore
   └─ Exported to Google Sheets
```

---

## 🎯 ONE-COMMAND DEPLOYMENT

Instead of doing steps 1-4 manually, run this:

```bash
cd /home/user/fullqueso-brand-manager/anajensy-bot-functions
./run-complete-deployment.sh
```

This script will:
- ✅ Create Meta template (or guide you)
- ✅ Configure Firebase secrets
- ✅ Deploy functions
- ✅ Show webhook URL for Meta configuration
- ✅ Add test order
- ✅ Monitor Ana's response

---

## ✅ Verification - Is Ana Automatic?

After setup, verify automation is working:

### Test 1: Add Order to Firestore

**Manual test:**
1. Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore/data/~2Fpedidos_bot
2. Add document:
```json
{
  "ticket": "FQ-TEST-AUTO-001",
  "cliente_nombre": "Pedro Padilla",
  "cliente_telefono": "584241476748",
  "estado": "ENTREGADO",
  "seguimiento_enviado": false,
  "fecha_entregado": "2025-11-08T17:00:00Z",
  "fecha_verificado": "2025-11-08T17:00:00Z",
  "productos": [
    {"nombre": "Tequeños x12", "cantidad": 1, "precio": 15}
  ],
  "tipo": "delivery",
  "total": 15
}
```

3. **Wait 1-2 minutes**

4. Check WhatsApp on +584241476748

**If message arrives** ✅ = Ana is automatic!

---

### Test 2: Monitor Logs

```bash
# Watch Ana processing orders
firebase functions:log --only procesarSeguimientos --follow

# Watch webhook responses
firebase functions:log --only whatsappWebhook --follow
```

**Expected logs:**
```
🔍 Buscando pedidos... timestamp límite: 2025-11-08T17:01:00.000Z
Found 1 pedidos to process
Processing pedido: FQ-TEST-AUTO-001
✓ WhatsApp sent successfully via Meta API (Template)!
✓ Seguimiento enviado a Pedro Padilla
```

---

## 🔄 Normal Operations - Zero Manual Work

### When an order is delivered:

**Your system does:**
1. Updates order in Firestore:
   - `estado = "ENTREGADO"`
   - `seguimiento_enviado = false`

**Ana does AUTOMATICALLY (every minute):**
1. ✅ Finds the new order
2. ✅ Sends WhatsApp message using template
3. ✅ Customer receives message
4. ✅ Customer replies → Ana responds
5. ✅ Captures feedback, email, sentiment
6. ✅ Saves to Firestore + Google Sheets

**You do:** NOTHING! 🎉

---

## 📊 What Gets Saved Automatically

After each conversation, Ana automatically saves:

**pedidos_bot:**
- `seguimiento_enviado: true`
- `seguimiento_fecha: timestamp`

**conversaciones_bot:**
- Full conversation history
- All customer messages
- All Ana responses

**encuestas_postventa:**
- Product sentiment (positivo/negativo/neutral)
- Delivery sentiment (positivo/negativo/neutral)
- Customer email
- Observations
- Survey completion status

**clientes_bot:**
- Customer profile
- Email address
- Total orders

**Google Sheets:**
- Complete survey data for analysis

---

## 🎯 Summary

### To make Ana fully automatic, you need:

1. ✅ Meta template APPROVED (one-time setup)
2. ✅ Firebase functions DEPLOYED (one-time setup)
3. ✅ Secrets CONFIGURED (one-time setup)
4. ✅ Meta webhook CONFIGURED (one-time setup)

### After setup:

**Orders arrive in Firestore** → **Ana handles automatically** → **Zero manual work!**

### Quick Setup:

```bash
cd anajensy-bot-functions
./run-complete-deployment.sh
```

Done! 🚀

---

## 🐛 Troubleshooting

### Ana not sending messages?

**Check 1: Template approved?**
```bash
./check-meta-template-status.sh
# Must show: status: "APPROVED"
```

**Check 2: Functions deployed?**
```bash
firebase functions:list
# Should show: procesarSeguimientos, whatsappWebhook
```

**Check 3: Secrets configured?**
```bash
firebase functions:secrets:list
# Should show: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ANTHROPIC_API_KEY
```

**Check 4: Order format correct?**
- estado = "ENTREGADO" (exactly, uppercase)
- seguimiento_enviado = false (boolean, not string)
- fecha_entregado = valid timestamp

### Ana not responding to customers?

**Check: Webhook configured?**
- Go to Meta app settings → WhatsApp → Configuration
- Webhook URL must point to whatsappWebhook function
- Verify token must be: `fullqueso_webhook_verify_2025`
- Must be subscribed to: **messages**

---

**Need help?** Check the logs:
```bash
firebase functions:log --follow
```
