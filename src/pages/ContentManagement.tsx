import React, { useState, useEffect, useRef } from "react";
import { Layout, Image as ImageIcon, Package, FileText, Plus, Edit3, Eye, Check, X, ShieldAlert, Tag, UploadCloud, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { fetchApi } from "../utils/api";

const contentSections = [
  { id: 'homepage', title: "Homepage Content", icon: Layout, description: "Edit Homepage Text, Featured Sections, and Marketplace Highlights." },
  { id: 'banner', title: "Banner / Slider", icon: ImageIcon, description: "Add, Edit, Delete Banners, Upload Images, and Update Text/Titles." },
  { id: 'offer', title: "Offer Banner / Slider", icon: Tag, description: "Manage Offer Banners, Promotional Sliders, and Campaign Banners." },
  { id: 'product', title: "Product / Service", icon: Package, description: "Add new Products, Update Product Sections, and Edit Service Content." },
];

export default function ContentManagement() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form States
  const [title, setTitle] = useState("Welcome to Our Premium Farm Marketplace");
  const [description, setDescription] = useState("Discover the freshest local produce directly from farmers.");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("admin_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role);
      } catch (e) {
        console.error("Error parsing user data");
      }
    }

    // Load content from backend
    const fetchContent = async () => {
      try {
        const response = await fetchApi('/api/settings');
        const settings = await response.json();
        if (settings.marketplace_content) {
          const parsed = JSON.parse(settings.marketplace_content);
          setTitle(parsed.bannerTitle || "Welcome to Our Premium Farm Marketplace");
          setDescription(parsed.bannerSubtitle || "Discover the freshest local produce directly from farmers.");
          setSelectedImage(parsed.bannerImage || null);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchContent();
  }, []);

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
        <p className="text-zinc-500 max-w-md">
          You do not have permission to access the Content Management section. This area is restricted to Administrators and Super Administrators only.
        </p>
      </div>
    );
  }

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    
    // Load existing content if available
    const savedContent = localStorage.getItem('marketplace_content');
    if (savedContent && (sectionId === 'homepage' || sectionId === 'banner')) {
      try {
        const parsed = JSON.parse(savedContent);
        setTitle(parsed.bannerTitle || "Welcome to Our Premium Farm Marketplace");
        setDescription(parsed.bannerSubtitle || "Discover the freshest local produce directly from farmers.");
        setSelectedImage(parsed.bannerImage || null);
      } catch (e) {
        setTitle("Welcome to Our Premium Farm Marketplace");
        setDescription("Discover the freshest local produce directly from farmers.");
        setSelectedImage(null);
      }
    } else {
      setTitle("Welcome to Our Premium Farm Marketplace");
      setDescription("Discover the freshest local produce directly from farmers.");
      setSelectedImage(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or WEBP image.");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = () => {
    // Gather form data for preview
    setPreviewData({
      section: editingSection,
      changes: [
        { field: "Title", old: "Welcome to Farm", new: title },
        { field: "Description", old: "Discover the freshest local produce directly from farmers.", new: description },
        { field: "Banner Image", old: "banner-v1.jpg", new: selectedImage ? "New Image Uploaded" : "No Change" },
        { field: "Status", old: "Draft", new: "Published" }
      ]
    });
    setShowPreview(true);
  };

  const handleUpdate = async () => {
    // Save to backend settings
    if (editingSection === 'homepage' || editingSection === 'banner') {
      try {
        const response = await fetchApi('/api/settings');
        const settings = await response.json();
        const currentContent = settings.marketplace_content ? JSON.parse(settings.marketplace_content) : {};
        
        const newContent = {
          ...currentContent,
          bannerTitle: title,
          bannerSubtitle: description,
          ...(selectedImage && { bannerImage: selectedImage })
        };

        await fetchApi('/api/settings', {
          method: 'POST',
          body: JSON.stringify({
            key: 'marketplace_content',
            value: JSON.stringify(newContent)
          })
        });
        
        toast.success("Content updated successfully!");
        setShowPreview(false);
        setEditingSection(null);
        setSelectedImage(null);
      } catch (error) {
        console.error("Failed to update settings:", error);
        toast.error("Failed to update content.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Content Management</h1>
        <p className="text-zinc-500">Manage homepage content, banners, offers, and products.</p>
      </div>

      {!editingSection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentSections.map((section) => (
            <div key={section.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:border-emerald-500/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-zinc-100 p-3 rounded-xl text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                  <section.icon size={24} />
                </div>
                <button 
                  onClick={() => handleEdit(section.id)}
                  className="text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Edit3 size={16} />
                  Edit Section
                </button>
              </div>
              <h3 className="text-lg font-bold text-zinc-900">{section.title}</h3>
              <p className="text-zinc-500 text-sm mt-1">{section.description}</p>
              
              <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Last updated: 2 days ago</span>
                <button 
                  onClick={() => handleEdit(section.id)}
                  className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Editing: {contentSections.find(s => s.id === editingSection)?.title}
              </h2>
              <p className="text-sm text-zinc-500">Make changes to your content below.</p>
            </div>
            <button 
              onClick={() => setEditingSection(null)}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Placeholder for actual edit form fields based on section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Section Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Content / Description</label>
                <textarea 
                  rows={4} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Upload Image/Banner</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept=".jpg,.jpeg,.png,.webp" 
                  className="hidden" 
                />
                
                {!selectedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="mx-auto h-12 w-12 text-zinc-400 mb-3" />
                    <p className="text-sm text-zinc-600 font-medium">Click to upload image</p>
                    <p className="text-xs text-zinc-400 mt-1">JPG, PNG, or WEBP (max. 800x400px)</p>
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-xl p-4">
                    <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <ImageIcon size={16} />
                        Change Image
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
              <button 
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePreview}
                className="px-6 py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Eye size={18} />
                Preview Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Change Preview</h3>
                  <p className="text-sm text-zinc-500">Review your changes before publishing.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 text-zinc-600 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Field</th>
                      <th className="px-4 py-3 font-medium">Original Content</th>
                      <th className="px-4 py-3 font-medium text-emerald-600">New Content</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {previewData?.changes.map((change: any, index: number) => (
                      <tr key={index} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-medium text-zinc-900">{change.field}</td>
                        <td className="px-4 py-3 text-zinc-500 line-through decoration-red-300">{change.old}</td>
                        <td className="px-4 py-3 text-emerald-700 font-medium bg-emerald-50/30">{change.new}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-3">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <p>Please review the exact changes above. Once you click Update, these changes will be live on the platform immediately.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Continue Editing
              </button>
              <button 
                onClick={handleUpdate}
                className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Check size={18} />
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleRemoveImage}
        title="Remove Image"
        message="Are you sure you want to remove this image?"
      />
    </div>
  );
}
