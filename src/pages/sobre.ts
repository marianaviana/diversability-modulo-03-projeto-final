import { authService } from '../services/auth';
import { componentRenderer } from '../components/renderer';

export class SobrePage {
  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    if (!authService.requireAuth()) return;
    await componentRenderer.renderAll();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SobrePage();
});