import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saveStoreInfo, getStoreInfo } from '../../lib/firestoreSettings';
import { useToast } from '../../contexts/ToastContext';
import HowToUseSystem from './HowToUseSystem';
import ExportDataButton from './ExportDataButton';

// Tipo para los datos de la empresa/tienda
export interface StoreInfo {
  businessName: string;
  ruc: string;
  address: string;
}

// Utiliza localStorage por simplicidad (puedes migrar a Firestore si lo deseas)
const STORAGE_KEY = 'storeInfo';

const Settings: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    businessName: '',
    ruc: '',
    address: '',
  });
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Al montar, intenta cargar primero desde Firestore, luego localStorage
  useEffect(() => {
    const fetchData = async () => {
      if (user && user.uid) {
        try {
          const firestoreInfo = await getStoreInfo(user.uid);
          if (firestoreInfo) {
            setStoreInfo(firestoreInfo);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreInfo));
            setLoading(false);
            return;
          }
        } catch {
          // Si falla Firestore, sigue con localStorage
        }
      }
      // fallback localStorage
      const savedInfo = localStorage.getItem(STORAGE_KEY);
      if (savedInfo) {
        setStoreInfo(JSON.parse(savedInfo));
      }
      setLoading(false);
    };
    fetchData();
    
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeInfo));
    let ok = true;
    if (user && user.uid) {
      try {
        await saveStoreInfo(user.uid, storeInfo);
        showToast('Datos guardados en la nube', 'success');
      } catch {

        showToast('Error al guardar en la nube', 'error');
        ok = false;
      }
    }
    setSaved(true);
    if (ok) showToast('¡Datos guardados!');
  };

  if (loading) {
    return <div className="p-8 text-center text-emerald-700">Cargando datos de la tienda...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow border mt-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-700">Datos de la Tienda / Empresa</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nombre Comercial / Empresa</label>
          <input
            type="text"
            name="businessName"
            value={storeInfo.businessName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">RUC</label>
          <input
            type="text"
            name="ruc"
            value={storeInfo.ruc}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
            pattern="[0-9]{11}"
            title="El RUC debe tener 11 dígitos"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Dirección</label>
          <input
            type="text"
            name="address"
            value={storeInfo.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 font-semibold transition"
        >
          Guardar Datos
        </button>
        {saved && <div className="text-green-600 font-medium mt-2">¡Datos guardados!</div>}
      </form>
      {/* Minisección de ayuda para el usuario */}
      <hr className="my-8" />
      {/* Ayuda interactiva: cómo usar el sistema, con botones de descarga */}
      <HowToUseSystem />
      {/* Botón de backup/exportación */}
      <ExportDataButton />
    </div>
  );
};

export default Settings;
