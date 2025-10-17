const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");
const twilio = require("twilio");

admin.initializeApp();

// Configuración
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
  secrets: ["ANTHROPIC_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_NUMBER"]
}, async (event) => {
  const db = admin.firestore();
  const ahora = new Date();
  const hace0Sec = new Date(ahora.getTime() - 0 * 1000); // 0 seconds delay

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
    // Format phone number for Venezuela (+58)
    // Remove leading 0 if present and add country code
    const telefonoLimpio = telefono.replace(/^0/, "");
    const telefonoInternacional = `+58${telefonoLimpio}`;
    const whatsappNumber = `whatsapp:${telefonoInternacional}`;

    console.log(`Sending WhatsApp to: ${whatsappNumber}`);

    // Send message via Twilio
    const message = await twilioClient.messages.create({
      body: mensaje,
      from: TWILIO_WHATSAPP_NUMBER,
      to: whatsappNumber,
    });

    console.log(`✓ WhatsApp sent successfully!`);
    console.log(`  - Message SID: ${message.sid}`);
    console.log(`  - To: ${whatsappNumber}`);
    console.log(`  - Status: ${message.status}`);

    return message;
  } catch (error) {
    console.error("❌ Error sending WhatsApp:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    });
    throw error;
  }
}
