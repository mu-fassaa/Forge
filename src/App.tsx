import React, { useEffect, useReducer } from 'react';
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
import { editorViewRegistry, EDITOR_VIEW_CHANGED_EVENT } from './platform/navigation/editorViewRegistry';
import { PluginLoader } from './plugin/PluginLoader';

function AppContent() {
  const { activeTab } = useWorkspace();

  // Subscribe ke perubahan editorViewRegistry agar AppContent re-render
  // saat plugin selesai mendaftarkan editor view mereka (setelah useEffect mount)
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const handler = () => forceUpdate();
    window.addEventListener(EDITOR_VIEW_CHANGED_EVENT, handler);
    return () => window.removeEventListener(EDITOR_VIEW_CHANGED_EVENT, handler);
  }, []);

  const pluginEntry = editorViewRegistry.get(activeTab);
  const isCoreTab = activeTab === 'dashboard' || activeTab === 'docs';

  return (
    <DashboardLayout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'docs' && <DocsPage />}
      {!isCoreTab && (
        pluginEntry ? (
          React.createElement(pluginEntry.component)
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#070814] text-gray-400 p-8 select-text">
            <div className="max-w-md text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto text-red-500">
                <span className="text-xl font-bold">!</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Editor View Not Found</h3>
              <p className="text-xs leading-relaxed text-[#8E9BB4]">
                Editor <code className="bg-[#0c1833] px-1.5 py-0.5 rounded text-red-400 font-mono">'{activeTab}'</code> tidak ditemukan.
              </p>
              <p className="text-[11px] text-[#3d5275] leading-relaxed">
                Pastikan plugin telah mendaftarkan editor view ke <code className="bg-[#0c1833] px-1.5 py-0.5 rounded text-[#00A3FF] font-mono">editorViewRegistry</code>.
              </p>
            </div>
          </div>
        )
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
      <ContextMenuOverlay />
      {/* Plugin Loaders — selalu di-mount untuk memanage runtime plugin lifecycle */}
      <PluginLoader />
    </WorkspaceProvider>
  );
}

export default App;
