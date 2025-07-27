import {
  Package,
  Apple,
  CupSoda,
  Cookie,
  Candy,
  IceCream,
  SprayCan,
  Bath,
  Trash2,
  Snowflake,
} from 'lucide-react';
import React from 'react';

export type CategoryKey =
  | 'Abarrotes'
  | 'Huevos y Lácteos'
  | 'Lácteos'
  | 'Carnes y Embutidos'
  | 'Frutas y Verduras'
  | 'Bebidas'
  | 'Snacks y Golosinas'
  | 'Helados'
  | 'Limpieza del Hogar'
  | 'Higiene Personal'
  | 'Productos para Mascotas'
  | 'Descartables'
  | 'Panadería'
  | 'Repostería'
  | 'Congelados'
  | 'all';

export interface CategoryInfo {
  color: string;
  icon: React.ReactNode;
  abbr: string;
  subcategories?: string[];
}

export const categoryData: Record<CategoryKey, CategoryInfo> = {
  'all': {
    color: 'bg-gray-100',
    icon: <Package size={18} />,
    abbr: 'ALL',
  },
  'Abarrotes': {
    color: 'bg-yellow-100',
    icon: <Package size={18} />,
    abbr: 'AB',
    subcategories: ['Menestras', 'Pastas', 'Arroz', 'Salsas', 'Aceites', 'Condimentos', 'Conservas', 'Otro'],
  },
  'Huevos y Lácteos': {
    color: 'bg-yellow-50',
    icon: <span role="img">🥚</span>,
    abbr: 'HL',
    subcategories: ['Huevos', 'Leche', 'Yogur', 'Queso', 'Mantequilla', 'Otros'],
  },
  'Lácteos': {
    color: 'bg-blue-100',
    icon: <span role="img">🧀</span>,
    abbr: 'LC',
    subcategories: ['Leche', 'Yogur', 'Queso', 'Mantequilla'],
  },
  'Carnes y Embutidos': {
    color: 'bg-red-100',
    icon: <span role="img">🍖</span>,
    abbr: 'CE',
    subcategories: ['Pollo', 'Res', 'Salchichas', 'Jamón', 'Otros'],
  },
  'Frutas y Verduras': {
    color: 'bg-green-100',
    icon: <Apple size={18} />,
    abbr: 'FV',
    subcategories: ['Frutas', 'Verduras', 'Tubérculos', 'Otros'],
  },
  'Bebidas': {
    color: 'bg-sky-100',
    icon: <CupSoda size={18} />,
    abbr: 'BB',
    subcategories: ['Gaseosas', 'Jugos', 'Aguas', 'Energéticas', 'Otros'],
  },
  'Snacks y Golosinas': {
    color: 'bg-orange-100',
    icon: <Candy size={18} />,
    abbr: 'SG',
    subcategories: ['Chocolates', 'Papas', 'Galletas', 'Caramelos', 'Otros'],
  },
  'Helados': {
    color: 'bg-pink-100',
    icon: <IceCream size={18} />,
    abbr: 'HL',
    subcategories: ['Cremoladas', 'Paletas', 'Conos'],
  },
  'Limpieza del Hogar': {
    color: 'bg-gray-200',
    icon: <SprayCan size={18} />,
    abbr: 'LH',
    subcategories: ['Lavavajillas', 'Detergentes', 'Multiusos', 'Otros'],
  },
  'Higiene Personal': {
    color: 'bg-fuchsia-100',
    icon: <span role="img">🧴</span>,
    abbr: 'HP',
    subcategories: ['Jabones', 'Shampoo', 'Desodorantes', 'Papel Higiénico', 'Otros'],
  },
  'Productos para Mascotas': {
    color: 'bg-yellow-200',
    icon: <span role="img">🐾</span>,
    abbr: 'PM',
    subcategories: ['Alimento Perro', 'Alimento Gato', 'Accesorios', 'Otros'],
  },
  'Descartables': {
    color: 'bg-zinc-100',
    icon: <Trash2 size={18} />,
    abbr: 'DS',
    subcategories: ['Vasos', 'Platos', 'Cubiertos', 'Bolsas', 'Otros'],
  },
  'Panadería': {
    color: 'bg-amber-100',
    icon: <span role="img">🥖</span>,
    abbr: 'PD',
    subcategories: ['Pan', 'Pan Especial', 'Otros'],
  },
  'Repostería': {
    color: 'bg-rose-100',
    icon: <span role="img">🧁</span>,
    abbr: 'RP',
    subcategories: ['Pasteles', 'Bizcochos', 'Ingredientes', 'Otros'],
  },
  'Congelados': {
    color: 'bg-cyan-100',
    icon: <Snowflake size={18} />,
    abbr: 'CG',
    subcategories: ['Carnes', 'Verduras', 'Comidas listas', 'Otros'],
  },
};
