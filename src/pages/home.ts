import { apiService } from '../services/api';
import { authService } from '../services/auth';
import { componentRenderer } from '../components/renderer';
import { Product } from '../types';
import { Helpers } from '../utils/helpers';

export class HomePage {
  private productsGrid: HTMLDivElement;
  private loadingMessage: HTMLDivElement;
  private errorMessage: HTMLDivElement;
  private productModal: HTMLDivElement;
  private modalContent: HTMLDivElement;
  private products: Product[] = [];

  constructor() {
    this.productsGrid = document.getElementById('productsGrid') as HTMLDivElement;
    this.loadingMessage = document.getElementById('loadingMessage') as HTMLDivElement;
    this.errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    this.productModal = document.getElementById('productModal') as HTMLDivElement;
    this.modalContent = document.getElementById('modalContent') as HTMLDivElement;
    this.init();
  }

  private async init(): Promise<void> {
    if (!authService.requireAuth()) return;

    await componentRenderer.renderAll();
    this.bindEvents();
    await this.loadProducts();
  }

  private bindEvents(): void {
    const closeModal = this.productModal?.querySelector('.close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => this.closeModal());
    }

    this.productModal?.addEventListener('click', (e: Event) => {
      if (e.target === this.productModal) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !this.productModal.classList.contains('hidden')) {
        this.closeModal();
      }
    });
  }

  private async loadProducts(): Promise<void> {
    try {
      this.showLoading();
      this.hideError();

      this.products = await apiService.getProducts();
      this.renderProducts();
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      this.showError('Erro ao carregar produtos. Tente novamente mais tarde.');
    } finally {
      this.hideLoading();
    }
  }

  private renderProducts(): void {
    if (!this.products || this.products.length === 0) {
      this.productsGrid.innerHTML = '<p class="no-products">Nenhum produto encontrado.</p>';
      return;
    }

    this.productsGrid.innerHTML = this.products.map(product => {
      const isLocal = (product as any).isLocal;
      return `
        <div class="product-card" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
          <div class="product-info">
            <h3 class="product-title">${Helpers.truncateText(product.title, 50)}</h3>
            <div class="product-price">${Helpers.formatPrice(product.price)}</div>
            <div class="product-category">${product.category}</div>
            ${isLocal ? '<div class="local-badge">Produto Local</div>' : ''}
            <button class="btn-primary btn-small view-details-btn" data-product-id="${product.id}">
              Ver Detalhes
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.bindProductEvents();
  }

  private bindProductEvents(): void {
    this.productsGrid.querySelectorAll('.view-details-btn').forEach(button => {
      button.addEventListener('click', (e: Event) => {
        const productId = (e.target as HTMLButtonElement).getAttribute('data-product-id');
        if (productId) {
          this.showProductDetails(parseInt(productId));
        }
      });
    });
  }

  private async showProductDetails(productId: number): Promise<void> {
    try {
      this.showLoading();
      const product = await apiService.getProduct(productId);
      this.renderProductModal(product);
    } catch (error) {
      console.error('Erro ao carregar detalhes do produto:', error);
      this.showError('Erro ao carregar detalhes do produto.');
    } finally {
      this.hideLoading();
    }
  }

  private renderProductModal(product: Product): void {
    const isLocal = (product as any).isLocal;

    this.modalContent.innerHTML = `
      <div class="product-detail">
        <img src="${product.image}" alt="${product.title}" class="product-detail-image">
        <div class="product-detail-info">
          <h3>${product.title}</h3>
          <div class="product-detail-price">${Helpers.formatPrice(product.price)}</div>
          <div class="product-category">Categoria: ${product.category}</div>
          ${isLocal ? '<div class="local-badge">Produto Local</div>' : ''}
          <div class="product-rating">
            Avaliação: ${product.rating?.rate || 'N/A'} (${product.rating?.count || 0} reviews)
          </div>
          <p class="product-detail-description">${product.description}</p>
        </div>
      </div>
    `;

    this.openModal();
  }

  private openModal(): void {
    this.productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  private closeModal(): void {
    this.productModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  private showLoading(): void {
    if (this.loadingMessage) {
      this.loadingMessage.classList.remove('hidden');
    }
  }

  private hideLoading(): void {
    if (this.loadingMessage) {
      this.loadingMessage.classList.add('hidden');
    }
  }

  private showError(message: string): void {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.classList.remove('hidden');
    }
  }

  private hideError(): void {
    if (this.errorMessage) {
      this.errorMessage.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HomePage();
});