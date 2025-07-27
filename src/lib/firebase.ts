import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // These will be configured by the user
  apiKey: "AIzaSyCg3CF3PxO-JJTxe0mnVIPnxwLkxIGWrRA",
  authDomain: "bodegaap-98cf2.firebaseapp.com",
  projectId: "bodegaap-98cf2",
  storageBucket: "bodegaap-98cf2.firebasestorage.app",
  messagingSenderId: "533912009346",
  appId: "1:533912009346:web:c41ef2c83ec879f1afd29b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);



export const storage = getStorage(app);
export default app;