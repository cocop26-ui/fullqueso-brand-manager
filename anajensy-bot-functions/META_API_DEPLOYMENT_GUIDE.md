# Meta WhatsApp API - Deployment Guide

**Date:** 2025-11-08
**Status:** Ready to Deploy ✅

---

## 🎯 What Changed

We've completed the migration from Twilio to Meta WhatsApp Cloud API. Ana will now send and receive messages directly through Meta's API.

### Key Updates:
- ✅ Removed Twilio dependency completely
- ✅ Implemented Meta WhatsApp Cloud API for sending messages
- ✅ Updated webhook to receive messages from Meta
- ✅ Updated phone number formatting for international support
- ✅ Cleaned up package.json dependencies

---

## 📋 Pre-Deployment Checklist

### 1. Set Firebase Secrets

Run these commands on your local machine (in the `anajensy-bot-functions` directory):

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions

# Set your Meta WhatsApp Access Token
echo -n "YOUR_META_ACCESS_TOKEN_HERE" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN

# Set your Phone Number ID (should be 805718575964429)
echo -n "805718575964429" | firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID

# Verify secrets are set
firebase functions:secrets:access WHATSAPP_ACCESS_TOKEN
firebase functions:secrets:access WHATSAPP_PHONE_NUMBER_ID
```

**Important:**
- Use `echo -n` (not just `echo`) to avoid newline characters
- Replace `YOUR_META_ACCESS_TOKEN_HERE` with your actual token
- The token should start with `EAA...`

### 2. Configure Meta Webhook

Before deploying, you'll need to configure Meta to send webhooks to your Cloud Function.

**Webhook URL:**
```
https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
```

**Verify Token:**
```
fullqueso_webhook_verify_2025
```

**Steps to Configure in Meta:**
1. Go to https://developers.facebook.com/apps/1496108368096420/
2. Click **WhatsApp** → **Configuration** in the left menu
3. In the **Webhook** section, click **Edit**
4. Set **Callback URL** to the webhook URL above
5. Set **Verify Token** to: `fullqueso_webhook_verify_2025`
6. Click **Verify and Save**
7. Subscribe to webhook fields:
   - ✅ `messages`
   - ✅ `message_status` (optional, for delivery receipts)

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/functions
npm install
```

This will:
- Remove the `twilio` package
- Keep all other dependencies updated

### Step 2: Deploy to Firebase

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions
firebase deploy --only functions
```

This will deploy:
- ✅ `procesarSeguimientos` - Scheduled function (runs every 1 minute)
- ✅ `whatsappWebhook` - Webhook for incoming messages
- ✅ `backupFirestore` - Weekly backup function

### Step 3: Verify Deployment

After deployment completes, verify the functions are working:

```bash
# Check logs for any errors
firebase functions:log --only procesarSeguimientos
firebase functions:log --only whatsappWebhook
```

---

## 🧪 Testing

### Test 1: Send a Message (Automated)

The `procesarSeguimientos` function will automatically send messages to customers with pending orders. To test:

1. Create a test order in Firestore:

```javascript
// In Firebase Console → Firestore → pedidos_bot → Add document
{
  "ticket": "FQ-TEST-123456789",
  "cliente_nombre": "Pedro",
  "cliente_telefono": "584168542395", // Your test number
  "estado": "ENTREGADO",
  "seguimiento_enviado": false,
  "fecha_entregado": <Timestamp: now>,
  "productos": [
    {
      "nombre": "Tequeños x12"
    }
  ],
  "tipo": "delivery"
}
```

2. Wait 1 minute (or check logs immediately):

```bash
firebase functions:log --only procesarSeguimientos
```

3. Expected log output:

```
✓ WhatsApp sent successfully via Meta API!
  - Message ID: wamid.xxx
  - To: +584168542395
  - Customer: Pedro
  - Products: Tequeños x12
