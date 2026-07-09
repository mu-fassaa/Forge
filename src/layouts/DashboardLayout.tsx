import React, { useState, useEffect, useReducer } from 'react';
import { EDITOR_TOOLS } from '../utils/tools';
import { LucideIcon } from '../components/LucideIcon';
import { useWorkspace } from '../context/WorkspaceContext';
import { UserMenu } from '../components/workspace/UserMenu';
import { StatusBar } from '../components/workspace/StatusBar';
import { TabBar } from '../components/workspace/TabBar';
import { shortcutRegistry } from '../platform/commands/shortcutRegistry';
import { sidebarRegistry, SIDEBAR_CHANGED_EVENT } from '../platform/navigation/sidebarRegistry';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    metadata,
    isDirty,
    saveProject,
    activeEditor,
    setActiveModal,
    layoutTab,
    setLayoutTab,
    addNotification,
    activeTab,
    navigate,
  } = useWorkspace();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Re-render saat plugin registry berubah (plugin mount/unmount/toggle)
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const handler = () => forceUpdate();
    window.addEventListener(SIDEBAR_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_CHANGED_EVENT, handler);
  }, []);

  // ── Global Keyboard Shortcut Listener ──────────────────────────────────
  // Satu listener global. Shortcut didelegasikan ke shortcutRegistry.
  // DashboardLayout tidak mengetahui isi shortcut — hanya memanggil resolve().
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const resolved = shortcutRegistry.resolve(e);
      if (!resolved) return;
      e.preventDefault();
      resolved.handler?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07122A] text-[#F3F4F6] font-sans antialiased">
      {/* Sidebar - Panel Kiri */}
      <aside className="w-64 border-r border-[#1a2d54] bg-[#0c1833] flex flex-col h-full select-none shrink-0">
        
        {/* Logo & Versi */}
        <div className="p-5 border-b border-[#1a2d54] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#122247] border border-[#00A3FF] flex items-center justify-center shadow-md">
            <span className="font-extrabold text-[#00A3FF] text-sm">F</span>
          </div>
          <div>
            <h1 className="font-extrabold text-xs leading-tight text-[#F3F4F6] tracking-widest uppercase">Forge</h1>
            <p className="text-[9px] text-[#8E9BB4] tracking-wider font-bold font-mono">V{metadata.version} ALPHA</p>
          </div>
        </div>

        {/* Tombol New Graph */}
        <div className="px-4 py-4">
          <button
            onClick={() => {
              if (activeTab === 'dialogue') {
                addNotification('info', 'Please click "Clear" on the toolbar to reset the graph.');
              } else {
                navigate('dialogue');
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#00A3FF] hover:bg-[#008be6] text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm"
          >
            <LucideIcon name="Plus" size={13} className="stroke-[3]" />
            New Graph
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-5">
          {/* Menu Utama */}
          <div>
            <span className="px-3 text-[9px] uppercase font-bold tracking-widest text-[#8E9BB4]/60 block mb-2 font-mono">
              Main Menu
            </span>
            <button
              onClick={() => navigate('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#122247] text-[#00A3FF] border border-[#00A3FF]/20'
                  : 'text-[#8E9BB4] hover:bg-[#122247]/40 hover:text-white border border-transparent'
              }`}
            >
              <LucideIcon name="LayoutDashboard" size={15} />
              Dashboard
            </button>
          </div>

          {/* Editors & Databases */}
          <div>
            <span className="px-3 text-[9px] uppercase font-bold tracking-widest text-[#8E9BB4]/60 block mb-2 font-mono">
              Editors & Databases
            </span>
            <div className="space-y-1">
              {EDITOR_TOOLS.map((tool) => {
                // Sembunyikan link jika ia adalah plugin dialogue dan sedang dinonaktifkan
                const isDialogue = tool.id === 'dialogue';
                const isPluginEnabled = sidebarRegistry.isEnabled(tool.id);
                if (isDialogue && !isPluginEnabled) return null;

                const isActive = activeTab === tool.id;
                const isComingSoon = tool.status === 'coming-soon';

                return (
                  <button
                    key={tool.id}
                    onClick={() => !isComingSoon && navigate(tool.id)}
                    disabled={isComingSoon}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 border cursor-pointer ${
                      isActive
                        ? 'bg-[#00A3FF]/10 text-[#00A3FF] border-[#00A3FF]/25'
                        : isComingSoon
                        ? 'opacity-30 text-gray-500 border-transparent cursor-not-allowed'
                        : 'text-[#8E9BB4] hover:bg-[#122247]/40 hover:text-white border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LucideIcon name={tool.icon} size={15} />
                      <span>{tool.sidebarName || tool.name}</span>
                    </div>
                    {isComingSoon && (
                      <span className="text-[7px] uppercase tracking-wider font-extrabold bg-[#122247] px-1.5 py-0.5 rounded text-gray-500 font-mono">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Installed Plugins — dari sidebarRegistry */}
          {sidebarRegistry.hasEntries() && (
            <div>
              <span className="block px-3 mb-1.5 text-[9px] uppercase font-extrabold tracking-widest text-[#3d5275] font-mono">
                Installed Plugins
              </span>
              <div className="space-y-0.5">
                {sidebarRegistry.getAll().map((entry) => {
                  const enabled = sidebarRegistry.isEnabled(entry.id);
                  const isActive = activeTab === entry.id;
                  return (
                    <div key={entry.id} className="flex items-center gap-1 group/plugin">
                      <button
                        onClick={() => enabled && navigate(entry.id)}
                        disabled={!enabled}
                        className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 border ${
                          isActive && enabled
                            ? 'bg-[#00A3FF]/10 text-[#00A3FF] border-[#00A3FF]/25 cursor-pointer'
                            : !enabled
                            ? 'opacity-30 text-gray-500 border-transparent cursor-not-allowed'
                            : 'text-[#8E9BB4] hover:bg-[#122247]/40 hover:text-white border-transparent cursor-pointer'
                        }`}
                      >
                        <LucideIcon name={entry.icon} size={15} />
                        <span>{entry.label}</span>
                      </button>
                      {/* Enable/disable toggle */}
                      <button
                        onClick={() => {
                          const next = !enabled;
                          sidebarRegistry.setEnabled(entry.id, next);
                          // Jika sedang di tab ini dan dinonaktifkan, kembali ke home
                          if (!next && isActive) navigate('dashboard');
                        }}
                        className="opacity-0 group-hover/plugin:opacity-100 shrink-0 p-1 rounded text-[#3d5275] hover:text-[#8E9BB4] transition-all cursor-pointer"
                        title={enabled ? 'Disable plugin' : 'Enable plugin'}
                      >
                        <LucideIcon
                          name={enabled ? 'ToggleRight' : 'ToggleLeft'}
                          size={16}
                          className={enabled ? 'text-[#00A3FF]' : 'text-[#3d5275]'}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Project Settings */}
          <div>
            <div className="space-y-1">
              <button
                disabled
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 opacity-30 border border-transparent cursor-not-allowed"
              >
                <LucideIcon name="Settings" size={15} />
                Project Settings
              </button>
            </div>
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-[#1a2d54] bg-[#07122A] text-[10px] text-[#8E9BB4] flex flex-col gap-2">
          <button
            onClick={() => navigate('docs')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
              activeTab === 'docs'
                ? 'bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20'
                : 'text-[#8E9BB4] hover:text-white border border-transparent'
            }`}
          >
            <LucideIcon name="FileText" size={12} />
            Documentation
          </button>
          <div className="flex items-center justify-between pt-1 border-t border-[#1a2d54]/50 text-[9px] font-mono">
            <span>v{metadata.version}</span>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </aside>

      {/* Panel Utama (Kanan) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07122A]">
        
        {/* Header Atas */}
        <header className="h-14 border-b border-[#1a2d54] bg-[#0c1833] px-6 flex items-center justify-between select-none shrink-0">
          {/* Left Title + Unsaved Changes dot */}
          <div className="flex items-center gap-4 select-none font-mono text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-[#8E9BB4]/65">
              <span>PROJECT:</span>
              <span className="text-white uppercase">{metadata.name}</span>
            </div>
            <span className="text-[#8E9BB4]/40">/</span>
            <div className="flex items-center gap-1.5 text-[#8E9BB4]/65">
              <span>WORKSPACE:</span>
              <span className="text-[#00A3FF] uppercase">
                {activeTab === 'dashboard' ? 'LAUNCHER' : activeTab.toUpperCase()}
              </span>
            </div>

            {isDirty && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                <span className="w-1.2 h-1.2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-500">Unsaved</span>
              </div>
            )}
          </div>

          {/* Tabs Menu Tengah */}
          <div className="flex h-full items-center gap-6">
            <button
              onClick={() => setLayoutTab('explorer')}
              className={`h-full border-b-2 px-1 transition-all cursor-pointer flex items-center ${
                layoutTab === 'explorer'
                  ? 'border-[#00A3FF] text-[#00A3FF] text-xs font-bold'
                  : 'border-transparent text-[#8E9BB4] hover:text-[#F3F4F6] text-xs font-semibold'
              }`}
            >
              Explorer
            </button>
            <button
              onClick={() => setLayoutTab('history')}
              className={`h-full border-b-2 px-1 transition-all cursor-pointer flex items-center ${
                layoutTab === 'history'
                  ? 'border-[#00A3FF] text-[#00A3FF] text-xs font-bold'
                  : 'border-transparent text-[#8E9BB4] hover:text-[#F3F4F6] text-xs font-semibold'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setLayoutTab('collaborators')}
              className={`h-full border-b-2 px-1 transition-all cursor-pointer flex items-center ${
                layoutTab === 'collaborators'
                  ? 'border-[#00A3FF] text-[#00A3FF] text-xs font-bold'
                  : 'border-transparent text-[#8E9BB4] hover:text-[#F3F4F6] text-xs font-semibold'
              }`}
            >
              Collaborators
            </button>
          </div>

          {/* Tombol Aksi Kanan */}
          <div className="flex items-center gap-4 relative">
            {/* Notifikasi & Cloud Status */}
            <div className="flex items-center gap-3 text-[#8E9BB4]">
              <button className="hover:text-white transition-colors cursor-pointer relative">
                <LucideIcon name="Bell" size={15} />
                <span className="absolute top-0 right-0 w-1 h-1 bg-[#00A3FF] rounded-full"></span>
              </button>
              <button className="hover:text-white transition-colors cursor-pointer">
                <LucideIcon name="Cloud" size={15} />
              </button>
            </div>

            {/* Garis Pemisah */}
            <div className="h-4 w-[1px] bg-[#1a2d54]"></div>

            {/* Tombol Save & Publish */}
            <button
              onClick={() => {
                if (activeEditor) {
                  saveProject(activeEditor.nodes, activeEditor.edges);
                } else {
                  addNotification('info', 'Nothing active to save.');
                }
              }}
              className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                isDirty
                  ? 'border-[#00A3FF] text-[#00A3FF] bg-[#00A3FF]/5 hover:bg-[#00A3FF]/10'
                  : 'border-[#1a2d54] hover:border-gray-500 text-[#8E9BB4]'
              }`}
            >
              Save
            </button>
            <button
              onClick={() => setActiveModal('publish')}
              className="px-3 py-1.5 rounded-lg bg-[#00A3FF] hover:bg-[#008be6] text-white font-bold text-[10px] uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm"
            >
              Publish
            </button>

            {/* Avatar Pengguna */}
            <div className="relative">
              <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-7 h-7 rounded-full bg-[#122247] border border-[#00A3FF]/20 flex items-center justify-center font-bold text-xs text-[#00A3FF] hover:border-[#00A3FF]/60 cursor-pointer select-none transition-all"
              >
                U
              </div>
              <UserMenu isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} />
            </div>
          </div>
        </header>

        {/* Tab Bar — hanya muncul saat ada editor aktif */}
        <TabBar />

        {/* Area Workspace Utama */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#07122A]">
          {children}
        </main>

        {/* Agnostic Status Bar */}
        <StatusBar />
      </div>
    </div>
  );
};
