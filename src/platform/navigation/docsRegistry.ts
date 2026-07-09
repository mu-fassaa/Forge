import { type ComponentType } from 'react';

// ─────────────────────────────────────────────────────────────
// DocsRegistry: plugin mendaftarkan section dokumentasi mereka.
// DocsPage membaca registry ini dan merender section plugin
// di bawah dokumentasi core.
//
// Pattern: plugin mendaftarkan DocsSection berupa React component.
// Core tidak tahu konten dokumentasi plugin.
// ─────────────────────────────────────────────────────────────

export interface DocsSection {
  /** ID unik section */
  id: string;
  /** Judul section (ditampilkan sebagai heading) */
  title: string;
  /** Nama plugin pemilik section ini */
  pluginName?: string;
  /** Lucide icon name */
  icon?: string;
  /** React component yang merender konten dokumentasi */
  content: ComponentType;
  /** Urutan tampil (ascending) */
  order?: number;
}

class DocsRegistry {
  private sections = new Map<string, DocsSection>();

  /**
   * Daftarkan docs section.
   */
  register(section: DocsSection): void {
    this.sections.set(section.id, section);
  }

  /**
   * Hapus docs section (dipanggil saat plugin disabled/unmount).
   */
  unregister(id: string): void {
    this.sections.delete(id);
  }

  /**
   * Ambil semua section, diurutkan berdasarkan `order`.
   */
  getAll(): DocsSection[] {
    return Array.from(this.sections.values()).sort(
      (a, b) => (a.order ?? 99) - (b.order ?? 99),
    );
  }

  /**
   * True jika ada plugin yang mendaftarkan docs.
   */
  hasEntries(): boolean {
    return this.sections.size > 0;
  }
}

// Singleton instance
export const docsRegistry = new DocsRegistry();
