import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import type { Supplier } from '../types/index';

const COLLECTION = 'suppliers';

export async function crearProveedor(data: Omit<Supplier, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date(),
    products: data.products || []
  });
  return docRef.id;
}

export async function obtenerProveedores(): Promise<Supplier[]> {
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Supplier[];
}

export async function actualizarProveedor(id: string, data: Partial<Supplier>) {
  return updateDoc(doc(db, COLLECTION, id), data);
}

export async function eliminarProveedor(id: string) {
  return deleteDoc(doc(db, COLLECTION, id));
}
