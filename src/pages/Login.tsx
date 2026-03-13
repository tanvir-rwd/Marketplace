import { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, User, Phone, Briefcase } from "lucide-react";
import { DEMO_SUPER_ADMIN, DEMO_REGULAR_ADMIN } from "../constants";
import toast from "react-hot-toast";
import { fetchApi } from "../utils/api";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(mode !== 'apply');

  useEffect(() => {
    setIsLogin(mode !== 'apply');
  }, [mode]);

  useEffect(() => {
    if (mode === 'super') {
      const hasAccess = sessionStorage.getItem("super_admin_portal_access");
      if (!hasAccess) {
        toast.error("Access Denied. Please use the secure portal link.");
        window.location.href = "/";
      }
    }
  }, [mode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetchApi("/api/login", {
          method: "POST",
          body: JSON.stringify({ identifier: email, password, loginType: 'admin' }),
        });

        const data = await response.json();

        if (response.ok) {
          if (mode === 'super' && data.role !== 'super_admin') {
            toast.error("Only Super Admin can login from here.");
            setIsLoading(false);
            return;
          }
          if (mode !== 'super' && data.role === 'super_admin') {
            toast.error("Super Admin must login through the designated secure portal.");
            setIsLoading(false);
            return;
          }
          
          if (mode === 'super') {
            sessionStorage.removeItem("super_admin_portal_access");
          }

          toast.success("Login successful!");
          localStorage.setItem("admin_user", JSON.stringify(data));
          onLogin();
        } else {
          toast.error(data.error || "Invalid credentials.");
        }
      } else {
        const response = await fetchApi("/api/register", {
          method: "POST",
          body: JSON.stringify({ 
            username: email.split('@')[0], 
            email, 
            password, 
            full_name: fullName,
            whatsapp_number: whatsappNumber,
            business_name: businessName,
            role: 'user', // Starts as user until approved
            pending_role: 'admin',
            status: 'pending'
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Application submitted! Please wait for Super Admin approval.");
          setIsLogin(true);
        } else {
          toast.error(data.error || "Registration failed.");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white mb-4 shadow-lg shadow-emerald-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">{mode === 'super' ? 'Administrator' : 'Admin Panel'}</h1>
          <p className="text-zinc-500 mt-2">
            {isLogin ? "Please enter your details to sign in" : "Apply for Admin Access"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">WhatsApp Number</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Business Name</label>
                <div className="relative group">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    placeholder="Your Business Name"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                placeholder="admin@yourwebsite.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
                <span className="text-zinc-600">Remember me</span>
              </label>
              <a href="#" className="text-emerald-600 font-medium hover:text-emerald-700">Forgot password?</a>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? "Sign In" : "Submit Application"}
          </button>
        </form>

        {mode !== 'super' && (
          <div className="mt-6 text-center text-sm">
            <p className="text-zinc-600">
              {isLogin ? "Need admin access?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
              >
                {isLogin ? "Apply here" : "Sign In"}
              </button>
            </p>
          </div>
        )}

        {isLogin && (
          <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1 text-sm text-emerald-700">
              <p><span className="font-semibold">Email:</span> {mode === 'super' ? DEMO_SUPER_ADMIN.email : DEMO_REGULAR_ADMIN.email}</p>
              <p><span className="font-semibold">Password:</span> {mode === 'super' ? DEMO_SUPER_ADMIN.password : DEMO_REGULAR_ADMIN.password}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
