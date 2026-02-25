
export type Role = 'ADMIN' | 'SALES';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  barcode: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'pix';
  userId: string; // ID do vendedor que realizou a venda
}

export type View = 'dashboard' | 'pos' | 'inventory' | 'history' | 'ai';

export interface Category {
  id: string;
  name: string;
}
