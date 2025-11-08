#!/bin/bash

# Check Meta WhatsApp Message Template Status

META_TOKEN="EAALluMeKdhEBP0NcHkUdFcW01VrYHgxEj1vfvdZCzDaskpwEVIIF7TFIAitoQpmfHEiKjYlKTKc1Gkj5OpZCYVUUQ5R2T6VRPUI5iANsKN6D2Wi40uJj6kPHlTEIVItl6FImdNgnVv3xp4eQLqd2KZCuJfYQBjZC9Indtv9uX3Gm7Y07JEOdroLbhRC8MUlJNQ7rGiZASYdjIZAEaOO1ZC1TRxM9Il9xwDWgC3E5Gc6oKaqoTZBBOcjWYZBIq807bAn2GdXZBlUPay7v5YqD4Yc6h4iQZDZD"
PHONE_NUMBER_ID="805718575964429"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 META WHATSAPP TEMPLATE STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get WABA ID
echo "Getting WhatsApp Business Account ID..."
WABA_RESPONSE=$(curl -s -X GET \
  "https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}?fields=id,account_id" \
  -H "Authorization: Bearer ${META_TOKEN}")

WABA_ID=$(echo "$WABA_RESPONSE" | grep -o '"account_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$WABA_ID" ]; then
  echo "❌ Failed to get WABA ID"
  echo "$WABA_RESPONSE"
  exit 1
fi

echo "✅ WABA ID: $WABA_ID"
echo ""

# Get all templates
echo "📋 Fetching message templates..."
echo ""

TEMPLATES_RESPONSE=$(curl -s -X GET \
  "https://graph.facebook.com/v21.0/${WABA_ID}/message_templates?fields=id,name,status,language,category,components" \
  -H "Authorization: Bearer ${META_TOKEN}")

# Pretty print
echo "$TEMPLATES_RESPONSE" | jq . 2>/dev/null || echo "$TEMPLATES_RESPONSE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check specifically for our template
if echo "$TEMPLATES_RESPONSE" | grep -q "anajensy_order_followup"; then
  echo "✅ Template 'anajensy_order_followup' found!"
  echo ""

  # Extract status
  STATUS=$(echo "$TEMPLATES_RESPONSE" | grep -A 10 "anajensy_order_followup" | grep -o '"status":"[^"]*' | cut -d'"' -f4)

  echo "Status: $STATUS"
  echo ""

  if [ "$STATUS" = "APPROVED" ]; then
    echo "🎉 Template is APPROVED and ready to use!"
    echo ""
    echo "You can now:"
    echo "  1. Deploy your Firebase functions"
    echo "  2. Add a test order"
    echo "  3. Ana will send messages using this template"
  elif [ "$STATUS" = "PENDING" ]; then
    echo "⏳ Template is PENDING approval"
    echo ""
    echo "This usually takes 15 minutes to 24 hours."
    echo "You'll receive an email when approved."
  elif [ "$STATUS" = "REJECTED" ]; then
    echo "❌ Template was REJECTED"
    echo ""
    echo "Check the rejection reason and create a new template."
  else
    echo "⚠️  Unknown status: $STATUS"
  fi
else
  echo "⚠️  Template 'anajensy_order_followup' not found"
  echo ""
  echo "Create it by running: ./setup-meta-template.sh"
  echo "Or manually at: https://business.facebook.com/wa/manage/message-templates/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
