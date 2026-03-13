import { NavLink } from "react-router-dom";
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
  CreditCard
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isSuperAdmin = user.role === "super_admin";

  const menuItems = [
    { label: "Overview", items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
      ...(user.role !== 'seller' ? [{ icon: BarChart3, label: "Analytics & Reports", path: "/admin/reports" }] : []),
    ]},
    { label: "Management", items: [
      { icon: Package, label: "Products", path: "/admin/products" },
      { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
      ...(user.role !== 'seller' ? [
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
    <aside className="w-64 bg-zinc-950 text-zinc-400 flex flex-col h-screen sticky top-0 border-r border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" />
          Marketplace
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuItems.map((group) => (
          <div key={group.label}>
            <h2 className="px-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">{group.label}</h2>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-500 font-medium" 
                      : "hover:bg-zinc-900 hover:text-zinc-200"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    "group-hover:text-emerald-500"
                  )} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
