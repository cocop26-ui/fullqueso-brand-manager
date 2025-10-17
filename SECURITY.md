# Security Policy

## 🔐 Reporting Security Issues

If you discover a security vulnerability, please email security@fullqueso.com (or open a private security advisory on GitHub).

**DO NOT** open a public issue for security vulnerabilities.

## 🚨 Security Incident - Firebase API Key Exposure

**Date:** October 17, 2025
**Status:** RESOLVED

### What Happened
A Firebase API key was accidentally committed to the public GitHub repository in the file:
- `admin-dashboard/public/js/firebase-config.js`

### Actions Taken
1. ✅ Removed hardcoded Firebase config from repository
2. ✅ Created `firebase-config.example.js` as template
3. ✅ Updated `.gitignore` to prevent future commits of `firebase-config.js`
4. ✅ Pushed security fixes to GitHub
5. ⏳ **YOU MUST DO:** Regenerate the API key in Google Cloud Console

### Immediate Action Required

**YOU MUST regenerate your Firebase API key NOW:**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials?project=fullqueso-bot

2. **Find the exposed key:**
   - Look for API key: `AIzaSyAgsuEAW8bcyFfsV55WFiKmPHEIfjYnjJY`

3. **Delete or Regenerate:**
   - Click on the key
   - Click "Delete" or "Regenerate Key"
   - Copy the new key

4. **Update your local config:**
   ```bash
   cd admin-dashboard/public/js/
   cp firebase-config.example.js firebase-config.js
   # Edit firebase-config.js with NEW credentials
   ```

5. **Add API Key Restrictions (Important!):**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your API key
   - Under "API restrictions" → Select "Restrict key"
   - Choose only the APIs you need:
     - ✅ Cloud Firestore API
     - ✅ Firebase Authentication API
     - ✅ Identity Toolkit API
   - Under "Application restrictions":
     - Select "HTTP referrers"
     - Add: `localhost:*` (for development)
     - Add: `YOUR-DOMAIN.com/*` (for production)
   - Click "Save"

## 🛡️ Security Best Practices

### Never Commit These Files:
- ❌ `.env` files
- ❌ `firebase-config.js` (use `.example.js` instead)
- ❌ Service account JSON files
- ❌ API keys, tokens, passwords
- ❌ Customer data or phone numbers

### Always Do This:
- ✅ Use environment variables for secrets
- ✅ Add sensitive files to `.gitignore`
- ✅ Use `.example` files as templates
- ✅ Restrict API keys to specific domains
- ✅ Enable Firebase App Check
- ✅ Use Firebase Security Rules
- ✅ Review commits before pushing

## 📋 Firebase Security Checklist

- [ ] API key regenerated after exposure
- [ ] API key restrictions configured
- [ ] HTTP referrers set for web API key
- [ ] Firestore Security Rules configured
- [ ] Firebase App Check enabled (recommended)
- [ ] Service account keys secured
- [ ] Regular security audits scheduled

## 🔒 Securing Your Firebase Config

### For Local Development:
```bash
# 1. Copy example file
cp admin-dashboard/public/js/firebase-config.example.js admin-dashboard/public/js/firebase-config.js

# 2. Edit with your credentials (this file is gitignored)
nano admin-dashboard/public/js/firebase-config.js

# 3. Verify it won't be committed
git status  # Should NOT show firebase-config.js
```

### For Production:
Consider using environment variables and a build process:
```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

## 📞 Support

Questions about security? Check our documentation or open an issue (for non-sensitive questions only).

---

**Last Updated:** October 17, 2025
