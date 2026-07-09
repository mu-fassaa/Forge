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

function AppContent() {
  const { activeTab } = useWorkspace();

  return (
    <DashboardLayout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'dialogue' && <DialogueEditor />}
      {activeTab === 'docs' && <DocsPage />}
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
    </WorkspaceProvider>
  );
}

export default App;
