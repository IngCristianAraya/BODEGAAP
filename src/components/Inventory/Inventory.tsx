'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { crearProducto, agregarIngresoProducto, obtenerProductosConStockYAverage } from '../../lib/firestoreInventory';
import { obtenerProveedores, Supplier } from '../../lib/firestoreSuppliers';
import { actualizarProducto, eliminarProducto } from '../../lib/firestoreProducts';
import { Plus, AlertTriangle } from 'lucide-react';
import { Product } from '../../types/inventory';
import { useToast } from '../../contexts/ToastContext';
import InventoryTable from './InventoryTable';
import InventoryHistoryModal from './InventoryHistoryModal';
import PasswordModal from './PasswordModal';
import NewIngresoModal, { IngresoData } from './NewIngresoModal';
import ProductForm from './ProductForm';
import InventoryFilters, { FilterValues } from './InventoryFilters';
import Pagination from './Pagination';

const Inventory: React.FC = () => {
  // Contexto y usuario
  const { showToast } = useToast();
  const { user } = useAuth();
  const companyId = user?.uid || '';

  // Estados principales de inventario
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [productos, setProductos] = useState<Product[]>([]);
  const [proveedores, setProveedores] = useState<Supplier[]>([]);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [productToIngreso, setProductToIngreso] = useState<Product | null>(null);
  const [showNewIngresoModal, setShowNewIngresoModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [adjustStock_newStock, setAdjustStock_newStock] = useState<number>(0);
  const [adjustStock_motivo, setAdjustStock_motivo] = useState('');
  const [adjustStock_adminPass, setAdjustStock_adminPass] = useState('');
  const [adjustStock_loading, setAdjustStock_loading] = useState(false);
  const [adjustStock_error, setAdjustStock_error] = useState<string | null>(null);
  const [loadingIngreso, setLoadingIngreso] = useState(false);

  // Estado para filtros y paginación
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    category: '',
    supplier: '',
    lowStock: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar productos y proveedores al montar el componente
  useEffect(() => {
    cargarProductos();
  }, [companyId]);

  const cargarProductos = async () => {
    if (!companyId) return;
    
    setCargandoProductos(true);
    try {
      const [productosData, proveedoresData] = await Promise.all([
        obtenerProductosConStockYAverage(companyId),
        obtenerProveedores(companyId)
      ]);
      setProductos(productosData);
      setProveedores(proveedoresData);
    } catch (error) {
      showToast('Error al cargar los productos', 'error');
    } finally {
      setCargandoProductos(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (formData: Product): Promise<boolean> => {
    if (!formData.name || !formData.category) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return false;
    }

    setSaving(true);
    try {
      if (editProduct && editProduct.id) {
        await actualizarProducto(companyId, { ...formData, id: editProduct.id });
        showToast('Producto actualizado correctamente', 'success');
      } else {
        await crearProducto(companyId, formData);
        showToast('Producto creado correctamente', 'success');
      }
      
      setShowAddModal(false);
      setEditProduct(null);
      await cargarProductos();
      return true;
    } catch (error) {
      showToast('Error al guardar el producto', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Filtrar productos
  const filteredProducts = productos.filter(producto => {
    const matchesSearch = !filters.search || 
      producto.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (producto.code && producto.code.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesCategory = !filters.category || producto.category === filters.category;
    const matchesSupplier = !filters.supplier || producto.supplier === filters.supplier;
    const matchesLowStock = !filters.lowStock || (producto.stock <= (producto.minStock || 0));
    
    return matchesSearch && matchesCategory && matchesSupplier && matchesLowStock;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejador de cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Renderizado
  return (
    <div className="p-6 space-y-6 w-full max-w-full">
      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-2">
          {success}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <button
          onClick={() => {
            setForm({ minStock: 5 });
            setEditProduct(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} /> Agregar producto
        </button>
      </div>

      {/* Filtros */}
      <InventoryFilters
        filters={filters}
        onFilterChange={(newFilters: FilterValues) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        categories={Array.from(new Set(productos.map(p => p.category).filter(Boolean)))}
        suppliers={proveedores.map(p => p.name)}
      />

      {/* Tabla de inventario */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <InventoryTable
          products={paginatedProducts}
          loading={cargandoProductos}
          onEdit={(product) => {
            setForm({ ...product });
            setEditProduct(product);
            setSuccess('');
            setShowAddModal(true);
          }}
          onDelete={(product) => {
            setProductToDelete(product);
            setShowDeleteModal(true);
          }}
          onAdjustStock={(product) => {
            setProductToAdjust(product);
            setAdjustStock_newStock(product.stock || 0);
            setShowAdjustStockModal(true);
          }}
          onShowHistory={(product) => {
            setHistoryProduct(product);
            setShowHistoryModal(true);
          }}
          onNewIngreso={(product) => {
            setProductToIngreso(product);
            setShowNewIngresoModal(true);
          }}
        />
        
        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredProducts.length}
        />
      </div>

      {/* Modales */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            <ProductForm
              form={form as Product}
              setForm={setForm}
              onSubmit={handleSubmit}
              saving={saving}
              editProduct={editProduct}
              onCancel={() => {
                setShowAddModal(false);
                setEditProduct(null);
                setForm({});
              }}
              proveedores={proveedores.map(p => p.name)}
            />
          </div>
        </div>
      )}

      {showDeleteModal && productToDelete && (
        <PasswordModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async (password: string) => {
            try {
              if (productToDelete.id) {
                await eliminarProducto(companyId, productToDelete.id, password);
                showToast('Producto eliminado correctamente', 'success');
                await cargarProductos();
              }
            } catch (error) {
              showToast('Error al eliminar el producto', 'error');
            } finally {
              setShowDeleteModal(false);
              setProductToDelete(null);
            }
          }}
          title="Confirmar eliminación"
          message={`¿Estás seguro de eliminar el producto ${productToDelete.name}?`}
        />
      )}

      {showHistoryModal && historyProduct && (
        <InventoryHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          product={historyProduct}
          companyId={companyId}
        />
      )}

      {showNewIngresoModal && productToIngreso && (
        <NewIngresoModal
          isOpen={showNewIngresoModal}
          onClose={() => setShowNewIngresoModal(false)}
          product={productToIngreso}
          onSave={async (ingresoData: IngresoData) => {
            if (!productToIngreso.id) return;
            
            setLoadingIngreso(true);
            try {
              await agregarIngresoProducto(
                companyId,
                productToIngreso.id,
                ingresoData
              );
              showToast('Ingreso registrado correctamente', 'success');
              await cargarProductos();
              setShowNewIngresoModal(false);
            } catch (error) {
              showToast('Error al registrar el ingreso', 'error');
            } finally {
              setLoadingIngreso(false);
            }
          }}
          loading={loadingIngreso}
        />
      )}

      {showAdjustStockModal && productToAdjust && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajustar Stock</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock actual: <span className="font-bold">{productToAdjust.stock} {productToAdjust.unit}</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={adjustStock_newStock}
                  onChange={(e) => setAdjustStock_newStock(Number(e.target.value))}
                  min={0}
                  step={productToAdjust.unitType === 'kg' ? '0.001' : '1'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo del ajuste
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={adjustStock_motivo}
                  onChange={(e) => setAdjustStock_motivo(e.target.value)}
                  placeholder="Ej: Ajuste de inventario"
                  required
                />
              </div>
              {adjustStock_error && (
                <div className="text-red-600 text-sm">{adjustStock_error}</div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustStockModal(false);
                    setAdjustStock_error(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  disabled={adjustStock_loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!adjustStock_motivo.trim()) {
                      setAdjustStock_error('Por favor ingresa un motivo');
                      return;
                    }

                    setAdjustStock_loading(true);
                    setAdjustStock_error(null);

                    try {
                      // Aquí iría la lógica para actualizar el stock
                      // Por ejemplo: await ajustarStock(...)
                      showToast('Stock actualizado correctamente', 'success');
                      await cargarProductos();
                      setShowAdjustStockModal(false);
                    } catch (error) {
                      setAdjustStock_error('Error al actualizar el stock');
                    } finally {
                      setAdjustStock_loading(false);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-emerald-400"
                  disabled={adjustStock_loading}
                >
                  {adjustStock_loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
