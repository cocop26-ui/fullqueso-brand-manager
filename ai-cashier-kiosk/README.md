# Full Queso AI Cashier - Setup Guide 🎤

## ⚠️ IMPORTANT: Microphone Permission Setup

The AI Cashier needs **permanent microphone access** to work smoothly without interruptions.

### 🔧 One-Time Setup (Chrome/Edge) - RECOMMENDED

1. **Open the file** in Chrome or Edge browser
2. When you see "wants to use your microphone":
   - Click **"Allow"** (NOT "Allow this time")
3. **Alternative method:**
   - Click the **🔒 lock icon** (left of address bar)
   - Find **Microphone** → Select **"Allow"**
   - Reload the page

✅ **Done!** Chrome will remember this forever for this location.

### 🍎 Safari Setup (macOS/iOS)

**Desktop (macOS):**
1. Safari → **Settings** (⌘,)
2. Go to **Websites** tab → **Microphone**
3. Find your site → Set to **"Allow"**

**iPad/iPhone:**
1. Settings → **Safari** → **Microphone**
2. Set to **"Allow"**

### 🔥 Firefox Setup

1. Click **🔒 icon** in address bar
2. **Permissions** → **Microphone** → **Allow**
3. Check **"Remember this decision"**

---

## 🚀 Running the AI Cashier

### Option 1: Simple Server (Python)
```bash
cd ai-cashier-kiosk
python3 -m http.server 8080
```
Then open: **http://localhost:8080/full-queso-simple.html**

### Option 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `full-queso-simple.html`
3. Select **"Open with Live Server"**

### Option 3: Direct Open
Simply open `full-queso-simple.html` in Chrome

---

## 🎯 Features

### Voice-Activated Ordering System
- ✅ **Continuous listening** - Always on, no button clicking needed
- ✅ **Natural conversation** - Anajensy speaks with real Spanish voice
- ✅ **Customer database** - Remembers returning customers
- ✅ **Smart recognition** - Filters background noise

### Customer Data Collection
1. **Name** - "¿Cómo te llamas?"
2. **ID Number** - "¿Tu número de identificación?"
3. **Phone** - "¿Tu número de celular?"
4. **Preferences** - Tracks favorite items
5. **Feedback** - Collects customer reviews

### Conversation Flow
```
Anajensy: ¡Hola! Soy Anajensy. ¿Cómo te llamas?
Customer: Pedro
Anajensy: Mucho gusto Pedro. ¿Tu número de identificación?
Customer: 123456789
Anajensy: ¿Tu número de celular?
Customer: 3001234567
Anajensy: ¡Bienvenido! ¿Qué te gustaría ordenar?
Customer: Tequeños de seis
Anajensy: Agregado: Tequeños x6. ¿Algo más?
```

---

## 🗂️ Customer Database

Data stored in **browser localStorage**:

```javascript
{
  "3001234567": {
    "name": "Pedro",
    "idNumber": "123456789",
    "phone": "3001234567",
    "visitCount": 5,
    "lastVisit": "2025-01-22...",
    "favoriteItems": {
      "Tequeños Bites x6": 12,
      "Churros con Chocolate": 8
    },
    "feedback": [
      { "date": "...", "comment": "Todo delicioso" }
    ]
  }
}
```

### View Customer Data
Open browser console and type:
```javascript
JSON.parse(localStorage.getItem('fullQuesoCustomers'))
```

---

## 🎨 Menu Products

| Category | Items | Price |
|----------|-------|-------|
| **Tequeños** | Bites x6, x12, Party Box | $8,5 - $35 |
| **Churros** | Clásicos, con Cajeta, con Chocolate | $6 - $11 |
| **Helados** | Sundae Chocolate/Vainilla/Fresa | $5,5 - $6,5 |
| **Queso** | Blanco Prensado 250g/500g | $9 - $17 |
| **Combos** | Familiar, Postre | $1,2 - $2,8 |
| **Bebidas** | Agua, Refresco, Jugo | $2 - $4,5 |

---

## 🐛 Troubleshooting

### "Permission denied" error
- **Check:** Browser blocked microphone
- **Fix:** Click 🔒 icon → Allow microphone

### Voice not recognized
- **Check:** Speak clearly in Spanish
- **Check:** Microphone is working (check browser settings)
- **Check:** Console logs show "Escuchado: ..."

### Voice sounds robotic
- **Chrome/Edge:** Best quality (Google voices)
- **Safari:** Natural macOS/iOS voices
- **Adjust:** Change `rate`, `pitch` in code (lines 800-802)

### No audio output
- **Check:** System volume is up
- **Check:** Browser can play audio
- **Test:** Open console, type `speechSynthesis.speak(new SpeechSynthesisUtterance('test'))`

---

## 📱 Recommended Setup

**For Kiosk/Tablet:**
1. Use **Chrome** (best voice quality)
2. Set to **fullscreen** (F11)
3. Set microphone to **Always Allow**
4. Disable browser auto-updates during business hours
5. Use **http://localhost** or **https://** URL

**Voice Quality:**
- Chrome/Edge: ⭐⭐⭐⭐⭐ (Google Spanish voices)
- Safari macOS: ⭐⭐⭐⭐ (Mónica, Paulina)
- Safari iOS: ⭐⭐⭐⭐ (Native voices)
- Firefox: ⭐⭐⭐ (Depends on OS)

---

## 📞 Support

**Customer Database Location:**
- Browser: `localStorage.fullQuesoCustomers`
- Export: Copy from console to backup

**Voice Commands:**
- Order items: Say product name
- Remove: "quitar [producto]"
- Finish: "es todo" or "listo"
- Cancel: "borrar todo"

---

## 🔐 Privacy & Security

- ✅ All data stored **locally** in browser
- ✅ No external servers
- ✅ Microphone only active on this page
- ✅ Customer data stays on device
- ⚠️ Clear browser data = lose customer records

---

## 🎁 Next Steps

After setup:
1. ✅ Test with sample order
2. ✅ Verify customer data saving
3. ✅ Test returning customer recognition
4. ✅ Adjust voice settings if needed
5. ✅ Train staff on system

**Ready to serve customers! 🧀🎉**
