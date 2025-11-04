# N8N Credentials Setup Guide

Follow these steps to collect all credentials needed for n8n.

---

## 1. Firebase Service Account (For Firestore)

### Steps to get the JSON file:

1. Open Firebase Console: https://console.firebase.google.com
2. Select your project: **fullqueso-brand-manager** (or your project name)
3. Click the **⚙️ gear icon** → **Project Settings**
4. Go to **"Service Accounts"** tab
5. Click **"Generate new private key"** button
6. Click **"Generate key"** in the confirmation dialog
7. A JSON file will download (e.g., `fullqueso-brand-manager-firebase-adminsdk-xxxxx.json`)

### What the JSON looks like:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://..."
}
```

**✓ Save this file** - you'll paste its entire content into n8n.

---

## 2. Anthropic API Key (For Claude)

### Option A: Get from Firebase Secrets (if already deployed)

Run this command to see your current API key:
```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/functions
firebase functions:secrets:access ANTHROPIC_API_KEY
```

### Option B: Get from Anthropic Console

1. Go to: https://console.anthropic.com
2. Log in to your account
3. Go to **API Keys** section
4. Copy your API key (starts with `sk-ant-api03-...`)

**Format:**
```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**✓ Copy this key** - you'll need it for n8n.

---

## 3. WhatsApp Business API Credentials (For Meta API)

You need TWO values from Meta/Facebook Developers.

### Steps to get them:

1. Go to: https://developers.facebook.com/
2. Select **Your App** (the app connected to WhatsApp Business)
3. In left menu, click **WhatsApp** → **API Setup**

### A. Phone Number ID

- Look for **"Phone number ID"** on the API Setup page
- It's a long number like: `123456789012345`
- Copy this value

**Format:**
```
123456789012345
```

### B. Access Token

- On the same page, look for **"Temporary access token"**
- You'll see a long string starting with `EAAG...`

**⚠️ IMPORTANT:** This temporary token expires in 24 hours!

**For Production (recommended):**
1. Click **"Generate permanent token"** or go to:
   - Business Settings → System Users → Create System User
   - Assign WhatsApp permissions
   - Generate token
   - This token won't expire

**Format:**
```
EAAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**✓ Copy both values** - you'll need them for n8n.

---

## 4. Your Firebase Project Details

For Firestore queries, you also need:

- **Project ID:** (found in Firebase Console → Project Settings)
- **Collections used:**
  - `pedidos_bot`
  - `clientes_bot`
  - `conversaciones_bot`

---

## Summary Checklist

Before proceeding to n8n setup, make sure you have:

- [ ] **Firebase Service Account JSON** (entire file content)
- [ ] **Anthropic API Key** (starts with `sk-ant-api03-`)
- [ ] **WhatsApp Phone Number ID** (numeric)
- [ ] **WhatsApp Access Token** (starts with `EAAG`)
- [ ] **Firebase Project ID** (for reference)

---

## Next: Add to n8n

Once you have all these credentials, follow these steps:

### In n8n:

1. **Open n8n** (cloud or self-hosted)
2. Go to **"Credentials"** in the left menu
3. Click **"+ Add Credential"**

### Add Firebase:
- Search: **"Google Service Account"**
- Name: `Firebase - Full Queso`
- Paste the **entire JSON** from your service account file
- Click **Save**

### Add Anthropic:
- Search: **"Header Auth"**
- Name: `Anthropic API Key`
- Header Name: `x-api-key`
- Header Value: Your Anthropic API key
- Click **Save**

### Add WhatsApp (as environment variables):
n8n doesn't have built-in WhatsApp credentials, so we'll use them directly in the HTTP node.

For now, just note them down or store them as n8n environment variables:
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`

---

## Testing Credentials

### Test Firebase:
```bash
# In your terminal
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/functions
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account.json');
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
admin.firestore().collection('pedidos_bot').limit(1).get()
  .then(() => console.log('✓ Firebase works!'))
  .catch(err => console.error('✗ Error:', err));
"
```

### Test Anthropic:
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":20,"messages":[{"role":"user","content":"Say hi"}]}'
```

### Test WhatsApp:
```bash
curl -X POST https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_NUMBER",
    "type": "text",
    "text": {"body": "Test from terminal"}
  }'
```

---

## Troubleshooting

### Firebase: "Permission Denied"
- Ensure service account has **Firestore permissions**
- Check Firestore Rules allow service account access

### Anthropic: "Authentication Error"
- Verify API key is correct and active
- Check you have credits/billing set up

### WhatsApp: "Invalid Phone Number"
- During testing, add recipient to **Test Numbers** in Meta Business Suite
- Ensure phone format is correct (no + sign, with country code)

### WhatsApp: "Invalid Token"
- Token may have expired (if temporary)
- Generate permanent token for production

---

## Ready?

Once you have all credentials collected and tested, you're ready to:

1. Add them to n8n (as shown above)
2. Start building the workflow nodes
3. Test the complete workflow

**Next Step:** Return to main conversation and confirm credentials are ready!
