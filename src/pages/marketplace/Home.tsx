import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "../../utils/cart";
import { fetchApi } from "../../utils/api";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<any>({
    bannerImage: "https://picsum.photos/seed/marketplace/1920/600",
    bannerTitle: "Welcome to Our Premium Marketplace",
    bannerSubtitle: "Discover unique products from verified sellers around the world.",
  });

  useEffect(() => {
    fetchProducts();
    
    // Load content from backend settings
    const fetchContent = async () => {
      try {
        const response = await fetchApi('/api/public-settings');
        const settings = await response.json();
        if (settings.marketplace_content) {
          const parsed = JSON.parse(settings.marketplace_content);
          setContent((prev: any) => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchContent();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetchApi("/api/products");
      const data = await response.json();
      // Filter only approved products
      const approvedProducts = data.filter((p: any) => p.status === 'approved');
      setProducts(approvedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-zinc-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={content.bannerImage} 
            alt="Hero Banner" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {content.bannerTitle}
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mb-10">
            {content.bannerSubtitle}
          </p>
          <div className="flex gap-4">
            <Link 
              to="/shop" 
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-colors flex items-center gap-2"
            >
              Shop Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900">Featured Products</h2>
            <p className="text-zinc-500 mt-2">Handpicked items just for you</p>
          </div>
          <Link to="/shop" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 hidden sm:flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 animate-pulse">
                <div className="w-full h-48 bg-zinc-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-zinc-200 rounded w-1/4"></div>
                  <div className="h-8 bg-zinc-200 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-md transition-shadow group">
                <div className="relative h-48 overflow-hidden bg-zinc-100">
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
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-bold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 text-amber-500 shrink-0">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-medium text-zinc-700">4.5</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
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
          <div className="text-center py-12 bg-white rounded-2xl border border-zinc-100">
            <p className="text-zinc-500">No products available at the moment.</p>
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link to="/shop" className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Offer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16">
        <div className="bg-emerald-600 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative px-8 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Special Weekend Sale!</h2>
              <p className="text-emerald-100 text-lg mb-8">Get up to 30% off on all organic farm products. Limited time offer.</p>
              <Link 
                to="/shop" 
                className="inline-block px-8 py-4 bg-white text-emerald-600 font-bold rounded-full hover:bg-zinc-50 transition-colors shadow-lg"
              >
                Shop the Sale
              </Link>
            </div>
            <div className="hidden md:block w-64 h-64 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 p-4">
              <img 
                src="https://picsum.photos/seed/sale/400/400" 
                alt="Sale" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
