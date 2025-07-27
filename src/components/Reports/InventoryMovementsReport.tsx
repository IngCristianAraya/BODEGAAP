import React, { useEffect, useState } from 'react';
import { obtenerTodosMovimientosInventario } from '../../lib/firestoreInventory';
import { Product } from '../../types/inventory';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryMovement {
  id: string;
  productId: string;
  quantity: number;
  costPrice: number;
  date: any;
  type: 'ingreso' | 'egreso' | 'ajuste';
  motivo?: string;
  cashierEmail?: string;
  cashierName?: string;
  productName?: string;
  initialStock?: number;
  finalStock?: number;
}

const colorForQuantity = (qty: number) =>
  qty < 0 ? 'text-red-600 font-bold' : qty > 0 ? 'text-green-600 font-bold' : '';

const MOVEMENTS_PER_PAGE = 10;

const InventoryMovementsReport: React.FC = () => {
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [motivoMensaje, setMotivoMensaje] = useState<string | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMovements() {
      setLoading(true);
      try {
        const data = await obtenerTodosMovimientosInventario();
        setMovements(data);
      } catch {
        setMovements([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMovements();
  }, []);

  // Paginación
  const totalPages = Math.ceil(movements.length / MOVEMENTS_PER_PAGE);
  const paginatedMovements = movements.slice((page - 1) * MOVEMENTS_PER_PAGE, page * MOVEMENTS_PER_PAGE);
  const startNumber = movements.length - (page - 1) * MOVEMENTS_PER_PAGE;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-emerald-700">Movimientos de inventario</h2>
      {!loading && (
        <div className="mb-2 text-xs text-gray-400 text-center">Movimientos cargados: {movements.length}</div>
      )}
      {loading ? (
        <div className="py-10 text-center text-emerald-700 font-semibold">Cargando movimientos...</div>
      ) : movements.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No hay movimientos registrados.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-sm text-sm text-gray-700">
              <thead>
                <tr className="bg-emerald-50 text-emerald-900">
                  <th className="py-3 px-4 border-b text-center">#</th>
                  <th className="py-3 px-4 border-b">Fecha y hora</th>
                  <th className="py-3 px-4 border-b">Cajero</th>
                  <th className="py-3 px-4 border-b">Detalle</th>
                  <th className="py-3 px-4 border-b text-center">Movimiento</th>
                  <th className="py-3 px-4 border-b text-right">Stock inicial</th>
                  <th className="py-3 px-4 border-b text-right">Cantidad</th>
                  <th className="py-3 px-4 border-b text-right">Stock final</th>
                  <th className="py-3 px-4 border-b text-center">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovements.map((mov, idx) => {
                  let dateStr = '';
                  if (mov.date) {
                    const d = mov.date.seconds
                      ? new Date(mov.date.seconds * 1000)
                      : new Date(mov.date);
                    dateStr = d.toLocaleString('es-PE');
                  }
                  return (
                    <tr key={mov.id} className="hover:bg-emerald-50">
                      <td className="py-2 px-4 border-b text-center font-semibold">{startNumber - idx}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{dateStr}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{mov.cashierEmail || '-'}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{mov.productName || mov.productId}</td>
                      <td className="py-2 px-4 border-b text-center capitalize">{mov.type || '-'}</td>
                      <td className="py-2 px-4 border-b text-right">{mov.initialStock !== undefined ? mov.initialStock : '-'}</td>
                      <td className={`py-2 px-4 border-b text-right ${colorForQuantity(mov.quantity)}`}>{mov.quantity > 0 ? '+' : ''}{mov.quantity}</td>
                      <td className="py-2 px-4 border-b text-right">{mov.finalStock !== undefined ? mov.finalStock : '-'}</td>
                      <td className="py-2 px-4 border-b text-center">
                        {mov.type === 'ajuste' && mov.motivo ? (
                          <button
                            className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
                            onClick={() => { setMotivoMensaje(mov.motivo!); setShowMotivoModal(true); }}
                          >Motivo</button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
            <div className="space-x-2">
              <button
                className="px-3 py-1 rounded border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Anterior</button>
              <button
                className="px-3 py-1 rounded border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >Siguiente</button>
            </div>
          </div>
        </>
      )}
      {/* Modal Motivo Ajuste */}
      {showMotivoModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 text-emerald-700">Motivo del ajuste</h3>
            <div className="mb-4 text-gray-700 whitespace-pre-wrap">{motivoMensaje}</div>
            <button
              className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setShowMotivoModal(false)}
            >Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryMovementsReport;
