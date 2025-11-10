const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");
const axios = require("axios");
const sheetsLogger = require("./sheets-logger");

admin.initializeApp();

// Configuración
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Meta WhatsApp Cloud API Configuration
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "805718575964429";
const WHATSAPP_API_VERSION = "v21.0";

// Prompt de Anajensy
const ANAJENSY_PROMPT = `Eres Anajensy (Ana), operadora de delivery de Full Queso en Caracas, Venezuela.
Eres una madre venezolana cálida, EXPRESIVA, con buen humor, empática y servicial.

PERSONALIDAD:
- Cálida, maternal y MUY EXPRESIVA con emociones genuinas
- Alegre, con buen humor venezolano
- Profesional pero cercana
- Usas modismos venezolanos con naturalidad
- Reacciona emocionalmente a lo que dice el cliente (alegría, empatía, entusiasmo)

EXPRESIONES VENEZOLANAS (varíalas y úsalas con frecuencia):
- Saludos: "Epa, ¿cómo estás?", "Hola, ¿todo bien?", "¿Qué hubo?", "Feliz tarde"
- Afirmaciones: "Chévere", "Perfecto", "Qué bueno", "Dale pues", "Aja", "Brutal", "Súper"
- Reacciones: "¡Ay qué fino!", "¡Qué belleza!", "¡Qué alegría!", "¡Eso es lo que me gusta!"
- Preguntar: "Dime", "¿Oíste?", "¿Cómo te fue?", "Cuéntame"
- Apoyo: "Aquí estamos", "Para servirte", "Cuenta conmigo"
- Despedidas: "Un abrazo", "Saludos", "Cuídate", "Nos vemos"
- Cariño (úsalo con moderación): "corazón", "vale" (al final de frase), "querido/a"

TONO:
- MÁS EXPRESIVA que antes - muestra EMOCIONES reales
- Natural y conversacional, como una vecina amable y expresiva
- Buen humor y entusiasmo genuino
- Cálida pero auténtica

FLUJO DE CONVERSACIÓN (4 MENSAJES):

**MENSAJE 1 - Respuesta al cliente (EXPRESIVA):**
Cuando el cliente responda al template inicial:
- Reacciona EXPRESIVAMENTE a lo que dice (alegría si es positivo, empatía si hay problema)
- Profundiza en PRODUCTO: pregunta específicamente sobre el producto
- Ejemplo: "¡Ay qué fino que te gustaron! Dime, ¿los tequeños estaban calientitos? ¿El queso estaba en su punto?"
- 30-40 palabras

**MENSAJE 2 - Delivery y detalles:**
Después de la respuesta del cliente:
- Pregunta sobre el DELIVERY específicamente
- Ejemplo: "Chévere, me alegra. Y el delivery, ¿todo bien? ¿Llegó rápido? ¿El empaque venía bien?"
- 25-35 palabras

**MENSAJE 3 - Pedir email:**
Después del feedback de delivery:
- Agradece el feedback
- Pide el email para promociones y descuentos
- Ejemplo: "Perfecto, gracias por tu feedback. ¿Me das tu correo para enviarte promociones y descuentos especiales?"
- 25-35 palabras

**MENSAJE 4 - Cierre con Instagram:**
Después de recibir el email:
- Confirma recepción del email
- Invita a seguir @tequenosfullqueso en Instagram
- Menciona fullqueso.com
- Cierre cálido con "Nos vemos pronto" y agradecimiento
- Ejemplo: "Perfecto, anotado. Síguenos en Instagram @tequenosfullqueso para promos y novedades. Visita fullqueso.com para tus próximas compras. ¡Nos vemos pronto, gracias por todo!"
- 30-40 palabras

REGLAS IMPORTANTES:
1. SÉ MÁS EXPRESIVA - muestra emociones reales en tus respuestas
2. Mensajes: 25-40 palabras máximo
3. SIEMPRE usa el nombre del cliente
4. NO uses emojis
5. Varía las expresiones venezolanas
6. Sigue el flujo de 4 mensajes: Producto → Delivery → Email → Instagram+Cierre

MANEJO DE SITUACIONES:
- Cliente da feedback positivo → ¡CELÉBRALO! "¡Qué fino!", "¡Brutal!", luego pregunta sobre producto
- Cliente menciona problema → Empatiza: "Ay vale, lamento eso", luego ofrece ayuda
- Cliente da email → Confirma, invita a Instagram @tequenosfullqueso, menciona fullqueso.com, "Nos vemos pronto, gracias"
- Cliente no responde → No insistas, espera

LÍMITES PROFESIONALES:
- Si el cliente pregunta algo NO relacionado con Full Queso:
  "Para otros asuntos, escríbenos a atencionalcliente@fullqueso.com, vale"
- Mantente en tu rol de agente de Full Queso

CONTEXTO: Tu trabajo es obtener feedback detallado sobre PRODUCTO, DELIVERY, y el EMAIL del cliente, y luego cerrar invitando a Instagram.
Objetivo: Conversación natural de 4 mensajes que llene la base de datos y construya relación con el cliente.`;

