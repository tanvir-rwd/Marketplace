import { useState, useEffect, ChangeEvent } from "react";
import { User, Camera, Mail, Phone, User as UserIcon, Save, Shield, CheckCircle, MapPin, Info, Wallet, Smartphone, Bitcoin, CreditCard, Lock, ShieldCheck, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { fetchApi } from "../utils/api";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'payment'>('info');

  useEffect(() => {
    const userData = localStorage.getItem("admin_user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      fetchUserProfile(parsedUser.id);
    }
  }, []);

  const fetchUserProfile = async (id: number) => {
    try {
      const response = await fetchApi(`/api/users/${id}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, profile_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetchApi(`/api/profile/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(user),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        const userData = localStorage.getItem("admin_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          const updated = { ...parsed, ...user };
          localStorage.setItem("admin_user", JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Profile</h1>
          <p className="text-zinc-500">Manage your account settings and personal information.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save size={20} />
          )}
          Update Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-zinc-50 border-b border-zinc-100"></div>
            
            <div className="relative mt-4 group">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-zinc-400 text-4xl font-bold z-10 relative">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  (user.full_name || user.username || "U").charAt(0)
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-emerald-700 transition-all z-20 hover:scale-110 active:scale-95">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="mt-6 relative z-10">
              <h3 className="text-xl font-bold text-zinc-900">{user.full_name || "User Name"}</h3>
              <p className="text-zinc-500 font-medium">@{user.username}</p>
              
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Shield size={12} />
                  {user.role?.replace('_', ' ')}
                </span>
                {user.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {user.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-zinc-400" />
              Account Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">User ID</span>
                <span className="text-zinc-900 font-mono font-medium">#{user.id}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Total Orders</span>
                <span className="text-zinc-900 font-medium">{user.total_orders || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span className={`${user.status === 'Active' ? 'text-emerald-600' : 'text-red-600'} font-bold`}>{user.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-zinc-100">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'info' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                Profile Information
              </button>
              <button 
                onClick={() => setActiveTab('payment')}
                className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'payment' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                Payment Settings
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'info' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <UserIcon size={16} className="text-zinc-400" />
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={user.full_name || ""}
                      onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <span className="text-zinc-400 font-mono text-xs">@</span>
                      Username
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={user.username || ""}
                        disabled
                        className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 cursor-not-allowed outline-none font-medium"
                      />
                      <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400">Username is permanent and cannot be changed.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-zinc-400" />
                      Admin Role
                    </label>
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-bold text-sm uppercase tracking-wider">
                      {user.role?.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <CheckCircle size={16} className="text-zinc-400" />
                      Account Status
                    </label>
                    <button
                      onClick={() => setUser({ ...user, status: user.status === 'Active' ? 'Disabled' : 'Active' })}
                      className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-between transition-all ${
                        user.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {user.status === 'Active' ? 'Active' : 'Deactivated'}
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${user.status === 'Active' ? 'left-6' : 'left-1'}`}></div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <Mail size={16} className="text-zinc-400" />
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={user.email || ""}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <Phone size={16} className="text-zinc-400" />
                      Contact Number
                    </label>
                    <input 
                      type="text" 
                      value={user.contact_number || ""}
                      onChange={(e) => setUser({ ...user, contact_number: e.target.value })}
                      placeholder="+880 1XXX-XXXXXX"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <MessageCircle size={16} className="text-emerald-500" />
                      WhatsApp Number
                    </label>
                    <input 
                      type="text" 
                      value={user.whatsapp_number || ""}
                      onChange={(e) => setUser({ ...user, whatsapp_number: e.target.value })}
                      placeholder="+880 1XXX-XXXXXX"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                    <p className="text-[10px] text-zinc-400">Used for WhatsApp OTP Verification.</p>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <MapPin size={16} className="text-zinc-400" />
                      Address
                    </label>
                    <textarea 
                      value={user.address || ""}
                      onChange={(e) => setUser({ ...user, address: e.target.value })}
                      placeholder="Enter your full address"
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-zinc-500 italic">
                    To update detailed payment information, please visit our <a href="/settings" className="text-emerald-600 font-semibold hover:underline">Settings</a> page.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Smartphone size={16} className="text-zinc-400" />
                        bKash Number
                      </label>
                      <input 
                        type="text" 
                        value={user.bkash || ""}
                        onChange={(e) => setUser({ ...user, bkash: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Smartphone size={16} className="text-zinc-400" />
                        bKash Type
                      </label>
                      <select 
                        value={user.bkash_type || "Personal"}
                        onChange={(e) => setUser({ ...user, bkash_type: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Merchant">Merchant</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Smartphone size={16} className="text-zinc-400" />
                        Nagad Number
                      </label>
                      <input 
                        type="text" 
                        value={user.nagad || ""}
                        onChange={(e) => setUser({ ...user, nagad: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Smartphone size={16} className="text-zinc-400" />
                        Nagad Type
                      </label>
                      <select 
                        value={user.nagad_type || "Personal"}
                        onChange={(e) => setUser({ ...user, nagad_type: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Merchant">Merchant</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Wallet size={16} className="text-zinc-400" />
                        Rocket Number
                      </label>
                      <input 
                        type="text" 
                        value={user.rocket || ""}
                        onChange={(e) => setUser({ ...user, rocket: e.target.value })}
                        placeholder="01XXXXXXXXX-X"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Wallet size={16} className="text-zinc-400" />
                        Rocket Type
                      </label>
                      <select 
                        value={user.rocket_type || "Personal"}
                        onChange={(e) => setUser({ ...user, rocket_type: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Bitcoin size={16} className="text-zinc-400" />
                        Binance ID / Email
                      </label>
                      <input 
                        type="text" 
                        value={user.binance || ""}
                        onChange={(e) => setUser({ ...user, binance: e.target.value })}
                        placeholder="ID or Email"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Bitcoin size={16} className="text-zinc-400" />
                        Binance Type
                      </label>
                      <select 
                        value={user.binance_type || "Binance Pay"}
                        onChange={(e) => setUser({ ...user, binance_type: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      >
                        <option value="Binance Pay">Binance Pay</option>
                        <option value="Wallet">Wallet</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-600 p-8 rounded-2xl text-white relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
              <div className="max-w-md">
                <h3 className="text-xl font-bold">Profile Security</h3>
                <p className="text-emerald-100 text-sm mt-2">
                  Your profile information is encrypted and securely stored. We never share your personal data with third parties.
                </p>
              </div>
              <Shield size={64} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
