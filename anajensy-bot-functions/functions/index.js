const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");
const axios = require("axios");

admin.initializeApp();

// Configuración
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Twilio WhatsApp Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = "whatsapp:+15558855791"; // Twilio WhatsApp Business number (tequenosfullqueso)

// Prompt de Anajensy
const ANAJENSY_PROMPT = `Eres Anajensy (Ana), operadora de delivery de Full Queso en Caracas, Venezuela.
Eres una madre venezolana cálida, con buen humor, empática y servicial.

PERSONALIDAD:
- Cálida y maternal pero natural (no exageres con "mi amor")
- Alegre, con buen humor venezolano
- Profesional pero cercana
- Usas modismos venezolanos con naturalidad

EXPRESIONES VENEZOLANAS (varíalas):
- Saludos: "Epa, ¿cómo estás?", "Hola, ¿todo bien?", "¿Qué hubo?", "Feliz tarde"
- Afirmaciones: "Chévere", "Perfecto", "Qué bueno", "Dale pues", "Aja"
- Preguntar: "Dime", "¿Oíste?", "¿Cómo te fue?"
- Apoyo: "Aquí estamos", "Para servirte", "Cuenta conmigo"
- Despedidas: "Un abrazo", "Saludos", "Cuídate", "Nos vemos"
- Cariño (úsalo poco): "mi amor", "corazón", "vale" (al final de frase)

TONO:
- Natural y conversacional, como una vecina amable
- Buen humor pero sin exagerar
- Cálida pero no empalagosa

ESTRUCTURA DEL MENSAJE (POST-VENTA):
1. Saludo breve y natural
2. Menciona el PRODUCTO EXACTO recibido (ej: "tus 20 tequeños", "tu combo de churros")
3. Pregunta ESPECÍFICA sobre el PRODUCTO:
   - Calidad y estado
   - Temperatura (caliente/fresco según corresponda)
   - Sabor y presentación
4. Pregunta ESPECÍFICA sobre el DELIVERY:
   - Rapidez (tiempo de espera)
   - Empaque y presentación
   - Atención del repartidor
5. Pregunta sobre experiencia general (si es cliente frecuente, algo que mejorar)
6. Cierre cálido y cercano

REGLAS IMPORTANTES:
1. Mensajes de 5-6 líneas máximo
2. SIEMPRE usa el nombre del cliente
3. SIEMPRE menciona el producto EXACTO que recibieron
4. Pregunta tipo encuesta pero conversacional, no formal
5. Usa datos del pedido (producto, cantidad)
6. NO uses emojis
7. NO repitas "mi amor" constantemente
8. Varía las expresiones venezolanas
9. Haz que se sienta natural, como si Ana de verdad quisiera saber su opinión

CONTEXTO: El cliente recibió su pedido. Esto es una encuesta post-venta disfrazada de conversación amigable.
Tu objetivo: Obtener feedback específico sobre PRODUCTO y DELIVERY de forma natural y cálida.`;

exports.procesarSeguimientos = onSchedule({
  schedule: "every 1 minutes",
  secrets: ["ANTHROPIC_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]
}, async (event) => {
  const db = admin.firestore();
  const ahora = new Date();
  const hace0Sec = new Date(ahora.getTime() - 0 * 1000); // 0 seconds delay

  console.log(`🔍 Buscando pedidos... timestamp límite: ${hace0Sec.toISOString()}`);

  try {
    const pedidosSnapshot = await db.collection("pedidos_bot")
        .where("estado", "==", "VERIFICADO")
        .where("seguimiento_enviado", "==", false)
        .where("fecha_verificado", "<=", admin.firestore.Timestamp.fromDate(hace0Sec))
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
- 5-6 líneas máximo
- Haz que se sienta como una conversación amigable, no una encuesta formal`;

    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY,
    });

    const mensaje = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
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
    // Format phone number - Twilio requires whatsapp: prefix and + sign
    let telefonoInternacional;

    // Check if number already has country code (starts with digits like 1, 58, etc)
    if (/^[1-9]\d{10,14}$/.test(telefono)) {
      // Already has country code (e.g., 15556406840, 584241476758)
      telefonoInternacional = `+${telefono}`;
    } else {
      // Venezuelan number without country code (e.g., 04241476758)
      // Remove leading 0 and add Venezuela country code (58)
      const telefonoLimpio = telefono.replace(/^0/, "");
      telefonoInternacional = `+58${telefonoLimpio}`;
    }

    console.log(`Sending WhatsApp to: ${telefonoInternacional}`);

    // Send message via Twilio WhatsApp API using approved template
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: `whatsapp:${telefonoInternacional}`,
        ContentSid: "HX81b16f5a9d7af1ee465044e0535ffcb3",
        ContentVariables: JSON.stringify({
          "1": clienteNombre || "Cliente",
          "2": productosStr || "tu pedido"
        })
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log(`✓ WhatsApp sent successfully via Twilio (using template)!`);
    console.log(`  - Message SID: ${response.data.sid}`);
    console.log(`  - To: ${telefonoInternacional}`);
    console.log(`  - Status: ${response.data.status}`);

    return response.data;
  } catch (error) {
    console.error("❌ Error sending WhatsApp via Twilio:", error);
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
  secrets: ["ANTHROPIC_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
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

    // Get recent order for this customer
    const pedidosSnapshot = await db.collection("pedidos_bot")
        .where("cliente_telefono", "==", clientPhone)
        .orderBy("fecha_verificado", "desc")
        .limit(1)
        .get();

    let contextoPedido = "";
    if (!pedidosSnapshot.empty) {
      const pedido = pedidosSnapshot.docs[0].data();
      const productosStr = pedido.productos
          .map((p) => p.nombre)
          .join(", ");
      contextoPedido = `\nPedido reciente: ${productosStr} (${pedido.ticket})`;
    }

    // Get conversation history
    const conversacionesSnapshot = await db.collection("conversaciones_bot")
        .where("cliente_telefono", "==", clientPhone)
        .orderBy("fecha", "desc")
        .limit(5)
        .get();

    let historialConversacion = "";
    if (!conversacionesSnapshot.empty) {
      historialConversacion = "\n\nHistorial de conversación:\n";
      conversacionesSnapshot.docs.reverse().forEach((doc) => {
        const conv = doc.data();
        if (conv.mensaje_ana) {
          historialConversacion += `Ana: ${conv.mensaje_ana}\n`;
        }
        if (conv.mensaje_cliente) {
          historialConversacion += `Cliente: ${conv.mensaje_cliente}\n`;
        }
      });
    }

    // Generate response using Claude
    const contextoCompleto = `Cliente: ${clienteNombre}${contextoPedido}${historialConversacion}

Mensaje del cliente: "${messageBody}"

Responde como Anajensy de manera natural y servicial. Si el cliente pregunta por su pedido, tranquilízalo. Si tiene un problema, ofrece ayuda. Mantén el tono cálido y maternal.`;

    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY,
    });

    const respuesta = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
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

    // Respond to Twilio webhook (200 OK)
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error");
  }
});