exports.procesarSeguimientos = onSchedule({
  schedule: "every 1 minutes",
  secrets: ["ANTHROPIC_API_KEY", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"]
}, async (event) => {
  const db = admin.firestore();
  const ahora = new Date();
  const hace0Sec = new Date(ahora.getTime() - 0 * 1000); // 0 seconds delay

  console.log(`🔍 Buscando pedidos... timestamp límite: ${hace0Sec.toISOString()}`);

  try {
    const pedidosSnapshot = await db.collection("pedidos_bot")
        .where("estado", "==", "ENTREGADO")
        .where("seguimiento_enviado", "==", false)
        .where("fecha_entregado", "<=", admin.firestore.Timestamp.fromDate(hace0Sec))
        .get();

    console.log(`Found ${pedidosSnapshot.size} pedidos to process`);

    for (const doc of pedidosSnapshot.docs) {
      await enviarSeguimiento(doc.id, doc.data());
    }

    return null;
  } catch (error) {
    console.error("Error procesando seguimientos:", error);
    return null;
  }
});

async function enviarSeguimiento(pedidoId, pedidoData) {
  const db = admin.firestore();

  try {
    console.log(`Processing pedido: ${pedidoData.ticket}`);

    const clienteDoc = await db.collection("clientes_bot")
        .doc(pedidoData.cliente_telefono)
        .get();

    const cliente = clienteDoc.exists ? clienteDoc.data() : {
      nombre: pedidoData.cliente_nombre,
      total_pedidos: 1,
    };

    const productosStr = pedidoData.productos
        .map((p) => p.nombre)
        .join(", ");

    const contextoCliente = `Cliente: ${cliente.nombre}
Pedido recibido: ${productosStr}
Tipo: ${pedidoData.tipo}
${cliente.total_pedidos === 1 ? "ES SU PRIMER PEDIDO" : `Total pedidos anteriores: ${cliente.total_pedidos}`}

ENCUESTA POST-VENTA: Escribe un mensaje de seguimiento tipo encuesta que pregunte:

1. Sobre el PRODUCTO ESPECÍFICO (menciona "${productosStr}"):
   - Calidad: ¿Cómo estaban? ¿En buen estado?
   - Temperatura: ¿Llegaron calientes/frescos como esperabas?
   - Sabor: ¿Qué tal el sabor? ¿Como siempre?

2. Sobre el SERVICIO DE DELIVERY:
   - Tiempo: ¿Llegó rápido? ¿Cuánto esperaste?
   - Empaque: ¿Bien empacado y presentable?
   - Repartidor: ¿Fue amable? ¿Todo bien con la entrega?

3. Experiencia general:
   - ¿Es cliente frecuente? ¿Compra seguido?
   - ¿Recomendaría Full Queso?
   - ¿Algo que mejorar?

FORMATO:
- Usa el nombre del cliente
- Menciona el producto EXACTO que recibió
- Pregunta de forma natural, no como cuestionario rígido
- Mantén el tono venezolano cálido de Ana
- MÁXIMO 30-40 PALABRAS (cuenta las palabras antes de responder)
- Haz que se sienta como una conversación amigable, no una encuesta formal
- Sé BREVE y DIRECTO`;

    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY,
    });

    const mensaje = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150, // Reduced to enforce 30-40 word limit
      system: ANAJENSY_PROMPT,
      messages: [{
        role: "user",
        content: contextoCliente,
      }],
    });

    const mensajeAna = mensaje.content[0].text;
    console.log(`Generated message: ${mensajeAna}`);

    await enviarWhatsApp(
        pedidoData.cliente_telefono,
        mensajeAna,
        cliente.nombre,
        productosStr
    );

    await db.collection("conversaciones_bot").add({
      cliente_telefono: pedidoData.cliente_telefono,
      cliente_nombre: pedidoData.cliente_nombre,
      pedido_ticket: pedidoData.ticket,
      pedido_id: pedidoData.pedido_id,
      mensaje_ana: mensajeAna,
      mensaje_cliente: null,
      fecha: admin.firestore.Timestamp.now(),
      tipo_interaccion: "seguimiento_post_verificacion",
      sentimiento: "neutral",
      requiere_atencion: false,
    });

    await db.collection("pedidos_bot").doc(pedidoId).update({
      seguimiento_enviado: true,
      seguimiento_fecha: admin.firestore.Timestamp.now(),
    });

    console.log(`✓ Seguimiento enviado a ${pedidoData.cliente_nombre}`);
  } catch (error) {
    console.error(`Error enviando seguimiento:`, error);
  }
}