```

4. Check WhatsApp on your test phone for Ana's message

### Test 2: Receive a Message

1. Send a WhatsApp message to your business number (+58 416-8542395)

2. Check webhook logs:

```bash
firebase functions:log --only whatsappWebhook
```

3. Expected log output:

```
📨 Incoming WhatsApp message
Message from: 584168542395
Message: Hola Ana
✓ Response sent to customer via Meta API
```

4. You should receive Ana's response in WhatsApp

### Test 3: Manual API Test

You can test the Meta API directly with curl:

```bash
curl -X POST "https://graph.facebook.com/v21.0/805718575964429/messages" \
  -H "Authorization: Bearer YOUR_META_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "584168542395",
    "type": "text",
    "text": {
      "body": "Prueba de Ana - Full Queso. Este es un mensaje de prueba."
    }
  }'
```

Expected response:

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "584168542395",
      "wa_id": "584168542395"
    }
  ],
  "messages": [
    {
      "id": "wamid.xxx"
    }
  ]
}
```

---

## 🔍 Troubleshooting

### Error: "Invalid access token"

**Cause:** Token expired or incorrect

**Solution:**
```bash
# Generate new token from Meta Developers
# Then update Firebase secret
echo -n "NEW_TOKEN" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
firebase deploy --only functions:procesarSeguimientos,functions:whatsappWebhook
```

### Error: "Recipient phone number not in allowed list"

**Cause:** Phone number not verified or wrong Phone Number ID

**Solution:**
1. Verify Phone Number ID is correct: `805718575964429`
2. Check phone number is verified in Meta Business Manager
3. For testing, add phone numbers to allowed list in Meta Developers

### Error: "Webhook verification failed"

**Cause:** Verify token mismatch

**Solution:**
1. Ensure verify token in Meta matches: `fullqueso_webhook_verify_2025`
2. Redeploy webhook: `firebase deploy --only functions:whatsappWebhook`
3. Try webhook verification again in Meta console

### Error: "Function not found"

**Cause:** Function didn't deploy correctly

**Solution:**
```bash
# Check deployment status
firebase functions:list

# Redeploy specific function
firebase deploy --only functions:whatsappWebhook
```

---

## 📊 Monitoring

### Check Function Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only procesarSeguimientos

# Last 50 lines
firebase functions:log --lines 50

# Follow logs in real-time
firebase functions:log --follow
```

### Monitor in Firebase Console

1. Go to https://console.firebase.google.com/project/fullqueso-bot/functions
2. Click on each function to see:
   - Invocation count
   - Error rate
   - Execution time
   - Logs

### Check Meta API Status

1. Go to https://developers.facebook.com/apps/1496108368096420/
2. Click **WhatsApp** → **API Setup**
3. Check:
   - Message volume
   - Error rate
   - Phone number status

---

## 📝 Configuration Reference

### Meta WhatsApp API Endpoints

**Send Message:**
```
POST https://graph.facebook.com/v21.0/805718575964429/messages
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

**Webhook URL:**
```
https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
```

### Phone Number Formatting

The system automatically handles both Venezuelan and international formats:

- **Venezuelan:** `04168542395` → `584168542395`
- **International:** `15556406840` → `15556406840` (unchanged)

### Firebase Secrets

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `WHATSAPP_ACCESS_TOKEN` | `EAA...` | Meta WhatsApp API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | `805718575964429` | Meta Phone Number ID |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude API for generating Ana's messages |

---

## ✅ Post-Deployment Verification

After successful deployment, verify:

- [ ] `procesarSeguimientos` function is scheduled (runs every 1 minute)
- [ ] `whatsappWebhook` function is accessible via HTTPS
- [ ] Meta webhook is verified and connected
- [ ] Test message sent successfully
- [ ] Test message received successfully
- [ ] Firebase secrets are configured correctly
- [ ] No errors in Firebase logs
- [ ] KPI logging to Google Sheets still works

---

## 🎉 Success Criteria

You'll know the migration is successful when:

1. ✅ Ana sends automated follow-up messages to customers
2. ✅ Ana receives and responds to customer messages
3. ✅ No Twilio charges appear (fully on Meta API)
4. ✅ Messages appear in WhatsApp with business profile
5. ✅ Conversations are logged to Firestore
6. ✅ KPIs are tracked in Google Sheets

---

## 📞 Support

If you encounter issues:

1. Check Firebase logs: `firebase functions:log`
2. Check Meta webhook status in Developers console
3. Verify access token hasn't expired
4. Review error messages in this guide

---

**Last Updated:** 2025-11-08
**Migration Status:** Ready for Production ✅
