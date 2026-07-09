import { type ToastType } from '../types/workspace';
import { type SearchProvider } from '../platform/workspace/searchService';

// ─────────────────────────────────────────────────────────────
// PluginContext: API resmi Platform yang diekspos ke plugin.
// Ini bertindak sebagai sandbox dan satu-satunya jembatan akses.
// ─────────────────────────────────────────────────────────────

export interface PluginContext {
  /** Aksi navigasi global */
  navigation: {
    navigate: (tabId: string) => void;
    goHome: () => void;
  };
  
  /** Aksi workspace/save/load */
  workspace: {
    saveProject: (nodes: any[], edges: any[], editorId?: string) => void;
    loadProject: (editorId?: string) => { nodes: any[]; edges: any[] } | null;
  };
  
  /** Sistem notifikasi toast */
  notifications: {
    add: (type: ToastType, message: string) => void;
  };
  
  /** Logging history */
  history: {
    addLog: (label: string) => void;
  };
  
  /** Provider pencarian Ctrl+P */
  search: {
    addProvider: (provider: SearchProvider) => void;
    removeProvider: (id: string) => void;
  };
  
  /** Eksekusi command programmatik */
  commands: {
    execute: (id: string) => void;
  };
}
