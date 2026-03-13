import { useState, useEffect } from "react";
import { Search, X, ShoppingBag, Clock, Activity, Eye, Phone, Mail, MapPin, Package, ShoppingCart, CheckCircle, XCircle, Trash2, ShieldAlert } from "lucide-react";
import { UserRole, User } from "../types";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ActionModal } from "../components/ActionModal";
import { fetchApi } from "../utils/api";

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'sales' | 'cart'>('orders');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          fetchApi(`/api/users/${user.id}/orders`),
          fetchApi(`/api/users/${user.id}/cart`)
        ];
        
        if (user.role === UserRole.SELLER) {
          promises.push(fetchApi(`/api/users/${user.id}/sales`));
          setActiveTab('sales');
        }

        const responses = await Promise.all(promises);
        const ordersData = await responses[0].json();
        const cartData = await responses[1].json();
        
        setOrders(ordersData);
        setCartItems(cartData);
        
        if (user.role === UserRole.SELLER && responses[2]) {
          const salesData = await responses[2].json();
          setSales(salesData);
        }
      } catch (error) {
        toast.error("Failed to fetch user details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.id, user.role]);

  const stats = {
    successful: user.role === UserRole.SELLER 
      ? sales.filter(o => o.status === 'completed' || o.status === 'approved').length
      : orders.filter(o => o.status === 'completed' || o.status === 'approved').length,
    pending: user.role === UserRole.SELLER
      ? sales.filter(o => o.status === 'pending').length
      : orders.filter(o => o.status === 'pending').length,
    cancelled: user.role === UserRole.SELLER
      ? sales.filter(o => o.status === 'cancelled' || o.status === 'rejected').length
      : orders.filter(o => o.status === 'cancelled' || o.status === 'rejected').length,
    cart: cartItems.length
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl border-2 border-white shadow-sm overflow-hidden">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (user.full_name || "U").charAt(0)
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{user.full_name || "N/A"}</h3>
              <p className="text-xs text-zinc-500">@{user.username} • <span className="font-bold uppercase">{user.role}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact & Address */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 space-y-4">
                <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                  <Phone size={16} className="text-emerald-600" />
                  Contact Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={14} className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-700 break-all">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={14} className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-700">{user.contact_number || "Not provided"}</span>
                  </div>
                  {user.whatsapp_number && (
                    <div className="flex items-center gap-3 text-sm">
                      <Activity size={14} className="text-emerald-500 shrink-0" />
                      <span className="text-zinc-700">{user.whatsapp_number} (WhatsApp)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 space-y-4">
                <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-600" />
                  Delivery Address
                </h4>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {user.address || "No address provided yet."}
                </p>
              </div>
            </div>

            {/* Stats & History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{stats.successful}</p>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mt-1">
                    {user.role === UserRole.SELLER ? "Sales" : "Bought"}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mt-1">Pending</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-wider mt-1">Cancelled</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.cart}</p>
                  <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mt-1">In Cart</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="flex border-b border-zinc-100 bg-zinc-50">
                  {user.role === UserRole.SELLER && (
                    <button 
                      onClick={() => setActiveTab('sales')}
                      className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'sales' ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Selling History
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'orders' ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                  >
                    {user.role === UserRole.SELLER ? "Purchase History" : "Order History"}
                  </button>
                  <button 
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'cart' ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                  >
                    Cart Items
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : activeTab === 'sales' ? (
                    <div className="divide-y divide-zinc-100">
                      {sales.length > 0 ? sales.map((sale) => (
                        <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <img 
                              src={sale.image_url?.startsWith('[') ? JSON.parse(sale.image_url)[0] : sale.image_url} 
                              alt={sale.product_name} 
                              className="w-12 h-12 rounded-lg object-cover border border-zinc-200" 
                              referrerPolicy="no-referrer" 
                            />
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{sale.product_name}</p>
                              <p className="text-xs text-zinc-500">Sold to: <span className="font-semibold">{sale.customer_name}</span></p>
                              <p className="text-xs text-zinc-500">Qty: {sale.quantity} • ${sale.total_price}</p>
                              <p className="text-[10px] text-zinc-400">{new Date(sale.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            sale.status === 'completed' || sale.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            sale.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {sale.status}
                          </span>
                        </div>
                      )) : (
                        <div className="p-12 text-center text-zinc-500">
                          <Package size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No sales history found.</p>
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'orders' ? (
                    <div className="divide-y divide-zinc-100">
                      {orders.length > 0 ? orders.map((order) => (
                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <img 
                              src={order.image_url?.startsWith('[') ? JSON.parse(order.image_url)[0] : order.image_url} 
                              alt={order.product_name} 
                              className="w-12 h-12 rounded-lg object-cover border border-zinc-200" 
                              referrerPolicy="no-referrer" 
                            />
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{order.product_name}</p>
                              <p className="text-xs text-zinc-500">Qty: {order.quantity} • ${order.total_price}</p>
                              <p className="text-[10px] text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'completed' || order.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      )) : (
                        <div className="p-12 text-center text-zinc-500">
                          <Package size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No purchase history found.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {cartItems.length > 0 ? cartItems.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.image_url?.startsWith('[') ? JSON.parse(item.image_url)[0] : item.image_url} 
                              alt={item.product_name} 
                              className="w-12 h-12 rounded-lg object-cover border border-zinc-200" 
                              referrerPolicy="no-referrer" 
                            />
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{item.product_name}</p>
                              <p className="text-xs text-zinc-500">Qty: {item.quantity} • ${item.price} each</p>
                              <p className="text-[10px] text-zinc-400">Added {new Date(item.added_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <ShoppingCart size={14} />
                          </div>
                        </div>
                      )) : (
                        <div className="p-12 text-center text-zinc-500">
                          <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                          <p>Cart is currently empty.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{ userId: number | string | null, type: 'delete' | 'restrict' | null }>({ userId: null, type: null });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("admin_user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetchApi("/api/users");
      const data = await response.json();
      // Filter out admins from user management
      const userList = data.filter((u: User) => u.role === UserRole.USER || u.role === UserRole.SELLER);
      setUsers(userList);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (target_user_id: number | string, action_type: 'delete' | 'restrict', description: string) => {
    if (!currentUser) return;
    try {
      const response = await fetchApi(`/api/admin/pending-actions`, {
        method: "POST",
        body: JSON.stringify({ target_user_id, admin_id: currentUser.id, action_type, description })
      });
      if (response.ok) {
        toast.success("Action submitted for approval");
        fetchUsers();
      } else {
        toast.error("Failed to submit action");
      }
    } catch (error) {
      toast.error("Failed to submit action");
    }
  };

  const handleApproveDeletion = async (id: number | string, approve: boolean) => {
    try {
      const response = await fetchApi(`/api/admin/pending-actions/${id}/${approve ? 'approve' : 'reject'}`, {
        method: "POST"
      });
      if (response.ok) {
        toast.success(approve ? "Action approved" : "Request rejected");
        fetchUsers();
        fetchPendingActions();
      }
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  const [pendingActions, setPendingActions] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingActions();
  }, []);

  const fetchPendingActions = async () => {
    const response = await fetchApi("/api/admin/pending-actions");
    const data = await response.json();
    setPendingActions(data);
  };

  const deletionRequests = pendingActions;
  const regularUsers = users.filter(u => u.deletion_requested !== 1);

  const filteredUsers = regularUsers.filter(user => 
    (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-100 text-emerald-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Suspended":
      case "Restricted": return "bg-red-100 text-red-700";
      default: return "bg-zinc-100 text-zinc-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">User Management</h1>
          <p className="text-zinc-500">View customer details, order history, and cart activity.</p>
        </div>
      </div>

      {deletionRequests.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl overflow-hidden">
          <div className="p-4 bg-red-100/50 border-b border-red-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
              <Trash2 size={16} />
              Pending Admin Actions ({deletionRequests.length})
            </h3>
          </div>
          <div className="divide-y divide-red-100">
            {deletionRequests.map(action => (
              <div key={action.id} className="p-4 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold overflow-hidden border border-zinc-200">
                    {action.target_profile_image ? (
                      <img src={action.target_profile_image} alt={action.target_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      (action.target_name || "U").charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{action.target_name || "N/A"} ({action.target_email})</p>
                    <p className="text-xs text-zinc-500 capitalize">{action.action_type} requested by {action.admin_name}</p>
                    <p className="text-xs text-zinc-600 mt-1 italic">"{action.description}"</p>
                  </div>
                </div>
                {currentUser?.role === 'super_admin' ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleApproveDeletion(action.id, true)}
                      className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-1"
                    >
                      <CheckCircle size={12} />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApproveDeletion(action.id, false)}
                      className="px-3 py-1.5 bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-lg hover:bg-zinc-300 transition-all flex items-center gap-1"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100 italic text-[10px]">
                    <Clock size={12} />
                    Awaiting Super Admin
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role & Category</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Activity Summary</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No users found</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold overflow-hidden border border-zinc-200">
                        {user.profile_image ? (
                          <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          (user.full_name || "U").charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{user.full_name || "N/A"}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                        <p className="text-[10px] text-zinc-400">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === UserRole.SELLER ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {user.role}
                      </span>
                      {user.category && (
                        <p className="text-[10px] text-zinc-500 italic">{user.category}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-[10px]">
                      <span className="flex items-center gap-1 text-zinc-500">
                        <ShoppingBag size={10} />
                        {user.total_orders || 0} Orders
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock size={10} />
                        {user.pending_orders || 0} Pending
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(user.status)}`}>
                      <span className={`w-1 h-1 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-zinc-400"}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingUser(user)}
                        className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      {['admin', 'super_admin'].includes(currentUser?.role || '') && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setActionModal({ userId: user.id, type: 'restrict' })}
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Restrict User"
                          >
                            <ShieldAlert size={18} />
                          </button>
                          <button 
                            onClick={() => setActionModal({ userId: user.id, type: 'delete' })}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingUser && (
        <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      {actionModal.userId && actionModal.type && (
        <ActionModal
          isOpen={!!actionModal.userId}
          onClose={() => setActionModal({ userId: null, type: null })}
          targetUserId={actionModal.userId}
          actionType={actionModal.type}
          onConfirm={(desc) => handleRequestAction(actionModal.userId!, actionModal.type!, desc)}
        />
      )}
    </div>
  );
}
