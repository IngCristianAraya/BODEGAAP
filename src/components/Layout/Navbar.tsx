import React from 'react';
import { Home, ShoppingCart, Package, Truck, BarChart3, Settings, LogOut, CircleAlert } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'lowstock', label: 'Bajo Stock', icon: CircleAlert },
  { id: 'suppliers', label: 'Proveedores', icon: Truck },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
  { id: 'settings', label: 'Configuración', icon: Settings }
];

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange, onLogout }) => {
  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="w-full px-4 flex items-center justify-between h-16">
        <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">Bodegapp</span>
        <div className="flex-1 flex justify-center">
          <ul className="flex items-center space-x-14">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={
                      `group flex items-center px-2 py-2 rounded-md transition-colors text-sm font-medium space-x-1 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ` +
                      (currentPage === item.id
                        ? 'bg-emerald-100 text-emerald-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100')
                    }
                  >
                    <Icon size={18} />
                    <span
  className={
    `relative transition-colors duration-200 ` +
    (currentPage === item.id
      ? 'text-emerald-700 font-semibold'
      : '')
  }
>
  {item.label}
  <span
    className={
      `absolute left-0 -bottom-1 w-full h-0.5 rounded bg-emerald-500 transition-all duration-200 ` +
      ((currentPage === item.id)
        ? 'opacity-100 scale-x-100'
        : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100')
    }
    aria-hidden="true"
  />
</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 text-sm"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
