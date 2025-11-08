#!/bin/bash

# Complete Ana Meta WhatsApp Setup - Fully Automated
# This script handles everything from template creation to testing

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 ANA COMPLETE SETUP - FULLY AUTOMATED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will:"
echo "  1. ✅ Create Meta WhatsApp message template"
echo "  2. ✅ Configure Firebase secrets"
echo "  3. ✅ Deploy functions to Firebase"
echo "  4. ✅ Test Ana with Pedro's order"
echo ""
read -p "Press ENTER to start or Ctrl+C to cancel..."
echo ""

# ============================================================================
# STEP 1: Setup Meta Template
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Meta WhatsApp Template Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./setup-meta-template.sh

TEMPLATE_STATUS=$?

if [ $TEMPLATE_STATUS -ne 0 ]; then
  echo ""
  echo "⚠️  Template setup incomplete"
  echo ""
  echo "Please create the template manually:"
  echo "1. Go to: https://business.facebook.com/wa/manage/message-templates/"
  echo "2. Follow instructions in CREATE_META_TEMPLATE.md"
  echo ""
  read -p "Press ENTER after creating the template, or Ctrl+C to exit..."
fi

echo ""
echo "✅ Template setup complete"
echo ""

# ============================================================================
# STEP 2: Configure Firebase Secrets
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Configure Firebase Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "./configure-secrets.sh" ]; then
  ./configure-secrets.sh
else
  echo "⚠️  configure-secrets.sh not found"
  echo ""
  echo "Manual setup:"
  echo ""
  echo "META_TOKEN=\"EAALluMeKdhEBP0NcHkUdFcW01VrYHgxEj1vfvdZCzDaskpwEVIIF7TFIAitoQpmfHEiKjYlKTKc1Gkj5OpZCYVUUQ5R2T6VRPUI5iANsKN6D2Wi40uJj6kPHlTEIVItl6FImdNgnVv3xp4eQLqd2KZCuJfYQBjZC9Indtv9uX3Gm7Y07JEOdroLbhRC8MUlJNQ7rGiZASYdjIZAEaOO1ZC1TRxM9Il9xwDWgC3E5Gc6oKaqoTZBBOcjWYZBIq807bAn2GdXZBlUPay7v5YqD4Yc6h4iQZDZD\""
  echo "echo -n \"\$META_TOKEN\" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN"
  echo "echo -n \"805718575964429\" | firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID"
  echo ""
  read -p "Press ENTER after configuring secrets..."
fi

echo ""
echo "✅ Secrets configured"
echo ""

# ============================================================================
# STEP 3: Install Dependencies
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Install Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd functions
npm install
cd ..

echo ""
echo "✅ Dependencies installed"
echo ""

# ============================================================================
# STEP 4: Deploy to Firebase
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Deploy to Firebase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

firebase deploy --only functions

echo ""
echo "✅ Functions deployed"
echo ""

# ============================================================================
# STEP 5: Create Test Order
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Create Test Order for Pedro"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TIMESTAMP=$(date +%s)
TICKET="FQ-TEST-PEDRO-${TIMESTAMP}"

cat > /tmp/pedro-order-${TIMESTAMP}.json <<EOF
{
  "ticket": "${TICKET}",
  "cliente_nombre": "Pedro Padilla",
  "cliente_telefono": "584241476748",
  "estado": "ENTREGADO",
  "seguimiento_enviado": false,
  "fecha_entregado": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "fecha_verificado": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "productos": [
    {
      "nombre": "Churros Choco Arequipe x15",
      "cantidad": 1,
      "precio": 25
    }
  ],
  "tipo": "delivery",
  "total": 25,
  "pedido_id": "pedro_test_${TIMESTAMP}"
}
EOF

echo "📦 Test Order Created:"
echo "   Ticket: ${TICKET}"
echo "   Customer: Pedro Padilla"
echo "   Phone: +584241476748"
echo "   Product: Churros Choco Arequipe x15"
echo ""
echo "JSON saved to: /tmp/pedro-order-${TIMESTAMP}.json"
echo ""

cat /tmp/pedro-order-${TIMESTAMP}.json | jq . 2>/dev/null || cat /tmp/pedro-order-${TIMESTAMP}.json

echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "Add this order to Firestore:"
echo "1. Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore/data/~2Fpedidos_bot"
echo "2. Click 'Add document'"
echo "3. Copy the JSON above"
echo ""
read -p "Press ENTER after adding the order to Firestore..."

echo ""
echo "✅ Test order ready"
echo ""

# ============================================================================
# STEP 6: Monitor Ana
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Monitor Ana's Response"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏳ Monitoring logs for 3 minutes..."
echo "   (Ana's procesarSeguimientos runs every 1 minute)"
echo ""

timeout 180 firebase functions:log --only procesarSeguimientos --follow || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "📱 Check WhatsApp on +584241476748"
echo "   You should receive Ana's message about the churros"
echo ""
echo "💬 Test the conversation flow:"
echo "   1. Ana: Initial template message"
echo "   2. You: Reply with feedback"
echo "   3. Ana: Asks about product"
echo "   4. You: Product feedback"
echo "   5. Ana: Asks about delivery"
echo "   6. You: Delivery feedback"
echo "   7. Ana: Asks for email"
echo "   8. You: pedro@fullqueso.com"
echo "   9. Ana: Thanks and closes"
echo ""
echo "🔍 Continue monitoring:"
echo "   firebase functions:log --only whatsappWebhook --follow"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
