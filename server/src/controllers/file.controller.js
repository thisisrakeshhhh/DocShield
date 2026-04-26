import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import nodemailer from "nodemailer";
import path from "path";
import QRCode from "qrcode";
import shortid from "shortid";
import { GuestFile } from "../models/guestFile.models.js";
import { File } from "../models/file.models.js";
import { User } from "../models/user.models.js";

const SHARE_BASE_URL = process.env.BASE_URL || "http://localhost:5173";

const buildShareUrl = (prefix, shortCode) => `${SHARE_BASE_URL}/${prefix}/${shortCode}`;

const isExpired = (file) => file.expiresAt && new Date(file.expiresAt) < new Date();

const normalizeExpiry = (hasExpiry, expiresAt) => {
  if (String(hasExpiry) === "false") {
    return { hasExpiry: false, expiresAt: null };
  }

  const hours = Number(expiresAt || 24);
  return {
    hasExpiry: true,
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
  };
};

const createAccessLog = (req, action, outcome = "allowed", actorLabel = "Anonymous") => ({
  action,
  actorLabel,
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || "unknown",
  outcome,
  occurredAt: new Date(),
});

const applyStatusForExpiry = (file) => {
  if (isExpired(file) && file.status !== "expired") {
    file.status = "expired";
  }
  return file.status;
};

const buildCloudinaryUrl = (file, { attachment = false } = {}) => {
  const options = {
    resource_type: file.resourceType || "raw",
    secure: true,
  };

  if (file.format) {
    options.format = file.format;
  }

  if (attachment) {
    options.flags = "attachment";
  }

  return cloudinary.url(file.storageKey, options);
};

