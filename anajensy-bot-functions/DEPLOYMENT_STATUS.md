# Anajensy WhatsApp Bot - Deployment Status

## 🎯 Project Overview
AI-powered WhatsApp bot that sends personalized follow-up messages to Full Queso customers after their orders are verified.

---

## ✅ What's Working (100% Complete)

### 1. Firebase Cloud Function
- **Status**: ✅ Deployed and Running
- **Function Name**: `procesarSeguimientos`
- **Schedule**: Runs every 1 minute
- **Location**: `functions/index.js`
- **What it does**:
  - Queries Firestore for VERIFICADO orders
  - Generates personalized messages using Claude AI
  - Sends WhatsApp messages via Twilio
  - Saves conversations to Firestore

### 2. Claude AI Integration
- **Status**: ✅ Working
- **Model**: claude-sonnet-4-20250514
- **API Key**: Configured via Firebase Secrets
- **Personality**: Anajensy - warm Venezuelan mother character
- **Sample Generated Message**:
  ```
  Hola Pedro, feliz tarde mi amor

  Vi que acabas de hacer tu pedido de 15 churros con chocolate
  y el café latte. Todo está confirmado y ya lo estamos preparando.

  ¿Está todo bien con la dirección de entrega?
  Cualquier cosa me escribes oíste
  ```

### 3. Firestore Database
- **Status**: ✅ Configured
- **Collections**:
  - `pedidos_bot` - Stores orders
  - `clientes_bot` - Stores customer profiles
  - `conversaciones_bot` - Stores bot conversations
- **Queries Working**: Yes
- **Updates Working**: Yes

### 4. Twilio WhatsApp Business Account
- **Status**: ✅ Configured
- **Account SID**: [Stored in Firebase Secrets]
- **WhatsApp Business Number**: +1 555-885-5791
- **Display Name**: tequenosfullqueso
- **Credentials**: Stored in Firebase Secrets

---

## ⏳ Pending / In Progress

### 1. WhatsApp Message Template Approval
- **Status**: ⏳ Pending Meta/WhatsApp Approval (1-24 hours)
- **Template Name**: `anajensy_order_followup`
- **Template SID**: HX81b16f5a9d7af1ee465044e0535ffcb3
- **Language**: Spanish (es)
- **Category**: UTILITY
- **Approval Status**: `pending`
- **Body**:
  ```
  Hola {{1}}, feliz tarde

  Te escribo para confirmar que tu pedido de {{2}} está verificado.
  ¿Todo está bien, mi amor?

  Estamos para servirte
  ```
- **Variables**:
  - `{{1}}` = Customer name
  - `{{2}}` = Order items

**What happens when approved:**
Once approved, the bot can send messages to customers at any time without requiring them to message first.

### 2. WhatsApp Business Number Activation
- **Issue**: Number shows as "Online" in Twilio but messages fail with error 63016
- **Error Code 63016**: "Failed to send freeform message because you are outside the allowed window"
- **Root Cause**: WhatsApp Business API requires either:
  1. Customer to have messaged the business in last 24 hours (opt-in window), OR
  2. Use of approved message templates (pending approval above)

**Current Workaround:**
Messages will work once template is approved OR when customers message the business first.

---

## 🧪 Testing

### Test Order Creation Script
**File**: `functions/create-order-fullqueso.js`

**Usage**:
```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js
```

**What it creates**:
- Test order: FQ-TEST-PEDRO
- Customer: Pedro
- Phone: +584241476748
- Products: 15 CHURROS + Chocolate, 2x Café Latte

### Manual Test via curl
```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json" \
  --data-urlencode "From=whatsapp:+15558855791" \
  --data-urlencode "To=whatsapp:+584241476748" \
  --data-urlencode "Body=Test message from Anajensy" \
  -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}"
```

---

## 📊 Firebase Logs

### Check logs:
```bash
firebase functions:log
```

### Recent successful execution:
```
Processing pedido: FQ-TEST-PEDRO
Generated message: Hola Pedro, feliz tarde mi amor...
Sending WhatsApp to: +584241476748
✓ WhatsApp sent successfully via Twilio!
  - Message SID: SM706321af8ee53acade12ef023a7d6763
  - To: +584241476748
  - Status: queued
✓ Seguimiento enviado a Pedro
```

---

## 🔑 Secrets Management

### Firebase Secrets (Configured):
```bash
# View secrets
firebase functions:secrets:access ANTHROPIC_API_KEY
firebase functions:secrets:access TWILIO_ACCOUNT_SID
firebase functions:secrets:access TWILIO_AUTH_TOKEN

# Update secrets
echo -n "YOUR_NEW_VALUE" | firebase functions:secrets:set SECRET_NAME
```

---

## 🚀 Deployment

### Deploy Function:
```bash
firebase deploy --only functions
```

### Deploy Specific Function:
```bash
firebase deploy --only functions:procesarSeguimientos
```

---

## 📱 WhatsApp Template Management

### Check Template Approval Status:
```bash
curl -X GET "https://content.twilio.com/v1/Content/HX81b16f5a9d7af1ee465044e0535ffcb3/ApprovalRequests" \
  -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}"
```

### Create New Template (if needed):
```bash
curl -X POST "https://content.twilio.com/v1/Content" \
  -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "friendly_name": "Template Name",
    "language": "es",
    "types": {
      "twilio/text": {
        "body": "Your template message here with {{1}} variables"
      }
    }
  }'
```

---

## 🔍 Troubleshooting

### Common Issues:

**1. Error 63016 - Opt-in Required**
- **Cause**: Customer hasn't messaged the business in last 24 hours
- **Solution**: Wait for template approval OR have customer message +15558855791 first

**2. Error 63038 - Message Limit Exceeded**
- **Cause**: Twilio trial account daily message limit (50 messages)
- **Solution**: Upgrade Twilio account

**3. Error 401 - Authentication Failed**
- **Cause**: Invalid Twilio credentials
- **Solution**: Update Firebase secrets with correct credentials

**4. Messages not sending**
- Check Firebase logs: `firebase functions:log`
- Check Twilio logs: https://console.twilio.com/us1/monitor/logs/debugger
- Verify secrets are set correctly

---

## 📞 Support Resources

- **Twilio Console**: https://console.twilio.com
- **Firebase Console**: https://console.firebase.google.com/project/fullqueso-bot
- **WhatsApp Business Manager**: https://business.facebook.com/wa/manage/phone-numbers/
- **Twilio Error 63016**: https://www.twilio.com/docs/errors/63016

---

## 🎯 Next Steps

1. **Wait for template approval** (check status periodically)
2. **Once approved**, update function to use templates
3. **Test with real customer numbers**
4. **Monitor performance and costs**
5. **Set up error alerts**

---

## 💰 Cost Estimation

### Current Usage:
- **Claude API**: ~$0.001 per message
- **Twilio WhatsApp**: $0.005 per message (varies by country)
- **Firebase Functions**: Free tier (likely sufficient for small-medium volume)
- **Firestore**: Free tier (likely sufficient for small-medium volume)

### Estimated Monthly Cost (1000 messages):
- Claude AI: ~$1
- Twilio: ~$5
- Firebase: $0 (free tier)
- **Total**: ~$6/month for 1000 messages

---

**Last Updated**: 2025-11-04
**Status**: Fully deployed, waiting for WhatsApp template approval
