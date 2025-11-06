/**
 * Google Sheets Logger for Ana WhatsApp Bot KPI Tracking
 *
 * This module handles all data logging to Google Sheets for:
 * - Customer interaction tracking
 * - KPI measurement (NPS, CSAT, response times)
 * - Analytics and reporting
 */

const { google } = require('googleapis');
const admin = require('firebase-admin');

// Google Sheets Configuration
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID || ''; // To be configured
const INTERACTIONS_SHEET = 'Interacciones';
const KPI_SUMMARY_SHEET = 'KPI_Resumen';

/**
 * Initialize Google Sheets API client
 * Uses service account credentials from Firebase Admin
 */
function getSheetsClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: admin.credential.applicationDefault(),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Sheets client:', error);
    // Return null - logging will fail gracefully
    return null;
  }
}

/**
 * Log customer interaction to Google Sheets
 *
 * @param {Object} interactionData - Complete interaction data
 * @returns {Promise<boolean>} Success status
 */
async function logInteraction(interactionData) {
  const sheets = getSheetsClient();
  if (!sheets) {
    console.warn('⚠️ Sheets client not available, skipping logging');
    return false;
  }

  if (!SPREADSHEET_ID) {
    console.warn('⚠️ SPREADSHEET_ID not configured, skipping logging');
    return false;
  }

  try {
    const {
      conversationId,
      customerPhone,
      customerName,
      orderNumber,
      inquiryType,
      customerMessage,
      agentResponse,
      sentimentDetected,
      resolutionStatus,
      resolutionTimeMinutes,
      firstResponseTimeSeconds,
      requiresFollowup,
      npsScore,
      csatScore,
      notes,
    } = interactionData;

    const timestamp = new Date().toISOString();

    // Prepare row data matching sheet structure
    const rowData = [
      timestamp,
      conversationId || '',
      customerPhone || '',
      customerName || '',
      orderNumber || '',
      inquiryType || '',
      customerMessage || '',
      agentResponse || '',
      sentimentDetected || '',
      resolutionStatus || '',
      resolutionTimeMinutes || '',
      firstResponseTimeSeconds || '',
      requiresFollowup || '',
      npsScore || '',
      csatScore || '',
      notes || '',
    ];

    // Append row to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INTERACTIONS_SHEET}!A:P`, // A through P (16 columns)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    console.log(`✅ Logged interaction to Sheets: ${conversationId}`);
    return true;
  } catch (error) {
    console.error('❌ Error logging to Sheets:', error.message);

    // Fallback: Save to backup file in Cloud Storage
    await logToBackupFile(interactionData);

    return false;
  }
}

/**
 * Log NPS response
 * Updates existing interaction row with NPS score
 *
 * @param {string} conversationId - Conversation ID
 * @param {number} score - NPS score (0-10)
 */
async function logNPSScore(conversationId, score) {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) return false;

  try {
    // Find row with this conversationId
    const searchResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INTERACTIONS_SHEET}!B:B`, // Column B has conversationId
    });

    const rows = searchResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === conversationId);

    if (rowIndex === -1) {
      console.warn(`⚠️ Conversation ${conversationId} not found for NPS update`);
      return false;
    }

    // Update NPS column (column N, index 13)
    const actualRowNumber = rowIndex + 1; // Sheets are 1-indexed
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INTERACTIONS_SHEET}!N${actualRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[score]],
      },
    });

    console.log(`✅ Updated NPS score for ${conversationId}: ${score}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating NPS:', error.message);
    return false;
  }
}

/**
 * Log CSAT response
 * Updates existing interaction row with CSAT score
 *
 * @param {string} conversationId - Conversation ID
 * @param {number} score - CSAT score (1-5)
 */
async function logCSATScore(conversationId, score) {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) return false;

  try {
    // Find row with this conversationId
    const searchResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INTERACTIONS_SHEET}!B:B`, // Column B has conversationId
    });

    const rows = searchResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === conversationId);

    if (rowIndex === -1) {
      console.warn(`⚠️ Conversation ${conversationId} not found for CSAT update`);
      return false;
    }

    // Update CSAT column (column O, index 14)
    const actualRowNumber = rowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INTERACTIONS_SHEET}!O${actualRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[score]],
      },
    });

    console.log(`✅ Updated CSAT score for ${conversationId}: ${score}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating CSAT:', error.message);
    return false;
  }
}

/**
 * Create initial sheet structure
 * Run this once to set up the Google Sheet
 */
