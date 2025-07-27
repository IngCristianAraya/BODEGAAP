import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import { Sale } from '../types';
import { Product } from '../types/inventory';

const COLLECTION = 'sales';

export async function descontarStockProductos(items: any[], ) {
  const productIds = items.map(item => item.productId);
  // Obtener los productos afectados
  const snapshot = await getDocs(collection(db, 'products'));
  const productos = snapshot.docs
    .filter(docSnap => productIds.includes(docSnap.id))
    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Product));
  // Actualizar stock
  await Promise.all(
    items.map(async item => {
      const producto = productos.find(p => p.id === item.productId);
      if (!producto) return;
      const nuevoStock = (producto.stock ?? 0) - (item.quantity ?? 0);
      await updateDoc(doc(db, 'products', item.productId), { stock: nuevoStock });
    })
  );
}

export async function obtenerVentas(): Promise<Sale[]> {
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, COLLECTION));
  return snapshot.docs
    .map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        items: (data.items ?? []) as any[],
        total: typeof data.total === 'number' ? data.total : 0,
        subtotal: typeof data.subtotal === 'number' ? data.subtotal : 0,
        discount: typeof data.discount === 'number' ? data.discount : 0,
        tax: typeof data.tax === 'number' ? data.tax : 0,
        paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : '',
        customerId: typeof data.customerId === 'string' ? data.customerId : '',
        customerName: typeof data.customerName === 'string' ? data.customerName : '',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
        cashierId: typeof data.cashierId === 'string' ? data.cashierId : '',
        cashierName: typeof data.cashierName === 'string' ? data.cashierName : '',
        receiptNumber: typeof data.receiptNumber === 'string' ? data.receiptNumber : '',
      };
    });
}

export async function crearVenta(sale: any): Promise<string> {
  // Compatibilidad: permite 'items' o 'products', y agrega campos faltantes
  const items = sale.items || sale.products || [];
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...sale,
    items,
    products: items,
    date: sale.date || (sale.createdAt ? (sale.createdAt instanceof Date ? sale.createdAt.toISOString() : sale.createdAt) : new Date().toISOString()),
    userId: sale.userId || sale.cashierId || '',
    createdAt: sale.createdAt ? (sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt)) : Timestamp.now(),
  });
  return docRef.id;
}

export async function actualizarVenta(id: string, data: Partial<Sale>) {
  return updateDoc(doc(db, COLLECTION, id), data);
}

export async function eliminarVenta(id: string) {
  return deleteDoc(doc(db, COLLECTION, id));
}
