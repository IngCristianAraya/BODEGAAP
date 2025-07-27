"use client";
import React, { createContext, useContext, useReducer } from 'react';
import { CartItem, Product } from '../types/index';

interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; peso?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_DISCOUNT'; payload: number };

interface CartContextType {
  state: CartState;
  addItem: (product: Product, peso?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const initialState: CartState = {
  items: [],
  total: 0,
  subtotal: 0,
  discount: 0,
  tax: 0
};

const TAX_RATE = 0.18; // 18% IGV

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, peso } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);
      let newItems;
      if (product.ventaPorPeso && product.unitType === 'kg' && typeof peso === 'number') {
        if (existingItem) {
          newItems = state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: parseFloat((item.quantity + peso).toFixed(3)) }
              : item
          );
        } else {
          newItems = [...state.items, { product, quantity: parseFloat(peso.toFixed(3)) }];
        }
      } else {
        if (existingItem) {
          newItems = state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...state.items, { product, quantity: 1 }];
        }
      }
      
      function descomponerIGV(precioFinal: number) {
        const base = precioFinal / 1.18;
        const igv = precioFinal - base;
        return { base, igv };
      }
      // Exonerados o precio sin IGV
      const subtotalExempt = newItems.filter(item => item.product.isExonerated || item.product.isExemptIGV || item.product.igvIncluded === false).reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0);
      // Gravados y precio incluye IGV
      const subtotalTaxed = newItems.filter(item => !item.product.isExonerated && !item.product.isExemptIGV && item.product.igvIncluded !== false).reduce((sum, item) => {
        const { base } = descomponerIGV(item.product.salePrice ?? 0);
        return sum + (base * item.quantity);
      }, 0);
      // IGV solo para gravados con igvIncluded
      const taxAmount = newItems.filter(item => !item.product.isExonerated && !item.product.isExemptIGV && item.product.igvIncluded !== false).reduce((sum, item) => {
        const { igv } = descomponerIGV(item.product.salePrice ?? 0);
        return sum + (igv * item.quantity);
      }, 0);
      // Total es SIEMPRE la suma de precios finales (no sumar IGV encima)
      const total = newItems.reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0) - state.discount;
      return {
        ...state,
        items: newItems,
        subtotal: subtotalExempt + subtotalTaxed,
        tax: taxAmount,
        total
      };

    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload);
      function descomponerIGV(precioFinal: number) {
        const base = precioFinal / 1.18;
        const igv = precioFinal - base;
        return { base, igv };
      }
      // Exonerados o precio sin IGV
      const subtotalExempt = newItems.filter(item => item.product.isExonerated || item.product.isExemptIGV || item.product.igvIncluded === false).reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0);
      // Gravados y precio incluye IGV
      const subtotalTaxed = newItems.filter(item => !item.product.isExonerated && !item.product.isExemptIGV && item.product.igvIncluded !== false).reduce((sum, item) => {
        const { base } = descomponerIGV(item.product.salePrice ?? 0);
        return sum + (base * item.quantity);
      }, 0);
      // IGV solo para gravados con igvIncluded
      const taxAmount = newItems.filter(item => !item.product.isExonerated && !item.product.isExemptIGV && item.product.igvIncluded !== false).reduce((sum, item) => {
        const { igv } = descomponerIGV(item.product.salePrice ?? 0);
        return sum + (igv * item.quantity);
      }, 0);
      // Total es SIEMPRE la suma de precios finales (no sumar IGV encima)
      const total = newItems.reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0) - state.discount;
      return {
        ...state,
        items: newItems,
        subtotal: subtotalExempt + subtotalTaxed,
        tax: taxAmount,
        total
      };

    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      function descomponerIGV(precioFinal: number) {
        const base = precioFinal / 1.18;
        const igv = precioFinal - base;
        return { base, igv };
      }
      // Exonerados o precio sin IGV
      const subtotalExempt = newItems.filter(item => item.product.isExonerated || item.product.isExemptIGV || item.product.igvIncluded === false).reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0);
      // Gravados y precio incluye IGV
      const subtotalTaxed = newItems.filter(item => !item.product.isExonerated && !item.product.isExemptIGV && item.product.igvIncluded !== false).reduce((sum, item) => {
        const { base } = descomponerIGV(item.product.salePrice ?? 0);
        return sum + (base * item.quantity);
      }, 0);
      // IGV solo para gravados con igvIncluded
      const taxAmount = newItems.filter(item => !item.product.isExonerated && !item.product.isExemptIGV && item.product.igvIncluded !== false).reduce((sum, item) => {
        const { igv } = descomponerIGV(item.product.salePrice ?? 0);
        return sum + (igv * item.quantity);
      }, 0);
      // Total es SIEMPRE la suma de precios finales (no sumar IGV encima)
      const total = newItems.reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0) - state.discount;
      return {
        ...state,
        items: newItems,
        subtotal: subtotalExempt + subtotalTaxed,
        tax: taxAmount,
        total
      };

    }
    
    case 'SET_DISCOUNT': {
      const total = state.subtotal + state.tax - action.payload;
      return {
        ...state,
        discount: action.payload,
        total
      };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product: Product, peso?: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, peso } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setDiscount = (discount: number) => {
    dispatch({ type: 'SET_DISCOUNT', payload: discount });
  };

  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setDiscount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};