import React, { useState } from 'react';

interface ModalPesoProps {
  open: boolean;
  stockDisponible: number;
  onClose: () => void;
  onConfirm: (peso: number) => void;
}

const ModalPeso: React.FC<ModalPesoProps> = ({ open, stockDisponible, onClose, onConfirm }) => {
  const [peso, setPeso] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open) {
      setPeso('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    const value = parseFloat(peso.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      setError('Ingrese un peso válido (> 0)');
      return;
    }
    if (value > stockDisponible) {
      setError('No hay suficiente stock disponible');
      return;
    }
    setError('');
    onConfirm(Number(value.toFixed(3)));
    setPeso('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && peso && !error) {
      handleConfirm();
    }
  };

  if (!open) return null;

  const isLowStock = stockDisponible > 0 && stockDisponible < 0.05;
  const isAgregarDisabled = !peso || !!error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Ingrese el peso</h2>
        <div className="relative flex items-center mb-2">
          <input
            type="number"
            step="0.001"
            min="0.001"
            max={stockDisponible}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 pr-12"
            placeholder="Ej: 0.250"
            value={peso}
            onChange={e => setPeso(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
          <span className="absolute right-4 text-gray-500 select-none">kg</span>
        </div>
        <div className="text-xs text-gray-500 mb-2">Stock disponible: {stockDisponible.toFixed(3)} kg</div>
        {isLowStock && (
          <div className="text-xs text-orange-600 mb-2">⚠️ Stock muy bajo</div>
        )}
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded text-gray-700 hover:bg-gray-200"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            type="button"
            disabled={isAgregarDisabled}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPeso;
