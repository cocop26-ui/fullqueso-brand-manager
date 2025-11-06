# Guía de Aprobación del Template de WhatsApp

**Fecha:** 2025-11-05
**Estado:** ⏳ Pendiente de Aprobación por WhatsApp
**Template SID:** HXe5c7c0209e71adae340611361d1ecad3

---

## Resumen

Se creó exitosamente el WhatsApp Template para que Ana pueda iniciar conversaciones con clientes.

**Template creado:**
> Hola {{1}}, soy Ana de Full Queso. ¿Cómo estás? Te escribo para saber cómo te fue con tu pedido. ¿Llegó todo bien? Responde para ayudarte. Un abrazo.

**Variables:**
- `{{1}}` = Nombre del cliente (ej: Pedro)

---

## Estado Actual

✅ **Template creado en Twilio:** HXe5c7c0209e71adae340611361d1ecad3
⏳ **Esperando aprobación de WhatsApp:** 1-2 días hábiles
❌ **Mensajes actuales fallando:** Error 63112 (template no aprobado)

---

## ¿Por Qué Se Necesita Aprobación?

WhatsApp requiere que todos los templates sean **pre-aprobados** para:
1. Prevenir spam
2. Proteger usuarios
3. Asegurar calidad de mensajes comerciales
4. Cumplir con políticas de WhatsApp Business

---

## Proceso de Aprobación

### 1. Verificar Estado del Template

**Opción A: Twilio Console**
```
https://console.twilio.com/us1/develop/sms/content-editor
```

Busca: `fullqueso_seguimiento_pedido`

**Estados posibles:**
- 🟡 **Pending:** En revisión
- ✅ **Approved:** Listo para usar
- ❌ **Rejected:** Rechazado (necesita modificación)

---

### 2. Tiempo de Aprobación

**Típico:** 1-2 días hábiles
**Urgente:** En casos excepcionales, puede tardar hasta 5 días

**Factores que afectan:**
- Día de la semana (más lento en fines de semana)
- Carga de trabajo de WhatsApp
- Primera vez vs. cuenta establecida

---

### 3. Qué Hacer Mientras Esperas

#### Opción A: Solicitar al Cliente que Escriba Primero ⭐ RECOMENDADO

**Flujo:**
1. Cliente hace pedido en tu sistema
2. Sistema envía SMS o notificación: "¡Hola! Ana de Full Queso te escribirá por WhatsApp. Escríbele 'Hola' a +1 555 885 5791"
3. Cliente envía "Hola" a Ana
4. Ana responde con Claude AI (mensaje personalizado)
5. Conversación fluye naturalmente

**Ventajas:**
- ✅ Funciona inmediatamente
- ✅ No requiere aprobación
- ✅ Cliente opta-in activamente
- ✅ Cumple 100% con políticas de WhatsApp

**Script de prueba:**
```bash
# En tu teléfono, envía "Hola" a: +1 555 885 5791
# Luego crea orden:
cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-churros.js
```

---

#### Opción B: Usar Sistema de Simulación (Solo para Testing)

```bash
# Simula que el cliente escribió primero
node simulate-customer-first-message.js

# Crea orden (Ana responderá con Claude)
cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-churros.js
```

---

## Una Vez Aprobado el Template

### 1. El Código YA Está Listo

El archivo `functions/index.js` ya está configurado para usar el template:

```javascript
ContentSid: "HXe5c7c0209e71adae340611361d1ecad3",
ContentVariables: JSON.stringify({
  "1": clienteNombre  // Pedro, Maria, etc.
})
```

### 2. Flujo Automático

```
1. Se crea orden VERIFICADO en Firebase
   ↓
2. procesarSeguimientos encuentra la orden (cada minuto)
   ↓
3. Ana envía template aprobado:
   "Hola Pedro, soy Ana de Full Queso. ¿Cómo estás?..."
   ↓
4. Cliente responde
   ↓
5. whatsappWebhook recibe respuesta
   ↓
6. Claude AI genera respuesta personalizada (30-40 palabras)
   ↓
7. Ana pregunta sobre producto, delivery, pide email
   ↓
8. Se guarda todo en Firestore (encuestas_postventa)
```

