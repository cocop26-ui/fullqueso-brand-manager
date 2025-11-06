# 🔄 Comunicación Two-Way - Ana WhatsApp Bot

## 📋 Descripción

Ana maneja inteligentemente dos tipos de conversaciones:

1. **Seguimiento Post-Venta** (automático después de entregas)
2. **Consultas Generales** (cliente inicia conversación)

## 🎯 Detección Automática de Contexto

### Escenario 1: Seguimiento Post-Venta Activo

**Condiciones:**
- Cliente tiene pedido reciente con `seguimiento_enviado = true`
- Encuesta post-venta NO completada
- Menos de 3 intercambios de mensajes

**Comportamiento:**
- Ana sigue el flujo de 3 mensajes
- Pregunta sobre PRODUCTO → DELIVERY → EMAIL
- Captura feedback y sentiment analysis
- Menciona fullqueso.com al despedirse

**Ejemplo:**
```
Ana: "Hola Pedro, soy Ana de Full Queso. ¿Cómo te fue con tu pedido
      de churros? ¿Llegó todo bien?"

Cliente: "Sí, muy ricos"

Ana: "¡Ay qué fino! Dime, ¿los churros estaban calientitos?
      ¿El choco arequipe estaba en su punto?"

Cliente: "Sí, perfectos"

Ana: "Chévere, me alegra. Y el delivery, ¿todo bien?
      ¿Llegó rápido? ¿El empaque venía bien?"

Cliente: "Sí, todo perfecto"

Ana: "Perfecto, gracias por tu feedback. ¿Me das tu correo para promociones?
      Recuerda que estamos a tu orden en fullqueso.com. Un abrazo"
```

### Escenario 2: Cliente Quiere Hacer Pedido

**Condiciones:**
- Cliente inicia conversación sin seguimiento activo
- Mensaje contiene palabras clave: "pedido", "quiero", "necesito", "ordenar"

**Comportamiento:**
- Redirige a fullqueso.com
- Menciona WhatsApp de atención para ayuda
- NO inicia conversación extendida

**Ejemplo:**
```
Cliente: "Hola, quiero hacer un pedido"

Ana: "Hola Pedro, ¡con gusto! Para hacer tu pedido entra a fullqueso.com,
      es súper fácil. Para cualquier ayuda escríbenos al +584241476748.
      ¡Saludos!"
```

### Escenario 3: Cliente Tiene Reclamo o Consulta

**Condiciones:**
- Cliente menciona: "reclamo", "problema", "ayuda", "consulta"
- O cualquier mensaje fuera del contexto post-venta

**Comportamiento:**
- Redirige a canales de atención: +584241476748 o atencionalcliente@fullqueso.com
- Tono empático y profesional
- NO maneja el reclamo directamente

**Ejemplo:**
```
Cliente: "Tengo un problema con mi pedido"

Ana: "Hola Pedro, entiendo. Para atenderte mejor, escríbenos al
      +584241476748 o a atencionalcliente@fullqueso.com.
      Te ayudaremos enseguida. Un abrazo"
```

### Escenario 4: Cliente Solo Saluda

**Condiciones:**
- Mensaje simple: "hola", "buenas", "buenos días"
- Sin contexto post-venta activo

**Comportamiento:**
- Saludo cordial
- Informa sobre fullqueso.com para pedidos
- Informa sobre canales de atención
- Cierra conversación

**Ejemplo:**
```
Cliente: "Hola"

Ana: "Hola Pedro, ¿cómo estás? Para pedidos visita fullqueso.com.
      Para consultas escríbenos al +584241476748 o
      atencionalcliente@fullqueso.com. ¡Estamos a tu orden!"
```

### Escenario 5: Encuesta Ya Completada

**Condiciones:**
- Cliente escribe después de completar la encuesta post-venta
- Ya capturó feedback y email

**Comportamiento:**
- Agradece por escribir
- Redirige según necesidad del cliente
- Mantiene conversación breve

**Ejemplo:**
```
Cliente: "Gracias por todo"

Ana: "Para servirte, Pedro. Para nuevos pedidos visita fullqueso.com.
      Para consultas escríbenos al +584241476748. ¡Saludos!"
```

## 🔍 Lógica de Detección

