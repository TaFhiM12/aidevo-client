import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const pulseTransition = {
  repeat: Infinity,
  repeatType: "mirror",
  duration: 6,
  ease: "easeInOut",
};

const SignIn = () => {
  const { signInUser, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetStatus, setResetStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    setRememberMe(remembered);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Signing you in...");

      await signInUser(email.trim(), password);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      setSuccess("Signed in successfully. Redirecting to dashboard...");
      toast.success("Welcome back to Aidevo", { id: loadingToast });

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (authError) {
      console.error("Sign in error:", authError);

      let message = "Sign in failed. Please check your credentials.";

      switch (authError?.code) {
        case "auth/invalid-email":
          message = "Invalid email format.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your internet connection.";
          break;
        default:
          break;
      }

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      const msg = "Enter your account email first.";
      setResetStatus({ type: "error", message: msg });
      toast.error(msg);
      return;
    }

    try {
      setIsResetLoading(true);
      const loadingToast = toast.loading("Sending reset link...");

      await resetPassword(normalizedEmail);

      const msg = `Password reset link sent to ${normalizedEmail}.`;
      setResetStatus({ type: "success", message: msg });
      toast.success("Reset link sent", { id: loadingToast });
    } catch (resetError) {
      console.error("Reset password error:", resetError);

      let message = "Could not send reset email. Please try again.";

      switch (resetError?.code) {
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later.";
          break;
        default:
          break;
      }

      setResetStatus({ type: "error", message });
      toast.error(message);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50 text-slate-900">
      <motion.div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={pulseTransition}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-sky-300/35 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={pulseTransition}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"
        animate={{ x: [0, -35, 0], y: [0, 20, 0] }}
        transition={pulseTransition}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:px-8 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-sky-100 bg-white/85 p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(2,132,199,0.15)]"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-700">
            <Sparkles className="h-3.5 w-3.5" />
            One Account Login
          </div>

          <h1 className="mb-3 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            One Door For Every Aidevo Member
          </h1>
          <p className="mb-8 max-w-md text-slate-600">
            No separate student or organization entry points. Use the same sign-in experience for everyone.
          </p>

          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Unified Access</p>
              <p className="mt-1 text-xs text-slate-600">
                Your account role is detected automatically after sign-in.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Secure Authentication</p>
              <p className="mt-1 text-xs text-slate-600">
                Role-safe dashboard routing and permissions are handled behind the scenes.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Clean Experience</p>
              <p className="mt-1 text-xs text-slate-600">
                One login, one signup path, less confusion.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="rounded-3xl border border-sky-100 bg-white/95 p-8 text-slate-800 shadow-[0_20px_70px_rgba(14,116,144,0.18)]"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign In</h2>
            <p className="mt-2 text-sm text-slate-600">
              Continue with your Aidevo account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting || isResetLoading}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-60"
                >
                  {isResetLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-10 py-3 pr-11 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {resetStatus.type && (
              <div
                className={`rounded-xl border px-3 py-2 text-xs ${
                  resetStatus.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {resetStatus.message}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-semibold">Smart Role Routing Enabled</span>
            </div>
            <p className="mt-1">After login, Aidevo automatically directs each user to the correct dashboard experience.</p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to Aidevo?{" "}
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 font-semibold text-sky-600 hover:text-sky-700"
            >
              Create one account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default SignIn;
