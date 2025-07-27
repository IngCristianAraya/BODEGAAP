import React, { useEffect, useState } from 'react';
import { InventoryMovement, Product } from '../../types/inventory';
import { obtenerMovimientosProducto } from '../../lib/firestoreInventory';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  product: Product;
  onClose: () => void;
}

const InventoryHistoryModal: React.FC<Props> = ({ product, onClose }) => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const movs = await obtenerMovimientosProducto(product.id);
        setMovements(movs.sort((a, b) => (b.date > a.date ? 1 : -1)));
      } catch (err) {
        setMovements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, [product.id]);

  // Exportar historial a Excel
  const handleExportExcel = () => {
    const data = movements.map(mov => ({
      Fecha: (() => {
        if (!mov.date) return '-';
        if (typeof mov.date === 'object' && mov.date !== null && 'seconds' in mov.date) {
          return new Date((mov.date as { seconds: number }).seconds * 1000).toLocaleString();
        }
        const d = new Date(mov.date);
        return isNaN(d.getTime()) ? '-' : d.toLocaleString();
      })(),
      Cantidad: mov.quantity,
      'Precio Compra': mov.costPrice,
      Total: mov.quantity * mov.costPrice
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `historial_${product.code || product.name}.xlsx`);
  };

  // Exportar historial a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        'Fecha', 'Cantidad', 'Precio Compra', 'Total'
      ]],
      body: movements.map(mov => [
        (() => {
          if (!mov.date) return '-';
          if (typeof mov.date === 'object' && mov.date !== null && 'seconds' in mov.date) {
            return new Date((mov.date as { seconds: number }).seconds * 1000).toLocaleString();
          }
          const d = new Date(mov.date);
          return isNaN(d.getTime()) ? '-' : d.toLocaleString();
        })(),
        mov.quantity,
        mov.costPrice.toFixed(2),
        (mov.quantity * mov.costPrice).toFixed(2)
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
      margin: { top: 20 }
    });
    doc.save(`historial_${product.code || product.name}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">×</button>
        {/* Botones de exportación */}
        <div className="flex justify-end gap-2 mb-2">
          <button
            className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
            onClick={handleExportExcel}
          >Exportar a Excel</button>
          <button
            className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-900"
            onClick={handleExportPDF}
          >Exportar a PDF</button>
        </div>
        <h2 className="text-xl font-bold mb-4">Historial de Ingresos - {product.name}</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-8">Cargando movimientos...</div>
        ) : movements.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No hay ingresos registrados para este producto.</div>
        ) : (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Fecha</th>
                <th className="py-2 text-right">Cantidad</th>
                <th className="py-2 text-right">Precio Compra</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr key={mov.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{
                    (() => {
                      if (!mov.date) return '-';
                      // Firestore Timestamp
                      if (typeof mov.date === 'object' && mov.date !== null && 'seconds' in mov.date) {
                        return new Date((mov.date as { seconds: number }).seconds * 1000).toLocaleString();
                      }
                      // ISO string or number
                      const d = new Date(mov.date);
                      return isNaN(d.getTime()) ? '-' : d.toLocaleString();
                    })()
                  }</td>
                  <td className="py-2 text-right">{mov.quantity}</td>
                  <td className="py-2 text-right">S/ {typeof mov.costPrice === 'number' ? mov.costPrice.toFixed(2) : '-'}</td>
                  <td className="py-2 text-right">S/ {typeof mov.quantity === 'number' && typeof mov.costPrice === 'number' ? (mov.quantity * mov.costPrice).toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryHistoryModal;
