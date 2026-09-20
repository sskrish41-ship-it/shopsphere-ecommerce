import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { formatINR } from '../utils/currency';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Fetch cart
  const fetchCart = async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await api.get('/cart');
        setItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem('shopsphere_guest_cart');
      setItems(local ? JSON.parse(local) : []);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Save guest cart
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('shopsphere_guest_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (product, variant = null, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart/items', {
          product_id: product.id,
          variant_id: variant ? variant.id : null,
          quantity
        });
        fetchCart();
        addToast(`Added "${product.name}" to cart`, 'success');
        return true;
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to add item to cart';
        addToast(msg, 'error');
        return false;
      }
    } else {
      // Local cart logic
      const available = variant ? variant.stock_quantity : product.stock_quantity;
      setItems(prev => {
        const existingIdx = prev.findIndex(i => i.product_id === product.id && i.variant_id === (variant?.id || null));
        if (existingIdx > -1) {
          const updated = [...prev];
          const newQty = updated[existingIdx].quantity + quantity;
          if (newQty > available) {
            addToast(`Only ${available} available in stock`, 'error');
            return prev;
          }
          updated[existingIdx].quantity = newQty;
          return updated;
        } else {
          if (quantity > available) {
            addToast(`Only ${available} available in stock`, 'error');
            return prev;
          }
          return [...prev, {
            id: Date.now(),
            product_id: product.id,
            variant_id: variant?.id || null,
            quantity,
            product,
            variant
          }];
        }
      });
      addToast(`Added "${product.name}" to cart`, 'success');
      return true;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      try {
        await api.put(`/cart/items/${itemId}`, { quantity });
        fetchCart();
      } catch (err) {
        addToast(err.response?.data?.error || 'Could not update quantity', 'error');
      }
    } else {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
      }
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/items/${itemId}`);
        fetchCart();
        addToast('Item removed from cart', 'info');
      } catch (err) {
        addToast('Failed to remove item', 'error');
      }
    } else {
      setItems(prev => prev.filter(item => item.id !== itemId));
      addToast('Item removed from cart', 'info');
    }
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    if (!isAuthenticated) {
      localStorage.removeItem('shopsphere_guest_cart');
    }
  };

  // Calculations
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = items.reduce((acc, item) => {
    const price = item.variant?.price_override || item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  const applyCoupon = async (code) => {
    if (!code) return;
    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotal
      });
      setAppliedCoupon(res.data.coupon);
      setDiscountAmount(res.data.discount_amount);
      addToast(`Coupon "${code}" applied! Saved ${formatINR(res.data.discount_amount)}`, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid coupon';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    addToast('Coupon removed', 'info');
  };

  const taxAmount = roundTwo(subtotal * 0.18);
  const shippingFee = subtotal >= 1999 || subtotal === 0 ? 0 : 149.0;
  const grandTotal = Math.max(0, roundTwo(subtotal - discountAmount + taxAmount + shippingFee));

  function roundTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  return (
    <CartContext.Provider value={{
      items,
      loading,
      itemCount,
      subtotal,
      taxAmount,
      shippingFee,
      discountAmount,
      appliedCoupon,
      grandTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
