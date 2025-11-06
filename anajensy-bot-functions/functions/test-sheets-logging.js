/**
 * Test Script for Google Sheets KPI Logging
 *
 * This script tests the complete KPI logging system:
 * 1. Verifies Google Sheets API connection
 * 2. Logs a test interaction
 * 3. Updates NPS and CSAT scores
 * 4. Verifies data appears in Sheet
 *
 * Usage:
 *   GCLOUD_PROJECT=fullqueso-bot node test-sheets-logging.js
 */

const admin = require('firebase-admin');
const sheetsLogger = require('./sheets-logger');

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

async function testSheetsLogging() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         Google Sheets KPI Logging - Test Script             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Check if SPREADSHEET_ID is configured
    if (!sheetsLogger.SPREADSHEET_ID || sheetsLogger.SPREADSHEET_ID === '') {
      console.error('❌ ERROR: SPREADSHEET_ID not configured!');
      console.error('');
      console.error('Please set it using:');
      console.error('  firebase functions:config:set sheets.spreadsheet_id="YOUR_ID"');
      console.error('');
      console.error('Or edit functions/sheets-logger.js line 11');
      process.exit(1);
    }

    console.log(`📊 Testing with Spreadsheet ID: ${sheetsLogger.SPREADSHEET_ID}`);
    console.log('');

    // Test 1: Log a sample interaction
    console.log('🧪 Test 1: Logging sample interaction...');

    const testConversationId = `test_${Date.now()}`;
    const testData = {
      conversationId: testConversationId,
      customerPhone: '584241476748',
      customerName: 'Pedro (Test)',
      orderNumber: 'FQ-TEST-' + Date.now(),
      inquiryType: 'producto',
      customerMessage: 'Los churros estaban deliciosos!',
      agentResponse: '¡Ay qué fino! Dime, ¿estaban calientitos? ¿El choco arequipe estaba en su punto?',
      sentimentDetected: 'positivo',
      resolutionStatus: 'resuelto',
      resolutionTimeMinutes: 3.5,
      firstResponseTimeSeconds: 2,
      requiresFollowup: 'no',
      npsScore: null,
      csatScore: null,
      notes: 'TEST INTERACTION - Cliente muy satisfecho con producto',
    };

    const logSuccess = await sheetsLogger.logInteraction(testData);

    if (logSuccess) {
      console.log('  ✅ Interaction logged successfully!');
    } else {
      console.log('  ⚠️  Logging failed - check backup in Cloud Storage');
    }
    console.log('');

    // Wait 2 seconds
    console.log('⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('');

    // Test 2: Update NPS score
    console.log('🧪 Test 2: Updating NPS score...');

    const npsSuccess = await sheetsLogger.logNPSScore(testConversationId, 9);

    if (npsSuccess) {
      console.log('  ✅ NPS score updated successfully! (Score: 9)');
    } else {
      console.log('  ⚠️  NPS update failed - conversation may not exist yet');
    }
    console.log('');

    // Wait 2 seconds
    console.log('⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('');

    // Test 3: Update CSAT score
    console.log('🧪 Test 3: Updating CSAT score...');

    const csatSuccess = await sheetsLogger.logCSATScore(testConversationId, 5);

    if (csatSuccess) {
      console.log('  ✅ CSAT score updated successfully! (Score: 5/5 stars)');
    } else {
      console.log('  ⚠️  CSAT update failed - conversation may not exist yet');
    }
    console.log('');

    // Test 4: Test inquiry type detection
    console.log('🧪 Test 4: Testing inquiry type detection...');

    const tests = [
      { msg: 'Mi pedido no llegó', expected: 'entrega' },
      { msg: 'Los tequeños estaban fríos', expected: 'producto' },
      { msg: 'Tengo una queja sobre el servicio', expected: 'queja' },
      { msg: 'Quiero cancelar mi orden', expected: 'cancelacion' },
      { msg: 'Hola, buenas tardes', expected: 'otro' },
    ];

    for (const test of tests) {
      const detected = sheetsLogger.detectInquiryType(test.msg, {});
      const match = detected === test.expected ? '✅' : '❌';
      console.log(`  ${match} "${test.msg}" → ${detected} (expected: ${test.expected})`);
    }
    console.log('');

    // Test 5: Test resolution time calculation
    console.log('🧪 Test 5: Testing resolution time calculation...');

    const startTime = new Date(Date.now() - 3.5 * 60 * 1000); // 3.5 minutes ago
    const resolutionTime = sheetsLogger.calculateResolutionTime(startTime);
    const match = Math.abs(resolutionTime - 3.5) < 0.5 ? '✅' : '❌';

    console.log(`  ${match} Resolution time: ${resolutionTime} minutes (expected: ~3.5)`);
    console.log('');

    // Final instructions
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    Tests Completed!                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 Verify results in Google Sheets:');
    console.log(`   https://docs.google.com/spreadsheets/d/${sheetsLogger.SPREADSHEET_ID}/edit`);
    console.log('');
    console.log('You should see:');
    console.log('  ✓ A new row in "Interacciones" sheet');
    console.log('  ✓ Conversation ID: ' + testConversationId);
    console.log('  ✓ NPS Score: 9');
    console.log('  ✓ CSAT Score: 5');
    console.log('  ✓ Sentiment: positivo');
    console.log('  ✓ Resolution Status: resuelto');
    console.log('');
    console.log('📈 Check "KPI_Resumen" sheet to see updated KPIs');
    console.log('');

    if (!logSuccess) {
      console.log('⚠️  Logging to Sheets failed. Check backup:');
      console.log('   gsutil ls gs://fullqueso-bot.appspot.com/sheets-backup/');
      console.log('');
    }

    console.log('🎯 Next steps:');
    console.log('  1. Verify data in Google Sheets');
    console.log('  2. If data appears correctly, system is working!');
    console.log('  3. If not, check troubleshooting in QUICK_START_KPI.md');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Test failed with error:');
    console.error(error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('  1. Verify SPREADSHEET_ID is correct');
    console.error('  2. Check service account has "Editor" permissions on Sheet');
    console.error('  3. Ensure sheet has "Interacciones" tab');
    console.error('  4. Run setup-sheets.js if sheet is not initialized');
    console.error('');
    process.exit(1);
  }
}

// Run tests
testSheetsLogging();
