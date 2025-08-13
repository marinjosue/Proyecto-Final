import { useState, useContext, createContext, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (conciertoId, cantidad = 1) => {
    try {
      await cartService.addToCart(conciertoId, cantidad);
      await loadCart(); // Recargar carrito después de agregar
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Error al agregar al carrito' };
    }
  };

  const updateQuantity = async (itemId, cantidad) => {
    try {
      await cartService.updateCartItem(itemId, cantidad);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, cantidad } : item
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'Error al actualizar cantidad' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Error al eliminar del carrito' };
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Error al limpiar carrito' };
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const precio = item.concierto?.precio || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
