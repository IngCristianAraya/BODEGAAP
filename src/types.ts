// Tipos globales para la app de bodegas/abarrotes


// Archivo legacy de tipos. ¡No usar! Usar sólo src/types/index.ts para todos los tipos globales.


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
