import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import QRCode from "react-qr-code";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiActivity,
  FiClock,
  FiCopy,
  FiExternalLink,
  FiFilePlus,
  FiGrid,
  FiLogOut,
  FiMail,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import axiosInstance from "../config/axiosInstance";
import { logoutUser } from "../redux/slice/auth/authSlice";

const categories = [
  { label: "Aadhaar", value: "aadhaar" },
  { label: "PAN", value: "pan" },
  { label: "Resume", value: "resume" },
  { label: "Legal", value: "legal" },
  { label: "Certificate", value: "certificate" },
  { label: "Bank Document", value: "bank_document" },
  { label: "Contract", value: "contract" },
  { label: "Confidential PDF", value: "confidential_pdf" },
  { label: "Other", value: "other" },
];

const initialUploadConfig = {
  accessMode: "print_only",
  documentCategory: "confidential_pdf",
  shareChannel: "qr",
  expiresAt: 2,
  isPassword: false,
  password: "",
  watermarkEnabled: true,
  watermarkTemplate: "Printed via DocShield",
  otpEnabled: false,
  recipientEmail: "",
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [adminOverview, setAdminOverview] = useState(null);
  const [printQueue, setPrintQueue] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadConfig, setUploadConfig] = useState(initialUploadConfig);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [emailTargets, setEmailTargets] = useState({});

  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [dashboardResponse, filesResponse, adminResponse, queueResponse] = await Promise.all([
        axiosInstance.get(`/files/user/${user.id}/dashboard`),
        axiosInstance.get(`/files/user/${user.id}/list`),
        axiosInstance.get("/files/admin/overview"),
        axiosInstance.get(`/files/user/${user.id}/print-queue`),
      ]);

      setDashboard(dashboardResponse.data);
      setFiles(filesResponse.data);
      setAdminOverview(adminResponse.data);
      setPrintQueue(queueResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const updateUploadConfig = (event) => {
    const { name, value, type, checked } = event.target;
    setUploadConfig((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFiles.length) {
      toast.info("Choose at least one file to upload.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("userId", user.id);
    Object.entries(uploadConfig).forEach(([key, value]) => formData.append(key, value));
    formData.append("hasExpiry", true);

    setUploading(true);
    try {
      await axiosInstance.post("/files/upload", formData);
      toast.success("Files secured in DocShield");
      setSelectedFiles([]);
      setUploadConfig(initialUploadConfig);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return files;
    return files.filter((file) => {
      const target = `${file.originalName} ${file.documentCategory} ${file.accessMode}`.toLowerCase();
      return target.includes(text);
    });
  }, [files, query]);

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied secure link");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const sendEmailLink = async (fileId) => {
    const email = emailTargets[fileId];
    if (!email) {
      toast.info("Enter a recipient email first.");
      return;
    }
    try {
      await axiosInstance.post("/files/share/email", { fileId, email });
      toast.success("Secure link sent by email");
    } catch (error) {
      toast.error(error.response?.data?.error || "Email delivery failed");
    }
  };

  const buildShortUrl = (file) => {
    if (file.shortUrl) return file.shortUrl;
    return `${window.location.origin}/share/${file.shortCode}`;
  };

  const metricCards = dashboard
    ? [
        { label: "Protected files", value: dashboard.metrics.totalFiles, icon: FiGrid },
        { label: "Active links", value: dashboard.metrics.activeFiles, icon: FiShield },
        { label: "Views", value: dashboard.metrics.totalViews, icon: FiActivity },
        { label: "Print actions", value: dashboard.metrics.totalPrints, icon: FiPrinter },
      ]
    : [];

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading DocShield workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <FiShield className="text-2xl" />
            </div>
            <div>
              <p className="text-sm text-slate-400">DocShield Control Center</p>
              <h1 className="text-3xl font-semibold">Secure document operations</h1>
              <p className="text-sm text-slate-400">
                {dashboard?.user?.fullname} • {dashboard?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="docshield-secondary-button" to="/pricing">
              Pricing
            </Link>
            <button className="docshield-secondary-button" onClick={refreshData}>
              <FiRefreshCw />
              Refresh
            </button>
            <button
              className="docshield-primary-button"
              onClick={() => {
                dispatch(logoutUser());
                toast.success("Session closed");
              }}
            >
              <FiLogOut />
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">{label}</div>
                <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
                  <Icon />
                </div>
              </div>
              <div className="mt-6 text-4xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white p-6 text-slate-900">
            <div className="flex items-center gap-3">
              <FiFilePlus className="text-cyan-700" />
              <div>
                <h2 className="text-2xl font-semibold">Secure upload</h2>
                <p className="text-sm text-slate-500">Prepare a protected document handoff for print shops and confidential sharing.</p>
              </div>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleUpload}>
              <div
                {...getRootProps()}
                className={`rounded-[24px] border-2 border-dashed p-8 text-center transition ${
                  isDragActive ? "border-cyan-500 bg-cyan-50" : "border-slate-300 bg-slate-50"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-lg font-medium text-slate-800">
                  {isDragActive ? "Drop files into your secure vault" : "Drag documents here or click to choose files"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Supports PDF, images, and office-safe print handoff flows up to 10 MB per file.
                </p>
                {!!selectedFiles.length && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {selectedFiles.map((file) => (
                      <span key={file.name} className="rounded-full bg-slate-900 px-3 py-2 text-xs text-white">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Access mode</span>
                  <select className="docshield-input" name="accessMode" onChange={updateUploadConfig} value={uploadConfig.accessMode}>
                    <option value="view_only">View only</option>
                    <option value="print_only">Print only</option>
                    <option value="download_allowed">Download allowed</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Document category</span>
                  <select className="docshield-input" name="documentCategory" onChange={updateUploadConfig} value={uploadConfig.documentCategory}>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Share channel</span>
                  <select className="docshield-input" name="shareChannel" onChange={updateUploadConfig} value={uploadConfig.shareChannel}>
                    <option value="qr">QR first</option>
                    <option value="link">Direct link</option>
                    <option value="print_shop">Print shop mode</option>
                    <option value="email">Email delivery</option>
                    <option value="whatsapp">WhatsApp fallback</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Expiry window (hours)</span>
                  <input className="docshield-input" min="1" name="expiresAt" onChange={updateUploadConfig} type="number" value={uploadConfig.expiresAt} />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Watermark text</span>
                  <input
                    className="docshield-input"
                    name="watermarkTemplate"
                    onChange={updateUploadConfig}
                    value={uploadConfig.watermarkTemplate}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Recipient email (optional)</span>
                  <input
                    className="docshield-input"
                    name="recipientEmail"
                    onChange={updateUploadConfig}
                    placeholder="recipient@company.com"
                    type="email"
                    value={uploadConfig.recipientEmail}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <input checked={uploadConfig.isPassword} name="isPassword" onChange={updateUploadConfig} type="checkbox" />
                  Password protected
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <input checked={uploadConfig.watermarkEnabled} name="watermarkEnabled" onChange={updateUploadConfig} type="checkbox" />
                  Watermark enabled
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <input checked={uploadConfig.otpEnabled} name="otpEnabled" onChange={updateUploadConfig} type="checkbox" />
                  OTP architecture placeholder
                </label>
              </div>

              {uploadConfig.isPassword && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Access password</span>
                  <input
                    className="docshield-input"
                    name="password"
                    onChange={updateUploadConfig}
                    type="password"
                    value={uploadConfig.password}
                  />
                </label>
              )}

              <button className="docshield-primary-button w-full justify-center" disabled={uploading} type="submit">
                {uploading ? "Securing upload..." : "Upload To DocShield"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <FiUsers className="text-cyan-300" />
                <div>
                  <h2 className="text-xl font-semibold">Admin pulse</h2>
                  <p className="text-sm text-slate-400">Usage and platform health</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  ["Users", adminOverview?.users || 0],
                  ["Active users", adminOverview?.activeUsers || 0],
                  ["Docs", adminOverview?.documents || 0],
                  ["Shares", adminOverview?.activeShares || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className="mt-3 text-2xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <FiPrinter className="text-cyan-300" />
                <div>
                  <h2 className="text-xl font-semibold">Print shop access panel</h2>
                  <p className="text-sm text-slate-400">Quick print mode links for counter staff</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {printQueue.slice(0, 4).map((file) => (
                  <div key={file.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{file.originalName}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          {file.accessMode.replaceAll("_", " ")} • expires {new Date(file.expiresAt).toLocaleString()}
                        </div>
                      </div>
                      <a className="docshield-secondary-button" href={`/share/${file.shortCode}?mode=print`} rel="noreferrer" target="_blank">
                        Open
                      </a>
                    </div>
                  </div>
                ))}
                {!printQueue.length && <p className="text-sm text-slate-500">No print-ready files yet.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Document vault</h2>
              <p className="text-sm text-slate-400">Track every secure link, QR route, print action, and expiry state.</p>
            </div>
            <label className="relative block lg:w-80">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="docshield-dark-input pl-11"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files, category, access mode"
                value={query}
              />
            </label>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {filteredFiles.map((file) => (
              <div key={file.id} className="rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-lg font-medium">{file.originalName}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 px-3 py-1">{file.documentCategory}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1">{file.accessMode.replaceAll("_", " ")}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1">{file.status}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <QRCode style={{ height: 72, width: 72 }} value={buildShortUrl(file)} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 p-3">
                    <div className="text-xs text-slate-500">Views</div>
                    <div className="mt-2 text-xl font-semibold">{file.viewCount}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-3">
                    <div className="text-xs text-slate-500">Prints</div>
                    <div className="mt-2 text-xl font-semibold">{file.printCount}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-3">
                    <div className="text-xs text-slate-500">Downloads</div>
                    <div className="mt-2 text-xl font-semibold">{file.downloadedContent}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-3">
                    <div className="text-xs text-slate-500">Expiry</div>
                    <div className="mt-2 text-sm font-medium">{file.expiresAt ? new Date(file.expiresAt).toLocaleString() : "None"}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="docshield-secondary-button" onClick={() => handleCopy(buildShortUrl(file))}>
                    <FiCopy />
                    Copy Link
                  </button>
                  <a className="docshield-secondary-button" href={`/share/${file.shortCode}`} rel="noreferrer" target="_blank">
                    <FiExternalLink />
                    Open
                  </a>
                  <a className="docshield-secondary-button" href={`/share/${file.shortCode}?mode=print`} rel="noreferrer" target="_blank">
                    <FiPrinter />
                    Quick Print
                  </a>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className="docshield-dark-input"
                    onChange={(event) =>
                      setEmailTargets((current) => ({ ...current, [file.id]: event.target.value }))
                    }
                    placeholder="Send to recipient email"
                    type="email"
                    value={emailTargets[file.id] || ""}
                  />
                  <button className="docshield-secondary-button justify-center" onClick={() => sendEmailLink(file.id)}>
                    <FiMail />
                    Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <FiClock className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold">Activity stream</h2>
                <p className="text-sm text-slate-400">Latest opens, print attempts, and secure access events</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {dashboard?.activity?.map((item, index) => (
                <div key={`${item.fileId}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-sm font-medium">{item.fileName}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {item.actorLabel} • {item.action} • {item.outcome}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{new Date(item.occurredAt).toLocaleString()}</div>
                </div>
              ))}
              {!dashboard?.activity?.length && <p className="text-sm text-slate-500">No activity yet.</p>}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <FiSettings className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold">Commercial architecture</h2>
                <p className="text-sm text-slate-400">MVP-ready surfaces that help the product read like a fundable SaaS</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Razorpay-ready", "Billing page and plan fields are already structured for paid tiers."],
                ["OTP access", "Model fields are prepared for secured secondary verification."],
                ["Enterprise trust", "Admin analytics, audit trail, and policy messaging are in place."],
                ["Nearby print shops", "The print access lane is separated and ready for location-based extensions."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="font-medium">{title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-400">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
