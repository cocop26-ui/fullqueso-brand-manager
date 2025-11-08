# Create Meta WhatsApp Message Template

**Date:** 2025-11-08
**Status:** ⚠️ REQUIRED - Template must be created and approved before Ana can send messages

---

## 🎯 Why This Is Needed

Meta WhatsApp API **requires approved templates** to initiate conversations with customers. Freeform messages only work AFTER the customer replies.

---

## 📋 Create the Template

### Step 1: Go to Meta Business Manager

1. Open: https://business.facebook.com/wa/manage/message-templates/
2. Or navigate: **WhatsApp Manager** → **Message templates**

### Step 2: Create New Template

Click **"Create template"**

### Step 3: Template Configuration

**Category:** `UTILITY`
**Name:** `anajensy_order_followup`
**Language:** `Spanish`

### Step 4: Template Content

**Header:** *(None)*

**Body:**
```
Hola {{1}}! 🎉

Gracias por tu pedido de {{2}}. ¿Cómo estuvo todo? Cuéntame qué tal te fue con tu pedido.
```

**Variables:**
- `{{1}}` = Customer first name (e.g., "Pedro")
- `{{2}}` = Products ordered (e.g., "Churros Choco Arequipe x15")

**Footer:** *(None)*

**Buttons:** *(None - we want conversational flow)*

### Step 5: Example Values

When creating the template, Meta will ask for example values:

- **{{1}} example:** `Pedro`
- **{{2}} example:** `Tequeños x12`

**Preview:**
```
Hola Pedro! 🎉

Gracias por tu pedido de Tequeños x12. ¿Cómo estuvo todo? Cuéntame qué tal te fue con tu pedido.
```

### Step 6: Submit for Approval

1. Click **"Submit"**
2. Meta will review the template (usually 15 minutes to 24 hours)
3. You'll receive email notification when approved

---

## ✅ Check Approval Status

### Option 1: Meta Business Manager

1. Go to: https://business.facebook.com/wa/manage/message-templates/
2. Look for `anajensy_order_followup`
3. Status should show: **"Approved"** ✅

### Option 2: Meta API

```bash
curl -X GET \
  "https://graph.facebook.com/v21.0/YOUR_WABA_ID/message_templates?name=anajensy_order_followup" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response when approved:
```json
{
  "data": [
    {
      "name": "anajensy_order_followup",
      "status": "APPROVED",
      "language": "es",
      "category": "UTILITY"
    }
  ]
}
```

---

## 🔧 Alternative: Simple Template (Faster Approval)

If the above gets rejected, try this simpler version:

**Body:**
```
Hola {{1}}! Gracias por tu pedido de {{2}}. ¿Cómo te fue? Cuéntame.
```

---

## ⚡ Quick Start (If No Template Yet)

**Temporary workaround:** Have customers message your business number first.

1. Customer sends any message to **+58 416-8542395**
2. This opens a 24-hour window
3. Ana can then reply with freeform messages

**But this is NOT ideal for automated post-sales follow-up!**

---

## 📊 Template Best Practices

### ✅ DO:
- Keep it short and friendly
- Use customer's first name
- Mention the specific product
- Ask open-ended question
- Use Spanish (es) language

### ❌ DON'T:
- Include promotional content
- Add links in the first message
- Use marketing language
- Make it too long
- Include pricing/discounts

---

## 🧪 Test the Template (After Approval)

### Test Command:

```bash
curl -X POST "https://graph.facebook.com/v21.0/805718575964429/messages" \
  -H "Authorization: Bearer YOUR_META_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "584241476748",
    "type": "template",
    "template": {
      "name": "anajensy_order_followup",
      "language": {
        "code": "es"
      },
      "components": [
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": "Pedro"
            },
            {
              "type": "text",
              "text": "Churros Choco Arequipe x15"
            }
          ]
        }
      ]
    }
  }'
```

Expected: You should receive the message on **+584241476748** ✅

---

## 🚀 Deploy After Template Approval

Once the template is approved:

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions

# Deploy the updated function
firebase deploy --only functions:procesarSeguimientos

# Test with real order
# (Add test order to Firestore as instructed earlier)
```

---

## ⚠️ Common Issues

### Issue: "Template name not found"

**Cause:** Template not created or wrong name

**Solution:**
- Verify template name is exactly: `anajensy_order_followup`
- Check it's approved in Meta Business Manager

### Issue: "Template not approved"

**Cause:** Template still pending review

**Solution:**
- Wait for Meta approval (check email)
- Usually takes 15 minutes to 24 hours

### Issue: "Invalid parameters"

**Cause:** Wrong number of variables

**Solution:**
- Template body must have exactly 2 variables: `{{1}}` and `{{2}}`
- Code sends customer name and products

---

## 📚 Resources

- **Meta Templates Guide:** https://developers.facebook.com/docs/whatsapp/message-templates
- **Template Guidelines:** https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
- **Create Template:** https://business.facebook.com/wa/manage/message-templates/

---

## ✅ Next Steps

1. **Create template** in Meta Business Manager (5 minutes)
2. **Wait for approval** (15 min - 24 hours)
3. **Deploy updated function** to Firebase
4. **Test** with Pedro's order
5. **Ana will work!** 🎉

---

**Last Updated:** 2025-11-08
**Template Name:** `anajensy_order_followup`
**Status:** Pending Creation ⏳
