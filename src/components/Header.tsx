import { useState, useEffect, useRef } from "react";
import { Bell, Search, User as UserIcon, Package, Users, AlertCircle, ShoppingCart, CheckCircle, ChevronRight, Mail, LogOut, Settings, MessageCircle, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchApi } from "../utils/api";

const ADMIN_NOTIFICATIONS = [
  { id: 1, type: 'approval', title: 'New Product Added by Seller', message: 'Approval Required for "Organic Honey"', time: '5m ago', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', link: '/admin/products' },
  { id: 2, type: 'registration', title: 'New Seller Registration', message: 'Green Farms Ltd. has registered.', time: '1h ago', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', link: '/admin/sellers' },
  { id: 3, type: 'order', title: 'Order Created', message: 'Order #ORD-8923 has been placed.', time: '2h ago', icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/admin/orders' },
  { id: 4, type: 'alert', title: 'System Alert', message: 'Database backup completed successfully.', time: '5h ago', icon: CheckCircle, color: 'text-zinc-500', bg: 'bg-zinc-100', link: '/admin/settings' },
  { id: 5, type: 'approval', title: 'Pending Product Approval', message: '3 products are waiting for your review.', time: '1d ago', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', link: '/admin/products' },
];

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerNotifications = async (sellerId: number) => {
      try {
        const res = await fetchApi(`/api/seller/${sellerId}/questions`);
        let formattedNotifications: any[] = [];
        if (res.ok) {
          const questions = await res.json();
          const unanswered = questions.filter((q: any) => !q.answer);
          formattedNotifications = unanswered.map((q: any) => ({
            id: `q-${q.id}`,
            type: 'question',
            title: 'New Product Question',
            message: `${q.user_name} asked: "${q.question}" on ${q.product_name}`,
            time: new Date(q.created_at).toLocaleDateString(),
            icon: MessageCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            link: `/product/${q.product_id}`
          }));
        }

        // Fetch unread messages
        const convRes = await fetchApi(`/api/conversations/${sellerId}`);
        if (convRes.ok) {
          const conversations = await convRes.json();
          const unreadMessages = conversations.filter((c: any) => !c.is_read && c.sender_id !== sellerId);
          const messageNotifications = unreadMessages.map((c: any) => ({
            id: `m-${c.id}`,
            type: 'message',
            title: 'New Message',
            message: `${c.other_user_name}: "${c.content}"`,
            time: new Date(c.created_at).toLocaleDateString(),
            icon: MessageSquare,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            link: `/admin/messages`
          }));
          formattedNotifications = [...formattedNotifications, ...messageNotifications];
        }

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error("Failed to fetch seller notifications", error);
      }
    };

    const fetchUserNotifications = async (userId: number) => {
      try {
        // Fetch unread messages for user
        const convRes = await fetchApi(`/api/conversations/${userId}`);
        if (convRes.ok) {
          const conversations = await convRes.json();
          const unreadMessages = conversations.filter((c: any) => !c.is_read && c.sender_id !== userId);
          const messageNotifications = unreadMessages.map((c: any) => ({
            id: `m-${c.id}`,
            type: 'message',
            title: 'New Message',
            message: `${c.other_user_name}: "${c.content}"`,
            time: new Date(c.created_at).toLocaleDateString(),
            icon: MessageSquare,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            link: `/dashboard/messages`
          }));
          setNotifications(messageNotifications);
        }
      } catch (error) {
        console.error("Failed to fetch user notifications", error);
      }
    };

    const loadUser = () => {
      const userData = localStorage.getItem("admin_user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          if (parsedUser.role === 'seller') {
            fetchSellerNotifications(parsedUser.id);
          } else if (parsedUser.role === 'admin' || parsedUser.role === 'super_admin') {
            setNotifications(ADMIN_NOTIFICATIONS);
          } else {
            fetchUserNotifications(parsedUser.id);
          }
        } catch (e) {
          setUser(null);
        }
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', loadUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (link: string) => {
    setShowNotifications(false);
    navigate(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    navigate("/");
  };

  const getRoleDisplay = (role: string) => {
    switch(role) {
      case 'super_admin': return 'Administrator';
      case 'admin': return 'Admin';
      case 'seller': return 'Seller';
      default: return 'User';
    }
  };

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 bg-zinc-100 px-4 py-2 rounded-full w-96">
        <Search className="w-4 h-4 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-zinc-500 hover:text-zinc-800 transition-colors p-2 rounded-full hover:bg-zinc-100"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="font-bold text-zinc-900">Notifications</h3>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {notifications.length} New
                </span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        onClick={() => handleNotificationClick(notification.link)}
                        className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-4 group"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.bg} ${notification.color}`}>
                          <notification.icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">
                            {notification.title}
                          </p>
                          <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-zinc-400 mt-2 font-medium">
                            {notification.time}
                          </p>
                        </div>
                        <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={16} className="text-zinc-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500">
                    <Bell className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-zinc-100 bg-zinc-50">
                <button className="w-full py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Link to="/admin/profile" className="flex items-center gap-3 pl-6 border-l border-zinc-200 hover:opacity-80 transition-opacity text-left">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-zinc-900 leading-none mb-1">{user?.full_name || user?.username || "Loading..."}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              user?.role === 'super_admin' 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : user?.role === 'admin'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : user?.role === 'seller'
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {user ? getRoleDisplay(user.role) : 'User'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
