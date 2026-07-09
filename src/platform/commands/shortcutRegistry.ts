import type { ShortcutDefinition } from '../../types/workspace';

// ─────────────────────────────────────────────────────────────
// ShortcutRegistry: singleton yang menyimpan semua keyboard
// shortcut Forge. Dipisah dari CommandRegistry agar:
//   1. Shortcut bisa diganti tanpa mengubah command handler.
//   2. Plugin bisa mendaftarkan shortcut-nya sendiri saat mount.
//   3. Global listener hanya dipasang satu kali di DashboardLayout.
// ─────────────────────────────────────────────────────────────

/**
 * Normalisasi KeyboardEvent menjadi string key canonical:
 * "ctrl+shift+p", "ctrl+s", "ctrl+z", dll.
 */
export function normalizeKeyEvent(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');

  const key = e.key.toLowerCase();

  // Jangan dobel modifier
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    // Normalisasi key khusus
    const keyMap: Record<string, string> = {
      ' ': 'space',
      'arrowup': 'arrowup',
      'arrowdown': 'arrowdown',
      'arrowleft': 'arrowleft',
      'arrowright': 'arrowright',
      'escape': 'escape',
      'enter': 'enter',
      'tab': 'tab',
      'backspace': 'backspace',
      'delete': 'delete',
    };
    parts.push(keyMap[key] ?? key);
  }

  return parts.join('+');
}

class ShortcutRegistry {
  private registry = new Map<string, ShortcutDefinition>();

  /**
   * Daftarkan sebuah shortcut.
   * key harus dalam format normalized: 'ctrl+s', 'ctrl+shift+p'.
   */
  register(shortcut: ShortcutDefinition): void {
    const normalized = shortcut.key.toLowerCase().trim();
    if (this.registry.has(normalized)) {
      console.warn(`[ShortcutRegistry] Shortcut "${normalized}" sudah terdaftar. Akan ditimpa.`);
    }
    this.registry.set(normalized, { ...shortcut, key: normalized });
  }

  /**
   * Hapus shortcut dari registry (berguna saat plugin unmount).
   */
  unregister(key: string): void {
    this.registry.delete(key.toLowerCase().trim());
  }

  /**
   * Resolve KeyboardEvent ke ShortcutDefinition yang cocok.
   * Mengembalikan null jika tidak ada shortcut yang cocok.
   */
  resolve(event: KeyboardEvent): ShortcutDefinition | null {
    // Abaikan jika sedang mengetik di input/textarea/select
    const target = event.target as HTMLElement | null;
    const isInputField =
      target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

    // Izinkan shortcut Escape dan palette dari input field
    const normalized = normalizeKeyEvent(event);
    const alwaysAllow = ['escape', 'ctrl+k', 'ctrl+shift+p'];

    if (isInputField && !alwaysAllow.includes(normalized)) {
      return null;
    }

    return this.registry.get(normalized) ?? null;
  }

  /**
   * Ambil semua shortcut yang terdaftar.
   */
  getAll(): ShortcutDefinition[] {
    return Array.from(this.registry.values());
  }
}

// Singleton instance — digunakan di seluruh aplikasi
export const shortcutRegistry = new ShortcutRegistry();
