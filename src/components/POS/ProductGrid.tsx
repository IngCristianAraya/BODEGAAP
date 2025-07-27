import React from 'react';
import Image from 'next/image';
import { Plus, Package } from 'lucide-react';
import { Product } from '../../types/inventory';

import ModalPeso from './ModalPeso';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, peso?: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = React.useState<Product | null>(null);

  const handleAddToCart = (product: Product) => {
    if (product.ventaPorPeso && product.unitType === 'kg') {
      setProductoSeleccionado(product);
      setModalOpen(true);
    } else {
      onAddToCart(product);
    }
  };

  const handleConfirmPeso = (peso: number) => {
    if (productoSeleccionado) {
      onAddToCart(productoSeleccionado, peso);
      setProductoSeleccionado(null);
      setModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setProductoSeleccionado(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-120 relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name || 'Producto'}
                  fill
                  className="object-cover rounded-t-xl"
                  sizes="100vw"
                  style={{ objectFit: 'cover' }}
                  priority={false}
                  onError={(e) => {
                    // fallback a icono si la imagen no carga
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center text-gray-300';
                    fallback.innerHTML = `<svg width='48' height='48' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='3' y='7' width='18' height='13' rx='2'/><path d='M16 3v4M8 3v4m-4 4h16'/></svg>`;
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package size={48} />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                Stock: {product.stock}
              </div>
            </div>
            <div className="p-2">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-gray-500">{product.category}</p>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-base font-bold text-gray-900">S/. {(product.salePrice ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{product.unit}</p>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  title={product.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
                  className="bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <Plus size={28} />
</button>
              </div>
              {product.stock <= product.minStock && (
                <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  ⚠️ Stock bajo
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <ModalPeso
        open={modalOpen}
        stockDisponible={productoSeleccionado?.stock ?? 0}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPeso}
      />
    </>
  );
};

export default ProductGrid;