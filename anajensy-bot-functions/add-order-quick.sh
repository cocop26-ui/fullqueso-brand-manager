#!/bin/bash

# Quick script to add test order via Firebase CLI

echo "Adding test order to Firestore..."

# Create test order data
cat > /tmp/test-order.json << 'EOF'
{
  "ticket": "FQ-TEST-ANA-001",
  "cliente_nombre": "Pedro Padilla",
  "cliente_telefono": "584241476748",
  "estado": "ENTREGADO",
  "seguimiento_enviado": false,
  "tipo": "delivery",
  "total": 25,
  "productos": [
    {
      "nombre": "Churros Choco Arequipe x15",
      "cantidad": 1,
      "precio": 25
    }
  ]
}
EOF

# Use Firebase CLI to add via REST API
echo ""
echo "Test order created. Now adding to Firestore..."
echo ""

# Get project details
PROJECT_ID="fullqueso-bot"

# Instructions for adding via curl
echo "Run this command to add the order:"
echo ""
echo "firebase firestore:add pedidos_bot /tmp/test-order.json"
echo ""
echo "Or use the REST API:"
echo ""
cat << 'APIEOF'
curl -X POST \
  "https://firestore.googleapis.com/v1/projects/fullqueso-bot/databases/(default)/documents/pedidos_bot" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d @/tmp/test-order.json
APIEOF

echo ""
echo "Order JSON saved to: /tmp/test-order.json"
