import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  ProjectMetadata,
  WorkspaceSettings,
  ToastNotification,
  ToastType,
  HistoryAction,
  EditorStateSnapshot,
} from '../types/workspace';

export interface EditorRegistry {
  nodes: any[];
  edges: any[];
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
}

interface WorkspaceContextProps {
  metadata: ProjectMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
  settings: WorkspaceSettings;
  updateSettings: <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  
  // Active Editor Registry
  activeEditor: EditorRegistry | null;
  setActiveEditor: (editor: EditorRegistry | null) => void;
  
  // Save/Load Systems
  saveProject: (nodes: any[], edges: any[]) => void;
  loadProject: () => { nodes: any[]; edges: any[] } | null;
  
  // History System (Change Logs & Stack)
  historyLogs: HistoryAction[];
  addHistoryLog: (label: string) => void;
  clearHistory: () => void;
  undo: (currentNodes: any[], currentEdges: any[], setNodes: any, setEdges: any) => void;
  redo: (currentNodes: any[], currentEdges: any[], setNodes: any, setEdges: any) => void;
  pushStateToStack: (nodes: any[], edges: any[]) => void;
  
  // Toast Notification System
  notifications: ToastNotification[];
  addNotification: (type: ToastType, message: string) => void;
  removeNotification: (id: string) => void;
  
  // Active modals status
  activeModal: 'settings' | 'publish' | 'profile' | 'about' | null;
  setActiveModal: (modal: 'settings' | 'publish' | 'profile' | 'about' | null) => void;
  
