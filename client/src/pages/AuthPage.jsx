import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiLock, FiShield } from "react-icons/fi";
import axiosInstance from "../config/axiosInstance";
import { setSession } from "../redux/slice/auth/authSlice";

const AuthPage = ({ mode = "login" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const response = await axiosInstance.post("/users/login", {
          email: form.email,
          password: form.password,
        });
        dispatch(setSession({ user: response.data.user, token: response.data.token }));
        toast.success("Welcome to DocShield");
        navigate("/dashboard");
      } else {
        await axiosInstance.post("/users/register", form);
        toast.success("Account created. Log in to continue.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.2),rgba(15,23,42,0.96))] p-8 lg:p-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300">
            <FiArrowLeft />
            Back to website
          </Link>
          <div className="mt-12 max-w-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
              <FiShield className="text-2xl" />
            </div>
            <h1 className="mt-8 text-4xl font-semibold">
              {isLogin ? "Welcome back to DocShield." : "Create your secure document workspace."}
            </h1>
            <p className="mt-4 text-slate-300">
              Manage expiring links, protected print flows, access analytics, and premium share controls from one startup-grade dashboard.
            </p>
            <div className="mt-8 space-y-4 text-sm text-slate-200">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <FiLock className="mt-1 text-cyan-300" />
                JWT authentication and persistent sessions
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <FiLock className="mt-1 text-cyan-300" />
                View-only, print-only, and download-controlled links
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white p-8 text-slate-900 shadow-2xl shadow-slate-950/40 lg:p-10">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              {isLogin ? "Sign in" : "Register"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {isLogin ? "Open your vault" : "Start with a founder-grade MVP"}
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                <input
                  className="docshield-input"
                  name="fullname"
                  value={form.fullname}
                  onChange={updateField}
                  placeholder="Rakesh Kumar"
                  required
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                className="docshield-input"
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@company.com"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                className="docshield-input"
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <button className="docshield-primary-button w-full justify-center" disabled={loading} type="submit">
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            {isLogin ? "New to DocShield?" : "Already have an account?"}{" "}
            <Link className="font-medium text-cyan-700" to={isLogin ? "/signup" : "/login"}>
              {isLogin ? "Create one" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
