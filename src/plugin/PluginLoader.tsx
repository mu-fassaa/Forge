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
// Registrasi plugin dilakukan di LEVEL MODUL (di luar React),
// bukan di dalam useEffect, untuk menghindari race condition
// akibat StrictMode double-invocation + cleanup.
// ─────────────────────────────────────────────────────────────
pluginManager.registerPlugin(dialoguePlugin);
pluginManager.registerPlugin(helloPlugin);

// ─────────────────────────────────────────────────────────────
// PluginLoader: bootstrap global mounted di App.tsx.
// Bertanggung jawab mensinkronkan enable/disable plugin
// berdasarkan sidebar toggle.
// ─────────────────────────────────────────────────────────────

export const PluginLoader: React.FC = () => {
  const {
    saveProject,
    loadProject,
    addNotification,
    addHistoryLog,
    activeTab,
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

  // Force update saat toggle plugin diubah
  const [toggleState, triggerSync] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const handler = () => triggerSync();
    window.addEventListener(SIDEBAR_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_CHANGED_EVENT, handler);
  }, []);

  // Sinkronisasi Enable/Disable Plugin
  // Berjalan pada mount (untuk enable semua plugin default) dan setiap kali
  // sidebar toggle berubah.
  useEffect(() => {
    const plugins = pluginManager.getAllPlugins();
    console.log('[PluginLoader] Sync plugins, total:', plugins.length);
    for (const plugin of plugins) {
      const id = plugin.manifest.id;
      const shouldBeEnabled = sidebarRegistry.isEnabled(id);
      const isCurrentlyEnabled = pluginManager.isActive(id);
      console.log(`[PluginLoader] Syncing plugin "${id}": shouldBeEnabled=${shouldBeEnabled}, isCurrentlyEnabled=${isCurrentlyEnabled}`);
      const context = createPluginContext(id);

      if (shouldBeEnabled && !isCurrentlyEnabled) {
        console.log(`[PluginLoader] Calling enablePlugin for "${id}"`);
        pluginManager.enablePlugin(id, context);
      } else if (!shouldBeEnabled && isCurrentlyEnabled) {
        console.log(`[PluginLoader] Calling disablePlugin for "${id}"`);
        pluginManager.disablePlugin(id, context);
      }
    }

    // Update Bootstrap Report untuk debugging startup
    const registeredPlugins = pluginManager.getAllPlugins();
    const activeReport = {
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
    (window as any).__forgeBootstrapReport = activeReport;

    // Cetak LOG TRACE startup sesuai format request
    const dialogueActive = pluginManager.isActive('dialogue');
    const helloActive = pluginManager.isActive('hello-plugin');
    const editorViews = editorViewRegistry.getAll().map(v => v.id);
    const sidebarEntries = sidebarRegistry.getAll().map(e => e.id);

    console.log(`
PluginLoader
${dialogueActive ? '✓ dialogue enabled' : '✗ dialogue disabled'}
${helloActive ? '✓ hello-plugin enabled' : '✗ hello-plugin disabled'}

Editor Views
✓ dashboard
${editorViews.includes('dialogue') ? '✓ dialogue' : '✗ dialogue'}
${editorViews.includes('hello-plugin') ? '✓ hello-plugin' : '✗ hello-plugin'}

Sidebar
${sidebarEntries.includes('dialogue') ? '✓ dialogue' : '✗ dialogue'}
${sidebarEntries.includes('hello-plugin') ? '✓ hello-plugin' : '✗ hello-plugin'}

Navigation
✓ dialogue -> ${editorViewRegistry.get('dialogue') ? 'DialogueEditor' : 'NOT FOUND'}
    `);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleState, activeTab]);

  return null;
};
