# 🚀 Ana WhatsApp Bot - Start Here

**Status:** ✅ Templates Approved
**Ready:** All code complete
**Next:** Run deployment script

---

## ✅ What You Have

- ✅ Meta approved templates:
  - `anajensy_order_followup` ✅
  - `fullqueso_seguimiento_pedido` ✅
- ✅ WhatsApp Business API (Meta Cloud API)
- ✅ Firebase account
- ✅ Claude API key
- ✅ All Ana code ready

---

## 🎯 Deploy Ana in 3 Steps

### Step 1: Run Deployment Script

```bash
cd /home/user/fullqueso-brand-manager/anajensy-bot-functions
./deploy-ana-now.sh
```

**This will:**
- Configure Firebase secrets (Meta API credentials)
- Deploy Firebase functions
- Show webhook URL
- Add test order
- Monitor Ana's first message

**Time:** ~5 minutes

---

### Step 2: Configure Meta Webhook

After deployment, you'll see the webhook URL.

**Quick config:**
1. Go to: https://developers.facebook.com/apps
2. Your app → WhatsApp → Configuration → Webhook
3. Set URL (from Step 1)
4. Set verify token: `fullqueso_webhook_verify_2025`
5. Subscribe to: `messages` ✅

**Detailed guide:** See `WEBHOOK_SETUP.md`

---

### Step 3: Verify Setup

```bash
./verify-setup.sh
```

**This checks:**
- ✅ Templates approved
- ✅ Functions deployed
- ✅ Secrets configured
- ✅ Code ready

---

## 📱 How Ana Works (After Setup)

### Automatic Flow:

```
Order delivered in your system
    ↓
Update Firestore: estado="ENTREGADO", seguimiento_enviado=false
    ↓
Ana detects it (every 1 minute) ⏰
    ↓
Sends WhatsApp message automatically 📱
    ↓
Customer receives: "Hola [Name]! Gracias por tu pedido de [Products]..."
    ↓
Customer replies
    ↓
Ana responds (using Claude AI) 🤖
    ↓
3-message conversation
    ↓
Email captured + Survey completed ✅
    ↓
Data saved to Firestore + Google Sheets
```

**You do:** NOTHING after initial setup! 🎉

---

## 🧪 Test Ana

### Quick Test:

```bash
# Add test order
node add-pedro-test-order.js

# Wait 1-2 minutes

# Check WhatsApp on +584241476748
```

**Expected:**
- Pedro receives: "Hola Pedro Padilla! Gracias por tu pedido de Churros Choco Arequipe x15..."

**Monitor:**
```bash
firebase functions:log --follow
```

---

## 📊 What Gets Saved Automatically

After each conversation:

**Firestore Collections:**
- `pedidos_bot` - Order marked as processed
- `conversaciones_bot` - Full conversation history
- `encuestas_postventa` - Survey with sentiment analysis
- `clientes_bot` - Customer profile with email

**Google Sheets:**
- Survey data exported for analysis

---

## 🔍 Monitoring

**Watch Ana process orders:**
```bash
firebase functions:log --only procesarSeguimientos --follow
```

**Watch webhook responses:**
```bash
firebase functions:log --only whatsappWebhook --follow
```

**Watch everything:**
```bash
firebase functions:log --follow
```

---

## 📁 Important Files

**Deployment:**
- `deploy-ana-now.sh` ⭐ Main deployment script
- `verify-setup.sh` - Check setup status

**Guides:**
- `WEBHOOK_SETUP.md` - Webhook configuration
- `AUTOMATIC_SETUP_CHECKLIST.md` - Complete setup guide
- `ANA_TEST_FLOW_TRACE.md` - How Ana works internally

**Testing:**
- `add-pedro-test-order.js` - Create test order
- `/tmp/pedro-test-order-*.json` - Test order data

---

## 🐛 Troubleshooting

### Ana not sending messages?

**Run verification:**
```bash
./verify-setup.sh
```

**Common fixes:**
1. Template not approved → Check Meta Business Manager
2. Functions not deployed → Run `./deploy-ana-now.sh`
3. Secrets not configured → Script handles this automatically

### Webhook not working?

**Check:**
1. URL correct (from `firebase functions:list`)
2. Verify token: `fullqueso_webhook_verify_2025`
3. Subscribed to `messages` ✅

**Test manually:**
```bash
curl "YOUR_WEBHOOK_URL?hub.mode=subscribe&hub.verify_token=fullqueso_webhook_verify_2025&hub.challenge=test"
```
Should return: `test`

---

## ✨ Quick Summary

### To make Ana automatic:

1. **Deploy:** `./deploy-ana-now.sh`
2. **Configure webhook** (one-time, 2 minutes)
3. **Done!** Ana handles everything automatically

### After setup:

**Orders → Firestore → Ana → WhatsApp → Customer**

**Fully automatic!** 🚀

---

## 🎯 Ready?

Run this now:

```bash
./deploy-ana-now.sh
```

Then check WhatsApp on +584241476748 in 2 minutes! 📱

---

**Questions?** Check the guides:
- `AUTOMATIC_SETUP_CHECKLIST.md` - Complete setup
- `WEBHOOK_SETUP.md` - Webhook details
- `ANA_TEST_FLOW_TRACE.md` - How it works
