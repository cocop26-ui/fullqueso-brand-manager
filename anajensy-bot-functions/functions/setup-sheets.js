/**
 * Setup Script for Google Sheets KPI Tracking
 *
 * Run this script once to:
 * 1. Create Google Sheet structure
 * 2. Set up header rows
 * 3. Create KPI summary formulas
 * 4. Configure formatting
 *
 * Usage:
 *   GCLOUD_PROJECT=fullqueso-bot node setup-sheets.js
 */

const admin = require('firebase-admin');
const { google } = require('googleapis');

// Get Firebase config from environment
const projectId = process.env.GCLOUD_PROJECT || 'fullqueso-bot';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = require('/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
    });
    console.log('✓ Initialized with service account credentials\n');
  } catch (error) {
    admin.initializeApp({
      projectId: projectId,
    });
    console.log('✓ Initialized with default credentials\n');
  }
}

// IMPORTANT: Set your Spreadsheet ID here
// Create a new Google Sheet manually and paste the ID here
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID || 'PASTE_YOUR_SPREADSHEET_ID_HERE';

const INTERACTIONS_SHEET = 'Interacciones';
const KPI_SUMMARY_SHEET = 'KPI_Resumen';
const CHARTS_SHEET = 'Dashboards';

async function setupGoogleSheet() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         Google Sheets KPI Tracker Setup                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  if (SPREADSHEET_ID === 'PASTE_YOUR_SPREADSHEET_ID_HERE') {
    console.error('❌ ERROR: Please set SPREADSHEET_ID first!');
    console.error('');
    console.error('Steps:');
    console.error('1. Go to: https://sheets.google.com');
    console.error('2. Create a new blank spreadsheet');
    console.error('3. Name it: "Ana WhatsApp Bot - KPI Tracking"');
    console.error('4. Copy the ID from the URL:');
    console.error('   https://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit');
    console.error('5. Paste it in this script or set SHEETS_SPREADSHEET_ID env var');
    console.error('');
    process.exit(1);
  }

  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      keyFile: '/Users/pedropadilla/Downloads/fullqueso-bot-firebase-adminsdk-fbsvc-1859737460.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log(`📊 Setting up spreadsheet: ${SPREADSHEET_ID}`);
    console.log('');

    // Step 1: Create sheets/tabs
    console.log('📄 Step 1: Creating sheet tabs...');
    await createSheetTabs(sheets);

    // Step 2: Set up Interacciones sheet
    console.log('📋 Step 2: Setting up Interacciones sheet...');
    await setupInteraccionesSheet(sheets);

    // Step 3: Set up KPI Summary sheet
    console.log('📊 Step 3: Setting up KPI Summary sheet...');
    await setupKPISummarySheet(sheets);

    // Step 4: Set up Charts/Dashboard sheet
    console.log('📈 Step 4: Setting up Dashboard sheet...');
    await setupDashboardSheet(sheets);

    // Step 5: Share with service account
    console.log('🔐 Step 5: Configuring permissions...');
    await configurePermissions(sheets);

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    Setup Completed!                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('✅ Google Sheet is ready for data logging');
    console.log('');
    console.log('📊 View your sheet:');
    console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Set SHEETS_SPREADSHEET_ID in Firebase functions config:');
    console.log(`   firebase functions:config:set sheets.spreadsheet_id="${SPREADSHEET_ID}"`);
    console.log('2. Deploy functions: firebase deploy --only functions');
    console.log('3. Test with a sample interaction');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function createSheetTabs(sheets) {
  try {
    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

    const requests = [];

    // Create Interacciones sheet if doesn't exist
    if (!existingSheets.includes(INTERACTIONS_SHEET)) {
      requests.push({
        addSheet: {
          properties: {
            title: INTERACTIONS_SHEET,
            gridProperties: {
              frozenRowCount: 1,
              columnCount: 16,
            },
          },
        },
      });
    }

    // Create KPI Summary sheet
    if (!existingSheets.includes(KPI_SUMMARY_SHEET)) {
      requests.push({
        addSheet: {
          properties: {
            title: KPI_SUMMARY_SHEET,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      });
    }

    // Create Dashboard sheet
    if (!existingSheets.includes(CHARTS_SHEET)) {
      requests.push({
        addSheet: {
          properties: {
            title: CHARTS_SHEET,
          },
        },
      });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests },
      });
      console.log(`  ✓ Created ${requests.length} sheet tabs`);
    } else {
      console.log('  ✓ All sheets already exist');
    }
  } catch (error) {
    console.error('  ❌ Error creating tabs:', error.message);
    throw error;
  }
}

async function setupInteraccionesSheet(sheets) {
  try {
    // Headers for main data sheet
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

    // Write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INTERACTIONS_SHEET}!A1:P1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    // Format header row
    const sheetId = await getSheetId(sheets, INTERACTIONS_SHEET);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 11 },
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 16,
              },
            },
          },
        ],
      },
    });

    console.log('  ✓ Headers created and formatted');
  } catch (error) {
    console.error('  ❌ Error setting up Interacciones:', error.message);
    throw error;
  }
}

