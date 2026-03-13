import React, { useState, useRef } from "react";
import { X, Save, Upload, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface AddSellerModalProps {
  onClose: () => void;
  onAdd: (seller: any) => void;
}

export default function AddSellerModal({ onClose, onAdd }: AddSellerModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    contact_number: "",
    password: "",
    role: "seller",
    status: "Active",
    profile_image: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP formats are allowed.");
      return;
    }

    // Validation: Size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setFormData(prev => ({ ...prev, profile_image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, profile_image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-lg font-bold text-zinc-900">Add New Seller</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Seller Name</label>
              <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Username</label>
              <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Contact Number</label>
              <input type="text" required value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500">
                <option value="seller">Seller</option>
                <option value="premium_seller">Premium Seller</option>
                <option value="verified_seller">Verified Seller</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-500">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Profile Image</label>
            <div className="flex items-center gap-4">
              {previewImage ? (
                <div className="relative w-20 h-20">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg border border-zinc-200" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-zinc-200 rounded-lg flex items-center gap-2 text-sm text-zinc-600 hover:bg-zinc-50">
                  <Upload size={16} /> Upload Image
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
              <Save size={18} /> Create Seller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
