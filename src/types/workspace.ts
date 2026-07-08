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
