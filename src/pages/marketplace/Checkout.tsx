import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, CreditCard, MapPin, User, Phone, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { getCart, clearCart, CartItem } from "../../utils/cart";
import { fetchApi } from "../../utils/api";

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "",
    transactionId: "",
    senderNumber: "",
  });

  const user = JSON.parse(localStorage.getItem("admin_user") || "null");

  useEffect(() => {
    const items = getCart();
    if (items.length === 0 && !isSuccess) {
      navigate('/cart');
      return;
    }
    setCartItems(items);

    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.contact_number || "",
        address: user.address || "",
      }));
    }

    fetchApi("/api/payment-methods")
      .then(res => res.json())
      .then(data => {
        const enabledMethods = data.filter((m: any) => m.is_enabled === 1);
        setPaymentMethods(enabledMethods);
        if (enabledMethods.length > 0) {
          setFormData(prev => ({ ...prev, paymentMethod: enabledMethods[0].id }));
        }
      });
  }, [navigate, isSuccess, user]);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address || !formData.paymentMethod || !formData.transactionId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, we'd create an order for each item or a single order with order_items
      // Since the current DB schema has `orders` table with `product_id`, we'll create multiple orders
      // or just one for the first item for demonstration. Let's create one for each item.
      
      const orderPromises = cartItems.map(item => 
        fetchApi("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            product_id: item.id,
            user_id: user?.id,
            quantity: item.quantity,
            total_price: (item.price * item.quantity) + (shipping / cartItems.length), // distribute shipping
            payment_method: formData.paymentMethod,
            sender_number: formData.senderNumber || formData.phone,
            transaction_id: formData.transactionId,
          }),
        }).then(res => res.json())
      );

      const results = await Promise.all(orderPromises);
      
      // Generate a fake order ID for the UI
      const displayOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(displayOrderId);
      
      clearCart();
      setIsSuccess(true);
      toast.success("Order placed successfully!");
      
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 mb-4">Order Confirmed!</h1>
          <p className="text-zinc-600 mb-8 text-lg">
            Thank you for your purchase. Your order <span className="font-bold text-zinc-900">{orderId}</span> has been received and is being processed.
          </p>
          <div className="space-y-4">
            <Link 
              to="/dashboard" 
              className="block w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              View Order Status
            </Link>
            <Link 
              to="/shop" 
              className="block w-full py-4 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedMethodInfo = paymentMethods.find(m => m.id === formData.paymentMethod);

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Back to Cart
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Shipping Details */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200">
                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <User className="text-emerald-600" size={24} /> Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="john@example.com"
                      />
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Phone Number *</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="+880 1700 000000"
                      />
                      <Phone className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Delivery Address *</label>
                    <div className="relative">
                      <textarea 
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                        placeholder="House 123, Road 4, Block A, City"
                      />
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200">
                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <CreditCard className="text-emerald-600" size={24} /> Payment Method
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {paymentMethods.map((method) => (
                    <label 
                      key={method.id} 
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                        formData.paymentMethod === method.id 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-zinc-200 hover:border-emerald-200 text-zinc-600'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="font-bold">{method.name}</span>
                    </label>
                  ))}
                </div>

                {selectedMethodInfo && (
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-8">
                    <h3 className="font-bold text-zinc-900 mb-2">Payment Instructions</h3>
                    <p className="text-zinc-600 mb-4">{selectedMethodInfo.instructions}</p>
                    <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200">
                      <span className="text-zinc-500 font-medium">Send Money to:</span>
                      <span className="font-extrabold text-lg text-emerald-600 tracking-wider">{selectedMethodInfo.identifier}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Sender Number *</label>
                    <input 
                      type="text" 
                      name="senderNumber"
                      required
                      value={formData.senderNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Number you sent money from"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Transaction ID *</label>
                    <input 
                      type="text" 
                      name="transactionId"
                      required
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase"
                      placeholder="e.g. TXN123456789"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 sticky top-24">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 truncate">{item.name}</h4>
                      <p className="text-xs text-zinc-500 mb-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-emerald-600">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 mb-6 pt-6 border-t border-zinc-100">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className="font-medium text-zinc-900">${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-100 pt-4 flex justify-between">
                  <span className="font-bold text-zinc-900">Total</span>
                  <span className="font-extrabold text-2xl text-emerald-600">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Place Order
                  </>
                )}
              </button>
              
              <p className="text-xs text-center text-zinc-500">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
