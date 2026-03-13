import React, { useState, useRef } from "react";
import { X, Save, Upload, Trash2, Package, DollarSign, Tag, Layers, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (product: any) => void;
}

export default function AddProductModal({ onClose, onAdd }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    status: "Available",
    image_url: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const fileList = Array.from(files) as File[];

    fileList.forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} is not a valid format. Only JPG, PNG, and WEBP are allowed.`);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 2MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages(prev => {
          const updated = [...prev, base64String];
          setFormData(f => ({ ...f, image_url: JSON.stringify(updated) }));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setFormData(f => ({ ...f, image_url: JSON.stringify(updated) }));
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 3) {
      toast.error("Please add at least 3 product images.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
    onAdd({ ...formData, seller_id: user.id });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-lg font-bold text-zinc-900">Add New Product</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Product Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Category</label>
              <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Price</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Quantity</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Product Images (Min 3)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover rounded-lg border border-zinc-200" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="aspect-square border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
              >
                <Upload size={20} />
                <span className="text-[10px] font-bold mt-1">Add</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" multiple className="hidden" />
            <p className="text-[10px] text-zinc-400">Add at least 3 high-quality images of your product.</p>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
              <Save size={18} /> Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
