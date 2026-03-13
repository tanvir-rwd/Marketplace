import { useState, lazy, Suspense, ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Admin Pages
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const SellerManagement = lazy(() => import("./pages/SellerManagement"));
const AdminManagement = lazy(() => import("./pages/AdminManagement"));
const Orders = lazy(() => import("./pages/Orders"));
const ContentManagement = lazy(() => import("./pages/ContentManagement"));
const PendingActions = lazy(() => import("./pages/PendingActions"));
const Security = lazy(() => import("./pages/Security"));
const Settings = lazy(() => import("./pages/Settings"));
const Reports = lazy(() => import("./pages/Reports"));
const Profile = lazy(() => import("./pages/Profile"));

// Marketplace Pages
const Home = lazy(() => import("./pages/marketplace/Home"));
const Shop = lazy(() => import("./pages/marketplace/Shop"));
const ProductDetails = lazy(() => import("./pages/marketplace/ProductDetails"));
const Cart = lazy(() => import("./pages/marketplace/Cart"));
const Checkout = lazy(() => import("./pages/marketplace/Checkout"));
const SellerProfile = lazy(() => import("./pages/marketplace/SellerProfile"));
const UserDashboard = lazy(() => import("./pages/marketplace/UserDashboard"));
const UserLogin = lazy(() => import("./pages/marketplace/UserLogin"));
const BecomeSeller = lazy(() => import("./pages/marketplace/BecomeSeller"));
const MarketplaceLayout = lazy(() => import("./components/marketplace/MarketplaceLayout"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function AdminLayout({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8">
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function RoleProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const userStr = localStorage.getItem("admin_user");
  if (!userStr) return <Navigate to="/admin" replace />;
  
  const user = JSON.parse(userStr);
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AdminApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const userStr = localStorage.getItem("admin_user");
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      return user.role === 'admin' || user.role === 'super_admin' || user.role === 'seller';
    } catch {
      return false;
    }
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_user");
    // navigate("/") is faster than window.location.href
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Login onLogin={handleLogin} />
      </Suspense>
    );
  }

  const commonRoles = ['admin', 'super_admin'];
  const superAdminOnly = ['super_admin'];

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="sellers" element={<RoleProtectedRoute allowedRoles={commonRoles}><SellerManagement /></RoleProtectedRoute>} />
        <Route path="orders" element={<Orders />} />
        <Route path="security" element={<Security />} />
        <Route path="reports" element={<RoleProtectedRoute allowedRoles={commonRoles}><Reports /></RoleProtectedRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<RoleProtectedRoute allowedRoles={commonRoles}><UserManagement /></RoleProtectedRoute>} />
        <Route path="pending-actions" element={<RoleProtectedRoute allowedRoles={[...commonRoles, 'seller']}><PendingActions /></RoleProtectedRoute>} />
        
        {/* Super Admin Only */}
        <Route path="admins" element={<RoleProtectedRoute allowedRoles={superAdminOnly}><AdminManagement /></RoleProtectedRoute>} />
        <Route path="content" element={<RoleProtectedRoute allowedRoles={superAdminOnly}><ContentManagement /></RoleProtectedRoute>} />
        <Route path="settings" element={<RoleProtectedRoute allowedRoles={superAdminOnly}><Settings /></RoleProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Marketplace Routes */}
        <Route path="/" element={
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceLayout />
          </Suspense>
        }>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="seller/:id" element={<SellerProfile />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="login" element={<UserLogin />} />
          <Route path="become-seller" element={<BecomeSeller />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}
