import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await api.get('/wishlist');
        setWishlist(res.data.items || []);
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem('shopsphere_guest_wishlist');
      setWishlist(local ? JSON.parse(local) : []);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('shopsphere_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const toggleWishlist = async (product) => {
    const isSaved = wishlist.some(i => i.product_id === product.id || i.product?.id === product.id);

    if (isAuthenticated) {
      try {
        const res = await api.post('/wishlist/toggle', { product_id: product.id });
        addToast(res.data.message, res.data.in_wishlist ? 'success' : 'info');
        fetchWishlist();
      } catch (err) {
        addToast('Failed to update wishlist', 'error');
      }
    } else {
      if (isSaved) {
        setWishlist(prev => prev.filter(i => (i.product_id || i.product?.id) !== product.id));
        addToast(`Removed "${product.name}" from wishlist`, 'info');
      } else {
        setWishlist(prev => [...prev, { id: Date.now(), product_id: product.id, product }]);
        addToast(`Saved "${product.name}" to wishlist`, 'success');
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(i => (i.product_id === productId) || (i.product?.id === productId));
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      loading,
      toggleWishlist,
      isInWishlist,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
