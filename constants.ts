
import { Product, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Drinks' },
  { id: '2', name: 'Snacks' },
  { id: '3', name: 'Tobacco' },
  { id: '4', name: 'Personal Care' },
  { id: '5', name: 'Bakery' },
  { id: '6', name: 'Dairy' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Coca-Cola 600ml', category: 'Drinks', price: 6.50, stock: 48, minStock: 12, barcode: '78910001' },
  { id: '2', name: 'Pringles Original', category: 'Snacks', price: 15.90, stock: 15, minStock: 5, barcode: '78910002' },
  { id: '3', name: 'Gillette Mach 3', category: 'Personal Care', price: 22.00, stock: 8, minStock: 10, barcode: '78910003' },
  { id: '4', name: 'Red Bull 250ml', category: 'Drinks', price: 12.00, stock: 30, minStock: 6, barcode: '78910004' },
  { id: '5', name: 'Doritos Nacho', category: 'Snacks', price: 9.50, stock: 2, minStock: 8, barcode: '78910005' },
  { id: '6', name: 'Marlboro Gold', category: 'Tobacco', price: 11.00, stock: 50, minStock: 20, barcode: '78910006' },
  { id: '7', name: 'Milk 1L', category: 'Dairy', price: 5.20, stock: 24, minStock: 12, barcode: '78910007' },
  { id: '8', name: 'Sliced Bread', category: 'Bakery', price: 7.50, stock: 10, minStock: 5, barcode: '78910008' },
];
