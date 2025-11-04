# n8n Anajensy Bot - Complete Setup Guide

## Current Status
Your n8n workflow is already created but needs credentials configured.

**Workflow URL:** https://fullqueso.app.n8n.cloud/workflow/NchS8Zb8CYhAboT3

---

## Problem: WhatsApp Access Token is Expired

The token in your workflow (line 201) is expired. That's why you're getting 401 errors.

**The token currently in the workflow:**
```
EAASJkmRMNrMBPlFCq5TAZBzbeEZAK8CUXLMWY2wQcb2eNXUkQ7QkzmMmuS2voTmV60ZCOo5ZAZBTlS20vfG2acMOipjF0MD1shxuG4bRztt0a5A6poMPZCQiOTUgcY49lgmqgoldnsbPHOLldb41ZA7ouXdEsc4DXijb4P5JDuKOS7xprcpuqHUvYk5vF398luvEmqZAkZBWZCUAb2ZBIbqFTqFjheZBP0Y9ixMyQqV3XQYG8pFVZCgZDZD
```

---

## Solution Options

### Option 1: Get New WhatsApp Token (Simplest if you have access)

If you have access to the original WhatsApp Business account:

1. Find where Phone Number ID `805718575964429` was created
2. Get a fresh access token from that account
3. Update the token in the n8n workflow (see steps below)

### Option 2: Set Up New WhatsApp Business (If you don't have access to the original)

This requires completing the Meta app setup we started, which is complex.

---

## How to Update the Token in n8n (Once you have a fresh token)

1. **Open the workflow:**
   https://fullqueso.app.n8n.cloud/workflow/NchS8Zb8CYhAboT3

2. **Click on the "Send WhatsApp Message" node**

3. **Scroll down to "Header Parameters"**

4. **Find the "Authorization" header**

5. **Replace the value** with:
   ```
   Bearer YOUR_NEW_TOKEN_HERE
   ```
   (Keep the word "Bearer" and add a space, then your new token)

6. **Click "Save"** at the top right

---

## Alternative: Use the Firebase Cloud Function Instead

Your Firebase Cloud Function (`procesarSeguimientos`) is already deployed and working!

The only issue is the same - it also needs a fresh WhatsApp token.

To update the Firebase function token:

```bash
firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
```

Then paste the new token when prompted.

---

## Where to Get a Fresh WhatsApp Token

The token must come from wherever Phone Number ID `805718575964429` was originally set up.

**Possible locations:**
1. https://business.facebook.com/wa/manage/phone-numbers/
2. https://developers.facebook.com/apps/ (if you have an app with WhatsApp)
3. A third-party WhatsApp Business API provider

**Do you know where this phone number was originally configured?**

---

## Summary

**You have 2 working systems, both just need a fresh WhatsApp token:**

1. ✅ **Firebase Cloud Function** - Already deployed, uses secrets
2. ✅ **n8n Workflow** - Already created, token is hardcoded

**Both are failing with 401 errors** because the WhatsApp access token expired.

**Next step:** Find where Phone Number ID `805718575964429` was created and get a new access token.

