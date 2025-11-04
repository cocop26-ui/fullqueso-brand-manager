# N8N Setup Guide - Anajensy Bot with Twilio

## Prerequisites

You already have:
- ✅ n8n instance: `https://fullqueso.app.n8n.cloud`
- ✅ n8n API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ Twilio WhatsApp working (tested yesterday)
- ✅ Anthropic Claude API working
- ✅ Firebase project: fullqueso-bot

## Step 1: Configure Credentials in n8n

### A. Add Firebase Credential

1. Go to: https://fullqueso.app.n8n.cloud/credentials
2. Click **"+ Add Credential"**
3. Search for: **"Google Firebase Cloud Firestore OAuth2 API"**
4. Configure:
   - **Name:** `Firebase - Full Queso Bot`
   - **Authentication:** OAuth2
   - Click **Connect to Google** and authorize
5. **Save** and note the credential ID

### B. Add Twilio Credential

1. Still in Credentials, click **"+ Add Credential"**
2. Search for: **"Twilio API"**
3. Fill in:
   - **Name:** `Twilio Account`
   - **Account SID:** `[Use environment variable or get from Twilio console]`
   - **Auth Token:** `[Use environment variable or get from Twilio console]`
4. **Save** and note the credential ID

### C. Add Anthropic Claude API Credential

1. Click **"+ Add Credential"**
2. Search for: **"Header Auth"**
3. Fill in:
   - **Name:** `Anthropic - Claude API`
   - **Header Name:** `x-api-key`
   - **Header Value:** `[YOUR_ANTHROPIC_API_KEY]`
4. **Save** and note the credential ID

---

## Step 2: Import the Workflow

1. In n8n, go to **Workflows**
2. Click the **"+"** button (top right)
3. Click the **three dots menu (⋮)**
4. Select **"Import from File"**
5. Choose: `anajensy-bot-n8n-twilio-workflow.json`
6. Click **Import**

---

## Step 3: Update Credential References

After importing, you need to replace the placeholder credential IDs:

### Find and Replace in the Workflow:

1. Click on each node that says "Credentials not set"
2. Select the appropriate credential from the dropdown:
   - **Firebase nodes** → Select `Firebase - Full Queso Bot`
   - **Twilio nodes** → Select `Twilio Account`
   - **Claude AI nodes** → Select `Anthropic - Claude API`

### Quick Method (if using workflow editor):

Open each of these nodes and set credentials:
- Query Verified Orders
- Get Customer Info
- Get Customer (webhook)
- Get Recent Order
- Get Conversation History
- Save Conversation (both instances)
- Mark Order as Sent
- Generate Message with Claude
- Generate Response
- Send WhatsApp via Twilio
- Send Response

---

## Step 4: Configure Twilio Webhook

The workflow includes a webhook endpoint for receiving incoming WhatsApp messages.

### Get Your Webhook URL:

1. Click on the **"WhatsApp Webhook"** node (first node in bottom flow)
2. Click **"Test step"** or **"Listen for test event"**
3. Copy the webhook URL shown (e.g., `https://fullqueso.app.n8n.cloud/webhook/anajensy-whatsapp-webhook`)

### Configure in Twilio:

1. Go to: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
2. Click on your WhatsApp number: **+15558855791 (tequenosfullqueso)**
3. In **"When a message comes in"**:
   - **URL:** Paste your n8n webhook URL
   - **Method:** POST
4. **Save**

---

## Step 5: Activate the Workflow

1. Make sure all nodes are configured correctly
2. Click the **"Active"** toggle in the top right
3. The workflow will now:
   - Run every 1 minute to check for new verified orders
   - Send follow-up messages via Twilio WhatsApp
   - Listen for customer replies and respond with AI

---

## Step 6: Test the Workflow

### Test Scheduled Messages:

1. Create a test order:
```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js
```

2. Wait 1 minute for the workflow to run
3. Check your phone (+584241476748) for Ana's message

### Test Webhook (Customer Replies):

1. Reply to Ana's WhatsApp message
2. Check n8n workflow executions to see it process
3. You should receive Ana's AI-generated response

---

## Workflow Overview

### Flow 1: Scheduled Follow-ups (Top Row)

```
Every 1 Minute
  ↓
Query Verified Orders (Firestore)
  ↓
Split Out Orders
  ↓
Get Customer Info (Firestore)
  ↓
Prepare Context (Code)
  ↓
Generate Message with Claude (Anthropic AI)
  ↓
Send WhatsApp via Twilio
  ↓
Save Conversation (Firestore)
  ↓
Mark Order as Sent (Firestore)
```

### Flow 2: Incoming Messages (Bottom Row)

```
WhatsApp Webhook (Twilio → n8n)
  ↓
Parse Webhook Data (Code)
  ↓
Get Customer (Firestore)
  ↓
Get Recent Order (Firestore)
  ↓
Get Conversation History (Firestore)
  ↓
Build AI Context (Code)
  ↓
Generate Response (Anthropic AI)
  ↓
Send Response (Twilio)
  ↓
Save Conversation (Firestore)
  ↓
Respond OK (to Twilio)
```

---

## Monitoring & Debugging

### Check Workflow Executions:

1. Go to **Executions** tab in n8n
2. You'll see all workflow runs
3. Click on any execution to see detailed logs
4. Green = Success, Red = Error

### Common Issues:

**❌ "Credentials not set"**
- Solution: Assign the correct credential to each node

**❌ Firebase query returns empty**
- Solution: Make sure you have test orders in `pedidos_bot` collection

**❌ Twilio error 63016**
- Solution: Make sure you're using the approved template (ContentSid)

**❌ Claude API error**
- Solution: Check your Anthropic API key has credits

---

## Cost Estimation (n8n Cloud)

n8n cloud charges per workflow execution:

- **Free tier:** 2,500 executions/month
- **Starter:** $20/month (5,000 executions)
- **Pro:** $50/month (10,000 executions)

### Estimated Usage:

**Scheduled task:**
- Runs every 1 minute = 1,440 executions/day
- 43,200 executions/month

**Webhook:**
- ~1,000 customer messages/month

**Total:** ~44,000 executions/month → **Requires Pro plan ($50/month)**

### Cost Comparison:

| Solution | Monthly Cost |
|----------|-------------|
| Firebase Functions | ~$6 (1000 orders + Claude API) |
| n8n Pro | $50 + $6 = $56 |
| **Recommendation** | **Keep Firebase Functions** |

---

## Recommendation

While n8n provides a nice visual workflow, the costs are significantly higher than Firebase Functions.

**I recommend:**
- ✅ Keep using Firebase Functions (already working, lower cost)
- Use n8n only if you need the visual workflow editor
- Consider reducing scheduled task frequency (e.g., every 5 minutes instead of 1)

Would you like to:
- **Option A:** Continue with n8n setup (visual workflow, higher cost)
- **Option B:** Keep Firebase Functions (current working solution, lower cost)
- **Option C:** Set up both and compare

---

**Last Updated:** 2025-11-04
