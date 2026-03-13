import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item?"
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            {title}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 hover:bg-zinc-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-zinc-600">{message}</p>
        </div>
        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-100 transition-all"
          >
            No
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