const uploadToCloudinary = (fileBuffer, originalName) =>
  new Promise((resolve, reject) => {
    const extension = path.extname(originalName).replace(".", "").toLowerCase();
    const publicId = `docshield/${Date.now()}-${shortid.generate()}-${path
      .basename(originalName, path.extname(originalName))
      .replace(/\s+/g, "_")
      .toLowerCase()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "docshield",
        public_id: publicId,
        resource_type: "auto",
        use_filename: false,
        unique_filename: false,
        format: extension || undefined,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });

const serializeFile = (file, owner = null) => ({
  id: file._id,
  name: file.name,
  originalName: file.originalName || file.name,
  type: file.type,
  size: file.size,
  path: file.path,
  storageProvider: file.storageProvider,
  status: applyStatusForExpiry(file),
  shortCode: file.shortCode,
  shortUrl: file.shortUrl,
  accessMode: file.accessMode,
  documentCategory: file.documentCategory,
  shareChannel: file.shareChannel,
  hasExpiry: file.hasExpiry,
  expiresAt: file.expiresAt,
  isPasswordProtected: file.isPasswordProtected,
  downloadedContent: file.downloadedContent,
  viewCount: file.viewCount || 0,
  printCount: file.printCount || 0,
  qrOpenCount: file.qrOpenCount || 0,
  watermark: file.watermark,
  backupProvider: file.backupProvider,
  lastAccessedAt: file.lastAccessedAt,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
  uploadedBy: owner
    ? {
        id: owner._id,
        fullname: owner.fullname,
        email: owner.email,
      }
    : null,
});

const uploadSingleFile = async ({
  file,
  payload,
  ownerId,
  shortPrefix,
  model,
  createdBy,
}) => {
  const extension = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, extension).replace(/\s+/g, "_");
  const uniqueSuffix = shortid.generate();
  const finalFileName = `${baseName}_${uniqueSuffix}${extension}`;
  const shortCode = shortid.generate();
  const uploadResult = await uploadToCloudinary(file.buffer, finalFileName);
  const expiryMeta = normalizeExpiry(payload.hasExpiry, payload.expiresAt);

  const doc = new model({
    path: uploadResult.secure_url,
    storageKey: uploadResult.public_id,
    storageProvider: "cloudinary",
    resourceType: uploadResult.resource_type || "raw",
    format: uploadResult.format || extension.replace(".", "") || null,
    name: finalFileName,
    originalName: file.originalname,
    type: file.mimetype,
    size: file.size,
    accessMode: payload.accessMode || "view_only",
    shareChannel: payload.shareChannel || "link",
    documentCategory: payload.documentCategory || "other",
    shortCode,
    shortUrl: buildShareUrl(shortPrefix, shortCode),
    createdBy,
    recipientEmail: payload.recipientEmail || undefined,
    backupProvider: "cloudinary",
    otpEnabled: String(payload.otpEnabled) === "true",
    paymentPlan: payload.paymentPlan || "starter",
    watermark:
      model === File
        ? {
            enabled: String(payload.watermarkEnabled || "true") !== "false",
            template: payload.watermarkTemplate || "Printed via DocShield",
          }
        : undefined,
    watermarkLabel: payload.watermarkTemplate || "Printed via DocShield",
    ...expiryMeta,
  });

  if (String(payload.isPassword) === "true" && payload.password) {
    doc.password = await bcrypt.hash(payload.password, 10);
    doc.isPasswordProtected = true;
  }

  await doc.save();

  if (ownerId) {
    const user = await User.findById(ownerId);
    if (user) {
      user.totalUploads += 1;
      if (file.mimetype.startsWith("image/")) user.imageCount += 1;
      else if (file.mimetype.startsWith("video/")) user.videoCount += 1;
      else user.documentCount += 1;
      await user.save();
    }
  }

  return doc;
};

const uploadFiles = async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedFiles = await Promise.all(
      req.files.map((file) =>
        uploadSingleFile({
          file,
          payload: req.body,
          ownerId: userId,
          shortPrefix: "share",
          model: File,
          createdBy: userId,
        })
      )
    );

    res.status(201).json({
      message: "Files uploaded successfully",
      files: savedFiles.map((file) => serializeFile(file, user)),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
};

const uploadFilesGuest = async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  try {
    const createdBy = `guest_${shortid.generate()}`;
    const savedFiles = await Promise.all(
      req.files.map((file) =>
        uploadSingleFile({
          file,
          payload: req.body,
          ownerId: null,
          shortPrefix: "guest",
          model: GuestFile,
          createdBy,
        })
      )
    );

    res.status(201).json({
      message: "Guest files uploaded successfully",
      files: savedFiles.map((file) => serializeFile(file)),
    });
  } catch (error) {
    console.error("Guest upload error:", error);
    res.status(500).json({ error: "Guest file upload failed" });
  }
};

const getPublicFile = async (shortCode) =>
  (await File.findOne({ shortCode })) || (await GuestFile.findOne({ shortCode }));

const downloadInfo = async (req, res) => {
  try {
    const file = await File.findOne({ shortCode: req.params.shortCode }).populate("createdBy");
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (applyStatusForExpiry(file) === "expired") {
      await file.save();
      return res.status(410).json({ error: "This link has expired" });
    }

    file.downloadedContent += 1;
    file.lastAccessedAt = new Date();
    file.accessLogs.push(createAccessLog(req, "download"));
    await file.save();

    if (file.createdBy?._id) {
      await User.findByIdAndUpdate(file.createdBy._id, { $inc: { totalDownloads: 1 } });
    }

    res.status(200).json({
      ...serializeFile(file, file.createdBy),
      downloadUrl: buildCloudinaryUrl(file, { attachment: true }),
      previewUrl: buildCloudinaryUrl(file),
    });
  } catch (error) {
    console.error("Download info error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const guestDownloadInfo = async (req, res) => {
  try {
    const file = await GuestFile.findOne({ shortCode: req.params.shortCode });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (applyStatusForExpiry(file) === "expired") {
      await file.save();
      return res.status(410).json({ error: "This link has expired" });
    }

    file.downloadedContent += 1;
    file.lastAccessedAt = new Date();
    file.accessLogs.push(createAccessLog(req, "download"));
    await file.save();

    res.status(200).json({
      ...serializeFile(file),
      downloadUrl: buildCloudinaryUrl(file, { attachment: true }),
      previewUrl: buildCloudinaryUrl(file),
    });
  } catch (error) {
    console.error("Guest download info error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (applyStatusForExpiry(file) === "expired") {
      await file.save();
      return res.status(410).json({ error: "This link has expired" });
    }

    if (file.accessMode === "view_only") {
      file.accessLogs.push(createAccessLog(req, "download", "blocked"));
      await file.save();
      return res.status(403).json({ error: "Download is disabled for this document" });
    }

    if (file.isPasswordProtected) {
      const isMatch = await bcrypt.compare(req.body.password || "", file.password);
      if (!isMatch) {
        file.accessLogs.push(createAccessLog(req, "download", "invalid_password"));
        await file.save();
        return res.status(401).json({ error: "Incorrect password" });
      }
    }

    file.downloadedContent += 1;
    file.lastAccessedAt = new Date();
    file.accessLogs.push(createAccessLog(req, "download"));
    await file.save();

    await User.findByIdAndUpdate(file.createdBy, { $inc: { totalDownloads: 1 } });

    res.status(200).json({ downloadUrl: buildCloudinaryUrl(file, { attachment: true }) });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    await cloudinary.uploader.destroy(file.storageKey, {
      resource_type: file.resourceType || "raw",
      invalidate: true,
    });

    await File.deleteOne({ _id: req.params.fileId });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateFileStatus = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const nextStatus = req.body.status;
    if (!["active", "inactive", "archived"].includes(nextStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    file.status = nextStatus;
    await file.save();
    res.status(200).json(serializeFile(file));
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateFileExpiry = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const expiryMeta = normalizeExpiry(true, req.body.expiresAt);
    file.hasExpiry = expiryMeta.hasExpiry;
    file.expiresAt = expiryMeta.expiresAt;
    await file.save();

    res.status(200).json(serializeFile(file));
  } catch (error) {
    console.error("Expiry update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateAllFileExpiry = async (_req, res) => {
  try {
    const files = await File.find();
    const updatedFiles = [];

    for (const file of files) {
      if (isExpired(file)) {
        file.status = "expired";
      } else if (!file.expiresAt) {
        file.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        file.hasExpiry = true;
      }
      await file.save();
      updatedFiles.push(serializeFile(file));
    }

    res.status(200).json({ files: updatedFiles });
  } catch (error) {
    console.error("Bulk expiry update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateFilePassword = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (!req.body.newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    file.password = await bcrypt.hash(req.body.newPassword, 10);
    file.isPasswordProtected = true;
    await file.save();

    res.status(200).json(serializeFile(file));
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchFiles = async (req, res) => {
  try {
    const files = await File.find({
      name: { $regex: req.query.query || "", $options: "i" },
    });
    res.status(200).json(files.map((file) => serializeFile(file)));
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Error searching files" });
  }
};

const showUserFiles = async (req, res) => {
  try {
    const files = await File.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(files.map((file) => serializeFile(file)));
  } catch (error) {
    console.error("Show user files error:", error);
    res.status(500).json({ error: "Error fetching user files" });
  }
};

const getFileDetails = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId).populate("createdBy");
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json({
      ...serializeFile(file, file.createdBy),
      previewUrl: buildCloudinaryUrl(file),
    });
  } catch (error) {
    console.error("Get file details error:", error);
    res.status(500).json({ error: "Error fetching file details" });
  }
};

const generateShareShortenLink = async (req, res) => {
  try {
    const file = await File.findById(req.body.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (!file.shortCode) {
      file.shortCode = shortid.generate();
    }
    file.shortUrl = buildShareUrl("share", file.shortCode);
    await file.save();

    res.status(200).json({ shortCode: file.shortCode, shortUrl: file.shortUrl });
  } catch (error) {
    console.error("Short link error:", error);
    res.status(500).json({ error: "Error generating short link" });
  }
};

const sendLinkEmail = async (req, res) => {
  try {
    const file = await File.findById(req.body.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DocShield" <${process.env.MAIL_USER}>`,
      to: req.body.email,
      subject: `Secure document access: ${file.originalName || file.name}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; color: #111827;">
          <h2>Secure document shared via DocShield</h2>
          <p>You received protected access to <strong>${file.originalName || file.name}</strong>.</p>
          <p>Access mode: <strong>${file.accessMode.replaceAll("_", " ")}</strong></p>
          <p>Open secure link: <a href="${file.shortUrl}">${file.shortUrl}</a></p>
          <p>${file.hasExpiry && file.expiresAt ? `Expires on ${new Date(file.expiresAt).toLocaleString()}` : "No expiry set"}</p>
          <p>Stored and delivered through Cloudinary-backed secure access flow.</p>
        </div>
      `,
    });

    res.status(200).json({ message: "Link sent successfully" });
  } catch (error) {
    console.error("Send mail error:", error);
    res.status(500).json({ error: "Error sending link" });
  }
};

