import React from 'react';
import type { Product } from '../../types/inventory';
import type { Sale } from '../../types/index';
import { 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  DollarSign,
  Users
} from 'lucide-react';
import StatsCard from './StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { obtenerVentas } from '../../lib/firestoreSales';
import { obtenerProductos } from '../../lib/firestoreProducts';


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = React.useState<Sale[]>([]);
  const [productos, setProductos] = React.useState<Product[]>([]);
  const [topProducts, setTopProducts] = React.useState<{ name: string; sales: number; revenue: number }[]>([]);
  const [loadingTop, setLoadingTop] = React.useState(false);

  // Calcular ventas reales de la semana agrupadas por día
  const salesData = React.useMemo(() => {
    // Inicializar estructura para cada día de la semana
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const hoy = new Date();
    // Buscar el lunes de la semana actual
    const primerDiaSemana = new Date(hoy);
    primerDiaSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7)); // Lunes
    const ventasPorDia: Record<string, number> = {
      'Lun': 0, 'Mar': 0, 'Mie': 0, 'Jue': 0, 'Vie': 0, 'Sab': 0, 'Dom': 0
    };
    ventas.forEach(v => {
      if (!v.createdAt) return;
      const fecha = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
      // Solo ventas de esta semana
      const diff = (fecha.getTime() - primerDiaSemana.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < 0 || diff >= 7) return;
      const dia = dias[fecha.getDay()];
      ventasPorDia[dia] += Number(v.total) || 0;
    });
    // Retornar en orden Lun-Dom
    return ['Lun','Mar','Mie','Jue','Vie','Sab','Dom'].map(dia => ({
      name: dia,
      ventas: ventasPorDia[dia]
    }));
  }, [ventas]);

  // Calcular ventas reales por categoría de la semana actual
  const categoryData = React.useMemo(() => {
    // Colores por categoría (personaliza según tus categorías reales)
    const colorMap: Record<string, string> = {
      'Abarrotes': '#a6f65c', // amarillo
      'Huevos y Lácteos': '#fff94f', // crema
      'Carnes y Embutidos': '#f5112f', // rojo suave
      'Frutas y Verduras': '#75ff4f', // verde
      'Bebidas': '#4fb6ff', // celeste
      'Snacks y Golosinas': '#FDE68A', // amarillo pastel
      'Helados': '#FBCFE8', // rosa pastel
      'Limpieza del Hogar': '#E5E7EB', // gris claro
      'Higiene Personal': '#F5D0FE', // fucsia claro
      'Productos para Mascotas': '#FEF08A', // amarillo intenso
      'Descartables': '#E0E7FF', // azul lavanda
      'Panadería': '#FCD34D', // dorado
      'Repostería': '#FECACA', // rosa suave
      'Congelados': '#A7F3D0', // verde agua
      'Otros': '#DDD6FE', // lila
    };
    // Inicializar acumulador
    const ventasPorCategoria: Record<string, number> = {};
    // Calcular semana actual (lunes a domingo)
    const dias = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const hoy = new Date();
    const primerDiaSemana = new Date(hoy);
    primerDiaSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    ventas.forEach(v => {
      if (!v.createdAt) return;
      const fecha = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
      const diff = (fecha.getTime() - primerDiaSemana.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < 0 || diff >= 7) return;
      (v.items || []).forEach((item: any) => {
        // Buscar el producto para obtener la categoría
        const prod = productos.find((p: any) => p.id === item.productId);
        const cat = prod?.category || 'Otros';
        ventasPorCategoria[cat] = (ventasPorCategoria[cat] || 0) + (typeof item.total === 'number' ? item.total : 0);
      });
    });
    // Formatear para el gráfico
    return Object.entries(ventasPorCategoria).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] || '#8B5CF6',
    }));
  }, [ventas, productos]);

  

React.useEffect(() => {
  if (!user) return;
  setLoadingTop(true);
  Promise.all([
    obtenerVentas(),
    obtenerProductos()
  ]).then(([ventasData, productosData]) => {
    setVentas(ventasData);
    setProductos(productosData);
    // Agrupar ventas por producto
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    ventasData.forEach((venta: any) => {
      (venta.items || []).forEach((item: any) => {
        if (!productSales[item.productId]) {
          const prod = productosData.find((p: any) => p.id === item.productId);
          productSales[item.productId] = {
            name: (prod && typeof prod === 'object' && 'name' in prod && prod.name) ? prod.name : (item.productName || 'Producto'),
            sales: 0,
            revenue: 0
          };
        }
        productSales[item.productId].sales += item.quantity;
        productSales[item.productId].revenue += (typeof item.salePrice === 'number' && typeof item.quantity === 'number') ? (item.salePrice * item.quantity) : 0;
      });
    });
    const top = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    setTopProducts(top);
  }).finally(() => setLoadingTop(false));
}, [user]);

  return (
    <div className="p-6 space-y-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Ventas del Día"
          value={`S/. ${ventas
            .filter(v => {
              if (!v.createdAt) return false;
              const fecha = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
              const hoy = new Date();
              return fecha.getFullYear() === hoy.getFullYear() &&
                fecha.getMonth() === hoy.getMonth() &&
                fecha.getDate() === hoy.getDate();
            })
            .reduce((acc, v) => acc + (Number(v.total) || 0), 0)
            .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          `}
          icon={DollarSign}
          color="bg-emerald-500"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Ganancias del Día"
          value={`S/. ${(() => {
            try {
              // Import dinámico para evitar error SSR
              const { calculateDailyEarnings } = require('../../utils/calculateDailyEarnings');
              const profit = calculateDailyEarnings(ventas, productos);
              return profit.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } catch {
              return '0.00';
            }
          })()}`}
          icon={DollarSign}
          color="bg-yellow-400"
        />
        <StatsCard
          title="Órdenes"
          value={ventas
            .filter(v => {
              if (!v.createdAt) return false;
              const fecha = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
              const hoy = new Date();
              return fecha.getFullYear() === hoy.getFullYear() &&
                fecha.getMonth() === hoy.getMonth() &&
                fecha.getDate() === hoy.getDate();
            }).length.toLocaleString('es-PE')}
          icon={ShoppingCart}
          color="bg-blue-500"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Productos"
          value={productos.length.toLocaleString('es-PE')}
          icon={Package}
          color="bg-purple-500"
        />
        <StatsCard
          title="Stock Bajo"
          value={productos.filter(p => {
            const minStock = typeof p.minStock === 'number' ? p.minStock : 3;
            return typeof p.stock === 'number' && p.stock <= minStock;
          }).length.toLocaleString('es-PE')}
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas de la Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`S/. ${value}`, 'Ventas']} />
              <Bar dataKey="ventas" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Ventas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Ingresos</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{typeof product.name === 'string' ? product.name : 'Producto'}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{product.sales}</td>
                  <td className="py-3 px-4 text-gray-600">S/. {product.revenue}</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${(product.sales / 50) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default Dashboard;