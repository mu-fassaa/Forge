import type { RecentGraphEntry } from '../../types/workspace';

// ─────────────────────────────────────────────────────────────
// RecentGraphManager: service yang menyimpan riwayat graph
// yang pernah dibuka. Data persisted ke localStorage.
// Digunakan oleh Dashboard hero card untuk menampilkan
// info sesi terakhir secara akurat.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'forge_recent_graphs_v1';
const MAX_ENTRIES = 10;

class RecentGraphManager {
  /**
   * Baca semua recent graph entries dari localStorage.
   */
  getAll(): RecentGraphEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as RecentGraphEntry[];
    } catch {
      return [];
    }
  }

  /**
   * Ambil entry terbaru (paling baru dibuka).
   * Mengembalikan null jika belum ada riwayat.
   */
  getLatest(): RecentGraphEntry | null {
    const all = this.getAll();
    return all[0] ?? null;
  }

  /**
   * Tambahkan atau perbarui entry saat graph dibuka/disimpan.
   * Jika graphId sudah ada, entry lama akan diganti dan dipindah ke posisi teratas.
   * Dibatasi maksimal MAX_ENTRIES.
   */
  add(entry: RecentGraphEntry): void {
    try {
      const all = this.getAll();
      // Hapus entry lama dengan graphId yang sama (dedup)
      const filtered = all.filter((e) => e.graphId !== entry.graphId);
      // Masukkan entry baru di posisi pertama
      const updated = [
        { ...entry, lastOpenedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[RecentGraphManager] Failed to save recent graph entry:', e);
    }
  }

  /**
   * Perbarui hanya node/edge count pada entry yang sudah ada.
   * Berguna saat autosave tanpa perlu re-add seluruh entry.
   */
  updateCounts(graphId: string, nodeCount: number, edgeCount: number): void {
    try {
      const all = this.getAll();
      const updated = all.map((e) =>
        e.graphId === graphId ? { ...e, nodeCount, edgeCount } : e,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[RecentGraphManager] Failed to update counts:', e);
    }
  }

  /**
   * Hapus semua riwayat.
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Singleton instance
export const recentGraphManager = new RecentGraphManager();
