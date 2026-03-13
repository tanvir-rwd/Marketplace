import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, Star, ShoppingCart, Eye, SlidersHorizontal, X } from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "../../utils/cart";
import { fetchApi } from "../../utils/api";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Update filters when URL params change
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const response = await fetchApi("/api/products");
      const data = await response.json();
      
      // Filter only approved products
      const approvedProducts = data.filter((p: any) => p.status === 'approved');
      setProducts(approvedProducts);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(approvedProducts.map((p: any) => p.category))).filter(Boolean) as string[];
      setCategories(uniqueCategories);
      
      // Find max price for range slider
      if (approvedProducts.length > 0) {
        const maxPrice = Math.max(...approvedProducts.map((p: any) => p.price));
        setPriceRange([0, Math.ceil(maxPrice)]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchQuery });
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  // Apply filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesStock = inStockOnly ? product.stock > 0 : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Shop All Products</h1>
            <p className="text-zinc-500 mt-1">Showing {filteredProducts.length} results</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
            </form>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 bg-white border border-zinc-300 text-zinc-700 rounded-xl hover:bg-zinc-50 md:hidden"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 sticky top-24">
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setShowFilters(false)}><X size={20} /></button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Filter size={16} /> Categories
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => { setSelectedCategory(""); updateParams({ category: null }); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((category, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { setSelectedCategory(category); updateParams({ category }); }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-zinc-600 hover:bg-zinc-50'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-bold text-zinc-900 mb-4">Price Range</h3>
                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="number" 
                    value={priceRange[0]} 
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                  />
                  <span className="text-zinc-400">-</span>
                  <input 
                    type="number" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-bold text-zinc-900 mb-4">Availability</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-zinc-700">In Stock Only</span>
                </label>
              </div>
              
              {/* Clear Filters */}
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setInStockOnly(false);
                  updateParams({ search: null, category: null });
                }}
                className="w-full mt-8 px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 animate-pulse">
                    <div className="w-full h-48 bg-zinc-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-zinc-200 rounded w-1/2 mb-4"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
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
              <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200">
                <Search className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-bold text-zinc-900 mb-2">No products found</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                  We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setInStockOnly(false);
                    updateParams({ search: null, category: null });
                  }}
                  className="mt-6 px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
