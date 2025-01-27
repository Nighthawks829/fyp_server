// Import required libraries
// Official Telegram Bot API library
const TelegramBot = require("node-telegram-bot-api");

// Initialize Telegram Bot with API token from environment variables
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Send Message to Telegram Chat
 * @param {string|number} chatId - Unique identifier for the target chat/channel
 * @param {string} message - Text message to send (supports Markdown formatting)
 * @returns {Promise<void>} - Async operation result
 */
const sendTelegramMessage = async (chatId, message) => {
  try {
    // Send message through Telegram Bot API
    await bot.sendMessage(chatId, message);

    // Log success with minimal details (avoid logging sensitive info)
    console.log("Telegram message send successfully");
  } catch (error) {
    // Handle errors gracefully
    console.error("Error sending Telegram message:", error);
    // Consider throwing error for upstream error handling
  }
};

module.exports = sendTelegramMessage;
