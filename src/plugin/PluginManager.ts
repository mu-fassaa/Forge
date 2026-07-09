import { type PluginDefinition } from './createPlugin';
import { type PluginContext } from './PluginContext';

// Import platform registries
import { commandRegistry } from '../platform/commands/commandRegistry';
import { shortcutRegistry } from '../platform/commands/shortcutRegistry';
import { contextMenuRegistry } from '../platform/commands/contextMenuRegistry';
import { sidebarRegistry } from '../platform/navigation/sidebarRegistry';
import { editorViewRegistry } from '../platform/navigation/editorViewRegistry';
import { docsRegistry } from '../platform/navigation/docsRegistry';
import { nodeRegistry } from '../platform/workspace/nodeRegistry';

// ─────────────────────────────────────────────────────────────
// PluginManager: mengelola lifecycle, registrasi otomatis,
// dan validasi konflik ID antar plugin.
// ─────────────────────────────────────────────────────────────

class PluginManager {
  private plugins = new Map<string, PluginDefinition>();
  private activePlugins = new Set<string>();



  registerPlugin(plugin: PluginDefinition): void {
    const { manifest } = plugin;

    // Set default state plugin jika user belum pernah me-toggle-nya secara eksplisit
    if (!sidebarRegistry.hasExplicitState(manifest.id)) {
      sidebarRegistry.setDefaultState(manifest.id, manifest.enabledByDefault ?? true);
    }

    // 1. Validasi Duplicate Plugin ID (HMR-safe)
    if (this.plugins.has(manifest.id)) {
      console.warn(`[PluginManager] Plugin "${manifest.id}" sudah terdaftar. Registrasi ulang untuk development/HMR.`);
      this.plugins.delete(manifest.id);
    }

    // 2. Validasi Duplicate Command ID
    if (plugin.commands) {
      for (const cmd of plugin.commands) {
        if (commandRegistry.get(cmd.id)) {
          console.warn(
            `[PluginManager] Duplicate command ID in plugin "${manifest.id}": command "${cmd.id}" sudah terdaftar. Akan ditimpa.`
          );
        }
      }
    }

    // 3. Validasi Duplicate Sidebar ID
    if (plugin.sidebar) {
      for (const entry of plugin.sidebar) {
        const exists = sidebarRegistry.getAll().some((e) => e.id === entry.id);
        if (exists) {
          console.warn(
            `[PluginManager] Duplicate sidebar ID in plugin "${manifest.id}": sidebar entry "${entry.id}" sudah terdaftar.`
          );
        }
      }
    }

    // 4. Validasi Duplicate Node ID
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        if (nodeRegistry.has(node.type)) {
          console.warn(
            `[PluginManager] Duplicate node type in plugin "${manifest.id}": node type "${node.type}" sudah terdaftar.`
          );
        }
      }
    }

    // Simpan plugin
    this.plugins.set(manifest.id, plugin);
    
    // Lifecycle: onInstall
    // Kita buat mock context kosong atau terbatas untuk install time jika diperlukan
  }

  /**
   * Mengaktifkan plugin (Enable) dan mendaftarkan layanannya secara otomatis.
   */
  enablePlugin(id: string, context: PluginContext): void {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      console.warn(`[PluginManager] Gagal mengaktifkan: plugin "${id}" tidak terdaftar.`);
      return;
    }

    if (this.activePlugins.has(id)) return;

    const { manifest } = plugin;

    // 1. Auto Registration: Node Types
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        nodeRegistry.register(node);
      }
    }

    // 2. Auto Registration: Commands
    if (plugin.commands) {
      for (const cmd of plugin.commands) {
        commandRegistry.register(cmd);
      }
    }

    // 3. Auto Registration: Shortcuts
    if (plugin.shortcuts) {
      for (const sc of plugin.shortcuts) {
        shortcutRegistry.register(sc);
      }
    }

    // 4. Auto Registration: Sidebar Entries
    if (plugin.sidebar) {
      for (const sb of plugin.sidebar) {
        sidebarRegistry.register(sb);
      }
    }

    // 5. Auto Registration: Editor View
    if (plugin.editorView) {
      editorViewRegistry.register({
        id: manifest.id,
        component: plugin.editorView,
      });
    }

    // 6. Auto Registration: Docs Sections
    if (plugin.docs) {
      for (const doc of plugin.docs) {
        docsRegistry.register({
          ...doc,
          pluginName: manifest.name,
        });
      }
    }

    // 7. Auto Registration: Context Menus
    if (plugin.contextMenus) {
      for (const menu of plugin.contextMenus) {
        contextMenuRegistry.registerGroup(menu);
      }
    }

    // Tandai aktif
    this.activePlugins.add(id);

    // Lifecycle Hook: onEnable
    if (plugin.onEnable) {
      try {
        plugin.onEnable(context);
      } catch (e) {
        console.error(`[PluginManager] Error in plugin "${id}" onEnable hook:`, e);
      }
    }
  }

  /**
   * Menonaktifkan plugin (Disable) dan membersihkan seluruh registrasinya secara bersih.
   */
  disablePlugin(id: string, context: PluginContext): void {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    if (!this.activePlugins.has(id)) return;

    // Lifecycle Hook: onDisable
    if (plugin.onDisable) {
      try {
        plugin.onDisable(context);
      } catch (e) {
        console.error(`[PluginManager] Error in plugin "${id}" onDisable hook:`, e);
      }
    }

    // 1. Unregister Context Menus
    if (plugin.contextMenus) {
      for (const menu of plugin.contextMenus) {
        contextMenuRegistry.unregisterGroup(menu.id);
      }
    }

    // 2. Unregister Docs Sections
    if (plugin.docs) {
      for (const doc of plugin.docs) {
        docsRegistry.unregister(doc.id);
      }
    }

    // 3. Unregister Editor View
    if (plugin.editorView) {
      editorViewRegistry.unregister(plugin.manifest.id);
    }

    // 4. Unregister Sidebar Entries
    if (plugin.sidebar) {
      for (const sb of plugin.sidebar) {
        sidebarRegistry.unregister(sb.id);
      }
    }

    // 5. Unregister Shortcuts
    if (plugin.shortcuts) {
      for (const sc of plugin.shortcuts) {
        shortcutRegistry.unregister(sc.key);
      }
    }

    // 6. Unregister Commands
    if (plugin.commands) {
      for (const cmd of plugin.commands) {
        commandRegistry.unregister(cmd.id);
      }
    }

    // Hapus dari active list
    this.activePlugins.delete(id);
  }

  /**
   * Unload plugin (lepaskan sepenuhnya dari memori).
   */
  unloadPlugin(id: string, context: PluginContext): void {
    this.disablePlugin(id, context);
    const plugin = this.plugins.get(id);
    if (plugin && plugin.onUnload) {
      try {
        plugin.onUnload(context);
      } catch (e) {}
    }
    this.plugins.delete(id);
  }

  getPlugin(id: string): PluginDefinition | null {
    return this.plugins.get(id) ?? null;
  }

  getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  isActive(id: string): boolean {
    return this.activePlugins.has(id);
  }
}

export const pluginManager = new PluginManager();
export type { PluginDefinition };
