const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  active: { type: Boolean, default: true },
  required: { type: Boolean, default: true },
});

module.exports = mongoose.model("Quiz", quizSchema);