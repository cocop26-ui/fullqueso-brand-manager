# Twilio WhatsApp Webhook Configuration

## Webhook URL
```
https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
```

## Setup Instructions

### Option 1: Via Twilio Console (Recommended)

1. **Go to Twilio Console**:
   https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders

2. **Click on your WhatsApp sender**:
   - Number: +15558855791
   - Display name: tequenosfullqueso

3. **Configure Webhook**:
   - Look for "Webhook Configuration" or "When a message comes in"
   - Set URL to: `https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook`
   - Method: **POST**
   - Click **Save**

### Option 2: Via Twilio API

Run this command to configure the webhook programmatically:

```bash
# First, get your WhatsApp sender SID
curl -X GET "https://messaging.twilio.com/v1/Services" \
  -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}"

# Then configure the webhook (replace {ServiceSid} with the SID from above)
curl -X POST "https://messaging.twilio.com/v1/Services/{ServiceSid}" \
  -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}" \
  --data-urlencode "InboundRequestUrl=https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook" \
  --data-urlencode "InboundMethod=POST"
```

## Testing the Webhook

Once configured, test it:

1. **Send a message** from your phone (+584241476748) to **+1 555-885-5791**
2. Say something like: "Sí, todo está perfecto, gracias!"
3. Ana should respond automatically within 2-3 seconds

## Verify Webhook is Working

### Check Firebase Logs:
```bash
firebase functions:log
```

You should see:
```
📨 Incoming WhatsApp message
Message from: 584241476748
Message: Sí, todo está perfecto, gracias!
Generated response: [Ana's response]
✓ Response sent to customer
```

### Check Twilio Logs:
https://console.twilio.com/us1/monitor/logs/debugger

Look for incoming webhook calls with 200 status code.

## What Happens When Customer Replies

1. **Customer sends WhatsApp message** → Twilio receives it
2. **Twilio calls webhook** → Firebase function is triggered
3. **Function gets context**:
   - Customer info from database
   - Recent order details
   - Conversation history
4. **Claude AI generates response** using Anajensy's personality
5. **Response sent via WhatsApp** to customer
6. **Conversation saved** to Firestore database

## Troubleshooting

### Webhook not receiving messages
- Verify webhook URL is exactly: `https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook`
- Check method is POST (not GET)
- Verify function is deployed: `firebase deploy --only functions:whatsappWebhook`

### Messages sent but no response
- Check Firebase logs for errors
- Verify Claude API key is set
- Check Twilio credentials are correct

### 401/403 errors
- Function requires authentication - this is normal
- Twilio sends credentials automatically
- Don't access the URL directly in browser

## Current Status

✅ **Webhook Function**: Deployed and ready
✅ **Firebase Secrets**: Configured
✅ **Claude AI**: Working
✅ **Twilio Account**: Active
⏳ **Webhook Configuration**: Needs to be set in Twilio console

**Next Step**: Configure the webhook URL in Twilio console (see instructions above)
