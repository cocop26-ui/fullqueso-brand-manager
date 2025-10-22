# Meta WhatsApp API Migration Status

**Last Updated:** 2025-10-22
**Status:** ⏸️ PAUSED - Waiting for Meta Business Account Verification

---

## 🎯 Current Situation

The Anajensy bot has been **successfully migrated from Twilio to Meta WhatsApp Business API**. All code is complete, tested locally, and deployed to Firebase. However, we cannot test the integration because **Meta requires business verification** before allowing WhatsApp to be added as a product to apps.

---

## ✅ Completed Work

### 1. Code Migration (100% Complete)

- ✅ Removed all Twilio dependencies (`twilio` SDK)
- ✅ Implemented Meta WhatsApp Cloud API using `axios`
- ✅ Added international phone number support (Venezuelan + international formats)
- ✅ Configured Firebase Secrets for Meta credentials
- ✅ Updated Cloud Function v2 with Meta integration
- ✅ Successfully deployed to Firebase

**Key Files Modified:**
- [anajensy-bot-functions/functions/index.js](anajensy-bot-functions/functions/index.js) - Complete Meta API integration
- [anajensy-bot-functions/functions/package.json](anajensy-bot-functions/functions/package.json) - Updated dependencies

### 2. Meta App Configuration

**App Created:**
- **Name:** Anajensy Bot
- **App ID:** 1496108368096420
- **Business:** tequenosfullqueso
- **Status:** Created, awaiting verification to add WhatsApp product

**WhatsApp Number Configured:**
- **Number:** +58 416-8542395 (Test wp AnaJ)
- **Phone Number ID:** 805718575964429
- **WhatsApp Business Account ID:** 1346358903736402

### 3. Firebase Secrets Configured

```bash
# Correct Phone Number ID (Version 3)
echo -n "805718575964429" | firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID

# Access Token (EXPIRED - needs replacement after verification)
echo -n "TOKEN_GOES_HERE" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
```

**Note:** Used `echo -n` to prevent newline character in secret values.

### 4. Test Data Ready

Created test order in Firestore:
- **Document ID:** aiUpZOnaczeIhp3aZ2ef
- **Ticket:** FQ-TEST-1760995787645
- **Phone:** 04168542395 (formats to 584168542395)
- **Customer:** Pedro
- **Status:** VERIFICADO, seguimiento_enviado: false

---

## 🔴 Blocking Issue

### Meta Business Verification Required

**Problem:**
Cannot add WhatsApp as a product to "Anajensy Bot" app until Meta verifies the business account.

**Current State:**
- Business account exists: "tequenosfullqueso"
- WhatsApp number is configured: +58 416-8542395
- App is created: "Anajensy Bot" (1496108368096420)
- **Cannot add WhatsApp product** to app without verification
- **Cannot generate System User Token** with WhatsApp permissions

**What We Tried:**
1. ❌ Graph API Explorer - Only shows basic permissions, no WhatsApp permissions
2. ❌ System User Token Generation - Error: "No hay permisos disponibles"
3. ❌ WhatsApp Manager API Setup - No "API Setup" option visible
4. ❌ Adding WhatsApp as Product - Blocked until verification complete

---

## 📋 Next Steps (After Verification)

### Step 1: Add WhatsApp to Anajensy Bot App

1. Go to: https://developers.facebook.com/apps/1496108368096420/
2. In left menu, click **"Add Product"** or **"Agregar producto"**
3. Select **"WhatsApp"**
4. Complete WhatsApp setup flow
5. Connect phone number +58 416-8542395 to the app

### Step 2: Generate System User Token

Once WhatsApp is added to the app:

1. Go to: **Business Settings > System Users**
2. Click on your System User
3. Click **"Generate Token"**
4. Select app: **"Anajensy Bot"**
5. Set expiration: **60 days** or **Never**
6. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
7. **Copy the token** (only shown once!)

### Step 3: Update Firebase Secret

```bash
# Replace with new token
echo -n "NEW_SYSTEM_USER_TOKEN" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN

# Redeploy function
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions
firebase deploy --only functions:procesarSeguimientos
```

