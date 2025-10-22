const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");
const axios = require("axios");

admin.initializeApp();

// Configuración
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Meta WhatsApp Configuration
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_VERSION = "v21.0"; // Meta Graph API version

// Prompt de Anajensy
const ANAJENSY_PROMPT = `Eres Anajensy (Ana), operadora de delivery de Full Queso en Caracas, Venezuela. 
Eres una madre venezolana cálida, empática y servicial.

PERSONALIDAD:
- Cálida y maternal
- Empática y atenta
- Profesional pero cercana
- Usas español venezolano natural

EXPRESIONES:
- Saludos: "Hola, feliz tarde", "¿Cómo estás, mi amor?"
- Afirmaciones: "Chévere", "Perfecto", "Ay, qué bueno"
- Apoyo: "Estamos para servirte", "oíste"
- Despedidas: "Hasta luego, feliz tarde", "Un abrazo"

REGLAS:
1. Mensajes cortos para WhatsApp (2-3 líneas máximo)
2. Usa el nombre del cliente
3. Menciona el pedido específico
4. Pregunta sobre su experiencia
5. NO uses emojis
6. NO seas formal

CONTEXTO: El cliente hizo un pedido hace 2 minutos que fue verificado. 
Tu objetivo es confirmar que todo está bien con el pedido.`;

exports.procesarSeguimientos = onSchedule({
  schedule: "every 1 minutes",
  secrets: ["ANTHROPIC_API_KEY", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"]
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
Pedido verificado hace 2 minutos: ${productosStr}
Tipo: ${pedidoData.tipo}
${cliente.total_pedidos === 1 ? "ES SU PRIMER PEDIDO" : `Total pedidos: ${cliente.total_pedidos}`}

Escribe mensaje de seguimiento para confirmar que el pedido está OK.`;

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

    await enviarWhatsApp(pedidoData.cliente_telefono, mensajeAna);

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

async function enviarWhatsApp(telefono, mensaje) {
  try {
    // Format phone number - Meta API requires number WITH country code, WITHOUT + sign
    let telefonoInternacional;

    // Check if number already has country code (starts with digits like 1, 58, etc)
    if (/^[1-9]\d{10,14}$/.test(telefono)) {
      // Already has country code (e.g., 15556406840, 584241476758)
      telefonoInternacional = telefono;
    } else {
      // Venezuelan number without country code (e.g., 04241476758)
      // Remove leading 0 and add Venezuela country code (58)
      const telefonoLimpio = telefono.replace(/^0/, "");
      telefonoInternacional = `58${telefonoLimpio}`;
    }

    console.log(`Sending WhatsApp to: +${telefonoInternacional}`);

    // Send message via Meta WhatsApp Cloud API
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: telefonoInternacional,
        type: "text",
        text: {
          body: mensaje
        }
      },
      {
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`✓ WhatsApp sent successfully via Meta!`);
    console.log(`  - Message ID: ${response.data.messages[0].id}`);
    console.log(`  - To: +${telefonoInternacional}`);
    console.log(`  - Status: sent`);

    return response.data;
  } catch (error) {
    console.error("❌ Error sending WhatsApp via Meta:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}
