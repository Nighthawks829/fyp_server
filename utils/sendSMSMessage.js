// Load environment variables from .env file
require("dotenv").config();

// Import required libraries
const twillio = require("twilio");    // Twilio SDK for SMS/voice communications

// Twilio API credentials from environment variables
// Twilio account identifier
const accountSid = process.env.TWILIO_ACCOUNT_SID;
// Twilio authentication token
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize Twilio client with credentials
const client = twillio(accountSid, authToken);

/**
 * Send SMS Message via Twilio API
 * @param {string} phone - Recipient phone number (without + prefix)
 * @param {string} message - SMS text content
 * @returns {Promise<void>} - Async operation result
 */
const sendSMSMessage = async (phone, message) => {
  try {
    // Format phone number to E.164 standard
    const formattedPhone = `+${phone}`;   // Prepend country code prefix

    // Create and send SMS message through Twilio
    const smsMessage = await client.messages.create({
      body: message,    // SMS content (max 1600 characters)
      from: process.env.TWILIO_PHONE_NUMBER,  // Twilio-provisioned phone number
      to: formattedPhone    // Recipient's formatted phone number
    });

    // Log successful message SID and status
    console.log(smsMessage.body);
  } catch (error) {
    // Handle errors gracefully
    console.log("Error sending SMS message: ", error);
    // Consider throwing error for upstream error handling
  }
};

module.exports = sendSMSMessage;
