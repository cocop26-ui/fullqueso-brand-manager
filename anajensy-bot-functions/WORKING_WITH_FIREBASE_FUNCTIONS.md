# Working with Firebase Functions - Complete Guide

This guide shows you how to work with and modify your Anajensy WhatsApp bot.

---

## 📂 Project Structure

```
anajensy-bot-functions/
├── functions/
│   ├── index.js                    ← Main code (YOUR BOT LOGIC)
│   ├── package.json                ← Dependencies
│   ├── create-order-fullqueso.js   ← Test order creator
│   └── node_modules/               ← Libraries (don't touch)
├── firebase.json                   ← Firebase config
└── .firebaserc                     ← Project settings
```

---

## 🎯 Main File: `functions/index.js`

This is where ALL your bot code lives. It has 3 main parts:

### 1. **Configuration** (Lines 1-16)
```javascript
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
```
- Gets credentials from Firebase Secrets
- You don't need to change this

### 2. **Ana's Personality** (Lines 18-43)
```javascript
const ANAJENSY_PROMPT = `Eres Anajensy (Ana)...`
```
- **THIS IS WHERE YOU CUSTOMIZE ANA!**
- Change her expressions, personality, tone
- Edit this to make her more/less formal, add new phrases, etc.

### 3. **Two Functions:**

**A. `procesarSeguimientos` (Lines 45-147)**
- Runs every 1 minute
- Finds new verified orders
- Generates personalized message with Claude
- Sends WhatsApp via Twilio
- **Sends the initial follow-up message**

**B. `whatsappWebhook` (Lines 204-343)**
- Receives customer replies
- Gets conversation history
- Generates AI response
- Sends response back
- **Handles two-way conversations**

---

## 🛠️ Common Tasks

### 1. Change Ana's Personality

**File:** `functions/index.js`
**Lines:** 18-43

```bash
# Open in VS Code
code functions/index.js
```

Find the `ANAJENSY_PROMPT` section and edit:

```javascript
const ANAJENSY_PROMPT = `Eres Anajensy (Ana), operadora de delivery de Full Queso.

PERSONALIDAD:
- Cálida y maternal
- Empática y atenta
- Profesional pero cercana

EXPRESIONES:
- Saludos: "Hola, feliz tarde"
- Afirmaciones: "Chévere", "Perfecto"
- Apoyo: "Estamos para servirte"

REGLAS:
1. Mensajes cortos (2-3 líneas)
2. Usa el nombre del cliente
3. NO uses emojis
4. NO seas formal`;
```

**After editing, deploy:**
```bash
firebase deploy --only functions
```

---

### 2. Change How Often Ana Checks for Orders

**File:** `functions/index.js`
**Line:** 46

Current: Every 1 minute
```javascript
schedule: "every 1 minutes"
```

Change to every 5 minutes:
```javascript
schedule: "every 5 minutes"
```

**Deploy:**
```bash
firebase deploy --only functions:procesarSeguimientos
```

---

### 3. Create Test Orders

**Run this anytime:**
```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node create-order-fullqueso.js
```

This creates a test order for Pedro that Ana will process in the next minute.

---

### 4. View Logs (See What's Happening)

**Real-time logs:**
```bash
firebase functions:log
```

**Filter by function:**
```bash
# See only automated messages
firebase functions:log --only procesarSeguimientos

# See only customer replies
firebase functions:log --only whatsappWebhook
```

**See recent logs:**
```bash
firebase functions:log | head -50
```

---

### 5. Check Function Status

```bash
# List all functions
firebase functions:list

# Should show:
# procesarSeguimientos(us-central1) - scheduled
# whatsappWebhook(us-central1) - http
```

---

### 6. Deploy Changes

**Deploy everything:**
```bash
firebase deploy --only functions
```

**Deploy specific function:**
```bash
# Deploy only the scheduled function
firebase deploy --only functions:procesarSeguimientos

# Deploy only the webhook
firebase deploy --only functions:whatsappWebhook
```

**Time:** ~30-60 seconds per deployment

---

## 📝 Editing Workflow

### Step-by-Step: Changing Ana's Message

1. **Open the file:**
   ```bash
   code functions/index.js
   ```

2. **Find the prompt** (around line 19)

3. **Make your changes:**
   ```javascript
   const ANAJENSY_PROMPT = `Eres Anajensy...

   NEW EXPRESSION:
   - Si todo está bien: "Perfecto mi amor, gracias por confirmar"
   `;
   ```

4. **Save the file** (Cmd+S or Ctrl+S)

5. **Deploy:**
   ```bash
   firebase deploy --only functions
   ```

6. **Test:**
   ```bash
   cd functions
   node create-order-fullqueso.js
   # Wait 1 minute, check your phone
   ```

---

## 🧪 Testing Locally (Before Deploying)

### Test Without Deploying:

1. **Install Firebase Emulator:**
   ```bash
   npm install -g firebase-tools
   firebase emulators:start
   ```

2. **Test your changes locally**

3. **When happy, deploy for real**

---

## 🔐 Managing Credentials

### View Current Credentials:
```bash
# View Twilio Account SID
firebase functions:secrets:access TWILIO_ACCOUNT_SID

# View Twilio Auth Token
firebase functions:secrets:access TWILIO_AUTH_TOKEN

# View Anthropic API Key
firebase functions:secrets:access ANTHROPIC_API_KEY
```

