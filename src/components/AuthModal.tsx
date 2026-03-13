import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, Key } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../utils/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "user_login" | "admin_login" | "signup" | "verify";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("user_login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form States
  const [identifier, setIdentifier] = useState(""); // email or username
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMethod, setOtpMethod] = useState<"email" | "sms" | "whatsapp">("email");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetchApi("/api/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Registration successful! Check console for OTP.");
          setMode("verify");
        } else {
          toast.error(data.error || "Registration failed");
        }
      } else if (mode === "verify") {
        const res = await fetchApi("/api/verify-otp", {
          method: "POST",
          body: JSON.stringify({ email, otp }),
        });
        if (res.ok) {
          toast.success("Email verified! You can now login.");
          setMode("user_login");
        } else {
          const data = await res.json();
          toast.error(data.error || "Verification failed");
        }
      } else {
        // Login (User or Admin)
        const loginType = mode === "admin_login" ? "admin" : "user";
        const res = await fetchApi("/api/login", {
          method: "POST",
          body: JSON.stringify({ identifier, password, loginType }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("admin_user", JSON.stringify(data));
          toast.success(`Welcome back, ${data.username}!`);
          onClose();
          if (data.role !== 'user') {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        } else {
          if (data.needsVerification) {
            setEmail(data.email);
            setMode("verify");
          }
          toast.error(data.error || "Login failed");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-farm-green/20"
      >
        {/* Header */}
        <div className="bg-farm-green p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 hover:rotate-90 transition-transform bg-white/20 p-2 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-4 rounded-3xl mb-4 shadow-inner">
              {mode === "admin_login" ? <ShieldCheck className="w-10 h-10" /> : <UserIcon className="w-10 h-10" />}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              {mode === "user_login" && "User Login"}
              {mode === "admin_login" && "Admin Portal"}
              {mode === "signup" && "Join the Farm"}
              {mode === "verify" && "Verify Account"}
            </h2>
            <p className="text-white/80 mt-2 font-medium">
              {mode === "user_login" && "Access your farm marketplace"}
              {mode === "admin_login" && "Management access for authorized staff"}
              {mode === "signup" && "Create your account to start trading"}
              {mode === "verify" && `Enter the 6-digit OTP sent to your ${otpMethod === 'whatsapp' ? 'WhatsApp' : otpMethod}`}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-100 focus:border-farm-green outline-none transition-all font-medium bg-stone-50/50"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-100 focus:border-farm-green outline-none transition-all font-medium bg-stone-50/50"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {(mode === "user_login" || mode === "admin_login") && (
                <motion.div
                  key="login-fields"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <input
                      type="text"
                      placeholder="Email or Username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-100 focus:border-farm-green outline-none transition-all font-medium bg-stone-50/50"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {mode === "verify" && (
                <motion.div
                  key="verify-fields"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="flex gap-2 p-1 bg-stone-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setOtpMethod("email")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${otpMethod === "email" ? "bg-white text-farm-green shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpMethod("sms")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${otpMethod === "sms" ? "bg-white text-farm-green shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                    >
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpMethod("whatsapp")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${otpMethod === "whatsapp" ? "bg-white text-farm-green shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                    >
                      WhatsApp
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <input
                      type="text"
                      placeholder="6-Digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-100 focus:border-farm-green outline-none transition-all font-medium bg-stone-50/50 tracking-[0.5em] text-center"
                      maxLength={6}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {mode !== "verify" && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-100 focus:border-farm-green outline-none transition-all font-medium bg-stone-50/50"
                    required
                  />
                </div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-farm-green text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-green-200/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Processing..." : (
                <>
                  {mode === "user_login" && "Login to Account"}
                  {mode === "admin_login" && "Admin Secure Login"}
                  {mode === "signup" && "Create Farm Account"}
                  {mode === "verify" && "Verify & Activate"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm font-bold">
              {mode === "user_login" ? (
                <>
                  <button onClick={() => setMode("signup")} className="text-farm-green hover:underline">Create Account</button>
                  <button onClick={() => setMode("admin_login")} className="text-stone-400 hover:text-barn-red">Admin Portal</button>
                </>
              ) : mode === "admin_login" ? (
                <>
                  <button onClick={() => setMode("user_login")} className="text-farm-green hover:underline">User Login</button>
                  <button onClick={() => setMode("signup")} className="text-stone-400 hover:text-farm-green">Staff Registration</button>
                </>
              ) : (
                <button onClick={() => setMode("user_login")} className="w-full text-center text-farm-green hover:underline">Back to Login</button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
