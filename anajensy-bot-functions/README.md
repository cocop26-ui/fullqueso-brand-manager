# Anajensy Bot - Full Queso WhatsApp Delivery Bot

AI-powered WhatsApp bot that sends personalized follow-up messages to customers after their orders are verified.

## 🤖 Overview

Anajensy (Ana) is a warm, maternal Venezuelan operator who:
- Monitors verified orders in real-time
- Generates personalized WhatsApp messages using Claude AI
- Sends follow-up messages via Twilio WhatsApp
- Tracks customer conversations and sentiment
- Provides excellent customer service in Venezuelan Spanish

## 🏗️ Architecture

```
Firebase Cloud Functions (Scheduled)
    ↓
Firestore (pedidos_bot: VERIFICADO)
    ↓
Claude AI (Generate personalized message)
    ↓
Twilio WhatsApp API (Send message)
    ↓
Firestore (conversaciones_bot: Save conversation)
```

## 📋 Features

- ✅ Automated follow-ups 2 minutes after order verification
- ✅ AI-generated personalized messages using Claude
- ✅ Twilio WhatsApp integration
- ✅ Conversation tracking and sentiment analysis
- ✅ Real-time order monitoring
- ✅ Venezuelan Spanish with local expressions

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- Firebase CLI: `npm install -g firebase-tools`
- Twilio account with WhatsApp access
- Anthropic API key (for Claude)

### Installation

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Configure Twilio WhatsApp:**

   Follow the complete guide in [TWILIO_SETUP.md](./TWILIO_SETUP.md)

   Quick summary:
   ```bash
   # Set Twilio credentials as Firebase secrets
   firebase functions:secrets:set TWILIO_ACCOUNT_SID
   firebase functions:secrets:set TWILIO_AUTH_TOKEN
   firebase functions:secrets:set TWILIO_WHATSAPP_NUMBER

   # Set Anthropic API key
   firebase functions:secrets:set ANTHROPIC_API_KEY
   ```

3. **Test locally (optional):**
   ```bash
   cd functions
   cp .env.example .env
   # Edit .env with your credentials
   node test-twilio.js
   ```

4. **Deploy:**
   ```bash
   firebase deploy --only functions
   ```

## 🔧 Configuration

### Environment Variables

Set these using Firebase Functions secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | `ACxxxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | `your_token` |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp sender | `whatsapp:+14155238886` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-...` |

### Ana's Personality Configuration

Edit the `ANAJENSY_PROMPT` in `functions/index.js` to customize:
- Personality traits
- Venezuelan expressions
- Message style and length
- Customer interaction approach

## 📊 How It Works

### Scheduled Function: `procesarSeguimientos`

Runs every 2 minutes to:

1. **Query orders** with:
   - `estado: "VERIFICADO"`
   - `seguimiento_enviado: false`
   - Verified at least 2 minutes ago

2. **For each order:**
   - Fetch customer data
   - Generate personalized message with Claude
   - Send WhatsApp message via Twilio
   - Save conversation to Firestore
   - Mark order as `seguimiento_enviado: true`

### Message Generation

Claude AI creates messages that:
- Use the customer's name
- Reference specific products ordered
- Identify first-time vs. returning customers
- Stay conversational (2-3 lines max)
- Use Venezuelan Spanish expressions

### Example Generated Message

```
Hola María, ¿cómo estás mi amor?
Te escribo para saber si todo llegó bien con
los 15 CHURROS + topping de Choco Arequipe.
¿Estuvo todo chévere?
```

## 📁 Project Structure

```
anajensy-bot-functions/
├── functions/
│   ├── index.js              # Main Cloud Functions
│   ├── test-twilio.js        # Test script
│   ├── package.json          # Dependencies
│   └── .env.example          # Environment template
├── firebase.json             # Firebase config
├── .firebaserc              # Firebase project
├── TWILIO_SETUP.md          # Twilio setup guide
└── README.md                # This file
```

## 🗄️ Firestore Collections

### `pedidos_bot`
Orders from Full Queso customers:
```javascript
{
  ticket: "FQ-12345",
  cliente_telefono: "04141234567",
  cliente_nombre: "María González",
  productos: [{nombre: "15 CHURROS", cantidad: 1}],
  estado: "VERIFICADO",
  fecha_verificado: Timestamp,
  seguimiento_enviado: false
}
```

### `clientes_bot`
Customer profiles:
```javascript
{
  telefono: "04141234567",
  nombre: "María González",
  total_pedidos: 5,
  productos_favoritos: ["CHURROS"],
  horario_preferido: "tarde"
}
```

### `conversaciones_bot`
Ana's conversations:
```javascript
{
  cliente_telefono: "04141234567",
  pedido_ticket: "FQ-12345",
  mensaje_ana: "Hola María...",
  mensaje_cliente: "Todo perfecto, gracias",
  sentimiento: "positivo",
  requiere_atencion: false
}
```

## 🧪 Testing

### Test Twilio Integration
```bash
cd functions
node test-twilio.js
```

### Create Test Orders
```bash
cd ../firestore-setup
node populate-sample-data.js
```

### Monitor Logs
```bash
firebase functions:log
```

### Watch Live Execution
```bash
firebase functions:log --only procesarSeguimientos
```

## 🐛 Troubleshooting

### Messages not sending?

1. **Check environment variables:**
   ```bash
   firebase functions:config:get
   ```

2. **Verify Twilio sandbox:**
   - Recipients must join sandbox first
   - Send "join your-code" to Twilio number

3. **Check function logs:**
   ```bash
   firebase functions:log
   ```

4. **Verify order status:**
   - Orders must have `estado: "VERIFICADO"`
   - Check `fecha_verificado` timestamp

### Common Errors

| Error | Solution |
|-------|----------|
| `TWILIO_ACCOUNT_SID is not defined` | Set environment variables with `firebase functions:secrets:set` |
| `The 'To' number is not valid` | Check phone number format in Firestore |
| `Permission to send messages` | Recipient must join Twilio sandbox |
| `Unable to create record` | Verify Twilio credentials |

## 📈 Monitoring

### View Function Execution
Firebase Console → Functions → procesarSeguimientos

### Check Message Delivery
Twilio Console → Messaging → Logs

### Monitor Costs
Twilio Console → Usage → WhatsApp

## 💰 Cost Estimation

- **Firebase Functions:** Free tier covers most use
- **Firestore:** Minimal (mostly reads)
- **Twilio WhatsApp:** ~$0.005-0.01 per message
- **Claude API:** ~$0.003 per message generation

Example: 100 messages/day ≈ $3-4/month

## 🔐 Security

- ✅ Credentials stored as Firebase secrets
- ✅ No hardcoded API keys
- ✅ Firestore security rules protect data
- ✅ Phone numbers validated and sanitized

## 🚢 Deployment

### Deploy All
```bash
firebase deploy
```

### Deploy Functions Only
```bash
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:procesarSeguimientos
```

## 📚 Additional Resources

- [Twilio WhatsApp API Docs](https://www.twilio.com/docs/whatsapp/api)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [Firebase Functions Guide](https://firebase.google.com/docs/functions)

## 🆘 Support

- Check [TWILIO_SETUP.md](./TWILIO_SETUP.md) for setup issues
- Review Firebase Functions logs
- Check Twilio message logs
- Verify Firestore data structure

## 📝 License

© 2025 Full Queso. All rights reserved.