  // Layout tab status (Explorer, History, Collaborators)
  layoutTab: 'explorer' | 'history' | 'collaborators';
  setLayoutTab: (tab: 'explorer' | 'history' | 'collaborators') => void;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'forge_workspace_project_v1';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Project Metadata ──
  const [metadata, setMetadata] = useState<ProjectMetadata>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.metadata) return parsed.metadata;
      } catch (e) {
        console.error('Failed to parse metadata from local storage:', e);
      }
    }
    return {
      name: 'Forge Project Manager',
      version: '0.1.0',
      createdAt: new Date().toISOString(),
      lastSavedAt: null,
    };
  });

  // ── Settings ──
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.settings) return parsed.settings;
      } catch (e) {
        console.error('Failed to parse settings from local storage:', e);
      }
    }
    return {
      theme: 'dark',
      autosave: false,
      grid: true,
      snap: true,
      language: 'id',
    };
  });

  // ── Unsaved Changes indicator ──
  const [isDirty, setIsDirty] = useState(false);

  // ── Active Overlay Modals ──
  const [activeModal, setActiveModal] = useState<'settings' | 'publish' | 'profile' | 'about' | null>(null);

  // ── Notification state ──
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // ── History logs (Human changes list) & Undo/Redo Stacks ──
  const [historyLogs, setHistoryLogs] = useState<HistoryAction[]>([]);
  const [pastStack, setPastStack] = useState<EditorStateSnapshot[]>([]);
  const [futureStack, setFutureStack] = useState<EditorStateSnapshot[]>([]);

  // Add toast notification helper
  const addNotification = useCallback((type: ToastType, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastNotification = { id, type, message, duration: 4000 };
    setNotifications((prev) => [...prev, newToast]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync settings helper
  const updateSettings = useCallback(<K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      addNotification('info', `Preference updated: ${key} = ${value}`);
      return updated;
    });
    setIsDirty(true);
  }, [addNotification]);

  // Log user actions into change list
  const addHistoryLog = useCallback((label: string) => {
    const newAction: HistoryAction = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      label,
    };
    setHistoryLogs((prev) => [newAction, ...prev].slice(0, 50)); // limit 50 logs
    setIsDirty(true);
  }, []);

  const clearHistory = useCallback(() => {
    setHistoryLogs([]);
    setPastStack([]);
    setFutureStack([]);
  }, []);

  // Save current state snapshot to undo stack
  const pushStateToStack = useCallback((nodes: any[], edges: any[]) => {
    const snapshot: EditorStateSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    setPastStack((prev) => [...prev, snapshot]);
    setFutureStack([]); // Clear redo stack on new action
  }, []);

  // Undo execution
  const undo = useCallback((currentNodes: any[], currentEdges: any[], setNodes: any, setEdges: any) => {
    if (pastStack.length === 0) {
      addNotification('warning', 'Nothing to Undo');
      return;
    }

    const currentSnapshot: EditorStateSnapshot = {
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
    };

    const previous = pastStack[pastStack.length - 1];
    setPastStack((prev) => prev.slice(0, -1));
    setFutureStack((prev) => [...prev, currentSnapshot]);

    setNodes(previous.nodes);
    setEdges(previous.edges);
    
    // Log the undo action
    const undoAction: HistoryAction = {
      id: `history_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      label: 'Performed Undo',
    };
    setHistoryLogs((prev) => [undoAction, ...prev]);
    addNotification('info', 'Undo action performed');
  }, [pastStack, addNotification]);

  // Redo execution
  const redo = useCallback((currentNodes: any[], currentEdges: any[], setNodes: any, setEdges: any) => {
    if (futureStack.length === 0) {
      addNotification('warning', 'Nothing to Redo');
      return;
    }

    const currentSnapshot: EditorStateSnapshot = {
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
    };

    const next = futureStack[futureStack.length - 1];
    setFutureStack((prev) => prev.slice(0, -1));
    setPastStack((prev) => [...prev, currentSnapshot]);

    setNodes(next.nodes);
    setEdges(next.edges);

    // Log the redo action
    const redoAction: HistoryAction = {
      id: `history_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      label: 'Performed Redo',
    };
    setHistoryLogs((prev) => [redoAction, ...prev]);
    addNotification('info', 'Redo action performed');
  }, [futureStack, addNotification]);

  // Project Serialization & Local Saving
  const saveProject = useCallback((nodes: any[], edges: any[]) => {
    const updatedMetadata: ProjectMetadata = {
      ...metadata,
      lastSavedAt: new Date().toISOString(),
    };

    const projectFile = {
      metadata: updatedMetadata,
      settings,
      editorData: {
        dialogue: { nodes, edges },
      },
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectFile));
    setMetadata(updatedMetadata);
    setIsDirty(false);
    addNotification('success', 'Project saved successfully to local workspace!');
  }, [metadata, settings, addNotification]);

  // Project Deserialization
  const loadProject = useCallback(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.editorData?.dialogue) {
        return parsed.editorData.dialogue;
      }
    } catch (e) {
      console.error('Failed to load project state:', e);
      addNotification('error', 'Error loading project file data.');
    }
    return null;
  }, [addNotification]);

  // Registry state for active editor
  const [activeEditor, setActiveEditor] = useState<EditorRegistry | null>(null);

  // Autosave execution
  useEffect(() => {
    if (!settings.autosave || !isDirty || !activeEditor) return;

    const timer = setTimeout(() => {
      saveProject(activeEditor.nodes, activeEditor.edges);
      addNotification('info', 'Autosave triggered: Project changes saved.');
    }, 15000); // 15 seconds autosave debounce

    return () => clearTimeout(timer);
  }, [settings.autosave, isDirty, activeEditor, saveProject, addNotification]);

  // Active Layout Tab state
  const [layoutTab, setLayoutTab] = useState<'explorer' | 'history' | 'collaborators'>('explorer');

  return (
    <WorkspaceContext.Provider
      value={{
        metadata,
        setMetadata,
        settings,
        updateSettings,
        isDirty,
        setIsDirty,
        activeEditor,
        setActiveEditor,
        saveProject,
        loadProject,
        historyLogs,
        addHistoryLog,
        clearHistory,
        undo,
        redo,
        pushStateToStack,
        notifications,
        addNotification,
        removeNotification,
        activeModal,
        setActiveModal,
        layoutTab,
        setLayoutTab,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
