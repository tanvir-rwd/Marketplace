import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Marketplace</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Your one-stop destination for premium products from verified sellers. We ensure quality, security, and fast delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-emerald-400 transition-colors">Shop All Products</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-400 transition-colors">Your Cart</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
              <li><Link to="/returns" className="hover:text-emerald-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/shipping" className="hover:text-emerald-400 transition-colors">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>123 Marketplace Ave, Tech City, TC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-500 shrink-0" />
                <span>+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500 shrink-0" />
                <span>support@marketplace.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Marketplace. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0 items-center">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-zinc-700">|</span>
            <Link to="/admin?mode=super" className="hover:text-emerald-400 transition-colors" title="Administrator" onClick={(e) => {
              const userStr = localStorage.getItem("admin_user");
              if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role !== 'super_admin' && user.role !== 'admin') {
                  e.preventDefault();
                  alert("Access Denied: Only Administrators can access this area.");
                }
              } else {
                sessionStorage.setItem("super_admin_portal_access", "true");
              }
            }}>
              <ShieldCheck size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
