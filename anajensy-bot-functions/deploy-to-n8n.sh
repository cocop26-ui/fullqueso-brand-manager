#!/bin/bash

# Deploy Anajensy Bot Workflow to n8n via API

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           Deploy Anajensy Bot Workflow to n8n                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Load configuration
if [ -f .n8n-config ]; then
  source .n8n-config
  echo "✓ Configuration loaded"
else
  echo "✗ Configuration not found!"
  echo "  Please run ./setup-n8n-api.sh first"
  exit 1
fi

echo ""
echo "n8n Instance: $N8N_URL"
echo ""

# Function to create credential
create_credential() {
  local cred_type=$1
  local cred_name=$2
  local cred_data=$3

  echo "Creating credential: $cred_name..."

  response=$(curl -s -w "\n%{http_code}" -X POST "$N8N_URL/api/v1/credentials" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$cred_data")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    cred_id=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  ✓ Created credential: $cred_name (ID: $cred_id)"
    echo "$cred_id"
  else
    echo "  ✗ Failed to create credential (HTTP $http_code)"
    echo "  Response: $body"
    echo ""
    return 1
  fi
}

# Step 1: Create Firebase Credential
echo "Step 1: Create Firebase Credential"
echo "-----------------------------------"

# Read Firebase service account JSON
FIREBASE_JSON_PATH="/Users/pedropadilla/Downloads/anajensy-n8n-firebase-adminsdk-fbsvc-9185693959.json"

if [ ! -f "$FIREBASE_JSON_PATH" ]; then
  echo "✗ Firebase service account JSON not found at:"
  echo "  $FIREBASE_JSON_PATH"
  exit 1
fi

FIREBASE_JSON=$(cat "$FIREBASE_JSON_PATH" | jq -c .)

firebase_cred_data=$(cat <<EOF
{
  "name": "Firebase - Anajensy Bot",
  "type": "googleFirestoreOAuth2Api",
  "data": {
    "email": $(echo $FIREBASE_JSON | jq -c '.client_email'),
    "privateKey": $(echo $FIREBASE_JSON | jq -c '.private_key'),
    "projectId": "anajensy-n8n"
  }
}
EOF
)

FIREBASE_CRED_ID=$(create_credential "googleFirestoreOAuth2Api" "Firebase - Anajensy Bot" "$firebase_cred_data")

if [ $? -ne 0 ]; then
  echo "Failed to create Firebase credential. Exiting."
  exit 1
fi

echo ""

# Step 2: Create Anthropic Credential
echo "Step 2: Create Anthropic API Credential"
echo "---------------------------------------"

anthropic_cred_data=$(cat <<EOF
{
  "name": "Anthropic - Claude API",
  "type": "httpHeaderAuth",
  "data": {
    "name": "x-api-key",
    "value": "${ANTHROPIC_API_KEY:-YOUR_ANTHROPIC_API_KEY}"
  }
}
EOF
)

ANTHROPIC_CRED_ID=$(create_credential "httpHeaderAuth" "Anthropic - Claude API" "$anthropic_cred_data")

if [ $? -ne 0 ]; then
  echo "Failed to create Anthropic credential. Exiting."
  exit 1
fi

echo ""

# Step 3: Update workflow JSON with credential IDs
echo "Step 3: Prepare Workflow JSON"
echo "------------------------------"

WORKFLOW_JSON=$(cat anajensy-bot-n8n-workflow.json)

# Replace placeholder credential IDs with real ones
WORKFLOW_JSON=$(echo "$WORKFLOW_JSON" | jq \
  --arg firebase_id "$FIREBASE_CRED_ID" \
  --arg anthropic_id "$ANTHROPIC_CRED_ID" \
  '
  .nodes |= map(
    if .credentials.googleFirestoreOAuth2Api then
      .credentials.googleFirestoreOAuth2Api.id = $firebase_id
    else . end |
    if .credentials.httpHeaderAuth then
      .credentials.httpHeaderAuth.id = $anthropic_id
    else . end
  )
  ')

echo "✓ Workflow JSON prepared with credential IDs"
echo ""

# Step 4: Create workflow
echo "Step 4: Create Workflow in n8n"
echo "-------------------------------"

response=$(curl -s -w "\n%{http_code}" -X POST "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$WORKFLOW_JSON")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
  workflow_id=$(echo "$body" | jq -r '.id // .data.id')
  workflow_name=$(echo "$body" | jq -r '.name // .data.name')
  echo "✓ Workflow created successfully!"
  echo "  Name: $workflow_name"
  echo "  ID: $workflow_id"
  echo "  URL: $N8N_URL/workflow/$workflow_id"
else
  echo "✗ Failed to create workflow (HTTP $http_code)"
  echo "Response: $body"
  exit 1
fi

echo ""

# Step 5: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   Deployment Successful!                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Credentials Created:"
echo "  ✓ Firebase - Anajensy Bot (ID: $FIREBASE_CRED_ID)"
echo "  ✓ Anthropic - Claude API (ID: $ANTHROPIC_CRED_ID)"
echo ""
echo "Workflow Created:"
echo "  ✓ Anajensy Follow-up Bot (ID: $workflow_id)"
echo ""
echo "Next Steps:"
echo "  1. Open: $N8N_URL/workflow/$workflow_id"
echo "  2. Review the workflow configuration"
echo "  3. Create test data in Firestore"
echo "  4. Test the workflow manually (click 'Test Workflow' button)"
echo "  5. Activate the workflow (toggle 'Inactive' to 'Active')"
echo ""
echo "Important Notes:"
echo "  - The workflow is INACTIVE by default"
echo "  - Schedule trigger will run every 1 minute when activated"
echo "  - WhatsApp credentials are embedded in the workflow"
echo "  - Test thoroughly before activating!"
echo ""