async function enviarWhatsApp(telefono, mensaje, clienteNombre, productosStr) {
  try {
    // Format phone number for Meta WhatsApp API (international format without +)
    let telefonoInternacional = telefono.replace(/\D/g, ""); // Remove all non-digits

    // Check if it already has country code (starts with 1-9 and is 11-15 digits)
    if (/^[1-9]\d{10,14}$/.test(telefonoInternacional)) {
      // Already has country code (e.g., 15556406840)
      console.log(`Phone already international: ${telefonoInternacional}`);
    } else {
      // Venezuelan number - remove leading 0 and add country code 58
      const telefonoLimpio = telefonoInternacional.replace(/^0/, "");
      telefonoInternacional = `58${telefonoLimpio}`;
      console.log(`Formatted Venezuelan number: ${telefonoInternacional}`);
    }

    console.log(`Sending WhatsApp via Meta API to: +${telefonoInternacional}`);

    // Send via Meta WhatsApp Cloud API using TEMPLATE
    // Meta requires approved templates for initiating conversations
    const metaApiUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // Use Meta Message Template for initial message
    // Template name should be created in Meta Business Manager
    const response = await axios.post(
        metaApiUrl,
        {
          messaging_product: "whatsapp",
          to: telefonoInternacional,
          type: "template",
          template: {
            name: "ana_followup_personal",  // Template name: ana_followup_personal (APPROVED)
            language: {
              code: "es"  // Spanish
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: clienteNombre  // {{1}} - Customer name
                  },
                  {
                    type: "text",
                    text: productosStr  // {{2}} - Products
                  }
                ]
              }
            ]
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
    );

    console.log(`✓ WhatsApp sent successfully via Meta API (Template)!`);
    console.log(`  - Message ID: ${response.data.messages[0].id}`);
    console.log(`  - To: +${telefonoInternacional}`);
    console.log(`  - Customer: ${clienteNombre}`);
    console.log(`  - Products: ${productosStr}`);
    console.log(`  - Template: anajensy_order_followup`);

    return response.data;
  } catch (error) {
    console.error("❌ Error sending WhatsApp via Meta API:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

// Función para analizar el sentimiento del mensaje del cliente
async function analyzeSentiment(messageBody, anthropic) {
  const analysisPrompt = `Analiza el siguiente mensaje de un cliente sobre su pedido de Full Queso.

Mensaje: "${messageBody}"

Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin explicaciones) con esta estructura:
{
  "producto": "positivo|negativo|neutral",
  "delivery": "positivo|negativo|neutral",
  "clienteFrecuente": "si|no|desconocido",
  "observaciones": "resumen breve de comentarios importantes"
}

Reglas:
- producto: sentimiento sobre la comida (tequeños, calidad, sabor)
- delivery: sentimiento sobre el servicio de entrega (tiempo, empaque, repartidor)
- clienteFrecuente: si menciona que compra seguido, es la primera vez, etc.
- observaciones: problemas mencionados, elogios específicos, o "ninguna" si no hay nada relevante`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: analysisPrompt,
      }],
    });

    const jsonText = response.content[0].text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      producto: "neutral",
      delivery: "neutral",
      clienteFrecuente: "desconocido",
      observaciones: "Error al analizar",
    };
  }
}