### Update Credentials:
```bash
# Update Twilio SID
echo -n "NEW_SID" | firebase functions:secrets:set TWILIO_ACCOUNT_SID

# Update Twilio Token
echo -n "NEW_TOKEN" | firebase functions:secrets:set TWILIO_AUTH_TOKEN

# Update Anthropic Key
echo -n "NEW_KEY" | firebase functions:secrets:set ANTHROPIC_API_KEY
```

After updating credentials:
```bash
firebase deploy --only functions
```

---

## 📊 Monitoring

### Check Firebase Console:

1. **Functions Dashboard:**
   ```
   https://console.firebase.google.com/project/fullqueso-bot/functions
   ```
   - See execution count
   - View errors
   - Check performance

2. **Firestore Database:**
   ```
   https://console.firebase.google.com/project/fullqueso-bot/firestore
   ```
   - View orders: `pedidos_bot`
   - View customers: `clientes_bot`
   - View conversations: `conversaciones_bot`

3. **Logs:**
   ```
   https://console.firebase.google.com/project/fullqueso-bot/functions/logs
   ```
   - Filter by function
   - Search for errors
   - Export logs

---

## 🚨 Troubleshooting

### "Functions not running"

**Check status:**
```bash
firebase functions:list
```

**Redeploy:**
```bash
firebase deploy --only functions
```

### "Messages not sending"

**Check logs:**
```bash
firebase functions:log --only procesarSeguimientos
```

**Look for:**
- ✓ "WhatsApp sent successfully"
- ❌ Error messages

**Common issues:**
- No orders with `estado: "VERIFICADO"` and `seguimiento_enviado: false`
- Twilio credentials expired
- Claude API quota exceeded

### "Webhook not responding"

**Check webhook logs:**
```bash
firebase functions:log --only whatsappWebhook
```

**Verify webhook URL in Twilio:**
- URL: `https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook`
- Method: POST

### "Want to rollback changes"

**See previous deployments:**
```bash
firebase functions:log
```

**Restore from backup:**
```bash
# You have a backup at:
# functions/index.js.backup

cp functions/index.js.backup functions/index.js
firebase deploy --only functions
```

---

## 💡 Pro Tips

### 1. **Always Test First**
```bash
# Create test order
cd functions && node create-order-fullqueso.js
# Wait 1 minute
# Check your phone
```

### 2. **Use Git for Version Control**
```bash
# Before making changes
git add functions/index.js
git commit -m "backup before changing Ana's personality"

# Make changes, test, deploy

# If something breaks
git checkout functions/index.js  # restore backup
```

### 3. **Monitor Costs**
```bash
# Check Firebase usage
firebase projects:list

# View in console:
# https://console.firebase.google.com/project/fullqueso-bot/usage
```

### 4. **Check Anthropic Credits**
```bash
# Go to: https://console.anthropic.com/settings/usage
# Make sure you have credits
```

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Deploy all | `firebase deploy --only functions` |
| View logs | `firebase functions:log` |
| Create test order | `cd functions && node create-order-fullqueso.js` |
| List functions | `firebase functions:list` |
| Edit Ana's personality | `code functions/index.js` (line 19) |
| View credentials | `firebase functions:secrets:access SECRET_NAME` |

---

## 🎯 Common Modifications

### Make Ana More Formal

**Find line 19-43, change to:**
```javascript
const ANAJENSY_PROMPT = `Eres Anajensy, representante de Full Queso.

PERSONALIDAD:
- Profesional y cortés
- Eficiente
- Atenta al cliente

EXPRESIONES:
- Saludos: "Buen día", "Buenas tardes"
- Afirmaciones: "Excelente", "Entendido"
- Apoyo: "Estamos a su disposición"
- Despedidas: "Que tenga un excelente día"

REGLAS:
1. Usa "usted" en lugar de "tú"
2. Mantén tono profesional
3. Mensajes claros y directos`;
```

### Make Ana More Casual

```javascript
const ANAJENSY_PROMPT = `Eres Anajensy, tu pana de Full Queso.

PERSONALIDAD:
- Super amigable
- Divertida
- Como hablar con tu mejor amiga

EXPRESIONES:
- Saludos: "Epa!", "Qué más chamo/chama"
- Afirmaciones: "Chévere pues", "Dale pues"
- Apoyo: "Cuenta conmigo vale"
- Despedidas: "Nos vemos!", "Cuídate mucho"

REGLAS:
1. Súper casual
2. Usa venezolanismos
3. Mantén energía positiva`;
```

### Add Emojis

**Change line 39 from:**
```javascript
5. NO uses emojis
```

**To:**
```javascript
5. Usa emojis moderadamente 😊 🍕 ✨
```

---

## 🔄 Deployment Best Practices

1. **Test locally** with `create-order-fullqueso.js`
2. **Check logs** before deploying
3. **Deploy during low-traffic** times
4. **Monitor logs** after deployment
5. **Keep backup** of working version

---

## 📞 Support

- **Firebase Console:** https://console.firebase.google.com/project/fullqueso-bot
- **Your Code:** `/Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions/functions/index.js`
- **Logs:** `firebase functions:log`
- **Documentation:** This file!

---

**Last Updated:** 2025-11-04
**Status:** Production Ready ✅
**Current Version:** Twilio + Claude AI + Firebase
