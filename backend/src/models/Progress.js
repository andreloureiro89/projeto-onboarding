const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  completionPercent: { type: Number, default: 0 },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  quizScore: { type: Number, default: 0 },
}, { timestamps: true });

progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);