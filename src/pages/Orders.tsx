import { useState, useMemo, useEffect } from "react";
import { 
  ShoppingBag, Search, Filter, Download, ExternalLink, 
  Eye, Edit2, Phone, FileText, Trash2, ChevronDown, ChevronUp,
  X, CheckCircle, Mail, MapPin, Calendar, CreditCard, ChevronLeft, ChevronRight,
  Sparkles, Zap, Settings, RefreshCw, User
} from "lucide-react";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { GoogleGenAI } from "@google/genai";
import { fetchApi } from "../utils/api";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Orders");
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isSeller = user.role === "seller";
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchSettings();
      runMaintenance();
    }
  }, []);

  const runMaintenance = async () => {
    try {
      // Auto-complete orders that are in 'processing' for more than 24 hours
      const response = await fetchApi("/api/orders");
      const allOrders = await response.json();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const updates = allOrders
        .filter((o: any) => o.status === 'processing' && new Date(o.created_at) < oneDayAgo)
        .map((o: any) => ({ id: o.id, status: 'completed' }));

      if (updates.length > 0) {
        await fetchApi("/api/admin/bulk-update-orders", {
          method: "POST",
          body: JSON.stringify({ updates }),
        });
        fetchOrders();
      }
    } catch (error) {
      console.error("Maintenance check failed", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetchApi("/api/settings");
      const data = await response.json();
      setAutomationEnabled(data.ai_automation_enabled === '1');
    } catch (error) {
      console.error("Failed to fetch settings");
    }
  };

  const toggleAutomation = async () => {
    const newValue = !automationEnabled;
    try {
      const response = await fetchApi("/api/settings", {
        method: "POST",
        body: JSON.stringify({ key: 'ai_automation_enabled', value: newValue ? '1' : '0' }),
      });
      if (response.ok) {
        setAutomationEnabled(newValue);
        toast.success(`AI Smart Automation ${newValue ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const runAutomation = async () => {
    setIsAutomating(true);
    try {
      // 1. Fetch raw pending orders from backend
      const response = await fetchApi("/api/orders");
      const allOrders = await response.json();
      const pendingOrders = allOrders.filter((o: any) => o.status === 'pending');

      if (pendingOrders.length === 0) {
        toast.success("No pending orders to process");
        setIsAutomating(false);
        return;
      }

      // 2. Use Gemini to analyze
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are an AI Order Auditor. Analyze the following pending orders and decide if they should be approved (status: processing) or flagged (status: pending).
        Criteria for approval:
        1. Transaction ID looks like a valid alphanumeric string (usually 8-12 chars).
        2. Sender number looks like a valid phone number.
        3. Total price is reasonable for the product.

        Orders: ${JSON.stringify(pendingOrders)}

        Return a JSON array of objects with 'id' and 'status' (either 'processing' or 'pending').
        Format: [{"id": 1, "status": "processing"}, ...]
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const results = JSON.parse(aiResponse.text);
      const updates = results.filter((r: any) => r.status === 'processing');

      if (updates.length > 0) {
        // 3. Send updates to backend
        const updateResponse = await fetchApi("/api/admin/bulk-update-orders", {
          method: "POST",
          body: JSON.stringify({ updates }),
        });

        if (updateResponse.ok) {
          toast.success(`AI Automation completed: ${updates.length} orders approved`);
          fetchOrders();
        } else {
          toast.error("Failed to update orders in database");
        }
      } else {
        toast.success("AI Audit completed: No orders met approval criteria");
      }
    } catch (error) {
      console.error("Automation error:", error);
      toast.error("An error occurred during AI automation");
    } finally {
      setIsAutomating(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const endpoint = isSeller ? "/api/seller-orders" : "/api/orders";
      const response = await fetchApi(endpoint);
      let data = await response.json();
      
      // Map to expected format
      const mappedOrders = data.map((o: any) => ({
        id: `ORD-${o.id.toString().padStart(4, '0')}`,
        dbId: o.id,
        customer: o.sender_number, // Using sender number as customer identifier for now
        product: o.product_name || `Product #${o.product_id}`,
        amount: o.total_price,
        date: new Date(o.created_at).toLocaleDateString(),
        status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
        quantity: o.quantity,
        email: "",
        phone: o.sender_number,
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [statusOrder, setStatusOrder] = useState<any | null>(null);
  const [contactOrder, setContactOrder] = useState<any | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Processing": return "bg-blue-100 text-blue-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-zinc-100 text-zinc-700";
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by Tab
    if (activeTab !== "All Orders") {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term) ||
        order.date.includes(term)
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [orders, activeTab, searchTerm, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateStatus = async (dbId: number, newStatus: string) => {
    try {
      const response = await fetchApi(`/api/orders/${dbId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      });
      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        setStatusOrder(null);
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteOrder = async (dbId: number) => {
    try {
      const response = await fetchApi(`/api/orders/${dbId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setOrders(orders.filter(o => o.dbId !== dbId));
        toast.success("Order deleted successfully");
        setViewOrder(null);
        setDeleteOrder(null);
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    toast.success(`Exporting orders as ${format.toUpperCase()}...`);
    // Simulated export
  };

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Downloading invoice for order ${id}...`);
  };

  const tabs = ["All Orders", "Pending", "Processing", "Completed", "Cancelled"];

  const getTabCount = (tab: string) => {
    if (tab === "All Orders") return orders.length;
    return orders.filter(o => o.status === tab).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Order Management</h1>
          <p className="text-zinc-500">Track and manage all transactions and data entries.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('csv')}
            className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-zinc-50 transition-all"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <FileText size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Sparkles className="text-white animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                AI Smart Order Automation
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${automationEnabled ? 'bg-emerald-400 text-emerald-900' : 'bg-white/20 text-white'}`}>
                  {automationEnabled ? 'Active' : 'Inactive'}
                </span>
              </h2>
              <p className="text-indigo-100 text-sm">Automatically verify payments and transition order statuses using Gemini AI.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={toggleAutomation}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                automationEnabled 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-white border border-white/20' 
                  : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Zap size={16} />
              {automationEnabled ? 'Disable Auto-Process' : 'Enable Auto-Process'}
            </button>
            <button 
              onClick={runAutomation}
              disabled={isAutomating}
              className="flex-1 md:flex-none px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAutomating ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Run AI Audit Now
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`px-5 py-3 rounded-xl border text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab 
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' 
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            {tab}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
            }`}>
              {getTabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by Customer, Order ID, or Date..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-200">
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold text-center">Qty</th>
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-zinc-900" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">
                    Total Price
                    {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-zinc-900" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    Order Date
                    {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-zinc-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-700 font-medium">{order.customer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-600">{order.product}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-zinc-600">{order.quantity || 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-zinc-900">${order.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-500">{order.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setViewOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-sm"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
            <p className="text-sm text-zinc-500">
              Showing <span className="font-medium text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-medium text-zinc-900">{filteredOrders.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-zinc-900 text-white' 
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  Order Details
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(viewOrder.status)}`}>
                    {viewOrder.status}
                  </span>
                </h3>
                <p className="text-sm text-zinc-500 font-mono mt-1">{viewOrder.id}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-200 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                    <User size={16} className="text-zinc-400" />
                    Customer Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-3"><span className="text-zinc-500 w-16">Name:</span> <span className="font-medium text-zinc-900">{viewOrder.customer}</span></p>
                    <p className="flex items-center gap-3"><span className="text-zinc-500 w-16">Email:</span> <span className="text-zinc-700">{viewOrder.email || 'N/A'}</span></p>
                    <p className="flex items-center gap-3"><span className="text-zinc-500 w-16">Phone:</span> <span className="text-zinc-700">{viewOrder.phone || 'N/A'}</span></p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-zinc-400" />
                    Order Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-3"><span className="text-zinc-500 w-16">Date:</span> <span className="text-zinc-700">{viewOrder.date}</span></p>
                    <p className="flex items-center gap-3"><span className="text-zinc-500 w-16">Product:</span> <span className="font-medium text-zinc-900">{viewOrder.product}</span></p>
                    <p className="flex items-center gap-3"><span className="text-zinc-500 w-16">Quantity:</span> <span className="text-zinc-700">{viewOrder.quantity || 1}</span></p>
                    <p className="flex items-center gap-3 pt-2 border-t border-zinc-100">
                      <span className="text-zinc-900 font-bold w-16">Total:</span> 
                      <span className="font-bold text-emerald-600 text-lg">${viewOrder.amount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {viewOrder.status !== "Cancelled" && viewOrder.status !== "Completed" && (
                  <button 
                    onClick={() => setStatusOrder(viewOrder)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}
                {viewOrder.status !== "Completed" && !isSeller && (
                  <button 
                    onClick={() => setDeleteOrder(viewOrder.dbId)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button 
                  onClick={() => setContactOrder(viewOrder)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl font-medium flex items-center gap-2 hover:bg-zinc-100 transition-all"
                >
                  <Phone size={16} />
                  Contact
                </button>
                <button 
                  onClick={() => setInvoiceOrder(viewOrder)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl font-medium flex items-center gap-2 hover:bg-zinc-100 transition-all"
                >
                  <FileText size={16} />
                  Invoice
                </button>
                <button 
                  onClick={() => setViewOrder(null)}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
        onConfirm={() => deleteOrder && handleDeleteOrder(deleteOrder)}
      />

      {/* Update Status Modal */}
      {statusOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Update Status</h3>
              <button onClick={() => setStatusOrder(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-zinc-500 mb-4">Select new status for order <span className="font-mono font-bold text-zinc-900">{statusOrder.id}</span></p>
              
              {(["Pending", "Processing", "Completed", "Cancelled"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(statusOrder.dbId, status)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    statusOrder.status === status 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-zinc-200 hover:border-emerald-200 hover:bg-zinc-50'
                  }`}
                >
                  <span className={`text-sm font-bold ${statusOrder.status === status ? 'text-emerald-700' : 'text-zinc-700'}`}>
                    {status}
                  </span>
                  {statusOrder.status === status && <CheckCircle size={18} className="text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Customer Modal */}
      {contactOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Contact Customer</h3>
              <button onClick={() => setContactOrder(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-2xl mx-auto mb-3">
                  {contactOrder.customer.charAt(0)}
                </div>
                <h4 className="font-bold text-zinc-900 text-lg">{contactOrder.customer}</h4>
                <p className="text-sm text-zinc-500">Order: {contactOrder.id}</p>
              </div>
              
              <a href={`tel:${contactOrder.phone}`} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-all">
                <Phone size={18} />
                Call Customer
              </a>
              
              <a href={`mailto:${contactOrder.email}`} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-all">
                <Mail size={18} />
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <FileText size={20} className="text-zinc-400" />
                Invoice Preview
              </h3>
              <button onClick={() => setInvoiceOrder(null)} className="text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-200 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-zinc-50/30">
              <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-zinc-100 pb-8 mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">INVOICE</h2>
                    <p className="text-zinc-500 mt-1 font-mono">{invoiceOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-zinc-900 text-xl">Your Company</h3>
                    <p className="text-sm text-zinc-500 mt-1">123 Business Avenue<br/>Tech District, NY 10001</p>
                  </div>
                </div>
                
                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Billed To</p>
                    <h4 className="font-bold text-zinc-900">{invoiceOrder.customer}</h4>
                    <p className="text-sm text-zinc-600 mt-1">{invoiceOrder.email || 'No email provided'}</p>
                    <p className="text-sm text-zinc-600">{invoiceOrder.phone || 'No phone provided'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Invoice Details</p>
                    <p className="text-sm text-zinc-600"><span className="font-medium text-zinc-900">Date:</span> {invoiceOrder.date}</p>
                    <p className="text-sm text-zinc-600 mt-1"><span className="font-medium text-zinc-900">Status:</span> <span className={getStatusColor(invoiceOrder.status) + " px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ml-1"}>{invoiceOrder.status}</span></p>
                  </div>
                </div>
                
                {/* Products Table */}
                <table className="w-full text-left mb-8">
                  <thead>
                    <tr className="border-b border-zinc-200 text-sm">
                      <th className="py-3 font-bold text-zinc-900">Description</th>
                      <th className="py-3 font-bold text-zinc-900 text-center">Qty</th>
                      <th className="py-3 font-bold text-zinc-900 text-right">Unit Price</th>
                      <th className="py-3 font-bold text-zinc-900 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="py-4 text-sm text-zinc-700">{invoiceOrder.product}</td>
                      <td className="py-4 text-sm text-zinc-700 text-center">{invoiceOrder.quantity || 1}</td>
                      <td className="py-4 text-sm text-zinc-700 text-right">${((invoiceOrder.amount) / (invoiceOrder.quantity || 1)).toFixed(2)}</td>
                      <td className="py-4 text-sm font-bold text-zinc-900 text-right">${invoiceOrder.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                
                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="font-medium text-zinc-900">${invoiceOrder.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Tax (0%)</span>
                      <span className="font-medium text-zinc-900">$0.00</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 pt-3">
                      <span className="font-bold text-zinc-900">Total</span>
                      <span className="font-bold text-emerald-600 text-xl">${invoiceOrder.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
              <button 
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success(`Invoice ${invoiceOrder.id} downloaded as PDF`);
                  setInvoiceOrder(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
