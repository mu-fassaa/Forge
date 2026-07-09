import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  ProjectMetadata,
  WorkspaceSettings,
  ToastNotification,
  ToastType,
  HistoryAction,
  EditorStateSnapshot,
} from '../types/workspace';
import { type EditorType } from '../types';
import { commandRegistry } from '../platform/commands/commandRegistry';
import { shortcutRegistry } from '../platform/commands/shortcutRegistry';
import { navigationService } from '../platform/navigation/navigationService';
import { sessionService } from '../platform/workspace/sessionService';
import { searchService } from '../platform/workspace/searchService';
import { recentGraphManager } from '../platform/workspace/recentGraphManager';


export interface EditorRegistry {
  id: string; // Tipe unik editor (misal: 'dialogue')
  nodes: any[];
  edges: any[];
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  publishInfo?: {
    title: string;
    description: string;
  };
  previewComponent?: React.ComponentType<{
    nodes: any[];
    edges: any[];
    variables: Record<string, string>;
    setVariables: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    addLog: (entry: { type: string; text: string }) => void;
    onClose: () => void;
  }>;
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
  saveProject: (nodes: any[], edges: any[], editorId?: string) => void;
  loadProject: (editorId?: string) => { nodes: any[]; edges: any[] } | null;
  
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
  activeModal: 'settings' | 'publish' | 'profile' | 'about' | 'preview' | null;
  setActiveModal: (modal: 'settings' | 'publish' | 'profile' | 'about' | 'preview' | null) => void;
  
  // Layout tab status (Explorer, History, Collaborators)
  layoutTab: 'explorer' | 'history' | 'collaborators';
  setLayoutTab: (tab: 'explorer' | 'history' | 'collaborators') => void;

  // Active Editor Validation Errors
  validationErrors: any[];
  setValidationErrors: (errors: any[]) => void;

  // Command Palette & Search
  isPaletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  paletteMode: 'command' | 'search';
  openSearch: () => void;

  // Navigation (Platform Layer)
  activeTab: EditorType;
  navigate: (tab: EditorType) => void;
  lastSessionTab: EditorType | null;
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
  const [activeModal, setActiveModal] = useState<'settings' | 'publish' | 'profile' | 'about' | 'preview' | null>(null);

