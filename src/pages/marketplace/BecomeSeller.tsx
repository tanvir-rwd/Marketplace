import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchApi } from "../../utils/api";

export default function BecomeSeller() {
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetchApi("/api/seller-applications", {
        method: "POST",
        body: JSON.stringify({ storeName, description }),
      });
      if (response.ok) {
        toast.success("Application submitted successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Failed to submit application");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full p-2 border border-zinc-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-zinc-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLoading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
