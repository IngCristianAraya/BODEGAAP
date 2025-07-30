

import JSZip from 'jszip';

function arrayToCSV(arr: any[]): string {
  if (!arr.length) return '';
  const keys = Object.keys(arr[0]);
  const header = keys.join(';');
  const rows = arr.map(obj => keys.map(k => (obj[k] ?? '').toString().replace(/\r?\n|\r/g, ' ')).join(';'));
  return [header, ...rows].join('\r\n');
}

export async function exportDataToCSV<T>(data: T[], filename: string) {
  const zip = new JSZip();
  zip.file(`${filename}.csv`, arrayToCSV(data));
  return zip.generateAsync({ type: 'blob' });
}

// Exporta todos los datos principales de la app (productos, ventas, clientes, proveedores) en un ZIP con un CSV por entidad
import { obtenerProductos } from './firestoreProducts';
import { obtenerVentas } from './firestoreSales';
import { obtenerClientes } from './firestoreCustomers';
import { obtenerProveedores } from './firestoreSuppliers';

export async function exportAllDataToCSV(): Promise<Blob> {
  const zip = new JSZip();
  const [productos, ventas, clientes, proveedores] = await Promise.all([
    obtenerProductos(),
    obtenerVentas(),
    obtenerClientes(),
    obtenerProveedores()
  ]);
  zip.file('productos.csv', arrayToCSV(productos));
  zip.file('ventas.csv', arrayToCSV(ventas));
  zip.file('clientes.csv', arrayToCSV(clientes));
  zip.file('proveedores.csv', arrayToCSV(proveedores));
  return zip.generateAsync({ type: 'blob' });
}

