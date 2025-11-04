const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Kiosk Claude Proxy
 * Allows the kiosk to call Claude API securely through Firebase
 */
exports.kioskClaudeProxy = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    console.log('Calling Claude API for kiosk...');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt || 'You are a helpful assistant.',
      messages: messages,
    });

    console.log('Claude response received');

    return res.status(200).json({
      success: true,
      response: response.content[0].text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      }
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * AI Cashier WhatsApp Webhook
 * Receives messages from Meta WhatsApp Business API and processes them with Claude AI
 */
exports.aiCashierWebhook = functions.https.onRequest(async (req, res) => {
  // Webhook verification (required by Meta)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  // Handle incoming messages
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Verify webhook signature for security
      // TODO: Implement signature verification

      // Process WhatsApp messages
      if (body.object === 'whatsapp_business_account') {
        const entries = body.entry || [];

        for (const entry of entries) {
          const changes = entry.changes || [];

          for (const change of changes) {
            if (change.field === 'messages') {
              const messages = change.value.messages || [];

              for (const message of messages) {
                await processMessage(message, change.value.metadata);
              }
            }
          }
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.sendStatus(500);
    }
  }
});

/**
 * Process incoming WhatsApp message
 */
async function processMessage(message, metadata) {
  const phoneNumber = message.from;
  const messageText = message.text?.body;
  const messageType = message.type;

  console.log(`Received ${messageType} message from ${phoneNumber}: ${messageText}`);

  // Only process text messages for now
  if (messageType !== 'text') {
    await sendWhatsAppMessage(phoneNumber, 'Lo siento, solo puedo procesar mensajes de texto por ahora.');
    return;
  }

  try {
    // Get or create customer session
    const sessionDoc = await db.collection('cashier_sessions').doc(phoneNumber).get();
    let conversationHistory = [];

    if (sessionDoc.exists) {
      conversationHistory = sessionDoc.data().history || [];
    }

    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: messageText,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get AI response from Claude
    const aiResponse = await getClaudeResponse(conversationHistory, phoneNumber);

    // Add assistant response to history
    conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Save session
    await db.collection('cashier_sessions').doc(phoneNumber).set({
      phoneNumber,
      history: conversationHistory,
      lastInteraction: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Send response via WhatsApp
    await sendWhatsAppMessage(phoneNumber, aiResponse);

  } catch (error) {
    console.error('Error processing message:', error);
    await sendWhatsAppMessage(phoneNumber, 'Lo siento, ocurrió un error. Por favor intenta de nuevo.');
  }
}

/**
 * Get response from Claude AI
 */
async function getClaudeResponse(conversationHistory, phoneNumber) {
  // Get customer info if exists
  const customerDoc = await db.collection('customers').doc(phoneNumber).get();
  const customerInfo = customerDoc.exists ? customerDoc.data() : null;

  // Get menu items
  const menuSnapshot = await db.collection('menu_items').where('available', '==', true).get();
  const menuItems = menuSnapshot.docs.map(doc => doc.data());

  // Build system prompt
  const systemPrompt = buildSystemPrompt(menuItems, customerInfo);

  // Format conversation for Claude
  const messages = conversationHistory
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  return response.content[0].text;
}

/**
 * Build system prompt for AI Cashier
 */
function buildSystemPrompt(menuItems, customerInfo) {
  const menuText = menuItems.map(item =>
    `- ${item.name}: $${item.price} ${item.description ? `(${item.description})` : ''}`
  ).join('\n');

  let prompt = `Eres un cajero virtual amigable y eficiente para Full Queso, un restaurante mexicano especializado en quesadillas.

Tu trabajo es:
1. Saludar a los clientes de manera amigable
2. Ayudarles a hacer pedidos del menú
3. Responder preguntas sobre los productos
4. Confirmar los pedidos antes de procesarlos
5. Proporcionar información sobre tiempo de entrega y métodos de pago

MENÚ DISPONIBLE:
${menuText}

INSTRUCCIONES:
- Sé amigable, profesional y eficiente
- Habla en español de manera natural
- Confirma siempre los pedidos antes de procesarlos
- Si no entiendes algo, pide clarificación de manera cortés
- No inventes información sobre productos que no están en el menú
`;

  if (customerInfo) {
    prompt += `\n\nINFORMACIÓN DEL CLIENTE:
- Nombre: ${customerInfo.name || 'No proporcionado'}
- Pedidos anteriores: ${customerInfo.orderCount || 0}
`;
  }

  return prompt;
}

/**
 * Send WhatsApp message via Meta API
 */
async function sendWhatsAppMessage(to, text) {
  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`Message sent to ${to}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}
