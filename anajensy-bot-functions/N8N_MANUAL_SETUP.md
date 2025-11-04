# N8N Manual Setup - Quick Guide

## You already have n8n open at: https://fullqueso.app.n8n.cloud/workflow/NchS8Zb8CYhAboT3

Follow these steps to configure Anajensy bot with Twilio in n8n.

---

## Step 1: Set Up Credentials (5 minutes)

### A. Twilio Credential

1. In n8n, click **"Credentials"** in the left menu
2. Click **"+ Add Credential"**
3. Search for: **"Twilio"** or **"Twilio API"**
4. Fill in:
   - **Name:** `Twilio Account - Full Queso`
   - **Account SID:** `[Get from Firebase: firebase functions:secrets:access TWILIO_ACCOUNT_SID]`
   - **Auth Token:** `[Get from Firebase: firebase functions:secrets:access TWILIO_AUTH_TOKEN]`
5. Click **Save**
6. ✅ Note: Credential created

### B. Anthropic Claude API

1. Still in Credentials, click **"+ Add Credential"**
2. Search for: **"HTTP Header Auth"** or **"Header Auth"**
3. Fill in:
   - **Name:** `Anthropic - Claude API`
   - **Header Name:** `x-api-key`
   - **Header Value:** `[Get from Firebase: firebase functions:secrets:access ANTHROPIC_API_KEY]`
4. Click **Save**
5. ✅ Note: Credential created

### C. Firebase (Google Firestore)

1. Click **"+ Add Credential"**
2. Search for: **"Google Firebase"** or **"Firestore OAuth2"**
3. Fill in:
   - **Name:** `Firebase - Full Queso Bot`
4. Click **"Connect to Google"** and authorize with your Google account
5. Select project: **fullqueso-bot**
6. Click **Save**
7. ✅ Note: Credential created

---

## Step 2: Import New Workflow (2 minutes)

1. In n8n, click **"Workflows"** in the left menu
2. Click the **"+"** button (or "+ Add Workflow")
3. Click the **three dots menu (⋮)** in the top right
4. Select **"Import from File"**
5. Select file: **`anajensy-bot-n8n-twilio-workflow.json`**
   - Location: `/Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/`
6. Click **Import**

---

## Step 3: Assign Credentials to Nodes (3 minutes)

After importing, you'll see nodes with "Credentials not set" warnings. Fix them:

### Nodes that need Twilio credential:
1. **"Send WhatsApp via Twilio"** (top flow)
2. **"Send Response"** (bottom flow)

For each:
- Click the node
- In "Credential to connect with" dropdown
- Select: **"Twilio Account - Full Queso"**

### Nodes that need Anthropic credential:
1. **"Generate Message with Claude"** (top flow)
2. **"Generate Response"** (bottom flow)

For each:
- Click the node
- In "Credential to connect with" dropdown
- Select: **"Anthropic - Claude API"**

### Nodes that need Firebase credential:
1. **"Query Verified Orders"**
2. **"Get Customer Info"**
3. **"Save Conversation"** (top flow)
4. **"Mark Order as Sent"**
5. **"Get Customer"** (bottom flow)
6. **"Get Recent Order"**
7. **"Get Conversation History"**
8. **"Save Conversation"** (bottom flow - second instance)

For each:
- Click the node
- In "Credential to connect with" dropdown
- Select: **"Firebase - Full Queso Bot"**

---

## Step 4: Get Webhook URL (1 minute)

1. Click on the **"WhatsApp Webhook"** node (first node in bottom flow)
2. Click **"Listen for test event"** or **"Test step"**
3. You'll see a webhook URL like:
   ```
   https://fullqueso.app.n8n.cloud/webhook/anajensy-whatsapp-webhook
   ```
4. **Copy this URL** - you'll need it for Twilio

---

## Step 5: Configure Twilio Webhook (2 minutes)

1. Open: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
2. Find your number: **+15558855791 (tequenosfullqueso)**
3. Click on it or click **"Edit"**
4. Look for **"When a message comes in"** section
5. Set:
   - **URL:** Paste your n8n webhook URL from Step 4
   - **Method:** POST
6. Click **Save**

---

## Step 6: Activate Workflow (1 minute)

1. In your n8n workflow
2. Click the **"Active"** toggle switch (top right)
3. It should turn green/blue
4. ✅ Workflow is now active!

---

## Step 7: Test Everything (5 minutes)

### Test 1: Scheduled Follow-up Message

1. Create a test order:
   ```bash
   cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/functions
   GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js
   ```

2. Wait 1 minute (workflow runs every minute)

3. Check your phone (+584241476748) - you should receive Ana's WhatsApp message

### Test 2: Two-Way Conversation

1. Reply to Ana's message with something like: "Sí, todo bien gracias"

2. Check n8n **"Executions"** tab - you should see a new execution

3. You should receive Ana's AI-generated response on WhatsApp

---

## Monitoring & Troubleshooting

### Check Workflow Executions:

1. Go to **"Executions"** tab in n8n
2. You'll see all runs with green (success) or red (error)
3. Click any execution to see detailed logs

### Common Issues:

**❌ "Credentials not set"**
- **Fix:** Make sure you assigned credentials to ALL nodes (see Step 3)

**❌ Firebase nodes fail**
- **Fix:** Make sure you connected Google OAuth correctly
- **Fix:** Verify project is "fullqueso-bot"

**❌ Twilio error 63016**
- **Fix:** Approved template is already configured, should work
- **Fix:** Make sure customer messaged you first (for webhook responses)

**❌ No messages received**
- **Fix:** Check workflow is Active (green toggle)
- **Fix:** Verify webhook is configured in Twilio console
- **Fix:** Check test order exists in Firestore

---

## Summary Checklist

- [ ] Twilio credential created
- [ ] Anthropic credential created
- [ ] Firebase credential created (OAuth)
- [ ] Workflow imported
- [ ] All nodes have credentials assigned
- [ ] Webhook URL copied
- [ ] Twilio webhook configured
- [ ] Workflow activated (green toggle)
- [ ] Test order created
- [ ] Received Ana's message
- [ ] Replied and got response

---

## Cost Reminder

**n8n Cloud:** ~$50/month for 44,000 executions
**Firebase Functions:** ~$6/month (current solution)

Both work identically. n8n provides visual workflow editor.

---

**Last Updated:** 2025-11-04
**Status:** Ready to configure

🎯 **Start with Step 1** in the n8n UI!
