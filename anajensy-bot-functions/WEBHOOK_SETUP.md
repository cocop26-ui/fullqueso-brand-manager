# 🔗 Meta Webhook Configuration Guide

**Status:** ✅ Templates Approved
**Required:** Configure webhook to receive customer replies

---

## 📋 Quick Reference

**Webhook URL:** Get from `firebase functions:list` (after deployment)
**Verify Token:** `fullqueso_webhook_verify_2025`
**Subscribe to:** `messages`

---

## 🚀 Step-by-Step Configuration

### Step 1: Deploy Functions First

```bash
cd /home/user/fullqueso-brand-manager/anajensy-bot-functions
./deploy-ana-now.sh
```

This will deploy the `whatsappWebhook` function and show you the URL.

---

### Step 2: Get Webhook URL

After deployment, run:

```bash
firebase functions:list
```

Look for the `whatsappWebhook` function and copy its URL.

**Example URL:**
```
https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
```

---

### Step 3: Configure in Meta

1. **Go to Meta for Developers:**
   - https://developers.facebook.com/apps

2. **Select your WhatsApp Business App**

3. **Navigate to WhatsApp → Configuration**
   - Left sidebar: Click "WhatsApp"
   - Click "Configuration"

4. **In the Webhook section, click "Edit"**

5. **Configure webhook settings:**

   **Callback URL:**
   ```
   [Paste your whatsappWebhook URL from Step 2]
   ```

   **Verify Token:**
   ```
   fullqueso_webhook_verify_2025
   ```

6. **Click "Verify and Save"**

   ✅ If successful: You'll see "Webhook verified successfully"

   ❌ If failed: Check that:
   - Function is deployed
   - URL is correct (no trailing slash)
   - Verify token matches exactly

7. **Subscribe to Webhook Fields**

   After verification, you'll see webhook fields.

   **Check these boxes:**
   - ✅ `messages` (REQUIRED - this is the main one!)
   - ✅ `message_status` (optional but recommended)

8. **Click "Save"**

---

## ✅ Verification

### Test 1: Webhook is Receiving

After configuration, send a test message to your WhatsApp Business number.

**Monitor webhook:**
```bash
firebase functions:log --only whatsappWebhook --follow
```

**Expected log:**
```
📨 Incoming WhatsApp message
Message from: [phone number]
Message: [message text]
✓ Response sent to customer via Meta API
```

---

### Test 2: Complete Flow

1. **Add test order to Firestore:**
```bash
node add-pedro-test-order.js
```

2. **Wait 1-2 minutes** (Ana checks every minute)

3. **Check WhatsApp on +584241476748**
   - Should receive: "Hola Pedro Padilla! Gracias por tu pedido de Churros Choco Arequipe x15..."

4. **Reply to Ana**
   - Ana should respond automatically

5. **Check logs:**
```bash
firebase functions:log --follow
```

---

## 🐛 Troubleshooting

### Webhook verification fails

**Problem:** "Verification failed" when clicking "Verify and Save"

**Solutions:**
1. Ensure function is deployed:
   ```bash
   firebase deploy --only functions
   ```

2. Check verify token is exactly:
   ```
   fullqueso_webhook_verify_2025
   ```
   (case-sensitive, no spaces)

3. Test webhook manually:
   ```bash
   curl "YOUR_WEBHOOK_URL?hub.mode=subscribe&hub.verify_token=fullqueso_webhook_verify_2025&hub.challenge=test"
   ```
   Should return: `test`

---

### Webhook verified but not receiving messages

**Problem:** Webhook verified successfully but no logs when customer replies

**Solutions:**

1. **Check subscription:**
   - Go back to Meta app → WhatsApp → Configuration
   - Scroll to "Webhook fields"
   - Ensure `messages` is checked ✅

2. **Check phone number:**
   - WhatsApp → API Setup
   - Verify phone number `805718575964429` is active

3. **Monitor logs:**
   ```bash
   firebase functions:log --only whatsappWebhook --follow
   ```
   Send a test message and watch for activity

---

### Ana sends initial message but doesn't respond

**Problem:** Template message works, but Ana doesn't reply to customer responses

**Check:**

1. **Webhook subscription:**
   - Meta app → WhatsApp → Configuration
   - Webhook fields → `messages` must be checked ✅

2. **Secrets configured:**
   ```bash
   firebase functions:secrets:list
   ```
   Must show:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `ANTHROPIC_API_KEY`

3. **Function deployed:**
   ```bash
   firebase functions:list
   ```
   Must show: `whatsappWebhook`

---

## 📊 Webhook URL Examples

**Correct formats:**
```
✅ https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
✅ https://us-east1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
```

**Incorrect formats:**
```
❌ https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook/
    (has trailing slash)

❌ http://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
    (http instead of https)

❌ us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
    (missing https://)
```

---

## 🎯 Quick Summary

**What the webhook does:**
- Receives customer WhatsApp messages from Meta
- Triggers Ana's response generation (Claude AI)
- Sends Ana's reply back to customer
- Saves conversation to Firestore

**Configuration:**
- URL: From `firebase functions:list`
- Token: `fullqueso_webhook_verify_2025`
- Subscribe: `messages` ✅

**After setup:**
- Customer messages → Meta → Webhook → Ana responds → Customer
- Fully automatic! 🎉

---

## 🔍 Monitoring

**Watch webhook activity:**
```bash
firebase functions:log --only whatsappWebhook --follow
```

**Watch Ana processing orders:**
```bash
firebase functions:log --only procesarSeguimientos --follow
```

**Watch all functions:**
```bash
firebase functions:log --follow
```

---

## ✅ Success Checklist

After webhook configuration:

- [ ] Webhook verified in Meta app
- [ ] `messages` field subscribed
- [ ] Test message triggers webhook logs
- [ ] Ana sends initial template message
- [ ] Customer reply triggers Ana response
- [ ] Conversation saved to Firestore
- [ ] Survey completed after email capture

When all checked: Ana is fully automatic! 🚀

---

## 📞 Support

**Meta Webhook Issues:**
- Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

**Firebase Function Issues:**
- Check logs: `firebase functions:log --follow`
- Console: https://console.firebase.google.com/project/fullqueso-bot/functions

**Firestore Data:**
- Console: https://console.firebase.google.com/project/fullqueso-bot/firestore
