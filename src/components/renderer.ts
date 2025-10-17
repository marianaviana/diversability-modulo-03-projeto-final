import { authService } from '../services/auth';

export class ComponentRenderer {
  async renderHeader(containerId: string = 'header'): Promise<void> {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUser = authService.getCurrentUser();
    const userGreeting = authService.getUserGreeting();

    const headerHtml = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="logo-section">
              <a href="home.html" class="logo">E-commerce</a>
              <div class="main-logo">🛒</div>
            </div>
            <nav>
              <ul class="nav-menu">
                <li><a href="home.html">Home</a></li>
                <li><a href="admin.html">Admin</a></li>
                <li><a href="sobre.html">Sobre</a></li>
                ${currentUser ? `
                  <li>
                    <span class="user-greeting">${userGreeting}</span>
                  </li>
                  <li>
                    <a href="#" id="logoutBtn" class="logout-btn">Logout</a>
                  </li>
                ` : ''}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    `;

    container.innerHTML = headerHtml;
    this.bindHeaderEvents();
  }

  async renderFooter(containerId: string = 'footer'): Promise<void> {
    const container = document.getElementById(containerId);
    if (!container) return;

    const footerHtml = `
      <footer class="footer">
        <div class="container">
          <p>&copy; ${new Date().getFullYear()} <a href="home.html">E-commerce</a> 🛒 | Aluna <a href="https://mariviana.dev" target="_blank" rel="noreferrer" aria-label="Mari Viana">Mariana Viana</a> | Programa <a target="_blank" href="https://ada.tech/oportunidades/cognizant-diversability" rel="noreferrer" aria-label="DiversAbility">DiversAbility</a> via <a href="https://ada.tech/" target="_blank" rel="noreferrer" aria-label="Ada">Ada & Cognizant</a></p>
        </div>
      </footer>
    `;

    container.innerHTML = footerHtml;
  }

  async renderAll(): Promise<void> {
    await Promise.all([
      this.renderHeader(),
      this.renderFooter()
    ]);
  }

  private bindHeaderEvents(): void {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        authService.removeCurrentUser();
        window.location.href = 'index.html';
      });
    }
  }

  createModal(content: string, onClose?: () => void): HTMLDivElement {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        ${content}
      </div>
    `;

    const closeModal = modal.querySelector('.close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.remove();
        onClose?.();
      });
    }

    modal.addEventListener('click', (e: Event) => {
      if (e.target === modal) {
        modal.remove();
        onClose?.();
      }
    });

    document.addEventListener('keydown', function escHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        modal.remove();
        onClose?.();
        document.removeEventListener('keydown', escHandler);
      }
    });

    return modal;
  }

  showModal(content: string, onClose?: () => void): void {
    const modal = this.createModal(content, onClose);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal: HTMLDivElement): void {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
}

export const componentRenderer = new ComponentRenderer();