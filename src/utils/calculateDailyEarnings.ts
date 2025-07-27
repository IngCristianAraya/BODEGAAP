import { Sale } from '../types';
import { Product } from '../types';

/**
 * Calcula la ganancia total del día a partir de las ventas y productos.
 * Ganancia = (PrecioVenta - PrecioCosto) * Cantidad, sólo para ventas del día.
 */
export function calculateDailyEarnings(ventas: Sale[], productos: Product[]): number {
  const hoy = new Date();
  let totalProfit = 0;
  ventas.forEach((venta) => {
    // Compatibilidad: fecha puede ser string o Date
    const fechaRaw = (venta as any).createdAt ?? venta.date;
    const fecha = fechaRaw instanceof Date ? fechaRaw : new Date(fechaRaw);
    if (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    ) {
      ((venta as any).items || venta.products || []).forEach((item: any) => {
        const prod = productos.find((p) => p.id === item.productId);
        const cost = prod?.costPrice ?? prod?.purchasePrice ?? 0;
        const salePrice = item.unitPrice ?? 0;
        const profit = (salePrice - cost) * (item.quantity ?? 1);
        totalProfit += profit;
      });
    }
  });
  return totalProfit;
}
