import React, { useState } from 'react';

interface PasswordModalProps {
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

const CONFIG_PATH = '/config.json';

const PasswordModal: React.FC<PasswordModalProps> = ({ actionLabel, onConfirm, onCancel, loading, children }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handlePasswordCheck = async () => {
    setValidating(true);
    setError(null);
    try {
      // Usa localStorage para evitar pedir la clave repetidamente
      const sessionOk = localStorage.getItem('adminPasswordOk');
      if (sessionOk === 'true') {
        onConfirm();
        return;
      }
      // Carga la clave maestra desde config.json
      const res = await fetch(CONFIG_PATH);
      const config = await res.json();
      if (password === config.adminPassword) {
        localStorage.setItem('adminPasswordOk', 'true');
        onConfirm();
      } else {
        setError('Contraseña incorrecta');
      }
    } catch {
      setError('No se pudo validar la contraseña');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center">
        {children}
        <input
          type="password"
          className="mt-4 px-4 py-2 border rounded w-full text-center"
          placeholder="Contraseña de administrador"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={validating || loading}
        />
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onCancel}
            disabled={validating || loading}
          >Cancelar</button>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded"
            onClick={handlePasswordCheck}
            disabled={validating || loading}
          >{validating || loading ? 'Validando...' : actionLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
