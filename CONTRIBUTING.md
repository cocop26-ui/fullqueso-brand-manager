# Contributing to Full Queso Brand Manager

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit code changes
- 🧪 Write tests
- 🌍 Translate content

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/fullqueso-brand-manager.git
cd fullqueso-brand-manager
```

### 2. Set Up Development Environment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Install dependencies
cd anajensy-bot-functions/functions
npm install
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

## 📝 Code Style Guidelines

### JavaScript

- Use **ES6+** syntax
- Follow **functional programming** principles where possible
- Use `const` for immutable values, `let` for mutable
- Prefer arrow functions for callbacks
- Use template literals for string interpolation

**Example:**
```javascript
// Good
const sendMessage = async (phone, message) => {
  const formatted = `whatsapp:+58${phone}`;
  return await twilioClient.messages.create({ to: formatted, body: message });
};

// Avoid
function sendMessage(phone, message) {
  var formatted = "whatsapp:+58" + phone;
  return twilioClient.messages.create({ to: formatted, body: message });
}
```

### Naming Conventions

- **Functions:** `camelCase` - `enviarWhatsApp()`, `procesarSeguimientos()`
- **Variables:** `camelCase` - `clienteNombre`, `mensajeAna`
- **Constants:** `UPPER_SNAKE_CASE` - `ANAJENSY_PROMPT`, `TWILIO_ACCOUNT_SID`
- **Collections:** `snake_case` - `pedidos_bot`, `conversaciones_bot`

### Comments

- Write comments in Spanish for business logic (matches Venezuelan context)
- Use English for technical comments
- Document complex logic and edge cases

```javascript
// Formatear número venezolano (+58)
const telefonoLimpio = telefono.replace(/^0/, "");

// Handle Firebase timestamp conversion
const timestamp = admin.firestore.Timestamp.now();
```

## 🧪 Testing

### Before Submitting

1. **Test locally:**
```bash
cd anajensy-bot-functions/functions
node test-twilio.js
```

2. **Check for errors:**
```bash
npm run lint  # If linting is configured
```

3. **Test with sample data:**
```bash
cd firestore-setup
node populate-sample-data.js
```

### Testing Checklist

- [ ] Function runs without errors
- [ ] Messages send successfully via Twilio
- [ ] Firestore updates correctly
- [ ] Logs are clear and informative
- [ ] No sensitive data in logs

## 📦 Commit Guidelines

### Commit Message Format

Use conventional commits:

```
type(scope): brief description

Longer description if needed

- Additional details
- More context
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Examples

```bash
git commit -m "feat(anajensy): add sentiment analysis to conversations"
git commit -m "fix(whatsapp): correct phone number formatting for Venezuela"
git commit -m "docs(readme): add troubleshooting section"
```

## 🔐 Security Guidelines

### NEVER Commit

- `.env` files
- API keys or tokens
- Service account keys (`*-firebase-adminsdk-*.json`)
- Customer phone numbers or personal data
- Twilio credentials

### Before Pushing

1. Review your changes: `git diff`
2. Check for sensitive data
3. Verify `.gitignore` is working

```bash
# Check what will be committed
git status
git diff --staged
```

## 🌿 Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if using)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

## 📋 Pull Request Process

### 1. Before Creating PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No merge conflicts with main
- [ ] Commits are clean and descriptive

### 2. Create Pull Request

1. Push your branch: `git push origin feature/your-feature`
2. Go to GitHub and create a Pull Request
3. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

### 3. Code Review

- Be responsive to feedback
- Make requested changes
- Keep discussions respectful
- Ask questions if unclear

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Run '...'
3. See error

**Expected behavior**
What should happen

**Actual behavior**
What actually happens

**Screenshots/Logs**
Error messages or screenshots

**Environment**
- Node version:
- Firebase version:
- OS:

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Screenshots, mockups, etc.
```

## 🎯 Project Priorities

### High Priority
- Bug fixes affecting production
- Security vulnerabilities
- Critical performance issues

### Medium Priority
- New features
- Documentation improvements
- Code refactoring

### Low Priority
- Minor UI tweaks
- Optional enhancements

## 📞 Communication

### Where to Ask Questions

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Pull Requests** - Code-specific questions

### Response Times

- We aim to respond to issues within 48 hours
- PRs are reviewed within 3-5 business days
- Be patient - this is an open source project

## 🎓 Learning Resources

### Firebase
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Docs](https://firebase.google.com/docs/firestore)

### Twilio
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/api)

### Claude AI
- [Anthropic API Docs](https://docs.anthropic.com/claude/reference)

### Node.js
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## ✅ Review Checklist

Before submitting your PR, review this checklist:

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Added tests for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No sensitive data committed
- [ ] Code reviewed by yourself first
- [ ] Branch is up to date with main
- [ ] No merge conflicts

## 🙏 Thank You!

Your contributions make this project better! We appreciate your time and effort.

Questions? Open an issue or start a discussion!

---

Happy coding! 🎉
