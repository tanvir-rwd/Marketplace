import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  ShieldOff, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  UserCheck, 
  UserX, 
  Activity,
  Globe,
  ShoppingCart,
  Phone,
  Mail,
  User as UserIcon,
  Eye,
  Download,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Package
} from "lucide-react";
import { User, UserRole } from "../types";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ActionModal } from "../components/ActionModal";
import AddSellerModal from "../components/AddSellerModal";
import { fetchApi } from "../utils/api";

export default function SellerManagement() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sellers, setSellers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingSeller, setEditingSeller] = useState<User | null>(null);
  const [viewingSeller, setViewingSeller] = useState<User | null>(null);
  const [deleteSellerId, setDeleteSellerId] = useState<number | string | null>(null);
  const [actionModal, setActionModal] = useState<{ userId: number | string | null, type: 'delete' | 'restrict' | null }>({ userId: null, type: null });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [pendingProducts, setPendingProducts] = useState([
    { id: 1, name: "Organic Honey 500g", price: "$12.99", date: "2 hours ago" },
    { id: 2, name: "Fresh Strawberries", price: "$5.50", date: "5 hours ago" },
    { id: 3, name: "Homemade Jam", price: "$8.00", date: "1 day ago" }
  ]);

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
    fetchSellers();
  }, []);

  if (userRole === 'seller') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
        <p className="text-zinc-500 max-w-md">
          You do not have permission to access the Seller Management section. This area is restricted to Administrators and Super Administrators only.
        </p>
      </div>
    );
  }

  const fetchSellers = async () => {
    try {
      const response = await fetchApi("/api/users");
      const data = await response.json();
      // Filter only sellers
      setSellers(data.filter((u: User) => u.role === UserRole.SELLER));
    } catch (error) {
      toast.error("Failed to fetch sellers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSeller = async (newSeller: any) => {
    try {
      const response = await fetchApi("/api/users", {
        method: "POST",
        body: JSON.stringify({ ...newSeller, role: UserRole.SELLER }),
      });

      if (response.ok) {
        toast.success("Seller created successfully");
        setIsAddModalOpen(false);
        fetchSellers();
      } else {
        toast.error("Failed to create seller");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateSeller = async (updatedSeller?: User) => {
    const sellerToUpdate = updatedSeller || editingSeller;
    if (!sellerToUpdate) return;

    try {
      const response = await fetchApi(`/api/users/${sellerToUpdate.id}`, {
        method: "PATCH",
        body: JSON.stringify(sellerToUpdate),
      });

      if (response.ok) {
        toast.success("Seller updated successfully");
        setEditingSeller(null);
        fetchSellers();
      } else {
        toast.error("Failed to update seller");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteSeller = async (id: number | string) => {
    try {
      const response = await fetchApi(`/api/users/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Seller deleted successfully");
        fetchSellers();
      } else {
        toast.error("Failed to delete seller");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const toggleRestriction = async (seller: User, type: 'can_sell' | 'is_suspended') => {
    const updatedSeller = { ...seller, [type]: seller[type] === 1 ? 0 : 1 };
    if (type === 'is_suspended') {
      updatedSeller.status = updatedSeller.is_suspended === 1 ? 'Suspended' : 'Active';
    }
    handleUpdateSeller(updatedSeller);
  };

  const handleRequestAction = async (target_user_id: number | string, action_type: 'delete' | 'restrict', description: string) => {
    const userData = localStorage.getItem("admin_user");
    if (!userData) return;
    const currentUser = JSON.parse(userData);
    
    try {
      const response = await fetchApi(`/api/admin/pending-actions`, {
        method: "POST",
        body: JSON.stringify({ target_user_id, admin_id: currentUser.id, action_type, description })
      });
      if (response.ok) {
        toast.success("Action submitted for approval");
        fetchSellers();
      } else {
        toast.error("Failed to submit action");
      }
    } catch (error) {
      toast.error("Failed to submit action");
    }
  };

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    // Consider online if active in the last 5 minutes
    return (now.getTime() - lastActiveDate.getTime()) < 5 * 60 * 1000;
  };

  const filteredSellers = sellers.filter(seller => 
    (seller.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Seller Management</h1>
          <p className="text-zinc-500">Manage all platform sellers and their permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <UserPlus size={20} />
            Add Seller
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search sellers..." 
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
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Seller Info</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status & Activity</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No sellers found</td>
                </tr>
              ) : filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold overflow-hidden border border-zinc-200">
                          {seller.profile_image ? (
                            <img src={seller.profile_image} alt={seller.full_name} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                          ) : (
                            (seller.full_name || "S").charAt(0)
                          )}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline(seller.lastActive) ? 'bg-emerald-500' : 'bg-zinc-300'}`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{seller.full_name || "N/A"}</p>
                        <p className="text-xs text-zinc-500">@{seller.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1"><Mail size={10} /> {seller.email}</span>
                          {seller.contact_number && <span className="text-[10px] text-zinc-400 flex items-center gap-1"><Phone size={10} /> {seller.contact_number}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        seller.status === "Active" ? "bg-emerald-100 text-emerald-700" : 
                        seller.status === "Restricted" ? "bg-red-100 text-red-700" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {seller.status}
                      </span>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Globe size={10} className={isOnline(seller.lastActive) ? 'text-emerald-500' : 'text-zinc-400'} />
                        {isOnline(seller.lastActive) ? 'Online Now' : `Last active: ${seller.lastActive ? new Date(seller.lastActive).toLocaleDateString() : 'Never'}`}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs font-bold text-zinc-900">{seller.total_orders || 0}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-amber-600">{seller.pending_orders || 0}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Pending</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingSeller(seller)}
                        title="View Details"
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingSeller(seller)}
                        title="Edit Seller"
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      {['admin', 'super_admin'].includes(userRole || '') && (
                        <>
                          <button 
                            onClick={() => setActionModal({ userId: seller.id, type: 'restrict' })}
                            title="Restrict Seller"
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <ShieldAlert size={18} />
                          </button>
                          <button 
                            onClick={() => setActionModal({ userId: seller.id, type: 'delete' })}
                            title="Delete Seller"
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Seller Modal */}
      {editingSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Edit Seller Details</h3>
              <button onClick={() => setEditingSeller(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingSeller.full_name || ""}
                  onChange={(e) => setEditingSeller({ ...editingSeller, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Contact Number</label>
                <input 
                  type="text" 
                  value={editingSeller.contact_number || ""}
                  onChange={(e) => setEditingSeller({ ...editingSeller, contact_number: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Status</label>
                <select 
                  value={editingSeller.status}
                  onChange={(e) => setEditingSeller({ ...editingSeller, status: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Suspend Selling</h4>
                    <p className="text-xs text-zinc-500">Seller cannot sell products temporarily</p>
                  </div>
                  <button 
                    onClick={() => setEditingSeller({ ...editingSeller, can_sell: editingSeller.can_sell === 1 ? 0 : 1 })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${editingSeller.can_sell === 0 ? 'bg-amber-500' : 'bg-zinc-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingSeller.can_sell === 0 ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Suspend Account</h4>
                    <p className="text-xs text-zinc-500">Completely block seller access</p>
                  </div>
                  <button 
                    onClick={() => setEditingSeller({ 
                      ...editingSeller, 
                      is_suspended: editingSeller.is_suspended === 1 ? 0 : 1,
                      status: editingSeller.is_suspended === 1 ? 'Active' : 'Suspended'
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${editingSeller.is_suspended === 1 ? 'bg-red-500' : 'bg-zinc-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingSeller.is_suspended === 1 ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
              <button 
                onClick={() => setEditingSeller(null)}
                className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdateSeller()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Seller Details Modal */}
      {viewingSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
              <h3 className="text-lg font-bold text-zinc-900">Seller Details</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <select 
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <button 
                    onClick={() => {
                      setIsExporting(true);
                      setTimeout(() => {
                        setIsExporting(false);
                        toast.success(`Seller data exported as ${exportFormat.toUpperCase()}`);
                      }, 1000);
                    }}
                    disabled={isExporting}
                    className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-70"
                  >
                    {isExporting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Export
                  </button>
                </div>
                <button onClick={() => setViewingSeller(null)} className="text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-200 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Seller Info Card */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 text-center">
                    <div className="w-24 h-24 rounded-full bg-white mx-auto mb-4 flex items-center justify-center text-zinc-400 font-bold text-2xl overflow-hidden border-4 border-white shadow-sm">
                      {viewingSeller.profile_image ? (
                        <img src={viewingSeller.profile_image} alt={viewingSeller.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        (viewingSeller.full_name || "S").charAt(0)
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900">{viewingSeller.full_name || "N/A"}</h2>
                    <p className="text-sm text-zinc-500 mb-4">@{viewingSeller.username}</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      viewingSeller.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {viewingSeller.status}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border border-zinc-200 space-y-4">
                    <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                          <Mail size={14} />
                        </div>
                        <span className="text-zinc-700 break-all">{viewingSeller.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                          <Phone size={14} />
                        </div>
                        <span className="text-zinc-700">{viewingSeller.contact_number || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                          <Globe size={14} />
                        </div>
                        <span className="text-zinc-700">
                          {isOnline(viewingSeller.lastActive) ? 'Online Now' : `Last active: ${viewingSeller.lastActive ? new Date(viewingSeller.lastActive).toLocaleDateString() : 'Never'}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Activity & Products */}
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-center">
                      <p className="text-2xl font-bold text-zinc-900">124</p>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Products</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                      <p className="text-2xl font-bold text-amber-600">{pendingProducts.length}</p>
                      <p className="text-xs font-medium text-amber-600/70 uppercase tracking-wider mt-1">Pending Products</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-center">
                      <p className="text-2xl font-bold text-zinc-900">{viewingSeller.total_orders || 0}</p>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Orders</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                      <p className="text-2xl font-bold text-emerald-600">45</p>
                      <p className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider mt-1">Completed Orders</p>
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                      <h3 className="font-bold text-zinc-900">Review Summary</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-zinc-900">25</p>
                          <p className="text-sm font-medium text-zinc-500">Total Reviews</p>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-emerald-600">Good Reviews</span>
                              <span className="font-bold text-zinc-900">20</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-red-600">Bad Reviews</span>
                              <span className="font-bold text-zinc-900">5</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <h3 className="font-bold text-zinc-900">Pending Product Requests</h3>
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{pendingProducts.length} Pending</span>
                    </div>
                    <div className="divide-y divide-zinc-100">
                      {pendingProducts.length > 0 ? (
                        pendingProducts.map((product) => (
                          <div key={product.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                                <p className="text-xs text-zinc-500">{product.price} • Submitted {product.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setPendingProducts(pendingProducts.filter(p => p.id !== product.id));
                                  toast.success(`${product.name} approved and added to marketplace`);
                                }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  setPendingProducts(pendingProducts.filter(p => p.id !== product.id));
                                  toast.error(`${product.name} removed`);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-zinc-500 text-sm">
                          No pending products.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Seller Modal */}
      {isAddModalOpen && (
        <AddSellerModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddSeller} />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteSellerId}
        onClose={() => setDeleteSellerId(null)}
        onConfirm={() => deleteSellerId && handleDeleteSeller(deleteSellerId)}
      />

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
