// Tipos globales para la app de bodegas/abarrotes


export interface Sale {
  id: string;
  date: string;
  products: Array<{
    productId: string;
    quantity: number;
    salePrice: number;
  }>;
  total: number;
  clientId?: string;
  userId: string;
  
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  
}
