#!/bin/bash

# Firebase Secrets Configuration Script
# Run this script to configure Meta WhatsApp API secrets

set -e  # Exit on error

echo "🔧 Configuring Firebase Secrets for Meta WhatsApp API"
echo ""

# Meta Access Token
META_TOKEN="EAALluMeKdhEBP0NcHkUdFcW01VrYHgxEj1vfvdZCzDaskpwEVIIF7TFIAitoQpmfHEiKjYlKTKc1Gkj5OpZCYVUUQ5R2T6VRPUI5iANsKN6D2Wi40uJj6kPHlTEIVItl6FImdNgnVv3xp4eQLqd2KZCuJfYQBjZC9Indtv9uX3Gm7Y07JEOdroLbhRC8MUlJNQ7rGiZASYdjIZAEaOO1ZC1TRxM9Il9xwDWgC3E5Gc6oKaqoTZBBOcjWYZBIq807bAn2GdXZBlUPay7v5YqD4Yc6h4iQZDZD"

# Phone Number ID
PHONE_NUMBER_ID="805718575964429"

echo "📱 Setting WHATSAPP_ACCESS_TOKEN..."
echo -n "$META_TOKEN" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN

echo ""
echo "📞 Setting WHATSAPP_PHONE_NUMBER_ID..."
echo -n "$PHONE_NUMBER_ID" | firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID

echo ""
echo "✅ Firebase secrets configured successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy to Firebase: cd .. && firebase deploy --only functions"
echo "2. Configure Meta webhook (see META_API_DEPLOYMENT_GUIDE.md)"
echo "3. Test the integration"
