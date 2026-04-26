import { Link } from "react-router-dom";
import { FiCheck, FiShield } from "react-icons/fi";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For students and one-off document sharing.",
    items: ["5 secure links", "View-only + print-only", "QR sharing", "24-hour expiry presets"],
  },
  {
    name: "Growth",
    price: "Rs 499/mo",
    description: "For offices, agencies, and repeat print workflows.",
    items: ["Unlimited vault uploads", "Access analytics", "Watermark controls", "Email delivery", "OTP-ready architecture"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For compliance-sensitive teams and high-volume operations.",
    items: ["Admin console", "Cloudinary-backed delivery", "Razorpay-ready billing", "Dedicated onboarding", "Custom trust controls"],
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-3 text-slate-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
            <FiShield />
          </div>
          <div>
            <div className="font-semibold">DocShield</div>
            <div className="text-xs text-slate-500">Secure. Share. Print. Protect.</div>
          </div>
        </Link>

        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold">Subscription surfaces prepared for a real SaaS rollout.</h1>
          <p className="mt-4 text-slate-400">
            The billing layer is represented as a product-ready placeholder so the app already reads like a monetizable startup instead of a static side project.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`rounded-[28px] border p-7 ${
                index === 1
                  ? "border-cyan-300/30 bg-cyan-400/10 shadow-2xl shadow-cyan-950/30"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="text-sm text-slate-400">{plan.name}</div>
              <div className="mt-3 text-4xl font-semibold">{plan.price}</div>
              <p className="mt-4 text-sm leading-7 text-slate-400">{plan.description}</p>
              <div className="mt-6 space-y-3">
                {plan.items.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                    <FiCheck className="mt-1 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link className="docshield-primary-button mt-8 w-full justify-center" to="/signup">
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
