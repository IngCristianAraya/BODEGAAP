import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import JSZip from 'jszip';

function arrayToCSV(arr: any[]): string {
  if (!arr.length) return '';
  const keys = Object.keys(arr[0]);
  const header = keys.join(';');
  const rows = arr.map(obj => keys.map(k => (obj[k] ?? '').toString().replace(/\r?\n|\r/g, ' ')).join(';'));
  return [header, ...rows].join('\r\n');
}

export async function exportAllDataToZip(uid: string) {
  const zip = new JSZip();
  const entities = [
    { name: 'productos', path: 'products' },
    { name: 'ventas', path: 'sales' },
    { name: 'movimientos_inventario', path: 'inventory_movements' }
  ];
  for (const entity of entities) {
    const snapshot = await getDocs(collection(db, entity.path));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    zip.file(`${entity.name}.csv`, arrayToCSV(data));
  }
  return zip.generateAsync({ type: 'blob' });
}
