# N8N Migration Checklist

Complete checklist to ensure feature parity between Firebase Cloud Functions and n8n implementation.

---

## Phase 1: Pre-Migration Setup

### n8n Environment Setup
- [ ] **n8n instance deployed** (cloud or self-hosted)
  - [ ] If cloud: Signed up and workspace created
  - [ ] If self-hosted: Server provisioned and n8n installed
  - [ ] n8n accessible and login working

### Credential Configuration
- [ ] **Firebase/Firestore Credentials**
  - [ ] Service account JSON downloaded from Firebase Console
  - [ ] Credential added to n8n (name: `Firebase - Full Queso`)
  - [ ] Test connection successful
  - [ ] Permissions verified (read/write to collections)

- [ ] **Anthropic API Key**
  - [ ] API key obtained from https://console.anthropic.com
  - [ ] Starts with `sk-ant-api03-...`
  - [ ] Credential added to n8n (name: `Anthropic - Claude`)
  - [ ] Test API call successful
  - [ ] Billing/credits confirmed available

- [ ] **Meta WhatsApp API Credentials**
  - [ ] WHATSAPP_PHONE_NUMBER_ID obtained
  - [ ] WHATSAPP_ACCESS_TOKEN obtained (permanent token for production)
  - [ ] Credentials added to n8n as environment variables
  - [ ] Test WhatsApp send successful
  - [ ] Phone number verified and approved in Meta Business Suite

### Documentation Review
- [ ] Read `N8N_WORKFLOW_GUIDE.md` completely
- [ ] Read `N8N_API_PAYLOADS.md` for API reference
- [ ] Have `ANAJENSY_PROMPT.txt` ready for copy-paste
- [ ] Understand current Firebase implementation in `functions/index.js`

---

## Phase 2: Workflow Construction

### Basic Structure
- [ ] **Create new workflow** in n8n (name: `Anajensy Follow-up Bot`)
- [ ] **Add Schedule Trigger**
  - [ ] Trigger type: Schedule
  - [ ] Interval: Every 1 minute
  - [ ] Status: Inactive (for testing)

### Data Retrieval Nodes
- [ ] **Node: Query Verified Orders**
  - [ ] Type: Firestore
  - [ ] Operation: Query Documents
  - [ ] Collection: `pedidos_bot`
  - [ ] Filter 1: `estado == "VERIFICADO"`
  - [ ] Filter 2: `seguimiento_enviado == false`
  - [ ] Filter 3: `fecha_verificado <= NOW()`
  - [ ] Return all: Yes
  - [ ] Test query returns expected orders

- [ ] **Node: Split Out**
  - [ ] Connected to Query node
  - [ ] Mode: Each Item
  - [ ] Test splits multiple orders correctly

- [ ] **Node: Get Customer Profile**
  - [ ] Type: Firestore
  - [ ] Operation: Get Document
  - [ ] Collection: `clientes_bot`
  - [ ] Document ID: `{{ $json.cliente_telefono }}`
  - [ ] Continue on fail: Yes
  - [ ] Test retrieves customer data

### Processing Nodes
- [ ] **Node: Prepare Customer Context**
  - [ ] Type: Code (JavaScript)
  - [ ] Code copied from `N8N_WORKFLOW_GUIDE.md`
  - [ ] References previous nodes correctly
  - [ ] Test output includes `contextoCliente` field
  - [ ] Test handles missing customer profile (first-time buyer)

- [ ] **Node: Ana Personality Prompt** (optional helper)
  - [ ] Type: Set
  - [ ] Field: `prompt`
  - [ ] Value: Copied from `ANAJENSY_PROMPT.txt`
  - [ ] Placed before Claude API node

- [ ] **Node: Generate Message with Claude**
  - [ ] Type: HTTP Request
  - [ ] Method: POST
  - [ ] URL: `https://api.anthropic.com/v1/messages`
  - [ ] Headers configured (see `N8N_API_PAYLOADS.md`)
  - [ ] Authentication: API key header
  - [ ] Body: JSON with system prompt and user message
  - [ ] Model: `claude-sonnet-4-20250514`
  - [ ] Max tokens: `300`
  - [ ] Timeout: 30 seconds
  - [ ] Test generates personalized message
  - [ ] Test message quality matches Firebase version

- [ ] **Node: Format Phone Number**
  - [ ] Type: Code (JavaScript)
  - [ ] Code copied from `N8N_WORKFLOW_GUIDE.md`
  - [ ] Test Venezuelan local format (04241234567) → 584241234567
  - [ ] Test already international format (584241234567) → 584241234567
  - [ ] Test other countries (e.g., +1 USA numbers)

