import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Configuración de Firebase (ajusta estos valores si usas emulador o producción)
const firebaseConfig = {
  apiKey: "AIzaSyCg3CF3PxO-JJTxe0mnVIPnxwLkxIGWrRA",
  authDomain: "bodegaap-98cf2.firebaseapp.com",
  projectId: "bodegaap-98cf2",
  storageBucket: "bodegaap-98cf2.firebasestorage.app",
  messagingSenderId: "533912009346",
  appId: "1:533912009346:web:c41ef2c83ec879f1afd29b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Si usas emulador local, descomenta la siguiente línea:
// import { connectFirestoreEmulator } from 'firebase/firestore';
// connectFirestoreEmulator(db, 'localhost', 8080);

async function fixSalePrices() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  let updated = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    // Si el salePrice está ausente o es 0, lo actualizamos
    if (typeof data.salePrice !== 'number' || data.salePrice === 0) {
      // Puedes personalizar el valor por defecto aquí:
      const newPrice = 1.00;
      await updateDoc(doc(db, 'products', docSnap.id), { salePrice: newPrice });
      console.log(`Producto ${data.name || docSnap.id} actualizado a S/. ${newPrice}`);
      updated++;
    }
  }
  console.log(`\nActualización completada. Productos modificados: ${updated}`);
}

fixSalePrices().catch(console.error);
