#!/bin/bash

# Create Test Order for Ana Customer Service Flow
# This script creates a test order in Firestore that Ana will process

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 ANA CUSTOMER SERVICE - CREATE TEST ORDER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate unique ticket
TIMESTAMP=$(date +%s)
TICKET="FQ-TEST-${TIMESTAMP}"

echo "📦 Creating test order..."
echo "   Ticket: $TICKET"
echo "   Customer: Pedro Test"
echo "   Phone: +584241476748"
echo "   Products: Tequeños x12, Choco Arequipe"
echo ""

# Create test order JSON
cat > /tmp/test-order-${TIMESTAMP}.json <<EOF
{
  "ticket": "${TICKET}",
  "cliente_nombre": "Pedro Test",
  "cliente_telefono": "584241476748",
  "estado": "ENTREGADO",
  "seguimiento_enviado": false,
  "fecha_entregado": {
    "_seconds": $(date +%s),
    "_nanoseconds": 0
  },
  "fecha_verificado": {
    "_seconds": $(date +%s),
    "_nanoseconds": 0
  },
  "productos": [
    {
      "nombre": "Tequeños x12",
      "cantidad": 1,
      "precio": 15
    },
    {
      "nombre": "Choco Arequipe",
      "cantidad": 1,
      "precio": 8
    }
  ],
  "tipo": "delivery",
  "total": 23,
  "pedido_id": "test_${TIMESTAMP}"
}
EOF

echo "📝 Test order data saved to: /tmp/test-order-${TIMESTAMP}.json"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Add this order to Firestore manually:"
echo ""
echo "   a) Go to: https://console.firebase.google.com/project/fullqueso-bot/firestore"
echo "   b) Click on 'pedidos_bot' collection"
echo "   c) Click 'Add document'"
echo "   d) Use auto-generated ID"
echo "   e) Copy the JSON data from: /tmp/test-order-${TIMESTAMP}.json"
echo ""
echo "2. Or use Firebase CLI (if available):"
echo ""
echo "   # Import the order"
echo "   firebase firestore:write pedidos_bot < /tmp/test-order-${TIMESTAMP}.json"
echo ""
echo "3. Wait 1-2 minutes for Ana to process"
echo ""
echo "4. Check WhatsApp on +584241476748"
echo "   You should receive Ana's initial message!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Monitor the process:"
echo ""
echo "   # Watch function logs"
echo "   firebase functions:log --follow"
echo ""
echo "   # Check specific function"
echo "   firebase functions:log --only procesarSeguimientos"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Test order data ready!"
echo ""
echo "Copy this data to Firestore:"
echo ""
cat /tmp/test-order-${TIMESTAMP}.json | jq . 2>/dev/null || cat /tmp/test-order-${TIMESTAMP}.json
echo ""
