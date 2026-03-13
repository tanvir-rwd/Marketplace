import { useState, useEffect } from "react";
import { Users, ShieldCheck, ShoppingCart, Globe, ArrowUpRight, ArrowDownRight, Package, CheckCircle, Clock, ShieldAlert, Activity, ChevronRight, MessageCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { VISITOR_DATA } from "../constants";
import { fetchApi } from "../utils/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [sellerQuestions, setSellerQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isSeller = user.role === "seller";
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  const fetchQuestions = async () => {
    try {
      const questionsRes = await fetchApi(`/api/seller/${user.id}/questions`);
      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setSellerQuestions(questionsData.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = isSeller ? `/api/stats?seller_id=${user.id}` : "/api/stats";
        const response = await fetchApi(url);
        const data = await response.json();
        setStats(data);

        if (isAdmin) {
          const actionsRes = await fetchApi("/api/admin/pending-actions");
          if (actionsRes.ok) {
            const actionsData = await actionsRes.json();
            setPendingActions(actionsData.slice(0, 5)); // Get top 5
          }
        }

        if (isSeller) {
          await fetchQuestions();
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isSeller, isAdmin, user.id]);

  const handleReplyQuestion = async (questionId: number) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetchApi(`/api/questions/${questionId}/answer`, {
        method: "PUT",
        body: JSON.stringify({ answer: replyText })
      });

      if (res.ok) {
        toast.success("Reply submitted successfully!");
        setReplyText("");
        setReplyingTo(null);
        fetchQuestions();
      } else {
        toast.error("Failed to submit reply");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load stats. Please try again later.</div>;

  const statCards = isSeller ? [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-100" },
    { label: "Completed Orders", value: stats.completedOrders, icon: CheckCircle, color: "bg-purple-50 text-purple-600 border-purple-100" },
  ] : [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Total Sellers", value: stats.totalSellers, icon: Package, color: "bg-purple-50 text-purple-600 border-purple-100" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { label: "Pending Actions", value: stats.pendingActions || 0, icon: ShieldAlert, color: "bg-amber-50 text-amber-600 border-amber-100" },
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
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 
                user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 
                'bg-emerald-100 text-emerald-700'
              }`}>
                {user.role === 'super_admin' ? <ShieldAlert size={14} /> : user.role === 'admin' ? <ShieldCheck size={14} /> : <Package size={14} />}
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-zinc-500 text-lg">Here's what's happening with your platform today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-zinc-900">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl border ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-4xl font-black text-zinc-900 mt-2 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Visitor Statistics</h3>
                <p className="text-sm text-zinc-500 mt-1">Platform traffic over the last 7 days</p>
              </div>
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100">
                <Activity size={20} className="text-zinc-400" />
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VISITOR_DATA}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVisitors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Sales Report</h3>
                <p className="text-sm text-zinc-500 mt-1">Revenue generated over the last 7 days</p>
              </div>
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100">
                <ShoppingCart size={20} className="text-zinc-400" />
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VISITOR_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="sales" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {isAdmin && (
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Pending Actions</h3>
                    <p className="text-sm text-zinc-500 mt-1">Requires admin review</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <ShieldAlert size={20} />
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                {pendingActions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} />
                    </div>
                    <p className="text-zinc-900 font-bold">All caught up!</p>
                    <p className="text-sm text-zinc-500 mt-1">No pending actions require review.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingActions.map(action => (
                      <div key={action.id} className="p-4 rounded-2xl border border-zinc-100 bg-white hover:border-zinc-300 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            action.action_type === 'delete' ? 'bg-red-50 text-red-600 border border-red-100' : 
                            action.action_type === 'restrict' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {action.action_type}
                          </span>
                          <span className="text-xs font-medium text-zinc-400">
                            {new Date(action.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-zinc-900 line-clamp-2 mb-3">{action.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                              {action.admin_name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-zinc-500">{action.admin_name}</span>
                          </div>
                          <Link to="/admin/pending-actions" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {user.role === 'super_admin' ? 'Review' : 'View Details'} <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {pendingActions.length > 0 && (
                <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                  <Link 
                    to="/admin/pending-actions"
                    className="w-full py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    View All Actions
                  </Link>
                </div>
              )}
            </div>
          )}

          {isSeller && (
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Recent Questions</h3>
                    <p className="text-sm text-zinc-500 mt-1">Customer inquiries on your products</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center relative">
                    <MessageCircle size={20} />
                    {sellerQuestions.some(q => !q.answer) && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                {sellerQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle size={32} />
                    </div>
                    <p className="text-zinc-900 font-bold">No questions yet</p>
                    <p className="text-sm text-zinc-500 mt-1">When customers ask about your products, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sellerQuestions.map(question => (
                      <div key={question.id} className="p-4 rounded-2xl border border-zinc-100 bg-white hover:border-zinc-300 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            question.answer ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {question.answer ? 'Answered' : 'Needs Reply'}
                          </span>
                          <span className="text-xs font-medium text-zinc-400">
                            {new Date(question.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-zinc-900 line-clamp-2 mb-1">{question.question}</p>
                        <p className="text-xs text-zinc-500 mb-3 line-clamp-1">Product: {question.product_name}</p>
                        
                        {replyingTo === question.id ? (
                          <div className="mt-3 mb-3 space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your answer..."
                              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-700"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleReplyQuestion(question.id)}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600 overflow-hidden">
                              {question.user_image ? (
                                <img src={question.user_image} alt={question.user_name} className="w-full h-full object-cover" />
                              ) : (
                                question.user_name?.charAt(0) || 'U'
                              )}
                            </div>
                            <span className="text-xs font-medium text-zinc-500">{question.user_name}</span>
                          </div>
                          {question.answer ? (
                            <Link to={`/product/${question.product_id}`} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              View <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <button 
                              onClick={() => { setReplyingTo(question.id); setReplyText(""); }}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Reply <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
