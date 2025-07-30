import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// Inicializa Firebase Admin solo una vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export interface AjustarStockBody {
  productId: string;
  newStock: number;
  motivo: string;
  user: string;
  prevStock: number;
  date: string;
}

export async function POST(req: NextRequest) {
  try {
    const { productId, newStock, motivo, user, prevStock, date }: AjustarStockBody = await req.json();
    if (!productId || typeof newStock !== 'number' || !motivo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Actualiza el stock del producto
    const productRef = db.collection('products').doc(productId);
    await productRef.update({ stock: newStock, updatedAt: new Date(date) });

    // Registra el movimiento de ajuste
    await db.collection('inventory_movements').add({
      productId,
      type: 'ajuste',
      quantity: newStock - prevStock, // Registra la diferencia real
      prevStock,
      motivo,
      user,
      date: new Date(date),
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('Error al ajustar stock:', e);
    let errorMsg = 'Error en el servidor';
    if (typeof e === 'object' && e !== null && 'message' in e) {
      errorMsg = String((e as { message?: string }).message) || errorMsg;
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
