#!/bin/bash

# N8N Workflow Setup Script
# This script sets up the Anajensy WhatsApp bot in n8n

set -e

N8N_URL="https://fullqueso.app.n8n.cloud"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZjczMTg1ZC0wMmRiLTQ1OWUtOWMwMi0xY2I0MDQwYzZmNmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxOTIwOTI0LCJleHAiOjE3Njk2NTkyMDB9.y6LvTgVSlsbFXCJH0577yJxbSY0sxI8pIxKN3AGzJWE"

echo "================================================"
echo "N8N Anajensy Bot - Automated Setup"
echo "================================================"
echo ""

# Check if required environment variables are set
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  Required environment variables not set!"
    echo ""
    echo "Please set the following:"
    echo "  export TWILIO_ACCOUNT_SID='your_twilio_account_sid'"
    echo "  export TWILIO_AUTH_TOKEN='your_twilio_auth_token'"
    echo "  export ANTHROPIC_API_KEY='your_anthropic_api_key'"
    echo ""
    echo "Or get them from Firebase secrets:"
    echo "  firebase functions:secrets:access TWILIO_ACCOUNT_SID"
    echo "  firebase functions:secrets:access TWILIO_AUTH_TOKEN"
    echo "  firebase functions:secrets:access ANTHROPIC_API_KEY"
    echo ""
    exit 1
fi

echo "✓ Environment variables loaded"
echo ""

# Step 1: Create Twilio Credential
echo "Step 1: Creating Twilio credential..."
echo "---------------------------------------"

twilio_response=$(curl -s -X POST "$N8N_URL/api/v1/credentials" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Twilio Account - Full Queso",
    "type": "twilioApi",
    "data": {
      "accountSid": "'"$TWILIO_ACCOUNT_SID"'",
      "authToken": "'"$TWILIO_AUTH_TOKEN"'"
    }
  }')

TWILIO_CRED_ID=$(echo "$twilio_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TWILIO_CRED_ID" ]; then
    echo "❌ Failed to create Twilio credential"
    echo "Response: $twilio_response"
    exit 1
fi

echo "✓ Twilio credential created: $TWILIO_CRED_ID"
echo ""

# Step 2: Create Anthropic Credential
echo "Step 2: Creating Anthropic credential..."
echo "---------------------------------------"

anthropic_response=$(curl -s -X POST "$N8N_URL/api/v1/credentials" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anthropic - Claude API",
    "type": "httpHeaderAuth",
    "data": {
      "name": "x-api-key",
      "value": "'"$ANTHROPIC_API_KEY"'"
    }
  }')

ANTHROPIC_CRED_ID=$(echo "$anthropic_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ANTHROPIC_CRED_ID" ]; then
    echo "❌ Failed to create Anthropic credential"
    echo "Response: $anthropic_response"
    exit 1
fi

echo "✓ Anthropic credential created: $ANTHROPIC_CRED_ID"
echo ""

# Step 3: Create Firebase Credential (requires OAuth - manual step)
echo "Step 3: Firebase Credential Setup"
echo "---------------------------------------"
echo "⚠️  Firebase OAuth2 credential requires manual setup in n8n UI:"
echo ""
echo "1. Go to: $N8N_URL/credentials"
echo "2. Click 'Add Credential'"
echo "3. Search for 'Google Firebase Cloud Firestore OAuth2 API'"
echo "4. Name: 'Firebase - Full Queso Bot'"
echo "5. Click 'Connect to Google' and authorize"
echo "6. Save and copy the credential ID"
echo ""
read -p "Enter Firebase credential ID (or press Enter to skip): " FIREBASE_CRED_ID
echo ""

# Step 4: Update workflow JSON with credential IDs
echo "Step 4: Updating workflow with credential IDs..."
echo "---------------------------------------"

# Read the workflow file
WORKFLOW_FILE="anajensy-bot-n8n-twilio-workflow.json"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

