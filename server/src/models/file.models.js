import mongoose, { Schema } from "mongoose";

const accessLogSchema = new Schema(
  {
    action: {
      type: String,
      enum: ["view", "download", "print", "qr_open", "verify_password"],
      required: true,
    },
    actorLabel: {
      type: String,
      default: "Anonymous",
    },
    ipAddress: String,
    userAgent: String,
    outcome: {
      type: String,
      enum: ["allowed", "blocked", "expired", "invalid_password"],
      default: "allowed",
    },
    occurredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const watermarkSchema = new Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    template: {
      type: String,
      default: "Printed via DocShield",
    },
  },
  { _id: false }
);

const fileSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    storageProvider: {
      type: String,
      enum: ["cloudinary"],
      default: "cloudinary",
    },
    resourceType: {
      type: String,
      default: "raw",
    },
    format: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    downloadedContent: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    printCount: {
      type: Number,
      default: 0,
    },
    qrOpenCount: {
      type: Number,
      default: 0,
    },
    shareChannel: {
      type: String,
      enum: ["link", "qr", "email", "whatsapp", "print_shop"],
      default: "link",
    },
    documentCategory: {
      type: String,
      enum: [
        "aadhaar",
        "pan",
        "resume",
        "legal",
        "certificate",
        "bank_document",
        "contract",
        "confidential_pdf",
        "other",
      ],
      default: "other",
    },
    accessMode: {
      type: String,
      enum: ["view_only", "print_only", "download_allowed"],
      default: "view_only",
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    hasExpiry: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "archived"],
      default: "active",
    },
    shortCode: {
      type: String,
      index: true,
    },
    shortUrl: {
      type: String,
      default: null,
    },
    recipientEmail: String,
    backupProvider: {
      type: String,
      enum: ["cloudinary", "portable_storage"],
      default: "cloudinary",
    },
    otpEnabled: {
      type: Boolean,
      default: false,
    },
    paymentPlan: {
      type: String,
      enum: ["starter", "growth", "scale", "enterprise"],
      default: "starter",
    },
    lastAccessedAt: Date,
    watermark: {
      type: watermarkSchema,
      default: () => ({}),
    },
    accessLogs: {
      type: [accessLogSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const File = mongoose.model("File", fileSchema);
