// ─── Command Registry ────────────────────────────────────────
export interface CommandDefinition {
  /** Unique dot-namespaced ID: 'workspace.save', 'dialogue.export' */
  id: string;
  /** Human-readable label shown in the Command Palette */
  label: string;
  /** Short description shown below the label */
  description?: string;
  /** Category group: 'Workspace', 'Navigation', 'Dialogue', etc. */
  category: string;
  /** Lucide icon name */
  icon: string;
  /** Human-readable shortcut displayed as a badge: 'Ctrl+S' */
  shortcut?: string;
  /** The function executed when this command is invoked */
  handler: () => void;
}

// ─── Shortcut Registry ───────────────────────────────────────
export interface ShortcutDefinition {
  /** Normalized key combo: 'ctrl+s', 'ctrl+shift+p' */
  key: string;
  /** Optional: delegate to a registered command by ID */
  commandId?: string;
  /** Optional: direct handler (used when no commandId is linked) */
  handler?: () => void;
  /** Scope constraint (future use, defaults to 'global') */
  scope?: 'global' | 'dialogue' | 'canvas';
}

// ─── Recent Graph Manager ────────────────────────────────────
export interface RecentGraphEntry {
  /** Editor plugin ID: 'dialogue', 'quest', etc. */
  graphId: string;
  /** Project name at time of recording */
  projectName: string;
  /** Editor type label for display */
  editorType: string;
  /** ISO timestamp of last open */
  lastOpenedAt: string;
  /** Node count at last save */
  nodeCount?: number;
  /** Edge count at last save */
  edgeCount?: number;
}

export interface ProjectMetadata {
  name: string;
  version: string;
  createdAt: string;
  lastSavedAt: string | null;
}

export interface WorkspaceSettings {
  theme: 'dark' | 'light';
  autosave: boolean;
  grid: boolean;
  snap: boolean;
  language: 'id' | 'en';
}

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

export interface HistoryAction {
  id: string;
  timestamp: string;
  label: string;      // Human-readable description (e.g. "Added Dialogue Card")
}

// Representasi state utuh editor untuk undo/redo stack
export interface EditorStateSnapshot {
  nodes: any[];
  edges: any[];
}
