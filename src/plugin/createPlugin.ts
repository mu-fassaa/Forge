import React from 'react';
import { type PluginManifest } from './PluginManifest';
import { type PluginContext } from './PluginContext';
import { type CommandDefinition } from '../types/workspace';
import { type ShortcutDefinition } from '../types/workspace';
import { type SidebarEntry } from '../platform/navigation/sidebarRegistry';
import { type DocsSection } from '../platform/navigation/docsRegistry';
import { type NodeDefinition } from '../platform/workspace/nodeRegistry';
import { type ContextMenuGroup } from '../platform/commands/contextMenuRegistry';

// ─────────────────────────────────────────────────────────────
// PluginDefinition: spesifikasi lengkap dideklarasikan oleh plugin.
// ─────────────────────────────────────────────────────────────

export interface PluginDefinition {
  /** Metadata standar plugin */
  manifest: PluginManifest;
  
  /** Daftar command global yang didaftarkan otomatis */
  commands?: CommandDefinition[];
  
  /** Keyboard shortcuts yang didaftarkan otomatis */
  shortcuts?: ShortcutDefinition[];
  
  /** Entri sidebar panel kiri */
  sidebar?: SidebarEntry[];
  
  /** Section dokumentasi plugin */
  docs?: Omit<DocsSection, 'pluginName'>[];
  
  /** Custom nodes untuk nodeRegistry (canvas-based editors) */
  nodes?: NodeDefinition[];
  
  /** Komponen halaman editor utama */
  editorView?: React.ComponentType;
  
  /** Aksi context menu klik kanan */
  contextMenus?: ContextMenuGroup[];
  
  /** Lifecycle hook: dipanggil saat plugin pertama kali dimuat */
  onInstall?: (context: PluginContext) => void;
  
  /** Lifecycle hook: dipanggil saat plugin diaktifkan (enable) */
  onEnable?: (context: PluginContext) => void;
  
  /** Lifecycle hook: dipanggil saat plugin dinonaktifkan (disable) */
  onDisable?: (context: PluginContext) => void;
  
  /** Lifecycle hook: dipanggil saat plugin dilepas (unload) */
  onUnload?: (context: PluginContext) => void;
}

/**
 * Helper createPlugin untuk menyediakan type safety deklaratif bagi plugin.
 */
export function createPlugin(def: PluginDefinition): PluginDefinition {
  return def;
}
