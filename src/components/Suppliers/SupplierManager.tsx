'use client';
import React, { useEffect, useState } from 'react';
import {
  crearProveedor,
  obtenerProveedores,
  actualizarProveedor,
  eliminarProveedor
} from '../../lib/firestoreSuppliers';
import type { Supplier } from '../../types/index';

const initialForm: Partial<Supplier> = {
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  products: [],
};

const SupplierManager: React.FC = () => {
  const [proveedores, setProveedores] = useState<Supplier[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (e) {
      setError('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editId) {
        await actualizarProveedor(editId, form);
        setSuccess('Proveedor actualizado');
      } else {
        // Validar campos requeridos
      const { name, contact, phone, address } = form;
      if (!name || !contact || !phone || !address) {
        setError('Completa todos los campos obligatorios');
        setLoading(false);
        return;
      }
      // Construir objeto limpio sin id
      const proveedorNuevo = {
        name,
        contact,
        phone,
        address,
        email: form.email || '',
        products: [],
        createdAt: new Date(),
      };
      console.log('Proveedor a guardar:', proveedorNuevo);
      await crearProveedor(proveedorNuevo);
        setSuccess('Proveedor creado');
      }
      setModalOpen(false);
      setForm(initialForm);
      setEditId(null);
      fetchProveedores();
    } catch (e) {
      setError('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (proveedor: Supplier) => {
    setForm(proveedor);
    setEditId(proveedor.id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar proveedor?')) return;
    setLoading(true);
    try {
      await eliminarProveedor(id);
      setSuccess('Proveedor eliminado');
      fetchProveedores();
    } catch (e) {
      setError('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Proveedores</h2>
        <button
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
          onClick={() => { setModalOpen(true); setForm(initialForm); setEditId(null); }}
        >
          Nuevo Proveedor
        </button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 text-center">Nombre</th>
            <th className="py-2 px-3 text-center">Contacto</th>
            <th className="py-2 px-3 text-center">Teléfono</th>
            <th className="py-2 px-3 text-center">Email</th>
            <th className="py-2 px-3 text-center">Dirección</th>
            <th className="py-2 px-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map(p => (
            <tr key={p.id} className="border-t">
              <td className="py-2 px-3 text-center">{p.name}</td>
              <td className="py-2 px-3 text-center">{p.contact}</td>
              <td className="py-2 px-3 text-center">{p.phone}</td>
              <td className="py-2 px-3 text-center">{p.email}</td>
              <td className="py-2 px-3 text-center">{p.address}</td>
              <td className="py-2 px-3 text-center space-x-2">
                <button className="text-blue-600" onClick={() => handleEdit(p)}>Editar</button>
                <button className="text-red-600" onClick={() => handleDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-2">
            <h3 className="text-lg font-semibold mb-4">{editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Nombre"
                value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Contacto"
                value={form.contact || ''}
                onChange={e => setForm({ ...form, contact: e.target.value })}
                required
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Teléfono"
                value={form.phone || ''}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Email"
                type="email"
                value={form.email || ''}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Dirección"
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                  onClick={() => { setModalOpen(false); setForm(initialForm); setEditId(null); }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;
