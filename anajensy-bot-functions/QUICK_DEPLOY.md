# Quick Deploy to n8n (Self-Hosted)

Since you have n8n self-hosted, here's the quick deploy process.

---

## Option 1: Using the Deployment Script (Recommended)

### Step 1: Get Your n8n API Key

1. Open your n8n instance in browser
2. Click your **profile** (top right) → **Settings**
3. Go to **API** section
4. Click **"Create API Key"** if you don't have one
5. Copy the API key

### Step 2: Run Setup Script

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions

# Run the setup script
./setup-n8n-api.sh
```

**You'll be asked for:**
- n8n URL (e.g., `http://localhost:5678` or `https://your-domain.com`)
- n8n API Key (paste the key from Step 1)

The script will test the connection and save your config.

### Step 3: Deploy Everything

```bash
# Deploy credentials and workflow
./deploy-to-n8n.sh
```

This will:
1. ✓ Create Firebase credential
2. ✓ Create Anthropic credential
3. ✓ Update workflow with credential IDs
4. ✓ Create workflow in n8n
5. ✓ Give you the workflow URL

**Done!** Open the URL and test the workflow.

---

## Option 2: Manual API Deploy (If scripts don't work)

### Step 1: Set Environment Variables

```bash
export N8N_URL="http://localhost:5678"  # Change to your n8n URL
export N8N_API_KEY="your_api_key_here"
```

### Step 2: Test Connection

```bash
curl -X GET "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Accept: application/json"
```

You should see your existing workflows (or empty list).

### Step 3: Create Firebase Credential

```bash
curl -X POST "$N8N_URL/api/v1/credentials" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Firebase - Anajensy Bot",
    "type": "googleFirestoreOAuth2Api",
    "data": {
      "email": "firebase-adminsdk-fbsvc@anajensy-n8n.iam.gserviceaccount.com",
      "privateKey": "'"$(cat /Users/pedropadilla/Downloads/anajensy-n8n-firebase-adminsdk-fbsvc-9185693959.json | jq -r .private_key)"'",
      "projectId": "anajensy-n8n"
    }
  }'
```

**Save the credential ID from the response!**

### Step 4: Create Anthropic Credential

```bash
curl -X POST "$N8N_URL/api/v1/credentials" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anthropic - Claude API",
    "type": "httpHeaderAuth",
    "data": {
      "name": "x-api-key",
      "value": "[YOUR_ANTHROPIC_API_KEY]"
    }
  }'
```

**Save the credential ID from the response!**

### Step 5: Update Workflow JSON

Edit the file `anajensy-bot-n8n-workflow.json` and replace all instances of:
- `"REPLACE_WITH_YOUR_FIREBASE_CREDENTIAL_ID"` → Use the Firebase credential ID
- `"REPLACE_WITH_YOUR_ANTHROPIC_CREDENTIAL_ID"` → Use the Anthropic credential ID

### Step 6: Deploy Workflow

```bash
curl -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @anajensy-bot-n8n-workflow.json
```

**Save the workflow ID from the response!**

### Step 7: Open Workflow

Open in browser: `$N8N_URL/workflow/{WORKFLOW_ID}`

---

## Option 3: Manual Import (Easiest for Self-Hosted)

If the API is not enabled or you prefer manual setup:

### Step 1: Add Credentials Manually

1. Open n8n: `http://localhost:5678` (or your URL)
2. Go to **Credentials** → **+ Add Credential**

**Add Firebase:**
- Type: "Google Service Account"
- Name: `Firebase - Anajensy Bot`
- Paste entire JSON from: `/Users/pedropadilla/Downloads/anajensy-n8n-firebase-adminsdk-fbsvc-9185693959.json`
- Save

**Add Anthropic:**
- Type: "Header Auth"
- Name: `Anthropic - Claude API`
- Header Name: `x-api-key`
- Header Value: `[YOUR_ANTHROPIC_API_KEY]`
- Save

### Step 2: Import Workflow

1. In n8n, go to **Workflows**
2. Click **"+ Add Workflow"**
3. Click the **three dots (⋮)** menu (top right)
4. Select **"Import from File"**
5. Choose: `anajensy-bot-n8n-workflow.json`
6. Click **Import**

### Step 3: Connect Credentials

Click each node that needs credentials:
- **Query Verified Orders** → Select "Firebase - Anajensy Bot"
- **Get Customer Profile** → Select "Firebase - Anajensy Bot"
- **Generate Message (Claude)** → Select "Anthropic - Claude API"
- **Save Conversation** → Select "Firebase - Anajensy Bot"
- **Update Order Status** → Select "Firebase - Anajensy Bot"

### Step 4: Save Workflow

Click **Save** button (top right)

---

## Which Option Should You Use?

**Use Option 1 (Scripts)** if:
- You're comfortable with command line
- You want automated deployment
- You might redeploy multiple times

**Use Option 3 (Manual)** if:
- You prefer GUI
- First time setting up n8n
- Want to see each step visually

---

## After Deployment

### Create Test Data

Create a test order in Firestore:

1. Go to Firebase Console: https://console.firebase.google.com
2. Project: `anajensy-n8n`
3. Firestore Database → `pedidos_bot`
4. Add document:

```json
{
  "ticket": "TEST-001",
  "pedido_id": "test_123",
  "cliente_telefono": "YOUR_PHONE",
  "cliente_nombre": "Test Customer",
  "productos": [
    {"nombre": "15 CHURROS", "cantidad": 1}
  ],
  "tipo": "delivery",
  "estado": "VERIFICADO",
  "fecha_verificado": "2025-01-30T10:00:00Z",
  "seguimiento_enviado": false
}
```

Replace `YOUR_PHONE` with your WhatsApp number (format: `584141234567`)

### Test Workflow

1. In n8n, open the workflow
2. Click **"Test Workflow"** button
3. Watch it execute
4. Check your WhatsApp for the message!

### Activate Workflow

Once testing works:
1. Toggle **"Inactive"** to **"Active"**
2. The workflow will run every 1 minute automatically

---

## Troubleshooting

### "jq: command not found" (when running scripts)

Install jq:
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq  # Debian/Ubuntu
sudo yum install jq      # CentOS/RHEL
```

### "API not enabled"

Enable API in n8n:
1. Check your n8n environment variables
2. Ensure API is not disabled
3. For docker: Add `-e N8N_API_ENABLED=true`

### Can't access n8n URL

Check if n8n is running:
```bash
# If running with docker
docker ps | grep n8n

# If running as service
systemctl status n8n
```

---

## Your Self-Hosted Setup

Since you're self-hosted:

- **Advantage:** Full control, no execution limits
- **Advantage:** Can run 24/7 without subscription costs
- **Note:** Make sure your server stays online
- **Note:** Consider setting up SSL/HTTPS for production

When you migrate to cloud later, you can export the workflow and import it to n8n.cloud.

---

## Ready to Deploy?

Choose your preferred option above and let me know if you need help!
