require("dotenv").config();
const axios = require("axios");

const sendWhatsAppMessage = async (phone, message) => {
  try {
    const formattedPhone = `+${phone}`; // Add + symbol to the phone number
    const formattedMessage = message.replace(/ /g, "+");
    const response = await axios.get(
      `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${formattedMessage}&apikey=${process.env.WHATSAPPBOT_API}`
    );
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
};

module.exports = sendWhatsAppMessage;
