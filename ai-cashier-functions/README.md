# AI Cashier - Full Queso WhatsApp Bot 🤖

AI-powered cashier bot for Full Queso restaurant, powered by Claude AI and Meta WhatsApp Business API.

## Features

- 🤖 **AI-Powered Conversations**: Uses Claude 3.5 Sonnet for natural, intelligent customer interactions
- 💬 **WhatsApp Integration**: Seamlessly integrates with Meta WhatsApp Business API
- 🍽️ **Menu Management**: Dynamic menu system with real-time availability
- 📝 **Order Processing**: Intelligent order taking with confirmation steps
- 💾 **Session Management**: Maintains conversation context across messages
- 👤 **Customer Profiles**: Tracks customer information and order history

## Architecture

```
ai-cashier-functions/
├── functions/
│   ├── index.js              # Main Cloud Function with webhook handler
│   ├── package.json          # Node.js dependencies
│   ├── .env.example          # Environment variables template
│   └── .gitignore
├── firebase.json             # Firebase configuration
├── .firebaserc              # Firebase project settings
└── README.md
```

## Prerequisites

1. **Firebase Project**: Set up at [Firebase Console](https://console.firebase.google.com)
2. **Meta WhatsApp Business Account**: Register at [Meta Business](https://business.facebook.com)
3. **Anthropic API Key**: Get from [Anthropic Console](https://console.anthropic.com)
4. **Node.js 22**: Required for Firebase Functions

## Setup Instructions

### 1. Install Dependencies

```bash
cd ai-cashier-functions/functions
npm install
```

### 2. Configure Environment Variables

Set Firebase environment variables:

```bash
# Set Anthropic API key
firebase functions:secrets:set ANTHROPIC_API_KEY

# Set WhatsApp credentials
firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID
firebase functions:secrets:set WEBHOOK_VERIFY_TOKEN
```

### 3. Set up Firestore Collections

Create the following collections in Firestore:

**`menu_items`** - Restaurant menu
```javascript
{
  name: "Quesadilla de Pollo",
  price: 8.99,
  description: "Tortilla de harina con queso y pollo",
  category: "quesadillas",
  available: true
}
```

**`cashier_sessions`** - Customer conversations
```javascript
{
  phoneNumber: "+1234567890",
  history: [],
  lastInteraction: timestamp
}
```

**`customers`** - Customer profiles
```javascript
{
  name: "Juan Pérez",
  phoneNumber: "+1234567890",
  orderCount: 5,
  createdAt: timestamp
}
```

**`orders`** - Completed orders
```javascript
{
  customerId: "+1234567890",
  items: [],
  total: 25.99,
  status: "pending",
  createdAt: timestamp
}
```

### 4. Deploy to Firebase

```bash
cd ai-cashier-functions
firebase deploy --only functions
```

### 5. Configure WhatsApp Webhook

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps)
2. Navigate to WhatsApp > Configuration
3. Set webhook URL to your deployed function URL:
   ```
   https://us-central1-fullqueso-bot.cloudfunctions.net/aiCashierWebhook
   ```
4. Set verify token (same as `WEBHOOK_VERIFY_TOKEN`)
5. Subscribe to `messages` webhook field

## Development

### Local Testing

Start Firebase emulators:

```bash
cd ai-cashier-functions/functions
npm run serve
```

### View Logs

```bash
npm run logs
```

Or in Firebase Console:
```bash
firebase functions:log
```

## How It Works

1. **Customer sends WhatsApp message** → Meta API forwards to webhook
2. **Webhook receives message** → Validates and extracts message data
3. **Session retrieval** → Gets conversation history from Firestore
4. **AI Processing** → Claude AI generates contextual response
5. **Response sent** → Message sent back via WhatsApp API
6. **Session updated** → Conversation history saved to Firestore

## AI Capabilities

The AI cashier can:
- Greet customers warmly in Spanish
- Present menu items and answer questions
- Take orders with item selection and quantities
- Confirm orders before processing
- Handle special requests and modifications
- Provide delivery time estimates
- Remember customer preferences

## Security

- ✅ Webhook signature verification (TODO: implement)
- ✅ Environment variables stored as Firebase Secrets
- ✅ No sensitive data in code repository
- ✅ Firestore security rules (configure in Firebase Console)

## Troubleshooting

### Function not receiving messages
- Verify webhook URL is correct in Meta dashboard
- Check webhook verify token matches
- Review Firebase function logs for errors

### AI responses failing
- Verify ANTHROPIC_API_KEY is set correctly
- Check API key has sufficient credits
- Review error logs for API issues

### WhatsApp messages not sending
- Verify WHATSAPP_ACCESS_TOKEN is valid
- Check phone number ID is correct
- Ensure WhatsApp Business API is active

## Cost Considerations

- **Firebase Functions**: Free tier includes 2M invocations/month
- **Firestore**: Free tier includes 1GB storage, 50K reads/day
- **Claude API**: Pay per token (see [Anthropic pricing](https://www.anthropic.com/pricing))
- **WhatsApp API**: Free for first 1,000 conversations/month

## Future Enhancements

- [ ] Order confirmation and processing
- [ ] Payment integration
- [ ] Delivery tracking
- [ ] Menu item recommendations
- [ ] Multi-language support
- [ ] Voice message handling
- [ ] Image recognition for menu items
- [ ] Admin dashboard integration

## Related Projects

- [anajensy-bot-functions](../anajensy-bot-functions) - Brand manager bot
- [admin-dashboard](../admin-dashboard) - Admin management interface

## Support

For issues or questions:
1. Check Firebase function logs
2. Review Meta WhatsApp API documentation
3. Consult Anthropic API documentation

## License

Private - Full Queso Brand Manager Project
