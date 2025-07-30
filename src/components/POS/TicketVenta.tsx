import React, { forwardRef } from 'react';


interface TicketVentaProps {
  venta: {
    receiptNumber: string;
    cashierName: string;
    customerName?: string;
    paymentMethod: string;
    date: string;
    items: { productName: string; quantity: number; unitPrice: number }[];
    subtotal: number;
    discount: number;
    igv: number;
    total: number;
  };
}

// Componente imprimible (forwardRef para react-to-print)
const TicketVenta = forwardRef<HTMLDivElement, TicketVentaProps>(({ venta }, ref) => {
  // Leer datos de la tienda desde localStorage
  let storeInfo = { businessName: 'BODEGA APP', ruc: '12345678901', address: 'Av. Principal 123 - Lima' };
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('storeInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        storeInfo = {
          businessName: parsed.businessName || storeInfo.businessName,
          ruc: parsed.ruc || storeInfo.ruc,
          address: parsed.address || storeInfo.address,
        };
      } catch {}
    }
  }
  return (
    <div ref={ref} id="ticket-pdf-capture" style={{ width: '58mm', minHeight: 'auto', fontFamily: 'Arial, sans-serif', fontSize: '12px', padding: 0, margin: '0 auto', background: 'white' }} className="ticket-pdf-safe">
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>{storeInfo.businessName}</div>
      <div className="text-xs" style={{ fontSize: '10px' }}>RUC: {storeInfo.ruc}</div>
      <div className="text-xs" style={{ fontSize: '10px' }}>{storeInfo.address}</div>
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>BOLETA DE VENTA</div>
      <div className="text-xs" style={{ fontSize: '10px' }}>N°: <b>{venta.receiptNumber}</b></div>
      <div className="flex justify-between mb-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px', maxWidth: '100%' }}>
        <span>Cajero:</span>
        <span>{venta.cashierName}</span>
      </div>
      {venta.customerName && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span>Cliente:</span>
          <span>{venta.customerName}</span>
        </div>
      )}
      <div className="flex justify-between mb-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px', maxWidth: '100%' }}>
        <span>Fecha:</span>
        <span>{venta.date}</span>
      </div>
      <div className="flex justify-between mb-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px', maxWidth: '100%' }}>
        <span>Pago:</span>
        <span>{venta.paymentMethod}</span>
      </div>
      <hr className="my-2" />
      <table className="w-full" style={{ borderSpacing: 0, fontSize: '10px' }}>
  <thead>
    <tr>
      <th className="text-left font-semibold pb-1 border-b border-gray-300">Cant</th>
      <th className="text-left font-semibold pb-1 border-b border-gray-300">Descripción</th>
      <th className="text-right font-semibold pb-1 border-b border-gray-300">P. Unit</th>
      <th className="text-right font-semibold pb-1 border-b border-gray-300">Importe</th>
    </tr>
  </thead>
  <tbody>
    {venta.items.map((item, idx) => (
      <tr key={idx}>
        <td className="align-top pr-2" style={{ width: 30 }}>{item.quantity}</td>
        <td className="align-top" style={{ maxWidth: 120, wordBreak: 'break-all', paddingRight: 2 }}>{item.productName}</td>
        <td className="align-top text-right pr-2" style={{ width: 45 }}>S/. {item.unitPrice.toFixed(2)}</td>
        <td className="align-top text-right" style={{ width: 55 }}>S/. {(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    ))}
  </tbody>
</table>
      <hr className="my-2" />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', margin: 0 }}>
  <span>Subtotal:</span>
  <span>S/. {venta.subtotal.toFixed(2)}</span>
</div>
      {venta.discount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', margin: 0 }}>
  <span>Descuento:</span>
  <span>- S/. {venta.discount.toFixed(2)}</span>
</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', margin: 0 }}>
  <span>IGV:</span>
  <span>S/. {venta.igv.toFixed(2)}</span>
</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', margin: 0, fontWeight: 'bold', fontSize: '1rem', marginTop: 4 }}>
  <span>Total:</span>
  <span>S/. {venta.total.toFixed(2)}</span>
</div>
      <div style={{ textAlign: 'center', fontSize: '10px', marginTop: 8 }}>¡Gracias por su compra!</div>
    </div>
  );
});

TicketVenta.displayName = 'TicketVenta';
export default TicketVenta;

// --- PDF EXPORT UTIL ---
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportTicketToPDF = async () => {
  const input = document.getElementById('ticket-pdf-capture');
  if (!input) return;
  const canvas = await html2canvas(input, { useCORS: true, backgroundColor: null });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save('ticket.pdf');
};

