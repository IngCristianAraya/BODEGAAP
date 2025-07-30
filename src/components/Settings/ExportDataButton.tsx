import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { exportAllDataToCSV } from '../../lib/exportData';

const ExportDataButton: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const blob = await exportAllDataToCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bodegapp-backup.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {

      alert('Error al exportar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold shadow mt-6"
    >
      {loading ? 'Exportando...' : 'Exportar datos'}
    </button>
  );
};

export default ExportDataButton;
