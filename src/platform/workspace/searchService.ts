// ─────────────────────────────────────────────────────────────
// SearchService: aggregates search providers dari Core dan Plugin.
// Command Palette membaca dari sini saat dalam mode 'search'.
//
// Keputusan (Q2): Global Search diimplementasikan sebagai
// extension dari Command Palette, bukan overlay terpisah.
// Ctrl+P membuka Command Palette dalam mode 'search'.
// ─────────────────────────────────────────────────────────────

export interface SearchResult {
  /** Unique result ID */
  id: string;
  /** Primary label */
  title: string;
  /** Secondary info (file path, type, etc.) */
  subtitle?: string;
  /** Category group */
  category: string;
  /** Lucide icon name */
  icon: string;
  /** Action executed when result is selected */
  action: () => void;
}

export interface SearchProvider {
  /** Unique provider ID: 'workspace.nav', 'dialogue.nodes', etc. */
  id: string;
  /** Display label for the provider */
  label: string;
  /** Search function — called with user query */
  search(query: string): SearchResult[];
}

class SearchService {
  private providers = new Map<string, SearchProvider>();

  /**
   * Daftarkan provider baru. Jika ID sudah ada, ditimpa.
   */
  addProvider(provider: SearchProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Hapus provider (berguna saat plugin unmount).
   */
  removeProvider(id: string): void {
    this.providers.delete(id);
  }

  /**
   * Jalankan query ke semua provider dan gabungkan hasilnya.
   */
  search(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    for (const provider of this.providers.values()) {
      results.push(...provider.search(query));
    }
    return results;
  }

  /**
   * Ambil semua hasil tanpa filter (untuk empty state / default view).
   */
  getAll(): SearchResult[] {
    return this.search('');
  }
}

// Singleton instance
export const searchService = new SearchService();
