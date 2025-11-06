# Cómo Obtener Nuevo Token de Meta WhatsApp

**Problema:** Token expirado (aunque la cuenta esté verificada)
**Solución:** Generar nuevo token permanente

---

## Paso 1: Ve a Meta Developers

Abre: https://developers.facebook.com/apps/

## Paso 2: Selecciona Tu App

Busca la app que tiene WhatsApp configurado

## Paso 3: Ve a WhatsApp → API Setup

En el menú lateral:
1. Click en "WhatsApp"
2. Click en "API Setup"

## Paso 4: Genera Nuevo Token

Verás una sección "Temporary access token" o "Access token"

**Opción A: Token Temporal (24 horas)**
- Click en "Generate Token"
- Copia el token (comienza con EAA...)

**Opción B: Token Permanente (Recomendado)**
1. Ve a: WhatsApp → Configuration → System Users
2. O click en "Generate permanent token"
3. Selecciona permisos: `whatsapp_business_messaging`, `whatsapp_business_management`
4. Copia el token

## Paso 5: Verifica Phone Number ID

En la misma pantalla, deberías ver:
- **Phone Number ID:** 805718575964429
- **Phone Number:** +1... o +58... (tu número de negocio)

**Anota el número completo aquí:** ________________

## Paso 6: Prueba el Token

Reemplaza `YOUR_NEW_TOKEN` con el token que acabas de copiar:

```bash
curl -X POST https://graph.facebook.com/v21.0/805718575964429/messages \
  -H "Authorization: Bearer YOUR_NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "584241476748",
    "type": "text",
    "text": {"body": "Prueba de Ana - Full Queso. ¿Recibiste este mensaje?"}
  }'
```

**Si funciona:** Recibirás el mensaje en +58 424-1476748 ✅

## Paso 7: Guarda el Token en Firebase

```bash
# Copia el token
echo "PEGA_TU_TOKEN_AQUI" | firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
```

---

## Troubleshooting

### "Error 190: Access token has expired"
- El token expiró
- Genera uno nuevo siguiendo los pasos arriba

### "Error 100: Invalid parameter"
- Verifica que el Phone Number ID sea correcto (805718575964429)
- Verifica que el número de destino esté en formato internacional

### "Error 131047: Message throttled"
- WhatsApp está limitando mensajes
- Espera unos minutos
- Verifica que tu cuenta no esté en sandbox mode con límites

### "Cannot find phone number"
- Ve a https://business.facebook.com/wa/manage/phone-numbers/
- Verifica que el número esté activo y verificado

---

## Siguiente Paso

Una vez que tengas el nuevo token, actualiza el código para usar Meta API.
