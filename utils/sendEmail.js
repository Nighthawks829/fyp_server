// Import required modules
const nodemailer = require("nodemailer");   // Email sending library
require("dotenv").config();                 // Load environment variables

/**
 * Email Transporter Configuration
 * 
 * Creates a reusable transporter object using Gmail SMTP
 * Uses environment variables for secure credential storage
 */
const transporter = nodemailer.createTransport({
  service: "gmail",   // Use Gmail's SMTP server
  auth: {
    user: process.env.ADMIN_EMAIL_ADDRESS,    // Admin email from .env
    pass: process.env.ADMIN_EMAIL_PASSWORD,   // Admin email password from .env
  },
});

/**
 * Send Email Utility Function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text email content
 * @returns {Promise<void>} - Async operation result
 */
const sendEmail = async (to, subject, text) => {
  // Configure email message options
  const mailOptions = {
    from: process.env.ADMIN_EMAIL_ADDRESS,    // Verified sender address
    to: to,                                   // Recipient address(es)
    subject: subject,                         // Email subject
    text: text,                               // Plain text body
    // Can add 'html' property for HTML formatted emails
  };

  try {
    // Send email using configured transporter
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    // Handle errors gracefully
    console.log("Error sending email:", error);
    // Consider throwing error for upstream handling
  }
};

module.exports = sendEmail;
