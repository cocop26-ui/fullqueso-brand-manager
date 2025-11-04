#!/bin/bash

# N8N API Setup Script
# This script will help you configure n8n API access and deploy the workflow

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         N8N API Configuration & Workflow Deployment            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Get n8n instance URL
echo "Step 1: n8n Instance URL"
echo "------------------------"
echo "Please provide your n8n instance URL:"
echo "  - Cloud: https://your-workspace.app.n8n.cloud"
echo "  - Self-hosted: https://your-domain.com"
echo ""
read -p "Enter your n8n URL: " N8N_URL

# Remove trailing slash if present
N8N_URL=${N8N_URL%/}

echo ""
echo "✓ Using n8n instance: $N8N_URL"
echo ""

# Step 2: Get n8n API Key
echo "Step 2: n8n API Key"
echo "-------------------"
echo "To get your API key:"
echo "  1. Go to: $N8N_URL"
echo "  2. Click your profile (top right) → Settings"
echo "  3. Go to 'API' section"
echo "  4. Click 'Create API Key'"
echo "  5. Copy the key"
echo ""
read -p "Enter your n8n API Key: " N8N_API_KEY

echo ""
echo "✓ API Key received"
echo ""

# Step 3: Test connection
echo "Step 3: Testing API Connection"
echo "-------------------------------"

# Test API connection
response=$(curl -s -w "\n%{http_code}" -X GET "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Accept: application/json")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo "✓ API connection successful!"
  workflow_count=$(echo "$body" | grep -o '"data":\[' | wc -l)
  echo "  Found existing workflows"
else
  echo "✗ API connection failed (HTTP $http_code)"
  echo "  Response: $body"
  echo ""
  echo "Please check:"
  echo "  - n8n URL is correct"
  echo "  - API key is valid"
  echo "  - API is enabled in your n8n instance"
  exit 1
fi

echo ""

# Save configuration
echo "Step 4: Save Configuration"
echo "--------------------------"

cat > .n8n-config << EOF
N8N_URL=$N8N_URL
N8N_API_KEY=$N8N_API_KEY
EOF

echo "✓ Configuration saved to .n8n-config"
echo ""

# Export for current session
export N8N_URL
export N8N_API_KEY

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Configuration Complete!                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Run: source .n8n-config"
echo "  2. Run: ./deploy-workflow.sh"
echo ""
echo "Or manually deploy with:"
echo "  curl -X POST \"$N8N_URL/api/v1/workflows\" \\"
echo "    -H \"X-N8N-API-KEY: $N8N_API_KEY\" \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d @anajensy-bot-n8n-workflow.json"
echo ""
