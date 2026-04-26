import mongoose, { Schema } from "mongoose";

const guestAccessLogSchema = new Schema(
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

const guestFileSchema = new Schema(
  {
    path: { type: String, required: true },
    storageKey: { type: String, required: true },
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
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    downloadedContent: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    printCount: { type: Number, default: 0 },
    qrOpenCount: { type: Number, default: 0 },
    accessMode: {
      type: String,
      enum: ["view_only", "print_only", "download_allowed"],
      default: "view_only",
    },
    shareChannel: {
      type: String,
      enum: ["link", "qr", "email", "whatsapp", "print_shop"],
      default: "link",
    },
    documentCategory: {
      type: String,
      default: "other",
    },
    isPasswordProtected: { type: Boolean, default: false },
    password: { type: String, default: null },
    hasExpiry: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "archived"],
      default: "active",
    },
    shortCode: {
      type: String,
      index: true,
    },
    shortUrl: { type: String, default: null },
    watermarkLabel: {
      type: String,
      default: "Printed via DocShield",
    },
    accessLogs: {
      type: [guestAccessLogSchema],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const GuestFile = mongoose.model("GuestFile", guestFileSchema);
