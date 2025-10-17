import { apiService } from '../services/api';
import { authService } from '../services/auth';
import { LoginCredentials, User } from '../types';
import { Helpers } from '../utils/helpers';

export class LoginPage {
  private loginForm: HTMLFormElement;
  private errorMessage: HTMLDivElement;

  constructor() {
    this.loginForm = document.getElementById('loginForm') as HTMLFormElement;
    this.errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.checkExistingSession();
  }

  private bindEvents(): void {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e: Event) => this.handleLogin(e));
    }
  }

  private checkExistingSession(): void {
    if (authService.isAuthenticated()) {
      window.location.href = 'home.html';
    }
  }

  private async handleLogin(event: Event): Promise<void> {
    event.preventDefault();

    const formData = new FormData(this.loginForm);
    const credentials: LoginCredentials = {
      username: formData.get('username') as string,
      password: formData.get('password') as string
    };

    if (!this.validateForm(credentials)) {
      return;
    }

    await this.performLogin(credentials);
  }

  private validateForm(credentials: LoginCredentials): boolean {
    this.hideError();

    if (!credentials.username || !credentials.password) {
      this.showError('Por favor, preencha todos os campos.');
      return false;
    }

    if (credentials.username.length < 3) {
      this.showError('O usuário deve ter pelo menos 3 caracteres.');
      return false;
    }

    if (credentials.password.length < 6) {
      this.showError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    return true;
  }

  private async performLogin(credentials: LoginCredentials): Promise<void> {
    try {
      this.setLoadingState(true);

      const response = await apiService.login(credentials);

      if (response.token) {
        const user: User = { username: credentials.username, token: response.token };
        authService.setCurrentUser(user);

        Helpers.showNotification('Login realizado com sucesso!', 'success');

        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      this.showError('Usuário ou senha inválidos.');
    } finally {
      this.setLoadingState(false);
    }
  }

  private setLoadingState(isLoading: boolean): void {
    const submitButton = this.loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading ? 'Entrando...' : 'Entrar';
    }
  }

  private showError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
  }

  private hideError(): void {
    this.errorMessage.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
});