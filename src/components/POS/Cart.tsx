import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import DesgloseIGV from './DesgloseIGV';
import { motion, AnimatePresence } from 'framer-motion';

interface CartProps {
  onCheckout: (paymentMethod: string) => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { state, updateQuantity, removeItem, clearCart, setDiscount } = useCart();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [discountInput, setDiscountInput] = useState(state.discount > 0 ? state.discount.toString() : '');

  // Sincronizar input si cambia el descuento externo
  React.useEffect(() => {
    setDiscountInput(state.discount > 0 ? state.discount.toString() : '');
  }, [state.discount]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setDiscountInput(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setDiscount(num);
    } else {
      setDiscount(0);
    }
  };

  const paymentMethods = [
    { id: 'cash', name: 'Efectivo', icon: '💵' },
    { id: 'card', name: 'Tarjeta', icon: '💳' },
    { id: 'yape', name: 'Yape', icon: '📱' },
    { id: 'plin', name: 'Plin', icon: '📲' }
  ];

  const handlePayment = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethods(false);
    setTimeout(() => {
      onCheckout(method);
    }, 250); // Pequeña pausa para UX
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full max-w-lg mx-auto md:mx-0 md:max-w-full md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
          <ShoppingCart className="mr-2" size={24} />
          Carrito
        </h2>
        <span className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-medium px-2.5 py-1 rounded-full">
          {state.items.length} items
        </span>
      </div>

      {state.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">El carrito está vacío</p>
          <p className="text-sm text-gray-400">Agrega productos para comenzar</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-80 sm:max-h-96 overflow-y-auto">
            <AnimatePresence initial={false}>
              {state.items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.22 }}
                  layout
                  className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">S/. {(item.product.salePrice ?? 0).toFixed(2)} / {item.product.unit}</p>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-base sm:text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="font-semibold text-gray-900">
                      S/. {((item.product.salePrice ?? 0) * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <div className="space-y-3">
              {/* Campo de descuento global */}
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-green-700 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M7 7h.01M7 17h.01M17 7h.01M17 17h.01" /></svg>
                  Descuento
                </span>
                <div className="flex flex-col items-end">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className={`w-24 px-2 py-1 border rounded text-right focus:outline-none focus:ring focus:border-emerald-400 ${parseFloat(discountInput) > state.subtotal + state.tax ? 'border-red-400 bg-red-50 text-red-700' : ''}`}
                    placeholder="S/. 0.00"
                    value={discountInput}
                    onChange={handleDiscountChange}
                    onBlur={() => setDiscountInput(state.discount > 0 ? state.discount.toString() : '')}
                  />
                  <span className="text-xs text-gray-400 mt-0.5">Máx: S/. {(state.subtotal + state.tax).toFixed(2)}</span>
                  {parseFloat(discountInput) > state.subtotal + state.tax && (
                    <span className="text-xs text-red-500">El descuento no puede superar el total.</span>
                  )}
                </div>
              </div>
              {/* Cálculo de subtotales y IGV */}
              {(() => {
                function descomponerIGV(precioFinal: number) {
                  const base = precioFinal / 1.18;
                  const igv = precioFinal - base;
                  return { base, igv };
                }
                const subtotalExempt = state.items.filter(item => item.product.isExonerated || item.product.isExemptIGV || item.product.igvIncluded === false).reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0);
                const subtotalTaxed = state.items.filter(item => !item.product.isExonerated && item.product.igvIncluded !== false).reduce((sum, item) => {
                  const { base } = descomponerIGV(item.product.salePrice ?? 0);
                  return sum + (base * item.quantity);
                }, 0);
                const igvTotal = state.items.filter(item => !item.product.isExonerated && item.product.igvIncluded !== false).reduce((sum, item) => {
                  const { igv } = descomponerIGV(item.product.salePrice ?? 0);
                  return sum + (igv * item.quantity);
                }, 0);
                return (
                  <div className="grid grid-cols-1 gap-1 my-2">
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-blue-50">
                      <span className="flex items-center gap-1 text-blue-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg>Subtotal Gravado</span>
                      <span className="font-semibold text-blue-900">S/. {subtotalTaxed.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-teal-50">
                      <span className="flex items-center gap-1 text-teal-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-6a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>Subtotal Exonerado</span>
                      <span className="font-semibold text-teal-900">S/. {subtotalExempt.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-yellow-50">
                      <span className="flex items-center gap-1 text-yellow-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4h.01" /></svg>IGV (18%)</span>
                      <span className="font-semibold text-yellow-900">S/. {igvTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              {state.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Descuento</span>
                  <span className="font-medium text-green-600">- S/. {(state.discount ?? 0).toFixed(2)}</span>
                </div>
              )}
              <motion.div
                key={state.discount}
                initial={{ scale: 1, backgroundColor: '#fff' }}
                animate={state.discount > 0 ? { scale: 1.04, backgroundColor: '#d1fae5' } : { scale: 1, backgroundColor: '#fff' }}
                transition={{ duration: 0.4 }}
                className={`flex justify-between text-lg font-bold border-t pt-3 ${state.discount > 0 ? 'text-emerald-700' : ''}`}
              >
                <span>Total</span>
                <span>
                  S/. {(state.total ?? 0).toFixed(2)}
                  {state.discount > 0 && <span className="ml-2 text-xs text-green-600 font-medium">(con descuento)</span>}
                </span>
              </motion.div>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <button
                onClick={() => setShowPaymentMethods(true)}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center text-base sm:text-lg active:scale-95"
              >
                <CreditCard className="mr-2" size={20} />
                Procesar Pago
              </button>
              {selectedPaymentMethod && (
                <div className="flex items-center justify-center mt-2 gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <span className="text-2xl">
                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                  </span>
                  <span className="font-medium text-emerald-800">
                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </span>
                </div>
              )}
              <button
                onClick={clearCart}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-base sm:text-lg active:scale-95"
              >
                Limpiar Carrito
              </button>
            </div>
          </div>
        </>
      )}

      {showPaymentMethods && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-auto border border-gray-200 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Método de Pago</h3>
            {selectedPaymentMethod && (
              <div className="flex items-center gap-2 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-2 justify-center">
                <span className="text-2xl">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                </span>
                <span className="font-medium text-emerald-800">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePayment(method.id)}
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center active:scale-95"
                >
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <p className="font-medium">{method.name}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPaymentMethods(false)}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;