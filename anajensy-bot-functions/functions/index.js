const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");
const axios = require("axios");
const twilio = require("twilio");

admin.initializeApp();

// Configuración
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Meta WhatsApp Configuration (Primary - for initiating conversations)
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "805718575964429";
const WHATSAPP_API_VERSION = "v21.0";

// Twilio WhatsApp Configuration (Backup - for receiving messages)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = "whatsapp:+15558855791";

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

FLUJO DE CONVERSACIÓN (3 MENSAJES):

**MENSAJE 1 - Respuesta al cliente (EXPRESIVA):**
Cuando el cliente responda al template inicial:
- Reacciona EXPRESIVAMENTE a lo que dice (alegría si es positivo, empatía si hay problema)
- Profundiza en PRODUCTO: pregunta específicamente sobre el producto
- Ejemplo: "¡Ay qué fino que te gustaron! Dime, ¿los churros estaban calientitos? ¿El choco arequipe estaba en su punto?"
- 30-40 palabras

**MENSAJE 2 - Delivery y detalles:**
Después de la respuesta del cliente:
- Pregunta sobre el DELIVERY específicamente
- Ejemplo: "Chévere, me alegra. Y el delivery, ¿todo bien? ¿Llegó rápido? ¿El empaque venía bien?"
- 25-35 palabras

**MENSAJE 3 - Agradecimiento, email y cierre:**
Cierre de encuesta:
- Agradece el feedback
- Pide el email para promociones
- Recuerda fullqueso.com para próximas compras
- Ejemplo: "Perfecto, gracias por tu feedback. ¿Me das tu correo para promociones? Recuerda que estamos a tu orden en fullqueso.com. Un abrazo"
- 30-40 palabras

REGLAS IMPORTANTES:
1. SÉ MÁS EXPRESIVA - muestra emociones reales en tus respuestas
2. Mensajes: 25-40 palabras máximo
3. SIEMPRE usa el nombre del cliente
4. NO uses emojis
5. Varía las expresiones venezolanas
6. Sigue el flujo de 3 mensajes: Producto → Delivery → Email

MANEJO DE SITUACIONES:
- Cliente da feedback positivo → ¡CELÉBRALO! "¡Qué fino!", "¡Brutal!", luego pregunta sobre producto
- Cliente menciona problema → Empatiza: "Ay vale, lamento eso", luego ofrece ayuda
- Cliente da email → "Perfecto, anotado. Recuerda que estamos en fullqueso.com para tus próximas compras. ¡Un abrazo!"
- Cliente no responde → No insistas, espera

LÍMITES PROFESIONALES:
- Si el cliente pregunta algo NO relacionado con Full Queso:
  "Para otros asuntos, escríbenos a atencionalcliente@fullqueso.com, vale"
- Mantente en tu rol de agente de Full Queso

