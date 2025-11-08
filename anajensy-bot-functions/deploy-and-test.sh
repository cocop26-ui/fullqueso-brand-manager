#!/bin/bash

# Complete Ana Deployment and Testing Script
# This script deploys Ana to Meta WhatsApp API and creates a test order

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 ANA META API - COMPLETE DEPLOYMENT & TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -f "configure-secrets.sh" ]; then
    echo "❌ Error: Run this script from anajensy-bot-functions directory"
    exit 1
fi

echo "📋 This script will:"
echo "   1. Configure Firebase secrets with Meta API token"
echo "   2. Install dependencies"
echo "   3. Deploy functions to Firebase"
echo "   4. Create a test order in Firestore"
echo "   5. Monitor Ana's response"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."
echo ""

# Step 1: Configure Firebase Secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Configuring Firebase Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./configure-secrets.sh

echo ""
echo "✅ Secrets configured!"
echo ""

# Step 2: Install Dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Installing Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd functions
echo "Installing packages (removing Twilio, keeping Meta API dependencies)..."
npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""

# Step 3: Deploy to Firebase
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Deploying to Firebase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

firebase deploy --only functions

echo ""
echo "✅ Deployment complete!"
echo ""

# Step 4: Create Test Order
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Creating Test Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate test order
TIMESTAMP=$(date +%s)
TICKET="FQ-TEST-${TIMESTAMP}"

echo "📦 Test Order:"
echo "   Ticket: $TICKET"
echo "   Customer: Pedro Test"
echo "   Phone: +584241476748"
echo "   Products: Tequeños x12, Choco Arequipe"
echo ""

# Create the test order JSON for Firestore import
TEST_ORDER_FILE="/tmp/ana-test-order.json"
cat > $TEST_ORDER_FILE <<EOF
{
  "ticket": "${TICKET}",
  "cliente_nombre": "Pedro Test",
  "cliente_telefono": "584241476748",
  "estado": "ENTREGADO",
  "seguimiento_enviado": false,
  "fecha_entregado": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "fecha_verificado": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "productos": [
    {"nombre": "Tequeños x12", "cantidad": 1, "precio": 15},
    {"nombre": "Choco Arequipe", "cantidad": 1, "precio": 8}
  ],
  "tipo": "delivery",
  "total": 23,
  "pedido_id": "test_${TIMESTAMP}"
}
EOF

echo "Test order JSON created at: $TEST_ORDER_FILE"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "Add this order to Firestore:"
echo ""
echo "Option A - Firebase Console (Recommended):"
echo "  1. Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore"
echo "  2. Click 'pedidos_bot' collection"
echo "  3. Click 'Add document'"
echo "  4. Copy and paste this data:"
echo ""
cat $TEST_ORDER_FILE | jq . 2>/dev/null || cat $TEST_ORDER_FILE
echo ""
echo "Option B - Firebase CLI:"
echo "  firebase firestore:write pedidos_bot/\$(uuidgen) < $TEST_ORDER_FILE"
echo ""

read -p "Press ENTER after you've added the test order to Firestore..."
echo ""

# Step 5: Monitor
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Monitoring Ana's Response"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏳ Waiting for Ana to process the order..."
echo "   (procesarSeguimientos runs every 1 minute)"
echo ""
echo "Monitoring logs for 3 minutes..."
echo ""

# Monitor logs for 3 minutes
timeout 180 firebase functions:log --only procesarSeguimientos --follow || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ DEPLOYMENT AND TEST COMPLETE!"
echo ""
echo "📱 Next Steps:"
echo ""
echo "1. Check WhatsApp on +584241476748"
echo "   You should receive Ana's initial message!"
echo ""
echo "2. Reply to Ana to test the conversation flow:"
echo "   Ana: (Initial message about your order)"
echo "   You: \"Hola Ana! Todo estuvo excelente\""
echo "   Ana: (Asks about the product)"
echo "   You: \"Los tequeños estaban deliciosos y calientes\""
echo "   Ana: (Asks about delivery)"
echo "   You: \"El delivery fue rápido, todo perfecto\""
echo "   Ana: (Asks for email)"
echo "   You: \"pedro@example.com\""
echo "   Ana: (Thanks and closes conversation)"
echo ""
echo "3. Monitor webhook responses:"
echo "   firebase functions:log --only whatsappWebhook --follow"
echo ""
echo "4. Check data in Firestore:"
echo "   - conversaciones_bot collection"
echo "   - encuestas_postventa collection"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
