import { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { DialogueEditor } from './features/dialogue-editor/DialogueEditor';
import { DocsPage } from './features/docs/DocsPage';
import { type EditorType } from './types';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { NotificationSystem } from './components/workspace/NotificationSystem';
import { SettingsModal } from './components/workspace/SettingsModal';
import { PublishModal } from './components/workspace/PublishModal';
import { PreviewModal } from './components/workspace/PreviewModal';
import { CommandPalette } from './components/workspace/CommandPalette';

function AppContent() {
  const [activeTab, setActiveTab] = useState<EditorType>('dashboard');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard onSelectTool={setActiveTab} />
      )}
      {activeTab === 'dialogue' && (
        <DialogueEditor />
      )}
      {activeTab === 'docs' && (
        <DocsPage />
      )}
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
    </WorkspaceProvider>
  );
}

export default App;
