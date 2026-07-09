import React, { useEffect, useReducer, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { commandRegistry } from '../../registry/commandRegistry';
import { sidebarRegistry, SIDEBAR_CHANGED_EVENT } from '../../registry/sidebarRegistry';
import { editorViewRegistry } from '../../registry/editorViewRegistry';
import { docsRegistry } from '../../registry/docsRegistry';
import { navigationService } from '../../services/navigationService';
import { HelloPlugin } from './HelloPlugin';
import { HelloPluginDocs } from './HelloPluginDocs';

// ─────────────────────────────────────────────────────────────
// HelloPluginLoader: bootstrap component — selalu mounted di App.tsx.
//
// Lifecycle:
// 1. Selalu mendaftarkan sidebar entry (metadata) saat mount.
// 2. Jika plugin enabled: mendaftarkan command, editorView, dan docs.
// 3. Jika plugin disabled: unregister semua service (cleanup).
// 4. Pada unmount: unregister semua.
//
// Proof #1 (command), #4 (sidebar), #6 (docs) ada di sini.
// Proof #2 (shortcut) dan #3 (context menu) ada di HelloPlugin.tsx
// karena mereka context-sensitive (aktif hanya saat editor terbuka).
// ─────────────────────────────────────────────────────────────

const PLUGIN_ID = 'hello-plugin';

export const HelloPluginLoader: React.FC = () => {
  const { addNotification } = useWorkspace();
  const addNotificationRef = useRef(addNotification);
  addNotificationRef.current = addNotification;

  // Re-render saat plugin toggle state berubah
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const handler = () => forceUpdate();
    window.addEventListener(SIDEBAR_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_CHANGED_EVENT, handler);
  }, []);

  const enabled = sidebarRegistry.isEnabled(PLUGIN_ID);

  // ── Proof #4: Sidebar Registration ─────────────────────────────────────
  // Sidebar metadata selalu didaftarkan (bahkan saat plugin disabled),
  // agar toggle bisa ditampilkan di sidebar.
  // ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    sidebarRegistry.register({
      id: PLUGIN_ID,
      label: 'Hello Plugin',
      icon: 'Sparkles',
      section: 'plugins',
      order: 0,
    });

    return () => {
      sidebarRegistry.unregister(PLUGIN_ID);
    };
  }, []);

  // ── Proof #1: Command Registration ─────────────────────────────────────
  // Proof #4: EditorView Registration
  // Proof #6: Docs Registration
  // Semua tergantung enabled state.
  // ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // Proof #1: Command
    commandRegistry.register({
      id: 'hello.greet',
      label: 'Hello Plugin: Greet',
      description: 'Show a hello greeting notification',
      category: 'Hello Plugin',
      icon: 'Sparkles',
      shortcut: 'Ctrl+H',
      handler: () =>
        addNotificationRef.current('success', '👋 Hello from Hello Plugin! Platform services verified.'),
    });

    // Navigation command
    commandRegistry.register({
      id: 'navigation.hello',
      label: 'Open Hello Plugin',
      description: 'Open the Hello Plugin editor',
      category: 'Navigation',
      icon: 'Sparkles',
      handler: () => navigationService.navigate(PLUGIN_ID),
    });

    // Proof #4b: EditorView
    editorViewRegistry.register({
      id: PLUGIN_ID,
      component: HelloPlugin,
    });

    // Proof #6: Docs
    docsRegistry.register({
      id: 'hello.intro',
      title: 'Hello Plugin',
      pluginName: 'Hello Plugin v0.5.5',
      icon: 'Sparkles',
      content: HelloPluginDocs,
      order: 0,
    });

    return () => {
      commandRegistry.unregister('hello.greet');
      commandRegistry.unregister('navigation.hello');
      editorViewRegistry.unregister(PLUGIN_ID);
      docsRegistry.unregister('hello.intro');
    };
  }, [enabled]);

  // Render null — komponen ini hanya mengatur side effects
  return null;
};
