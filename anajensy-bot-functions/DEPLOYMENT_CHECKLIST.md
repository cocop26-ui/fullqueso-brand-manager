# 🚀 Meta WhatsApp API - Deployment Checklist

**Date:** 2025-11-08
**Your Token:** ✅ Ready
**Your Phone:** +584241476748 (584241476748)

---

## ✅ Pre-Deployment (Already Complete)

- [x] Meta access token obtained
- [x] Code migration complete
- [x] Twilio dependency removed
- [x] Meta API integration implemented
- [x] Test script created

---

## 📋 Deployment Steps

### Step 1: Configure Firebase Secrets ⏳

Run on your **local machine** in Terminal:

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions

# Run the configuration script
./configure-secrets.sh
```

**What this does:**
- Sets `WHATSAPP_ACCESS_TOKEN` with your Meta token
- Sets `WHATSAPP_PHONE_NUMBER_ID` to 805718575964429

**Expected output:**
```
✅ Firebase secrets configured successfully!
```

---

### Step 2: Install Dependencies ⏳

Still in the same directory:

```bash
cd functions
npm install
cd ..
```

**What this does:**
- Removes old Twilio package
- Ensures all dependencies are up to date

**Expected output:**
```
added X packages, removed 1 package
```

---

### Step 3: Deploy to Firebase ⏳

```bash
firebase deploy --only functions
```

**What this does:**
- Deploys `procesarSeguimientos` (scheduled function)
- Deploys `whatsappWebhook` (webhook receiver)
- Deploys `backupFirestore` (backup function)

**Expected output:**
```
✔ functions: Finished running predeploy script.
✔ functions[us-central1-procesarSeguimientos(us-central1)] Successful update operation.
✔ functions[us-central1-whatsappWebhook(us-central1)] Successful update operation.
✔ Deploy complete!
```

**Deployment time:** 2-5 minutes

---

### Step 4: Configure Meta Webhook ⏳

**4.1 - Get Webhook URL**

After deployment, your webhook URL is:
```
https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
```

**4.2 - Configure in Meta Console**

1. Go to: https://developers.facebook.com/apps/1496108368096420/
2. Click **WhatsApp** in left menu
3. Click **Configuration**
4. Find the **Webhook** section
5. Click **Edit**
6. Enter:
   - **Callback URL:** `https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook`
   - **Verify Token:** `fullqueso_webhook_verify_2025`
7. Click **Verify and Save**

**Expected result:**
```
✅ Webhook verified successfully
```

**4.3 - Subscribe to Webhook Fields**

Still in Webhook section:
1. Find **Webhook fields** section
2. Click **Manage**
3. Subscribe to:
   - ✅ **messages** (required)
   - ✅ **message_status** (optional - for delivery receipts)
4. Click **Save**

---

### Step 5: Test the Integration ⏳

**Test 1: Send Automated Message**

Create a test order in Firestore Console:

1. Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore
2. Click **pedidos_bot** collection
3. Click **Add document**
4. Enter:
   - **Document ID:** (auto-generated)
   - **Fields:**
     ```
     ticket: "FQ-TEST-123456789"
     cliente_nombre: "Test User"
     cliente_telefono: "584241476748"
     estado: "ENTREGADO"
     seguimiento_enviado: false
     fecha_entregado: [Timestamp: now]
     productos: [Array]
       └─ 0: [Map]
          └─ nombre: "Tequeños x12"
     tipo: "delivery"
     ```
5. Click **Save**
6. Wait 1-2 minutes
7. Check WhatsApp on `+584241476748` for Ana's message

**Expected:** You should receive a personalized message from Ana about the test order

**Test 2: Receive and Reply**

1. Send a WhatsApp message to **+58 416-8542395** from `+584241476748`
2. Say: "Hola Ana"
3. Wait 2-5 seconds
4. You should receive Ana's response

**Expected:** Ana responds to your message automatically

**Test 3: Check Firebase Logs**

```bash
# Check automated message function
firebase functions:log --only procesarSeguimientos --lines 20

# Check webhook function
firebase functions:log --only whatsappWebhook --lines 20
```

**Expected log output:**
```
✓ WhatsApp sent successfully via Meta API!
  - Message ID: wamid.xxx
  - To: +584241476748
```

---

## 🎉 Success Criteria

Mark each item when complete:

- [ ] Firebase secrets configured (Step 1)
- [ ] Dependencies installed (Step 2)
- [ ] Functions deployed successfully (Step 3)
- [ ] Meta webhook verified (Step 4)
- [ ] Test order message received (Test 1)
- [ ] Reply message received (Test 2)
- [ ] Logs show successful API calls (Test 3)

---

## ⚠️ Troubleshooting

### Issue: "Secret WHATSAPP_ACCESS_TOKEN not found"

**Solution:**
```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions
./configure-secrets.sh
firebase deploy --only functions
```

### Issue: "Webhook verification failed"

**Possible causes:**
- Wrong verify token (must be exactly `fullqueso_webhook_verify_2025`)
- Function not deployed yet
- Wrong webhook URL

**Solution:**
1. Verify function is deployed: `firebase functions:list`
2. Check webhook URL is correct
3. Retry webhook verification in Meta console

### Issue: "Error 190: Access token expired"

**Solution:**
1. Generate new token from Meta Developers
2. Update the token in `configure-secrets.sh`
3. Run: `./configure-secrets.sh`
4. Redeploy: `firebase deploy --only functions`

### Issue: "Error 131030: Recipient not in allowed list"

**Solution:**
1. Go to Meta Developers → WhatsApp → API Setup
2. Add `584241476748` to allowed phone numbers
3. Or wait for business verification to message any number

### Issue: "No message received on WhatsApp"

**Check:**
1. Firebase logs: `firebase functions:log --only procesarSeguimientos`
2. Firestore: verify test order has `seguimiento_enviado: true`
3. Meta API status: check for errors in logs

---

## 📊 Monitoring

After successful deployment, monitor these:

### Firebase Console
- Functions: https://console.firebase.google.com/project/fullqueso-bot/functions
- Logs: Check invocation count and errors
- Costs: Monitor function execution costs

### Meta Console
- Developers: https://developers.facebook.com/apps/1496108368096420/
- WhatsApp → Analytics: Message volume
- Webhook status: Verify active

### Google Sheets
- KPI tracking should continue working
- Check new interactions are logged

---

## 🎬 Next Steps After Deployment

Once everything is working:

1. ✅ Remove test order from Firestore
2. ✅ Monitor for 24 hours
3. ✅ Verify automated follow-ups are sent
4. ✅ Check customer responses are handled
5. ✅ Review KPI logs in Google Sheets
6. ✅ Mark META_MIGRATION_STATUS.md as production-ready

---

## 📞 Need Help?

**Check logs:**
```bash
firebase functions:log --follow
```

**Check function status:**
```bash
firebase functions:list
```

**Verify secrets:**
```bash
firebase functions:secrets:access WHATSAPP_ACCESS_TOKEN
firebase functions:secrets:access WHATSAPP_PHONE_NUMBER_ID
```

---

**Last Updated:** 2025-11-08
**Status:** Ready for Deployment
