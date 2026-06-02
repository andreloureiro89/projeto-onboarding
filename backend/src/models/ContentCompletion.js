const mongoose = require("mongoose");

const contentCompletionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
}, { timestamps: true });

contentCompletionSchema.index({ userId: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model("ContentCompletion", contentCompletionSchema);