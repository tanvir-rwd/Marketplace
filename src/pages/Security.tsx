import { useState, useEffect } from "react";
import { ShieldCheck, Mail, Smartphone, Lock, Check, AlertTriangle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchApi } from "../utils/api";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

export default function Security() {
  const [user, setUser] = useState<any>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("admin_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleDeleteRequest = async () => {
    if (!user) return;
    try {
      const res = await fetchApi(`/api/users/${user.id}/request-deletion`, { method: "POST" });
      if (res.ok) {
        toast.success("Deletion request submitted");
        const updatedUser = { ...user, deletion_requested: 1 };
        setUser(updatedUser);
        localStorage.setItem("admin_user", JSON.stringify(updatedUser));
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Security & Verification</h1>
        <p className="text-zinc-500">Configure authentication security and verification settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <Mail size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Email Verification Control</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-900">Require Email Verification</p>
                  <p className="text-sm text-zinc-500">New users must verify their email before logging in.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-900">Verification Link Expiry</p>
                  <p className="text-sm text-zinc-500">Set how long the verification link remains valid.</p>
                </div>
                <select className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                  <option>24 Hours</option>
                  <option>48 Hours</option>
                  <option>1 Hour</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Smartphone size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">OTP Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-900">Enable 2FA via Email OTP</p>
                  <p className="text-sm text-zinc-500">Receive verification codes via your registered email.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-900">Enable 2FA via SMS OTP</p>
                  <p className="text-sm text-zinc-500">Receive verification codes via SMS to your phone.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-900">Enable 2FA via WhatsApp</p>
                  <p className="text-sm text-zinc-500">Receive verification codes via WhatsApp (uses Profile number).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 mt-4">
                <div>
                  <p className="font-semibold text-zinc-900">Default OTP Delivery Method</p>
                  <p className="text-sm text-zinc-500">Select how you want to receive OTPs by default.</p>
                </div>
                <select className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                  <option>Send OTP via Email</option>
                  <option>Send OTP via SMS</option>
                  <option>Send OTP via WhatsApp</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div>
                <p className="text-sm font-bold text-zinc-900">Account Deletion</p>
                <p className="text-xs text-zinc-500">Permanently remove your account and data.</p>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={user?.deletion_requested === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  user?.deletion_requested === 1
                    ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 size={14} />
                {user?.deletion_requested === 1 ? "Deletion Requested" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-emerald-500" size={24} />
              <h3 className="font-bold">Security Status</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "SSL Certificate", status: "Active" },
                { label: "Firewall", status: "Active" },
                { label: "Brute Force Protection", status: "Active" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <Check size={14} />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-3 mb-3 text-amber-800">
              <AlertTriangle size={20} />
              <h3 className="font-bold">Security Tip</h3>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed">
              Regularly audit your administrator list and ensure all staff are using strong, unique passwords with 2FA enabled.
            </p>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteRequest}
        title="Request Account Deletion"
        message="Are you sure you want to request account deletion? This action requires Admin approval and cannot be undone."
      />
    </div>
  );
}
