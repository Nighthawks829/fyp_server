const mqtt = require("mqtt");   // Import MQTT library
const axios = require("axios");   // Import Axios for making HTTP requests

// Import the SensorData model
const SensorData = require("../models/SensorData");

// Load MQTT configuration from environment variables
require("dotenv").config();

// Load MQTT configuration from environment variables
const protocol = process.env.MQTT_PROTOCOL; // MQTT protocol (e.g., mqtt, mqtts, ws, wss)
const host = process.env.MQTT_HOST;   // MQTT broker host
const port = process.env.MQTT_PORT;   // MQTT broker port

// Generate a unique client ID for the MQTT connection
// This helps to avoid conflicts if multiple instances are running
const clientId = `backend_${Math.random().toString(16).slice(3)}`;

// Construct the MQTT broker connection URL
const connectUrl = `${protocol}://${host}:${port}`;

// Load MQTT authentication credentials
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;

// Create an MQTT client and establish a connection
let client = mqtt.connect(connectUrl, {
  clientId: clientId,
  clean: true,              // Ensures a fresh session on each connection
  keepalive: 60,            // Keepalive interval in seconds
  connectTimeout: 10000,    // Connection timeout in milliseconds
  username: username,       // Username for authentication
  password: password,       // Password for authentication
  reconnectPeriod: 3000,    // Reconnect interval in milliseconds
});

// Set up event handlers for MQTT client
client.on("connect", mqtt_connect);           // Handle successful connection
client.on("reconnect", mqtt_reconnect);       // Handle reconnection attempts
client.on("error", mqtt_error);               // Handle connection errors
client.on("message", mqtt_messageReceived);   // Handle incoming messages
client.on("close", mqtt_close);               // Handle connection closure

const topic = "#";    // Subscribe to all available topics

// Function to handle successful connection to the MQTT broker
function mqtt_connect() {
  console.log("Connecting MQTT Broker at", host);
  client.subscribe(topic, mqtt_subscribe);
}

// Function to handle subscription confirmation
function mqtt_subscribe(err, granted) {
  console.log("Subscribe to ", topic);
  if (err) {
    console.log(err);
  }
}

// Function to handle reconnection attempts
function mqtt_reconnect(err) {
  console.log("Reconnecting to MQTT Broker...");
}

// Function to handle MQTT connection errors
function mqtt_error(err) {
  console.error("connection failed", err);
}

// Function to handle connection closure
function mqtt_close() {
  console.log("Close MQTT");
}

// Function to handle incoming MQTT messages
function mqtt_messageReceived(topic, payload) {
  // console.log("Received Message: ", topic, payload.toString());

  // Convert the received payload into a JavaScript object
  let data = JSON.parse(payload.toString());

  // Print the unit and value
  // console.log("Unit:", data.unit);
  // console.log("Value:", data.value);

  // Insert the received data into the database
  insert_message(topic, data);
}

// Function to insert received sensor data into the backend API
async function insert_message(topic, data) {
  try {
    const response = await axios.post("http://192.168.0.110:3001/api/v1/SensorData/", {
      topic: topic,       // MQTT topic from which the data was received
      unit: data.unit,    // Measurement unit of the sensor data
      data: data.value,   // Sensor value
    });
  } catch (error) {
    console.log("Failed to insert data");
    console.log(error);
  }
}

// Export the MQTT client for use in other parts of the application
module.exports = client;
