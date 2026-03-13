import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, ShoppingBag, Heart, CreditCard, Settings, LogOut, Package, Clock, CheckCircle, XCircle, Trash2, Eye, ShoppingCart, Star, Search, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchApi } from "../../utils/api";
import { getWishlist, removeFromWishlist } from "../../utils/wishlist";

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [trackingId, setTrackingId] = useState("");
  const navigate = useNavigate();

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    let userData = null;
    try {
      userData = JSON.parse(localStorage.getItem("admin_user") || "null");
    } catch (e) {
      userData = null;
    }
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
    setWishlist(getWishlist());

    const loadData = async () => {
      try {
        const ordersRes = await fetchApi("/api/orders");
        if (ordersRes.ok) {
          const allOrders = await ordersRes.json();
          if (Array.isArray(allOrders)) {
            const userOrders = allOrders.filter((o: any) => o.user_id === userData.id || o.sender_number === userData.contact_number);
            setOrders(userOrders);
          }
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    navigate("/");
  };

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
    setWishlist(getWishlist());
    toast.success("Removed from wishlist");
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi(`/api/profile/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
      });
      if (res.ok) {
        localStorage.setItem("admin_user", JSON.stringify(user));
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({ ...user, profile_image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    const order = orders.find(o => 
      o.id.toString() === trackingId.trim() || 
      `ORD-${o.id}` === trackingId.trim().toUpperCase() ||
      `#${o.id}` === trackingId.trim()
    );
    
    if (order) {
      setViewOrder(order);
      setTrackingId("");
    } else {
      toast.error("Order not found. Please check your Order ID.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.startsWith('[')) {
        const parsed = JSON.parse(url);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : url;
      }
    } catch (e) {
      return url;
    }
    return url;
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Wishlist Items", value: wishlist.length, icon: Heart, color: "bg-red-50 text-red-600 border-red-100" },
    { label: "Pending Orders", value: orders.filter(o => o?.status?.toLowerCase() === 'pending').length, icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-100" },
    { label: "Completed", value: orders.filter(o => o?.status?.toLowerCase() === 'completed').length, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome back, {user.full_name || user.username}!</h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                Customer
              </span>
            </div>
            <p className="text-zinc-500 text-lg">Manage your orders, wishlist and profile settings.</p>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border ${stat.color} shadow-sm flex items-center gap-4`}>
                <div className={`p-3 rounded-2xl bg-white shadow-sm`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View All <Eye size={16} />
                </button>
              </div>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="text-zinc-400" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate">{order.product_name || `Order #${order.id}`}</p>
                        <p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-900">${(order.total_price || 0).toFixed(2)}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No orders yet.</p>
              )}
            </div>

            {/* Wishlist Preview */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900">Wishlist Items</h2>
                <button onClick={() => setActiveTab('wishlist')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View All <Eye size={16} />
                </button>
              </div>
              {wishlist.length > 0 ? (
                <div className="space-y-4">
                  {wishlist.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                        <img 
                          src={getImageUrl(item.image_url)} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate">{item.name}</p>
                        <p className="text-xs text-emerald-600 font-medium">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-900">${(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">Your wishlist is empty.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">Order History</h2>
            <form onSubmit={handleTrackOrder} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Track by Order ID..." 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm w-full md:w-64"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors">
                Track
              </button>
            </form>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="p-6 rounded-2xl border border-zinc-100 hover:border-emerald-200 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                        <Package className="text-zinc-400 group-hover:text-emerald-500" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-lg">{order.product_name || `Order #${order.id}`}</p>
                        <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                          <span className="flex items-center gap-1"><Clock size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                          <span>Qty: {order.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-zinc-900">${(order.total_price || 0).toFixed(2)}</p>
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => setViewOrder(order)}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
              <h3 className="text-xl font-bold text-zinc-900 mb-2">No orders found</h3>
              <p className="text-zinc-500 max-w-md mx-auto mb-8">
                You haven't placed any orders yet. Start shopping to see your order history.
              </p>
              <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                Start Shopping
              </button>
            </div>
          )}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">My Wishlist</h2>
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="group border border-zinc-200 rounded-2xl overflow-hidden hover:border-emerald-500 transition-all bg-white flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-zinc-100">
                    <img 
                      src={getImageUrl(item.image_url)} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button 
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}/product/${item.id}`;
                          if (navigator.share) {
                            navigator.share({
                              title: item.name,
                              text: `Check out this product: ${item.name}`,
                              url: url,
                            }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(url);
                            toast.success("Link copied to clipboard!");
                          }
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm text-blue-500 rounded-full shadow-sm hover:bg-blue-500 hover:text-white transition-all"
                        title="Share product"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-zinc-900 mb-1 truncate">{item.name}</h3>
                    <p className="text-emerald-600 font-extrabold mb-4">${(item.price || 0).toFixed(2)}</p>
                    <div className="mt-auto">
                      <button 
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all"
                      >
                        <Eye size={16} /> View Product
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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
        </div>
      )}

      {/* Payment Settings Tab */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">Payment Settings</h2>
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
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Order #{viewOrder.id.toString().padStart(6, '0')}</h3>
                <p className="text-sm text-zinc-500 mt-1">Placed on {new Date(viewOrder.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Order Tracking Timeline */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-zinc-900 mb-6">Order Status</h4>
                <div className="relative">
                  {/* Progress Bar Background */}
                  <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-zinc-100"></div>
                  
                  {/* Progress Bar Fill */}
                  <div 
                    className="absolute left-[21px] top-2 w-0.5 bg-emerald-500 transition-all duration-1000"
                    style={{ 
                      height: 
                        viewOrder.status?.toLowerCase() === 'completed' ? '100%' :
                        viewOrder.status?.toLowerCase() === 'shipped' ? '66%' :
                        viewOrder.status?.toLowerCase() === 'processing' ? '33%' : '0%'
                    }}
                  ></div>

                  <div className="space-y-8 relative">
                    {/* Step 1: Pending */}
                    <div className="flex gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${
                        ['pending', 'processing', 'shipped', 'completed'].includes(viewOrder.status?.toLowerCase()) 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        <Clock size={20} />
                      </div>
                      <div className="pt-2">
                        <h5 className={`font-bold ${['pending', 'processing', 'shipped', 'completed'].includes(viewOrder.status?.toLowerCase()) ? 'text-zinc-900' : 'text-zinc-500'}`}>Order Placed</h5>
                        <p className="text-sm text-zinc-500 mt-1">We have received your order.</p>
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${
                        ['processing', 'shipped', 'completed'].includes(viewOrder.status?.toLowerCase()) 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        <Package size={20} />
                      </div>
                      <div className="pt-2">
                        <h5 className={`font-bold ${['processing', 'shipped', 'completed'].includes(viewOrder.status?.toLowerCase()) ? 'text-zinc-900' : 'text-zinc-500'}`}>Processing</h5>
                        <p className="text-sm text-zinc-500 mt-1">Your order is being prepared for shipping.</p>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${
                        ['shipped', 'completed'].includes(viewOrder.status?.toLowerCase()) 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div className="pt-2">
                        <h5 className={`font-bold ${['shipped', 'completed'].includes(viewOrder.status?.toLowerCase()) ? 'text-zinc-900' : 'text-zinc-500'}`}>Shipped</h5>
                        <p className="text-sm text-zinc-500 mt-1">Your order is on the way.</p>
                      </div>
                    </div>

                    {/* Step 4: Completed */}
                    <div className="flex gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${
                        viewOrder.status?.toLowerCase() === 'completed'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        <CheckCircle size={20} />
                      </div>
                      <div className="pt-2">
                        <h5 className={`font-bold ${viewOrder.status?.toLowerCase() === 'completed' ? 'text-zinc-900' : 'text-zinc-500'}`}>Delivered</h5>
                        <p className="text-sm text-zinc-500 mt-1">Your order has been delivered.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details Summary */}
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <h4 className="text-lg font-bold text-zinc-900 mb-4">Order Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Product</span>
                    <span className="font-medium text-zinc-900 text-right max-w-[60%]">{viewOrder.product_name || `Product #${viewOrder.product_id}`}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Quantity</span>
                    <span className="font-medium text-zinc-900">{viewOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Current Status</span>
                    <span className={`font-bold uppercase ${getStatusColor(viewOrder.status)} px-2 py-0.5 rounded-full text-[10px]`}>
                      {viewOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 pt-4">
                    <span className="text-zinc-900 font-bold">Total Amount</span>
                    <span className="font-bold text-emerald-600 text-lg">${(viewOrder.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
              <button onClick={() => setViewOrder(null)} className="w-full px-4 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
