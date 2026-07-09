import { type EditorType } from '../../types';

// ─────────────────────────────────────────────────────────────
// NavigationService: singleton yang menjembatani navigasi
// antara platform services (CommandRegistry, ShortcutRegistry)
// dan React state management di WorkspaceContext.
//
// Plugin TIDAK BOLEH memanggil setActiveTab secara langsung.
// Plugin memanggil navigationService.navigate() — Core yang
// memutuskan ke mana navigasi terjadi.
// ─────────────────────────────────────────────────────────────

class NavigationService {
  private _navigate: ((tab: EditorType) => void) | null = null;

  /**
   * Dipanggil oleh WorkspaceProvider saat mount untuk
   * mendaftarkan fungsi navigasi React.
   */
  register(fn: (tab: EditorType) => void): void {
    this._navigate = fn;
  }

  /**
   * Navigasi ke tab/editor tertentu.
   * Aman dipanggil dari mana saja — service, command handler, dll.
   */
  navigate(tab: EditorType): void {
    if (this._navigate) {
      this._navigate(tab);
    } else {
      console.warn('[NavigationService] navigate() dipanggil sebelum provider terdaftar.');
    }
  }

  /**
   * Kembalikan ke Dashboard.
   */
  goHome(): void {
    this.navigate('dashboard');
  }
}

// Singleton instance
export const navigationService = new NavigationService();
