import React, { useState, useEffect, useRef } from "react";
import { fetchApi } from "../utils/api";
import { Send, User as UserIcon, MessageSquare, Search, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetchApi(`/api/users/search?q=${searchTerm}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.filter((u: any) => u.id !== user.id));
        }
      } catch (error) {
        console.error("Search failed", error);
      }
    };
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const startNewChat = (otherUser: any) => {
    setActiveChat({
      other_user_id: otherUser.id,
      other_user_name: otherUser.username || otherUser.full_name,
      other_user_image: otherUser.profile_image,
      other_user_role: 'user' // Default
    });
    setMessages([]);
    setSearchTerm("");
    setSearchResults([]);
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.other_user_id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!user.id) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetchApi(`/api/conversations/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: number) => {
    if (!user.id) return;
    try {
      const res = await fetchApi(`/api/messages/${user.id}/${otherUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeChat || !user.id) return;

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

      const res = await fetchApi("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: activeChat.other_user_id,
          product_id: activeChat.product_id,
          content: newMessage,
          image_url: imageUrl
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setNewMessage("");
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchConversations(); // Update the latest message in the sidebar
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Messages</h1>
          <p className="text-zinc-500 font-medium mt-1">Chat directly with {user.role === 'seller' ? 'customers' : 'sellers'}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex h-[700px]">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
          <div className="p-4 border-b border-zinc-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations or users..." 
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {searchTerm && searchResults.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-bold text-zinc-400 uppercase px-4 mb-2">Search Results</p>
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startNewChat(user)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden">
                      <img src={user.profile_image || `https://ui-avatars.com/api/?name=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium text-zinc-900">{user.username}</span>
                  </button>
                ))}
              </div>
            )}
            
            {searchTerm && searchResults.length === 0 && (
              <p className="p-4 text-center text-zinc-500 text-sm">No users found.</p>
            )}

            {!searchTerm && (
              <div className="divide-y divide-zinc-100">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
                    <p className="font-medium">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.other_user_id}
                      onClick={() => setActiveChat(conv)}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                        activeChat?.other_user_id === conv.other_user_id 
                          ? 'bg-emerald-50/50 border-l-4 border-emerald-500' 
                          : 'hover:bg-white border-l-4 border-transparent'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                        {conv.other_user_image ? (
                          <img src={conv.other_user_image} alt={conv.other_user_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold">
                            {conv.other_user_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-zinc-900 truncate pr-2">{conv.other_user_name}</h3>
                          <span className="text-xs font-medium text-zinc-400 shrink-0">
                            {new Date(conv.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${!conv.is_read && conv.sender_id !== user.id ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>
                          {conv.sender_id === user.id ? 'You: ' : ''}{conv.content}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-200 flex items-center gap-3 bg-white">
                <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                  {activeChat.other_user_image ? (
                    <img src={activeChat.other_user_image} alt={activeChat.other_user_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold">
                      {activeChat.other_user_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{activeChat.other_user_name}</h3>
                  <p className="text-xs font-medium text-zinc-500 capitalize">{activeChat.other_user_role}</p>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
                {messages.map((msg, index) => {
                  const isMe = msg.sender_id === user.id;
                  const showProduct = msg.product_id && (index === 0 || messages[index - 1].product_id !== msg.product_id);
                  
                  return (
                    <div key={msg.id} className="space-y-2">
                      {showProduct && (
                        <div className="flex justify-center mb-4">
                          <button
                            onClick={() => navigate(`/product/${msg.product_id}`, { state: { from: location.pathname } })}
                            className="bg-white border border-zinc-200 rounded-xl p-2 flex items-center gap-3 shadow-sm max-w-sm hover:border-emerald-500 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                              <img src={msg.product_image || `https://picsum.photos/seed/${msg.product_id}/100/100`} alt={msg.product_name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Regarding Product</p>
                              <p className="text-sm font-bold text-zinc-900 truncate">{msg.product_name}</p>
                              <p className="text-xs text-zinc-500">Code: {msg.product_id}</p>
                            </div>
                          </button>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                          isMe 
                            ? 'bg-emerald-600 text-white rounded-br-sm' 
                            : 'bg-white border border-zinc-200 text-zinc-900 rounded-bl-sm shadow-sm'
                        }`}>
                          {msg.image_url && (
                            <img src={msg.image_url} alt="Attachment" className="max-w-full rounded-lg mb-2" />
                          )}
                          <p className="text-sm font-medium">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-zinc-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-zinc-100 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedImage) || isSending}
                    className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    <Send size={18} />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50/30">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100 mb-4">
                <MessageSquare className="w-10 h-10 text-zinc-300" />
              </div>
              <p className="text-lg font-bold text-zinc-900">Your Messages</p>
              <p className="text-sm mt-1">Select a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
