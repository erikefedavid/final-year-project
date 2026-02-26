import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    cloudinaryId: {
      type: String,
      default: "",
    },
    extractedText: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    summaryType: {
      type: String,
      default: "detailed",
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    processingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Document || mongoose.model("Document", documentSchema);