async function setupKPISummarySheet(sheets) {
  try {
    const kpiData = [
      ['KPI', 'Fórmula', 'Valor Actual', 'Meta', 'Estado'],
      [
        'NPS (Net Promoter Score)',
        `=(COUNTIF(${INTERACTIONS_SHEET}!N:N,">=9")-COUNTIF(${INTERACTIONS_SHEET}!N:N,"<=6"))/COUNTA(${INTERACTIONS_SHEET}!N:N)*100`,
        '',
        '> 50',
        '=IF(C2>50,"✅","❌")',
      ],
      [
        'CSAT (% Satisfechos 4-5⭐)',
        `=COUNTIFS(${INTERACTIONS_SHEET}!O:O,">=4")/COUNTA(${INTERACTIONS_SHEET}!O:O)*100`,
        '',
        '> 80%',
        '=IF(C3>80,"✅","⚠️")',
      ],
      [
        'Tiempo Promedio 1ra Respuesta (seg)',
        `=AVERAGE(${INTERACTIONS_SHEET}!L:L)`,
        '',
        '< 30',
        '=IF(C4<30,"✅","❌")',
      ],
      [
        'Tiempo Promedio Resolución (min)',
        `=AVERAGE(${INTERACTIONS_SHEET}!K:K)`,
        '',
        '< 5',
        '=IF(C5<5,"✅","⚠️")',
      ],
      [
        'Tasa Resolución sin Escalado (%)',
        `=COUNTIF(${INTERACTIONS_SHEET}!J:J,"resuelto")/COUNTA(${INTERACTIONS_SHEET}!J:J)*100`,
        '',
        '> 80%',
        '=IF(C6>80,"✅","❌")',
      ],
      [
        'Tasa Respuesta Encuestas (%)',
        `=COUNTA(${INTERACTIONS_SHEET}!N:N)/COUNTA(${INTERACTIONS_SHEET}!B:B)*100`,
        '',
        '> 30%',
        '=IF(C7>30,"✅","⚠️")',
      ],
      [],
      ['ESTADÍSTICAS ADICIONALES'],
      ['Total Conversaciones', `=COUNTA(${INTERACTIONS_SHEET}!B:B)-1`, '', '', ''],
      ['Conversaciones Hoy', `=COUNTIF(${INTERACTIONS_SHEET}!A:A,">="&TODAY())`, '', '', ''],
      ['Sentiment Positivo', `=COUNTIF(${INTERACTIONS_SHEET}!I:I,"positivo")`, '', '', ''],
      ['Sentiment Negativo', `=COUNTIF(${INTERACTIONS_SHEET}!I:I,"negativo")`, '', '', ''],
      ['Requieren Seguimiento', `=COUNTIF(${INTERACTIONS_SHEET}!M:M,"sí")`, '', '', ''],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${KPI_SUMMARY_SHEET}!A1:E14`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: kpiData,
      },
    });

    // Format KPI sheet
    const sheetId = await getSheetId(sheets, KPI_SUMMARY_SHEET);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                },
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 5,
              },
            },
          },
        ],
      },
    });

    console.log('  ✓ KPI formulas and formatting applied');
  } catch (error) {
    console.error('  ❌ Error setting up KPI Summary:', error.message);
    throw error;
  }
}

async function setupDashboardSheet(sheets) {
  try {
    const instructions = [
      ['INSTRUCCIONES PARA CREAR DASHBOARD'],
      [''],
      ['Este sheet está preparado para conectarse a Looker Studio (Google Data Studio)'],
      [''],
      ['Pasos para crear tu dashboard:'],
      ['1. Ve a: https://lookerstudio.google.com'],
      ['2. Crea un nuevo informe'],
      ['3. Conecta esta hoja de cálculo como fuente de datos'],
      ['4. Usa la pestaña "Interacciones" para gráficos detallados'],
      ['5. Usa la pestaña "KPI_Resumen" para métricas principales'],
      [''],
      ['Gráficos sugeridos:'],
      ['- Línea de tiempo: NPS y CSAT por semana'],
      ['- Barras: Distribución por inquiry_type'],
      ['- Gauge: KPIs principales vs metas'],
      ['- Tabla de calor: Horas pico de consultas'],
      ['- Tabla: Últimas 10 conversaciones'],
      [''],
      ['Filtros sugeridos:'],
      ['- Rango de fechas'],
      ['- Tipo de consulta (inquiry_type)'],
      ['- Sentiment (positivo/negativo/neutral)'],
      ['- Estado de resolución'],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CHARTS_SHEET}!A1:A20`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: instructions,
      },
    });

    console.log('  ✓ Dashboard instructions added');
  } catch (error) {
    console.error('  ❌ Error setting up Dashboard:', error.message);
    throw error;
  }
}

async function configurePermissions(sheets) {
  console.log('  ⚠️  Manual step required:');
  console.log('  Share the Google Sheet with the service account email:');
  console.log('  fullqueso-bot@appspot.gserviceaccount.com');
  console.log('  Give it "Editor" permissions');
}

async function getSheetId(sheets, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = spreadsheet.data.sheets.find(
      s => s.properties.title === sheetName
  );

  return sheet?.properties.sheetId || 0;
}

// Run setup
setupGoogleSheet();