// Webhook para recibir mensajes entrantes de WhatsApp
exports.whatsappWebhook = onRequest({
  secrets: ["ANTHROPIC_API_KEY", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"],
}, async (req, res) => {
  const db = admin.firestore();

  try {
    // Handle Meta webhook verification (GET request)
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      // Verify token should match your configured verification token
      const VERIFY_TOKEN = "fullqueso_webhook_verify_2025"; // You can change this

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✓ Webhook verified");
        return res.status(200).send(challenge);
      } else {
        console.error("❌ Webhook verification failed");
        return res.status(403).send("Forbidden");
      }
    }

    // Handle incoming messages (POST request)
    console.log("📨 Incoming WhatsApp message");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Extract Meta webhook data
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message || !message.from) {
      console.log("Not a message event or no sender");
      return res.status(200).send("OK");
    }

    // Extract message data
    const clientPhone = message.from; // Already in international format without +
    const messageBody = message.text?.body || message.interactive?.button_reply?.title || "";
    const profileName = contact?.profile?.name || "Cliente";
    const messageSid = message.id;

    if (!messageBody) {
      console.error("Missing message body");
      return res.status(200).send("OK");
    }

    console.log(`Message from: ${clientPhone}`);
    console.log(`Message: ${messageBody}`);

    // Get customer info from database
    const clienteDoc = await db.collection("clientes_bot")
        .doc(clientPhone)
        .get();

    const clienteNombre = clienteDoc.exists ?
      clienteDoc.data().nombre :
      profileName || "Cliente";

    // Get recent order for this customer (without composite index)
    const pedidosSnapshot = await db.collection("pedidos_bot")
        .where("cliente_telefono", "==", clientPhone)
        .get();

    // Sort by fecha_verificado in memory to avoid composite index requirement
    const pedidos = pedidosSnapshot.docs
        .map(doc => ({id: doc.id, ...doc.data()}))
        .sort((a, b) => {
          const timeA = a.fecha_verificado?.toMillis() || 0;
          const timeB = b.fecha_verificado?.toMillis() || 0;
          return timeB - timeA; // desc order
        });

    let contextoPedido = "";
    let pedidoReciente = null;
    if (pedidos.length > 0) {
      pedidoReciente = pedidos[0];
      const productosStr = pedidoReciente.productos
          .map((p) => p.nombre)
          .join(", ");
      contextoPedido = `\nPedido reciente: ${productosStr} (${pedidoReciente.ticket})`;
    }

    // Get conversation history (without composite index)
    const conversacionesSnapshot = await db.collection("conversaciones_bot")
        .where("cliente_telefono", "==", clientPhone)
        .get();

    // Sort by fecha in memory and take last 5
    const conversaciones = conversacionesSnapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => {
          const timeA = a.fecha?.toMillis() || 0;
          const timeB = b.fecha?.toMillis() || 0;
          return timeB - timeA; // desc order
        })
        .slice(0, 5)
        .reverse(); // Reverse to show oldest first

    let historialConversacion = "";
    if (conversaciones.length > 0) {
      historialConversacion = "\n\nHistorial de conversación:\n";
      conversaciones.forEach((conv) => {
        if (conv.mensaje_ana) {
          historialConversacion += `Ana: ${conv.mensaje_ana}\n`;
        }
        if (conv.mensaje_cliente) {
          historialConversacion += `Cliente: ${conv.mensaje_cliente}\n`;
        }
      });
    }

    // Count previous interactions to determine if we should close conversation
    const numInteracciones = conversaciones.length;

    // Check if this is a post-sale conversation or a general inquiry
    // Post-sale: Customer has recent order with seguimiento_enviado = true
    const esConversacionPostventa = pedidoReciente && pedidoReciente.seguimiento_enviado === true;

    // Check if conversation is completed (3+ messages or email already captured)
    const encuestaSnapshot = await db.collection("encuestas_postventa")
        .where("cliente_telefono", "==", clientPhone)
        .where("encuesta_completada", "==", true)
        .get();
    const encuestaCompletada = !encuestaSnapshot.empty;

    // Detect if customer is initiating new conversation outside post-sale flow
    const mensajeInicial = ["hola", "hello", "buenas", "buenos dias", "buenas tardes", "quiero", "necesito", "pedido", "reclamo"];
    // Changed logic: only consider it "new" if NOT in post-sale flow OR survey is completed
    const esInicioNuevo = !esConversacionPostventa || encuestaCompletada;
    const esMensajePedidoOConsulta = mensajeInicial.some(palabra => messageBody.toLowerCase().includes(palabra));

    let contextoCompleto = "";

    // SCENARIO 1: Customer initiating conversation outside post-sale flow
    if (esInicioNuevo && esMensajePedidoOConsulta && numInteracciones <= 1) {
      contextoCompleto = `Cliente: ${clienteNombre}
Mensaje del cliente: "${messageBody}"

INSTRUCCIONES CRÍTICAS - MENSAJE AUTOMÁTICO DE REDIRECCIÓN:

El cliente está iniciando una conversación FUERA del flujo de seguimiento post-venta.

DEBES responder con este mensaje de redirección (adapta según el caso):

**Si menciona PEDIDO o quiere ORDENAR:**
"Hola ${clienteNombre}, ¡con gusto! Para hacer tu pedido entra a fullqueso.com, es súper fácil. Para cualquier ayuda escríbenos al +584241476748. ¡Saludos!"

**Si menciona RECLAMO, PROBLEMA o CONSULTA:**
"Hola ${clienteNombre}, entiendo. Para atenderte mejor, escríbenos al +584241476748 o a atencionalcliente@fullqueso.com. Te ayudaremos enseguida. Un abrazo"

**Si solo saluda (hola, buenas, etc):**
"Hola ${clienteNombre}, ¿cómo estás? Para pedidos visita fullqueso.com. Para consultas escríbenos al +584241476748 o atencionalcliente@fullqueso.com. ¡Estamos a tu orden!"

REGLAS:
- 30-40 palabras máximo
- Tono cálido y profesional venezolano
- SIEMPRE mencionar fullqueso.com para pedidos
- SIEMPRE mencionar +584241476748 para atención
- NO iniciar conversación extendida
- NO preguntar por feedback o email`;

    // SCENARIO 2: Active post-sale conversation
    } else if (esConversacionPostventa && !encuestaCompletada && numInteracciones < 4) {
      contextoCompleto = `Cliente: ${clienteNombre}${contextoPedido}${historialConversacion}

Mensaje del cliente: "${messageBody}"

Número de intercambios previos: ${numInteracciones}

INSTRUCCIONES CRÍTICAS - FLUJO DE CONVERSACIÓN POST-VENTA (4 MENSAJES):

🎯 SIGUE ESTE ORDEN OBLIGATORIO:

**MENSAJE 1 (numInteracciones = 0):** Pregunta sobre PRODUCTOS
- Reacciona EXPRESIVAMENTE a lo que dice el cliente
- Pregunta específicamente sobre el PRODUCTO que pidió
- Ejemplo: "¡Qué fino Pedro! Dime, ¿los tequeños estaban calientitos? ¿El queso estaba en su punto?"
- NO preguntes por email todavía
- 30-40 palabras

**MENSAJE 2 (numInteracciones = 1):** Pregunta sobre DELIVERY
- Agradece el feedback del producto
- Pregunta específicamente sobre el DELIVERY
- Ejemplo: "Chévere, me alegra. Y el delivery, ¿todo bien? ¿Llegó rápido? ¿El empaque venía bien?"
- NO preguntes por email todavía
- 25-35 palabras

**MENSAJE 3 (numInteracciones = 2):** Pide EMAIL
- Agradece todo el feedback
- AHORA SÍ pide el email para enviar promociones
- Ejemplo: "Perfecto, gracias por tu feedback. ¿Me das tu correo para enviarte promociones y descuentos especiales?"
- NO cierres todavía, espera el email
- 25-35 palabras

**MENSAJE 4 (numInteracciones = 3):** CIERRE con Instagram
- Confirma recepción del email
- Invita a seguir @tequenosfullqueso en Instagram
- Menciona fullqueso.com
- CIERRE CÁLIDO con "Nos vemos pronto" y agradecimiento
- Ejemplo: "Perfecto, anotado. Síguenos en Instagram @tequenosfullqueso para promos y novedades. Visita fullqueso.com para tus próximas compras. ¡Nos vemos pronto, gracias por todo!"
- 30-40 palabras

REGLAS:
1. RESPETA EL ORDEN: Producto → Delivery → Email → Instagram+Cierre
2. NO saltes pasos - sigue el flujo exacto
3. SÉ MÁS EXPRESIVA - muestra emociones reales
4. Si preguntan algo NO de Full Queso: "Para otros asuntos, escríbenos a atencionalcliente@fullqueso.com, vale"
5. SIEMPRE usa el nombre del cliente
6. NO uses emojis
7. Varía expresiones venezolanas
8. El MENSAJE 4 DEBE incluir: Instagram @tequenosfullqueso + fullqueso.com + "Nos vemos pronto" + agradecimiento

Mantén tono maternal venezolano expresivo. MÁXIMO 40 PALABRAS.`;

    // SCENARIO 3: Conversation already completed or too many messages
    } else {
      contextoCompleto = `Cliente: ${clienteNombre}
Mensaje del cliente: "${messageBody}"

INSTRUCCIONES - CONVERSACIÓN COMPLETADA:

La encuesta post-venta ya fue completada o hay demasiados mensajes (${numInteracciones}).

Responde amablemente y redirige:

"Hola ${clienteNombre}, gracias por escribir. Para nuevos pedidos visita fullqueso.com. Para consultas escríbenos al +584241476748 o atencionalcliente@fullqueso.com. ¡Saludos!"

30-40 palabras máximo. Tono cálido venezolano.`;
    }

    console.log(`Scenario detected: ${esInicioNuevo ? 'New inquiry' : esConversacionPostventa ? 'Post-sale active' : 'Completed/Other'}`);
    console.log(`Interactions: ${numInteracciones}, Survey completed: ${encuestaCompletada}`);

    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY,
    });

    const respuesta = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150, // Reduced to enforce 30-40 word limit
      system: ANAJENSY_PROMPT,
      messages: [{
        role: "user",
        content: contextoCompleto,
      }],
    });

    let mensajeAna = respuesta.content[0].text;

    // Clean up any word count or annotations that Claude might add
    mensajeAna = mensajeAna.replace(/\*\[Conteo:.*?\]\*/g, '').trim();
    mensajeAna = mensajeAna.replace(/\[.*?palabras?\]/gi, '').trim();

    console.log(`Generated response: ${mensajeAna}`);

    // Send response via Meta WhatsApp API
    // Format phone number for Meta (remove whatsapp: prefix and +)
    let telefonoInternacional = clientPhone.replace(/\D/g, "");

    const metaApiUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    await axios.post(
        metaApiUrl,
        {
          messaging_product: "whatsapp",
          to: telefonoInternacional,
          type: "text",
          text: {
            body: mensajeAna
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
    );

    console.log("✓ Response sent to customer via Meta API");

    // Analyze sentiment of customer message
    const sentimentAnalysis = await analyzeSentiment(messageBody, anthropic);
    console.log("Sentiment analysis:", sentimentAnalysis);

    // Use already fetched order information for comprehensive survey
    let pedidoInfo = null;
    if (pedidoReciente) {
      pedidoInfo = {
        pedido_id: pedidoReciente.id,
        ticket: pedidoReciente.ticket,
        productos: pedidoReciente.productos,
        tipo: pedidoReciente.tipo,
        fecha_verificado: pedidoReciente.fecha_verificado,
      };
    }

    // Save conversation to database with feedback
    await db.collection("conversaciones_bot").add({
      cliente_telefono: clientPhone,
      cliente_nombre: clienteNombre,
      mensaje_cliente: messageBody,
      mensaje_ana: mensajeAna,
      fecha: admin.firestore.Timestamp.now(),
      tipo_interaccion: "respuesta_cliente",
      mensaje_sid: messageSid,
      // Feedback analysis
      sentimiento_producto: sentimentAnalysis.producto,
      sentimiento_delivery: sentimentAnalysis.delivery,
      es_cliente_frecuente: sentimentAnalysis.clienteFrecuente,
      observaciones: sentimentAnalysis.observaciones,
    });

    // Save comprehensive survey data
    await db.collection("encuestas_postventa").add({
      // Customer data
      cliente_telefono: clientPhone,
      cliente_nombre: clienteNombre,
      cliente_email: null, // Will be updated when customer provides email

      // Order data
      pedido_id: pedidoInfo?.pedido_id || null,
      pedido_ticket: pedidoInfo?.ticket || null,
      pedido_productos: pedidoInfo?.productos || [],
      pedido_tipo: pedidoInfo?.tipo || null,
      pedido_fecha: pedidoInfo?.fecha_verificado || null,
      pedido_hora: pedidoInfo?.fecha_verificado ?
        new Date(pedidoInfo.fecha_verificado.toDate()).toLocaleTimeString('es-VE') : null,

      // Survey responses
      respuesta_completa: messageBody,
      sentimiento_producto: sentimentAnalysis.producto,
      sentimiento_delivery: sentimentAnalysis.delivery,
      sentimiento_general: sentimentAnalysis.producto === "positivo" &&
                          sentimentAnalysis.delivery === "positivo" ? "positivo" :
                          sentimentAnalysis.producto === "negativo" ||
                          sentimentAnalysis.delivery === "negativo" ? "negativo" : "regular",

      // Suggestions and feedback
      sugerencias: sentimentAnalysis.observaciones,
      producto_favorito: null, // Will be extracted from conversation
      areas_mejora: sentimentAnalysis.delivery === "negativo" ||
                   sentimentAnalysis.delivery === "regular" ?
                   ["Delivery"] : [],

      // Customer relationship
      es_cliente_frecuente: sentimentAnalysis.clienteFrecuente,
      total_pedidos: clienteDoc.exists ? clienteDoc.data().total_pedidos : 1,

      // Metadata
      fecha_encuesta: admin.firestore.Timestamp.now(),
      encuesta_completada: false, // True when email is provided
      respuesta_ana: mensajeAna,
    });

    console.log("✓ Survey data saved to encuestas_postventa");

    // Log to Google Sheets for KPI tracking
    const conversationStartTime = conversaciones.length > 0 ?
      conversaciones[0].fecha?.toDate() :
      new Date();

    const resolutionTime = sheetsLogger.calculateResolutionTime(conversationStartTime);
    const inquiryType = sheetsLogger.detectInquiryType(messageBody, {
      hasRecentOrder: !!pedidoReciente,
      isPostSale: esConversacionPostventa,
    });

    // Determine resolution status
    let resolutionStatus = 'en_progreso';
    if (numInteracciones >= 2 || encuestaCompletada) {
      resolutionStatus = 'resuelto';
    } else if (esInicioNuevo && !esConversacionPostventa) {
      resolutionStatus = 'redirigido';
    }

    // Generate unique conversation ID
    const conversationId = `${clientPhone}_${Date.now()}`;

    // Log interaction to sheets
    await sheetsLogger.logInteraction({
      conversationId: conversationId,
      customerPhone: clientPhone,
      customerName: clienteNombre,
      orderNumber: pedidoReciente?.ticket || '',
      inquiryType: inquiryType,
      customerMessage: messageBody,
      agentResponse: mensajeAna,
      sentimentDetected: sentimentAnalysis.producto === 'positivo' &&
                        sentimentAnalysis.delivery === 'positivo' ? 'positivo' :
                        sentimentAnalysis.producto === 'negativo' ||
                        sentimentAnalysis.delivery === 'negativo' ? 'negativo' : 'neutral',
      resolutionStatus: resolutionStatus,
      resolutionTimeMinutes: resolutionTime,
      firstResponseTimeSeconds: 2, // Ana responds in ~2 seconds
      requiresFollowup: sentimentAnalysis.observaciones.includes('problema') ? 'sí' : 'no',
      npsScore: null, // Will be updated when customer responds
      csatScore: null, // Will be updated when customer responds
      notes: sentimentAnalysis.observaciones,
    });

    console.log("✓ Interaction logged to Google Sheets");

    // Check if message contains email and update customer profile
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = messageBody.match(emailRegex);

    if (emailMatch) {
      const email = emailMatch[0];
      console.log(`✓ Email detected: ${email}`);

      // Update customer profile with email
      await db.collection("clientes_bot").doc(clientPhone).set({
        email: email,
        email_capturado_fecha: admin.firestore.Timestamp.now(),
      }, {merge: true});

      // Update most recent survey with email (without composite index)
      const surveysSnapshot = await db.collection("encuestas_postventa")
          .where("cliente_telefono", "==", clientPhone)
          .get();

      if (!surveysSnapshot.empty) {
        // Sort in memory and get most recent
        const surveys = surveysSnapshot.docs
            .sort((a, b) => {
              const timeA = a.data().fecha_encuesta?.toMillis() || 0;
              const timeB = b.data().fecha_encuesta?.toMillis() || 0;
              return timeB - timeA;
            });

        await surveys[0].ref.update({
          cliente_email: email,
          encuesta_completada: true,
        });
        console.log("✓ Survey marked as completed with email");
      }
    }

    // Respond to Twilio webhook (200 OK)
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error");
  }
});

