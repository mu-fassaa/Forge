import React from 'react';
import { useWorkspace } from './context/WorkspaceContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { DocsPage } from './features/docs/DocsPage';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { NotificationSystem } from './components/workspace/NotificationSystem';
import { SettingsModal } from './components/workspace/SettingsModal';
import { PublishModal } from './components/workspace/PublishModal';
import { PreviewModal } from './components/workspace/PreviewModal';
import { CommandPalette } from './components/workspace/CommandPalette';
import { ContextMenuOverlay } from './components/workspace/ContextMenuOverlay';
import { editorViewRegistry } from './platform/navigation/editorViewRegistry';
import { PluginLoader } from './plugin/PluginLoader';

function AppContent() {
  const { activeTab } = useWorkspace();

  // Dynamic plugin view dari EditorViewRegistry
  // Core (dashboard, docs) tetap hardcoded.
  // Seluruh plugin editors (seperti Dialogue Editor dan Hello Plugin) dirender secara dinamis.
  const pluginEntry = editorViewRegistry.get(activeTab);

  return (
    <DashboardLayout>
      {activeTab === 'dashboard' && <Dashboard />}
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
      {/* Plugin Loaders — selalu di-mount untuk memanage runtime plugin lifecycle */}
      <PluginLoader />
    </WorkspaceProvider>
  );
}

export default App;
