#!/usr/bin/env node

/**
 * Test script to verify Meta WhatsApp API token
 * Run: node test-meta-api.js YOUR_TOKEN YOUR_TEST_PHONE
 */

const axios = require('axios');

const PHONE_NUMBER_ID = "805718575964429";
const API_VERSION = "v21.0";

async function testMetaAPI() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('❌ Usage: node test-meta-api.js YOUR_ACCESS_TOKEN YOUR_TEST_PHONE');
    console.error('   Example: node test-meta-api.js EAA... 584168542395');
    process.exit(1);
  }

  const accessToken = args[0];
  const testPhone = args[1];

  console.log('🧪 Testing Meta WhatsApp API...\n');
  console.log(`📱 Phone Number ID: ${PHONE_NUMBER_ID}`);
  console.log(`📞 Test Phone: ${testPhone}`);
  console.log(`🔑 Token: ${accessToken.substring(0, 20)}...`);
  console.log('');

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

    console.log('📤 Sending test message...');

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: testPhone,
        type: "text",
        text: {
          body: "🧪 Test de Ana - Full Queso. Este es un mensaje de prueba del sistema. Si recibes esto, ¡la integración funciona!"
        }
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log('\n✅ SUCCESS! Message sent successfully!');
    console.log('');
    console.log('📊 Response Details:');
    console.log(`   Message ID: ${response.data.messages[0].id}`);
    console.log(`   Contact: ${response.data.contacts[0].wa_id}`);
    console.log('');
    console.log('✅ Your Meta API token is working correctly!');
    console.log('✅ You can proceed with Firebase deployment.');
    console.log('');
    console.log('📱 Check WhatsApp on', testPhone, 'to confirm message received.');

  } catch (error) {
    console.error('\n❌ ERROR: Test failed!');
    console.error('');

    if (error.response) {
      console.error('Error Response:');
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      console.error('');

      // Provide specific error guidance
      if (error.response.status === 401 || error.response.status === 190) {
        console.error('🔴 ISSUE: Invalid or expired access token');
        console.error('');
        console.error('Solutions:');
        console.error('1. Go to https://developers.facebook.com/apps/1496108368096420/');
        console.error('2. Click WhatsApp → API Setup');
        console.error('3. Generate a new access token');
        console.error('4. Try this test again with the new token');
      } else if (error.response.status === 403) {
        console.error('🔴 ISSUE: Permission denied');
        console.error('');
        console.error('Solutions:');
        console.error('1. Verify your token has whatsapp_business_messaging permission');
        console.error('2. Check that WhatsApp product is added to your app');
      } else if (error.response.data?.error?.code === 131047) {
        console.error('🔴 ISSUE: Message throttled or recipient not allowed');
        console.error('');
        console.error('Solutions:');
        console.error('1. Add', testPhone, 'to allowed recipients in Meta Console');
        console.error('2. Or wait for business verification to message any number');
      } else if (error.response.data?.error?.code === 131030) {
        console.error('🔴 ISSUE: Recipient phone number not in allowed list');
        console.error('');
        console.error('Solutions:');
        console.error('1. Go to https://developers.facebook.com/apps/1496108368096420/');
        console.error('2. Click WhatsApp → API Setup');
        console.error('3. Add', testPhone, 'to the allowed phone numbers list');
      } else if (error.response.data?.error?.code === 100) {
        console.error('🔴 ISSUE: Invalid phone number ID or format');
        console.error('');
        console.error('Solutions:');
        console.error('1. Verify Phone Number ID is correct: 805718575964429');
        console.error('2. Check phone format is international without + (e.g., 584168542395)');
      }
    } else if (error.request) {
      console.error('🔴 ISSUE: No response from Meta API');
      console.error('');
      console.error('Check your internet connection and try again.');
    } else {
      console.error('Error:', error.message);
    }

    console.error('');
    console.error('❌ Fix the errors above before deploying to Firebase.');
    process.exit(1);
  }
}

testMetaAPI();
