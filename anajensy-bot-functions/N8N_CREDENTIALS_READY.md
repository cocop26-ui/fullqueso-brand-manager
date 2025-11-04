# N8N Credentials - Ready to Use

All credentials collected and ready to add to n8n!

---

## ✓ 1. Firebase Service Account

**Status:** ✓ Ready
**File Location:** `/Users/pedropadilla/Downloads/anajensy-n8n-firebase-adminsdk-fbsvc-9185693959.json`

**Project Details:**
- Project ID: `anajensy-n8n`
- Service Account Email: `firebase-adminsdk-fbsvc@anajensy-n8n.iam.gserviceaccount.com`

**How to add to n8n:**
1. In n8n, go to **Credentials** → **+ Add Credential**
2. Search for: **"Google Service Account"**
3. Name: `Firebase - Anajensy Bot`
4. Paste the **entire JSON content** from the file above
5. Click **Save**

**Collections you'll access:**
- `pedidos_bot` (orders)
- `clientes_bot` (customers)
- `conversaciones_bot` (conversations)

---

## ✓ 2. Anthropic API Key

**Status:** ✓ Ready

**API Key:**
```
[STORED IN FIREBASE SECRETS - Use: firebase functions:secrets:access ANTHROPIC_API_KEY]
```

**How to add to n8n:**
1. In n8n, go to **Credentials** → **+ Add Credential**
2. Search for: **"Header Auth"**
3. Name: `Anthropic - Claude API`
4. **Header Name:** `x-api-key`
5. **Header Value:** Paste the API key above
6. Click **Save**

**Model to use:** `claude-sonnet-4-20250514`

---

## ✓ 3. WhatsApp Business API Credentials

**Status:** ✓ Ready

### Phone Number ID:
```
805718575964429
```

### Access Token:
```
EAASJkmRMNrMBPlFCq5TAZBzbeEZAK8CUXLMWY2wQcb2eNXUkQ7QkzmMmuS2voTmV60ZCOo5ZAZBTlS20vfG2acMOipjF0MD1shxuG4bRztt0a5A6poMPZCQiOTUgcY49lgmqgoldnsbPHOLldb41ZA7ouXdEsc4DXijb4P5JDuKOS7xprcpuqHUvYk5vF398luvEmqZAkZBWZCUAb2ZBIbqFTqFjheZBP0Y9ixMyQqV3XQYG8pFVZCgZDZD
```

**How to add to n8n:**

Since n8n doesn't have a native WhatsApp credential type, you'll use these directly in HTTP Request nodes.

**Option A: Hardcode in nodes** (simpler for testing)
- Use the values directly in the HTTP Request node configuration

**Option B: Use n8n environment variables** (better for production)
- Set environment variables in your n8n instance
- Reference them as `{{ $env.WHATSAPP_PHONE_NUMBER_ID }}`

**API Endpoint:**
```
https://graph.facebook.com/v21.0/805718575964429/messages
```

**Authorization Header:**
```
Bearer EAASJkmRMNrMBPlFCq5TAZBzbeEZAK8CUXLMWY2wQcb2eNXUkQ7QkzmMmuS2voTmV60ZCOo5ZAZBTlS20vfG2acMOipjF0MD1shxuG4bRztt0a5A6poMPZCQiOTUgcY49lgmqgoldnsbPHOLldb41ZA7ouXdEsc4DXijb4P5JDuKOS7xprcpuqHUvYk5vF398luvEmqZAkZBWZCUAb2ZBIbqFTqFjheZBP0Y9ixMyQqV3XQYG8pFVZCgZDZD
```

---

## Quick Test Commands

### Test Anthropic API:
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: ${ANTHROPIC_API_KEY}" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":50,"messages":[{"role":"user","content":"Say hi in Spanish"}]}'
```

### Test WhatsApp API:
```bash
curl -X POST https://graph.facebook.com/v21.0/805718575964429/messages \
  -H "Authorization: Bearer EAASJkmRMNrMBPlFCq5TAZBzbeEZAK8CUXLMWY2wQcb2eNXUkQ7QkzmMmuS2voTmV60ZCOo5ZAZBTlS20vfG2acMOipjF0MD1shxuG4bRztt0a5A6poMPZCQiOTUgcY49lgmqgoldnsbPHOLldb41ZA7ouXdEsc4DXijb4P5JDuKOS7xprcpuqHUvYk5vF398luvEmqZAkZBWZCUAb2ZBIbqFTqFjheZBP0Y9ixMyQqV3XQYG8pFVZCgZDZD" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "584141234567",
    "type": "text",
    "text": {"body": "Test from n8n setup"}
  }'
```

(Replace `584141234567` with your test WhatsApp number)

---

## Next Steps: Build n8n Workflow

Now that you have all credentials, you can:

1. **Add credentials to n8n** (follow "How to add" sections above)
2. **Start building the workflow** with these nodes:
   - Schedule Trigger (every 1 minute)
   - Firestore Query (get verified orders)
   - Split Out (loop through orders)
   - Get Customer Profile
   - Prepare Context (Code node)
   - Set Ana's Personality Prompt
   - Claude API (HTTP Request)
   - Format Phone Number (Code node)
   - Send WhatsApp (HTTP Request)
   - Save Conversation (Firestore)
   - Update Order (Firestore)

3. **Test the workflow** with test data

---

## Important Notes

### Firebase Project
- You're using a **NEW Firebase project** called `anajensy-n8n`
- This is SEPARATE from your current `fullqueso-brand-manager` project
- Make sure your Firestore data is in this project, or update the project

### WhatsApp Token
- This appears to be a **temporary token** (starts with EAAS)
- For production, consider generating a **permanent token** via System Users in Meta Business Manager
- Temporary tokens typically expire in 60-90 days

### Security
- Keep these credentials secure
- Don't commit them to git
- Use n8n's credential management system
- Consider using environment variables for WhatsApp credentials

---

## Ready to Start?

You now have everything needed to build the n8n workflow!

**Next:** Open n8n and start adding credentials, then we'll build the workflow together.
