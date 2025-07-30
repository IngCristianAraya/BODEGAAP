import React from "react";
import { Product } from '../../types/inventory';

interface Props {
  items: { product: Product; quantity: number }[];
}

const DesgloseIGV: React.FC<Props> = ({ items }) => {
  function descomponerIGV(precioFinal: number) {
    const base = precioFinal / 1.18;
    const igv = precioFinal - base;
    return { base, igv };
  }

  const subtotalExempt = items.filter(item => item.product.isExonerated).reduce((sum, item) => sum + ((item.product.salePrice ?? 0) * item.quantity), 0);
  const subtotalTaxed = items.filter(item => !item.product.isExonerated).reduce((sum, item) => {
    const { base } = descomponerIGV(item.product.salePrice ?? 0);
    return sum + (base * item.quantity);
  }, 0);

  return (
    <>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal gravado</span>
        <span className="font-medium">S/. {subtotalTaxed.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal exonerado</span>
        <span className="font-medium">S/. {subtotalExempt.toFixed(2)}</span>
      </div>
    </>
  );
};

export default DesgloseIGV;
