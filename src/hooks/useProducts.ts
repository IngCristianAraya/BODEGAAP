import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types/inventory';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Inferir unitType y ventaPorPeso si no existen (compatibilidad legacy)
        const unitType = data.unitType || (data.unit === 'kg' ? 'kg' : 'unidad');
        const ventaPorPeso = typeof data.ventaPorPeso === 'boolean' ? data.ventaPorPeso : (unitType === 'kg');
        return {
          id: doc.id,
          ...data,
          unitType,
          ventaPorPeso,
          isExonerated: Boolean(data.isExonerated),
          isExemptIGV: Boolean(data.isExemptIGV),
          igvIncluded: data.igvIncluded !== false, // por defecto true
          createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt
        } as Product;
      });
      setProducts(productsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { products, loading };
};