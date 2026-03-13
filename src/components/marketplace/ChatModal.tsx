import React, { useState, useRef } from 'react';
import { X, Send, Image as ImageIcon } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  user: any;
}

export default function ChatModal({ isOpen, onClose, product, user }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;
    
    setIsSending(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Failed to upload image');
        const data = await res.json();
        imageUrl = data.url;
      }

      const fullMessage = message;
      
      const res = await fetchApi("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: product.seller_id,
          product_id: product.id,
          content: fullMessage,
          image_url: imageUrl
        })
      });
      
      if (res.ok) {
        toast.success("Message sent successfully!");
        onClose();
        setMessage('');
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <div>
            <h3 className="font-bold text-zinc-900">Message Seller</h3>
            <p className="text-xs text-zinc-500 line-clamp-1">About: {product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1 bg-zinc-50/50">
          <div className="bg-white p-3 rounded-xl border border-zinc-200 mb-4 flex gap-3 items-center">
            <img 
              src={product.image_url?.startsWith('[') ? JSON.parse(product.image_url)[0] : (product.image_url || `https://picsum.photos/seed/${product.id}/100/100`)} 
              alt={product.name} 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-medium text-zinc-900 line-clamp-1">{product.name}</p>
              <p className="text-xs text-zinc-500">Link will be attached automatically</p>
            </div>
          </div>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-32 p-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            autoFocus
          />
          
          <div className="mt-2 flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-emerald-600"
            >
              <ImageIcon size={18} /> Add Image
            </button>
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                <button 
                  onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? 'Sending...' : (
              <>
                Send Message <Send size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
