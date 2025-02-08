// Load environment variables from .env file
require("dotenv").config();

// Import Axios for HTTP requests
const axios = require("axios");

/**
 * Send WhatsApp Message via CallMeBot API
 * @param {string} phone - Recipient phone number (without country code prefix)
 * @param {string} message - Text message to send
 * @returns {Promise<void>} - Async operation result
 * 
 * Note: Uses CallMeBot's unofficial API (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
 * Important: Service limitations apply - review CallMeBot's terms before production use
 */
const sendWhatsAppMessage = async (phone, message) => {
  try {
    // Format phone number with country code prefix
    const formattedPhone = `+${phone}`; // Add + symbol to the phone number

    // Basic URL encoding by replacing spaces with +
    const formattedMessage = message.replace(/ /g, "+");

    // Make GET request to CallMeBot API
    const response = await axios.get(
      `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${formattedMessage}&apikey=${process.env.WHATSAPPBOT_API}`
    );
  } catch (error) {
    // Handle errors gracefully
    console.error("Error sending WhatsApp message:", error);
    // Consider throwing error for upstream error handling
  }
};

module.exports = sendWhatsAppMessage;
