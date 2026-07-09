import React, { useEffect, useReducer, useRef } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { pluginManager } from './PluginManager';
import { type PluginContext } from './PluginContext';
import { sidebarRegistry, SIDEBAR_CHANGED_EVENT } from '../platform/navigation/sidebarRegistry';
import { navigationService } from '../platform/navigation/navigationService';
import { commandRegistry } from '../platform/commands/commandRegistry';
import { searchService } from '../platform/workspace/searchService';
import { nodeRegistry } from '../platform/workspace/nodeRegistry';
import { editorViewRegistry } from '../platform/navigation/editorViewRegistry';

// Import concrete plugins
import { dialoguePlugin } from '../plugins/dialogue';
import { helloPlugin } from '../plugins/hello';

// ─────────────────────────────────────────────────────────────
// PluginLoader: bootstrap global mounted di App.tsx.
// Bertanggung jawab mendaftarkan plugin dan mereaksikan lifecycle
// enable/disable plugin berdasarkan sidebar toggle.
// ─────────────────────────────────────────────────────────────

export const PluginLoader: React.FC = () => {
  const {
    saveProject,
    loadProject,
    addNotification,
    addHistoryLog,
  } = useWorkspace();

  // Refs untuk mencegah closure stale
  const saveProjectRef = useRef(saveProject);
  saveProjectRef.current = saveProject;
  const loadProjectRef = useRef(loadProject);
  loadProjectRef.current = loadProject;
  const addNotificationRef = useRef(addNotification);
  addNotificationRef.current = addNotification;
  const addHistoryLogRef = useRef(addHistoryLog);
  addHistoryLogRef.current = addHistoryLog;

  // Force update saat toggle plugin diubah
  const [toggleState, triggerSync] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const handler = () => triggerSync();
    window.addEventListener(SIDEBAR_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_CHANGED_EVENT, handler);
  }, []);

  // 1. Registrasi Awal (Install Time)
  // Dipanggil sekali saat app mount
  useEffect(() => {
    try {
      pluginManager.registerPlugin(dialoguePlugin);
      pluginManager.registerPlugin(helloPlugin);
      
      // Panggil hook onInstall jika terdefinisi
      const context = createPluginContext('dialogue');
      if (dialoguePlugin.onInstall) dialoguePlugin.onInstall(context);
      if (helloPlugin.onInstall) helloPlugin.onInstall(createPluginContext('hello'));
    } catch (e: any) {
      addNotificationRef.current('error', `Plugin registration failed: ${e.message}`);
    }

    return () => {
      // HMR/Unmount cleanup: unload plugins cleanly
      const contextDiag = createPluginContext('dialogue');
      pluginManager.unloadPlugin('dialogue', contextDiag);
      pluginManager.unloadPlugin('hello-plugin', createPluginContext('hello'));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper untuk membuat PluginContext sandbox per plugin
  const createPluginContext = (pluginId: string): PluginContext => {
    return {
      navigation: {
        navigate: (tabId) => navigationService.navigate(tabId),
        goHome: () => navigationService.goHome(),
      },
      workspace: {
        saveProject: (nodes, edges, editorId) =>
          saveProjectRef.current(nodes, edges, editorId ?? pluginId),
        loadProject: (editorId) => loadProjectRef.current(editorId ?? pluginId),
      },
      notifications: {
        add: (type, message) => addNotificationRef.current(type, message),
      },
      history: {
        addLog: (label) => addHistoryLogRef.current(label),
      },
      search: {
        addProvider: (provider) => searchService.addProvider(provider),
        removeProvider: (id) => searchService.removeProvider(id),
      },
      commands: {
        execute: (id) => {
          const cmd = commandRegistry.get(id);
          if (cmd) cmd.handler();
        },
      },
    };
  };

  // 2. React to Enable/Disable Toggle
  useEffect(() => {
    const plugins = pluginManager.getAllPlugins();
    for (const plugin of plugins) {
      const id = plugin.manifest.id;
      const shouldBeEnabled = sidebarRegistry.isEnabled(id);
      const isCurrentlyEnabled = pluginManager.isActive(id);

      const context = createPluginContext(id);

      if (shouldBeEnabled && !isCurrentlyEnabled) {
        pluginManager.enablePlugin(id, context);
      } else if (!shouldBeEnabled && isCurrentlyEnabled) {
        pluginManager.disablePlugin(id, context);
      }
    }

    // 3. Update Bootstrap Report Dinamis untuk Debugging Startup
    const registeredPlugins = pluginManager.getAllPlugins();
    (window as any).__forgeBootstrapReport = {
      timestamp: new Date().toISOString(),
      platform: {
        commandRegistry: typeof commandRegistry !== 'undefined',
        sidebarRegistry: typeof sidebarRegistry !== 'undefined',
        nodeRegistry: typeof nodeRegistry !== 'undefined',
        editorViewRegistry: typeof editorViewRegistry !== 'undefined',
        pluginManager: typeof pluginManager !== 'undefined',
      },
      plugins: registeredPlugins.reduce((acc, p) => {
        acc[p.manifest.id] = pluginManager.isActive(p.manifest.id);
        return acc;
      }, {} as Record<string, boolean>),
      views: registeredPlugins.reduce((acc, p) => {
        acc[p.manifest.id] = p.editorView ? p.editorView.name || 'Component' : null;
        return acc;
      }, {} as Record<string, string | null>),
      sidebar: sidebarRegistry.getAll().map(e => e.id),
      commands: commandRegistry.getAll().length,
      nodes: nodeRegistry.getAll().length,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleState]);

  return null;
};
