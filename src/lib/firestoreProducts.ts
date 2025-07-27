import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Product } from '../types/inventory';

export async function crearProducto(producto: Partial<Product>) {
  // Elimina campos undefined o null para evitar errores de Firestore
  const cleanProduct: Record<string, unknown> = {};
  Object.entries(producto).forEach(([key, value]: [string, unknown]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanProduct[key] = value;
    }
  });
  console.log('DEBUG crearProducto - usuario:', auth.currentUser);
  console.log('DEBUG crearProducto - cleanProduct:', cleanProduct);
  return await addDoc(collection(db, 'products'), {
    ...cleanProduct,
    isExemptIGV: !!cleanProduct.isExemptIGV, // Guardar siempre el campo como booleano
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}


export async function obtenerProductos() {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs
    .map(doc => {
      const data = doc.data() as Partial<Product>;
      return {
        id: doc.id,
        name: String(data.name ?? ''),
        code: String(data.code ?? ''),
        category: String(data.category ?? ''),
        subcategory: String(data.subcategory ?? ''),
        unit: String(data.unit ?? ''),
        unitType: (data.unitType ?? 'unidad') as 'unidad' | 'kg',
        stock: typeof data.stock === 'number' ? data.stock : 0,
        minStock: typeof data.minStock === 'number' ? data.minStock : 3,
        salePrice: typeof data.salePrice === 'number' ? data.salePrice : 0,
        costPrice: typeof data.costPrice === 'number' ? data.costPrice : 0,
        averageCost: typeof data.averageCost === 'number' ? data.averageCost : 0,
        supplier: String(data.supplier ?? ''),
        imageUrl: String(data.imageUrl ?? ''),
        barcode: String(data.barcode ?? ''),
        isExemptIGV: !!data.isExemptIGV,
        isExonerated: !!data.isExonerated,
        igvIncluded: typeof data.igvIncluded === 'boolean' ? data.igvIncluded : true,
        ventaPorPeso: !!data.ventaPorPeso,
        createdAt: typeof data.createdAt === 'string'
          ? data.createdAt
          : (data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function'
              ? (data.createdAt as { toDate: () => Date }).toDate().toISOString()
              : new Date().toISOString()),
        updatedAt: typeof data.updatedAt === 'string'
          ? data.updatedAt
          : (data.updatedAt && typeof (data.updatedAt as { toDate?: () => Date }).toDate === 'function'
              ? (data.updatedAt as { toDate: () => Date }).toDate().toISOString()
              : new Date().toISOString()),
      };
    });
}

export async function actualizarProducto(id: string, data: Partial<Product>) {
  return await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function eliminarProducto(id: string) {
  return await deleteDoc(doc(db, 'products', id));
}
