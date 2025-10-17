# Twilio WhatsApp Integration Setup Guide

This guide will help you set up Twilio to send WhatsApp messages from the Anajensy bot.

## Prerequisites

- A Twilio account ([Sign up here](https://www.twilio.com/try-twilio))
- Your Twilio WhatsApp Sandbox or approved WhatsApp Business number

## Step 1: Get Twilio Credentials

### 1.1 Find Your Account SID and Auth Token

1. Log in to your [Twilio Console](https://console.twilio.com/)
2. On the Dashboard, you'll see:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
3. Copy both values - you'll need them later

### 1.2 Set Up WhatsApp Sandbox (For Testing)

If you don't have an approved WhatsApp Business number, use the Twilio Sandbox:

1. In Twilio Console, go to **Messaging** > **Try it out** > **Send a WhatsApp message**
2. You'll see a sandbox number like: `+1 415 523 8886`
3. Follow instructions to connect your personal WhatsApp:
   - Send a message with the code shown (e.g., "join your-sandbox-code")
   - You'll receive a confirmation message
4. Your WhatsApp sandbox number format: `whatsapp:+14155238886`

### 1.3 Get Your WhatsApp Number (Production)

For production use with real customers:

1. Go to **Messaging** > **Senders** > **WhatsApp senders**
2. Click **Register a WhatsApp number**
3. Follow Twilio's approval process
4. Once approved, your number format: `whatsapp:+yourphonenumber`

## Step 2: Configure Firebase Functions Environment Variables

You need to set three environment variables for your Firebase Functions:

### Option A: Using Firebase CLI (Recommended)

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions

# Set Twilio Account SID
firebase functions:secrets:set TWILIO_ACCOUNT_SID
# When prompted, paste your Account SID (AC...)

# Set Twilio Auth Token
firebase functions:secrets:set TWILIO_AUTH_TOKEN
# When prompted, paste your Auth Token

# Set Twilio WhatsApp Number
firebase functions:secrets:set TWILIO_WHATSAPP_NUMBER
# When prompted, enter: whatsapp:+14155238886 (or your approved number)
```

**Note:** The WhatsApp number must include the `whatsapp:` prefix!

### Option B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **fullqueso-bot**
3. Go to **Functions** > **Configuration**
4. Add these environment variables:
   - `TWILIO_ACCOUNT_SID`: Your Account SID
   - `TWILIO_AUTH_TOKEN`: Your Auth Token
   - `TWILIO_WHATSAPP_NUMBER`: `whatsapp:+14155238886` (your sandbox/approved number)

## Step 3: Test Your Twilio WhatsApp Setup

### 3.1 Test Sending a Message Manually

Create a test script to verify Twilio works:

```bash
cd functions
node test-twilio.js
```

The test script will send a WhatsApp message to verify your setup.

### 3.2 Verify Message Delivery

1. Check your WhatsApp
2. You should receive the test message from Ana
3. If successful, you're ready to deploy!

## Step 4: Deploy Updated Functions

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions

# Deploy functions
firebase deploy --only functions
```

## Step 5: Test with Real Orders

### Create a Test Order

Run the script to add sample data:

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/firestore-setup
node populate-sample-data.js
```

This will:
1. Create a test customer
2. Create a test order with status "VERIFICADO"
3. The bot will automatically send a follow-up message after 2 minutes

### Monitor Function Logs

Watch the logs to see the messages being sent:

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions
firebase functions:log
```

## Troubleshooting

### Error: "TWILIO_ACCOUNT_SID is not defined"
- Make sure you've set the environment variables using `firebase functions:secrets:set`
- Redeploy after setting variables

### Error: "Unable to create record: The 'To' number ... is not a valid phone number"
- Make sure customer phone numbers in Firestore are in the correct format
- Venezuelan numbers should be stored as: `04141234567` or `4141234567`
- The bot automatically converts to `+584141234567`

### Error: "Permission to send messages to this number"
- **Sandbox:** Make sure the recipient has joined your sandbox (sent "join" message)
- **Production:** Make sure you're using an approved WhatsApp Business number

### Messages Not Being Sent
1. Check Firebase Functions logs: `firebase functions:log`
2. Verify the `procesarSeguimientos` function is running every 2 minutes
3. Check that orders have `estado: "VERIFICADO"` and `seguimiento_enviado: false`

## Phone Number Format Reference

### Customer Phone Numbers in Firestore
Venezuelan mobile numbers can be stored as:
- `04141234567` (with leading 0)
- `4141234567` (without leading 0)

The bot automatically:
1. Removes leading 0 if present
2. Adds country code +58
3. Formats as `whatsapp:+584141234567`

### Twilio WhatsApp Number Format
Always use the `whatsapp:` prefix:
- Sandbox: `whatsapp:+14155238886`
- Production: `whatsapp:+584241234567`

## Important Notes

### Twilio WhatsApp Sandbox Limitations
- **Testing only** - not for production
- Recipients must "join" your sandbox first
- Messages expire after 24 hours of inactivity
- Limited to your test numbers

### For Production
- Apply for WhatsApp Business API approval through Twilio
- Follow WhatsApp's Business Policy
- Complete business verification
- May take several days for approval

## Cost Estimation

Twilio WhatsApp pricing (as of 2024):
- **Outbound messages:** ~$0.005 - $0.01 per message (varies by country)
- **Inbound messages:** Free
- **Venezuela:** Check [Twilio Pricing](https://www.twilio.com/whatsapp/pricing/ve) for exact rates

## Security Best Practices

✅ **DO:**
- Use Firebase Functions secrets for credentials
- Never commit credentials to Git
- Rotate Auth Token periodically
- Monitor usage in Twilio Console

❌ **DON'T:**
- Hard-code credentials in your code
- Share your Auth Token publicly
- Use sandbox in production

## Next Steps

1. ✅ Complete Twilio account setup
2. ✅ Set environment variables
3. ✅ Test with sandbox
4. ✅ Deploy functions
5. 🔄 Monitor and adjust
6. 📈 Apply for production WhatsApp Business approval

## Support Resources

- [Twilio WhatsApp Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
- [Twilio WhatsApp API Reference](https://www.twilio.com/docs/whatsapp/api)
- [Firebase Functions Environment Config](https://firebase.google.com/docs/functions/config-env)

---

**Need Help?** Check the [Twilio Support Center](https://support.twilio.com/) or Firebase Functions logs for debugging.
