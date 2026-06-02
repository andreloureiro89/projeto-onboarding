const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: { type: Object, required: true },
  score: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Attempt", attemptSchema);