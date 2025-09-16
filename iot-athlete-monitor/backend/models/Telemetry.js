// models/Telemetry.js
const mongoose = require("mongoose");

const TelemetrySchema = new mongoose.Schema({
  athlete_id: { type: String, required: true, index: true },
  timestamp: { type: Number, required: true, index: true },
  heartbeat: { type: Number, required: true },
  speed_kmh: { type: Number, required: true },
  distance_m: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Telemetry", TelemetrySchema);
