import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShoppingBag, Heart, CreditCard, Settings, LogOut, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { fetchApi } from "../../utils/api";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("admin_user") || "null");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchUserData(userData.id);
  }, [navigate]);

  const fetchUserData = async (userId: number) => {
    setIsLoading(true);
    try {
      let currentUserData = user;
      const userRes = await fetchApi(`/api/users/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        localStorage.setItem("admin_user", JSON.stringify(userData));
        currentUserData = userData;
      }

      // Fetch user orders
      const ordersRes = await fetchApi("/api/orders");
      if (ordersRes.ok) {
        const allOrders = await ordersRes.json();
        if (Array.isArray(allOrders)) {
          // Filter by user's ID or contact number
          const userOrders = allOrders.filter((o: any) => o.user_id === currentUserData?.id || o.sender_number === currentUserData?.contact_number);
          setOrders(userOrders);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [viewOrder, setViewOrder] = useState<any | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, profile_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_user");
    navigate("/");
    window.location.reload();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi(`/api/profile/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          full_name: user.full_name,
          email: user.email,
          contact_number: user.contact_number,
          whatsapp_number: user.whatsapp_number,
          business_name: user.business_name,
          address: user.address,
          bkash: user.bkash,
          nagad: user.nagad,
          rocket: user.rocket,
          binance: user.binance,
        }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        localStorage.setItem("admin_user", JSON.stringify(user));
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome back, {user.full_name || user.username}!</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                  {user.role}
                </span>
              </div>
              <p className="text-zinc-500 text-lg">Manage your orders and profile settings here.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 sticky top-24">
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  <ShoppingBag size={20} /> My Orders
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'wishlist' ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  <Heart size={20} /> Wishlist
                </button>
                <button 
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'payment' ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  <CreditCard size={20} /> Payment Settings
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  <Settings size={20} /> Profile Settings
                </button>
                <div className="pt-4 mt-4 border-t border-zinc-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Order History</h2>
                
                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-zinc-200 rounded-2xl overflow-hidden">
                        <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="text-sm font-bold text-zinc-900">Order #{order.id.toString().padStart(6, '0')}</p>
                            <p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                          <div className="w-20 h-20 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
                            <Package className="text-zinc-400" size={32} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-zinc-900 mb-1">{order.product_name || `Product #${order.product_id}`}</h3>
                            <p className="text-sm text-zinc-500 mb-2">Qty: {order.quantity}</p>
                            <p className="text-sm font-medium text-zinc-700">Payment: {order.payment_method.toUpperCase()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-extrabold text-emerald-600">${order.total_price.toFixed(2)}</p>
                            <button onClick={() => setViewOrder(order)} className="mt-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">View Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">No orders yet</h3>
                    <p className="text-zinc-500">When you place an order, it will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 text-center py-20">
                <Heart className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Your wishlist is empty</h3>
                <p className="text-zinc-500 max-w-md mx-auto mb-8">
                  Save items you love to your wishlist to easily find them later.
                </p>
                <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                  Explore Products
                </button>
              </div>
            )}

            {/* Payment Settings Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900">Payment Settings</h2>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
                    Add More Payment Method
                  </button>
                </div>
                <p className="text-zinc-500 mb-8">Manage your payment methods for faster checkout.</p>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">bKash Number</label>
                      <input 
                        type="text" 
                        value={user.bkash || ""}
                        onChange={(e) => setUser({...user, bkash: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Nagad Number</label>
                      <input 
                        type="text" 
                        value={user.nagad || ""}
                        onChange={(e) => setUser({...user, nagad: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="018XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Rocket Number</label>
                      <input 
                        type="text" 
                        value={user.rocket || ""}
                        onChange={(e) => setUser({...user, rocket: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="019XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Binance Pay ID / Email</label>
                      <input 
                        type="text" 
                        value={user.binance || ""}
                        onChange={(e) => setUser({...user, binance: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="user@binance.com"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-zinc-100">
                    <button type="submit" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                      Save Payment Details
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Profile Settings</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Profile Image</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-zinc-100 overflow-hidden border-2 border-zinc-200">
                          <img src={user.profile_image || `https://ui-avatars.com/api/?name=${user.full_name}`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <label className="px-4 py-2 bg-zinc-100 text-zinc-700 font-bold rounded-xl cursor-pointer hover:bg-zinc-200 transition-colors">
                          Upload New Image
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={user.full_name || ""}
                        onChange={(e) => setUser({...user, full_name: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={user.email || ""}
                        onChange={(e) => setUser({...user, email: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={user.contact_number || ""}
                        onChange={(e) => setUser({...user, contact_number: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">WhatsApp Number</label>
                      <input 
                        type="tel" 
                        value={user.whatsapp_number || ""}
                        onChange={(e) => setUser({...user, whatsapp_number: e.target.value})}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    {user.role === 'seller' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Business Name</label>
                        <input 
                          type="text" 
                          value={user.business_name || ""}
                          onChange={(e) => setUser({...user, business_name: e.target.value})}
                          className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Address</label>
                      <textarea 
                        value={user.address || ""}
                        onChange={(e) => setUser({...user, address: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-zinc-100">
                    <button type="submit" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Order Details Modal */}
            {viewOrder && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-zinc-900 mb-4">Order Details #{viewOrder.id.toString().padStart(6, '0')}</h3>
                  <div className="space-y-3 text-sm text-zinc-700">
                    <p><strong>Product:</strong> {viewOrder.product_name || `Product #${viewOrder.product_id}`}</p>
                    <p><strong>Quantity:</strong> {viewOrder.quantity}</p>
                    <p><strong>Total Price:</strong> ${viewOrder.total_price.toFixed(2)}</p>
                    <p><strong>Status:</strong> {viewOrder.status}</p>
                    <p><strong>Date:</strong> {new Date(viewOrder.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setViewOrder(null)} className="mt-6 w-full px-4 py-2 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