### 3. No Requiere Cambios

✅ El código ya está desplegado
✅ Solo esperar aprobación de WhatsApp
✅ Una vez aprobado, funciona automáticamente

---

## Errores y Soluciones

### Error 63112: Template No Aprobado

**Mensaje:**
```
Status: failed
Error Code: 63112
```

**Solución:**
1. Esperar aprobación (1-2 días)
2. Mientras tanto, usar flujo de "cliente escribe primero"

---

### Error 63016: Cliente No Opt-In

**Mensaje:**
```
Error Code: 63016
Message: Customer has not opted-in to WhatsApp
```

**Solución:**
Cliente debe enviar mensaje primero a tu número de WhatsApp Business.

---

### Error 21408: Permission to Send

**Mensaje:**
```
Error: Permission to send an SMS or MMS has not been enabled
```

**Solución:**
Verificar que tu número de Twilio esté habilitado para WhatsApp Business.

---

## Verificar Aprobación del Template

### Script de Verificación

```bash
# Exportar credenciales
export TWILIO_ACCOUNT_SID=$(firebase functions:secrets:access TWILIO_ACCOUNT_SID)
export TWILIO_AUTH_TOKEN=$(firebase functions:secrets:access TWILIO_AUTH_TOKEN)

# Verificar template
curl -X GET "https://content.twilio.com/v1/Content/HXe5c7c0209e71adae340611361d1ecad3" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" | python3 -m json.tool
```

**Busca:**
```json
{
  "sid": "HXe5c7c0209e71adae340611361d1ecad3",
  "approval_requests": {
    "whatsapp": {
      "status": "approved"  ← ¡Esto debe decir "approved"!
    }
  }
}
```

---

## Recomendación Inmediata

### Para Testing Ahora Mismo:

**Envía desde tu WhatsApp personal:**
1. Abre WhatsApp
2. Nuevo chat con: **+1 555 885 5791**
3. Envía: "Hola"
4. Ana te responderá (webhook con Claude AI)

**Luego crea orden:**
```bash
cd functions && GCLOUD_PROJECT=fullqueso-bot node create-order-churros.js
```

**En 1 minuto:**
- Ana te enviará mensaje personalizado
- Preguntará sobre churros y delivery
- Pedirá tu email
- Todo guardado en Firestore

---

### Para Producción (Una Vez Aprobado):

1. ✅ Template aprobado por WhatsApp
2. ✅ Código ya desplegado
3. ✅ Crear orden → Ana escribe automáticamente
4. ✅ No requiere que cliente escriba primero

---

## Monitoreo

### Ver Estado de Mensajes

```bash
node check-message-status.js <MESSAGE_SID>
```

### Ver Logs de Firebase

```bash
# Ver mensajes enviados
firebase functions:log --only procesarSeguimientos | grep "Template"

# Ver respuestas de clientes
firebase functions:log --only whatsappWebhook | grep "Generated response"
```

---

## Documentación Relacionada

- [Twilio WhatsApp Templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [TWILIO_WHATSAPP_SESSION_REQUIREMENTS.md](TWILIO_WHATSAPP_SESSION_REQUIREMENTS.md)

---

## Próximos Pasos

### Hoy (Mientras Esperas Aprobación):

1. ✅ **Prueba con tu teléfono:**
   - Envía "Hola" a +1 555 885 5791
   - Crea orden de prueba
   - Responde a Ana
   - Verifica base de datos

2. ✅ **Documenta flujo:**
   - Anota tiempo de respuesta
   - Verifica sentimiento analysis
   - Confirma email capture

### Mañana/Pasado Mañana:

1. ⏳ **Verificar aprobación:**
   - Revisar Twilio Console
   - Verificar estado del template

2. ✅ **Una vez aprobado:**
   - Crear orden de prueba
   - Verificar que Ana inicie conversación
   - Confirmar funcionamiento end-to-end

---

**Estado Final:** ⏳ Esperando aprobación de WhatsApp (1-2 días)
**Solución Temporal:** Cliente escribe "Hola" primero
**Código:** ✅ Listo y desplegado
