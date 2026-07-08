import { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { DialogueEditor } from './features/dialogue-editor/DialogueEditor';
import { type EditorType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<EditorType>('dashboard');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard onSelectTool={setActiveTab} />
      )}
      {activeTab === 'dialogue' && (
        <DialogueEditor />
      )}
    </DashboardLayout>
  );
}

export default App;
