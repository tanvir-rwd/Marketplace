import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Package, ShoppingCart, Eye, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "../../utils/cart";
import { fetchApi } from "../../utils/api";

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    setIsLoading(true);
    try {
      const sellerRes = await fetchApi(`/api/users/${id}`);
      if (sellerRes.ok) {
        const sellerData = await sellerRes.json();
        setSeller(sellerData);
      }

      const productsRes = await fetchApi("/api/products");
      if (productsRes.ok) {
        const allProducts = await productsRes.json();
        const sellerProducts = allProducts.filter((p: any) => p.seller_id === Number(id) && p.status === 'approved');
        setProducts(sellerProducts);
      }
    } catch (error) {
      console.error("Failed to fetch seller data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
        <Package className="h-16 w-16 text-zinc-300 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Seller Not Found</h2>
        <p className="text-zinc-500 mb-6">The seller you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Seller Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-emerald-600 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 mt-12">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-zinc-100 overflow-hidden shrink-0">
              {seller.profile_image ? (
                <img src={seller.profile_image} alt={seller.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-400">
                  {seller.full_name?.charAt(0) || 'S'}
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">{seller.full_name || seller.username}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-600 mb-6">
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold text-amber-700">4.8</span>
                  <span className="text-amber-600/80">(340 Reviews)</span>
                </div>
                {seller.address && (
                  <div className="flex items-center gap-1 bg-zinc-100 px-3 py-1 rounded-full">
                    <MapPin size={16} className="text-zinc-400" />
                    <span>{seller.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 font-medium">
                  <ShieldCheck size={16} />
                  Verified Seller
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-8">
                <div>
                  <p className="text-2xl font-extrabold text-zinc-900">{products.length}</p>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-zinc-900">{seller.total_orders || '1.2k'}</p>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sales</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-zinc-900">98%</p>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Positive Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Products */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Products by {seller.full_name}</h2>
            <p className="text-zinc-500 mt-1">Showing {products.length} items</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-200 hover:shadow-md transition-shadow group flex flex-col">
                <div className="relative h-48 overflow-hidden bg-zinc-100 shrink-0">
                  <img 
                    src={product.image_url?.startsWith('[') ? JSON.parse(product.image_url)[0] : (product.image_url || `https://picsum.photos/seed/${product.id}/400/300`)} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      to={`/product/${product.id}`}
                      className="p-2 bg-white text-zinc-700 rounded-full shadow-md hover:text-emerald-600 transition-colors"
                      title="Quick View"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
                      Only {product.stock} left
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-bold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 text-amber-500 shrink-0">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-medium text-zinc-700">4.5</span>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mb-2">{product.category}</p>
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                    <span className="text-lg font-extrabold text-zinc-900">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="p-2 bg-zinc-100 text-zinc-700 rounded-full hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to Cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200">
            <Package className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No products yet</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              This seller hasn't listed any products yet or their products are pending approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
