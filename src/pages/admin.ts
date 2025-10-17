import { apiService } from '../services/api';
import { authService } from '../services/auth';
import { componentRenderer } from '../components/renderer';
import { Product, ProductFormData, ManagedProduct } from '../types';
import { Helpers } from '../utils/helpers';

export class AdminPage {
  private productsTableBody: HTMLTableSectionElement;
  private loadingMessage: HTMLDivElement;
  private errorMessage: HTMLDivElement;
  private addProductBtn: HTMLButtonElement;
  private productFormModal: HTMLDivElement;
  private productForm: HTMLFormElement;
  private modalTitle: HTMLHeadingElement;
  private products: Product[] = [];

  constructor() {
    this.productsTableBody = document.getElementById('productsTableBody') as HTMLTableSectionElement;
    this.loadingMessage = document.getElementById('loadingMessage') as HTMLDivElement;
    this.errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    this.addProductBtn = document.getElementById('addProductBtn') as HTMLButtonElement;
    this.productFormModal = document.getElementById('productFormModal') as HTMLDivElement;
    this.productForm = document.getElementById('productForm') as HTMLFormElement;
    this.modalTitle = document.getElementById('modalTitle') as HTMLHeadingElement;
    this.init();
  }

  private async init(): Promise<void> {
    if (!authService.requireAuth()) return;

    await componentRenderer.renderAll();
    this.bindEvents();
    await this.loadProducts();
    this.showLocalStats();
  }

