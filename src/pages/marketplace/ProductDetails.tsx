import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, ChevronRight, Package, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "../../utils/cart";
import { fetchApi } from "../../utils/api";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch product
      const res = await fetchApi(`/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);
      
      const images = data.image_url?.startsWith('[') ? JSON.parse(data.image_url) : [data.image_url];
      setActiveImage(images[0] || `https://picsum.photos/seed/${data.id}/800/800`);

      // Fetch seller
      if (data.seller_id) {
        const sellerRes = await fetchApi(`/api/users/${data.seller_id}`);
        if (sellerRes.ok) {
          const sellerData = await sellerRes.json();
          setSeller(sellerData);
        }
      }

      // Fetch related products
      const allProductsRes = await fetchApi("/api/products");
      if (allProductsRes.ok) {
        const allProducts = await allProductsRes.json();
        const related = allProducts
          .filter((p: any) => p.category === data.category && p.id !== data.id && p.status === 'approved')
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      toast.error("Product not found");
      navigate("/shop");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc' && quantity < product.stock) {
      setQuantity(q => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const galleryImages = product.image_url?.startsWith('[') 
    ? JSON.parse(product.image_url) 
    : [product.image_url || `https://picsum.photos/seed/${product.id}/800/800`];

  return (
    <div className="bg-zinc-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-emerald-600 transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-emerald-600 transition-colors">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-zinc-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Product Gallery */}
            <div className="p-8 lg:border-r border-zinc-200 bg-zinc-50/50">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-zinc-200 mb-4 relative group cursor-zoom-in">
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-emerald-500 shadow-md' : 'border-transparent hover:border-emerald-200'}`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-6">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h1 className="text-3xl font-extrabold text-zinc-900">{product.name}</h1>
                  <button className="p-3 bg-zinc-100 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0">
                    <Heart size={24} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm mb-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" className="text-zinc-300" />
                    <span className="text-zinc-700 font-medium ml-1">4.0 (120 Reviews)</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                  <span className="text-emerald-600 font-medium">{product.category}</span>
                </div>

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-4xl font-extrabold text-zinc-900">${product.price.toFixed(2)}</span>
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full">
                      {product.stock <= 10 ? `Only ${product.stock} left in stock` : 'In Stock'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <p className="text-zinc-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-zinc-300 rounded-xl bg-white">
                    <button 
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1}
                      className="px-4 py-3 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-zinc-900">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange('inc')}
                      disabled={quantity >= product.stock}
                      className="px-4 py-3 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 px-6 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                </div>
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Secure Payment</p>
                    <p className="text-xs text-zinc-500">100% secure checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Fast Delivery</p>
                    <p className="text-xs text-zinc-500">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Free Returns</p>
                    <p className="text-xs text-zinc-500">Within 30 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Specifications & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Product Specifications</h2>
              <div className="space-y-4">
                <div className="flex py-3 border-b border-zinc-100">
                  <span className="w-1/3 text-zinc-500 font-medium">Category</span>
                  <span className="w-2/3 text-zinc-900 font-medium">{product.category}</span>
                </div>
                <div className="flex py-3 border-b border-zinc-100">
                  <span className="w-1/3 text-zinc-500 font-medium">Availability</span>
                  <span className="w-2/3 text-zinc-900 font-medium">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="flex py-3 border-b border-zinc-100">
                  <span className="w-1/3 text-zinc-500 font-medium">Product ID</span>
                  <span className="w-2/3 text-zinc-900 font-medium">#{product.id.toString().padStart(6, '0')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Customer Reviews</h2>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-zinc-100">
                <div className="text-center">
                  <div className="text-5xl font-extrabold text-zinc-900 mb-2">4.0</div>
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" className="text-zinc-300" />
                  </div>
                  <div className="text-sm text-zinc-500">Based on 120 reviews</div>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3 text-sm">
                      <span className="w-8 text-zinc-600 font-medium">{rating} Star</span>
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : 5}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-zinc-500">{rating === 5 ? 72 : rating === 4 ? 30 : rating === 3 ? 12 : 6}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Mock Review */}
                <div className="pb-6 border-b border-zinc-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
                        JD
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">John Doe</p>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">2 days ago</span>
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    Excellent product! The quality is amazing and it arrived much faster than expected. Highly recommend this seller.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 sticky top-24">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">About the Seller</h2>
              {seller ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                      {seller.profile_image ? (
                        <img src={seller.profile_image} alt={seller.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400">
                          {seller.full_name?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">{seller.full_name || seller.username}</h3>
                      <div className="flex items-center gap-1 text-amber-500 text-sm">
                        <Star size={14} fill="currentColor" />
                        <span className="font-medium text-zinc-700">4.8</span>
                        <span className="text-zinc-500">(340 ratings)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-zinc-50 rounded-2xl text-center">
                      <p className="text-2xl font-extrabold text-zinc-900 mb-1">150+</p>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Products</p>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl text-center">
                      <p className="text-2xl font-extrabold text-zinc-900 mb-1">1.2k</p>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sales</p>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/seller/${seller.id}`}
                    className="block w-full py-3 text-center border-2 border-zinc-200 text-zinc-700 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    Visit Seller Store
                  </Link>
                </>
              ) : (
                <div className="text-center py-6">
                  <Package className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                  <p className="text-zinc-500">Seller information not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-200 hover:shadow-md transition-shadow group flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-zinc-100 shrink-0">
                    <img 
                      src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <Link to={`/product/${product.id}`} className="block mb-2">
                      <h3 className="font-bold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                      <span className="text-lg font-extrabold text-zinc-900">${product.price.toFixed(2)}</span>
                      <Link 
                        to={`/product/${product.id}`}
                        className="p-2 bg-zinc-100 text-zinc-700 rounded-full hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
