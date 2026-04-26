import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiLock,
  FiPrinter,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";

const featureCards = [
  {
    icon: FiShield,
    title: "Protected document delivery",
    text: "Share Aadhaar, PAN, certificates, contracts, and resumes without leaving permanent copies behind.",
  },
  {
    icon: FiEye,
    title: "View-only access",
    text: "Enable controlled previews for sensitive PDFs while keeping direct downloads disabled.",
  },
  {
    icon: FiPrinter,
    title: "Print-only workflow",
    text: "Create secure print links for cyber cafes and print shops with watermark protection and expiry windows.",
  },
  {
    icon: FiClock,
    title: "Auto-expiring links",
    text: "Issue temporary access with custom time limits for students, HR teams, and compliance-heavy offices.",
  },
  {
    icon: FiSmartphone,
    title: "QR-first sharing",
    text: "Hand off documents through QR in seconds for mobile-first printing and offline counter workflows.",
  },
  {
    icon: FiActivity,
    title: "Access analytics",
    text: "Track opens, prints, downloads, timestamps, and viewer activity from one vault dashboard.",
  },
];

const landingStats = [
  { label: "Access modes", value: "3" },
  { label: "Doc categories", value: "8+" },
  { label: "Expiry controls", value: "24/7" },
  { label: "Print flow time", value: "< 30s" },
];

const faqs = [
  {
    q: "How is DocShield different from WhatsApp sharing?",
    a: "WhatsApp creates permanent copies on recipient devices. DocShield issues controlled links with expiry, access rules, and activity visibility.",
  },
  {
    q: "Can print shops use it without logging in?",
    a: "Yes. Share links or QR codes can open a print-ready secure page while your team keeps control over expiry and access mode.",
  },
  {
    q: "Is this ready for SaaS monetization?",
    a: "The architecture already exposes plan-aware fields, admin metrics, OTP placeholders, and Razorpay-ready pricing surfaces for the next iteration.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_25%,#020617_55%)] text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-white/10">
            <FiShield className="text-xl" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">DocShield</div>
            <div className="text-xs text-slate-400">Secure. Share. Print. Protect.</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
          <Link to="/pricing">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link className="docshield-secondary-button hidden sm:inline-flex" to="/login">
            Log in
          </Link>
          <Link className="docshield-primary-button" to="/signup">
            Launch Dashboard
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pb-24 lg:pt-14">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <FiLock className="text-cyan-300" />
              Secure document sharing platform for print shops, offices, students, and professionals
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Stop sending confidential PDFs into uncontrolled chat threads.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              DocShield replaces WhatsApp document forwarding with controlled access links, QR-based print handoff, expiring sessions, watermark protection, and activity tracking built for India’s real print-shop workflow.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link className="docshield-primary-button" to="/signup">
                Start Secure Sharing
                <FiArrowRight />
              </Link>
              <Link className="docshield-secondary-button" to="/pricing">
                Explore Plans
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {landingStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-2xl font-semibold text-white">{item.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Secure vault preview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">DocShield Workspace</h2>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm text-emerald-300">
                  Live audit visibility
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-400">Sensitive file</div>
                      <div className="mt-1 text-lg font-medium">Offer_Letter_Confidential.pdf</div>
                    </div>
                    <div className="rounded-xl bg-cyan-400/15 px-3 py-2 text-xs text-cyan-300">
                      Print-only
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="rounded-full border border-white/10 px-3 py-1">Expires in 2h</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">QR enabled</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">Watermarked</span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="text-sm text-slate-400">Recent activity</div>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Viewed at print counter</span>
                        <span className="text-slate-500">11:42 AM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Printed once</span>
                        <span className="text-slate-500">11:44 AM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Auto-expiry armed</span>
                        <span className="text-slate-500">2 hours</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="text-sm text-slate-400">Policy stack</div>
                    <div className="mt-3 space-y-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> JWT session</div>
                      <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Cloudinary delivery layer</div>
                      <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> MongoDB analytics vault</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Product surface</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Built like a secure SaaS, not a throwaway file uploader.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Icon className="text-xl" />
                </div>
                <h3 className="mt-5 text-xl font-medium text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Security posture</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Purpose-built for confidential document exchange.</h2>
              <p className="mt-4 max-w-xl text-slate-400">
                Every shared file can be wrapped with expiry, password protection, controlled printing, watermark identity, and access telemetry.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                "JWT-based auth with protected dashboard routes",
                "Cloudinary-backed upload and delivery designed for fast MVP execution",
                "Access logs for opens, prints, QR scans, and downloads",
                "Subscription, OTP, and enterprise trust surfaces ready for the next sprint",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <FiCheckCircle className="mt-1 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              ["Students", "Share mark sheets, Aadhaar, admit cards, and certificates to print counters without leaving files behind."],
              ["HR & recruiters", "Send offer letters, KYC packs, and onboarding paperwork through controlled view and print flows."],
              ["Lawyers & finance teams", "Move contracts, affidavits, and bank records through temporary audited links."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FiFileText className="text-cyan-300" />
                  <h3 className="text-xl font-medium">{title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Questions investors, teams, and users usually ask first.</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-medium text-white">{item.q}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <div className="rounded-[32px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.95))] p-8 lg:p-12">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Founder-ready prototype</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">DocShield is positioned to feel like a real startup product on day one.</h2>
              <p className="mt-4 text-slate-300">
                Premium dashboard UX, secure share flows, subscription surfaces, and enterprise messaging are already aligned for hiring portfolios, interviews, and early-stage pitching.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link className="docshield-primary-button" to="/signup">
                  Build Your Vault
                </Link>
                <Link className="docshield-secondary-button" to="/dashboard">
                  Open Product Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
