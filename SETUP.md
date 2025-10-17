# Full Queso Brand Manager - Complete Setup Guide

Complete step-by-step guide to set up the Full Queso Brand Manager system.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 22+ installed ([Download](https://nodejs.org/))
- [ ] Firebase CLI installed
- [ ] Twilio account created
- [ ] Anthropic API key obtained
- [ ] Firebase project created
- [ ] Git installed

## 🔧 Step 1: Install Required Tools

### Install Node.js

```bash
# Check if Node.js is installed
node --version  # Should be v22+

# If not installed, download from https://nodejs.org/
```

### Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version

# Login to Firebase
firebase login
```

### Install Git (if not installed)

```bash
# Check if Git is installed
git --version

# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# Windows - download from https://git-scm.com/
```

## 🔥 Step 2: Set Up Firebase Project

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "fullqueso-brand-manager")
4. Enable Google Analytics (optional)
5. Create project

### Enable Required Services

1. **Firestore Database:**
   - Go to "Build" → "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select location (closest to Caracas: `southamerica-east1`)

2. **Cloud Functions:**
   - Go to "Build" → "Functions"
   - Click "Get started"
   - Upgrade to Blaze plan (pay-as-you-go, required for external APIs)

3. **Enable Billing:**
   - Go to "Project Settings" → "Usage and billing"
   - Set up billing account (required for Twilio/Claude API calls)

## 📞 Step 3: Set Up Twilio WhatsApp

### Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

### Get WhatsApp Sandbox Access

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to "Messaging" → "Try it out" → "Send a WhatsApp message"
3. Follow instructions to join the sandbox:
   - Send "join [your-code]" to the Twilio sandbox number
   - Save this sandbox number

### Get Twilio Credentials

1. From Twilio Console Dashboard:
   - **Account SID:** Found on main dashboard
   - **Auth Token:** Click "Show" to reveal (keep secret!)
   - **WhatsApp Number:** From sandbox (format: `whatsapp:+14155238886`)

2. Save these securely - you'll need them later

### Production WhatsApp (Optional)

For production use, see [TWILIO_PRODUCTION_SETUP.md](./anajensy-bot-functions/TWILIO_PRODUCTION_SETUP.md)

## 🤖 Step 4: Get Anthropic API Key

### Sign Up for Anthropic

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to "API Keys"
4. Click "Create Key"
5. Name it (e.g., "fullqueso-bot")
6. Copy and save the key (starts with `sk-ant-`)

### Add Credits (if needed)

1. Go to "Billing"
2. Add credits ($5-10 to start)
3. Set up auto-recharge (optional)

## 💻 Step 5: Clone and Configure Project

### Clone Repository

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/fullqueso-brand-manager.git
cd fullqueso-brand-manager
```

### Connect to Firebase Project

```bash
# Initialize Firebase
firebase use --add

# Select your Firebase project
# Give it an alias (e.g., "production")
```

### Install Dependencies

```bash
# Install function dependencies
cd anajensy-bot-functions/functions
npm install

# Return to root
cd ../..
```

## 🔐 Step 6: Configure Secrets

Firebase secrets are secure environment variables for production.

### Set Twilio Secrets

```bash
# Set Twilio Account SID
firebase functions:secrets:set TWILIO_ACCOUNT_SID
# Paste your Account SID when prompted

# Set Twilio Auth Token
firebase functions:secrets:set TWILIO_AUTH_TOKEN
# Paste your Auth Token when prompted

# Set Twilio WhatsApp Number
firebase functions:secrets:set TWILIO_WHATSAPP_NUMBER
# Enter format: whatsapp:+14155238886
```

### Set Anthropic API Key

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
# Paste your API key (sk-ant-...) when prompted
```

### Verify Secrets

```bash
# List all secrets
firebase functions:secrets:access
```

## 🧪 Step 7: Test Locally (Optional)

### Create Local Environment File

```bash
cd anajensy-bot-functions/functions
cp .env.example .env
```

### Edit .env File

```bash
# Edit with your preferred editor
nano .env
```

Add your credentials:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

### Test Twilio Connection

```bash
node test-twilio.js
```

You should receive a WhatsApp test message!

## 🚀 Step 8: Deploy to Firebase

### Deploy Functions

```bash
# From project root
cd anajensy-bot-functions

# Deploy all functions
firebase deploy --only functions

# This may take 2-5 minutes
```

### Verify Deployment

```bash
# Check function status
firebase functions:list

# View logs
firebase functions:log
```

## 🗄️ Step 9: Set Up Firestore Database

### Create Collections

You can create collections manually or use scripts:

#### Option A: Automatic Setup

```bash
cd firestore-setup
npm install
node init-firestore.js
```

#### Option B: Manual Setup

Go to Firebase Console → Firestore:

1. **Create `pedidos_bot` collection:**
   - Click "Start collection"
   - Collection ID: `pedidos_bot`
   - Add a sample document (will be replaced)

2. **Create `clientes_bot` collection**
3. **Create `conversaciones_bot` collection**

### Add Sample Data (for testing)

```bash
cd firestore-setup
node populate-sample-data.js
```

## ✅ Step 10: Test End-to-End

### Create Test Order

1. Go to Firebase Console → Firestore
2. Open `pedidos_bot` collection
3. Add document:

```javascript
{
  ticket: "FQ-TEST-001",
  cliente_telefono: "YOUR_PHONE",  // Your WhatsApp number (04141234567)
  cliente_nombre: "Test Customer",
  productos: [
    {
      nombre: "15 CHURROS + Choco Arequipe",
      cantidad: 1,
      precio: 5000
    }
  ],
  tipo: "delivery",
  estado: "VERIFICADO",
  fecha_verificado: [current timestamp],
  seguimiento_enviado: false,
  fecha_creado: [current timestamp],
  pedido_id: "test-001"
}
```

4. Wait 2 minutes
5. Check your WhatsApp - you should receive Ana's message!

### Monitor Execution

```bash
# Watch logs in real-time
firebase functions:log --only procesarSeguimientos

# Or view in Firebase Console
# Functions → procesarSeguimientos → Logs
```

## 📊 Step 11: Configure Security Rules

### Firestore Security Rules

Go to Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow Cloud Functions full access
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // For development - restrict in production!
    match /pedidos_bot/{pedidoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /clientes_bot/{clienteId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /conversaciones_bot/{conversacionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Publish the rules.

## 🎯 Step 12: Customize Ana's Personality

### Edit Bot Personality

1. Open `anajensy-bot-functions/functions/index.js`
2. Find `ANAJENSY_PROMPT` (around line 21)
3. Customize:
   - Personality traits
   - Venezuelan expressions
   - Message style
   - Interaction approach

4. Deploy changes:
```bash
firebase deploy --only functions
```

## 📱 Step 13: Add Team Members to WhatsApp Sandbox

For testing with team members:

1. Each person sends: `join [your-sandbox-code]` to Twilio number
2. Their number is now authorized to receive messages

## 🔄 Step 14: Set Up Continuous Deployment (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm install -g firebase-tools
      - run: cd anajensy-bot-functions/functions && npm install
      - run: firebase deploy --only functions --token ${{ secrets.FIREBASE_TOKEN }}
```

Get Firebase token:
```bash
firebase login:ci
# Save the token as GitHub secret: FIREBASE_TOKEN
```

## 📈 Step 15: Monitor and Maintain

### Daily Monitoring

- Check Firebase Console → Functions → Logs
- Monitor Twilio Console → Messaging → Logs
- Review Firestore → conversaciones_bot for issues

### Weekly Tasks

- Review Claude API usage
- Check Twilio message costs
- Review customer sentiment trends

### Monthly Tasks

- Update dependencies: `npm update`
- Review and optimize costs
- Backup Firestore data

## 🐛 Troubleshooting

### Function Not Triggering

```bash
# Check function status
firebase functions:list

# Check logs
firebase functions:log

# Redeploy
firebase deploy --only functions:procesarSeguimientos
```

### Messages Not Sending

1. Verify secrets: `firebase functions:secrets:access`
2. Check Twilio Console logs
3. Ensure recipient joined sandbox
4. Verify phone number format

### Claude API Errors

1. Check API key is valid
2. Verify billing/credits
3. Review rate limits
4. Check error logs

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/api)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)

## ✅ Setup Complete!

You now have a fully functional WhatsApp bot! 🎉

### Next Steps

1. Test with real orders
2. Customize Ana's personality
3. Add team members to sandbox
4. Monitor performance
5. Plan for production WhatsApp approval

## 🆘 Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Open an issue on GitHub
- Review Firebase Functions logs
- Check Twilio status page

---

Made with ❤️ in Caracas, Venezuela 🇻🇪