  // ── Active Editor Registry State ──
  const [activeEditor, setActiveEditor] = useState<EditorRegistry | null>(null);

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
  const saveProject = useCallback((nodes: any[], edges: any[], editorId?: string) => {
    const updatedMetadata: ProjectMetadata = {
      ...metadata,
      lastSavedAt: new Date().toISOString(),
    };

    // Baca data editor yang sudah ada untuk di-merge agar tidak menimpa data plugin lain
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let existingEditorData: Record<string, any> = {};
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.editorData) {
          existingEditorData = parsed.editorData;
        }
      } catch (e) {
        console.error('Failed to parse existing project file for merge:', e);
      }
    }

    const targetId = editorId || activeEditor?.id || 'dialogue';
    const updatedEditorData = {
      ...existingEditorData,
      [targetId]: { nodes, edges },
    };

    const projectFile = {
      metadata: updatedMetadata,
      settings,
      editorData: updatedEditorData,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectFile));
    setMetadata(updatedMetadata);
    setIsDirty(false);
    addNotification('success', `Project successfully saved target: "${targetId}"`);
  }, [metadata, settings, activeEditor, addNotification]);

  // Project Deserialization
  const loadProject = useCallback((editorId?: string) => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      const targetId = editorId || activeEditor?.id || 'dialogue';

      // 1. Coba baca key baru dinamis
      if (parsed.editorData?.[targetId]) {
        return parsed.editorData[targetId];
      }
      // 2. Fallback backward compatibility untuk data lama
      if (targetId === 'dialogue' && parsed.editorData?.dialogue) {
        return parsed.editorData.dialogue;
      }
    } catch (e) {
      console.error('Failed to load project state:', e);
      addNotification('error', 'Error loading project file data.');
    }
    return null;
  }, [activeEditor, addNotification]);


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

  // Active validation errors state
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Command Palette & Search state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteMode, setPaletteMode] = useState<'command' | 'search'>('command');
  const openPalette = useCallback(() => { setPaletteMode('command'); setIsPaletteOpen(true); }, []);
  const openSearch = useCallback(() => { setPaletteMode('search'); setIsPaletteOpen(true); }, []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);

  // Navigation state — activeTab dikelola di sini, bukan di App.tsx
  const [lastSessionTab, setLastSessionTab] = useState<EditorType | null>(() => {
    const session = sessionService.restore();
    return session?.lastActiveTab ?? null;
  });
  const [activeTab, setActiveTabState] = useState<EditorType>('dashboard');

  const navigate = useCallback((tab: EditorType) => {
    setActiveTabState(tab);
  }, []);

  // Daftarkan navigate ke NavigationService agar bisa dipanggil dari service layer
  useEffect(() => {
    navigationService.register(navigate);
  }, [navigate]);

  // Simpan session saat activeTab berubah
  useEffect(() => {
    if (activeTab !== 'dashboard') {
      setLastSessionTab(activeTab);
      sessionService.save({ lastActiveTab: activeTab });
    }
  }, [activeTab]);

  // Undo/Redo refs untuk invokasi via shortcut (arg-free)
  const activeEditorRef = useRef(activeEditor);
  activeEditorRef.current = activeEditor;
  const undoRef = useRef(undo);
  undoRef.current = undo;
  const redoRef = useRef(redo);
  redoRef.current = redo;

  // ── Core Command & Shortcut Registration ──
  // Menggunakan ref untuk akses handler terkini tanpa stale closure.
  const setActiveModalRef = useRef(setActiveModal);
  setActiveModalRef.current = setActiveModal;
  const addNotificationRef = useRef(addNotification);
  addNotificationRef.current = addNotification;

  useEffect(() => {
    // ── Workspace Commands ──
    commandRegistry.register({
      id: 'workspace.settings',
      label: 'Open Settings',
      description: 'Open workspace settings and preferences',
      category: 'Workspace',
      icon: 'Settings',
      shortcut: 'Ctrl+,',
      handler: () => setActiveModalRef.current('settings'),
    });
    commandRegistry.register({
      id: 'workspace.publish',
      label: 'Publish Project',
      description: 'Open the publish and export workflow',
      category: 'Workspace',
      icon: 'Upload',
      handler: () => setActiveModalRef.current('publish'),
    });
    commandRegistry.register({
      id: 'workspace.preview',
      label: 'Preview Active Graph',
      description: 'Open the preview modal for the active editor',
      category: 'Workspace',
      icon: 'Play',
      handler: () => setActiveModalRef.current('preview'),
    });
    commandRegistry.register({
      id: 'workspace.palette',
      label: 'Open Command Palette',
      description: 'Search and run any Forge command',
      category: 'Workspace',
      icon: 'Command',
      shortcut: 'Ctrl+K',
      handler: () => { setPaletteMode('command'); setIsPaletteOpen(true); },
    });
    commandRegistry.register({
      id: 'workspace.search',
      label: 'Search Workspace',
      description: 'Search graphs, documentation, and workspace items',
      category: 'Workspace',
      icon: 'Search',
      shortcut: 'Ctrl+P',
      handler: () => { setPaletteMode('search'); setIsPaletteOpen(true); },
    });
    commandRegistry.register({
      id: 'workspace.undo',
      label: 'Undo',
      description: 'Undo the last canvas action',
      category: 'Workspace',
      icon: 'Undo2',
      shortcut: 'Ctrl+Z',
      handler: () => {
        const ed = activeEditorRef.current;
        if (ed) undoRef.current(ed.nodes, ed.edges, ed.setNodes, ed.setEdges);
      },
    });
    commandRegistry.register({
      id: 'workspace.redo',
      label: 'Redo',
      description: 'Redo the last undone canvas action',
      category: 'Workspace',
      icon: 'Redo2',
      shortcut: 'Ctrl+Y',
      handler: () => {
        const ed = activeEditorRef.current;
        if (ed) redoRef.current(ed.nodes, ed.edges, ed.setNodes, ed.setEdges);
      },
    });

    // ── Navigation Commands ──
    commandRegistry.register({
      id: 'navigation.dashboard',
      label: 'Go to Dashboard',
      description: 'Open the Forge workspace launcher',
      category: 'Navigation',
      icon: 'LayoutDashboard',
      handler: () => navigationService.navigate('dashboard'),
    });
    commandRegistry.register({
      id: 'navigation.dialogue',
      label: 'Open Dialogue Editor',
      description: 'Switch to the Dialogue Tree editor',
      category: 'Navigation',
      icon: 'MessageSquare',
      handler: () => navigationService.navigate('dialogue'),
    });
    commandRegistry.register({
      id: 'navigation.docs',
      label: 'Open Documentation',
      description: 'View Forge API and usage documentation',
      category: 'Navigation',
      icon: 'FileText',
      handler: () => navigationService.navigate('docs'),
    });

    // ── Shortcut Registration (Core) ──
    shortcutRegistry.register({
      key: 'ctrl+,',
      commandId: 'workspace.settings',
      handler: () => setActiveModalRef.current('settings'),
    });
    shortcutRegistry.register({
      key: 'ctrl+k',
      commandId: 'workspace.palette',
      handler: () => { setPaletteMode('command'); setIsPaletteOpen(true); },
    });
    shortcutRegistry.register({
      key: 'ctrl+shift+p',
      commandId: 'workspace.palette',
      handler: () => { setPaletteMode('command'); setIsPaletteOpen(true); },
    });
    shortcutRegistry.register({
      key: 'ctrl+p',
      commandId: 'workspace.search',
      handler: () => { setPaletteMode('search'); setIsPaletteOpen(true); },
    });
    shortcutRegistry.register({
      key: 'ctrl+z',
      commandId: 'workspace.undo',
      handler: () => {
        const ed = activeEditorRef.current;
        if (ed) undoRef.current(ed.nodes, ed.edges, ed.setNodes, ed.setEdges);
      },
    });
    shortcutRegistry.register({
      key: 'ctrl+y',
      commandId: 'workspace.redo',
      handler: () => {
        const ed = activeEditorRef.current;
        if (ed) redoRef.current(ed.nodes, ed.edges, ed.setNodes, ed.setEdges);
      },
    });
    shortcutRegistry.register({
      key: 'escape',
      handler: () => {
        setIsPaletteOpen(false);
        setActiveModalRef.current(null);
      },
    });

    // ── Built-in Search Providers ──
    searchService.addProvider({
      id: 'workspace.navigation',
      label: 'Workspace',
      search: (query: string) => {
        const items = [
          { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'Workspace Launcher', category: 'Navigation', icon: 'LayoutDashboard', action: () => navigationService.navigate('dashboard') },
          { id: 'nav-dialogue', title: 'Dialogue Editor', subtitle: 'Open Dialogue Tree graph editor', category: 'Navigation', icon: 'MessageSquare', action: () => navigationService.navigate('dialogue') },
          { id: 'nav-docs', title: 'Documentation', subtitle: 'View Forge API and guides', category: 'Navigation', icon: 'FileText', action: () => navigationService.navigate('docs') },
          { id: 'nav-settings', title: 'Settings', subtitle: 'Open workspace preferences', category: 'Workspace', icon: 'Settings', action: () => setActiveModalRef.current('settings') },
        ];
        const q = query.toLowerCase();
        return q ? items.filter(i => i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q)) : items;
      },
    });
    searchService.addProvider({
      id: 'workspace.recent',
      label: 'Recent Graphs',
      search: (query: string) => {
        const recent = recentGraphManager.getAll();
        const q = query.toLowerCase();
        return recent
          .filter(r => !q || r.projectName.toLowerCase().includes(q) || r.editorType.toLowerCase().includes(q))
          .map(r => ({
            id: `recent-${r.graphId}`,
            title: r.editorType,
            subtitle: `${r.projectName} · Last opened ${new Date(r.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            category: 'Recent',
            icon: 'Clock',
            action: () => navigationService.navigate(r.graphId as EditorType),
          }));
      },
    });

    return () => {
      // Unregister saat provider unmount (edge case: HMR)
      [
        'workspace.settings', 'workspace.publish', 'workspace.preview',
        'workspace.palette', 'workspace.search', 'workspace.undo', 'workspace.redo',
        'navigation.dashboard', 'navigation.dialogue', 'navigation.docs',
      ].forEach((id) => commandRegistry.unregister(id));
      ['ctrl+,', 'ctrl+k', 'ctrl+shift+p', 'ctrl+p', 'ctrl+z', 'ctrl+y', 'escape'].forEach(
        (key) => shortcutRegistry.unregister(key),
      );
      searchService.removeProvider('workspace.navigation');
      searchService.removeProvider('workspace.recent');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        validationErrors,
        setValidationErrors,
        isPaletteOpen,
        openPalette,
        closePalette,
        paletteMode,
        openSearch,
        activeTab,
        navigate,
        lastSessionTab,
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
