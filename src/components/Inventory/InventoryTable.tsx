import React from 'react';
import { Product } from '../../types/inventory';
import { Pencil, Trash2, Wrench } from 'lucide-react';

interface InventoryTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onShowHistory?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  onNewIngreso?: (product: Product) => void;
  loading?: boolean;
}

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InventoryTable: React.FC<InventoryTableProps> = ({ products, onEdit, onDelete, onShowHistory, onAdjustStock, onNewIngreso, loading }) => {
  // Exportar a Excel
  const handleExportExcel = () => {
    const data = products.map(p => ({
      Nombre: p.name,
      Código: p.code,
      Categoría: p.category,
      Proveedor: p.supplier,
      Stock: p.stock,
      'Costo Promedio': p.averageCost,
      'Precio Venta': p.salePrice
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, 'inventario.xlsx');
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        'Nombre', 'Código', 'Categoría', 'Proveedor', 'Stock', 'Costo Promedio', 'Precio Venta'
      ]],
      body: products.map(p => [
        p.name,
        p.code,
        p.category,
        p.supplier,
        p.stock,
        p.averageCost?.toFixed(2) ?? '0.00',
        typeof p.salePrice === 'number' ? p.salePrice.toFixed(2) : '-'
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] }, // emerald
      margin: { top: 20 }
    });
    doc.save('inventario.pdf');
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white mt-6">
      {/* Botones de exportación */}
      <div className="flex justify-end gap-2 px-4 pt-4">
        <button
          className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
          onClick={handleExportExcel}
        >Exportar a Excel</button>
        <button
          className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-900"
          onClick={handleExportPDF}
        >Exportar a PDF</button>
      </div>
      <table className="min-w-full text-sm text-left align-middle">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-2 font-semibold text-gray-700">Imagen</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Nombre</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Código</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Categoría</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Proveedor</th>
            <th className="px-4 py-2 font-semibold text-gray-700 text-right">Stock</th>
            <th className="px-4 py-2 font-semibold text-gray-700 text-right">Costo Promedio</th>
            <th className="px-4 py-2 font-semibold text-gray-700 text-right">Precio Venta</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="text-center py-8 text-gray-400">Cargando...</td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-8 text-gray-400">No hay productos en el inventario.</td></tr>
          ) : (
            products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 border-b last:border-b-0">
                <td className="px-4 py-2 whitespace-nowrap">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded border border-gray-200 bg-white"
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded border border-gray-200">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4m-4 4h16"/></svg>
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{product.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{product.code}</td>
                <td className="px-4 py-2 whitespace-nowrap">{product.category}</td>
                <td className="px-4 py-2 whitespace-nowrap">{product.supplier || '-'}</td>
                <td className={`px-4 py-2 whitespace-nowrap text-right ${product.minStock !== undefined && product.stock <= product.minStock ? 'text-red-600 font-bold' : ''}`}> 
                  {product.stock}
                  {product.minStock !== undefined && product.stock <= product.minStock && (
                    <span title="Bajo stock" className="ml-2 inline-block align-middle animate-pulse">⚠️</span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right">S/. {product.averageCost?.toFixed(2) ?? '0.00'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right">S/. {typeof product.salePrice === 'number' ? product.salePrice.toFixed(2) : '-'}</td>
                <td className="px-4 py-2 flex gap-2 items-center">
                  <button
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                    title="Editar"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                    title="Eliminar"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-gray-100 text-gray-600"
                    title="Ver historial de ingresos"
                    onClick={() => onShowHistory && onShowHistory(product)}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-700"
                    title="Nuevo ingreso"
                    onClick={() => {
  console.log('[DEBUG] Click en botón Nuevo ingreso', product, onNewIngreso);
  if (onNewIngreso) onNewIngreso(product);
}}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-blue-100 text-blue-600"
                    title="Ajustar stock"
                    onClick={() => onAdjustStock && onAdjustStock(product)}
                  >
                    <Wrench size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
