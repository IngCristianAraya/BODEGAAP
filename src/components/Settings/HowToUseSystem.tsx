import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const steps = [
  {
    icon: '🏪',
    title: 'Configura tu tienda',
    description: 'Completa el nombre, RUC y dirección en esta sección y guarda los datos. Así tus tickets y reportes tendrán la información correcta.'
  },
  {
    icon: '📦',
    title: 'Agrega productos',
    description: 'Ve a Inventario y haz clic en "Agregar Producto" para cargar tu stock inicial. Puedes editar o eliminar productos cuando lo necesites.'
  },
  {
    icon: '🛒',
    title: 'Realiza una venta',
    description: 'En el POS, selecciona productos, ingresa cantidad y finaliza la venta. El sistema genera el ticket automáticamente.'
  },
  {
    icon: '📊',
    title: 'Consulta reportes y alertas',
    description: 'Revisa el Dashboard y la sección de productos bajo stock para tomar decisiones rápidas y reponer inventario.'
  }
];

const HowToUseSystem: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current);
    const link = document.createElement('a');
    link.download = 'como-usar-bodegapp.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth * 0.95;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', (pageWidth - pdfWidth) / 2, 30, pdfWidth, pdfHeight);
    pdf.save('como-usar-bodegapp.pdf');
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2 text-emerald-800">¿Cómo usar el sistema?</h3>
      <div ref={ref} className="bg-emerald-50 rounded-lg p-4 shadow-md max-w-xl">
        <div className="flex flex-col gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 bg-white rounded-lg shadow border border-emerald-100 p-3"
            >
              <div className="text-3xl select-none" aria-label="icono-paso">{step.icon}</div>
              <div>
                <div className="font-semibold text-emerald-700 text-base mb-1">{step.title}</div>
                <div className="text-gray-700 text-sm">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={() => alert('Próximamente: tutorial en PDF o video')}
          className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition font-semibold shadow"
        >
          Descargar tutorial
        </button>
      </div>
    </div>
  );
};

export default HowToUseSystem;
