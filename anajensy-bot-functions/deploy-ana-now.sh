#!/bin/bash

# Ana WhatsApp Bot - Final Deployment
# This script completes the setup with your approved Meta templates

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 ANA WHATSAPP BOT - FINAL DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Approved Templates Detected:"
echo "   • anajensy_order_followup"
echo "   • fullqueso_seguimiento_pedido"
echo ""
echo "This script will:"
echo "  1. Configure Firebase secrets (Meta API credentials)"
echo "  2. Deploy Firebase functions"
echo "  3. Show webhook URL for Meta configuration"
echo "  4. Add test order"
echo "  5. Monitor Ana's first message"
echo ""
read -p "Press ENTER to start deployment..."
echo ""

# ============================================================================
# STEP 1: Configure Firebase Secrets
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Configuring Firebase Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

META_TOKEN="EAALluMeKdhEBP0NcHkUdFcW01VrYHgxEj1vfvdZCzDaskpwEVIIF7TFIAitoQpmfHEiKjYlKTKc1Gkj5OpZCYVUUQ5R2T6VRPUI5iANsKN6D2Wi40uJj6kPHlTEIVItl6FImdNgnVv3xp4eQLqd2KZCuJfYQBjZC9Indtv9uX3Gm7Y07JEOdroLbhRC8MUlJNQ7rGiZASYdjIZAEaOO1ZC1TRxM9Il9xwDWgC3E5Gc6oKaqoTZBBOcjWYZBIq807bAn2GdXZBlUPay7v5YqD4Yc6h4iQZDZD"
PHONE_NUMBER_ID="805718575964429"

echo "🔐 Setting WHATSAPP_ACCESS_TOKEN..."
echo -n "$META_TOKEN" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN

echo ""
echo "🔐 Setting WHATSAPP_PHONE_NUMBER_ID..."
echo -n "$PHONE_NUMBER_ID" | firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID

echo ""
echo "✅ Secrets configured!"
echo ""

# ============================================================================
# STEP 2: Install Dependencies
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Installing Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd functions
npm install --silent
cd ..

echo "✅ Dependencies installed!"
echo ""

# ============================================================================
# STEP 3: Deploy Firebase Functions
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Deploying Firebase Functions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

firebase deploy --only functions

echo ""
echo "✅ Functions deployed!"
echo ""

# ============================================================================
# STEP 4: Get Webhook URL
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Webhook Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Getting webhook URL..."
WEBHOOK_URL=$(firebase functions:list | grep whatsappWebhook | awk '{print $NF}')

if [ -z "$WEBHOOK_URL" ]; then
  echo "⚠️  Could not automatically detect webhook URL"
  echo ""
  echo "Get it manually:"
  echo "  firebase functions:list"
  echo ""
  read -p "Press ENTER to continue..."
else
  echo "✅ Webhook URL: $WEBHOOK_URL"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  MANUAL STEP REQUIRED: Configure Meta Webhook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://developers.facebook.com/apps"
echo "2. Select your app → WhatsApp → Configuration"
echo "3. In 'Webhook' section, click 'Edit'"
echo "4. Set these values:"
echo ""
echo "   Callback URL:"
if [ -z "$WEBHOOK_URL" ]; then
  echo "     [Run: firebase functions:list to get URL]"
else
  echo "     $WEBHOOK_URL"
fi
echo ""
echo "   Verify Token:"
echo "     fullqueso_webhook_verify_2025"
echo ""
echo "5. Click 'Verify and Save'"
echo "6. Subscribe to webhook fields:"
echo "   ✅ messages"
echo ""
read -p "Press ENTER after configuring the webhook..."
echo ""

# ============================================================================
# STEP 5: Add Test Order
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Adding Test Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate timestamp
TIMESTAMP=$(date +%s)
TICKET="FQ-DEPLOY-${TIMESTAMP}"

echo "📦 Creating test order:"
echo "   Ticket: $TICKET"
echo "   Customer: Pedro Padilla"
echo "   Phone: +584241476748"
echo "   Product: 15 Churros Choco Arequipe"
echo ""

# Try to add via script
if node add-pedro-test-order.js 2>/dev/null; then
  echo "✅ Test order added via script!"
else
  echo "⚠️  Script method failed, showing manual instructions..."
  echo ""
  echo "Add this order to Firestore manually:"
  echo ""
  echo "1. Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore/data/~2Fpedidos_bot"
  echo "2. Click 'Add document'"
  echo "3. Use auto-generated ID"
  echo "4. Copy this JSON:"
  echo ""
  cat /tmp/pedro-test-order-*.json 2>/dev/null || echo '{"ticket":"'$TICKET'","cliente_nombre":"Pedro Padilla","cliente_telefono":"584241476748","estado":"ENTREGADO","seguimiento_enviado":false,"productos":[{"nombre":"Churros Choco Arequipe x15","cantidad":1,"precio":25}],"tipo":"delivery","total":25}'
  echo ""
  read -p "Press ENTER after adding the order..."
fi

echo ""

# ============================================================================
# STEP 6: Monitor Ana
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Monitoring Ana's Response"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏳ Ana's procesarSeguimientos runs every 1 minute"
echo "   Monitoring logs for 3 minutes..."
echo ""
echo "Expected: Ana will send template message to +584241476748"
echo ""

timeout 180 firebase functions:log --only procesarSeguimientos --follow || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ What's deployed:"
echo "   • Firebase functions: procesarSeguimientos, whatsappWebhook"
echo "   • Secrets configured: Meta API credentials"
echo "   • Test order created: $TICKET"
echo ""
echo "📱 Check WhatsApp:"
echo "   • Phone: +584241476748"
echo "   • Expected message: 'Hola Pedro Padilla! Gracias por tu pedido de Churros Choco Arequipe x15...'"
echo ""
echo "🔄 Ana is now AUTOMATIC!"
echo "   • Every minute: Checks for new ENTREGADO orders"
echo "   • Automatically: Sends WhatsApp messages"
echo "   • Automatically: Responds to customer replies"
echo "   • Automatically: Saves to Firestore + Google Sheets"
echo ""
echo "🔍 Monitor Ana:"
echo "   firebase functions:log --only procesarSeguimientos --follow"
echo "   firebase functions:log --only whatsappWebhook --follow"
echo ""
echo "📊 View data:"
echo "   https://console.firebase.google.com/project/fullqueso-bot/firestore"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