```javascript
// Variables de contexto
const esConversacionPostventa = pedidoReciente?.seguimiento_enviado === true
const encuestaCompletada = // existe encuesta con encuesta_completada = true
const numInteracciones = // cantidad de mensajes en conversaciones_bot

// Palabras clave para detectar intención
const palabrasNuevoPedido = ["pedido", "quiero", "necesito", "ordenar"]
const palabrasReclamo = ["reclamo", "problema", "ayuda", "consulta"]
const palabrasSaludo = ["hola", "buenas", "buenos dias", "buenas tardes"]

// Decisión de flujo
if (esConversacionPostventa && !encuestaCompletada && numInteracciones < 3) {
  // FLUJO POST-VENTA: Continuar con preguntas sobre producto/delivery
} else if (mensaje.includes(palabrasNuevoPedido)) {
  // REDIRECCIÓN: fullqueso.com
} else if (mensaje.includes(palabrasReclamo)) {
  // REDIRECCIÓN: +584241476748 / atencionalcliente@fullqueso.com
} else {
  // MENSAJE GENÉRICO: Saludo + fullqueso.com + contactos
}
```

## 📊 Canales de Redirección

### fullqueso.com
**Usar para:**
- Nuevos pedidos
- Consultar menú
- Ver promociones
- Hacer órdenes online

### WhatsApp +584241476748
**Usar para:**
- Atención personalizada
- Consultas sobre pedidos existentes
- Reclamos
- Modificaciones de pedido
- Ayuda con el sitio web

### atencionalcliente@fullqueso.com
**Usar para:**
- Reclamos formales
- Sugerencias
- Consultas por escrito
- Seguimiento de casos

## 🎭 Tono y Estilo

### En Seguimiento Post-Venta
- Cálida y expresiva
- Usa modismos venezolanos
- Celebra feedback positivo
- Empática con problemas
- Insiste en capturar email

### En Redirecciones
- Amable pero directa
- Proporciona información clara
- Menciona SIEMPRE fullqueso.com
- Menciona canales de contacto
- Cierra conversación sin extenderse

## ⚠️ Límites y Reglas

### Ana NO maneja:
- ❌ Tomar pedidos por WhatsApp
- ❌ Procesar pagos
- ❌ Resolver reclamos
- ❌ Modificar pedidos existentes
- ❌ Consultas sobre clima, política, etc.

### Ana SÍ maneja:
- ✅ Seguimiento post-venta (feedback)
- ✅ Captura de emails para marketing
- ✅ Redireccionamiento inteligente
- ✅ Información sobre canales correctos

## 📈 Métricas

El sistema guarda en Firestore:

**conversaciones_bot:**
- Historial completo de mensajes
- Contexto (post-venta o general)
- Timestamp de cada intercambio

**encuestas_postventa:**
- Feedback capturado
- Sentiment analysis
- Email del cliente
- Estado de completitud

## 🧪 Pruebas

### Probar Seguimiento Post-Venta
```bash
# 1. Crear orden en ENTREGADO
cd functions
GCLOUD_PROJECT=fullqueso-bot node create-order-churros.js

# 2. Esperar 1 minuto (Ana enviará template)
# 3. Responder al mensaje
# 4. Verificar flujo de 3 mensajes
```

### Probar Nuevo Pedido
```bash
# Enviar mensaje al WhatsApp bot: "Hola, quiero hacer un pedido"
# Verificar que Ana redirige a fullqueso.com
```

### Probar Reclamo
```bash
# Enviar mensaje: "Tengo un problema con mi pedido"
# Verificar que Ana redirige a +584241476748
```

## 🔧 Configuración

Las redirecciones están configuradas en `functions/index.js`:

```javascript
// Línea ~440: Redirección para pedidos
"Para hacer tu pedido entra a fullqueso.com, es súper fácil.
 Para cualquier ayuda escríbenos al +584241476748"

// Línea ~442: Redirección para reclamos
"Para atenderte mejor, escríbenos al +584241476748 o a
 atencionalcliente@fullqueso.com"
```

Para cambiar números o URLs, editar estas líneas y hacer deploy:
```bash
firebase deploy --only functions:whatsappWebhook
```

## 📞 Contactos del Sistema

- **WhatsApp Bot (Ana):** +15558855791
- **WhatsApp Atención:** +584241476748
- **Email Atención:** atencionalcliente@fullqueso.com
- **Sitio Web:** fullqueso.com

---

**Última actualización:** 2025-11-06
**Proyecto:** fullqueso-bot
**Región:** us-central1
