const sendEmail = require("../utils/sendEmail");
const sendTelegramMessage=require('../utils/sendTelegramMessage')

// async function testSendEmail() {
//   try {
//     await sendEmail(
//       "sunlightsam829@gmail.com",
//       "Test Subject",
//       "This is the content of the email"
//     );
//     console.log("Send emal");
//   } catch (error) {
//     console.log(error);
//   }
// }
// testSendEmail()

// async function testSendTelegram() {
//   try {
//     await sendTelegramMessage(
//       "7160502868",
//       'Test send telegram message'
//     );
//     console.log("Send tele");
//   } catch (error) {
//     console.log(error);
//   }
// }
// testSendTelegram()