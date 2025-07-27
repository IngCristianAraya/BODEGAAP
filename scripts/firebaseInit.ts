import { collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

// Crear producto demo
async function firebaseInit() {
  // Producto demo
  await addDoc(collection(db, 'products'), {
    name: 'Coca Cola 600ml',
    code: 'CC600',
    category: 'Bebidas',
    stock: 50,
    minStock: 10,
    salePrice: 3.50,
    costPrice: 2.50,
    unit: 'unidad',
    imageUrl: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
    supplier: 'Proveedor S.A.',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  // Configuración global
  await setDoc(doc(db, 'config', 'global'), {
    killMode: false,
    killMessage: 'Sistema en mantenimiento',
    allowedRoles: ['admin']
  });

  // Usuario admin demo (debes poner el UID real de Auth)
  await setDoc(doc(db, 'users', 'UID_ADMIN'), {
    name: 'Admin',
    role: 'admin',
    email: 'admin@email.com',
    createdAt: Timestamp.now()
  });

  // Venta demo
  await addDoc(collection(db, 'sales'), {
    date: Timestamp.now(),
    userId: 'UID_ADMIN',
    products: [
      {
        productId: 'ID_PRODUCTO',
        name: 'Coca Cola 600ml',
        quantity: 2,
        price: 3.50
      }
    ],
    total: 7.00,
    paymentMethod: 'efectivo',
    createdAt: Timestamp.now()
  });

  // Cliente demo
  await addDoc(collection(db, 'clients'), {
    name: 'Juan Pérez',
    phone: '999999999',
    email: 'juan@email.com',
    createdAt: Timestamp.now()
  });

  // Movimiento de caja demo
  await addDoc(collection(db, 'cash_movements'), {
    date: Timestamp.now(),
    type: 'apertura',
    amount: 100.00,
    userId: 'UID_ADMIN',
    description: 'Apertura de caja',
    createdAt: Timestamp.now()
  });
}

// Ejecutar si se llama desde Node (ejemplo: npx ts-node scripts/firebaseInit.ts)
if (require.main === module) {
  firebaseInit().then(() => {
    console.log('Inicialización Firebase completa');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
