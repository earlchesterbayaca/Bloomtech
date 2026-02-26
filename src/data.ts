
export interface CustomizationOption {
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  base_price: number;
  vendor_id: number;
  vendor_name: string;
  category: string;
  image_url: string;
  images?: string[]; // Multiple images
  created_at?: string;
  qualities?: CustomizationOption[];
  themes?: string[];
  styles?: CustomizationOption[];
  addOns?: CustomizationOption[];
}

export interface Vendor {
  id: number;
  name: string;
  location: string;
  rating: number;
  bio?: string;
  banner?: string;
  avatar?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  vendor_id?: number;
  avatar?: string;
  password?: string;
  bio?: string;
  location?: string;
}

export const INITIAL_VENDORS: Vendor[] = [
  { id: 1, name: 'Rose Garden Florals', location: 'Downtown', rating: 4.8 },
  { id: 2, name: 'Petal & Stem', location: 'Westside', rating: 4.9 },
  { id: 3, name: 'Bloom Boutique', location: 'East End', rating: 4.7 },
];

export const INITIAL_PRODUCTS: Product[] = [];
