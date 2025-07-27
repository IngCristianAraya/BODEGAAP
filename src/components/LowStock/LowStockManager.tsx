import React, { useEffect, useState } from 'react';
import { obtenerProductos } from '../../lib/firestoreProducts';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Product } from '../../types/inventory';

const LowStockManager: React.FC = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerProductos();
      // Filtra sólo los productos que tienen los campos mínimos requeridos para evitar errores de tipo
      setProductos(
        (data as Product[]).filter(p => typeof p.name === 'string' && typeof p.stock === 'number' && typeof p.minStock === 'number')
      );
    } catch (e) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const productosBajoStock = productos.filter(
    p => typeof p.stock === 'number' && typeof p.minStock === 'number' && p.stock <= p.minStock
  );

  return (
    <div className="p-4 md:p-8 w-full min-h-screen bg-white ml-0">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="text-amber-500" size={32} />
        <h2 className="text-2xl font-bold text-amber-700">Productos Bajo Stock</h2>
        <button
          className="ml-auto px-3 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-1 text-sm"
          onClick={fetchProductos}
          title="Recargar"
        >
          <RefreshCw size={16} /> Recargar
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-16 text-amber-700">
          <span className="animate-spin mr-2"><RefreshCw size={20} /></span>
          Cargando productos...
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-10">{error}</div>
      ) : productosBajoStock.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          <AlertTriangle className="mx-auto mb-2 text-amber-400" size={36} />
          ¡Todos tus productos están por encima del stock mínimo!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-sm text-sm bg-white">
            <thead>
              <tr className="bg-amber-50 text-amber-900">
                <th className="py-3 px-4 border-b text-left">Producto</th>
                <th className="py-3 px-4 border-b text-center">Stock actual</th>
                <th className="py-3 px-4 border-b text-center">Stock mínimo</th>
                <th className="py-3 px-4 border-b text-center">Categoría</th>
                <th className="py-3 px-4 border-b text-center">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {productosBajoStock.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50">
                  <td className="py-2 px-4 font-semibold text-gray-900 flex items-center gap-2">
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-cover rounded mr-2 border border-amber-100" />
                    )}
                    {p.name}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center">{p.minStock}</td>
                  <td className="py-2 px-4 text-center">{p.category || '-'}</td>
                  <td className="py-2 px-4 text-center">{p.supplier || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LowStockManager;
