export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export interface User {
  username: string;
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ProductFormData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ModalConfig {
  title: string;
  content: string;
  onClose?: () => void;
}

export interface ManagedProduct extends Product {
  _isLocal?: boolean;
  _isModified?: boolean;
  _isDeleted?: boolean;
  _originalId?: number;
  _createdAt?: number;
  _updatedAt?: number;
}