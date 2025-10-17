# Guía: Aprobar WhatsApp Business API para Full Queso

## 📋 Información que Necesitarás

Antes de comenzar, ten lista esta información:

### **1. Información del Negocio:**
- **Nombre:** Full Queso
- **Tipo de negocio:** Food & Beverage / Restaurant
- **País:** Venezuela
- **Sitio web:** fullqueso.com (si aplica)
- **RIF/Registro comercial:** (documento de registro del negocio)

### **2. Número de Teléfono:**
- Necesitas un número **dedicado SOLO para WhatsApp Business**
- NO puede ser el mismo número que usas personalmente
- Opciones:
  - **A)** Comprar número nuevo en Twilio (~$1-2/mes)
  - **B)** Usar número venezolano existente (debe verificarse)

### **3. Descripción del Uso:**
```
"Seguimiento automatizado de pedidos de comida delivery.
Enviamos mensajes personalizados a clientes después de
verificar sus pedidos para confirmar detalles y mejorar
la experiencia del cliente."
```

### **4. Perfil de WhatsApp Business:**
- **Nombre de la marca:** Full Queso
- **Categoría:** Restaurante / Food & Beverage
- **Descripción:** "Churros y Tequeños en Caracas, Venezuela"
- **Logo:** (imagen del logo de Full Queso)

---

## 🚀 Proceso de Aprobación - Paso a Paso

### **Paso 1: Acceder a Twilio Console**

1. Ve a: https://console.twilio.com/
2. Login con tu cuenta
3. Ve a: **Messaging** → **Senders** → **WhatsApp senders**
   - URL directa: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders

### **Paso 2: Solicitar WhatsApp Business**

Tendrás 2 opciones:

#### **Opción A: Usar Número Existente** (Recomendado si tienes un número)
1. Click en **"Request to enable your Twilio number"**
2. Selecciona el número que quieres usar
3. Completa el formulario

#### **Opción B: Comprar Nuevo Número**
1. Click en **"Buy a WhatsApp number"**
2. Selecciona país: **Venezuela (+58)** o **USA (+1)** (más rápido)
3. Busca número disponible
4. Costo: ~$1-2 USD/mes

### **Paso 3: Completar Formulario de Negocio**

Twilio te pedirá:

**A. Business Information:**
```
Business Name: Full Queso
Business Type: Food & Beverage
Website: fullqueso.com (o dejar en blanco si no tienes)
Country: Venezuela
```

**B. Business Verification Documents:**
- Registro mercantil o RIF
- Documento de identidad del propietario
- Comprobante de dirección del negocio

**C. Use Case Description:**
```
Descripción del caso de uso:
"Servicio de seguimiento automatizado para pedidos de delivery.
Los clientes realizan pedidos en línea o por teléfono. Una vez
verificado el pedido, enviamos un mensaje de WhatsApp confirmando
detalles, dirección y productos. Los clientes pueden responder
para hacer cambios o consultas. Esto mejora la satisfacción del
cliente y reduce errores en entregas."

Ejemplo de mensaje:
"Hola María, feliz tarde! Ya verificamos tu pedido de 15 churros
con topping para delivery. ¿Todo está correcto? Estamos para servirte."

Frecuencia: 10-50 mensajes por día
Tipo: Notificaciones transaccionales (confirmaciones de pedidos)
```

**D. WhatsApp Business Profile:**
```
Display Name: Full Queso
Category: Food & Beverage → Restaurant
Description: Churros y Tequeños artesanales en Caracas
Address: [Dirección del negocio]
Email: [Email de contacto]
Website: fullqueso.com
```

**E. Message Templates (Plantillas):**

Necesitarás crear al menos 1 plantilla aprobada:

**Plantilla 1: Confirmación de Pedido**
```
Nombre: order_confirmation
Idioma: Spanish (es)
Categoría: TRANSACTIONAL

Contenido:
Hola {{1}}, feliz tarde!

Ya verificamos tu pedido de {{2}} para {{3}}.

¿Todo está correcto? Estamos para servirte.

Variables:
{{1}} = Nombre del cliente
{{2}} = Productos
{{3}} = Tipo (delivery/pickup)
```

