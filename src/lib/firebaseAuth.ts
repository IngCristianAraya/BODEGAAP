import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function registrarUsuario(email: string, password: string, nombre: string, rol: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    name: nombre,
    role: rol,
    email: email,
    createdAt: Timestamp.now()
  });
  return cred.user;
}

export async function loginUsuario(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUsuario() {
  return await signOut(auth);
}
