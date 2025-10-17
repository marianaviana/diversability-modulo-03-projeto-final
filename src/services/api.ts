import { Product, ProductFormData, LoginCredentials, ManagedProduct } from '../types';

export class ApiService {
  private baseUrl: string = 'https://fakestoreapi.com';
  private readonly localProductsKey = 'managedProducts';

  private getManagedProducts(): ManagedProduct[] {
    try {
      const products = localStorage.getItem(this.localProductsKey);
      return products ? JSON.parse(products) : [];
    } catch (error) {
      console.error('Erro ao carregar produtos gerenciados:', error);
      return [];
    }
  }

  private saveManagedProducts(products: ManagedProduct[]): void {
    try {
      localStorage.setItem(this.localProductsKey, JSON.stringify(products));
    } catch (error) {
      console.error('Erro ao salvar produtos gerenciados:', error);
    }
  }

  private findManagedProduct(id: number): ManagedProduct | undefined {
    const managedProducts = this.getManagedProducts();
    return managedProducts.find(p => p.id === id);
  }

  private findManagedProductByOriginalId(originalId: number): ManagedProduct | undefined {
    const managedProducts = this.getManagedProducts();
    return managedProducts.find(p => p._originalId === originalId);
  }

  private isProductDeleted(id: number): boolean {
    const managedProduct = this.findManagedProduct(id) || this.findManagedProductByOriginalId(id);
    return managedProduct ? !!managedProduct._isDeleted : false;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro na requisição');
    }
    return response.json();
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ token: string }> {
    return this.request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProducts(): Promise<Product[]> {
    try {
      const apiProducts = await this.request<Product[]>('/products');

      const managedProducts = this.getManagedProducts().filter(p => !p._isDeleted);

      const combinedProducts = apiProducts
        .filter(apiProduct => !this.isProductDeleted(apiProduct.id))
        .map(apiProduct => {
          const managedProduct = this.findManagedProductByOriginalId(apiProduct.id) ||
                                this.findManagedProduct(apiProduct.id);

          return managedProduct && !managedProduct._isDeleted ? managedProduct : apiProduct;
        });

      const newLocalProducts = managedProducts.filter(managed =>
        !managed._originalId &&
        !apiProducts.some(api => api.id === managed.id) &&
        !managed._isDeleted
      );

      return [...newLocalProducts, ...combinedProducts];
    } catch (error) {
      console.error('Erro ao carregar produtos da API, usando apenas locais:', error);
      return this.getManagedProducts().filter(p => !p._isDeleted);
    }
  }

  async getProduct(id: number): Promise<Product> {
    if (this.isProductDeleted(id)) {
      throw new Error('Produto não encontrado (foi deletado)');
    }

    const managedProduct = this.findManagedProduct(id);
    if (managedProduct && !managedProduct._isDeleted) {
      return managedProduct;
    }

    try {
      const apiProduct = await this.request<Product>(`/products/${id}`);
      const managedByOriginal = this.findManagedProductByOriginalId(apiProduct.id);
      return managedByOriginal && !managedByOriginal._isDeleted ? managedByOriginal : apiProduct;
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      throw new Error('Produto não encontrado');
    }
  }

  async createProduct(product: ProductFormData): Promise<Product> {
    const newProduct: ManagedProduct = {
      id: this.generateProductId(),
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      rating: { rate: 0, count: 0 },
      _isLocal: true,
      _isModified: true,
      _createdAt: Date.now(),
      _updatedAt: Date.now()
    };

    const managedProducts = this.getManagedProducts();
    managedProducts.push(newProduct);
    this.saveManagedProducts(managedProducts);

    try {
      await this.request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    } catch (error) {
      console.log('Produto salvo apenas localmente (API em modo teste)');
    }

    return newProduct;
  }

  async updateProduct(id: number, product: ProductFormData): Promise<Product> {
    if (this.isProductDeleted(id)) {
      throw new Error('Não é possível editar um produto deletado');
    }

    const managedProducts = this.getManagedProducts();
    let managedProduct = this.findManagedProduct(id);

    const timestamp = Date.now();

    if (managedProduct) {
      managedProduct = {
        ...managedProduct,
        ...product,
        _isModified: true,
        _updatedAt: timestamp
      };

      const index = managedProducts.findIndex(p => p.id === id);
      managedProducts[index] = managedProduct;
    } else {
      try {
        const apiProduct = await this.request<Product>(`/products/${id}`);
        managedProduct = {
          ...apiProduct,
          ...product,
          _originalId: apiProduct.id,
          _isModified: true,
          _updatedAt: timestamp
        };

        managedProducts.push(managedProduct);
      } catch (error) {
        managedProduct = {
          id: id,
          ...product,
          rating: { rate: 0, count: 0 },
          _isLocal: true,
          _isModified: true,
          _updatedAt: timestamp
        };

        managedProducts.push(managedProduct);
      }
    }

    this.saveManagedProducts(managedProducts);

    try {
      await this.request<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      });
    } catch (error) {
      console.log('Atualização salva apenas localmente (API em modo teste)');
    }

    return managedProduct!;
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    const managedProducts = this.getManagedProducts();
    let managedProduct = this.findManagedProduct(id);

    if (!managedProduct) {
      try {
        const apiProduct = await this.request<Product>(`/products/${id}`);
        managedProduct = {
          ...apiProduct,
          _originalId: apiProduct.id,
          _isDeleted: true,
          _updatedAt: Date.now()
        };

        managedProducts.push(managedProduct);
      } catch (error) {
        managedProduct = {
          id: id,
          title: 'Produto Deletado',
          price: 0,
          description: 'Este produto foi deletado',
          category: 'deleted',
          image: '',
          _isDeleted: true,
          _updatedAt: Date.now()
        };

        managedProducts.push(managedProduct);
      }
    } else {
      managedProduct._isDeleted = true;
      managedProduct._updatedAt = Date.now();

      const index = managedProducts.findIndex(p => p.id === id);
      managedProducts[index] = managedProduct;
    }

    this.saveManagedProducts(managedProducts);

    try {
      await this.request(`/products/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('Deleção salva apenas localmente (API em modo teste)');
    }

    return { message: 'Produto deletado com sucesso' };
  }

  async restoreProduct(id: number): Promise<Product> {
    const managedProducts = this.getManagedProducts();
    const managedProduct = this.findManagedProduct(id);

    if (!managedProduct) {
      throw new Error('Produto não encontrado para restauração');
    }

    if (!managedProduct._isDeleted) {
      throw new Error('Produto não está deletado');
    }

    managedProduct._isDeleted = false;
    managedProduct._updatedAt = Date.now();

    const index = managedProducts.findIndex(p => p.id === id);
    managedProducts[index] = managedProduct;
    this.saveManagedProducts(managedProducts);

    return managedProduct;
  }

  clearLocalData(): void {
    localStorage.removeItem(this.localProductsKey);
  }

  getLocalStats(): { total: number; local: number; modified: number; deleted: number } {
    const managedProducts = this.getManagedProducts();
    return {
      total: managedProducts.length,
      local: managedProducts.filter(p => p._isLocal && !p._isDeleted).length,
      modified: managedProducts.filter(p => p._isModified && !p._isLocal && !p._isDeleted).length,
      deleted: managedProducts.filter(p => p._isDeleted).length
    };
  }

  getDeletedProducts(): ManagedProduct[] {
    return this.getManagedProducts().filter(p => p._isDeleted);
  }

  private generateProductId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }
}

export const apiService = new ApiService();