### Communication Node
- [ ] **Node: Send WhatsApp Message**
  - [ ] Type: HTTP Request
  - [ ] Method: POST
  - [ ] URL: `https://graph.facebook.com/v21.0/{PHONE_ID}/messages`
  - [ ] Headers: Authorization Bearer token
  - [ ] Body: JSON with messaging_product, to, type, text
  - [ ] Phone number field: `{{ $json.telefonoInternacional }}`
  - [ ] Message field: `{{ $json.mensajeAna }}`
  - [ ] Continue on fail: Yes (critical!)
  - [ ] Retry: 2 times
  - [ ] Test sends message successfully
  - [ ] Test receives WhatsApp message on phone

### Data Persistence Nodes
- [ ] **Node: Save Conversation Record**
  - [ ] Type: Firestore
  - [ ] Operation: Create Document
  - [ ] Collection: `conversaciones_bot`
  - [ ] Auto-generate ID: Yes
  - [ ] Fields mapped correctly (see `N8N_WORKFLOW_GUIDE.md`)
  - [ ] Required fields:
    - [ ] cliente_telefono
    - [ ] cliente_nombre
    - [ ] pedido_ticket
    - [ ] pedido_id
    - [ ] mensaje_ana
    - [ ] fecha (current timestamp)
    - [ ] tipo_interaccion: `"seguimiento_post_verificacion"`
    - [ ] sentimiento: `"neutral"`
    - [ ] requiere_atencion: `false`
  - [ ] Test creates document in Firestore

- [ ] **Node: Update Order Status**
  - [ ] Type: Firestore
  - [ ] Operation: Update Document
  - [ ] Collection: `pedidos_bot`
  - [ ] Document ID: `{{ $json.pedidoId }}`
  - [ ] Fields to update:
    - [ ] seguimiento_enviado: `true`
    - [ ] seguimiento_fecha: current timestamp
  - [ ] Test updates order correctly
  - [ ] Test order not picked up in next query

### Error Handling
- [ ] **Global workflow settings**
  - [ ] Error workflow: (optional) separate error handler
  - [ ] Execution order: Sequential (for now)

- [ ] **Per-node error handling**
  - [ ] Customer profile node: Continue on fail
  - [ ] Claude API: Retry 2 times, log errors
  - [ ] WhatsApp API: Continue on fail, retry 2 times
  - [ ] Firestore operations: Stop on fail (data integrity)

---

## Phase 3: Testing

### Single Order Test
- [ ] **Create test order** in Firestore:
  ```
  Collection: pedidos_bot
  Fields:
    - ticket: "TEST-001"
    - cliente_telefono: YOUR_TEST_NUMBER
    - cliente_nombre: "Test Customer"
    - productos: [{"nombre": "Test Product", "cantidad": 1}]
    - tipo: "delivery"
    - estado: "VERIFICADO"
    - fecha_verificado: (2 minutes ago)
    - seguimiento_enviado: false
  ```

- [ ] **Create test customer** in Firestore:
  ```
  Collection: clientes_bot
  Document ID: YOUR_TEST_NUMBER
  Fields:
    - nombre: "Test Customer"
    - telefono: YOUR_TEST_NUMBER
    - total_pedidos: 1
  ```

- [ ] **Run workflow manually**
  - [ ] Click "Test Workflow" in n8n
  - [ ] Query finds test order
  - [ ] Customer profile retrieved
  - [ ] Context built correctly
  - [ ] Claude generates appropriate message
  - [ ] Phone number formatted correctly
  - [ ] WhatsApp message sent
  - [ ] Message received on phone
  - [ ] Conversation saved to Firestore
  - [ ] Order updated (seguimiento_enviado = true)

- [ ] **Verify in Firestore Console**
  - [ ] Order marked as sent
  - [ ] Conversation record exists
  - [ ] All fields populated correctly

### Multiple Orders Test
- [ ] **Create 3 test orders** (different customers)
- [ ] **Run workflow manually**
  - [ ] All 3 orders processed
  - [ ] All 3 messages sent
  - [ ] All 3 conversations saved
  - [ ] All 3 orders updated

### Edge Cases
- [ ] **Test with missing customer profile**
  - [ ] Create order without corresponding customer
  - [ ] Workflow handles gracefully
  - [ ] Uses order data for defaults

- [ ] **Test with first-time customer**
  - [ ] Customer with total_pedidos = 1
  - [ ] Message mentions "primer pedido"

