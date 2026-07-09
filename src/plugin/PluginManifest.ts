// ─────────────────────────────────────────────────────────────
// PluginManifest: metadata standar untuk mendefinisikan plugin
// ─────────────────────────────────────────────────────────────

export interface PluginManifest {
  /** ID unik plugin (misalnya: 'dialogue', 'hello-plugin') */
  id: string;
  /** Nama human-readable */
  name: string;
  /** Versi semver */
  version: string;
  /** Author developer */
  author: string;
  /** Deskripsi singkat fungsionalitas */
  description: string;
  /** Lucide icon name */
  icon: string;
  /** Kategori (misalnya: 'Editors', 'Tools', 'Utility') */
  category: string;
  /** Apakah plugin aktif secara default saat pertama di-load */
  enabledByDefault?: boolean;
  /** Daftar ID plugin lain yang menjadi dependensi */
  dependencies?: string[];
}
