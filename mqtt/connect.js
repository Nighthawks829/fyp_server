const mqtt = require("mqtt");
const axios = require("axios");

const SensorData = require("../models/SensorData");

require("dotenv").config();

const protocol = process.env.MQTT_PROTOCOL;
const host = process.env.MQTT_HOST;
const port = process.env.MQTT_PORT;
// const clientId = process.env.MQTT_ClientID;
const clientId = `backend_${Math.random().toString(16).slice(3)}`;

const connectUrl = `${protocol}://${host}:${port}`;

const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;

let client = mqtt.connect(connectUrl, {
  clientId: clientId,
  clean: true,
  connectTimeout: 4000,
  username: username,
  password: password,
  reconnectPeriod: 1000,
});

client.on("connect", mqtt_connect);
client.on("reconnect", mqtt_reconnect);
client.on("error", mqtt_error);
client.on("message", mqtt_messageReceived);
client.on("close", mqtt_close);

const topic = "#"; // subscribe to all topics

function mqtt_connect() {
  console.log("Connecting MQTT Broker at", host);
  client.subscribe(topic, mqtt_subscribe);
}

function mqtt_subscribe(err, granted) {
  console.log("Subscribe to ", topic);
  if (err) {
    console.log(err);
  }
}

function mqtt_reconnect(err) {
  console.log("Reconnecting to MQTT Broker...");
  client = mqtt.connect(connectUrl, {
    clientId: clientId,
    clean: true,
    connectTimeout: 400,
    username: username,
    password: password,
    reconnectPeriod: 1000,
  });
}

function mqtt_error(err) {
  console.error("connection failed", err);
}

function mqtt_close() {
  console.log("Close MQTT");
}

// receive a message from MQTT broker
function mqtt_messageReceived(topic, payload) {
  // console.log("Received Message: ", topic, payload.toString());

  // Parse the payload string into a JavaScript object
  let data = JSON.parse(payload.toString());

  // Print the unit and value
  // console.log("Unit:", data.unit);
  // console.log("Value:", data.value);

    insert_message(topic, data);
}

async function insert_message(topic, data) {
  try {
    const response = await axios.post("http://192.168.0.110:3001/api/v1/SensorData/", {
      topic: topic,
      unit: data.unit,
      data: data.value,
    });
  } catch (error) {
    console.log("Failed to insert data");
    console.log(error);
  }
}

module.exports = client;
