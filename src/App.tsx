import React from 'react';
import { useWorkspace } from './context/WorkspaceContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { DialogueEditor } from './features/dialogue-editor/DialogueEditor';
import { DocsPage } from './features/docs/DocsPage';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { NotificationSystem } from './components/workspace/NotificationSystem';
import { SettingsModal } from './components/workspace/SettingsModal';
import { PublishModal } from './components/workspace/PublishModal';
import { PreviewModal } from './components/workspace/PreviewModal';
import { CommandPalette } from './components/workspace/CommandPalette';
import { ContextMenuOverlay } from './components/workspace/ContextMenuOverlay';
import { editorViewRegistry } from './registry/editorViewRegistry';
import { HelloPluginLoader } from './features/hello-plugin/HelloPluginLoader';

function AppContent() {
  const { activeTab } = useWorkspace();

  // Dynamic plugin view dari EditorViewRegistry
  // Core editors (dashboard, dialogue, docs) tetap hardcoded.
  // Plugin editors dirender secara dinamis dari registry.
  const pluginEntry = editorViewRegistry.get(activeTab);

  return (
    <DashboardLayout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'dialogue' && <DialogueEditor />}
      {activeTab === 'docs' && <DocsPage />}
      {pluginEntry && React.createElement(pluginEntry.component)}
    </DashboardLayout>
  );
}

function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
      {/* Global overlay systems */}
      <NotificationSystem />
      <SettingsModal />
      <PublishModal />
      <PreviewModal />
      <CommandPalette />
      <ContextMenuOverlay />
      {/* Plugin Loaders — always mounted, register services */}
      <HelloPluginLoader />
    </WorkspaceProvider>
  );
}

export default App;
