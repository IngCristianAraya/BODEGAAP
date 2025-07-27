import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export async function crearProducto(producto: any) {
  // Elimina campos undefined o null para evitar errores de Firestore
  const cleanProduct: Record<string, any> = {};
  Object.entries(producto).forEach(([key, value]) => {
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
    
    .map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function actualizarProducto(id: string, data: any) {
  return await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function eliminarProducto(id: string) {
  return await deleteDoc(doc(db, 'products', id));
}
