# N8N Workflow Import Guide

Step-by-step guide to import and configure the Anajensy bot workflow in n8n.

---

## Step 1: Add Credentials to n8n

Before importing the workflow, you need to add the credentials.

### A. Add Firebase/Firestore Credential

1. In n8n, click **Credentials** in the left menu
2. Click **"+ Add Credential"**
3. Search for: **"Google Service Account"**
4. Fill in:
   - **Name:** `Firebase - Anajensy Bot`
   - **Service Account JSON:** Open the file at `/Users/pedropadilla/Downloads/anajensy-n8n-firebase-adminsdk-fbsvc-9185693959.json` and paste the entire content
5. Click **Save**
6. **Note the Credential ID** (you'll see it in the URL or credential list)

### B. Add Anthropic API Credential

1. Still in Credentials, click **"+ Add Credential"**
2. Search for: **"Header Auth"**
3. Fill in:
   - **Name:** `Anthropic - Claude API`
   - **Header Name:** `x-api-key`
   - **Header Value:** `[YOUR_ANTHROPIC_API_KEY]` (stored in Firebase Secrets)
4. Click **Save**
5. **Note the Credential ID**

---

## Step 2: Import the Workflow

1. In n8n, click **Workflows** in the left menu
2. Click **"+ Add Workflow"** or the **"+"** button
3. Click the **three dots menu (⋮)** in the top right
4. Select **"Import from File"**
5. Choose the file: `/Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/anajensy-bot-n8n-workflow.json`
6. Click **Import**

The workflow will load with all 12 nodes!

---

## Step 3: Update Credential IDs in Workflow

After importing, you need to link your credentials to the nodes.

### Nodes that need Firebase credential:
1. **Query Verified Orders**
2. **Get Customer Profile**
3. **Save Conversation**
4. **Update Order Status**

**For each of these nodes:**
1. Click on the node
2. In the **Credential** dropdown, select: `Firebase - Anajensy Bot`
3. The node will now be connected to your Firebase

### Node that needs Anthropic credential:
1. **Generate Message (Claude)**

**For this node:**
1. Click on the node
2. In the **Credential** dropdown, select: `Anthropic - Claude API`

---

## Step 4: Verify WhatsApp Configuration

The WhatsApp credentials are already hardcoded in the workflow JSON.

1. Click on the **"Send WhatsApp Message"** node
2. Verify these values are correct:
   - **URL:** `https://graph.facebook.com/v21.0/805718575964429/messages`
   - **Authorization header:** `Bearer EAASJkmRMNrMB...` (already included)

If you need to change them:
- Edit the URL to update Phone Number ID
- Edit the Authorization header to update Access Token

---

## Step 5: Configure the Schedule Trigger

1. Click on the **"Every 1 Minute"** node
2. Verify it's set to: **Every 1 minute**
3. **IMPORTANT:** Keep it **INACTIVE** for now (don't activate until testing is complete)

---

## Step 6: Review All Nodes

The workflow includes these 12 nodes in order:

1. ✓ **Every 1 Minute** - Schedule trigger
2. ✓ **Query Verified Orders** - Firestore query
3. ✓ **Split Out Orders** - Loop through results
4. ✓ **Get Customer Profile** - Firestore get
5. ✓ **Ana Personality Prompt** - Set Ana's personality (runs parallel)
6. ✓ **Prepare Customer Context** - Code node to build context
7. ✓ **Generate Message (Claude)** - HTTP to Anthropic API
8. ✓ **Format Phone Number** - Code node to format phone
9. ✓ **Send WhatsApp Message** - HTTP to Meta API
10. ✓ **Save Conversation** - Firestore create
11. ✓ **Update Order Status** - Firestore update

Click through each node and verify the configuration looks correct.

---

## Step 7: Create Test Data in Firestore

Before testing, create a test order in your Firestore database.

### Create Test Order

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: **anajensy-n8n**
3. Go to **Firestore Database**
4. Create a document in **`pedidos_bot`** collection:

```json
{
  "ticket": "TEST-001",
  "pedido_id": "test_order_123",
  "cliente_telefono": "YOUR_PHONE_NUMBER",
  "cliente_nombre": "Test Customer",
  "productos": [
    {
      "nombre": "15 CHURROS + topping de Chocolate",
      "cantidad": 1
    }
  ],
  "tipo": "delivery",
  "ubicacion": "La Florida, Caracas",
  "estado": "VERIFICADO",
  "fecha_verificado": "2025-01-30T10:00:00Z",
  "seguimiento_enviado": false
}
```

**Replace `YOUR_PHONE_NUMBER` with your actual WhatsApp number** in format: `584141234567` (Venezuelan) or `15551234567` (US)

### Create Test Customer (Optional)

Create a document in **`clientes_bot`** collection with Document ID = your phone number:

```json
{
  "nombre": "Test Customer",
  "telefono": "YOUR_PHONE_NUMBER",
  "total_pedidos": 1,
  "productos_favoritos": ["CHURROS"]
}
```

---

## Step 8: Test the Workflow

Now test the workflow manually (before enabling the schedule).

1. In n8n, make sure you're viewing the workflow
2. Click **"Test workflow"** button (top right)
3. The workflow will execute once
4. Watch each node light up as it processes

### Expected Results:

- **Query Verified Orders:** Should find your test order
- **Split Out Orders:** Should process 1 item
- **Get Customer Profile:** Should find customer (or continue if not found)
- **Prepare Customer Context:** Should build the context message
- **Generate Message (Claude):** Should return a personalized message from Ana
- **Format Phone Number:** Should format your phone to international format
- **Send WhatsApp Message:** Should send the WhatsApp message
- **Save Conversation:** Should create a record in `conversaciones_bot`
- **Update Order Status:** Should set `seguimiento_enviado = true`

### Verify Success:

1. **Check your WhatsApp** - You should receive Ana's message!
2. **Check Firestore** - The order should now have `seguimiento_enviado: true`
3. **Check Firestore** - A new conversation record should exist

---

## Step 9: Review Execution Results

1. Click on each node to see its output
2. Verify the generated message sounds like Ana (Venezuelan, warm, no emojis)
3. Check for any errors

### Common Issues:

**"No items to process"**
- Your test order might not match the filters
- Check `estado = "VERIFICADO"` and `seguimiento_enviado = false`

**"Customer not found"**
- This is OK! The workflow handles it gracefully
- Will use order data as defaults

**"WhatsApp send failed"**
- Check if your phone number is added to test numbers in Meta Business Suite
- Verify phone format is correct
- Check WhatsApp token is valid

**"Claude API error"**
- Verify API key is correct
- Check you have credits in Anthropic account

---

## Step 10: Enable for Production

Once testing is successful:

1. **Delete the test order** from Firestore (or mark it as sent)
2. **Activate the workflow:**
   - Click the **"Inactive"** toggle in the top right
   - It will change to **"Active"**
3. **The schedule trigger will now run every 1 minute**

### Monitor First Hour:

- Check executions in n8n's **"Executions"** tab
- Verify messages are sending
- Check for any errors
- Monitor Firestore updates

---

## Step 11: (Optional) Disable Firebase Cloud Function

If you want to fully migrate to n8n:

1. Go to Firebase Console
2. Go to **Functions**
3. Find **`procesarSeguimientos`**
4. Delete or disable it

**Important:** Only do this after confirming n8n is working perfectly!

---

## Workflow Diagram

```
[Every 1 Minute]
    ↓
[Query Verified Orders]
    ↓
[Split Out Orders]
    ↓
    ├─→ [Get Customer Profile] → [Prepare Customer Context]
    └─→ [Ana Personality Prompt] (parallel)
                                    ↓
                        [Generate Message (Claude)]
                                    ↓
                        [Format Phone Number]
                                    ↓
                        [Send WhatsApp Message]
                                    ↓
                        [Save Conversation]
                                    ↓
                        [Update Order Status]
```

---

## Troubleshooting

### Workflow won't import
- Make sure you selected "Import from File"
- Check the JSON file is not corrupted
- Try copying the JSON content and using "Import from URL or text"

### Credentials not connecting
- After import, manually select credentials in each node
- The credential IDs in the JSON are placeholders

### No orders found in test
- Check your Firestore project is `anajensy-n8n`
- Verify test order has correct fields
- Check timestamp format for `fecha_verificado`

### WhatsApp message not received
- Verify phone number is in test numbers (during testing phase)
- Check Meta Business Manager for message status
- Verify token hasn't expired

---

## Cost Monitoring

After enabling:

- **n8n executions:** 1440 per day (every minute)
- **Claude API calls:** Depends on number of orders processed
- **WhatsApp API calls:** Same as above
- **Firestore reads/writes:** ~4-5 per order processed

**Estimated monthly cost** (100 orders/day):
- n8n: €20-50 (depending on plan)
- Claude: $3-4
- WhatsApp: $5-10
- Total: ~$30-70/month

---

## Success Criteria

Your migration is successful when:

✅ Workflow executes every minute without errors
✅ WhatsApp messages are sent successfully
✅ Messages sound like Ana (warm, Venezuelan, personalized)
✅ Conversations are saved to Firestore
✅ Orders are marked as sent
✅ No duplicate messages sent
✅ Error handling works (continues on individual failures)

---

## Next Steps

After successful import and testing:

1. Monitor for 24-48 hours
2. Compare message quality to Firebase version
3. Check for edge cases
4. Optimize if needed (reduce frequency for low volume)
5. Add enhancements (customer response handling, analytics, etc.)

---

## Support

If you encounter issues:

1. Check n8n execution logs
2. Verify all credentials are connected
3. Test each API manually (cURL commands in `N8N_CREDENTIALS_READY.md`)
4. Review node configurations against `N8N_WORKFLOW_GUIDE.md`

---

**You're ready to import! Open n8n and follow these steps. Let me know if you hit any issues!**
