import { useState, useEffect } from "react";
import { Search, UserPlus, Shield, Trash2, Edit2, X, Save, ShieldCheck, ShieldAlert } from "lucide-react";
import { User, UserRole } from "../types";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { fetchApi } from "../utils/api";

export default function AdminManagement() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [deleteAdminId, setDeleteAdminId] = useState<number | string | null>(null);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: UserRole.ADMIN
  });

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
    fetchAdmins();
  }, []);

  if (userRole && userRole !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
        <p className="text-zinc-500 max-w-md">
          You do not have permission to access the Admin Management section. This area is restricted to Super Administrators only.
        </p>
      </div>
    );
  }

  const fetchAdmins = async () => {
    try {
      const response = await fetchApi("/api/users");
      const data = await response.json();
      // Filter only admins and super admins
      const adminList = data.filter((u: User) => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN);
      setAdmins(adminList);
    } catch (error) {
      toast.error("Failed to fetch admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
    let adminData: any = { ...newAdmin };
    
    if (currentUser.role === UserRole.ADMIN && adminData.role === UserRole.ADMIN) {
      adminData.role = UserRole.USER;
      adminData.pending_role = UserRole.ADMIN;
      adminData.status = 'Pending Approval';
      toast.success("Admin request submitted for Super Admin approval");
    } else {
      adminData.status = 'Active';
    }

    try {
      const response = await fetchApi("/api/register", {
        method: "POST",
        body: JSON.stringify(adminData),
      });

      if (response.ok) {
        if (adminData.status === 'Active') toast.success("Admin added successfully");
        setIsAddingAdmin(false);
        setNewAdmin({ username: "", email: "", password: "", full_name: "", role: UserRole.ADMIN });
        fetchAdmins();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add admin");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    try {
      const response = await fetchApi(`/api/users/${editingAdmin.id}`, {
        method: "PATCH",
        body: JSON.stringify(editingAdmin),
      });

      if (response.ok) {
        toast.success("Admin updated successfully");
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        toast.error("Failed to update admin");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteAdmin = async (id: number | string) => {
    try {
      const response = await fetchApi(`/api/users/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Admin removed");
        fetchAdmins();
      }
    } catch (error) {
      toast.error("Failed to remove admin");
    }
  };

  const filteredAdmins = admins.filter(admin => 
    (admin.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const pendingApprovals = admins.filter(a => a.pending_role);

  const handleApproveRole = async (userId: number | string, role: string, approve: boolean) => {
    try {
      const response = await fetchApi(`/api/admin/approve-role/${userId}`, {
        method: "POST",
        body: JSON.stringify({ approve, role }),
      });
      if (response.ok) {
        toast.success(approve ? "Role approved" : "Role rejected");
        fetchAdmins();
      }
    } catch (error) {
      toast.error("Failed to process approval");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Admin Management</h1>
          <p className="text-zinc-500">Manage system administrators and their roles.</p>
        </div>
        <button 
          onClick={() => setIsAddingAdmin(true)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
        >
          <UserPlus size={20} />
          Add New Admin
        </button>
      </div>

      {currentUser.role === UserRole.SUPER_ADMIN && pendingApprovals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Shield size={20} />
            <h2 className="font-bold">Pending Admin Approvals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApprovals.map(admin => (
              <div key={admin.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold overflow-hidden border border-zinc-200">
                    {admin.profile_image ? (
                      <img src={admin.profile_image} alt={admin.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      (admin.full_name || "A").charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{admin.full_name}</p>
                    <p className="text-[10px] text-zinc-500">Request: <span className="font-bold text-amber-600 uppercase">{admin.pending_role}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApproveRole(admin.id, admin.pending_role!, true)}
                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all"
                  >
                    <ShieldCheck size={16} />
                  </button>
                  <button 
                    onClick={() => handleApproveRole(admin.id, admin.pending_role!, false)}
                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <ShieldAlert size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search admins..." 
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
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Admin Info</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
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
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No admins found</td>
                </tr>
              ) : filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold overflow-hidden border border-zinc-200">
                        {admin.profile_image ? (
                          <img src={admin.profile_image} alt={admin.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          (admin.full_name || "A").charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{admin.full_name || "N/A"}</p>
                        <p className="text-xs text-zinc-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      admin.role === UserRole.SUPER_ADMIN 
                        ? "bg-purple-50 text-purple-700 border border-purple-100" 
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {admin.role === UserRole.SUPER_ADMIN ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                      {admin.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${admin.status === "Active" ? "bg-emerald-500" : "bg-zinc-400"}`}></span>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingAdmin(admin)}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteAdminId(admin.id)}
                        disabled={admin.role === UserRole.SUPER_ADMIN}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isAddingAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Add New Administrator</h3>
              <button onClick={() => setIsAddingAdmin(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Username</label>
                <input 
                  type="text" 
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                  placeholder="admin_user"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Role</label>
                <select 
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
              <button 
                onClick={() => setIsAddingAdmin(false)}
                className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAdmin}
                className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <Save size={18} />
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Edit Administrator</h3>
              <button onClick={() => setEditingAdmin(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingAdmin.full_name || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Role</label>
                <select 
                  value={editingAdmin.role}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  <option value={UserRole.USER}>Demote to User</option>
                  <option value={UserRole.SELLER}>Demote to Seller</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Status</label>
                <select 
                  value={editingAdmin.status}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
              <button 
                onClick={() => setEditingAdmin(null)}
                className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateAdmin}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteAdminId}
        onClose={() => setDeleteAdminId(null)}
        onConfirm={() => deleteAdminId && handleDeleteAdmin(deleteAdminId)}
      />
    </div>
  );
}
