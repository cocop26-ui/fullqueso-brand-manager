#!/bin/bash

# Ana Setup Verification Script
# Checks if all components are configured correctly

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ ANA SETUP VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0
WARNINGS=0

# ============================================================================
# Check 1: Meta Templates
# ============================================================================

echo "📋 Checking Meta Templates..."
echo ""

if [ -f "./check-meta-template-status.sh" ]; then
  ./check-meta-template-status.sh 2>&1 | grep -q "anajensy_order_followup"
  if [ $? -eq 0 ]; then
    echo "✅ Template 'anajensy_order_followup' found"
  else
    echo "❌ Template 'anajensy_order_followup' not found"
    ((ERRORS++))
  fi
else
  echo "⚠️  Cannot verify template (check-meta-template-status.sh not found)"
  ((WARNINGS++))
fi

echo ""

# ============================================================================
# Check 2: Firebase Functions
# ============================================================================

echo "🔥 Checking Firebase Functions..."
echo ""

FUNCTIONS=$(firebase functions:list 2>/dev/null)

if echo "$FUNCTIONS" | grep -q "procesarSeguimientos"; then
  echo "✅ Function 'procesarSeguimientos' deployed"
else
  echo "❌ Function 'procesarSeguimientos' not deployed"
  ((ERRORS++))
fi

if echo "$FUNCTIONS" | grep -q "whatsappWebhook"; then
  echo "✅ Function 'whatsappWebhook' deployed"

  # Extract webhook URL
  WEBHOOK_URL=$(echo "$FUNCTIONS" | grep whatsappWebhook | awk '{print $NF}')
  echo "   URL: $WEBHOOK_URL"
else
  echo "❌ Function 'whatsappWebhook' not deployed"
  ((ERRORS++))
fi

echo ""

# ============================================================================
# Check 3: Firebase Secrets
# ============================================================================

echo "🔐 Checking Firebase Secrets..."
echo ""

SECRETS=$(firebase functions:secrets:list 2>/dev/null)

if echo "$SECRETS" | grep -q "WHATSAPP_ACCESS_TOKEN"; then
  echo "✅ Secret 'WHATSAPP_ACCESS_TOKEN' configured"
else
  echo "❌ Secret 'WHATSAPP_ACCESS_TOKEN' not configured"
  ((ERRORS++))
fi

if echo "$SECRETS" | grep -q "WHATSAPP_PHONE_NUMBER_ID"; then
  echo "✅ Secret 'WHATSAPP_PHONE_NUMBER_ID' configured"
else
  echo "❌ Secret 'WHATSAPP_PHONE_NUMBER_ID' not configured"
  ((ERRORS++))
fi

if echo "$SECRETS" | grep -q "ANTHROPIC_API_KEY"; then
  echo "✅ Secret 'ANTHROPIC_API_KEY' configured"
else
  echo "⚠️  Secret 'ANTHROPIC_API_KEY' not configured"
  ((WARNINGS++))
fi

echo ""

# ============================================================================
# Check 4: Code Configuration
# ============================================================================

echo "💻 Checking Code Configuration..."
echo ""

if grep -q "anajensy_order_followup" functions/index.js; then
  echo "✅ Template name in code matches approved template"
else
  echo "❌ Template name mismatch in code"
  ((ERRORS++))
fi

if grep -q "fullqueso_webhook_verify_2025" functions/index.js; then
  echo "✅ Webhook verify token configured"
else
  echo "⚠️  Webhook verify token not found in code"
  ((WARNINGS++))
fi

echo ""

# ============================================================================
# Check 5: Dependencies
# ============================================================================

echo "📦 Checking Dependencies..."
echo ""

if [ -d "functions/node_modules" ]; then
  echo "✅ Node modules installed in functions/"
else
  echo "⚠️  Node modules not found. Run: cd functions && npm install"
  ((WARNINGS++))
fi

if [ -f "firebase.json" ]; then
  echo "✅ firebase.json exists"
else
  echo "❌ firebase.json not found"
  ((ERRORS++))
fi

if [ -f ".firebaserc" ]; then
  echo "✅ .firebaserc exists"

  if grep -q "fullqueso-bot" .firebaserc; then
    echo "   Project: fullqueso-bot ✅"
  else
    echo "   ⚠️  Project mismatch in .firebaserc"
    ((WARNINGS++))
  fi
else
  echo "❌ .firebaserc not found"
  ((ERRORS++))
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "🎉 ALL CHECKS PASSED!"
  echo ""
  echo "✅ Ana is ready to go!"
  echo ""
  echo "Next steps:"
  echo "  1. Configure Meta webhook (see WEBHOOK_SETUP.md)"
  echo "  2. Add test order: node add-pedro-test-order.js"
  echo "  3. Monitor: firebase functions:log --follow"
  echo ""
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  SETUP COMPLETE WITH WARNINGS"
  echo ""
  echo "Warnings: $WARNINGS"
  echo ""
  echo "Ana should work, but check warnings above."
  echo ""
elif [ $ERRORS -gt 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "❌ SETUP INCOMPLETE"
  echo ""
  echo "Errors: $ERRORS"
  echo ""
  echo "Fix errors above before deploying Ana."
  echo ""
  echo "Run deployment: ./deploy-ana-now.sh"
  echo ""
else
  echo "❌ SETUP INCOMPLETE"
  echo ""
  echo "Errors: $ERRORS"
  echo "Warnings: $WARNINGS"
  echo ""
  echo "Fix errors above before deploying Ana."
  echo ""
  echo "Run deployment: ./deploy-ana-now.sh"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $ERRORS
