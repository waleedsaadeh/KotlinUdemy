export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  description?: string | null;
  _count?: { products: number };
}

export interface Warehouse {
  id: string;
  nameEn: string;
  nameAr: string;
  location?: string | null;
  isActive: boolean;
  _count?: { stock: number };
}

export interface StockEntry {
  id: string;
  quantity: number;
  warehouseId: string;
  warehouse?: Warehouse;
}

export interface Product {
  id: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  description?: string | null;
  unit: string;
  costPrice: string | number;
  salePrice: string | number;
  reorderLevel: number;
  isActive: boolean;
  categoryId?: string | null;
  category?: Category | null;
  stock?: StockEntry[];
  totalStock?: number;
}

export interface DashboardStats {
  productCount: number;
  categoryCount: number;
  warehouseCount: number;
  totalUnits: number;
  inventoryValue: number;
  lowStock: {
    id: string;
    sku: string;
    nameEn: string;
    nameAr: string;
    totalStock: number;
    reorderLevel: number;
  }[];
}
