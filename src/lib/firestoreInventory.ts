import { collection, addDoc, getDocs, Timestamp, doc, updateDoc, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Product, InventoryMovement } from '../types/inventory';

const PRODUCTS_COLLECTION = 'products';
const MOVEMENTS_COLLECTION = 'inventory_movements';

// Crear producto principal
export async function crearProducto(producto: Omit<Product, 'id' | 'stock' | 'averageCost' | 'createdAt' | 'updatedAt'>, primerIngreso: { quantity: number; costPrice: number; date?: string }) {
  // El producto se crea con stock = cantidad del primer ingreso y averageCost = costPrice del primer ingreso
  const now = Timestamp.now();
  // Logs de depuración
  try {
    const { auth } = await import('./firebase');
    console.log('DEBUG crearProducto (inventory) - usuario:', auth.currentUser);
  } catch {

    console.warn('No se pudo importar auth para log de usuario');
  }
  console.log('DEBUG crearProducto (inventory) - producto:', {
    ...producto,
    stock: primerIngreso.quantity,
    averageCost: primerIngreso.costPrice,
    createdAt: now,
    updatedAt: now,
  });
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...producto,
    stock: primerIngreso.quantity,
    averageCost: primerIngreso.costPrice,
    createdAt: now,
    updatedAt: now,
  });
  // Registrar el primer movimiento de ingreso
  // Obtener el usuario autenticado
  let cashierEmail = '';
  try {
    const { auth } = await import('./firebase');
    cashierEmail = auth.currentUser?.email || '';
  } catch {}
  await addDoc(collection(db, MOVEMENTS_COLLECTION), {
    productId: docRef.id,
    quantity: primerIngreso.quantity,
    costPrice: primerIngreso.costPrice,
    date: primerIngreso.date || now,
    type: 'ingreso',
    cashierEmail,
  });
  return docRef.id;
}

// Agregar ingreso de stock a un producto existente
export async function agregarIngresoProducto(productId: string, ingreso: { quantity: number; costPrice: number; date?: string; type?: string; motivo?: string }) {
  if (!ingreso.quantity || ingreso.quantity === 0) {
    // No registrar movimientos nulos
    return;
  }
  const now = Timestamp.now();
  // Registrar movimiento
  // Obtener el usuario autenticado
  let cashierEmail = '';
  try {
    const { auth } = await import('./firebase');
    cashierEmail = auth.currentUser?.email || '';
  } catch {}
  await addDoc(collection(db, MOVEMENTS_COLLECTION), {
    productId,
    quantity: ingreso.quantity,
    costPrice: ingreso.costPrice,
    date: ingreso.date || now,
    type: ingreso.type || 'ingreso',
    cashierEmail,
    ...(ingreso.motivo ? { motivo: ingreso.motivo } : {})
  });
  // Recalcular stock y averageCost
  await recalcularStockYAverageCost(productId);
}

// Obtener movimientos de un producto
export async function obtenerMovimientosProducto(productId: string): Promise<InventoryMovement[]> {
  const snapshot = await getDocs(collection(db, MOVEMENTS_COLLECTION));
  return snapshot.docs
    .map(doc => {
      const mov = { id: doc.id, ...doc.data() } as Record<string, unknown>;
      return {
        id: String(mov.id ?? ''),
        productId: typeof mov.productId === 'string' ? mov.productId : '',
        quantity: typeof mov.quantity === 'number' ? mov.quantity : 0,
        costPrice: typeof mov.costPrice === 'number' ? mov.costPrice : 0,
        date: typeof mov.date === 'string'
          ? mov.date
          : (mov.date && typeof (mov.date as { toDate?: () => Date }).toDate === 'function'
              ? (mov.date as { toDate: () => Date }).toDate().toISOString()
              : null),
        type: typeof mov.type === 'string' ? (mov.type as 'ingreso' | 'egreso' | 'ajuste') : 'ingreso',
        cashierEmail: typeof mov.cashierEmail === 'string' ? mov.cashierEmail : '',
        motivo: typeof mov.motivo === 'string' ? mov.motivo : undefined,
      } as InventoryMovement;
    })
    .filter((mov: InventoryMovement) => mov.productId === productId);
}

