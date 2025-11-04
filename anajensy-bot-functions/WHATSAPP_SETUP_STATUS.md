# Anajensy WhatsApp Bot - Setup Status

## What You Currently Have ✅

### 1. n8n Workflow Deployed
- **Workflow ID:** NchS8Zb8CYhAboT3
- **Workflow URL:** https://fullqueso.app.n8n.cloud/workflow/NchS8Zb8CYhAboT3
- **Status:** Created, needs credentials connected
- **Purpose:** Automated post-sale customer service inquiry

### 2. WhatsApp Business API Configured
- **Phone Number ID:** 805718575964429
- **Access Token:** Configured (EAASJkmRMNrMB...)
- **API Version:** v21.0
- **Status:** ✅ Active and working

**This means you ALREADY HAVE a WhatsApp Business number registered with Meta!**

### 3. Firebase Projects
- **anajensy-n8n** - New project for n8n workflow
- **fullqueso-bot** - Existing project with current data

### 4. Credentials Ready
- ✅ Firebase Service Account (anajensy-n8n)
- ✅ Anthropic API Key (for Claude AI messages)
- ✅ WhatsApp Access Token

---

## What You Need to Complete ⏳

### 1. Find Your WhatsApp Business Phone Number

The Phone Number ID `805718575964429` corresponds to a specific phone number.

**To find it:**
1. Go to: https://business.facebook.com/wa/manage/phone-numbers/
2. Look for your registered WhatsApp Business number
3. It should show the actual phone number (e.g., +1234567890 or +58...)

**OR check in Facebook Developers:**
1. Go to: https://developers.facebook.com/apps/
2. Select your app
3. Go to WhatsApp → API Setup
4. The "From" phone number is displayed there

---

### 2. Enable Firestore Database

**Project:** anajensy-n8n
**Status:** ❌ Not enabled yet

**Steps:**
1. Go to: https://console.firebase.google.com/project/anajensy-n8n/firestore
2. Click "Create database"
3. Choose "Start in test mode" (30 days open access)
4. Select region: nam5 (us-central)
5. Click "Enable"

**Collections needed:**
- `pedidos_bot` - Customer orders
- `clientes_bot` - Customer profiles
- `conversaciones_bot` - Conversation history

---

### 3. Add Test Phone Numbers (Optional for Testing)

If you want to test messages to YOUR personal WhatsApp:

**In Meta Developers:**
1. Go to: https://developers.facebook.com/apps/
2. Your app → WhatsApp → API Setup
3. Scroll to "To" section
4. Click "Manage phone number list"
5. Add your test number: +584168542395

---

### 4. Connect Credentials in n8n

**Already done! ✅** (You confirmed this earlier)

---

## How the System Works

### Flow Overview:

```
Customer makes purchase
    ↓
Order marked as "VERIFICADO" in Firestore
    ↓
n8n workflow (runs every 1 minute)
    ↓
Finds verified orders (seguimiento_enviado = false)
    ↓
For each order:
    1. Get customer profile
    2. Generate personalized message with Claude AI (as Anajensy)
    3. Send WhatsApp message from YOUR business number
    4. Save conversation to Firestore
    5. Mark order as followed-up
```

### Example Message:

```
Hola María, feliz tarde.
¿Cómo te fue con los churros y el café?
¿Todo llegó bien, mi amor?
```

- Uses Venezuelan Spanish
- Warm, maternal tone (Anajensy personality)
- References specific products
- 2-3 lines maximum

---

## What Your WhatsApp Business Number Does

**Phone Number ID: 805718575964429**

This is your SENDING number. It will:
- ✅ Send follow-up messages to customers
- ✅ Appear as your business in customers' WhatsApp
- ✅ Allow customers to reply back
- ✅ Build trust with verified business profile

**You do NOT need +58 416-8542395 to be the business number!**

That number (+584168542395) should be:
- Your personal WhatsApp (keep it)
- Added as a test recipient (to receive test messages)

---

## Next Steps to Go Live

### Step 1: Find Your Business WhatsApp Number
Open: https://business.facebook.com/wa/manage/phone-numbers/

Look for the number associated with Phone Number ID `805718575964429`

**Write it down here:** ___________________

### Step 2: Enable Firestore
1. Click: https://console.firebase.google.com/project/anajensy-n8n/firestore
2. Create database in test mode
3. Done!

### Step 3: Create Test Order
Once Firestore is enabled, run:
```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/functions
node create-test-order.js
```

### Step 4: Test in n8n
1. Go to: https://fullqueso.app.n8n.cloud/workflow/NchS8Zb8CYhAboT3
2. Click "Test Workflow"
3. Watch it execute
4. Check WhatsApp for message!

### Step 5: Activate
Once testing works:
1. In n8n, toggle "Inactive" to "Active"
2. Workflow runs automatically every minute
3. Customers get follow-up messages after purchase!

---

## Troubleshooting

### "Can't find my WhatsApp Business number"
- It's the number registered with Phone Number ID 805718575964429
- Check Meta Business Manager or Facebook Developers app settings

### "Firestore won't enable"
- Make sure you're in the anajensy-n8n project (not fullqueso-bot)
- Check Firebase billing (may need to upgrade for Firestore)

### "Messages not sending"
- Verify access token hasn't expired
- Check phone number is verified in Meta
- Ensure recipient numbers are in allowed list (during testing)

---

## Summary

**You're 90% there!**

✅ WhatsApp Business API configured
✅ n8n workflow deployed
✅ Credentials ready
✅ Ana's personality programmed

**Just need:**
- ⏳ Enable Firestore database
- ⏳ Create test order
- ⏳ Test the workflow
- ⏳ Activate!

**Total time needed: ~10 minutes**

---

## Your WhatsApp Business Setup

**Current Configuration:**
- Phone Number ID: `805718575964429`
- Using Meta WhatsApp Cloud API v21.0
- Access token configured and working
- Ready to send messages!

**To verify everything is working:**

Run this test:
```bash
curl -X POST https://graph.facebook.com/v21.0/805718575964429/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "584168542395",
    "type": "text",
    "text": {"body": "Test message from Anajensy bot setup"}
  }'
```

If you receive the message on +58 416-8542395, everything works!
