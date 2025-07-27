'use client';
import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, Package } from "lucide-react";
import ProductSearch from "@/components/POS/ProductSearch";
import ProductGrid from "@/components/POS/ProductGrid";
import Cart from "@/components/POS/Cart";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import CategoryBadge from "@/components/common/CategoryBadge";

import { crearVenta, descontarStockProductos } from "@/lib/firestoreSales";
import SuccessToast from "@/components/common/SuccessToast";
import TicketVenta from "./TicketVenta";
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Product } from '../../types/inventory';
import { categoryData, CategoryKey } from '@/lib/constants/categoryData';

const POS: React.FC = () => {
  const [showTicket, setShowTicket] = useState(false);
  const [ventaTicket, setVentaTicket] = useState<any>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: ventaTicket?.receiptNumber ? `Boleta_${ventaTicket.receiptNumber}` : 'Boleta',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { products, loading } = useProducts();

  const { state, addItem, clearCart } = useCart();
  const { user } = useAuth();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Resetear subcategoría al cambiar categoría
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  
  
  
  
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Calcular productos de la página actual
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);
  
  
  
  
  
  

  // Extraer categorías y subcategorías desde categoryData
  const categoryList = (Object.keys(categoryData).filter(cat => cat !== 'all') as CategoryKey[]);

  useEffect(() => {
    // Siempre usar productos reales de Firestore
    let filtered = products;
    
    if (selectedCategory) {
      filtered = filtered.filter((product: Product) => product.category === selectedCategory);
    }
    if (selectedSubcategory) {
      filtered = filtered.filter((product: Product) =>
        (product.subcategory || '').trim().toLowerCase() === selectedSubcategory.trim().toLowerCase()
      );
    }
    if (searchQuery) {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.code?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedSubcategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleBarcodeSearch = (barcode: string) => {
    // Buscar producto por código de barras
    const product = products.find((p: Product) => p.barcode === barcode);
    if (product) {
      addItem(product);
    }
  };

  const handleAddToCart = (product: Product, peso?: number) => {
    if (peso && product.ventaPorPeso && product.unitType === 'kg') {
      addItem({ ...product }, peso);
    } else {
      addItem(product);
    }
  };

  

  const handleCheckout = async (paymentMethod: string) => {
  // VALIDACIONES ROBUSTAS
  if (!state.items || state.items.length === 0) {
    setSuccessMsg('No hay productos en el carrito.');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    return;
  }
  if (!paymentMethod) {
    setSuccessMsg('Selecciona un método de pago.');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    return;
  }
  // Validar stock suficiente para cada producto (incluyendo ventas por peso)
  const productosSinStock = state.items.filter(item => {
    // Venta por peso: permitir decimales
    if (item.product.ventaPorPeso && item.product.unitType === 'kg') {
      return item.quantity > item.product.stock;
    }
    // Venta por unidad: solo enteros
    return item.quantity > item.product.stock;
  });
  if (productosSinStock.length > 0) {
    const nombres = productosSinStock.map(i => i.product.name).join(', ');
    setSuccessMsg(`Stock insuficiente para: ${nombres}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    return;
  }
    try {
      // Obtener items del carrito y datos de usuario/empresa
      const cartItems = state.items;
      // Crear la venta en Firestore
      // Obtener último número de boleta de ventas existentes (simple: contar ventas + 1)
      let receiptNumber = '';
      try {
        const ventasSnapshot = await import("../../lib/firestoreSales").then(m => m.obtenerVentas());
        receiptNumber = (ventasSnapshot.length + 1).toString().padStart(6, '0');
      } catch {
        receiptNumber = (Math.floor(Math.random() * 900000) + 100000).toString();
      }
      // Asegurar que cada producto vendido tenga los campos isExonerated e igvIncluded
    const productosVenta = cartItems.map(item => ({
      ...item.product,
      isExonerated: item.product.isExonerated ?? false,
      igvIncluded: item.product.igvIncluded ?? true,
      quantity: item.quantity,
      salePrice: item.product.salePrice,
    }));

    const venta = {
      products: cartItems.map((item: { product: Product; quantity: number }) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.salePrice ?? 0,
        salePrice: item.product.salePrice ?? 0
      })),
      items: cartItems.map((item: { product: Product; quantity: number }) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.salePrice ?? 0,
        total: (item.product.salePrice ?? 0) * item.quantity
      })),

      total: state.total,
      subtotal: state.subtotal ?? 0,
      discount: state.discount ?? 0,
      tax: state.tax ?? 0,
      paymentMethod,
      customerId: '', // Por ahora vacío
      customerName: '', // Futuro: seleccionar cliente
      createdAt: new Date(),
      cashierId: user?.uid || '',
      cashierName: user?.displayName || user?.email || '',
      receiptNumber,
    };
    // Generar un id único para la venta (por ejemplo, usando receiptNumber)
    venta.id = receiptNumber;
    await crearVenta(venta);
    // Descontar stock usando los items de la venta
    await descontarStockProductos(venta.items);
      setSuccessMsg(`¡Venta procesada exitosamente con ${paymentMethod === 'cash' ? 'efectivo' : paymentMethod === 'card' ? 'tarjeta' : paymentMethod === 'yape' ? 'Yape' : paymentMethod === 'plin' ? 'Plin' : paymentMethod}!`);
      setShowSuccess(true);
      setVentaTicket({
        receiptNumber: venta.receiptNumber,
        cashierName: venta.cashierName,
        customerName: venta.customerName,
        paymentMethod: venta.paymentMethod,
        date: new Date().toLocaleString('es-PE'),
        items: venta.items,
        subtotal: venta.subtotal,
        discount: venta.discount,
        igv: venta.tax,
        total: venta.total,
      });
      setShowTicket(true);
      setTimeout(() => setShowSuccess(false), 3000);
      clearCart();
    } catch (error: any) {
      console.error('Error al procesar la venta:', error);
      let msg = 'Error al procesar la venta';
      if (error?.message) msg += `: ${error.message}`;
      if (error?.code) msg += ` (code: ${error.code})`;
      setSuccessMsg(msg);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>
        <ProductSearch onSearch={handleSearch} onBarcodeSearch={handleBarcodeSearch} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Products Section */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Filtro dinámico de Categorías/Subcategorías */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 py-2">
            {selectedCategory === null ? (
              <>
                {/* Botón Ver Todo como primer botón, igual tamaño que los de categoría */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                  }}
                  className={`flex flex-col items-center justify-center px-2 py-2 rounded-xl font-semibold transition-colors text-base border-2 ${selectedCategory === null ? 'border-emerald-500 ring-2 ring-emerald-400 shadow-lg bg-emerald-50 text-emerald-900' : 'border-gray-200 bg-white text-gray-800 hover:border-emerald-300'} duration-100`}
                  style={{ minWidth: 70, minHeight: 60 }}
                >
                  <CategoryBadge category="all" size={32} />
                </button>
                {categoryList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubcategory(null);
                    }}
                    className={`flex flex-col items-center justify-center px-2 py-2 rounded-xl font-semibold transition-colors text-base border-2 ${selectedCategory === cat ? 'border-emerald-500 ring-2 ring-emerald-400 shadow-lg bg-emerald-50 text-emerald-900' : 'border-gray-200 bg-white text-gray-800 hover:border-emerald-300'} duration-100`}
                    style={{ minWidth: 70, minHeight: 60 }}
                  >
                    <CategoryBadge category={cat} size={32} />
                  </button>
                ))}
              </>
            ) : (
              <>
                {/* Botón Volver como primer botón */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                  }}
                  className="flex flex-row items-center justify-center gap-1 px-2 py-2 rounded-xl border-2 h-8 min-h-8 w-full text-xs font-medium border-red-300 bg-red-50 text-red-700 hover:border-red-400 duration-100"
                  style={{ minWidth: 70, minHeight: 60 }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1.2 }} role="img" aria-label="volver">←</span>
                  <span>Volver</span>
                </button>
                {(categoryData[selectedCategory as CategoryKey]?.subcategories || []).map((subcat) => {
  // Iconos representativos por subcategoría
  const iconMap: Record<string, string> = {
    // Abarrotes
    'menestras': '🫘',
    'pastas': '🍝',
    'arroz': '🍚',
    'salsas': '🥫',
    'aceites': '🛢️',
    'condimentos': '🧂',
    'conservas': '🥫',
    'otro': '📦',
    // Huevos y Lácteos
    'huevos': '🥚',
    'leche': '🥛',
    'yogur': '🥣',
    'queso': '🧀',
    'mantequilla': '🧈',
    'otros': '📦',
    // Carnes y Embutidos
    'pollo': '🍗',
    'res': '🥩',
    'salchichas': '🌭',
    'jamón': '🍖',
    // Frutas y Verduras
    'frutas': '🍎',
    'verduras': '🥦',
    'tubérculos': '🥔',
    // Bebidas
    'gaseosas': '🥤',
    'jugos': '🧃',
    'aguas': '💧',
    'energéticas': '⚡',
    // Snacks y Golosinas
    'chocolates': '🍫',
    'papas': '🍟',
    'galletas': '🍪',
    'caramelos': '🍬',
    // Helados
    'cremoladas': '🍧',
    'paletas': '🍡',
    'conos': '🍦',
    // Limpieza del Hogar
    'lavavajillas': '🧽',
    'detergentes': '🧴',
    'multiusos': '🧹',
    // Higiene Personal
    'jabones': '🧼',
    'shampoo': '🧴',
    'desodorantes': '🧴',
    'papel higiénico': '🧻',
    // Mascotas
    'alimento perro': '🐶',
    'alimento gato': '🐱',
    'accesorios': '🎾',
    // Descartables
    'vasos': '🥤',
    'platos': '🍽️',
    'cubiertos': '🍴',
    'bolsas': '🛍️',
    // Panadería
    'pan': '🥖',
    'pan especial': '🥯',
    // Repostería, Congelados, etc. puedes agregar más aquí
  };
  const normalized = subcat.trim().toLowerCase();
  const emoji = iconMap[normalized] || '🍽️';
  const icon = <span style={{ fontSize: 32, lineHeight: 1.2 }} role="img" aria-label={normalized}>{emoji}</span>;
  return (
    <button
      key={subcat}
      onClick={() => setSelectedSubcategory(subcat)}
      className={`flex flex-row items-center justify-center gap-1 px-2 py-2 rounded-xl transition-colors border-2 h-8 min-h-8 w-full text-xs font-medium ${
        selectedSubcategory === subcat ? 'border-emerald-500 ring-2 ring-emerald-400 shadow-lg bg-emerald-50 text-emerald-900' : 'border-gray-200 bg-white text-gray-800 hover:border-emerald-300'} duration-100`}
      style={{ minWidth: 70, minHeight: 60 }}
    >
      <span style={{ fontSize: 18, lineHeight: 1.2 }} role="img" aria-label={normalized}>{emoji}</span>
      <span className="text-xs">{subcat}</span>
    </button>
  );
})}
              </>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              <ProductGrid products={paginatedProducts} onAddToCart={handleAddToCart} />
              {/* Paginación */}
              <div className="mt-4 flex justify-center space-x-2">
                {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      currentPage === index + 1
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cart Section */}
        <div className="xl:col-span-1">
          <Cart onCheckout={handleCheckout} />
        </div>
      </div>
      {showSuccess && (
        <SuccessToast message={successMsg} onClose={() => setShowSuccess(false)} />
      )}
      {/* Modal de ticket/boleta tras venta exitosa */}
      {showTicket && ventaTicket && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-auto border border-gray-200 shadow-2xl flex flex-col items-center">
      <TicketVenta ref={ticketRef} venta={ventaTicket} />
      <div className="flex justify-center gap-4 mt-8 w-full">
        <button
          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 font-semibold transition-all duration-150"
          title="Imprimir ticket (Ctrl+P)"
          onClick={async () => {
            try {
              await handlePrint?.();
            } catch (e) {
              alert('No se pudo abrir el diálogo de impresión. Verifica permisos del navegador o prueba otro navegador.');
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7m-6 13v-4m0 4H6a2 2 0 01-2-2v-5a2 2 0 012-2h12a2 2 0 012 2v5a2 2 0 01-2 2h-6z" /></svg>
          Imprimir ticket
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 font-semibold transition-all duration-150 border border-gray-300"
          title="Cerrar ticket"
          onClick={() => setShowTicket(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
export default POS;