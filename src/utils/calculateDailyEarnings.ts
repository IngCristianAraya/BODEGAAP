import { Sale, Product, SaleItem } from '../types/index';

/**
 * Calcula la ganancia total del día a partir de las ventas y productos.
 * Ganancia = (PrecioVenta - PrecioCosto) * Cantidad, sólo para ventas del día.
 */
export function calculateDailyEarnings(ventas: Sale[], productos: Product[]): number {
  const hoy = new Date();
  let totalProfit = 0;
  ventas.forEach((venta: Sale) => {
    const fechaRaw = venta.createdAt;
    const fecha = fechaRaw instanceof Date ? fechaRaw : new Date(fechaRaw);
    if (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    ) {
      (Array.isArray(venta.items) ? venta.items : []).forEach((item: SaleItem) => {
        const prod = productos.find((p: Product) => p.id === item.productId);
        const cost = prod?.costPrice ?? 0;
        const salePrice = item.unitPrice ?? 0;
        const profit = (salePrice - cost) * (item.quantity ?? 1);
        totalProfit += profit;
      });
    }
  });
  return totalProfit;
}
