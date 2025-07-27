import React from 'react';

interface InventoryFiltersProps {
  filters: {
    name: string;
    code: string;
    supplier: string;
    category: string;
  };
  barcodeInput: string;
  onFiltersChange: (filters: { name: string; code: string; supplier: string; category: string }) => void;
  onBarcodeInputChange: (barcode: string) => void;
  onBarcodeSearch: () => void;
  proveedores?: string[];
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  barcodeInput,
  onFiltersChange,
  onBarcodeInputChange,
  onBarcodeSearch,
  proveedores = [],
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            placeholder="Buscar por nombre"
            value={filters.name}
            onChange={e => onFiltersChange({ ...filters, name: e.target.value })}
            aria-label="Filtrar por nombre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código/SKU</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            placeholder="Código o SKU"
            value={filters.code}
            onChange={e => onFiltersChange({ ...filters, code: e.target.value })}
            aria-label="Filtrar por código"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          {proveedores && proveedores.length > 0 ? (
            <>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                placeholder="Filtrar por proveedor"
                value={filters.supplier}
                onChange={e => onFiltersChange({ ...filters, supplier: e.target.value })}
                aria-label="Filtrar por proveedor"
                list="proveedores-list-filtros"
              />
              <datalist id="proveedores-list-filtros">
                {proveedores.map((prov: string) => (
                  <option value={prov} key={prov} />
                ))}
              </datalist>
            </>
          ) : (
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              placeholder="Filtrar por proveedor"
              value={filters.supplier}
              onChange={e => onFiltersChange({ ...filters, supplier: e.target.value })}
              aria-label="Filtrar por proveedor"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={filters.category}
            onChange={e => onFiltersChange({ ...filters, category: e.target.value })}
            aria-label="Filtrar por categoría"
          >
            <option value="all">Todas</option>
            <option value="Abarrotes">Abarrotes</option>
            <option value="Huevos y Lácteos">Huevos y Lácteos</option>
            <option value="Carnes y Embutidos">Carnes y Embutidos</option>
            <option value="Frutas y Verduras">Frutas y Verduras</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Snacks y Golosinas">Snacks y Golosinas</option>
            <option value="Helados">Helados</option>
            <option value="Limpieza del Hogar">Limpieza del Hogar</option>
            <option value="Higiene Personal">Higiene Personal</option>
            <option value="Productos para Mascotas">Productos para Mascotas</option>
            <option value="Descartables">Descartables</option>
            <option value="Panadería">Panadería</option>
            <option value="Repostería">Repostería</option>
            <option value="Congelados">Congelados</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="text"
            className="border rounded-l-md px-3 py-2"
            placeholder="Escanear código de barras"
            value={barcodeInput}
            onChange={e => onBarcodeInputChange(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && onBarcodeSearch()}
            aria-label="Buscar por código de barras"
          />
          <button
            className="bg-emerald-600 text-white px-3 py-2 rounded-r-md"
            onClick={onBarcodeSearch}
            type="button"
            aria-label="Buscar código de barras"
          >
            Escanear
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
