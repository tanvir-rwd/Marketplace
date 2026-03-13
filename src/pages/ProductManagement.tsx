import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Package, DollarSign, Tag, AlertCircle, X, Save, Eye } from "lucide-react";
import toast from "react-hot-toast";
import AddProductModal from "../components/AddProductModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { fetchApi } from "../utils/api";

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
}

function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const images = product.image_url?.startsWith('[') ? JSON.parse(product.image_url) : [product.image_url];
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Product Details</h3>
              <p className="text-xs text-zinc-500">Full information for Product #{product.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner group cursor-zoom-in">
                <img 
                  src={activeImage || `https://picsum.photos/seed/${product.id}/800/800`} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                  referrerPolicy="no-referrer"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImage === img ? 'border-emerald-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 leading-tight">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-100">
                    {product.category}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                    product.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    product.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {product.status || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <DollarSign size={10} /> Price
                  </p>
                  <p className="text-xl font-extrabold text-zinc-900">${product.price}</p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Package size={10} /> Stock
                  </p>
                  <p className="text-xl font-extrabold text-zinc-900">{product.stock} <span className="text-xs font-normal text-zinc-500">Units</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag size={10} /> Description
                </p>
                <div className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100 min-h-[100px]">
                  {product.description || "No description provided for this product."}
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest">Seller ID</span>
                  <span className="text-zinc-900 font-bold">#{product.seller_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest">Product ID</span>
                  <span className="text-zinc-900 font-bold">#{product.id}</span>
                </div>
                {product.created_at && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest">Added On</span>
                    <span className="text-zinc-900 font-bold">{new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all text-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isAdminOrSuperAdmin = user.role === "super_admin" || user.role === "admin";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetchApi("/api/products");
      let data = await response.json();
      
      if (Array.isArray(data)) {
        if (user.role === 'seller') {
          data = data.filter((p: any) => p.seller_id === user.id);
        }
        setProducts(data);
      } else {
        setProducts([]);
        toast.error("Failed to load products");
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProduct = async (id: number) => {
    try {
      const response = await fetchApi(`/api/products/${id}/approve`, { method: "POST" });
      if (response.ok) {
        toast.success("Product approved");
        fetchProducts();
      } else {
        toast.error("Failed to approve product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleRejectProduct = async (id: number) => {
    try {
      const response = await fetchApi(`/api/products/${id}/reject`, { method: "POST" });
      if (response.ok) {
        toast.success("Product rejected");
        fetchProducts();
      } else {
        toast.error("Failed to reject product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAddProduct = async (newProduct: any) => {
    try {
      const response = await fetchApi("/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        toast.success("Product added successfully");
        setIsAddModalOpen(false);
        fetchProducts();
      } else {
        toast.error("Failed to add product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      const response = await fetchApi(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...editingProduct,
          price: parseFloat(editingProduct.price) || 0,
          stock: parseInt(editingProduct.stock) || 0
        }),
      });

      if (response.ok) {
        toast.success("Product updated successfully");
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetchApi(`/api/products/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const getStockStatus = (product: any) => {
    if (product.status === 'pending') return 'Pending';
    if (product.status === 'rejected') return 'Rejected';
    if (product.stock === 0) return "Out of Stock";
    if (product.stock < 5) return "Low Stock";
    if (product.stock < 20) return "Limited Stock";
    return "Approved";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "in stock": return "bg-emerald-100 text-emerald-700";
      case "limited stock": return "bg-blue-100 text-blue-700";
      case "low stock": return "bg-amber-100 text-amber-700";
      case "out of stock": return "bg-red-100 text-red-700";
      default: return "bg-zinc-100 text-zinc-700";
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Product Management</h1>
          <p className="text-zinc-500">Add, edit, and manage your product inventory.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 group cursor-pointer shrink-0">
                        {(() => {
                          const images = product.image_url?.startsWith('[') ? JSON.parse(product.image_url) : [product.image_url];
                          return (
                            <>
                              <img 
                                src={images[0] || `https://picsum.photos/seed/${product.id}/400/300`} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                referrerPolicy="no-referrer" 
                              />
                              {images.length > 1 && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1 p-1">
                                  {images.slice(0, 4).map((img: string, i: number) => (
                                    <img key={i} src={img} className="w-6 h-6 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                                  ))}
                                  {images.length > 4 && (
                                    <span className="text-[10px] text-white font-bold">+{images.length - 4}</span>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{product.name}</p>
                        <p className="text-xs text-zinc-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900">${product.price}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(getStockStatus(product))}`}>
                      {getStockStatus(product)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingProduct(product)} 
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {isAdminOrSuperAdmin && product.status === 'pending' && (
                        <>
                          <button onClick={() => handleApproveProduct(product.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">Approve</button>
                          <button onClick={() => handleRejectProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">Reject</button>
                        </>
                      )}
                      <button onClick={() => setEditingProduct(product)} className="p-2 text-zinc-400 hover:text-emerald-600"><Edit2 size={18} /></button>
                      <button onClick={() => setDeleteProductId(product.id)} className="p-2 text-zinc-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} />}
      
      {viewingProduct && (
        <ProductDetailsModal 
          product={viewingProduct} 
          onClose={() => setViewingProduct(null)} 
        />
      )}
      
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-zinc-900">Edit Product</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={editingProduct.name} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                  placeholder="Enter Product Name"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-1">Product Price</label>
                <input 
                  type="number" 
                  value={editingProduct.price ?? ''} 
                  onChange={e => {
                    const val = e.target.value;
                    setEditingProduct({...editingProduct, price: val === '' ? '' : parseFloat(val)});
                  }}
                  placeholder="Enter Product Price"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-1">Product Quantity</label>
                <input 
                  type="number" 
                  value={editingProduct.stock ?? ''} 
                  onChange={e => {
                    const val = e.target.value;
                    setEditingProduct({...editingProduct, stock: val === '' ? '' : parseInt(val)});
                  }}
                  placeholder="Enter Available Quantity"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500" 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50">Cancel</button>
              <button onClick={handleUpdateProduct} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Update Product</button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        onConfirm={() => deleteProductId && handleDeleteProduct(deleteProductId)}
      />
    </div>
  );
}
