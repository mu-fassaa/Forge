// ─────────────────────────────────────────────────────────────
// SidebarRegistry: plugin mendaftarkan entri sidebar mereka.
// DashboardLayout membaca registry ini untuk merender
// section "Installed Plugins" secara dinamis.
//
// Enable/disable state dikelola di sini (persisted to localStorage)
// dan di-broadcast via custom event 'forge:sidebar-changed'
// agar komponen React bisa re-render tanpa prop drilling.
// ─────────────────────────────────────────────────────────────

const ENABLED_KEY = 'forge_sidebar_enabled_v1';
const SIDEBAR_CHANGED_EVENT = 'forge:sidebar-changed';

export interface SidebarEntry {
  /** ID unik, harus sama dengan EditorType/tab id plugin */
  id: string;
  /** Label yang ditampilkan di sidebar */
  label: string;
  /** Lucide icon name */
  icon: string;
  /** Section tempat entry ini muncul */
  section: 'plugins';
  /** Urutan tampil dalam section */
  order?: number;
  /** Apakah entry ini dari plugin bawaan */
  builtin?: boolean;
}

class SidebarRegistry {
  private entries = new Map<string, SidebarEntry>();
  private enabled: Record<string, boolean> = {};

  constructor() {
    try {
      const saved = localStorage.getItem(ENABLED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          this.enabled = parsed;
          
          // Migrasi otomatis untuk v0.6.0: hapus key plugin lama dari localStorage
          // agar default state enabledByDefault dari manifest dibaca bersih
          const MIGRATION_VERSION_KEY = 'forge_plugin_state_version_v1';
          const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
          if (currentVersion !== '0.6.0') {
            delete this.enabled['dialogue'];
            delete this.enabled['hello-plugin'];
            localStorage.setItem(ENABLED_KEY, JSON.stringify(this.enabled));
            localStorage.setItem(MIGRATION_VERSION_KEY, '0.6.0');
            console.log('[SidebarRegistry] Migrated plugin states to v0.6.0');
          }
        } else {
          localStorage.removeItem(ENABLED_KEY);
          this.enabled = {};
        }
      } else {
        this.enabled = {};
      }
    } catch {
      this.enabled = {};
    }
  }

  /**
   * Cek apakah plugin memiliki state eksplisit dari user di localStorage.
   */
  hasExplicitState(id: string): boolean {
    return this.enabled[id] !== undefined;
  }

  /**
   * Set default state plugin dari manifest jika user belum pernah mengaturnya secara eksplisit.
   */
  setDefaultState(id: string, enabled: boolean): void {
    if (this.enabled[id] === undefined) {
      this.enabled[id] = enabled;
    }
  }

  /**
   * Daftarkan sidebar entry. Memicu 'forge:sidebar-changed'.
   */
  register(entry: SidebarEntry): void {
    this.entries.set(entry.id, entry);
    window.dispatchEvent(new CustomEvent(SIDEBAR_CHANGED_EVENT));
  }

  /**
   * Hapus sidebar entry. Memicu 'forge:sidebar-changed'.
   */
  unregister(id: string): void {
    this.entries.delete(id);
    window.dispatchEvent(new CustomEvent(SIDEBAR_CHANGED_EVENT));
  }

  /**
   * Cek apakah plugin aktif. Default: true (aktif).
   */
  isEnabled(id: string): boolean {
    return this.enabled[id] !== false;
  }

  /**
   * Toggle enable/disable plugin. Memicu 'forge:sidebar-changed'.
   */
  setEnabled(id: string, enabled: boolean): void {
    this.enabled[id] = enabled;
    try {
      localStorage.setItem(ENABLED_KEY, JSON.stringify(this.enabled));
    } catch {}
    window.dispatchEvent(new CustomEvent(SIDEBAR_CHANGED_EVENT));
  }

  /**
   * Ambil semua entri, diurutkan berdasarkan `order`.
   */
  getAll(): SidebarEntry[] {
    return Array.from(this.entries.values()).sort(
      (a, b) => (a.order ?? 99) - (b.order ?? 99),
    );
  }

  /**
   * True jika ada plugin yang terdaftar.
   */
  hasEntries(): boolean {
    return this.entries.size > 0;
  }
}

// Singleton instance
export const sidebarRegistry = new SidebarRegistry();
export { SIDEBAR_CHANGED_EVENT };
