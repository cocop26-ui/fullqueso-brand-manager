# 🚀 Deploy Ana - Step by Step

**Ready to deploy!** Everything is configured and tested.

---

## ⚡ Quick Deploy (One Command)

```bash
cd /home/user/fullqueso-brand-manager/anajensy-bot-functions
./deploy-ana-now.sh
```

**Time:** 5 minutes
**What it does:** Everything automatically!

---

## 📋 What Happens During Deployment

### Step 1: Firebase Secrets (Automatic)
```
Setting WHATSAPP_ACCESS_TOKEN...
Setting WHATSAPP_PHONE_NUMBER_ID...
✅ Secrets configured!
```

### Step 2: Dependencies (Automatic)
```
Installing dependencies...
✅ Dependencies installed!
```

### Step 3: Deploy Functions (Automatic)
```
Deploying to Firebase...
✅ procesarSeguimientos deployed
✅ whatsappWebhook deployed
```

### Step 4: Webhook URL (You Copy This)
```
Webhook URL: https://us-central1-fullqueso-bot.cloudfunctions.net/whatsappWebhook
```

**Action required:**
1. Go to: https://developers.facebook.com/apps
2. Your app → WhatsApp → Configuration → Webhook
3. Paste URL above
4. Verify token: `fullqueso_webhook_verify_2025`
5. Subscribe to: `messages` ✅

### Step 5: Test Order (Automatic)
```
Creating test order for Pedro Padilla...
✅ Order added to Firestore
```

### Step 6: Monitor (Automatic)
```
Monitoring Ana for 3 minutes...
Expected: Ana sends WhatsApp to +584241476748
```

---

## 🔑 If Firebase Login Required

If you haven't logged in before:

```bash
firebase login
```

This opens browser → Login with Google → One-time setup!

---

## 📱 After Deployment

### Immediate Results (1-2 minutes):

**Pedro's WhatsApp (+584241476748) receives:**
```
Hola Pedro Padilla! Gracias por tu pedido de
Churros Choco Arequipe x15. ¿Cómo estuvo todo?
Cuéntame qué tal te fue.
```

### What Ana Does Automatically:

1. **Every 1 minute:** Checks for new `ENTREGADO` orders
2. **Automatically:** Sends WhatsApp using approved template
3. **Automatically:** Responds to customer replies (via webhook)
4. **Automatically:** Saves to Firestore + Google Sheets

**Zero manual work after setup!** 🎉

---

## ✅ Verify Deployment

After running the script:

```bash
./verify-setup.sh
```

**Should show:**
- ✅ Templates approved
- ✅ Functions deployed
- ✅ Secrets configured
- ✅ Webhook configured

---

## 🔍 Monitor Ana

**Watch order processing:**
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

## 📊 Check Results

**Firestore Console:**
https://console.firebase.google.com/project/fullqueso-bot/firestore

**Collections:**
- `pedidos_bot` - Orders processed
- `conversaciones_bot` - Full conversations
- `encuestas_postventa` - Survey results
- `clientes_bot` - Customer profiles

---

## 🐛 Troubleshooting

### "Firebase command not found"

Install Firebase CLI:
```bash
npm install -g firebase-tools
```

### "Unauthorized" or "Permission denied"

Login to Firebase:
```bash
firebase login
```

### Template not sending

Check template is approved:
```bash
./check-meta-template-status.sh
```

Must show: `status: "APPROVED"`

### Webhook not receiving

1. Verify webhook URL is correct
2. Check verify token: `fullqueso_webhook_verify_2025`
3. Confirm `messages` is subscribed

Test manually:
```bash
curl "YOUR_WEBHOOK_URL?hub.mode=subscribe&hub.verify_token=fullqueso_webhook_verify_2025&hub.challenge=test"
```
Should return: `test`

---

## 🎯 Summary

**Deploy command:**
```bash
./deploy-ana-now.sh
```

**Time:** 5 minutes
**Result:** Ana fully automatic!
**Test:** Check +584241476748 in 2 minutes

---

## 📞 Next Steps After Deployment

1. ✅ Script completes
2. ✅ Configure webhook (2 min)
3. ✅ Pedro receives test message
4. ✅ Reply to test conversation
5. ✅ Verify data in Firestore

**Then:** Ana handles all future orders automatically! 🚀

---

Ready? Run this now:

```bash
cd /home/user/fullqueso-brand-manager/anajensy-bot-functions
./deploy-ana-now.sh
```
