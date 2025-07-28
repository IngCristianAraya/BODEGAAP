import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TicketVenta from '../POS/TicketVenta';
import ReportsMenu from './ReportsMenu';
import InventoryMovementsReport from './InventoryMovementsReport';
import { obtenerClientes } from '../../lib/firestoreCustomers';
import { obtenerProveedores } from '../../lib/firestoreSuppliers';
import { obtenerVentas } from '../../lib/firestoreSales';
import { obtenerProductos } from '../../lib/firestoreProducts';
import { useAuth } from '../../contexts/AuthContext';
import { Sale, Product, SaleItem } from '../../types/index';


const Reports: React.FC = () => {
  const [showTicketModal, setShowTicketModal] = React.useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = React.useState<Sale | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [reportType, setReportType] = useState<'ventas' | 'inventario' | 'ganancias' | 'movimientos'>('ventas');
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [productos, setProductos] = useState<Product[]>([]);
  const [ventasPage, setVentasPage] = useState(1);
  const [inventarioPage, setInventarioPage] = useState(1);
  const VENTAS_POR_PAGINA = 10;
  const INVENTARIO_POR_PAGINA = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Carga ventas y productos para reportes de ventas y ganancias
  async function cargarVentasYProductos() {
    setLoading(true);
    setError(null);
    try {
      const [ventasData, productosData] = await Promise.all([
        obtenerVentas(),
        obtenerProductos()
      ]);
      setVentas(ventasData);
      setProductos(productosData);
    } catch (err) {
      setError('Error al cargar ventas/productos');
    } finally {
      setLoading(false);
    }
  }

  // Carga productos para reporte de inventario
  async function cargarProductos() {
    setLoading(true);
    setError(null);
    try {
      const productosData = await obtenerProductos();
      setProductos(productosData);
    } catch (err) {
      setError('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
  }, [user]);

  useEffect(() => {
    setError(null);
    setLoading(true);
    if (reportType === 'ventas' || reportType === 'ganancias') {
      cargarVentasYProductos();
    } else if (reportType === 'inventario') {
      cargarProductos();
    }
  }, [reportType]);

  useEffect(() => {
    setVentasPage(1);
    setInventarioPage(1);
  }, [reportType]);

  // Utilidades para exportar CSV y PDF con formato limpio y profesional
  function toCSV(rows: any[], headers: { key: string, label: string, format?: (val: any, row: any) => string }[]): string {
    // Cabeceras legibles
    const headerRow = headers.map(h => h.label).join(';');
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    return [
      headerRow,
      ...rows.map(row => headers.map(h => {
        let value = row[h.key];
        if (h.format) value = h.format(value, row);
        // Limpia null/undefined/NaN
        if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) value = '';
        return escape(value);
      }).join(';'))
    ].join('\n');
  }

  // Exportar a PDF usando jsPDF/autotable
  function exportPDF({
    rows,
    headers,
    title = '',
    filename = 'reporte.pdf',
  }: {
    rows: any[],
    headers: { key: string, label: string, format?: (val: any, row: any) => string }[],
    title?: string,
    filename?: string,
  }) {
    const doc = new jsPDF();
    if (title) {
      doc.setFontSize(15);
      doc.text(title, 14, 16);
    }
    autoTable(doc, {
      head: [headers.map(h => h.label)],
      body: rows.map(row => headers.map(h => {
        let value = row[h.key];
        if (h.format) value = h.format(value, row);
        if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) value = '';
        return String(value);
      })),
      startY: title ? 22 : 10,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 10, right: 10 },
    });
    doc.save(filename);
  }

  const ventasHeaders = [
    { key: 'receiptNumber', label: 'N° Boleta' },
    { key: 'createdAt', label: 'Fecha', format: (val: any) => {
      if (!val) return '-';
      if (typeof val === 'object' && val !== null && 'seconds' in val) {
        const d = new Date(val.seconds * 1000);
        return d.toLocaleDateString();
      }
      if (val instanceof Date) return val.toLocaleDateString();
      return String(val);
    }},
    { key: 'cashierName', label: 'Cajero' },
    { key: 'customerName', label: 'Cliente' },
    { key: 'total', label: 'Total', format: (val: number) => `S/ ${val.toFixed(2)}` },
    { key: 'paymentMethod', label: 'Método de Pago', format: (val: string) => val === 'cash' ? 'Efectivo' : val },
    { key: 'items', label: 'Detalle', format: (_: unknown, row: Sale) => {
      const arr = Array.isArray(row.items) && row.items.length > 0 ? row.items : [];
      return arr.map((i: SaleItem) => {
        const nombre = i.productName;
        const cantidad = i.quantity;
        const precio = i.unitPrice;
        const subtotal = typeof precio === 'number' ? (precio * cantidad) : '-';
        return `${nombre} x${cantidad} S/.${subtotal}`;
      }).join(', ');
    } },
  ];

  const inventarioHeaders = [
    { key: 'name', label: 'Producto' },
    { key: 'code', label: 'Código' },
    { key: 'category', label: 'Categoría' },
    { key: 'unit', label: 'Unidad' },
    { key: 'stock', label: 'Stock' },
    { key: 'salePrice', label: 'Precio Venta', format: (val: any) => `S/ ${Number(val).toFixed(2)}` },
    { key: 'averageCost', label: 'Costo Promedio', format: (val: any) => `S/ ${Number(val).toFixed(2)}` },
    { key: 'supplier', label: 'Proveedor' },
  ];

  const exportReportCSV = () => {
    let csv = '';
    let filename = '';
    if (reportType === 'ventas') {
      const ventasFiltradas = ventas
        .filter(v => {
          if (!fechaInicio && !fechaFin) return true;
          let fecha = null;
          if (v.createdAt instanceof Date) fecha = v.createdAt;
          else if (v.createdAt && typeof v.createdAt === 'object' && v.createdAt !== null && 'seconds' in v.createdAt && typeof (v.createdAt as any).seconds === 'number') fecha = new Date((v.createdAt as any).seconds * 1000);
          else if (typeof v.createdAt === 'string') fecha = new Date(v.createdAt);
          if (!fecha || isNaN(fecha.getTime())) return false;
          if (fechaInicio && fecha < new Date(fechaInicio + 'T00:00:00')) return false;
          if (fechaFin && fecha > new Date(fechaFin + 'T23:59:59')) return false;
          return true;
        })
        .sort((a, b) => {
          const nA = Number(a.receiptNumber);
          const nB = Number(b.receiptNumber);
          if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
          return String(b.receiptNumber).localeCompare(String(a.receiptNumber));
        });
      csv = toCSV(ventasFiltradas, ventasHeaders);
      filename = 'ventas.csv';
    } else if (reportType === 'inventario') {
      csv = toCSV(productos, inventarioHeaders);
      filename = 'inventario.csv';
    } else {
      alert('Descarga CSV solo disponible para ventas e inventario');
      return;
    }
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReportPDF = () => {
    let filename = '';
    let headers: any[] = [];
    let rows: any[] = [];
    let title = '';
    if (reportType === 'ventas') {
      filename = 'ventas.pdf';
      headers = ventasHeaders;
      rows = ventas
        .filter(v => {
          if (!fechaInicio && !fechaFin) return true;
          let fecha = null;
          if (v.createdAt instanceof Date) fecha = v.createdAt;
          else if (v.createdAt && typeof v.createdAt === 'object' && v.createdAt !== null && 'seconds' in v.createdAt && typeof (v.createdAt as any).seconds === 'number') fecha = new Date((v.createdAt as any).seconds * 1000);
          else if (typeof v.createdAt === 'string') fecha = new Date(v.createdAt);
          if (!fecha || isNaN(fecha.getTime())) return false;
          if (fechaInicio && fecha < new Date(fechaInicio + 'T00:00:00')) return false;
          if (fechaFin && fecha > new Date(fechaFin + 'T23:59:59')) return false;
          return true;
        })
        .sort((a, b) => {
          // Ordenar por número de boleta descendente (mayor primero)
          const nA = Number(a.receiptNumber);
          const nB = Number(b.receiptNumber);
          if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
          return String(b.receiptNumber).localeCompare(String(a.receiptNumber));
        });
      title = 'Reporte de Ventas';
    } else if (reportType === 'inventario') {
      filename = 'inventario.pdf';
      headers = inventarioHeaders;
      rows = productos;
      title = 'Reporte de Inventario';
    } else {
      alert('Descarga PDF solo disponible para ventas e inventario');
      return;
    }
    exportPDF({ rows, headers, title, filename });
  };

  const handlePageChange = (type: 'ventas' | 'inventario', page: number) => {
    if (type === 'ventas') {
      setVentasPage(page);
    } else {
      setInventarioPage(page);
    }
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
        {(reportType === 'ventas' || reportType === 'inventario') && (
          <div className="flex justify-end gap-2">
            <button
              onClick={exportReportCSV}
              className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M16 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-5 8V7m0 8 3-3m-3 3-3-3m8-8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z"/></svg>
              Descargar CSV
            </button>
            <button
              onClick={exportReportPDF}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17v-6m0 6 3-3m-3 3-3-3m8-8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z"/></svg>
              Descargar PDF
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <ReportsMenu onSelect={t => setReportType(t as any)} />
      </div>
      {/* MODAL DE TICKET - Render condicional al final para evitar superposición */}
      {showTicketModal && ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-2 relative flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold text-lg text-emerald-700">Ticket de Venta</span>
              <button onClick={() => setShowTicketModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]" id="ticket-modal-content">
              <div className="flex justify-center">
                <div ref={ticketRef} className="bg-white p-2 rounded">
                  <TicketVenta venta={mapVentaToTicket(ventaSeleccionada)} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-4 border-t">
              <div className="flex gap-2 mb-2 justify-center">
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    if (!ticketRef.current) return;
                    const printContents = ticketRef.current.innerHTML;
                    const win = window.open('', '', 'width=400,height=600');
                    if (win) {
                      win.document.write('<html><head><title>Imprimir Ticket</title><style>body{margin:0;font-family:sans-serif;}@media print{body{background:transparent;}}</style></head><body>' + printContents + '</body></html>');
                      win.document.close();
                      win.focus();
                      setTimeout(() => {
                        win.print();
                        win.close();
                      }, 500);
                    }
                  }}
                  title="Imprimir Ticket"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M7 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2M7 17h10"/></svg>
                  Imprimir
                </button>
              </div>
              <button
  className="w-full mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
  onClick={() => setShowTicketModal(false)}
>
  Cancelar
</button>
            </div>
          </div>
        </div>
      )}

      {(reportType === 'ventas' || reportType === 'ganancias') && (
        <div className="flex gap-2 items-end mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border px-2 py-1 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border px-2 py-1 rounded text-sm" />
          </div>
        </div>
      )}
      {reportType === 'ventas' && (
        <div>
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900 text-sm">
                <th className="py-3 px-4 text-center font-semibold">N° Boleta</th>
                <th className="py-3 px-4 text-center font-semibold">Fecha</th>
                <th className="py-3 px-4 text-center font-semibold">Cajero</th>
                <th className="py-3 px-4 text-left font-semibold">Detalle</th>
                <th className="py-3 px-4 text-right font-semibold">Total</th>
                <th className="py-3 px-4 text-center font-semibold">Método Pago</th>
        <th className="py-3 px-4 text-center font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {ventas
                .filter(v => {
                  if (!fechaInicio && !fechaFin) return true;
                  let fecha = null;
                  if (v.createdAt instanceof Date) fecha = v.createdAt;
                  else if (v.createdAt && typeof v.createdAt === 'object' && v.createdAt !== null && 'seconds' in v.createdAt && typeof (v.createdAt as any).seconds === 'number') fecha = new Date((v.createdAt as any).seconds * 1000);
                  else if (typeof v.createdAt === 'string') fecha = new Date(v.createdAt);
                  if (!fecha || isNaN(fecha.getTime())) return false;
                  if (fechaInicio && fecha < new Date(fechaInicio + 'T00:00:00')) return false;
                  if (fechaFin && fecha > new Date(fechaFin + 'T23:59:59')) return false;
                  return true;
                })
                .sort((a, b) => {
                  // Ordenar receiptNumber numérico descendente
                  const nA = Number(a.receiptNumber);
                  const nB = Number(b.receiptNumber);
                  if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
                  return String(b.receiptNumber).localeCompare(String(a.receiptNumber));
                })
                .slice((ventasPage - 1) * VENTAS_POR_PAGINA, ventasPage * VENTAS_POR_PAGINA)
                .map((v, idx) => {
                  const arr = Array.isArray(v.items) && v.items.length > 0 ? v.items : [];
                  return (
                    <tr key={v.id || idx} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-4 text-center">{v.receiptNumber || '-'}</td>
                      <td className="py-2 px-4 text-center">{v.createdAt
  ? (typeof v.createdAt === 'object' && v.createdAt !== null && 'seconds' in v.createdAt && typeof (v.createdAt as { seconds?: unknown }).seconds === 'number'
      ? new Date((v.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString()
      : new Date(v.createdAt as string | number | Date).toLocaleDateString())
  : '-'}</td>
                      <td className="py-2 px-4 text-center">{v.cashierName || '-'}</td>
                      <td className="py-2 px-4">
                        <ul className="list-disc ml-4">
                          {arr.map((i: any, idx2: number) => {
                            const nombre = i.name || i.productName || '';
                            const cantidad = i.quantity || 1;
                            const precio = typeof i.salePrice === 'number' ? i.salePrice : (typeof i.price === 'number' ? i.price : null);
                            const subtotal = precio !== null ? (precio * cantidad) : null;
                            return (
                              <li key={idx2}>
                                {nombre}{cantidad > 1 ? ` x${cantidad}` : ''}
                                {precio !== null ? ` (S/ ${precio.toFixed(2)} c/u)` : ' (S/ - c/u)'}
                                {subtotal !== null ? ` Subtotal: S/ ${subtotal.toFixed(2)}` : ''}
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                      <td className="py-2 px-4 text-right text-gray-800 font-semibold">S/ {v.total?.toFixed(2)}</td>
                      <td className="py-2 px-4 text-center">{v.paymentMethod === 'cash' ? 'Efectivo' : v.paymentMethod}</td>
                      <td className="py-2 px-4 text-center">
                        <button
                          className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600"
                          onClick={() => {
                            setVentaSeleccionada(v);
                            setShowTicketModal(true);
                          }}
                        >
                          Ver/Reimprimir Ticket
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={4} className="py-2 px-4 text-right">Total ventas:</td>
                <td className="py-2 px-4 text-right">S/ {
  ventas
    .filter(v => {
      if (!fechaInicio && !fechaFin) return true;
      let fecha = null;
      if (v.createdAt instanceof Date) fecha = v.createdAt;
      else if (v.createdAt && typeof v.createdAt === 'object' && v.createdAt !== null && 'seconds' in v.createdAt && typeof (v.createdAt as any).seconds === 'number') fecha = new Date((v.createdAt as any).seconds * 1000);
      else if (typeof v.createdAt === 'string') fecha = new Date(v.createdAt);
      if (!fecha || isNaN(fecha.getTime())) return false;
      if (fechaInicio && fecha < new Date(fechaInicio + 'T00:00:00')) return false;
      if (fechaFin && fecha > new Date(fechaFin + 'T23:59:59')) return false;
      return true;
    })
    .sort((a, b) => {
      // Ordenar por número de boleta descendente (mayor primero)
      const nA = Number(a.receiptNumber);
      const nB = Number(b.receiptNumber);
      if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
      return String(b.receiptNumber).localeCompare(String(a.receiptNumber));
    })
    .slice((ventasPage - 1) * VENTAS_POR_PAGINA, ventasPage * VENTAS_POR_PAGINA)
    .reduce((acc,v) => acc + (v.total || 0), 0)
    .toFixed(2)
}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handlePageChange('ventas', ventasPage - 1)}
              disabled={ventasPage === 1}
              className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Anterior
            </button>
            <span>Página {ventasPage} de {Math.ceil(ventas.length / VENTAS_POR_PAGINA)}</span>
            <button
              onClick={() => handlePageChange('ventas', ventasPage + 1)}
              disabled={ventasPage === Math.ceil(ventas.length / VENTAS_POR_PAGINA)}
              className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      {reportType === 'inventario' && (
        <div>
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900 text-sm">
                <th className="py-3 px-4 text-center font-semibold">Código</th>
                <th className="py-3 px-4 text-center font-semibold">Producto</th>
                <th className="py-3 px-4 text-center font-semibold">Stock</th>
                <th className="py-3 px-4 text-right font-semibold">Precio Venta</th>
                <th className="py-3 px-4 text-right font-semibold">Costo Promedio</th>
                <th className="py-3 px-4 text-center font-semibold">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {productos.slice((inventarioPage-1)*INVENTARIO_POR_PAGINA, inventarioPage*INVENTARIO_POR_PAGINA).map((p, i) => (
                <tr key={i} className={`border-t transition-colors ${i%2===0 ? 'bg-white' : 'bg-gray-50'} hover:bg-emerald-100/40`}>
                  <td className="py-2 px-4 font-mono text-xs text-gray-700">{p.code}</td>
                  <td className="py-2 px-4 font-medium text-gray-900">{p.name}</td>
                  <td className="py-2 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${p.stock <= (p.minStock ?? 0) ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>{p.stock}</span>
                  </td>
                  <td className="py-2 px-4 text-right text-gray-800 font-semibold">S/ {p.salePrice?.toFixed(2)}</td>
                  <td className="py-2 px-4 text-right text-gray-600">S/ {p.averageCost?.toFixed(2)}</td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">{p.supplier || 'Sin proveedor'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={2} className="py-2 px-4 text-right">Stock total:</td>
                <td className="py-2 px-4 text-center">{productos.slice((inventarioPage-1)*INVENTARIO_POR_PAGINA, inventarioPage*INVENTARIO_POR_PAGINA).reduce((acc,p) => acc + (p.stock || 0), 0)}</td>
                <td className="py-2 px-4 text-right">Valor total stock:</td>
                <td className="py-2 px-4 text-right">S/ {productos.slice((inventarioPage-1)*INVENTARIO_POR_PAGINA, inventarioPage*INVENTARIO_POR_PAGINA).reduce((acc,p) => acc + ((p.stock || 0) * (p.averageCost || 0)), 0).toFixed(2)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handlePageChange('inventario', inventarioPage - 1)}
              disabled={inventarioPage === 1}
              className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Anterior
            </button>
            <span>Página {inventarioPage} de {Math.ceil(productos.length / INVENTARIO_POR_PAGINA)}</span>
            <button
              onClick={() => handlePageChange('inventario', inventarioPage + 1)}
              disabled={inventarioPage === Math.ceil(productos.length / INVENTARIO_POR_PAGINA)}
              className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      {reportType === 'ganancias' && !loading && ventas.length > 0 && (
        <div>
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-sm mb-4">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900 text-sm">
                <th className="py-3 px-4 text-center font-semibold">Fecha</th>
                <th className="py-3 px-4 text-right font-semibold">Ventas Totales</th>
                <th className="py-3 px-4 text-right font-semibold">Costo Total</th>
                <th className="py-3 px-4 text-right font-semibold">Ganancia Total</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Agrupar ventas por fecha exacta
                const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
                const resumen: {[fecha: string]: {label: string, ventas: number, costo: number, ganancia: number}} = {};
                ventas.filter(v => {
                  if (!fechaInicio && !fechaFin) return true;
                  let fecha = null;
                  if (v.createdAt instanceof Date) fecha = v.createdAt;
                  else if (v.createdAt && typeof v.createdAt === 'object' && v.createdAt !== null && 'seconds' in v.createdAt && typeof (v.createdAt as any).seconds === 'number') fecha = new Date((v.createdAt as any).seconds * 1000);
                  else if (typeof v.createdAt === 'string') fecha = new Date(v.createdAt);
                  if (!fecha || isNaN(fecha.getTime())) return false;
                  if (fechaInicio && fecha < new Date(fechaInicio + 'T00:00:00')) return false;
                  if (fechaFin && fecha > new Date(fechaFin + 'T23:59:59')) return false;
                  return true;
                }).forEach(v => {
                  let fecha = null;
                  if (v.createdAt instanceof Date) fecha = v.createdAt;
                  else if (v.createdAt && typeof v.createdAt === 'object' && v.createdAt !== null && 'seconds' in v.createdAt && typeof (v.createdAt as any).seconds === 'number') fecha = new Date((v.createdAt as any).seconds * 1000);
                  else if (typeof v.createdAt === 'string') fecha = new Date(v.createdAt);
                  if (!fecha || isNaN(fecha.getTime())) return;
                  // Agrupa por fecha exacta (yyyy-mm-dd, ignorando hora)
                  const year = fecha.getFullYear();
                  const month = (fecha.getMonth()+1).toString().padStart(2,'0');
                  const day = fecha.getDate().toString().padStart(2,'0');
                  const key = `${year}-${month}-${day}`;
                  const label = `${dias[fecha.getDay()]} ${day}/${month}`;
                  if (!resumen[key]) resumen[key] = {label, ventas: 0, costo: 0, ganancia: 0};
                  resumen[key].ventas += v.total || 0;
                  // Calcular costo y ganancia por venta
                  let costoVenta = 0;
                  let gananciaVenta = 0;
                  (Array.isArray(v.items) && v.items.length > 0 ? v.items : []).forEach((item: any) => {
                    const cantidad = item.quantity || 1;
                    const precio = typeof item.salePrice === 'number' ? item.salePrice : (typeof item.price === 'number' ? item.price : 0);
                    const producto = productos.find((p: any) => p.id === item.productId);
                    const costoUnit = producto?.costPrice ?? producto?.averageCost ?? 0;
                    const costo = cantidad * costoUnit;
                    const subtotal = cantidad * precio;
                    costoVenta += costo;
                    gananciaVenta += subtotal - costo;
                  });
                  resumen[key].costo += costoVenta;
                  resumen[key].ganancia += gananciaVenta;
                });
                // Mostrar fechas ordenadas descendente (más reciente primero)
                return Object.entries(resumen)
                  .sort((a,b) => b[0].localeCompare(a[0]))
                  .map(([key, data]) => (
                    <tr key={key}>
                      <td className="py-2 px-4 text-center font-medium">{data.label}</td>
                      <td className="py-2 px-4 text-right">S/ {data.ventas.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">S/ {data.costo.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right font-semibold">S/ {data.ganancia.toFixed(2)}</td>
                    </tr>
                  ));
              })()}

            </tbody>
          </table>
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <div>* <b>Ventas Totales</b>: suma de todos los montos cobrados ese día por ventas realizadas.</div>
            <div>* <b>Costo Total</b>: suma del costo de compra de los productos vendidos ese día (según el costo registrado en inventario).</div>
            <div>* <b>Ganancia Total</b>: diferencia entre ventas totales y costo total. Es lo que realmente ganó tu negocio ese día antes de otros gastos.</div>
          </div>
        </div>
      )}
      {reportType === 'movimientos' && (
        <InventoryMovementsReport />
      )}
    </div>
  );
};

// Adapta la venta seleccionada a la estructura esperada por TicketVenta
function mapVentaToTicket(venta: any) {
  // Asegura compatibilidad de campos y formatos
  const items = (Array.isArray(venta.items) ? venta.items : []).map((i: any) => ({
    productName: i.name || i.productName || '',
    quantity: i.quantity || 1,
    unitPrice: typeof i.salePrice === 'number' ? i.salePrice : (typeof i.price === 'number' ? i.price : 0),
  }));
  return {
    receiptNumber: venta.receiptNumber || '-',
    cashierName: venta.cashierName || '-',
    customerName: venta.customerName || '',
    paymentMethod: venta.paymentMethod === 'cash' ? 'Efectivo' : venta.paymentMethod || '-',
    date: venta.createdAt ? (typeof venta.createdAt === 'object' && 'seconds' in venta.createdAt ? new Date(venta.createdAt.seconds * 1000).toLocaleDateString() : new Date(venta.createdAt).toLocaleDateString()) : '-',
    items,
    subtotal: typeof venta.subtotal === 'number' ? venta.subtotal : (typeof venta.total === 'number' && typeof venta.igv === 'number' ? venta.total - (venta.igv || 0) + (venta.discount || 0) : 0),
    discount: typeof venta.discount === 'number' ? venta.discount : 0,
    igv: typeof venta.igv === 'number' ? venta.igv : 0,
    total: typeof venta.total === 'number' ? venta.total : 0,
  };
}

export default Reports;