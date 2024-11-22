const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

const sendTelegramMessage = async (chatId, message) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log("Telegram message send successfully");
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
};

module.exports = sendTelegramMessage;
