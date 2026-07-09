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
}

class SidebarRegistry {
  private entries = new Map<string, SidebarEntry>();
  private enabled: Record<string, boolean> = {};

  constructor() {
    try {
      const saved = localStorage.getItem(ENABLED_KEY);
      this.enabled = saved ? JSON.parse(saved) : {};
    } catch {
      this.enabled = {};
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
