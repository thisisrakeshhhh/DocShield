import { Router } from "express";
import {
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
} from "../controllers/file.controller.js";
import upload from "../middlewares/upload.middlewares.js";

const router = Router();

router.post("/upload", upload.array("files"), uploadFiles);
router.post("/upload-guest", upload.array("files"), uploadFilesGuest);

router.get("/download/:fileId", downloadFile);
router.get("/details/:fileId", getFileDetails);
router.delete("/:fileId", deleteFile);
router.put("/:fileId/status", updateFileStatus);
router.put("/:fileId/expiry", updateFileExpiry);
router.put("/:fileId/password", updateFilePassword);
router.post("/bulk/expiry-refresh", updateAllFileExpiry);

router.get("/search", searchFiles);
router.get("/user/:userId", showUserFiles);
router.get("/user/:userId/list", getUserFiles);
router.get("/user/:userId/dashboard", getDashboardSummary);
router.get("/user/:userId/print-queue", getPrintShopQueue);
router.get("/admin/overview", getAdminOverview);

router.post("/share/link", generateShareShortenLink);
router.post("/share/email", sendLinkEmail);
router.get("/share/qr/:fileId", generateQR);
router.get("/share/counts/:fileId", getDownloadCount);
router.get("/share/resolve/:code", resolveShareLink);
router.post("/share/access/:shortCode", requestFileAccess);
router.post("/share/verify-password", verifyFilePassword);
router.post("/guest/verify-password", verifyGuestFilePassword);

router.get("/f/:shortCode", downloadInfo);
router.get("/g/:shortCode", guestDownloadInfo);

export default router;
