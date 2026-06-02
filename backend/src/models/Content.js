const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["text", "document", "video"], required: true },
  contentOrUrl: { type: String, required: true },
  order: { type: Number, required: true },
  required: { type: Boolean, default: true },
});

module.exports = mongoose.model("Content", contentSchema);