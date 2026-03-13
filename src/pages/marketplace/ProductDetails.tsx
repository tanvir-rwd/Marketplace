import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, ChevronRight, Package, Eye, Send, Image, X, MessageCircle, Share2, MessageSquare } from "lucide-react";
import { motion, useSpring, useMotionValue, useMotionTemplate } from "motion/react";
import toast from "react-hot-toast";
import { addToCart } from "../../utils/cart";
import { fetchApi } from "../../utils/api";
import { isInWishlist, toggleWishlist } from "../../utils/wishlist";
import { Review } from "../../types";
import ChatModal from "../../components/marketplace/ChatModal";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newReviewImage, setNewReviewImage] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Motion values for smooth zoom following
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  // Smooth spring physics for the zoom position
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const transformOrigin = useMotionTemplate`${smoothX}% ${smoothY}%`;

  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
    fetchProductDetails();
    fetchReviews();
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const res = await fetchApi(`/api/products/${id}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetchApi(`/api/products/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch product
      const res = await fetchApi(`/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);
      setInWishlist(isInWishlist(data.id));
      
      const images = data.image_url?.startsWith('[') ? JSON.parse(data.image_url) : [data.image_url];
      setActiveImage(images[0] || `https://picsum.photos/seed/${data.id}/800/800`);

      // Fetch seller
      if (data.seller_id) {
        const sellerRes = await fetchApi(`/api/users/${data.seller_id}`);
        if (sellerRes.ok) {
          const sellerData = await sellerRes.json();
          setSeller(sellerData);
        }
      }

      // Fetch related products
      const allProductsRes = await fetchApi("/api/products");
      if (allProductsRes.ok) {
        const allProducts = await allProductsRes.json();
        const related = allProducts
          .filter((p: any) => p.category === data.category && p.id !== data.id && p.status === 'approved')
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      toast.error("Product not found");
      navigate("/shop");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc' && quantity < product.stock) {
      setQuantity(q => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    const added = toggleWishlist(product);
    setInWishlist(added);
    if (added) {
      toast.success("Added to wishlist!");
    } else {
      toast.success("Removed from wishlist");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review");
      navigate("/login");
      return;
    }

    if (!newComment && !newReviewImage) {
      toast.error("Please provide either a comment or an image");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetchApi(`/api/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
          image_url: newReviewImage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReviews([data, ...reviews]);
        setNewComment("");
        setNewRating(5);
        setNewReviewImage(null);
        toast.success("Review submitted successfully!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to ask a question");
      return;
    }
    if (!newQuestion.trim()) return;

    setIsSubmittingQuestion(true);
    try {
      const res = await fetchApi(`/api/products/${id}/questions`, {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          seller_id: product.seller_id,
          question: newQuestion
        })
      });

      if (res.ok) {
        toast.success("Question submitted successfully!");
        setNewQuestion("");
        fetchQuestions();
      } else {
        toast.error("Failed to submit question");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleReplyQuestion = async (questionId: number) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetchApi(`/api/questions/${questionId}/answer`, {
        method: "PUT",
        body: JSON.stringify({ answer: replyText })
      });

      if (res.ok) {
        toast.success("Reply submitted successfully!");
        setReplyText("");
        setReplyingTo(null);
        fetchQuestions();
      } else {
        toast.error("Failed to submit reply");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const galleryImages = product.image_url?.startsWith('[') 
    ? JSON.parse(product.image_url) 
    : [product.image_url || `https://picsum.photos/seed/${product.id}/800/800`];

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="bg-zinc-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-emerald-600 transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-emerald-600 transition-colors">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-zinc-900 font-medium truncate">{product.name}</span>
          {location.state?.from && (
            <>
              <ChevronRight size={14} />
              <button 
                onClick={() => navigate(location.state.from)}
                className="text-emerald-600 font-medium hover:underline"
              >
                Back to Messages
              </button>
            </>
          )}
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Product Gallery */}
            <div className="p-8 lg:border-r border-zinc-200 bg-zinc-50/50">
              <div 
                className="aspect-square rounded-2xl overflow-hidden bg-white border border-zinc-200 mb-4 relative group cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <motion.img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover will-change-transform"
                  animate={{
                    scale: isZooming ? 2.5 : 1,
                  }}
                  style={{
                    transformOrigin: transformOrigin,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                    mass: 0.5
                  }}
                  referrerPolicy="no-referrer"
                />
                {/* Visual indicator for zoom area */}
                {!isZooming && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-zinc-900 font-bold text-sm">
                      <Eye size={16} /> Hover to Zoom
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-emerald-500 shadow-md' : 'border-transparent hover:border-emerald-200'}`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-6">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h1 className="text-3xl font-extrabold text-zinc-900">{product.name}</h1>
                  <button 
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-full transition-all shrink-0 ${inWishlist ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm mb-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={18} 
                        fill={star <= Math.round(parseFloat(averageRating)) ? "currentColor" : "none"} 
                        className={star <= Math.round(parseFloat(averageRating)) ? "" : "text-zinc-300"} 
                      />
                    ))}
                    <span className="text-zinc-700 font-medium ml-1">{averageRating} ({reviews.length} Reviews)</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                  <span className="text-emerald-600 font-medium">{product.category}</span>
                </div>

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-4xl font-extrabold text-zinc-900">${product.price.toFixed(2)}</span>
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full">
                      {product.stock <= 10 ? `Only ${product.stock} left in stock` : 'In Stock'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <p className="text-zinc-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-zinc-300 rounded-xl bg-white">
                    <button 
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1}
                      className="px-4 py-3 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-zinc-900">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange('inc')}
                      disabled={quantity >= product.stock}
                      className="px-4 py-3 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 px-6 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                </div>
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Secure Payment</p>
                    <p className="text-xs text-zinc-500">100% secure checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Fast Delivery</p>
                    <p className="text-xs text-zinc-500">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Free Returns</p>
                    <p className="text-xs text-zinc-500">Within 30 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Specifications & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Product Specifications</h2>
              <div className="space-y-4">
                <div className="flex py-3 border-b border-zinc-100">
                  <span className="w-1/3 text-zinc-500 font-medium">Category</span>
                  <span className="w-2/3 text-zinc-900 font-medium">{product.category}</span>
                </div>
                <div className="flex py-3 border-b border-zinc-100">
                  <span className="w-1/3 text-zinc-500 font-medium">Availability</span>
                  <span className="w-2/3 text-zinc-900 font-medium">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="flex py-3 border-b border-zinc-100">
                  <span className="w-1/3 text-zinc-500 font-medium">Product ID</span>
                  <span className="w-2/3 text-zinc-900 font-medium">#{product.id.toString().padStart(6, '0')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-40 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Customer Reviews</h2>
                    <p className="text-sm text-zinc-500 mt-1">What our community thinks about this product</p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <Star size={24} fill="currentColor" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="bg-zinc-50/50 rounded-3xl p-8 border border-zinc-100 text-center flex flex-col items-center justify-center">
                    <div className="text-6xl font-black text-zinc-900 mb-2 tracking-tighter">{averageRating}</div>
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          fill={star <= Math.round(parseFloat(averageRating)) ? "currentColor" : "none"} 
                          className={star <= Math.round(parseFloat(averageRating)) ? "" : "text-zinc-300"} 
                        />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Based on {reviews.length} reviews</p>
                  </div>

                  <div className="md:col-span-2 space-y-3 flex flex-col justify-center">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(r => r.rating === rating).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-4 group">
                          <span className="w-12 text-xs font-bold text-zinc-600 uppercase tracking-wider">{rating} Star</span>
                          <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-10 text-right text-xs font-black text-zinc-900">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Review Form */}
                {user ? (
                  <div className="mb-12 bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-6 tracking-tight flex items-center gap-2">
                      <Send size={20} className="text-emerald-500" />
                      Write a Professional Review
                    </h3>
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Your Rating</label>
                        <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="text-amber-500 hover:scale-125 transition-transform p-1"
                            >
                              <Star size={32} fill={star <= newRating ? "currentColor" : "none"} strokeWidth={1.5} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Your Experience (Optional)</label>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share detailed feedback about the product quality, delivery, and overall satisfaction..."
                          className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none h-40 text-zinc-700 font-medium"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Add Product Image (Optional)</label>
                        <div className="flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Image className="w-8 h-8 text-zinc-400 mb-2" />
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Upload</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                          
                          {newReviewImage && (
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-zinc-200">
                              <img src={newReviewImage} alt="Review preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => setNewReviewImage(null)}
                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-zinc-200 hover:shadow-emerald-200 active:scale-95"
                        >
                          {isSubmittingReview ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Send size={18} />
                              Publish Review
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="mb-12 p-8 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/30 text-center">
                    <p className="text-zinc-600 font-medium mb-4">You must be logged in to leave a review.</p>
                    <Link 
                      to="/login" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95"
                    >
                      Login to Review
                    </Link>
                  </div>
                )}
                
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Recent Feedback</h3>
                  {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-6 bg-zinc-50/30 rounded-[2rem] border border-zinc-100 hover:border-emerald-200 hover:bg-white transition-all duration-300 group">
                          <div className="flex flex-col md:flex-row md:items-start gap-6">
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all duration-500">
                                {review.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="font-bold text-zinc-900 text-lg tracking-tight">{review.username}</p>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg border border-emerald-100 flex items-center gap-1.5">
                                      <ShieldCheck size={12} /> Verified
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        size={14} 
                                        fill={star <= review.rating ? "currentColor" : "none"} 
                                        className={star <= review.rating ? "" : "text-zinc-200"}
                                        strokeWidth={1.5}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-xs font-bold text-zinc-400 bg-white px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm">
                                  {new Date(review.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-zinc-600 text-base leading-relaxed font-medium bg-white/50 p-4 rounded-2xl border border-zinc-50 group-hover:bg-white group-hover:border-zinc-100 transition-colors mb-4">
                                  {review.comment}
                                </p>
                              )}
                              {review.image_url && (
                                <div className="w-48 h-48 rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                                  <img 
                                    src={review.image_url} 
                                    alt="Review" 
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-zinc-300">
                        <Star size={32} />
                      </div>
                      <p className="text-zinc-900 font-bold text-lg">No reviews yet</p>
                      <p className="text-sm text-zinc-500 mt-1">Be the first to share your thoughts on this product.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Q&A Section */}
              <div className="mt-16 pt-16 border-t border-zinc-100">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Product Q&A</h2>
                    <p className="text-zinc-500 font-medium mt-1">Ask the seller directly about this product</p>
                  </div>
                </div>

                {user ? (
                  <div className="mb-12 p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <form onSubmit={handleAskQuestion} className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Your Question</label>
                        <textarea
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="What would you like to know about this product?"
                          className="w-full px-6 py-5 border-2 border-zinc-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none font-medium text-zinc-900 placeholder:text-zinc-400"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingQuestion}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-zinc-200 hover:shadow-emerald-200 active:scale-95"
                        >
                          {isSubmittingQuestion ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Send size={18} />
                              Ask Seller
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="mb-12 p-8 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/30 text-center">
                    <p className="text-zinc-600 font-medium mb-4">You must be logged in to ask a question.</p>
                    <Link 
                      to="/login" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95"
                    >
                      Login to Ask
                    </Link>
                  </div>
                )}

                <div className="space-y-6">
                  {questions.length > 0 ? (
                    questions.map((q) => (
                      <div key={q.id} className="p-6 bg-zinc-50/30 rounded-[2rem] border border-zinc-100 transition-all duration-300">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-200 overflow-hidden flex-shrink-0">
                            {q.user_image ? (
                              <img src={q.user_image} alt={q.user_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold">
                                {q.user_name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-zinc-900">{q.user_name}</h4>
                              <span className="text-xs text-zinc-400">{new Date(q.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-zinc-700 font-medium mb-4">{q.question}</p>

                            {q.answer ? (
                              <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl ml-4 relative">
                                <div className="absolute -left-3 top-6 w-3 h-px bg-emerald-200"></div>
                                <div className="absolute -left-3 top-2 bottom-6 w-px bg-emerald-200"></div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                                    {q.seller_name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-bold text-emerald-800 text-sm">{q.seller_name} (Seller)</span>
                                  <span className="text-[10px] text-emerald-600/60 ml-auto">{new Date(q.answered_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-emerald-900/80 text-sm font-medium">{q.answer}</p>
                              </div>
                            ) : (
                              user && (user.id === product.seller_id || user.role === 'admin' || user.role === 'super_admin') && (
                                <div className="mt-4 ml-4">
                                  {replyingTo === q.id ? (
                                    <div className="space-y-3">
                                      <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your answer..."
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm resize-none"
                                        rows={2}
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button 
                                          onClick={() => setReplyingTo(null)}
                                          className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700"
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          onClick={() => handleReplyQuestion(q.id)}
                                          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                                        >
                                          Submit Answer
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => { setReplyingTo(q.id); setReplyText(""); }}
                                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                      <MessageCircle size={14} /> Reply to question
                                    </button>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-zinc-50/30 rounded-[2rem] border border-dashed border-zinc-200">
                      <MessageCircle className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                      <p className="text-zinc-500 font-medium">No questions yet. Be the first to ask!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 sticky top-24">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">About the Seller</h2>
              {seller ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                      {seller.profile_image ? (
                        <img src={seller.profile_image} alt={seller.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400">
                          {seller.full_name?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">{seller.full_name || seller.username}</h3>
                      <div className="flex items-center gap-1 text-amber-500 text-sm">
                        <Star size={14} fill="currentColor" />
                        <span className="font-medium text-zinc-700">4.8</span>
                        <span className="text-zinc-500">(340 ratings)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-zinc-50 rounded-2xl text-center">
                      <p className="text-2xl font-extrabold text-zinc-900 mb-1">150+</p>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Products</p>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl text-center">
                      <p className="text-2xl font-extrabold text-zinc-900 mb-1">1.2k</p>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sales</p>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/seller/${seller.id}`}
                    className="block w-full py-3 text-center border-2 border-zinc-200 text-zinc-700 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors mb-3"
                  >
                    Visit Seller Store
                  </Link>
                  {(!user || (user && seller && user.id !== seller.id)) && (
                    <button 
                      onClick={() => {
                        if (!user) {
                          toast.error("Please login to message the seller");
                          navigate("/login");
                          return;
                        }
                        setChatModalOpen(true);
                      }}
                      className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      Chat with Seller
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <Package className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                  <p className="text-zinc-500">Seller information not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-200 hover:shadow-md transition-shadow group flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-zinc-100 shrink-0">
                    <img 
                      src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <Link to={`/product/${product.id}`} className="block mb-2">
                      <h3 className="font-bold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                      <span className="text-lg font-extrabold text-zinc-900">${product.price.toFixed(2)}</span>
                      <Link 
                        to={`/product/${product.id}`}
                        className="p-2 bg-zinc-100 text-zinc-700 rounded-full hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Chat Button */}
      {(!user || (user && seller && user.id !== seller.id)) && (
        <button
          onClick={() => {
            if (!user) {
              toast.error("Please login to message the seller");
              navigate("/login");
              return;
            }
            setChatModalOpen(true);
          }}
          className="fixed bottom-6 right-6 p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-105 transition-all z-40 flex items-center justify-center group"
          title="Message Seller"
        >
          <MessageSquare size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap group-hover:ml-2 font-medium">
            Message Seller
          </span>
        </button>
      )}

      {/* Chat Modal */}
      {product && (
        <ChatModal 
          isOpen={chatModalOpen} 
          onClose={() => setChatModalOpen(false)} 
          product={product} 
          user={user} 
        />
      )}
    </div>
  );
}
