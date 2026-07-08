import type { CommandDefinition } from '../types/workspace';

// ─────────────────────────────────────────────────────────────
// CommandRegistry: singleton yang menyimpan semua command Forge.
// Pola identik dengan nodeRegistry.ts.
// Plugin mendaftarkan commandnya sendiri saat mount.
// Core hanya mengetahui registry, bukan implementasi plugin.
// ─────────────────────────────────────────────────────────────

class CommandRegistry {
  private registry = new Map<string, CommandDefinition>();

  /**
   * Daftarkan sebuah command. Jika ID sudah ada, ditimpa.
   */
  register(command: CommandDefinition): void {
    if (this.registry.has(command.id)) {
      console.warn(`[CommandRegistry] Command "${command.id}" sudah terdaftar. Akan ditimpa.`);
    }
    this.registry.set(command.id, command);
  }

  /**
   * Hapus command dari registry (berguna saat plugin unmount).
   */
  unregister(id: string): void {
    this.registry.delete(id);
  }

  /**
   * Eksekusi command berdasarkan ID. Throws jika tidak ditemukan.
   */
  execute(id: string): void {
    const cmd = this.registry.get(id);
    if (!cmd) {
      console.error(`[CommandRegistry] Command "${id}" tidak ditemukan.`);
      return;
    }
    cmd.handler();
  }

  /**
   * Ambil semua command yang terdaftar.
   */
  getAll(): CommandDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Cari command berdasarkan query string (label, description, category).
   * Case-insensitive.
   */
  search(query: string): CommandDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.id.toLowerCase().includes(q),
    );
  }

  /**
   * Ambil command berdasarkan ID. Null jika tidak ditemukan.
   */
  get(id: string): CommandDefinition | null {
    return this.registry.get(id) ?? null;
  }

  /**
   * Ambil semua command dikelompokkan per category.
   */
  getGrouped(): Record<string, CommandDefinition[]> {
    const groups: Record<string, CommandDefinition[]> = {};
    for (const cmd of this.registry.values()) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }
}

// Singleton instance — digunakan di seluruh aplikasi
export const commandRegistry = new CommandRegistry();
