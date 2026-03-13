import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ShieldCheck } from "lucide-react";
import { getCart } from "../../utils/cart";
import { fetchApi } from "../../utils/api";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("admin_user") || "null");

  useEffect(() => {
    fetchApi("/api/products")
      .then(res => res.json())
      .then(data => {
        const approvedProducts = data.filter((p: any) => p.status === 'approved');
        const uniqueCategories = Array.from(new Set(approvedProducts.map((p: any) => p.category))).filter(Boolean) as string[];
        setCategories(uniqueCategories);
      });

    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener('cart_updated', updateCartCount);
    return () => window.removeEventListener('cart_updated', updateCartCount);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
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
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mr-8">
            <Link to="/" className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              <span>Marketplace</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
            <Link to="/" className="text-zinc-600 hover:text-emerald-600 font-medium">Home</Link>
            <Link to="/shop" className="text-zinc-600 hover:text-emerald-600 font-medium">Shop</Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="text-zinc-600 hover:text-emerald-600 font-medium flex items-center gap-1">
                Categories
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {categories.length > 0 ? categories.map((category, idx) => (
                    <Link 
                      key={idx} 
                      to={`/shop?category=${encodeURIComponent(category)}`}
                      className="block px-4 py-2 text-sm text-zinc-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      {category}
                    </Link>
                  )) : (
                    <div className="px-4 py-2 text-sm text-zinc-500">No categories</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search products, sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
            </form>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'seller') && (
              <Link to="/admin/dashboard" className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors">
                {user.role === 'seller' ? 'Seller Dashboard' : 'Admin Panel'}
              </Link>
            )}
            <Link to="/cart" className="text-zinc-600 hover:text-emerald-600 relative">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <Link 
                to={user.role === 'user' ? "/dashboard" : "/admin/profile"}
                className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-zinc-900 leading-none mb-1">{user.full_name || user.username || "User"}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'super_admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    user.role === 'admin' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    user.role === 'seller' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {getRoleDisplay(user.role)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
              </Link>
            ) : (
              <Link to="/login" className="text-zinc-600 hover:text-emerald-600 flex items-center gap-2" title="Login">
                <User className="h-6 w-6" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-zinc-600 hover:text-emerald-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
            </form>
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50">Home</Link>
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50">Shop</Link>
            <div className="px-3 py-2 text-base font-medium text-zinc-700">Categories</div>
            <div className="pl-6 space-y-1">
              {categories.map((category, idx) => (
                <Link 
                  key={idx} 
                  to={`/shop?category=${encodeURIComponent(category)}`}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  {category}
                </Link>
              ))}
            </div>
            <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50">Cart</Link>
            {user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'seller') && (
              <Link to="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-bold text-emerald-600 hover:bg-emerald-50">
                {user.role === 'seller' ? 'Seller Dashboard' : 'Admin Panel'}
              </Link>
            )}
            <Link to={user ? "/dashboard" : "/login"} className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50">
              {user ? "My Account" : "Login"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
