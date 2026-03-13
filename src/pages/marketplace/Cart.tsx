import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from "lucide-react";
import { getCart, updateCartQuantity, removeFromCart, CartItem } from "../../utils/cart";

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(getCart());
    
    const handleCartUpdate = () => {
      setCartItems(getCart());
    };
    
    window.addEventListener('cart_updated', handleCartUpdate);
    return () => window.removeEventListener('cart_updated', handleCartUpdate);
  }, []);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    updateCartQuantity(id, newQuantity);
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            to="/shop" 
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`} className="block mb-1">
                    <h3 className="font-bold text-zinc-900 hover:text-emerald-600 transition-colors truncate">{item.name}</h3>
                  </Link>
                  <p className="text-emerald-600 font-bold mb-4">${item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-zinc-300 rounded-lg bg-zinc-50">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm text-zinc-900">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-zinc-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping Estimate</span>
                  <span className="font-medium text-zinc-900">${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-100 pt-4 flex justify-between">
                  <span className="font-bold text-zinc-900">Total</span>
                  <span className="font-extrabold text-2xl text-emerald-600">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 mb-4"
              >
                Proceed to Checkout
              </button>
              
              <Link 
                to="/shop" 
                className="block w-full py-3 text-center text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