  private bindEvents(): void {
    this.addProductBtn?.addEventListener('click', () => this.openAddProductModal());
    this.productForm?.addEventListener('submit', (e: Event) => this.handleProductSubmit(e));

    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn?.addEventListener('click', () => this.closeModal());

    const closeModal = this.productFormModal?.querySelector('.close-modal');
    closeModal?.addEventListener('click', () => this.closeModal());

    this.productFormModal?.addEventListener('click', (e: Event) => {
      if (e.target === this.productFormModal) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !this.productFormModal.classList.contains('hidden')) {
        this.closeModal();
      }
    });
  }

  private async loadProducts(): Promise<void> {
    try {
      this.showLoading();
      this.hideError();

      this.products = await apiService.getProducts();
      this.renderProductsTable();
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      this.showError('Erro ao carregar produtos. Tente novamente mais tarde.');
    } finally {
      this.hideLoading();
    }
  }

  private renderProductsTable(): void {
    if (!this.products || this.products.length === 0) {
      this.productsTableBody.innerHTML = '<tr><td colspan="5" class="no-products">Nenhum produto encontrado.</td></tr>';
      return;
    }

    this.productsTableBody.innerHTML = this.products.map(product => {
      const managedProduct = product as ManagedProduct;
      const isLocal = managedProduct._isLocal;
      const isModified = managedProduct._isModified && !managedProduct._isLocal;

      let statusBadge = '';
      if (isLocal) {
        statusBadge = '<span class="local-badge" title="Produto local">Local</span>';
      } else if (isModified) {
        statusBadge = '<span class="modified-badge" title="Produto modificado">Modificado</span>';
      }

      return `
        <tr data-product-id="${product.id}" data-is-local="${isLocal || false}">
          <td>
            ${product.id}
            ${statusBadge}
          </td>
          <td>${Helpers.truncateText(product.title, 50)}</td>
          <td>${Helpers.formatPrice(product.price)}</td>
          <td>${product.category}</td>
          <td class="actions-cell">
            <button class="btn-secondary btn-small edit-btn" data-product-id="${product.id}">
              Editar
            </button>
            <button class="btn-danger btn-small delete-btn" data-product-id="${product.id}">
              Deletar
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.bindTableEvents();
  }

  private bindTableEvents(): void {
    this.productsTableBody.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e: Event) => {
        const productId = (e.target as HTMLButtonElement).getAttribute('data-product-id');
        if (productId) {
          this.openEditProductModal(parseInt(productId));
        }
      });
    });

    this.productsTableBody.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e: Event) => {
        const productId = (e.target as HTMLButtonElement).getAttribute('data-product-id');
        if (productId) {
          this.handleDeleteProduct(parseInt(productId));
        }
      });
    });
  }

  private openAddProductModal(): void {
    this.modalTitle.textContent = 'Adicionar Novo Produto';
    this.productForm.reset();
    (document.getElementById('productId') as HTMLInputElement).value = '';
    this.openModal();
  }

  private async openEditProductModal(productId: number): Promise<void> {
    try {
      this.showLoading();
      const product = await apiService.getProduct(productId);

      this.modalTitle.textContent = 'Editar Produto';
      (document.getElementById('productId') as HTMLInputElement).value = product.id.toString();
      (document.getElementById('productTitle') as HTMLInputElement).value = product.title;
      (document.getElementById('productPrice') as HTMLInputElement).value = product.price.toString();
      (document.getElementById('productDescription') as HTMLTextAreaElement).value = product.description;
      (document.getElementById('productCategory') as HTMLInputElement).value = product.category;
      (document.getElementById('productImage') as HTMLInputElement).value = product.image;

      this.openModal();
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      this.showError('Erro ao carregar produto para edição.');
    } finally {
      this.hideLoading();
    }
  }

  private async handleProductSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const formData = new FormData(this.productForm);
    const productId = (document.getElementById('productId') as HTMLInputElement).value;
    const productData: ProductFormData = {
      title: formData.get('title') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      image: formData.get('image') as string
    };

    if (!this.validateProductForm(productData)) {
      return;
    }

    try {
      this.setFormLoadingState(true);

      let newProduct: Product;

      if (productId) {
        newProduct = await apiService.updateProduct(parseInt(productId), productData);
        Helpers.showNotification('Produto atualizado com sucesso! (Alterações salvas localmente)', 'success');

        const index = this.products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
          this.products[index] = newProduct;
        }
      } else {
        newProduct = await apiService.createProduct(productData);
        Helpers.showNotification('Produto criado com sucesso! (Salvo localmente)', 'success');

        this.products.unshift(newProduct);
      }

      this.closeModal();
      this.renderProductsTable();
      this.showLocalStats();

    } catch (error) {
      console.error('Erro detalhado ao salvar produto:', {
        error,
        productData,
        productId,
        isEdit: !!productId
      });

      if (error instanceof Error) {
        this.showError(`Erro ao salvar produto: ${error.message}`);
      } else {
        this.showError('Erro ao salvar produto. Tente novamente.');
      }
    } finally {
      this.setFormLoadingState(false);
    }
  }

  private async handleDeleteProduct(productId: number): Promise<void> {
    if (!authService.hasDeletePermission()) {
      alert('Você não tem permissão para deletar produtos.');
      return;
    }

    const confirmed = confirm('Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    try {
      await apiService.deleteProduct(productId);
      Helpers.showNotification('Produto deletado com sucesso! (Removido localmente)', 'success');

      await this.loadProducts();
      this.showLocalStats();

    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      this.showError('Erro ao deletar produto. Tente novamente.');
    }
  }

  private showLocalStats(): void {
    const stats = apiService.getLocalStats();
    console.log('Estatísticas dos dados locais:', stats);

    const statsElement = document.getElementById('localStats') || this.createStatsElement();
    statsElement.innerHTML = `
      <div class="local-stats">
        <strong>Dados Locais:</strong>
        ${stats.local} novos | ${stats.modified} modificados | ${stats.deleted} excluídos
        ${stats.deleted > 0 ? '<button id="clearDeletedBtn" class="btn-danger btn-small" style="margin-left: 10px;">Restaurar Excluídos</button>' : ''}
      </div>
    `;

    const clearDeletedBtn = document.getElementById('clearDeletedBtn');
    if (clearDeletedBtn) {
      clearDeletedBtn.addEventListener('click', () => this.clearDeletedProducts());
    }
  }

  private createStatsElement(): HTMLDivElement {
    const statsElement = document.createElement('div');
    statsElement.id = 'localStats';
    statsElement.className = 'local-stats-container';

    const adminHeader = document.querySelector('.admin-header');
    if (adminHeader) {
      adminHeader.appendChild(statsElement);
    }

    return statsElement;
  }

  private async clearDeletedProducts(): Promise<void> {
    const confirmed = confirm('Tem certeza que deseja restaurar todos os produtos excluídos?');
    if (!confirmed) return;

    try {
      const managedProducts = JSON.parse(localStorage.getItem('managedProducts') || '[]');

      const filteredProducts = managedProducts.filter((p: ManagedProduct) => !p._isDeleted);
      localStorage.setItem('managedProducts', JSON.stringify(filteredProducts));

      Helpers.showNotification('Produtos excluídos da API foram restaurados!', 'success');
      this.renderProductsTable();
      this.showLocalStats();
    } catch (error) {
      console.error('Erro ao limpar produtos deletados:', error);
      this.showError('Erro ao limpar produtos deletados.');
    }
  }

  private validateProductForm(productData: ProductFormData): boolean {
    this.hideError();

    if (!productData.title || productData.title.trim().length < 3) {
      this.showError('O título deve ter pelo menos 3 caracteres.');
      return false;
    }

    if (!productData.price || productData.price <= 0 || isNaN(productData.price)) {
      this.showError('O preço deve ser um número maior que zero.');
      return false;
    }

    if (!productData.description || productData.description.trim().length < 10) {
      this.showError('A descrição deve ter pelo menos 10 caracteres.');
      return false;
    }

    if (!productData.category || productData.category.trim().length < 2) {
      this.showError('A categoria deve ter pelo menos 2 caracteres.');
      return false;
    }

    if (!productData.image || !Helpers.isValidUrl(productData.image)) {
      this.showError('URL da imagem inválida.');
      return false;
    }

    return true;
  }

  private openModal(): void {
    this.productFormModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  private closeModal(): void {
    this.productFormModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    this.hideError();
  }

  private setFormLoadingState(isLoading: boolean): void {
    const submitButton = this.productForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancelBtn') as HTMLButtonElement;

    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading ? 'Salvando...' : 'Salvar';
    }

    if (cancelButton) {
      cancelButton.disabled = isLoading;
    }
  }

  private showLoading(): void {
    if (this.loadingMessage) {
      this.loadingMessage.classList.remove('hidden');
    }
    if (this.productsTableBody) {
      this.productsTableBody.style.opacity = '0.5';
    }
  }

  private hideLoading(): void {
    if (this.loadingMessage) {
      this.loadingMessage.classList.add('hidden');
    }
    if (this.productsTableBody) {
      this.productsTableBody.style.opacity = '1';
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
  new AdminPage();
});