#!/bin/bash

echo "🚀 Full Queso Brand Manager - GitHub Push Script"
echo "================================================"
echo ""

# Check if gh is authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub CLI is not authenticated."
    echo ""
    echo "Please authenticate by running:"
    echo "  gh auth login"
    echo ""
    echo "Or follow these steps:"
    echo "1. Go to: https://github.com/login/device"
    echo "2. Run: gh auth login"
    echo "3. Follow the prompts"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Create and push repository
echo "📦 Creating repository 'fullqueso-brand-manager'..."
gh repo create fullqueso-brand-manager \
    --public \
    --source=. \
    --remote=origin \
    --push \
    --description="AI-powered WhatsApp bot for automated customer follow-ups using Claude AI and Twilio"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Repository created and code pushed!"
    echo ""
    echo "📍 Your repository: https://github.com/$(gh api user --jq .login)/fullqueso-brand-manager"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Invite collaborators (Settings → Collaborators)"
    echo "3. Share the repository URL with your team!"
else
    echo ""
    echo "❌ Failed to create repository."
    echo "You may need to create it manually at: https://github.com/new"
fi
