import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface StoreInfo {
  businessName: string;
  ruc: string;
  address: string;
}

// Guarda los datos de la tienda para el UID del usuario actual
export async function saveStoreInfo(uid: string, info: StoreInfo) {
  await setDoc(doc(db, 'settings', uid), info, { merge: true });
}

// Obtiene los datos de la tienda para el UID del usuario actual
export async function getStoreInfo(uid: string): Promise<StoreInfo | null> {
  const snap = await getDoc(doc(db, 'settings', uid));
  if (snap.exists()) {
    return snap.data() as StoreInfo;
  }
  return null;
}
