# Full Queso Brand Manager

Automated WhatsApp customer engagement system for Full Queso delivery service in Caracas, Venezuela.

## 🚀 Project Overview

This repository contains multiple integrated systems:

### 1. **Anajensy Bot** - WhatsApp Follow-up Bot
AI-powered WhatsApp bot that sends personalized follow-up messages to customers after order verification using Claude AI and Twilio.

**Location:** [`anajensy-bot-functions/`](./anajensy-bot-functions/)

**Features:**
- ✅ Automated follow-ups 2 minutes after order verification
- ✅ AI-generated personalized messages (Claude)
- ✅ Twilio WhatsApp Business API integration
- ✅ Conversation tracking and sentiment analysis
- ✅ Venezuelan Spanish with local expressions

**[→ Full Documentation](./anajensy-bot-functions/README.md)**

### 2. **Admin Dashboard** (Coming Soon)
Web dashboard for monitoring orders, conversations, and analytics.

**Location:** [`admin-dashboard/`](./admin-dashboard/)

### 3. **Firestore Setup Scripts**
Scripts for initializing and managing Firestore database with sample data.

**Location:** [`firestore-setup/`](./firestore-setup/)

## 📋 Prerequisites

- **Node.js** 22+
- **Firebase CLI:** `npm install -g firebase-tools`
- **Firebase Project** with Firestore and Functions enabled
- **Twilio Account** with WhatsApp Business API access
- **Anthropic API Key** for Claude AI

## 🏗️ Project Structure

```
fullqueso-brand-manager/
├── anajensy-bot-functions/       # WhatsApp bot Cloud Functions
│   ├── functions/
│   │   ├── index.js              # Main bot logic
│   │   ├── test-twilio.js        # Testing utilities
│   │   └── package.json
│   ├── TWILIO_SETUP.md          # Twilio configuration guide
│   └── README.md                # Bot documentation
├── firestore-setup/              # Database initialization
│   ├── init-firestore.js
│   └── populate-sample-data.js
├── admin-dashboard/              # Web dashboard (future)
├── .gitignore
├── LICENSE
└── README.md                     # This file
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/fullqueso-brand-manager.git
cd fullqueso-brand-manager
```

### 2. Set Up Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if needed)
firebase init

# Select:
# - Firestore
# - Functions
# - Choose your Firebase project
```

### 3. Configure Secrets

```bash
# Set Twilio credentials
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_WHATSAPP_NUMBER

# Set Anthropic API key
firebase functions:secrets:set ANTHROPIC_API_KEY
```

### 4. Install Dependencies

```bash
cd anajensy-bot-functions/functions
npm install
```

### 5. Deploy

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:procesarSeguimientos
```

## 🔑 Environment Variables

You'll need to set these as Firebase secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `ACxxxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `your_token` |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp sender | `whatsapp:+14155238886` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-...` |

## 📊 Database Structure

### Firestore Collections

#### `pedidos_bot`
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

#### `clientes_bot`
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

#### `conversaciones_bot`
Bot conversations:
```javascript
{
  cliente_telefono: "04141234567",
  pedido_ticket: "FQ-12345",
  mensaje_ana: "Hola María...",
  mensaje_cliente: "Todo perfecto, gracias",
  sentimiento: "positivo",
  requiere_atencion: false,
  fecha: Timestamp
}
```

## 🧪 Testing

### Test Twilio Integration
```bash
cd anajensy-bot-functions/functions
cp .env.example .env
# Edit .env with your credentials
node test-twilio.js
```

### Create Test Orders
```bash
cd firestore-setup
node populate-sample-data.js
```

### Monitor Functions
```bash
firebase functions:log
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Messages not sending?**
- Verify Twilio sandbox configuration
- Check that recipients joined the sandbox
- Verify environment variables are set correctly

**Function not triggering?**
- Check function logs: `firebase functions:log`
- Verify order has `estado: "VERIFICADO"`
- Check `fecha_verificado` timestamp

**Claude API errors?**
- Verify API key is valid
- Check API quota/limits
- Review error logs for details

## 📚 Documentation

- [Anajensy Bot Documentation](./anajensy-bot-functions/README.md)
- [Twilio Setup Guide](./anajensy-bot-functions/TWILIO_SETUP.md)
- [WhatsApp Business Approval Guide](./anajensy-bot-functions/WHATSAPP_BUSINESS_APPROVAL_GUIDE.md)

## 💰 Cost Estimation

- **Firebase Functions:** Free tier covers most usage
- **Firestore:** Minimal (mostly reads)
- **Twilio WhatsApp:** ~$0.005-0.01 per message
- **Claude API:** ~$0.003 per message generation

**Example:** 100 messages/day ≈ $3-4/month

## 🔐 Security

- ✅ All credentials stored as Firebase secrets
- ✅ No hardcoded API keys
- ✅ `.gitignore` configured to exclude sensitive files
- ✅ Phone numbers validated and sanitized

**IMPORTANT:** Never commit:
- `.env` files
- Service account keys
- `firebase-adminsdk-*.json` files
- API keys or tokens

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

## 👥 Team

- **Full Queso** - Venezuelan food delivery service
- **Contributors** - See [CONTRIBUTORS.md](./CONTRIBUTORS.md)

## 📧 Contact

For questions or support:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## 🙏 Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/) - AI message generation
- [Twilio](https://www.twilio.com/) - WhatsApp Business API
- [Firebase](https://firebase.google.com/) - Backend infrastructure

---

Made with ❤️ in Caracas, Venezuela 🇻🇪
