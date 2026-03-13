import { Product } from "../types";

const WISHLIST_KEY = "marketplace_wishlist";

export const getWishlist = (): Product[] => {
  const wishlist = localStorage.getItem(WISHLIST_KEY);
  return wishlist ? JSON.parse(wishlist) : [];
};

export const addToWishlist = (product: Product): void => {
  const wishlist = getWishlist();
  if (!wishlist.find((p) => p.id === product.id)) {
    wishlist.push(product);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }
};

export const removeFromWishlist = (productId: number): void => {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.filter((p) => p.id !== productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
};

export const isInWishlist = (productId: number): boolean => {
  const wishlist = getWishlist();
  return !!wishlist.find((p) => p.id === productId);
};

export const toggleWishlist = (product: Product): boolean => {
  const wishlist = getWishlist();
  const index = wishlist.findIndex((p) => p.id === product.id);
  
  if (index === -1) {
    wishlist.push(product);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return true;
  } else {
    wishlist.splice(index, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return false;
  }
};
