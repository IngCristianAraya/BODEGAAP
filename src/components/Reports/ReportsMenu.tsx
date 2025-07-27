import React from 'react';

interface ReportsMenuProps {
  onSelect: (type: string) => void;
}

const reports = [
  { key: 'ventas', label: 'Reporte de Ventas' },
  { key: 'inventario', label: 'Reporte de Inventario' },
  { key: 'ganancias', label: 'Reporte de Ganancias Diarias' },
  { key: 'movimientos', label: 'Movimientos de inventario' },
];

const ReportsMenu: React.FC<ReportsMenuProps> = ({ onSelect }) => (
  <div className="flex flex-wrap gap-4 mb-6">
    {reports.map(r => (
      <button
        key={r.key}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        onClick={() => onSelect(r.key)}
      >
        {r.label}
      </button>
    ))}
  </div>
);

export default ReportsMenu;