CONTEXTO: Tu trabajo es obtener feedback detallado sobre PRODUCTO, DELIVERY, y el EMAIL del cliente.
Objetivo: Conversación natural de 3 mensajes que llene la base de datos completamente.`;

exports.procesarSeguimientos = onSchedule({
  schedule: "every 1 minutes",
  secrets: ["ANTHROPIC_API_KEY", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]
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
    // Format phone number for Twilio WhatsApp (whatsapp:+country_code_number)
    let telefonoLimpio = telefono.replace(/\D/g, ""); // Remove all non-digits

    // If it doesn't start with country code, assume Venezuela (58)
    if (!telefonoLimpio.match(/^[1-9]/)) {
      telefonoLimpio = "58" + telefonoLimpio.replace(/^0/, "");
    }

    const toNumber = `whatsapp:+${telefonoLimpio}`;

    console.log(`Sending WhatsApp via Twilio to: ${toNumber}`);

    // Use Twilio WhatsApp with approved Content Template
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const message = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      contentSid: "HX81b16f5a9d7af1ee465044e0535ffcb3", // anajensy_order_followup (META APPROVED ✓)
      contentVariables: JSON.stringify({
        "1": clienteNombre,
        "2": productosStr
      })
    });

    console.log(`✓ WhatsApp sent successfully via Twilio!`);
    console.log(`  - Message SID: ${message.sid}`);
    console.log(`  - Status: ${message.status}`);
    console.log(`  - To: ${toNumber}`);
    console.log(`  - Template: anajensy_order_followup (META APPROVED ✓)`);
    console.log(`  - Customer: ${clienteNombre}`);
    console.log(`  - Products: ${productosStr}`);

    return message;
  } catch (error) {
    console.error("❌ Error sending WhatsApp via Twilio:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
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
  secrets: ["ANTHROPIC_API_KEY", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
}, async (req, res) => {
  const db = admin.firestore();

  try {
    console.log("📨 Incoming WhatsApp message");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Extract Twilio webhook data
    const {
      From: fromNumber,
      To: toNumber,
      Body: messageBody,
      ProfileName: profileName,
      MessageSid: messageSid,
    } = req.body;

    // Clean phone number (remove "whatsapp:" prefix)
    const clientPhone = fromNumber?.replace("whatsapp:", "").replace("+", "");

    if (!clientPhone || !messageBody) {
      console.error("Missing phone or message body");
      return res.status(400).send("Missing required fields");
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
    const esInicioNuevo = !esConversacionPostventa || numInteracciones === 0 || encuestaCompletada;
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
    } else if (esConversacionPostventa && !encuestaCompletada && numInteracciones < 3) {
      contextoCompleto = `Cliente: ${clienteNombre}${contextoPedido}${historialConversacion}

Mensaje del cliente: "${messageBody}"

Número de intercambios previos: ${numInteracciones}

INSTRUCCIONES CRÍTICAS - SEGUIMIENTO POST-VENTA:

1. SOLO HABLAS DE FULL QUESO (pedidos, productos, delivery)
   - Si preguntan del clima, política, chistes, etc: "Para otros asuntos, escríbenos a atencionalcliente@fullqueso.com, vale"

2. MANEJO DE SITUACIONES:
   - Cliente da feedback → Agradece + SIEMPRE pide email para promociones + menciona fullqueso.com + DESPÍDETE
   - Cliente da email → Confirma recepción + menciona fullqueso.com + DESPÍDETE: "Perfecto, anotado. Recuerda fullqueso.com para tus próximas compras. ¡Un abrazo!"
   - Cliente da sugerencia → "Vamos a tomar todo en cuenta" + Pide email + DESPÍDETE
   - Cliente dice "gracias"/"ok"/"listo" → DESPÍDETE: "Para servirte. Recuerda fullqueso.com. Saludos"

3. FINALIZACIÓN (${numInteracciones >= 2 ? 'YA ES MOMENTO DE CERRAR' : 'Aún puedes continuar'}):
   ${numInteracciones >= 2 ?
     '⚠️ YA HUBO 2+ INTERCAMBIOS - DEBES DESPEDIRTE AHORA. Di: "Perfecto, gracias por tu tiempo. Visita fullqueso.com para tus próximos pedidos. Un abrazo"' :
     'Si cliente ya dio feedback O email, despídete mencionando fullqueso.com. Si no, haz UNA pregunta más y despídete.'}

4. RESPUESTA (30-40 PALABRAS MÁXIMO):
   - Agradece/confirma lo que dijeron
   - SIEMPRE pide email si aún no lo has capturado
   - Menciona fullqueso.com al despedirte
   - SÉ BREVE Y CONCISO

Mantén tono profesional venezolano. CAPTURA EMAIL. MÁXIMO 40 PALABRAS.`;

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

    const mensajeAna = respuesta.content[0].text;
    console.log(`Generated response: ${mensajeAna}`);

    // Send response via WhatsApp (using freeform message since customer messaged us)
    const urlTwilio = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    await axios.post(
        urlTwilio,
        new URLSearchParams({
          From: TWILIO_WHATSAPP_NUMBER,
          To: fromNumber,
          Body: mensajeAna,
        }),
        {
          auth: {
            username: TWILIO_ACCOUNT_SID,
            password: TWILIO_AUTH_TOKEN,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
    );

    console.log("✓ Response sent to customer");

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
