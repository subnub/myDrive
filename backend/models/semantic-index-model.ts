import mongoose from "mongoose";

const SemanticIndexSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  fileKey: { type: String, required: true, index: true },
  tokens: [String],
  categories: [String],
  type: String,
  embedding: [Number],
  sentiment: String,
  summary: String,
  fullText: String, // For text: full text; for image/video: caption; for audio: transcript
});

export default mongoose.model("SemanticIndex", SemanticIndexSchema);