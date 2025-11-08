#!/bin/bash

# Complete Ana Meta WhatsApp Deployment - Run Everything
# This script performs the complete deployment from start to finish

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 ANA META WHATSAPP - COMPLETE DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will perform:"
echo "  ✅ Step 1: Create Meta message template"
echo "  ✅ Step 2: Configure Firebase secrets"
echo "  ✅ Step 3: Deploy functions to Firebase"
echo "  ✅ Step 4: Add test order to Firestore"
echo "  ✅ Step 5: Monitor Ana's response"
echo ""
read -p "Press ENTER to start complete deployment..."
echo ""

# Variables
META_TOKEN="EAALluMeKdhEBP0NcHkUdFcW01VrYHgxEj1vfvdZCzDaskpwEVIIF7TFIAitoQpmfHEiKjYlKTKc1Gkj5OpZCYVUUQ5R2T6VRPUI5iANsKN6D2Wi40uJj6kPHlTEIVItl6FImdNgnVv3xp4eQLqd2KZCuJfYQBjZC9Indtv9uX3Gm7Y07JEOdroLbhRC8MUlJNQ7rGiZASYdjIZAEaOO1ZC1TRxM9Il9xwDWgC3E5Gc6oKaqoTZBBOcjWYZBIq807bAn2GdXZBlUPay7v5YqD4Yc6h4iQZDZD"
PHONE_NUMBER_ID="805718575964429"

# ============================================================================
# STEP 1: Create Meta Message Template
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Creating Meta WhatsApp Message Template"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get WhatsApp Business Account ID
echo "🔍 Getting WhatsApp Business Account ID..."
WABA_RESPONSE=$(curl -s -X GET \
  "https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}?fields=id,account_id" \
  -H "Authorization: Bearer ${META_TOKEN}")

WABA_ID=$(echo "$WABA_RESPONSE" | grep -o '"account_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$WABA_ID" ]; then
  echo "❌ Failed to get WABA ID. Response:"
  echo "$WABA_RESPONSE"
  echo ""
  echo "⚠️  Manual template creation required."
  echo "Please follow instructions in CREATE_META_TEMPLATE.md"
  echo ""
  read -p "Press ENTER after creating the template manually..."
else
  echo "✅ WABA ID: $WABA_ID"
  echo ""

  # Create the template
  echo "📝 Creating message template: anajensy_order_followup"

  TEMPLATE_RESPONSE=$(curl -s -X POST \
    "https://graph.facebook.com/v21.0/${WABA_ID}/message_templates" \
    -H "Authorization: Bearer ${META_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "anajensy_order_followup",
      "language": "es",
      "category": "UTILITY",
      "components": [
        {
          "type": "BODY",
          "text": "Hola {{1}}! Gracias por tu pedido de {{2}}. ¿Cómo estuvo todo? Cuéntame qué tal te fue."
        }
      ]
    }')

  echo ""
  echo "Template API Response:"
  echo "$TEMPLATE_RESPONSE" | jq . 2>/dev/null || echo "$TEMPLATE_RESPONSE"
  echo ""

  # Check if template was created successfully
  if echo "$TEMPLATE_RESPONSE" | grep -q '"id"'; then
    echo "✅ Template created successfully!"
    echo ""
    echo "⏳ Waiting for Meta approval (usually 15 min - 24 hours)..."
    echo ""
    echo "You can check status at:"
    echo "https://business.facebook.com/wa/manage/message-templates/"
    echo ""
  else
    echo "⚠️  Template creation response received. Check status at:"
    echo "https://business.facebook.com/wa/manage/message-templates/"
    echo ""
  fi

  read -p "Press ENTER after template is APPROVED..."
fi

echo ""
echo "✅ Step 1 Complete: Template Ready"
echo ""

# ============================================================================
# STEP 2: Configure Firebase Secrets
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Configuring Firebase Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔐 Setting WHATSAPP_ACCESS_TOKEN..."
echo -n "$META_TOKEN" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN

echo ""
echo "🔐 Setting WHATSAPP_PHONE_NUMBER_ID..."
echo -n "$PHONE_NUMBER_ID" | firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID

echo ""
echo "✅ Step 2 Complete: Secrets Configured"
echo ""

# ============================================================================
# STEP 3: Deploy Functions
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Deploying Functions to Firebase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Installing dependencies..."
cd functions
npm install
cd ..

echo ""
echo "🚀 Deploying to Firebase..."
firebase deploy --only functions

echo ""
echo "✅ Step 3 Complete: Functions Deployed"
echo ""

# Get the webhook URL
WEBHOOK_URL=$(firebase functions:list | grep whatsappWebhook | awk '{print $NF}')
echo "📡 Webhook URL: $WEBHOOK_URL"
echo ""

# ============================================================================
# STEP 4: Add Test Order to Firestore
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Adding Test Order for Pedro Padilla"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the test order script
node add-pedro-test-order.js

# Check if it succeeded
if [ $? -eq 0 ]; then
  echo "✅ Step 4 Complete: Test Order Added"
else
  echo "⚠️  Automated Firestore add failed"
  echo ""
  echo "Please add test order manually:"
  echo "1. Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore/data/~2Fpedidos_bot"
  echo "2. Click 'Add document'"
  echo "3. Copy JSON from /tmp/pedro-test-order-*.json"
  echo ""
  read -p "Press ENTER after adding the order..."
fi

echo ""

# ============================================================================
# STEP 5: Monitor Ana's Response
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Monitoring Ana's Response"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏳ Ana's procesarSeguimientos runs every 1 minute"
echo "   Monitoring logs for 3 minutes..."
echo ""

timeout 180 firebase functions:log --only procesarSeguimientos --follow || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Expected Result:"
echo "   Pedro Padilla (+584241476748) should receive:"
echo "   \"Hola Pedro! Gracias por tu pedido de Churros Choco Arequipe x15."
echo "    ¿Cómo estuvo todo? Cuéntame qué tal te fue.\""
echo ""
echo "💬 Test the conversation flow:"
echo "   1. Ana sends initial template message"
echo "   2. Reply with general feedback"
echo "   3. Ana asks about product quality"
echo "   4. Reply with product feedback"
echo "   5. Ana asks about delivery"
echo "   6. Reply with delivery feedback"
echo "   7. Ana asks for email"
echo "   8. Provide email"
echo "   9. Ana thanks and closes"
echo ""
echo "🔍 Continue monitoring:"
echo "   firebase functions:log --only whatsappWebhook --follow"
echo ""
echo "📊 Check Firestore:"
echo "   - conversaciones_bot: Conversation history"
echo "   - encuestas_postventa: Survey results"
echo ""
echo "🔗 Configure Meta Webhook:"
echo "   URL: $WEBHOOK_URL"
echo "   Verify Token: fullqueso_webhook_verify_2025"
echo "   Subscribe to: messages"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