const generateQR = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (!file.shortUrl) {
      file.shortCode = file.shortCode || shortid.generate();
      file.shortUrl = buildShareUrl("share", file.shortCode);
      await file.save();
    }

    const qr = await QRCode.toDataURL(file.shortUrl);
    res.status(200).json({ qr, shortUrl: file.shortUrl });
  } catch (error) {
    console.error("QR error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
};

const getDownloadCount = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json({
      fileId: file._id,
      downloadCount: file.downloadedContent,
      viewCount: file.viewCount,
      printCount: file.printCount,
      qrOpenCount: file.qrOpenCount,
    });
  } catch (error) {
    console.error("Counts error:", error);
    res.status(500).json({ error: "Failed to get access counts" });
  }
};

const resolveShareLink = async (req, res) => {
  try {
    const file = await getPublicFile(req.params.code);
    if (!file) {
      return res.status(404).json({ error: "Invalid secure link" });
    }

    if (applyStatusForExpiry(file) === "expired") {
      await file.save();
      return res.status(410).json({ error: "This file has expired" });
    }

    const owner = file.createdBy?._id ? await User.findById(file.createdBy) : null;
    res.status(200).json({
      ...serializeFile(file, owner),
      previewUrl: file.path,
      requiresPassword: file.isPasswordProtected,
    });
  } catch (error) {
    console.error("Resolve link error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyFilePassword = async (req, res) => {
  try {
    const file = await getPublicFile(req.body.shortCode);
    if (!file || !file.isPasswordProtected) {
      return res.status(404).json({ success: false, error: "Protected file not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password || "", file.password);
    file.accessLogs.push(
      createAccessLog(req, "verify_password", isMatch ? "allowed" : "invalid_password")
    );
    await file.save();

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Incorrect password" });
    }

    res.status(200).json({ success: true, message: "Password verified" });
  } catch (error) {
    console.error("Verify password error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const verifyGuestFilePassword = verifyFilePassword;

const getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(files.map((file) => serializeFile(file)));
  } catch (error) {
    console.error("Get user files error:", error);
    res.status(500).json({ error: "Error fetching files" });
  }
};

const requestFileAccess = async (req, res) => {
  try {
    const file = await getPublicFile(req.params.shortCode);
    if (!file) {
      return res.status(404).json({ error: "Secure file not found" });
    }

    if (applyStatusForExpiry(file) === "expired") {
      file.accessLogs.push(createAccessLog(req, req.body.action || "view", "expired"));
      await file.save();
      return res.status(410).json({ error: "This file has expired" });
    }

    const action = req.body.action || "view";
    const actorLabel = req.body.actorLabel || "Anonymous";
    const blockedDownload = action === "download" && file.accessMode !== "download_allowed";
    const blockedPrint = action === "print" && file.accessMode === "view_only";

    if (blockedDownload || blockedPrint) {
      file.accessLogs.push(createAccessLog(req, action, "blocked", actorLabel));
      await file.save();
      return res.status(403).json({ error: "This access mode is disabled for the document" });
    }

    if (action === "view") file.viewCount += 1;
    if (action === "print") file.printCount += 1;
    if (action === "download") file.downloadedContent += 1;
    if (action === "qr_open") file.qrOpenCount += 1;

    file.lastAccessedAt = new Date();
    file.accessLogs.push(createAccessLog(req, action, "allowed", actorLabel));
    await file.save();

    res.status(200).json({
      mode: file.accessMode,
      previewUrl: buildCloudinaryUrl(file),
      downloadUrl:
        file.accessMode === "download_allowed" ? buildCloudinaryUrl(file, { attachment: true }) : null,
      watermarkText:
        file.watermark?.template ||
        file.watermarkLabel ||
        `Printed via DocShield • ${new Date().toLocaleString()}`,
    });
  } catch (error) {
    console.error("Request file access error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const files = await File.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
    const activeFiles = files.filter((file) => applyStatusForExpiry(file) === "active");
    const expiringSoon = files.filter((file) => {
      if (!file.expiresAt) return false;
      const diff = new Date(file.expiresAt).getTime() - Date.now();
      return diff > 0 && diff < 24 * 60 * 60 * 1000;
    });

    const totals = files.reduce(
      (acc, file) => {
        acc.views += file.viewCount || 0;
        acc.downloads += file.downloadedContent || 0;
        acc.prints += file.printCount || 0;
        return acc;
      },
      { views: 0, downloads: 0, prints: 0 }
    );

    res.status(200).json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
      },
      metrics: {
        totalFiles: files.length,
        activeFiles: activeFiles.length,
        expiringSoon: expiringSoon.length,
        totalViews: totals.views,
        totalPrints: totals.prints,
        totalDownloads: totals.downloads,
      },
      recentFiles: files.slice(0, 6).map((file) => serializeFile(file)),
      activity: files
        .flatMap((file) =>
          (file.accessLogs || []).map((log) => ({
            fileId: file._id,
            fileName: file.originalName || file.name,
            ...log,
          }))
        )
        .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
        .slice(0, 12),
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Unable to load dashboard summary" });
  }
};

const getAdminOverview = async (_req, res) => {
  try {
    const [users, files] = await Promise.all([User.find(), File.find()]);
    const totals = files.reduce(
      (acc, file) => {
        acc.views += file.viewCount || 0;
        acc.downloads += file.downloadedContent || 0;
        acc.prints += file.printCount || 0;
        return acc;
      },
      { views: 0, downloads: 0, prints: 0 }
    );

    res.status(200).json({
      users: users.length,
      activeUsers: users.filter((user) => {
        if (!user.lastLogin) return false;
        return Date.now() - new Date(user.lastLogin).getTime() < 7 * 24 * 60 * 60 * 1000;
      }).length,
      documents: files.length,
      activeShares: files.filter((file) => applyStatusForExpiry(file) === "active").length,
      totalViews: totals.views,
      totalPrints: totals.prints,
      totalDownloads: totals.downloads,
      storageProvider: "cloudinary",
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "Unable to load admin overview" });
  }
};

const getPrintShopQueue = async (req, res) => {
  try {
    const files = await File.find({
      createdBy: req.params.userId,
      accessMode: { $in: ["print_only", "download_allowed"] },
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json(
      files.map((file) => ({
        ...serializeFile(file),
        quickPrintUrl: `/share/${file.shortCode}?mode=print`,
      }))
    );
  } catch (error) {
    console.error("Print queue error:", error);
    res.status(500).json({ error: "Unable to load print queue" });
  }
};

export {
  deleteFile,
  downloadFile,
  downloadInfo,
  generateQR,
  generateShareShortenLink,
  getAdminOverview,
  getDashboardSummary,
  getDownloadCount,
  getFileDetails,
  getPrintShopQueue,
  getUserFiles,
  guestDownloadInfo,
  requestFileAccess,
  resolveShareLink,
  searchFiles,
  sendLinkEmail,
  showUserFiles,
  updateAllFileExpiry,
  updateFileExpiry,
  updateFilePassword,
  updateFileStatus,
  uploadFiles,
  uploadFilesGuest,
  verifyFilePassword,
  verifyGuestFilePassword,
};
