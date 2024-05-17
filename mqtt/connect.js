const mqtt = require("mqtt");
const axios = require("axios");

const SensorData = require("../models/SensorData");

require("dotenv").config();

const protocol = process.env.MQTT_PROTOCOL;
const host = process.env.MQTT_HOST;
const port = process.env.MQTT_PORT;
const clientId = process.env.MQTT_ClientID;

const connectUrl = `${protocol}://${host}:${port}`;

const username = process.env.MQTT_NAME;
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
  console.log("Connecting MQTT Broker at ", host);
  client.subscribe(topic, mqtt_subscribe);
}

function mqtt_subscribe(err, granted) {
  console.log("Subscribe to ", topic);
  if (err) {
    console.log(err);
  }
}

function mqtt_reconnect(err) {
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
  console.log("Received Message: ", topic, payload.toString());
  insert_message(topic, payload);
}

async function insert_message(topic, payload) {
  console.log("MQTT Insert Data");
  try {
    let value = payload.toString();
    const response = await axios.post("/api/v1/SensorData/", {
      topic: topic,
      value: value,
    });
  } catch (error) {
    console.log("Failed to insert data");
    console.log(error);
  }
}

module.exports = client;
