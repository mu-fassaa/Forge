// ─────────────────────────────────────────────────────────────
// ContextMenuRegistry: menyimpan grup dan item context menu.
// Plugin mendaftarkan groupnya sendiri saat mount.
// ContextMenuOverlay merender registry ini saat right-click.
//
// Keputusan (Q3): scope v0.5.1 adalah canvas area saja.
// Right-click pada canvas → tampilkan semua registered groups.
// ─────────────────────────────────────────────────────────────

export interface ContextMenuItem {
  /** Unique ID dalam grup */
  id: string;
  /** Label yang ditampilkan */
  label: string;
  /** Lucide icon name (opsional) */
  icon?: string;
  /** Shortcut display badge (opsional) */
  shortcut?: string;
  /** True jika item tidak bisa diklik */
  disabled?: boolean;
  /** Divider sebelum item ini */
  separator?: boolean;
  /** Handler saat item diklik. Menerima mouse position sebagai context. */
  handler: (context?: { x: number; y: number }) => void;
}

export interface ContextMenuGroup {
  /** Unique group ID: 'dialogue.nodes', 'dialogue.canvas', etc. */
  id: string;
  /** Label header grup (opsional) */
  label?: string;
  /** Urutan tampil — grup dengan order lebih kecil muncul lebih atas */
  order?: number;
  /** Daftar menu items dalam grup */
  items: ContextMenuItem[];
}

class ContextMenuRegistry {
  private registry = new Map<string, ContextMenuGroup>();

  /**
   * Daftarkan sebuah grup context menu.
   */
  registerGroup(group: ContextMenuGroup): void {
    this.registry.set(group.id, group);
  }

  /**
   * Hapus grup (dipanggil saat plugin unmount).
   */
  unregisterGroup(id: string): void {
    this.registry.delete(id);
  }

  /**
   * Ambil semua grup, diurutkan berdasarkan `order`.
   */
  getGroups(): ContextMenuGroup[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => (a.order ?? 99) - (b.order ?? 99),
    );
  }

  /**
   * True jika ada grup yang terdaftar (dipakai untuk
   * menentukan apakah context menu perlu ditampilkan).
   */
  hasGroups(): boolean {
    return this.registry.size > 0;
  }
}

// Singleton instance
export const contextMenuRegistry = new ContextMenuRegistry();
