import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Activity, Download, Package, ShoppingCart, Clock, ShieldAlert, FileText, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { VISITOR_DATA } from "../constants";
import toast from "react-hot-toast";

const pieData = [
  { name: 'Direct', value: 400 },
  { name: 'Social', value: 300 },
  { name: 'Referral', value: 300 },
  { name: 'Organic', value: 200 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

const ALL_ACTIVITIES = [
  { id: 1, user: "Green Farms Ltd.", role: "Seller", action: "Added a new product (Organic Honey)", time: "2 minutes ago", type: "product", icon: Package, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 2, user: "John Doe", role: "User", action: "Updated account information", time: "15 minutes ago", type: "user", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 3, user: "Fresh Veggies Co.", role: "Seller", action: "Edited product pricing (Tomatoes)", time: "1 hour ago", type: "product", icon: Edit3Icon, color: "text-amber-500", bg: "bg-amber-50" },
  { id: 4, user: "System", role: "Admin", action: "Automatic database backup completed", time: "3 hours ago", type: "system", icon: CheckCircle, color: "text-zinc-500", bg: "bg-zinc-100" },
  { id: 5, user: "Sarah Wilson", role: "User", action: "Placed a new order (#ORD-8923)", time: "5 hours ago", type: "order", icon: ShoppingCart, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: 6, user: "Meat Masters", role: "Seller", action: "Registered as a new seller", time: "1 day ago", type: "user", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 7, user: "Admin User", role: "Admin", action: "Approved 3 pending products", time: "2 days ago", type: "system", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
];

function Edit3Icon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
}

export default function Reports() {
  const [activityFilter, setActivityFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  
  // Auto-updating stats simulation
  const [stats, setStats] = useState({
    users: 12450,
    sellers: 842,
    products: 5630,
    orders: 1284,
    pendingOrders: 45,
    recentActivities: 128
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        users: prev.users + Math.floor(Math.random() * 3),
        orders: prev.orders + Math.floor(Math.random() * 2),
        recentActivities: prev.recentActivities + Math.floor(Math.random() * 5)
      }));
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredActivities = ALL_ACTIVITIES.filter(activity => {
    if (activityFilter === "all") return true;
    return activity.type === activityFilter;
  });

  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`Activity report exported successfully as ${exportFormat.toUpperCase()}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Reports & Analytics</h1>
          <p className="text-zinc-500">Real-time overview of your platform's performance.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Auto Updated Data Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Users size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.users.toLocaleString()}</p>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Users</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Users size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.sellers.toLocaleString()}</p>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Sellers</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Package size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.products.toLocaleString()}</p>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Products</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <ShoppingCart size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.orders.toLocaleString()}</p>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Orders</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2">
            <Clock size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.pendingOrders}</p>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Pending Orders</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mb-2">
            <Activity size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats.recentActivities}</p>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Recent Activities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-900">Activity Over Time</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-zinc-500">Visitors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-zinc-500">Sales</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VISITOR_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.1} fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-8">Traffic Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-zinc-500">{item.name}</span>
                </div>
                <span className="font-bold text-zinc-900">{Math.round(item.value / 1200 * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent User Activity Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Recent User Activity (Last 30 Days)</h3>
            <p className="text-sm text-zinc-500">Track all user and seller actions across the platform.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-lg border border-zinc-200">
              <button 
                onClick={() => setActivityFilter("all")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activityFilter === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActivityFilter("user")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activityFilter === 'user' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Users
              </button>
              <button 
                onClick={() => setActivityFilter("product")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activityFilter === 'product' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Products
              </button>
              <button 
                onClick={() => setActivityFilter("order")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activityFilter === 'order' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Orders
              </button>
            </div>
            
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
                onClick={handleExport}
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
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${activity.bg} ${activity.color}`}>
                    <activity.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900">
                      <span className="font-bold">{activity.user}</span>
                      <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full mx-2">
                        {activity.role}
                      </span>
                      <span className="text-zinc-600">{activity.action}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                <p>No activities found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
