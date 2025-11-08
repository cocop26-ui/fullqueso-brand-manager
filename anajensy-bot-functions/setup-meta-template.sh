#!/bin/bash

# Automated Meta WhatsApp Template Setup
# This script creates the message template and checks approval status

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📱 META WHATSAPP TEMPLATE - AUTOMATED SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
WABA_ID="1346358903736402"
ACCESS_TOKEN="EAALluMeKdhEBP0NcHkUdFcW01VrYHgxEj1vfvdZCzDaskpwEVIIF7TFIAitoQpmfHEiKjYlKTKc1Gkj5OpZCYVUUQ5R2T6VRPUI5iANsKN6D2Wi40uJj6kPHlTEIVItl6FImdNgnVv3xp4eQLqd2KZCuJfYQBjZC9Indtv9uX3Gm7Y07JEOdroLbhRC8MUlJNQ7rGiZASYdjIZAEaOO1ZC1TRxM9Il9xwDWgC3E5Gc6oKaqoTZBBOcjWYZBIq807bAn2GdXZBlUPay7v5YqD4Yc6h4iQZDZD"
TEMPLATE_NAME="anajensy_order_followup"

echo "🔍 Step 1: Checking existing templates..."
echo ""

# Check if template already exists
EXISTING=$(curl -s -X GET \
  "https://graph.facebook.com/v21.0/${WABA_ID}/message_templates?name=${TEMPLATE_NAME}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$EXISTING" | grep -q "\"name\":\"${TEMPLATE_NAME}\""; then
  echo "✅ Template '${TEMPLATE_NAME}' already exists!"
  echo ""
  echo "Template Status:"
  echo "$EXISTING" | jq '.data[0] | {name, status, language, category}' 2>/dev/null || echo "$EXISTING"
  echo ""

  STATUS=$(echo "$EXISTING" | jq -r '.data[0].status' 2>/dev/null || echo "UNKNOWN")

  if [ "$STATUS" = "APPROVED" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 Template is APPROVED and ready to use!"
    echo ""
    echo "✅ You can now deploy and test Ana"
    echo ""
    exit 0
  elif [ "$STATUS" = "PENDING" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⏳ Template is PENDING approval from Meta"
    echo ""
    echo "Usually takes: 15 minutes - 24 hours"
    echo "You'll receive email when approved"
    echo ""
    echo "Run this script again to check status"
    echo ""
    exit 0
  else
    echo "⚠️  Template status: $STATUS"
    echo ""
  fi
else
  echo "📝 Template not found. Creating new template..."
  echo ""

  # Create the template
  echo "Creating template: ${TEMPLATE_NAME}"

  RESPONSE=$(curl -s -X POST \
    "https://graph.facebook.com/v21.0/${WABA_ID}/message_templates" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'"${TEMPLATE_NAME}"'",
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
  echo "Response:"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
  echo ""

  if echo "$RESPONSE" | grep -q "\"id\""; then
    TEMPLATE_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Template created successfully!"
    echo "   Template ID: $TEMPLATE_ID"
    echo ""
    echo "⏳ Waiting for Meta approval..."
    echo ""
    echo "Usually takes: 15 minutes - 24 hours"
    echo "You'll receive email notification"
    echo ""
    echo "Run this script again to check approval status:"
    echo "  ./setup-meta-template.sh"
    echo ""
    exit 0
  else
    echo "❌ Error creating template"
    echo ""
    echo "Possible reasons:"
    echo "1. Template name already exists (but in different language)"
    echo "2. Access token expired"
    echo "3. Missing permissions"
    echo ""
    echo "Manual alternative:"
    echo "1. Go to: https://business.facebook.com/wa/manage/message-templates/"
    echo "2. Click 'Create template'"
    echo "3. Use these details:"
    echo "   Name: anajensy_order_followup"
    echo "   Language: Spanish"
    echo "   Category: UTILITY"
    echo "   Body: Hola {{1}}! Gracias por tu pedido de {{2}}. ¿Cómo estuvo todo? Cuéntame qué tal te fue."
    echo ""
    exit 1
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