- [ ] **Test with returning customer**
  - [ ] Customer with total_pedidos > 1
  - [ ] Message references order history

- [ ] **Test phone number formats**
  - [ ] Venezuelan local: 04241234567
  - [ ] Venezuelan without 0: 4241234567
  - [ ] Already international: 584241234567
  - [ ] All format correctly to 584241234567

- [ ] **Test error scenarios**
  - [ ] Invalid WhatsApp phone (should log error, continue)
  - [ ] Claude API timeout (should retry)
  - [ ] Temporarily disable WhatsApp credentials (should fail gracefully)

### Message Quality Comparison
- [ ] **Generate 5 messages with Firebase version**
  - [ ] Save examples

- [ ] **Generate 5 messages with n8n version**
  - [ ] Compare to Firebase examples
  - [ ] Same personality and tone
  - [ ] Same length (2-3 lines)
  - [ ] Uses customer name
  - [ ] Mentions specific products
  - [ ] No emojis
  - [ ] Natural Venezuelan Spanish

---

## Phase 4: Feature Parity Verification

### Core Functionality
- [ ] **Scheduled execution** (every 1 minute)
- [ ] **Firestore query** with 3 filters
- [ ] **Customer profile lookup**
- [ ] **AI message generation** with Claude
- [ ] **Phone number formatting** (Venezuelan support)
- [ ] **WhatsApp message sending** via Meta API
- [ ] **Conversation tracking** in Firestore
- [ ] **Order status updates**

### Personality & Tone
- [ ] Messages are warm and maternal
- [ ] Uses Venezuelan Spanish naturally
- [ ] Includes typical expressions ("chévere", "mi amor", "oíste")
- [ ] Short messages (2-3 lines)
- [ ] No emojis
- [ ] Professional but approachable
- [ ] Personalizes with customer name
- [ ] References specific products

### Error Handling
- [ ] Individual order failures don't stop batch
- [ ] Failed messages logged but don't crash workflow
- [ ] Retries on transient failures
- [ ] Graceful handling of missing data

### Data Integrity
- [ ] Orders only processed once (seguimiento_enviado flag)
- [ ] All conversations saved to Firestore
- [ ] Timestamps accurate
- [ ] Phone numbers formatted correctly
- [ ] No duplicate messages sent

### Performance
- [ ] Processes orders within reasonable time (<5 seconds per order)
- [ ] No rate limiting issues with APIs
- [ ] Firestore queries efficient
- [ ] Memory usage acceptable

---

## Phase 5: Monitoring Setup

### Execution History
- [ ] **n8n execution history configured**
  - [ ] Retention period set (recommend 30+ days)
  - [ ] Can review past executions
  - [ ] Can see error details

### Metrics to Track
- [ ] **Workflow executions per day**
  - [ ] Expected: 1440 (every minute)

- [ ] **Orders processed per execution**
  - [ ] Depends on verification rate

- [ ] **Success rate**
  - [ ] Target: >95%

- [ ] **Error rate by type**
  - [ ] WhatsApp send failures
  - [ ] Claude API errors
  - [ ] Firestore errors

### Alerting (Optional)
- [ ] **Set up alerts for:**
  - [ ] Workflow execution failures
  - [ ] High error rate (>10% failures)
  - [ ] No orders processed for extended period
  - [ ] API credential expiration

### Logging
- [ ] **Enable detailed logging**
  - [ ] Order IDs being processed
  - [ ] Generated messages (preview)
  - [ ] WhatsApp message IDs
  - [ ] Error details with context

---

## Phase 6: Production Migration

### Pre-Migration
- [ ] **Test n8n workflow for 24-48 hours** in parallel
  - [ ] Both systems running simultaneously
  - [ ] Compare outputs
  - [ ] Monitor for any issues
  - [ ] n8n not updating orders (dry run)

### Migration Day
- [ ] **Backup current data**
  - [ ] Export Firestore collections (if possible)
  - [ ] Document current state

- [ ] **Disable Firebase Cloud Function**
  - [ ] Stop scheduled trigger
  - [ ] OR delete/undeploy function
  - [ ] Verify no longer executing

- [ ] **Enable n8n workflow**
  - [ ] Activate Schedule Trigger
  - [ ] Verify first execution successful
  - [ ] Monitor next 5-10 executions closely

### Post-Migration
- [ ] **First hour monitoring**
  - [ ] Check every execution
  - [ ] Verify messages sending
  - [ ] Check Firestore updates
  - [ ] Confirm no errors

