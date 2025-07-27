import React, { useState } from 'react';

interface NewIngresoModalProps {
  productName: string;
  onConfirm: (quantity: number, costPrice: number) => void;
  onCancel: () => void;
  loading?: boolean;
}

const NewIngresoModal: React.FC<NewIngresoModalProps> = ({ productName, onConfirm, onCancel, loading }) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }
    if (costPrice < 0) {
      setError('El precio de costo no puede ser negativo.');
      return;
    }
    onConfirm(quantity, costPrice);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-emerald-700">Nuevo ingreso de producto</h2>
        <div className="mb-2"><span className="font-semibold">Producto:</span> {productName}</div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mb-2">
            <label className="text-xs font-semibold mb-1">Cantidad a ingresar</label>
            <input
              type="number"
              className="border rounded px-3 py-1"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              disabled={loading}
              required
            />
          </div>
          <div className="flex flex-col mb-2">
            <label className="text-xs font-semibold mb-1">Precio de costo (unidad)</label>
            <input
              type="number"
              className="border rounded px-3 py-1"
              min={0}
              step={0.01}
              value={costPrice}
              onChange={e => setCostPrice(Number(e.target.value))}
              disabled={loading}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onCancel}
              disabled={loading}
            >Cancelar</button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded"
              disabled={loading}
            >{loading ? 'Guardando...' : 'Confirmar ingreso'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewIngresoModal;