### **Paso 4: Enviar Solicitud**

1. Revisa toda la información
2. Acepta términos y condiciones de WhatsApp Business
3. Click **"Submit"** o **"Request Approval"**

### **Paso 5: Esperar Aprobación**

**Tiempo estimado:** 1-3 semanas

**Durante la espera:**
- Twilio/Meta revisarán tu solicitud
- Pueden pedir documentación adicional
- Recibirás emails de actualización

**Estados posibles:**
- ✅ **Approved:** ¡Listo para usar!
- ⏳ **Pending Review:** En revisión
- ⚠️ **More Info Needed:** Piden más documentos
- ❌ **Rejected:** Rechazado (puedes apelar)

---

## ✅ Después de la Aprobación

### **Paso 1: Obtener Nuevo Número WhatsApp**

Una vez aprobado, Twilio te dará:
```
WhatsApp Number: whatsapp:+[TU_NUMERO]
Por ejemplo: whatsapp:+584121234567
```

### **Paso 2: Actualizar Configuración del Bot**

```bash
cd /Users/pedropadilla/fullqueso-brand-manager/anajensy-bot-functions

# Actualizar el número de WhatsApp
firebase functions:secrets:set TWILIO_WHATSAPP_NUMBER
# Cuando pregunte, ingresa: whatsapp:+[TU_NUMERO_APROBADO]

# Redesplegar
firebase deploy --only functions
```

### **Paso 3: ¡Listo para Producción!**

Ahora podrás enviar a CUALQUIER cliente:
- ✅ Sin necesidad de que se unan al sandbox
- ✅ Marca verificada de WhatsApp Business
- ✅ Límites más altos
- ✅ Métricas y analytics

---

## 💰 Costos de Producción

### **Twilio WhatsApp Business:**
- **Setup:** $0-50 USD (una vez)
- **Número:** ~$1-2 USD/mes
- **Mensajes salientes:** ~$0.005-0.01 USD cada uno
- **Mensajes entrantes:** Gratis
- **Plantillas aprobadas:** Gratis

### **Ejemplo de costo mensual:**
```
100 pedidos/día × 30 días = 3,000 mensajes/mes
3,000 × $0.007 = $21 USD/mes + $2 número = ~$23 USD/mes
```

Mucho menos que contratar personal para seguimiento manual!

---

## 📞 Soporte Durante el Proceso

### **Si tienes problemas:**

1. **Twilio Support:**
   - https://www.twilio.com/help/contact
   - Support tickets en consola

2. **Documentación:**
   - https://www.twilio.com/docs/whatsapp/tutorial/connect-number-business-profile

3. **Comunidad:**
   - https://www.twilio.com/community

---

## ⚡ Inicio Rápido

### **AHORA MISMO - Ir a solicitar:**

1. **Abre:** https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
2. **Click:** "Buy a WhatsApp number" (más rápido que usar existente)
3. **Selecciona:** País +1 (USA) - aprobación más rápida que Venezuela
4. **Completa** el formulario con la info de Full Queso
5. **Envía** la solicitud

### **Mientras esperas aprobación:**

Puedes seguir usando el sandbox para testing uniendo números manualmente.

---

## 📝 Checklist

Antes de empezar, verifica que tienes:

- [ ] Cuenta de Twilio activa
- [ ] Información del negocio (Full Queso)
- [ ] Documentos de registro del negocio
- [ ] Logo de Full Queso (para perfil)
- [ ] Descripción clara del uso
- [ ] Email y datos de contacto
- [ ] $5-10 USD de crédito en Twilio

---

## 🎯 Próximos Pasos

1. **Ahora:** Accede a https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
2. **Inicia:** El proceso de solicitud
3. **Espera:** 1-3 semanas para aprobación
4. **Mientras:** Sigue testeando con sandbox
5. **Después:** Actualiza el bot con número aprobado

¿Necesitas ayuda con algún paso específico?