async function initializeSheet() {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    console.error('❌ Cannot initialize: Sheets client or SPREADSHEET_ID missing');
    return false;
  }

  try {
    // Create header row for interactions sheet
    const headers = [
      'timestamp',
      'conversation_id',
      'customer_phone',
      'customer_name',
      'order_number',
      'inquiry_type',
      'customer_message',
      'agent_response',
      'sentiment_detected',
      'resolution_status',
      'resolution_time_minutes',
      'first_response_time_seconds',
      'requires_followup',
      'nps_score',
      'csat_score',
      'notes',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INTERACTIONS_SHEET}!A1:P1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    // Format header row (bold, frozen)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                },
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)',
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });

    console.log('✅ Sheet initialized with headers');
    return true;
  } catch (error) {
    console.error('❌ Error initializing sheet:', error.message);
    return false;
  }
}

/**
 * Create KPI summary formulas sheet
 */
async function createKPISummarySheet() {
  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) return false;

  try {
    // Create KPI summary with formulas
    const kpiData = [
      ['KPI', 'Fórmula', 'Valor', 'Meta', 'Estado'],
      [
        'NPS (Net Promoter Score)',
        '=(COUNTIF(Interacciones!N:N,">=9")-COUNTIF(Interacciones!N:N,"<=6"))/COUNTA(Interacciones!N:N)*100',
        '',
        '> 50',
        '',
      ],
      [
        'CSAT (% Satisfechos)',
        '=COUNTIFS(Interacciones!O:O,">=4")/COUNTA(Interacciones!O:O)*100',
        '',
        '> 80%',
        '',
      ],
      [
        'Tiempo Promedio Primera Respuesta (seg)',
        '=AVERAGE(Interacciones!L:L)',
        '',
        '< 30',
        '',
      ],
      [
        'Tiempo Promedio Resolución (min)',
        '=AVERAGE(Interacciones!K:K)',
        '',
        '< 5',
        '',
      ],
      [
        'Tasa de Resolución sin Escalado',
        '=COUNTIF(Interacciones!J:J,"resuelto")/COUNTA(Interacciones!J:J)*100',
        '',
        '> 80%',
        '',
      ],
      [
        'Tasa de Respuesta a Encuestas',
        '=COUNTA(Interacciones!N:N)/COUNTA(Interacciones!B:B)*100',
        '',
        '> 30%',
        '',
      ],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${KPI_SUMMARY_SHEET}!A1:E7`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: kpiData,
      },
    });

    console.log('✅ KPI Summary sheet created');
    return true;
  } catch (error) {
    console.error('❌ Error creating KPI sheet:', error.message);
    return false;
  }
}

/**
 * Backup logging to Cloud Storage when Sheets API fails
 */
async function logToBackupFile(interactionData) {
  try {
    const storage = admin.storage();
    const bucket = storage.bucket();
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `sheets-backup/${timestamp}-interactions.jsonl`;

    const file = bucket.file(fileName);

    // Append as JSON Lines format (one JSON object per line)
    const jsonLine = JSON.stringify({
      ...interactionData,
      logged_at: new Date().toISOString(),
    }) + '\n';

    await file.save(jsonLine, {
      contentType: 'application/jsonl',
      resumable: false,
      metadata: {
        metadata: {
          type: 'sheets_backup',
          date: timestamp,
        },
      },
    });

    console.log(`📦 Backed up interaction to: ${fileName}`);
  } catch (error) {
    console.error('❌ Backup logging failed:', error.message);
  }
}

/**
 * Detect inquiry type from message content
 */
function detectInquiryType(message, contextInfo) {
  const msg = message.toLowerCase();

  // Keywords for each category
  if (msg.match(/entreg|lleg|demor|tiemp|cuand|esper/)) {
    return 'entrega';
  }
  if (msg.match(/product|comida|calidad|sabor|fr[ií]|caliente|mal estado/)) {
    return 'producto';
  }
  if (msg.match(/quej|reclam|problem|mal|insatisfech|pésim/)) {
    return 'queja';
  }
  if (msg.match(/cancel|devol|reem|anular/)) {
    return 'cancelacion';
  }
  if (msg.match(/pedid|orden|compra/)) {
    return 'pedido';
  }

  // Check context
  if (contextInfo?.hasRecentOrder) {
    return 'consulta_pedido';
  }

  return 'otro';
}

/**
 * Calculate resolution time in minutes
 */
function calculateResolutionTime(startTime) {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = now - start;
  return Math.round(diffMs / 60000); // Convert to minutes
}

module.exports = {
  logInteraction,
  logNPSScore,
  logCSATScore,
  initializeSheet,
  createKPISummarySheet,
  detectInquiryType,
  calculateResolutionTime,
  SPREADSHEET_ID,
};
