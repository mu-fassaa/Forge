import { type ComponentType } from 'react';

// ─────────────────────────────────────────────────────────────
// EditorViewRegistry: plugin mendaftarkan komponen editor mereka.
// App.tsx membaca registry ini untuk merender editor aktif
// secara dinamis — tanpa hardcoded import per plugin.
//
// Konvensi: hanya plugin editors yang masuk ke sini.
// Core editors (dashboard, dialogue, docs) tetap hardcoded
// di App.tsx untuk kejelasan dan type safety.
// ─────────────────────────────────────────────────────────────

export interface EditorViewEntry {
  /** ID unik — harus sama dengan tab id dan SidebarEntry.id */
  id: string;
  /** React component yang dirender saat tab ini aktif */
  component: ComponentType;
}

class EditorViewRegistry {
  private registry = new Map<string, EditorViewEntry>();

  /**
   * Daftarkan editor view.
   */
  register(entry: EditorViewEntry): void {
    if (this.registry.has(entry.id)) {
      console.warn(`[EditorViewRegistry] View "${entry.id}" sudah terdaftar. Akan ditimpa.`);
    }
    this.registry.set(entry.id, entry);
  }

  /**
   * Hapus editor view (dipanggil saat plugin disabled/unmount).
   */
  unregister(id: string): void {
    this.registry.delete(id);
  }

  /**
   * Ambil entry berdasarkan id. Mengembalikan null jika tidak ada.
   */
  get(id: string): EditorViewEntry | null {
    return this.registry.get(id) ?? null;
  }

  /**
   * Ambil semua registered views.
   */
  getAll(): EditorViewEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * True jika id ada di registry (bukan core editor).
   */
  has(id: string): boolean {
    return this.registry.has(id);
  }
}

// Singleton instance
export const editorViewRegistry = new EditorViewRegistry();
