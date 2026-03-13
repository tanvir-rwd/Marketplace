export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
  seller_id: number;
}

export const getCart = (): CartItem[] => {
  const cart = localStorage.getItem('marketplace_cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product: any, quantity: number = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
  } else {
    const firstImage = product.image_url?.startsWith('[') 
      ? JSON.parse(product.image_url)[0] 
      : (product.image_url || `https://picsum.photos/seed/${product.id}/400/300`);

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: firstImage,
      quantity: Math.min(quantity, product.stock),
      stock: product.stock,
      seller_id: product.seller_id
    });
  }
  
  localStorage.setItem('marketplace_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart_updated'));
};

export const updateCartQuantity = (productId: number, quantity: number) => {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.min(Math.max(1, quantity), item.stock);
    localStorage.setItem('marketplace_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart_updated'));
  }
};

export const removeFromCart = (productId: number) => {
  const cart = getCart().filter(item => item.id !== productId);
  localStorage.setItem('marketplace_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart_updated'));
};

export const clearCart = () => {
  localStorage.removeItem('marketplace_cart');
  window.dispatchEvent(new Event('cart_updated'));
};