### Step 4: Test Integration

The function will automatically process the test order and send a WhatsApp message to +58 416-8542395.

**Monitor logs:**
```bash
firebase functions:log --only procesarSeguimientos
```

**Expected success log:**
```
✓ WhatsApp sent successfully via Meta!
  - Message ID: wamid.xxx
  - To: +584168542395
```

### Step 5: Verify Message Received

Check WhatsApp on +58 416-8542395 for Ana's personalized message about the test order.

---

## 🛠️ Technical Implementation Details

### Phone Number Formatting

The function handles both Venezuelan and international phone numbers:

```javascript
// Venezuelan format: 04168542395 → 584168542395
// International format: 15556406840 → 15556406840 (unchanged)

if (/^[1-9]\d{10,14}$/.test(telefono)) {
  // Already has country code
  telefonoInternacional = telefono;
} else {
  // Venezuelan number - remove leading 0, add country code 58
  const telefonoLimpio = telefono.replace(/^0/, "");
  telefonoInternacional = `58${telefonoLimpio}`;
}
```

### Meta WhatsApp Cloud API

**Endpoint:**
```
POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
```

**Headers:**
```javascript
{
  "Authorization": "Bearer {ACCESS_TOKEN}",
  "Content-Type": "application/json"
}
```

**Payload:**
```javascript
{
  "messaging_product": "whatsapp",
  "to": "584168542395",
  "type": "text",
  "text": {
    "body": "Message generated by Claude API..."
  }
}
```

### Firebase Function Configuration

```javascript
exports.procesarSeguimientos = onSchedule({
  schedule: "every 1 minutes",
  secrets: [
    "ANTHROPIC_API_KEY",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_ACCESS_TOKEN"
  ]
}, async (event) => {
  // Query Firestore for orders ready for follow-up
  // Generate personalized message with Claude
  // Send via Meta WhatsApp API
});
```

---

## 📚 Resources

### Meta Documentation
- [WhatsApp Cloud API Overview](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Send Messages](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages)
- [Phone Number Management](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers)

### Firebase Documentation
- [Cloud Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)

### Meta Business Verification
- [Business Verification Guide](https://www.facebook.com/business/help/2058515294227817)

---

## 🐛 Issues Resolved During Migration

### Issue 1: Wrong Phone Number ID
**Error:** `(#131030) Recipient phone number not in allowed list`
**Cause:** Using 837148826154684 instead of correct 805718575964429
**Fix:** Updated Firebase secret with correct Phone Number ID

### Issue 2: Newline in Secret Value
**Error:** Malformed URL `https://graph.facebook.com/v21.0/805718575964429\n/messages`
**Cause:** Using `echo` instead of `echo -n` when setting secret
**Fix:** Used `echo -n` to prevent trailing newline

### Issue 3: Expired Access Token
**Error:** `(#190) Error validating access token: Session has expired`
**Cause:** Temporary token (24-hour expiry) had expired
**Solution:** Need System User Token (60 days or permanent) - blocked by verification

---

## 💾 Backup Information

### Previous Twilio Configuration (Removed)

```javascript
// OLD - No longer in use
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

// OLD Twilio send function
async function enviarWhatsApp(telefono, mensaje) {
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.messages.create({
    from: TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:+58${telefonoLimpio}`,
    body: mensaje
  });
}
```

### Old Apps (Can be deleted after verification succeeds)

If verification completes successfully with "Anajensy Bot" app, these old apps can be safely deleted:
- Previous test apps created before "Anajensy Bot"

---

## 🎬 Ready to Resume

Once Meta business verification is complete:

1. Follow **Step 1-5** in "Next Steps" section above
2. Test with existing test order in Firestore
3. Verify message delivery to WhatsApp
4. Mark migration as 100% complete
5. Update this document with success confirmation

**Estimated time after verification:** 15-30 minutes to complete setup and testing.

---

**Project Location:** `/Users/pedropadilla/fullqueso-brand-manager/`
**Main Function:** [anajensy-bot-functions/functions/index.js](anajensy-bot-functions/functions/index.js)
**Firebase Project:** fullqueso-bot
