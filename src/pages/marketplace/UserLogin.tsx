import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Mail, Eye, EyeOff, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { fetchApi } from "../../utils/api";

export default function UserLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [role, setRole] = useState<'user' | 'seller'>('user');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetchApi("/api/login", {
          method: "POST",
          body: JSON.stringify({ identifier: email, password, loginType: role }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Login successful!");
          localStorage.setItem("admin_user", JSON.stringify(data));
          if (data.role === 'seller' || data.role === 'admin' || data.role === 'super_admin') {
            navigate("/admin/dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          toast.error(data.error || "Invalid credentials.");
        }
      } else {
        if (step === 'form') {
          const response = await fetchApi("/api/register", {
            method: "POST",
            body: JSON.stringify({ 
              username: email.split('@')[0], 
              email, 
              password, 
              full_name: fullName,
              role: role,
              status: 'Active'
            }),
          });

          const data = await response.json();

          if (response.ok) {
            toast.success(`OTP sent! (Demo OTP: ${data.demo_otp})`, { duration: 6000 });
            setStep('otp');
          } else {
            toast.error(data.error || "Registration failed.");
          }
        } else if (step === 'otp') {
          const response = await fetchApi("/api/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email, otp }),
          });

          const data = await response.json();

          if (response.ok) {
            toast.success("Account verified! Please login.");
            setIsLogin(true);
            setStep('form');
            setOtp("");
          } else {
            toast.error(data.error || "Invalid OTP.");
          }
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <User size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900">
              {isLogin ? "Welcome Back" : step === 'otp' ? "Verify Email" : "Create an Account"}
            </h1>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'user' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'seller' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && step === 'form' && (
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {(!isLogin && step === 'otp') ? (
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">One-Time Password (OTP)</label>
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all tracking-widest font-mono"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">{isLogin ? "Username or Email" : "Email Address"}</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={isLogin ? "text" : "email"}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder={isLogin ? "username or email" : "you@example.com"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : step === 'otp' ? "Verify Account" : "Create Account"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep('form');
              }}
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>

          {/* Seller-specific links */}
          {role === 'seller' && isLogin && (
            <div className="mt-8 border border-zinc-100 rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
              <div className="p-6">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.05em] mb-2">Need admin access?</p>
                <Link 
                  to="/admin?mode=apply" 
                  className="text-[17px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors inline-block"
                >
                  Apply here
                </Link>
              </div>
              <div className="px-4 py-3 bg-zinc-50/50 border-t border-zinc-100">
                <Link 
                  to="/admin" 
                  className="flex items-center gap-4 p-1 text-zinc-600 hover:text-emerald-600 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-400 group-hover:border-emerald-200 group-hover:text-emerald-600 shadow-sm transition-all">
                    <ShieldCheck size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-[16px] tracking-tight">Admin Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Demo Credentials */}
        {isLogin && (
          <div className="bg-zinc-50 p-6 border-t border-zinc-100">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 text-center">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-zinc-200 text-center cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => {setEmail('user1@demo.com'); setPassword('User@123'); setRole('user');}}>
                <p className="font-bold text-zinc-900">Customer</p>
                <p className="text-zinc-500 text-xs">user1@demo.com</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-zinc-200 text-center cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => {setEmail('seller1@demo.com'); setPassword('Seller@123'); setRole('seller');}}>
                <p className="font-bold text-zinc-900">Seller</p>
                <p className="text-zinc-500 text-xs">seller1@demo.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