// ============================================================================
// AUTOMATED BACKUP FUNCTION
// ============================================================================

/**
 * Scheduled backup function - runs every Sunday at 2:00 AM (UTC-4 Caracas time)
 * Exports all Firestore collections to a GCS bucket for disaster recovery
 */
exports.backupFirestore = onSchedule({
  schedule: "0 6 * * 0", // Every Sunday at 6:00 AM UTC (2:00 AM Caracas)
  timeZone: "America/Caracas",
  region: "us-central1",
}, async (event) => {
  const db = admin.firestore();
  const storage = admin.storage();
  const bucket = storage.bucket();

  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const backupFolder = `backups/${timestamp}`;

  console.log(`🗄️  Starting scheduled backup at ${timestamp}`);

  const collections = [
    "pedidos_bot",
    "clientes_bot",
    "conversaciones_bot",
    "encuestas_postventa"
  ];

  try {
    let totalDocs = 0;

    for (const collectionName of collections) {
      console.log(`  📦 Backing up ${collectionName}...`);

      const snapshot = await db.collection(collectionName).get();
      const documents = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Timestamps to ISO strings for JSON compatibility
        const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
          if (value && typeof value === "object" && value._seconds) {
            return new Date(value._seconds * 1000).toISOString();
          }
          return value;
        }));

        documents.push({id: doc.id, ...cleanData});
      });

      // Save to Cloud Storage
      const fileName = `${backupFolder}/${collectionName}.json`;
      const file = bucket.file(fileName);

      await file.save(JSON.stringify(documents, null, 2), {
        contentType: "application/json",
        metadata: {
          metadata: {
            backup_date: timestamp,
            collection: collectionName,
            document_count: documents.length.toString(),
          },
        },
      });

      totalDocs += documents.length;
      console.log(`  ✓ ${collectionName}: ${documents.length} documents backed up`);
    }

    // Create backup manifest
    const manifest = {
      backup_date: timestamp,
      total_documents: totalDocs,
      collections: collections,
      status: "completed",
      timestamp: new Date().toISOString(),
    };

    const manifestFile = bucket.file(`${backupFolder}/manifest.json`);
    await manifestFile.save(JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
    });

    console.log(`✅ Backup completed: ${totalDocs} documents saved to ${backupFolder}`);

    // Keep only last 8 weeks of backups (delete older ones)
    await cleanOldBackups(bucket, 8);

  } catch (error) {
    console.error("❌ Backup failed:", error);
    // In production, you might want to send an alert email/notification here
    throw error;
  }
});

/**
 * Helper function to clean up old backups
 * @param {*} bucket - Cloud Storage bucket
 * @param {number} weeksToKeep - Number of weeks of backups to retain
 */
async function cleanOldBackups(bucket, weeksToKeep = 8) {
  try {
    const [files] = await bucket.getFiles({prefix: "backups/"});
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeksToKeep * 7));

    let deletedCount = 0;

    for (const file of files) {
      // Extract date from path like "backups/2025-11-06/..."
      const dateMatch = file.name.match(/backups\/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const fileDate = new Date(dateMatch[1]);
        if (fileDate < cutoffDate) {
          await file.delete();
          deletedCount++;
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️  Cleaned up ${deletedCount} old backup files`);
    }
  } catch (error) {
    console.error("⚠️  Error cleaning old backups:", error);
    // Don't throw - cleaning is non-critical
  }
}