# Create updated workflow
cp "$WORKFLOW_FILE" "${WORKFLOW_FILE}.backup"

# Update credential IDs
sed -i.tmp "s/REPLACE_WITH_TWILIO_CREDENTIAL_ID/$TWILIO_CRED_ID/g" "$WORKFLOW_FILE"
sed -i.tmp "s/REPLACE_WITH_ANTHROPIC_CREDENTIAL_ID/$ANTHROPIC_CRED_ID/g" "$WORKFLOW_FILE"

if [ ! -z "$FIREBASE_CRED_ID" ]; then
    sed -i.tmp "s/REPLACE_WITH_FIREBASE_CREDENTIAL_ID/$FIREBASE_CRED_ID/g" "$WORKFLOW_FILE"
fi

rm -f "${WORKFLOW_FILE}.tmp"

echo "✓ Workflow file updated with credential IDs"
echo ""

# Step 5: Import workflow
if [ ! -z "$FIREBASE_CRED_ID" ]; then
    echo "Step 5: Importing workflow to n8n..."
    echo "---------------------------------------"

    workflow_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
      -H "X-N8N-API-KEY: $N8N_API_KEY" \
      -H "Content-Type: application/json" \
      -d @"$WORKFLOW_FILE")

    WORKFLOW_ID=$(echo "$workflow_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -z "$WORKFLOW_ID" ]; then
        echo "❌ Failed to import workflow"
        echo "Response: $workflow_response"

        # Restore backup
        mv "${WORKFLOW_FILE}.backup" "$WORKFLOW_FILE"
        exit 1
    fi

    echo "✓ Workflow imported: $WORKFLOW_ID"
    echo ""

    # Step 6: Activate workflow
    echo "Step 6: Activating workflow..."
    echo "---------------------------------------"

    activate_response=$(curl -s -X PATCH "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" \
      -H "X-N8N-API-KEY: $N8N_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"active": true}')

    echo "✓ Workflow activated!"
    echo ""
else
    echo "⚠️  Skipping workflow import (Firebase credential not set)"
    echo ""
    echo "Manual steps to complete:"
    echo "1. Set up Firebase credential in n8n UI"
    echo "2. Import workflow file: $WORKFLOW_FILE"
    echo "3. Update all Firebase credential references"
    echo "4. Activate the workflow"
    echo ""
fi

# Step 7: Get webhook URL
echo "================================================"
echo "Setup Summary"
echo "================================================"
echo ""
echo "✅ Twilio Credential ID: $TWILIO_CRED_ID"
echo "✅ Anthropic Credential ID: $ANTHROPIC_CRED_ID"
if [ ! -z "$FIREBASE_CRED_ID" ]; then
    echo "✅ Firebase Credential ID: $FIREBASE_CRED_ID"
    echo "✅ Workflow ID: $WORKFLOW_ID"
    echo ""
    echo "📍 Webhook URL:"
    echo "   $N8N_URL/webhook/anajensy-whatsapp-webhook"
    echo ""
    echo "Next steps:"
    echo "1. Configure Twilio webhook:"
    echo "   - Go to: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders"
    echo "   - Set webhook URL: $N8N_URL/webhook/anajensy-whatsapp-webhook"
    echo "   - Method: POST"
    echo ""
    echo "2. Test the workflow:"
    echo "   - Create a test order: cd functions && node create-order-fullqueso.js"
    echo "   - Wait 1 minute for Ana to send a message"
    echo "   - Reply to test the webhook"
else
    echo "⚠️  Firebase Credential: Not set (manual setup required)"
    echo ""
    echo "Next steps:"
    echo "1. Complete Firebase credential setup in n8n UI"
    echo "2. Import workflow: $WORKFLOW_FILE"
    echo "3. Configure Twilio webhook"
fi
echo ""
echo "================================================"
echo "✨ Setup complete!"
echo "================================================"