- [ ] **First day monitoring**
  - [ ] Review execution history
  - [ ] Check message quality
  - [ ] Verify all orders processed
  - [ ] Monitor customer responses (if any)

- [ ] **First week monitoring**
  - [ ] Daily review of metrics
  - [ ] Any unexpected errors?
  - [ ] Performance acceptable?
  - [ ] Message quality consistent?

---

## Phase 7: Optimization (Post-Migration)

### Performance Tuning
- [ ] **Analyze execution times**
  - [ ] Identify bottlenecks
  - [ ] Optimize slow nodes

- [ ] **Batch processing** (if needed)
  - [ ] For high volume (>50 orders/minute)
  - [ ] Switch to parallel processing

- [ ] **Schedule optimization**
  - [ ] If low volume, reduce frequency (e.g., every 2-5 minutes)
  - [ ] If high volume, keep at 1 minute or optimize workflow

### Enhancement Opportunities
- [ ] **Add customer response handling**
  - [ ] Webhook to receive WhatsApp replies
  - [ ] Sentiment analysis
  - [ ] Auto-escalation for issues

- [ ] **Add analytics dashboard**
  - [ ] Message delivery rates
  - [ ] Average response time
  - [ ] Customer satisfaction trends

- [ ] **Add notification system**
  - [ ] Alert team for negative sentiment
  - [ ] Daily summary reports
  - [ ] Weekly analytics

---

## Rollback Plan

If n8n migration has critical issues:

### Immediate Rollback
- [ ] **Disable n8n workflow** (deactivate Schedule Trigger)
- [ ] **Re-enable Firebase Cloud Function**
  - [ ] Redeploy if deleted
  - [ ] Verify executing

### Data Reconciliation
- [ ] **Identify orders processed by n8n**
  - [ ] Check `seguimiento_enviado = true`
  - [ ] Verify conversations exist

- [ ] **Identify orders missed** (if any)
  - [ ] Query for orders that should have been processed
  - [ ] Manual follow-up if critical

### Root Cause Analysis
- [ ] Document what went wrong
- [ ] Identify fixes needed
- [ ] Test fixes in staging
- [ ] Retry migration when ready

---

## Success Criteria

Migration is successful when:

✅ **Functionality**
- [ ] All orders processed automatically
- [ ] Messages sent successfully
- [ ] Conversations tracked
- [ ] Orders updated correctly

✅ **Quality**
- [ ] Message tone matches original
- [ ] Personalization works
- [ ] No formatting issues
- [ ] Correct phone formatting

✅ **Reliability**
- [ ] >95% success rate
- [ ] Errors handled gracefully
- [ ] No data loss
- [ ] Consistent performance

✅ **Monitoring**
- [ ] Can track all executions
- [ ] Errors are visible
- [ ] Metrics available
- [ ] Team has visibility

---

## Cost Tracking

### Pre-Migration Baseline (Firebase)
- **Firebase Functions:** $____ /month
- **Anthropic API:** $____ /month
- **WhatsApp API:** $____ /month
- **Total:** $____ /month

### Post-Migration (n8n)
- **n8n Hosting:** $____ /month
- **Anthropic API:** $____ /month (should be same)
- **WhatsApp API:** $____ /month (should be same)
- **Total:** $____ /month

**Cost Difference:** $____ /month (savings or increase)

---

## Notes & Observations

### Issues Encountered
```
Date: ____
Issue: ____
Resolution: ____
```

### Improvements Made
```
Date: ____
Improvement: ____
Impact: ____
```

### Lessons Learned
```
-
-
-
```

---

## Sign-off

- [ ] **Technical Lead Approval:** __________ Date: ______
- [ ] **Migration Completed:** Date: ______
- [ ] **Monitoring Verified:** Date: ______
- [ ] **Documentation Updated:** Date: ______
- [ ] **Team Trained:** Date: ______

---

## Quick Reference

**Critical Files:**
- Workflow Guide: `N8N_WORKFLOW_GUIDE.md`
- API Payloads: `N8N_API_PAYLOADS.md`
- Ana's Prompt: `ANAJENSY_PROMPT.txt`
- This Checklist: `N8N_MIGRATION_CHECKLIST.md`
- Original Code: `functions/index.js`

**Support:**
- n8n Docs: https://docs.n8n.io
- Meta WhatsApp: https://developers.facebook.com/docs/whatsapp
- Anthropic: https://docs.anthropic.com

**Emergency Contacts:**
- n8n Support: ____
- Firebase/GCP Support: ____
- Team Lead: ____
