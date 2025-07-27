import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../src/lib/firebase';

async function createUserDoc({ uid, name, email, role = 'admin' }: { uid: string, name: string, email: string, role?: string }) {
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    role,
    createdAt: new Date()
  });
  console.log('Documento creado en /users/' + uid);
}

// USO: Edita estos valores con los datos de tu usuario actual:
const uid = 'xFYbyhOxw3El6HRpbtN3LWur51EB';
const name = 'Admin';
const email = 'admin@empresa1.com';

createUserDoc({ uid, name, email }).then(() => process.exit(0));
