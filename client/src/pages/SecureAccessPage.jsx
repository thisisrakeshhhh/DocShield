import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiClock,
  FiDownload,
  FiEye,
  FiLock,
  FiPrinter,
  FiShield,
} from "react-icons/fi";
import axiosInstance from "../config/axiosInstance";

const SecureAccessPage = ({ guestMode = false }) => {
  const { shortCode } = useParams();
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessState, setAccessState] = useState(null);

  const initialAction = useMemo(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "print") return "print";
    return "view";
  }, [searchParams]);

  useEffect(() => {
    const loadFile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/files/share/resolve/${shortCode}`);
        setFile(response.data);
        if (!response.data.requiresPassword) {
          setVerified(true);
        }
      } catch (error) {
        toast.error(error.response?.data?.error || "Unable to open secure link");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [shortCode]);

  useEffect(() => {
    if (verified && initialAction && file) {
      handleAccess(initialAction);
    }
  }, [verified, initialAction, file]);

  const verifyPassword = async () => {
    try {
      const endpoint = guestMode ? "/files/guest/verify-password" : "/files/share/verify-password";
      await axiosInstance.post(endpoint, { shortCode, password });
      setVerified(true);
      toast.success("Access verified");
    } catch (error) {
      toast.error(error.response?.data?.error || "Incorrect password");
    }
  };

  const handleAccess = async (action) => {
    try {
      const response = await axiosInstance.post(`/files/share/access/${shortCode}`, {
        action,
        actorLabel: "Secure viewer",
      });
      setAccessState(response.data);

      if (action === "print") {
        openPrintWindow(response.data.previewUrl, response.data.watermarkText);
      }

      if (action === "download" && response.data.downloadUrl) {
        window.open(response.data.downloadUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Access action failed");
    }
  };

  const openPrintWindow = (previewUrl, watermarkText) => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
    if (!printWindow) {
      toast.error("Popup blocked by browser");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>DocShield Print View</title>
          <style>
            body { margin: 0; background: #0f172a; }
            .watermark {
              position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
              color: rgba(15, 23, 42, 0.12); font: 700 28px Inter, Arial, sans-serif; transform: rotate(-24deg);
              pointer-events: none; z-index: 2;
            }
            iframe { width: 100vw; height: 100vh; border: 0; position: relative; z-index: 1; }
          </style>
        </head>
        <body>
          <div class="watermark">${watermarkText}</div>
          <iframe src="${previewUrl}#toolbar=0&navpanes=0&scrollbar=0"></iframe>
          <script>
            setTimeout(() => window.print(), 900);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading secure access...
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-300">
        Secure document not found or expired.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400">
          <FiArrowLeft />
          Back to DocShield
        </Link>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <FiShield className="text-2xl" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold">{file.originalName}</h1>
            <p className="mt-3 text-sm text-slate-400">
              Protected document access powered by DocShield. This session is governed by access mode, expiry, and watermark policy.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-4">
                <FiEye className="text-cyan-300" />
                Access mode: {file.accessMode.replaceAll("_", " ")}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-4">
                <FiClock className="text-cyan-300" />
                {file.expiresAt ? `Expires ${new Date(file.expiresAt).toLocaleString()}` : "No expiry set"}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-4">
                <FiLock className="text-cyan-300" />
                {file.requiresPassword ? "Password verification required" : "No password challenge"}
              </div>
            </div>

            {file.requiresPassword && !verified && (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Document password</span>
                  <input
                    className="docshield-dark-input"
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    value={password}
                  />
                </label>
                <button className="docshield-primary-button mt-4 w-full justify-center" onClick={verifyPassword}>
                  Verify Access
                </button>
              </div>
            )}

            <div className="mt-6 grid gap-3">
              <button className="docshield-secondary-button justify-center" disabled={!verified} onClick={() => handleAccess("view")}>
                <FiEye />
                Open Preview
              </button>
              <button className="docshield-secondary-button justify-center" disabled={!verified} onClick={() => handleAccess("print")}>
                <FiPrinter />
                Print Securely
              </button>
              <button
                className="docshield-secondary-button justify-center"
                disabled={!verified || file.accessMode !== "download_allowed"}
                onClick={() => handleAccess("download")}
              >
                <FiDownload />
                Download
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4">
            {accessState?.previewUrl ? (
              <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white">
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8 text-center text-[28px] font-semibold uppercase tracking-[0.25em] text-slate-950/10">
                  {accessState.watermarkText}
                </div>
                {file.type?.includes("pdf") ? (
                  <iframe
                    className="h-[78vh] w-full"
                    src={`${accessState.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Protected preview"
                  />
                ) : (
                  <div className="flex h-[78vh] items-center justify-center p-8">
                    <a className="docshield-primary-button" href={accessState.previewUrl} rel="noreferrer" target="_blank">
                      Open secure preview asset
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-[78vh] items-center justify-center rounded-[24px] border border-dashed border-white/10 text-slate-500">
                Verify or choose an access action to load the protected preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureAccessPage;
