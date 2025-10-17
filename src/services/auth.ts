import { User } from '../types';

export class AuthService {
  private readonly currentUserKey = 'currentUser';

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.currentUserKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter usuário do localStorage:', error);
      return null;
    }
  }

  setCurrentUser(user: User): void {
    try {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar usuário no localStorage:', error);
      throw new Error('Erro ao salvar sessão do usuário');
    }
  }

  removeCurrentUser(): void {
    try {
      localStorage.removeItem(this.currentUserKey);
    } catch (error) {
      console.error('Erro ao remover usuário do localStorage:', error);
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  requireAuth(redirectTo: string = 'index.html'): boolean {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  hasDeletePermission(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.username === 'johnd';
  }

  getUserGreeting(): string {
    const currentUser = this.getCurrentUser();
    return currentUser ? `Olá, ${currentUser.username}` : '';
  }
}

export const authService = new AuthService();