// Recalcular stock y averageCost de un producto tras un ingreso
export async function recalcularStockYAverageCost(productId: string) {
  const movimientos = await obtenerMovimientosProducto(productId);
  const ingresos = movimientos.filter(m => m.type === 'ingreso');
  const totalCantidad = ingresos.reduce((sum, m) => sum + m.quantity, 0);
  const totalCosto = ingresos.reduce((sum, m) => sum + m.quantity * m.costPrice, 0);
  const averageCost = totalCantidad > 0 ? totalCosto / totalCantidad : 0;
  // Actualizar producto principal
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    stock: totalCantidad,
    averageCost,
    updatedAt: Timestamp.now(),
  });
}

// Obtener todos los productos con averageCost y stock actualizados
export async function obtenerProductosConStockYAverage(): Promise<Product[]> {
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Product[];
}

// Obtener todos los movimientos de inventario (para reportes)
export async function obtenerTodosMovimientosInventario(): Promise<InventoryMovement[]> {
  const snapshot = await getDocs(collection(db, MOVEMENTS_COLLECTION));
  // Obtener productos para enriquecer el reporte
  const productosSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const productos: Product[] = productosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  // Agrupar movimientos por producto
  type RawMovement = {
    id: string;
    productId: string;
    quantity: number;
    costPrice: number;
    date: string | { toDate: () => Date } | Date;
    type?: string;
    cashierEmail?: string;
    motivo?: string;
  };
  const movimientosPorProducto: Record<string, RawMovement[]> = {};
  snapshot.docs.forEach(doc => {
    const mov = { id: doc.id, ...doc.data() } as RawMovement;
    if (!movimientosPorProducto[mov.productId]) movimientosPorProducto[mov.productId] = [];
    movimientosPorProducto[mov.productId].push(mov);
  });
  // Para cada producto, ordenar movimientos por fecha ASC y calcular stock acumulado
  const movimientosEnriquecidos: InventoryMovement[] = [];
  Object.entries(movimientosPorProducto).forEach(([, movimientos]) => {
    // Ordenar por fecha ASC
    // Función robusta para obtener el valor numérico de la fecha
    const getDateValue = (date: string | { toDate: () => Date } | Date) => {
      if (typeof date === 'object' && date !== null && 'toDate' in date && typeof (date as any).toDate === 'function') return (date as { toDate: () => Date }).toDate().getTime();
      if (typeof date === 'string') return new Date(date).getTime();
      if (date instanceof Date) return date.getTime();
      return 0;
    };
    movimientos.sort((a, b) => {
      const dateA = getDateValue(a.date);
      const dateB = getDateValue(b.date);
      return dateA - dateB;
    });
    let stock = 0;
    for (let i = 0; i < movimientos.length; i++) {
      const mov = movimientos[i];
      const initialStock = stock;
      stock += mov.quantity;
      const finalStock = stock;
      const prod = productos.find((p) => p.id === mov.productId);
      movimientosEnriquecidos.push({
        id: mov.id,
        productId: mov.productId || '',
        quantity: typeof mov.quantity === 'number' ? mov.quantity : 0,
        costPrice: typeof mov.costPrice === 'number' ? mov.costPrice : 0,
        date: typeof mov.date === 'string' ? mov.date : (typeof (mov.date as any)?.toDate === 'function' ? (mov.date as any).toDate().toISOString() : null),
        type: mov.type as InventoryMovement['type'] || 'ingreso',
        cashierEmail: mov.cashierEmail || '',
        motivo: mov.motivo || undefined,
        productName: prod && prod.name ? prod.name : mov.productId || '',
        initialStock,
        finalStock
      });
    }
  });
  // Ordenar todos los movimientos enriquecidos por fecha descendente
  const getDateValue = (date: string | { toDate: () => Date } | Date) => {
    if (typeof date === 'object' && date !== null && 'toDate' in date && typeof (date as any).toDate === 'function') return (date as { toDate: () => Date }).toDate().getTime();
    if (typeof date === 'string') return new Date(date).getTime();
    if (date instanceof Date) return date.getTime();
    return 0;
  };
  return movimientosEnriquecidos.sort((a, b) => {
    const dateA = getDateValue(a.date);
    const dateB = getDateValue(b.date);
    return dateB - dateA;
  });
}
