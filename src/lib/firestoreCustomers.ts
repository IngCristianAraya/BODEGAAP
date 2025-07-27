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
import type { Customer } from '../types/index';

const COLLECTION = 'customers';

export async function crearCliente(data: Omit<Customer, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date(),
    totalPurchases: 0
  });
  return docRef.id;
}

export async function obtenerClientes(): Promise<Customer[]> {
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Customer[];
}

export async function actualizarCliente(id: string, data: Partial<Customer>) {
  return updateDoc(doc(db, COLLECTION, id), data);
}

export async function eliminarCliente(id: string) {
  return deleteDoc(doc(db, COLLECTION, id));
}
