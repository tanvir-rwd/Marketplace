import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Globe, Upload, Phone, CreditCard, Save, Smartphone, Bitcoin, Wallet, ShieldAlert } from "lucide-react";
import { PaymentMethod } from "../types";
import toast from "react-hot-toast";
import { fetchApi } from "../utils/api";

export default function Settings() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [generalSettings, setGeneralSettings] = useState({
    site_name: "Admin Pro Dashboard",
    support_email: "support@yourwebsite.com",
    contact_phone: "+1 (555) 000-0000",
    site_logo: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("admin_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role);
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsRes, settingsRes] = await Promise.all([
        fetchApi("/api/payment-methods"),
        fetchApi("/api/settings")
      ]);
      
      const payments = await paymentsRes.json();
      const settings = await settingsRes.json();
      
      setPaymentMethods(payments);
      setGeneralSettings({
        site_name: settings.site_name || "Admin Pro Dashboard",
        support_email: settings.support_email || "support@yourwebsite.com",
        contact_phone: settings.contact_phone || "+1 (555) 000-0000",
        site_logo: settings.site_logo || ""
      });
    } catch (error) {
      toast.error("Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole && userRole !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
        <p className="text-zinc-500 max-w-md">
          You do not have permission to access the Site Settings section. This area is restricted to Super Administrators only.
        </p>
      </div>
    );
  }

  const handleUpdateGeneral = async (key: string, value: string) => {
    try {
      const response = await fetchApi("/api/settings", {
        method: "POST",
        body: JSON.stringify({ key, value }),
      });

      if (response.ok) {
        toast.success("Setting updated!");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  const handleUpdateMethod = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;

    try {
      const response = await fetchApi(`/api/payment-methods/${id}`, {
        method: "PUT",
        body: JSON.stringify(method),
      });

      if (response.ok) {
        toast.success(`${method.name} settings updated!`);
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error(`Failed to update ${method.name}`);
    }
  };

  const updateLocalMethod = (id: string, field: keyof PaymentMethod, value: any) => {
    setPaymentMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'bkash':
      case 'nagad':
      case 'rocket': return Smartphone;
      case 'binance': return Bitcoin;
      default: return Wallet;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Website Settings</h1>
          <p className="text-zinc-500">Manage your site's general configuration and identity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Info & Contact Info */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
            <Globe className="text-zinc-400" size={20} />
            <h3 className="font-bold text-zinc-900">General Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Site Name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={generalSettings.site_name}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500 transition-all"
                />
                <button 
                  onClick={() => handleUpdateGeneral('site_name', generalSettings.site_name)}
                  className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Site Logo URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={generalSettings.site_logo}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, site_logo: e.target.value })}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500 transition-all"
                  placeholder="https://example.com/logo.png"
                />
                <button 
                  onClick={() => handleUpdateGeneral('site_logo', generalSettings.site_logo)}
                  className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
            <Phone className="text-zinc-400" size={20} />
            <h3 className="font-bold text-zinc-900">Contact Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Support Email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={generalSettings.support_email}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500 transition-all"
                />
                <button 
                  onClick={() => handleUpdateGeneral('support_email', generalSettings.support_email)}
                  className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Contact Phone</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={generalSettings.contact_phone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contact_phone: e.target.value })}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500 transition-all"
                />
                <button 
                  onClick={() => handleUpdateGeneral('contact_phone', generalSettings.contact_phone)}
                  className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Settings Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <CreditCard className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold text-zinc-900">Manual Payment Methods</h2>
            </div>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all">
              <CreditCard size={16} />
              Add More Payment Method
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-2 py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              paymentMethods.map((method) => {
                const Icon = getIcon(method.id);
                return (
                  <div key={method.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Icon size={20} />
                        </div>
                        <h3 className="font-bold text-zinc-900">{method.name}</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={method.is_enabled === 1} 
                          onChange={(e) => updateLocalMethod(method.id, 'is_enabled', e.target.checked ? 1 : 0)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                          {method.id === 'binance' ? 'Pay ID / Email' : `${method.name} Number`}
                        </label>
                        <input 
                          type="text" 
                          value={method.identifier}
                          onChange={(e) => updateLocalMethod(method.id, 'identifier', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                          {method.id === 'binance' ? 'Network' : 'Account Type'}
                        </label>
                        {method.id === 'binance' ? (
                          <select 
                            value={method.type}
                            onChange={(e) => updateLocalMethod(method.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="Binance Pay">Binance Pay</option>
                            <option value="Wallet">Wallet</option>
                          </select>
                        ) : (
                          <select 
                            value={method.type}
                            onChange={(e) => updateLocalMethod(method.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="Personal">Personal</option>
                            <option value="Merchant">Merchant</option>
                            {method.id === 'rocket' && <option value="Agent">Agent</option>}
                          </select>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Payment Instructions</label>
                        <textarea 
                          rows={2}
                          value={method.instructions}
                          onChange={(e) => updateLocalMethod(method.id, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-emerald-500 resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => handleUpdateMethod(method.id)}
                      className="w-full mt-2 bg-zinc-900 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                    >
                      <Save size={16} />
                      Update {method.name}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
