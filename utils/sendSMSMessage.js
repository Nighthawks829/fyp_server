require("dotenv").config();
const axios = require("axios");
const twillio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twillio(accountSid, authToken);

const sendSMSMessage = async (phone, message) => {
  try {
    const formattedPhone = `+${phone}`; // Add + symbol to the phone number
    const smsMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    console.log(smsMessage.body);
  } catch (error) {
    console.log("Error sending SMS message: ", error);
  }
};

module.exports = sendSMSMessage;
