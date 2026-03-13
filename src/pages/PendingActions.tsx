import { useState, useEffect } from "react";
import { Check, X, Clock, User, Shield, AlertCircle } from "lucide-react";
import { fetchApi } from "../utils/api";
import { toast } from "react-hot-toast";

interface PendingAction {
  id: number;
  target_user_id: number;
  admin_id: number;
  action_type: string;
  description: string;
  status: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
  admin_username: string;
  target_name: string;
  target_email: string;
}

export default function PendingActionsPage() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchActions = async () => {
    try {
      const userData = localStorage.getItem("admin_user");
      let role = null;
      if (userData) {
        role = JSON.parse(userData).role;
        setUserRole(role);
      }
      
      const endpoint = role === 'seller' ? "/api/seller/pending-actions" : "/api/admin/pending-actions";
      const res = await fetchApi(endpoint);
      if (res.ok) {
        const data = await res.json();
        setActions(data);
      }
    } catch (error) {
      toast.error("Failed to fetch pending actions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleAction = async (id: number, type: 'approve' | 'reject' | 'cancel') => {
    try {
      const endpoint = type === 'cancel' 
        ? `/api/seller/pending-actions/${id}/cancel`
        : `/api/admin/pending-actions/${id}/${type}`;
        
      const res = await fetchApi(endpoint, {
        method: 'POST'
      });
      if (res.ok) {
        toast.success(`Action ${type}ed successfully`);
        fetchActions();
      } else {
        const data = await res.json();
        toast.error(data.error || `Failed to ${type} action`);
      }
    } catch (error) {
      toast.error(`An error occurred while ${type}ing the action`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            {userRole === 'seller' ? 'My Pending Actions' : 'Pending Admin Actions'}
          </h1>
          <p className="text-zinc-500 mt-1">
            {userRole === 'seller' ? 'Track the status of your actions' : 'Review and approve critical administrative changes'}
          </p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium border border-amber-200">
          <AlertCircle size={18} />
          <span>{actions.length} {userRole === 'seller' ? 'Actions' : 'Actions Requiring Review'}</span>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">All Clear!</h2>
          <p className="text-zinc-500">
            {userRole === 'seller' ? 'You have no pending actions.' : 'There are no pending actions requiring your attention.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {actions.map((action) => (
            <div key={action.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        action.action_type === 'delete' ? 'bg-red-100 text-red-700' : 
                        action.action_type === 'restrict' ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {action.action_type} Request
                      </span>
                      <span className="text-zinc-400 text-sm flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(action.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 mb-4">{action.description}</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <div className="text-xs font-bold text-zinc-400 uppercase mb-2 flex items-center gap-1">
                          <Shield size={12} /> Requested By
                        </div>
                        <div className="font-bold text-zinc-900">{action.admin_name} (@{action.admin_username})</div>
                        <div className="text-sm text-zinc-500">{action.admin_email}</div>
                      </div>

                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <div className="text-xs font-bold text-zinc-400 uppercase mb-2 flex items-center gap-1">
                          <User size={12} /> Target User
                        </div>
                        <div className="font-bold text-zinc-900">{action.target_name}</div>
                        <div className="text-sm text-zinc-500">{action.target_email}</div>
                      </div>
                    </div>
                  </div>

                  {userRole === 'super_admin' ? (
                    <div className="flex md:flex-col gap-3">
                      <button
                        onClick={() => handleAction(action.id, 'approve')}
                        className="flex-1 md:w-32 bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(action.id, 'reject')}
                        className="flex-1 md:w-32 bg-white text-red-600 border-2 border-red-100 py-3 rounded-2xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  ) : userRole === 'seller' ? (
                    <div className="flex flex-col gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border italic text-sm ${
                        action.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                        action.status === 'approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        action.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-100' :
                        'text-zinc-500 bg-zinc-50 border-zinc-200'
                      }`}>
                        {action.status === 'pending' ? <Clock size={16} /> : 
                         action.status === 'approved' ? <Check size={16} /> : 
                         <X size={16} />}
                        Status: {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                      </div>
                      {action.status === 'pending' && (
                        <button
                          onClick={() => handleAction(action.id, 'cancel')}
                          className="flex-1 md:w-32 bg-white text-red-600 border-2 border-red-100 py-2 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} /> Cancel
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-400 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100 italic text-sm">
                      <Clock size={16} />
                      Awaiting Super Admin Review
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
