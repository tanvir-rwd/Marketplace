import { NavLink, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  ShoppingCart, 
  FileText, 
  Lock, 
  Settings, 
  BarChart3,
  LogOut,
  UserCircle,
  Package,
  Globe,
  Store,
  CreditCard,
  Heart,
  MessageSquare
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  let user: any = {};
  try {
    user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  } catch (e) {
    user = {};
  }
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSeller = user?.role === "seller";
  const isUser = !isAdmin && !isSeller;

  const menuItems = isUser ? [
    { label: "Overview", items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ]},
    { label: "Shopping", items: [
      { icon: ShoppingCart, label: "My Orders", path: "/dashboard?tab=orders" },
      { icon: Heart, label: "Wishlist", path: "/dashboard?tab=wishlist" },
      { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
    ]},
    { label: "Account", items: [
      { icon: UserCircle, label: "My Profile", path: "/dashboard?tab=profile" },
      { icon: CreditCard, label: "Payment Settings", path: "/dashboard?tab=payment" },
      { icon: Globe, label: "Back to Shop", path: "/shop" },
    ]},
  ] : [
    { label: "Overview", items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
      ...(isAdmin ? [{ icon: BarChart3, label: "Analytics & Reports", path: "/admin/reports" }] : []),
    ]},
    { label: "Management", items: [
      { icon: Package, label: "Products", path: "/admin/products" },
      { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
      { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
      ...(isAdmin ? [
        { icon: Store, label: "Sellers", path: "/admin/sellers" },
        { icon: Users, label: "Users", path: "/admin/users" }
      ] : []),
      { icon: FileText, label: "Pending Actions", path: "/admin/pending-actions" },
    ]},
    ...(isSuperAdmin ? [{ label: "Administration", items: [
      { icon: ShieldCheck, label: "Admins", path: "/admin/admins" },
      { icon: FileText, label: "Content", path: "/admin/content" },
      { icon: Settings, label: "Site Settings", path: "/admin/settings" },
    ]}] : []),
    { label: "Account", items: [
      { icon: UserCircle, label: "My Profile", path: "/admin/profile" },
      { icon: Lock, label: "Security", path: "/admin/security" },
      { icon: Globe, label: "Marketplace", path: "/" },
    ]},
  ];

  return (
    <aside className="w-64 bg-zinc-950 text-white flex flex-col h-screen sticky top-0 border-r border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" />
          Marketplace
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuItems.map((group) => (
          <div key={group.label}>
            <h2 className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{group.label}</h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const currentPath = location.pathname + location.search;
                const isActive = item.path === currentPath || 
                  (item.path === "/dashboard" && location.pathname === "/dashboard" && (!location.search || location.search === "?tab=overview")) ||
                  (item.path !== "/" && item.path !== "/dashboard" && !item.path.includes("?") && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-500 font-medium" 
                        : "text-white hover:bg-zinc-900 hover:text-emerald-400"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      "group-hover:text-emerald-500"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
