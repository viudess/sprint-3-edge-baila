// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const Telemetry = require("./models/Telemetry");

const PORT = process.env.PORT || 4000;
const MQTT_HOST = process.env.MQTT_HOST || "localhost";
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const MQTT_URL = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/iot_athletes";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// MQTT client
const client = mqtt.connect(MQTT_URL);

client.on("connect", () => {
  console.log("Connected to MQTT broker:", MQTT_URL);
  // subscribe to all athlete telemetry topics
  client.subscribe("athlete/+/telemetry", err => {
    if (err) console.error("Subscribe error:", err);
    else console.log("Subscribed to athlete/+/telemetry");
  });
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    // Basic validation
    if (!payload.athlete_id) {
      const parts = topic.split("/");
      payload.athlete_id = parts[1] || "unknown";
    }
    const doc = new Telemetry({
      athlete_id: payload.athlete_id,
      timestamp: payload.timestamp || Date.now() / 1000,
      heartbeat: payload.heartbeat,
      speed_kmh: payload.speed_kmh,
      distance_m: payload.distance_m
    });
    await doc.save();

    // Emit via websocket to clients listening to this athlete
    io.to(payload.athlete_id).emit("telemetry", doc);
    console.log("Saved telemetry:", payload.athlete_id, payload.timestamp);
  } catch (err) {
    console.error("Error handling MQTT message:", err);
  }
});

// REST endpoints

// Get latest telemetry for an athlete
app.get("/api/athletes/:id/latest", async (req, res) => {
  const id = req.params.id;
  try {
    const latest = await Telemetry.findOne({ athlete_id: id }).sort({ timestamp: -1 }).lean();
    res.json(latest || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get history (last N readings)
app.get("/api/athletes/:id/history", async (req, res) => {
  const id = req.params.id;
  const limit = Math.min(1000, parseInt(req.query.limit || "100"));
  try {
    const items = await Telemetry.find({ athlete_id: id }).sort({ timestamp: -1 }).limit(limit).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io: join rooms by athlete id for real-time updates
io.on("connection", socket => {
  console.log("Socket connected:", socket.id);
  socket.on("join", athlete_id => {
    socket.join(athlete_id);
    console.log(`Socket ${socket.id} joined room ${athlete_id}`);
  });
  socket.on("leave", athlete_id => {
    socket.leave(athlete_id);
    console.log(`Socket ${socket.id} left room ${athlete_id}`);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
