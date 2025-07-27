'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { crearProducto, agregarIngresoProducto, obtenerProductosConStockYAverage, obtenerMovimientosProducto } from '../../lib/firestoreInventory';
import { obtenerProveedores } from '../../lib/firestoreSuppliers';
import { actualizarProducto, eliminarProducto } from '../../lib/firestoreProducts';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import { Product, InventoryMovement } from '../../types/inventory';
import { useToast } from '../../contexts/ToastContext';
import InventoryTable from './InventoryTable';
import InventoryHistoryModal from './InventoryHistoryModal';
import PasswordModal from './PasswordModal';
import NewIngresoModal from './NewIngresoModal';
import ProductForm from './ProductForm';
import InventoryFilters from './InventoryFilters';
import Pagination from './Pagination';

const Inventory: React.FC = () => {
  // Cargar productos al montar
  React.useEffect(() => {
    cargarProductos();
  }, []);
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.uid || '';

  // Estados y variables
  const [productToIngreso, setProductToIngreso] = useState<Product | null>(null);
  const [loadingIngreso, setLoadingIngreso] = useState(false);
  const [errorIngreso, setErrorIngreso] = useState<string | null>(null);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [adjustStock_newStock, setAdjustStock_newStock] = useState<number>(0);
  const [adjustStock_motivo, setAdjustStock_motivo] = useState('');
  const [adjustStock_adminPass, setAdjustStock_adminPass] = useState('');
  const [adjustStock_loading, setAdjustStock_loading] = useState(false);
  const [adjustStock_error, setAdjustStock_error] = useState<string | null>(null);
  const [adjustStock_success, setAdjustStock_success] = useState<string | null>(null);
  const [showNewIngresoModal, setShowNewIngresoModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPasswordEditModal, setShowPasswordEditModal] = useState(false);
  const [showPasswordDeleteModal, setShowPasswordDeleteModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [productos, setProductos] = useState<Product[]>([]);
  const [proveedores, setProveedores] = useState<string[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [tempFilters, setTempFilters] = useState({ name: '', code: '', supplier: '', category: 'all' });
  const [activeFilters, setActiveFilters] = useState({ name: '', code: '', supplier: '', category: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [barcodeInput, setBarcodeInput] = useState('');

  // Resetear estados al abrir el modal
  const openAdjustStockModal = (product: Product) => {
    setProductToAdjust(product);
    setAdjustStock_newStock(product.stock);
    setAdjustStock_motivo('');
    setAdjustStock_adminPass('');
    setAdjustStock_loading(false);
    setAdjustStock_error(null);
    setAdjustStock_success(null);
    setShowAdjustStockModal(true);
  };
  
  // Resetear y cerrar modal
  const handleCloseAdjustStockModal = () => {
    setShowAdjustStockModal(false);
    setProductToAdjust(null);
    setAdjustStock_newStock(0);
    setAdjustStock_motivo('');
    setAdjustStock_adminPass('');
    setAdjustStock_loading(false);
    setAdjustStock_error(null);
    setAdjustStock_success(null);
  };

  // Lógica del ajuste
  const handleAjusteStock = () => {
    if (!productToAdjust) return;
    
    // Validaciones
    if (adjustStock_motivo.trim() === '') {
      setAdjustStock_error('Debes ingresar un motivo para el ajuste.');
      return;
    }
    if (adjustStock_adminPass.trim() === '') {
      setAdjustStock_error('Debes ingresar la contraseña de administrador.');
      return;
    }
    
    setAdjustStock_loading(true);
    setAdjustStock_error(null);
    
    // Aquí iría la lógica para verificar la contraseña y realizar el ajuste
    // Por ahora simulamos un ajuste exitoso después de 1 segundo
    setTimeout(() => {
      // Simulación de éxito
      setAdjustStock_success('Stock ajustado correctamente.');
      setAdjustStock_loading(false);
      
      // Actualizar el producto en la lista
      const updatedProductos = productos.map(p => 
        p.id === productToAdjust.id 
          ? {...p, stock: adjustStock_newStock} 
          : p
      );
      setProductos(updatedProductos);
      
      // Cerrar el modal después de 1.5 segundos
      setTimeout(() => {
        handleCloseAdjustStockModal();
      }, 1500);
    }, 1000);
  };

  // Filtrar productos
  // Filtros reactivos: sincroniza activeFilters con tempFilters automáticamente
useEffect(() => {
  setActiveFilters({...tempFilters});
  setCurrentPage(1);
}, [tempFilters]);


  const handleBarcodeSearch = () => {
    if (!barcodeInput.trim()) {
      showToast('Ingresa un código de barras para buscar', 'error');
      return;
    }

    // Buscar el producto por código de barras
    const foundProduct = productos.find(p => p.barcode === barcodeInput.trim());
    
    if (foundProduct) {
      // Limpiar otros filtros y mostrar solo este producto
      setTempFilters({
        name: '',
        code: barcodeInput.trim(),
        supplier: '',
        category: 'all'
      });
      setActiveFilters({
        name: '',
        code: barcodeInput.trim(),
        supplier: '',
        category: 'all'
      });
      setCurrentPage(1);
      
      // Limpiar el input
      setBarcodeInput('');
      
      // Mostrar mensaje de éxito
      showToast(`Producto encontrado: ${foundProduct.name}`, 'success');
    } else {
      showToast('No se encontró ningún producto con ese código de barras', 'error');
    }
  };

  // Filtrar productos según los filtros activos
  const filteredProducts = productos.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(activeFilters.name.toLowerCase());
    const codeMatch = !activeFilters.code ||
      (product.code && product.code.toLowerCase().includes(activeFilters.code.toLowerCase())) ||
      (product.barcode && product.barcode.toLowerCase().includes(activeFilters.code.toLowerCase()));
    const supplierMatch = !activeFilters.supplier || 
                         product.supplier?.toLowerCase().includes(activeFilters.supplier.toLowerCase());
    const categoryMatch = activeFilters.category === 'all' || (product.category && product.category.toLowerCase() === activeFilters.category.toLowerCase());
    
    return nameMatch && codeMatch && supplierMatch && categoryMatch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const cargarProductos = async () => {
    if (!companyId) return;
    setCargandoProductos(true);
    try {
      // Cargar productos
      const productosData = await obtenerProductosConStockYAverage();
      setProductos(productosData);
      // Cargar proveedores desde Firestore
      try {
        const proveedoresData = await obtenerProveedores();
        if (proveedoresData && proveedoresData.length > 0) {
          const supplierNames = proveedoresData.map(p => p.name).filter(Boolean);
          setProveedores(Array.from(new Set(supplierNames)));
        } else {
          // Fallback: extraer de productos
          const uniqueSuppliers = Array.from(new Set(productosData.map(p => p.supplier).filter(Boolean)));
          setProveedores(uniqueSuppliers);
        }
      } catch (e) {
        // Fallback si falla la carga de proveedores
        const uniqueSuppliers = Array.from(new Set(productosData.map(p => p.supplier).filter(Boolean)));
        setProveedores(uniqueSuppliers);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setCargandoProductos(false);
    }
  };

  // Productos con stock bajo (menos de 10 unidades)
  const lowStockProducts = productos.filter(p => p.stock < 10);

  const handleSubmit = async (formData: any): Promise<boolean> => {
    // Validaciones básicas
    if (!formData.name || !formData.category) {
      setError('Por favor completa los campos obligatorios');
      return false;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editProduct) {
        // Actualizar producto existente
        await actualizarProducto(editProduct.id, {
          ...formData,
          updatedAt: new Date()
        });
        // Actualizar la lista de productos
        const updatedProductos = productos.map(p =>
          p.id === editProduct.id ? { ...p, ...formData } : p
        );
        setProductos(updatedProductos);
        setSuccess('Producto actualizado correctamente');
        showToast('Producto actualizado correctamente', 'success');
      } else {
        // Crear nuevo producto
        const newProductId = await crearProducto(
          {
            ...formData,
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId,
          },
          {
            quantity: typeof formData.stock === 'number' && !isNaN(formData.stock) ? formData.stock : 0,
            costPrice: typeof formData.costPrice === 'number' && !isNaN(formData.costPrice) ? formData.costPrice : 0,
          }
        );
        // Añadir el nuevo producto a la lista
        const newProduct = {
          ...formData,
          id: newProductId,
          stock: typeof formData.stock === 'number' && !isNaN(formData.stock) ? formData.stock : 0,
          averageCost: typeof formData.costPrice === 'number' && !isNaN(formData.costPrice) ? formData.costPrice : 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          companyId,
        };
        setProductos([...productos, newProduct]);
        setSuccess('Producto creado correctamente');
        showToast('Producto creado correctamente', 'success');
      }
      // Limpiar formulario y cerrar modal inmediatamente tras éxito
      setShowAddModal(false);
      setEditProduct(null);
      setForm({});
      return true;
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError('Error al guardar el producto');
      showToast('Error al guardar el producto', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      await eliminarProducto(productToDelete.id);
      
      // Eliminar de la lista local
      const updatedProductos = productos.filter(p => p.id !== productToDelete.id);
      setProductos(updatedProductos);
      
      setShowDeleteModal(false);
      setProductToDelete(null);
      showToast('Producto eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      showToast('Error al eliminar el producto', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>

      </div>

    {/* Filtros (modularizado) */}
    <InventoryFilters
      filters={tempFilters}
      barcodeInput={barcodeInput}
      onFiltersChange={newFilters => setTempFilters(newFilters)}
      onBarcodeInputChange={setBarcodeInput}
      onBarcodeSearch={handleBarcodeSearch}
      proveedores={proveedores}
    />

    {/* Tarjetas de resumen */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Total de Productos</h3>
        <p className="text-3xl font-bold text-blue-600">{productos.length}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Total de stock</h3>
        <p className="text-3xl font-bold text-emerald-600">{productos.reduce((sum, p) => sum + (typeof p.stock === 'number' ? p.stock : 0), 0)}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Valor de Inventario</h3>
        <p className="text-3xl font-bold text-green-600">
          S/ {productos.reduce((sum, p) => sum + (p.stock * (typeof p.averageCost === 'number' ? p.averageCost : (typeof p.costPrice === 'number' ? p.costPrice : 0))), 0).toFixed(2)}
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Productos con Stock Bajo</h3>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {lowStockProducts.length}
          </span>
        </div>
        {lowStockProducts.length > 0 ? (
          <div className="max-h-24 overflow-y-auto">
            {lowStockProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex justify-between items-center text-sm mb-1">
                <span className="truncate max-w-[180px]">{product.name}</span>
                <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {product.stock} unid.
                </span>
              </div>
            ))}
            {lowStockProducts.length > 3 && (
              <div className="text-xs text-gray-500 mt-1">
                Y {lowStockProducts.length - 3} productos más...
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-12 text-gray-500">
            <AlertTriangle size={16} className="mr-2" />
            <span>No hay productos con stock bajo</span>
          </div>
        )}
      </div>
    </div>

    {/* Botón Agregar producto */}
    <div className="flex justify-end mb-4">
      <button
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 transition-colors"
        onClick={() => {
          setShowAddModal(true);
          setEditProduct(null);
          setForm({
            name: '',
            description: '',
            barcode: '',
            sku: '',
            price: 0,
            costPrice: 0,
            category: '',
            supplier: '',
            minStock: 5,
            location: '',
            imageUrl: '',
            unitType: 'unidad',
            unit: 'unidad',
          });
          setError(null);
          setSuccess(null);
        }}
      >
        <Plus size={18} /> Agregar producto
      </button>
    </div>
    {/* Tabla de inventario */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <InventoryTable
        products={paginatedProducts}
        loading={cargandoProductos}
        onEdit={(product) => {
  setForm({
    name: product.name || '',
    code: product.code || '',
    barcode: product.barcode || '',

    salePrice: product.salePrice || 0,
    costPrice: product.costPrice || 0,
    category: product.category || 'otros',
    subcategory: product.subcategory || '',
    supplier: product.supplier || '',
    minStock: product.minStock || 5,

    imageUrl: product.imageUrl || '',
    unitType: product.unitType || 'unidad',
    unit: product.unit || 'unidad',
    isExemptIGV: product.isExemptIGV || false,
    isExonerated: product.isExonerated || false,
    // Otros campos personalizados si existen
  });
  setEditProduct(product);
  setError(null);
  setSuccess(null);
  setShowAddModal(true);
}}
        onDelete={(product) => {
          setProductToDelete(product);
          setShowDeleteModal(true);
        }}
        onAdjustStock={openAdjustStockModal}
        onShowHistory={(product) => {
          setHistoryProduct(product);
          setShowHistoryModal(true);
        }}
        onNewIngreso={(product) => {
          setProductToIngreso(product);
          setShowNewIngresoModal(true);
          setErrorIngreso(null);
        }}
      />
      
      {/* Paginación (modularizado) */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredProducts.length}
      />
    </div>

    {/* Modales */}
    {showHistoryModal && historyProduct !== null && (
      <InventoryHistoryModal
        product={historyProduct}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryProduct(null);
        }}
      />
    )}

    {showDeleteModal && productToDelete && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-600">Eliminar Producto</h2>
          <p className="mb-4">
            ¿Estás seguro que deseas eliminar el producto <span className="font-semibold">{productToDelete.name}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={() => {
                setShowDeleteModal(false);
                setProductToDelete(null);
              }}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    )}

    {showPasswordEditModal && (
      <PasswordModal
        actionLabel="Confirmar"
        onConfirm={() => {
          setShowPasswordEditModal(false);
          setShowAddModal(true);
        }}
        onCancel={() => setShowPasswordEditModal(false)}
      />
    )}

    {showPasswordDeleteModal && (
      <PasswordModal
        actionLabel="Confirmar"
        onConfirm={() => {
          setShowPasswordDeleteModal(false);
          handleDelete();
        }}
        onCancel={() => setShowPasswordDeleteModal(false)}
      />
    )}

    {showAdjustStockModal && productToAdjust !== null && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-3xl w-full shadow-lg overflow-y-auto" style={{ maxHeight: '90vh', minWidth: '700px' }}>
          <h2 className="text-xl font-bold mb-4 text-blue-700">Ajustar stock de producto</h2>
          <div className="mb-2"><span className="font-semibold">Producto:</span> {productToAdjust?.name}</div>
          <div className="mb-2"><span className="font-semibold">Stock actual:</span> {productToAdjust?.stock}</div>
          <div className="flex flex-col mb-2">
            <label className="text-xs font-semibold mb-1">Nuevo stock</label>
            <input
              type="number"
              className="border rounded px-3 py-1"
              min={0}
              value={adjustStock_newStock}
              onChange={e => setAdjustStock_newStock(Number(e.target.value))}
              disabled={adjustStock_loading}
            />
          </div>
          <div className="flex flex-col mb-2">
            <label className="text-xs font-semibold mb-1">Motivo del ajuste</label>
            <textarea
              className="border rounded px-3 py-1"
              rows={2}
              placeholder="Explica el motivo del ajuste de stock"
              value={adjustStock_motivo}
              onChange={e => setAdjustStock_motivo(e.target.value)}
              disabled={adjustStock_loading}
            />
          </div>
          <div className="flex flex-col mb-2">
            <label className="text-xs font-semibold mb-1">Contraseña de administrador</label>
            <input
              type="password"
              className="border rounded px-3 py-1"
              placeholder="Contraseña"
              value={adjustStock_adminPass}
              onChange={e => setAdjustStock_adminPass(e.target.value)}
              disabled={adjustStock_loading}
            />
          </div>
          {adjustStock_error && <div className="text-red-600 text-sm mb-2">{adjustStock_error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={() => handleCloseAdjustStockModal()}
              disabled={adjustStock_loading}
            >Cancelar</button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleAjusteStock}
              disabled={adjustStock_loading}
            >{adjustStock_loading ? 'Guardando...' : 'Confirmar ajuste'}</button>
          </div>
        </div>
      </div>
    )}
  
    {showNewIngresoModal && productToIngreso !== null && (
      <NewIngresoModal
        productName={productToIngreso?.name ?? ''}
        onConfirm={async (quantity, costPrice) => {
          if (!productToIngreso) return;
          setLoadingIngreso(true);
          setErrorIngreso(null);
          try {
            await agregarIngresoProducto(productToIngreso.id, { quantity, costPrice });
            setShowNewIngresoModal(false);
            setProductToIngreso(null);
            cargarProductos();
          } catch (e) {
            setErrorIngreso('No se pudo registrar el ingreso.');
            showToast('No se pudo registrar el ingreso.', 'error');
          } finally {
            setLoadingIngreso(false);
          }
        }}
        onCancel={() => setShowNewIngresoModal(false)}
        loading={loadingIngreso}
      />
    )}

    {showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg overflow-y-auto" style={{ maxHeight: '90vh', minWidth: '400px' }}>
      <ProductForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
        editProduct={editProduct}
        error={error}
        success={success}
        onCancel={() => {
          setShowAddModal(false);
          setEditProduct(null);
          setForm({});
        }}
        proveedores={proveedores}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default Inventory;
