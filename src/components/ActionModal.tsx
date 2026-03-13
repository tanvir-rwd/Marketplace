import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: number | string;
  actionType: 'delete' | 'restrict';
  onConfirm: (description: string) => void;
}

export function ActionModal({ isOpen, onClose, targetUserId, actionType, onConfirm }: ActionModalProps) {
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-zinc-900 capitalize">{actionType} User</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">Are you sure you want to {actionType} this user? This action requires Super Admin approval.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter reason for this action (mandatory)..."
            className="w-full p-3 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 text-sm h-32"
            required
          />
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-lg">Cancel</button>
            <button 
              onClick={() => {
                if (!description.trim()) {
                    toast.error("Description is mandatory");
                    return;
                }
                onConfirm(description);
                onClose();
              }}
              className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
