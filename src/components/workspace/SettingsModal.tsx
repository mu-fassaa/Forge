import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

export const SettingsModal: React.FC = () => {
  const { activeModal, setActiveModal, settings, updateSettings, metadata } = useWorkspace();

  if (!activeModal || activeModal === 'publish') return null;

  const handleClose = () => setActiveModal(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
      <div className="relative w-full max-w-lg bg-[#0b0c1e] border border-[#1a1c36] rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-fade-in text-gray-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1a1c36] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeModal === 'settings' && (
              <>
                <LucideIcon name="Settings" className="text-indigo-400" size={16} />
                <h4 className="font-extrabold text-sm tracking-wider uppercase">Workspace Settings</h4>
              </>
            )}
            {activeModal === 'profile' && (
              <>
                <LucideIcon name="User" className="text-purple-400" size={16} />
                <h4 className="font-extrabold text-sm tracking-wider uppercase">User Profile</h4>
              </>
            )}
            {activeModal === 'about' && (
              <>
                <LucideIcon name="Info" className="text-pink-400" size={16} />
                <h4 className="font-extrabold text-sm tracking-wider uppercase">About Forge</h4>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <LucideIcon name="X" size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#070814]/50">
          {activeModal === 'settings' && (
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-200">Visual Theme</p>
                  <p className="text-[10px] text-gray-500">Toggle between Light and Dark editor style</p>
                </div>
                <div className="flex bg-[#070814] border border-[#1a1c36] rounded-lg p-1">
                  <button
                    onClick={() => updateSettings('theme', 'dark')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      settings.theme === 'dark' ? 'bg-[#ec4899] text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => updateSettings('theme', 'light')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      settings.theme === 'light' ? 'bg-[#ec4899] text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              {/* Autosave Toggles */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-200">Autosave Changes</p>
                  <p className="text-[10px] text-gray-500">Automatically save updates to local storage</p>
                </div>
                <button
                  onClick={() => updateSettings('autosave', !settings.autosave)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    settings.autosave ? 'bg-[#ec4899]' : 'bg-gray-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.autosave ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Grid Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-200">Show Editor Grid</p>
                  <p className="text-[10px] text-gray-500">Toggle visual background grid in the canvas</p>
                </div>
                <button
                  onClick={() => updateSettings('grid', !settings.grid)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    settings.grid ? 'bg-[#ec4899]' : 'bg-gray-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.grid ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Snap-to-Grid Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-200">Snap to Grid</p>
                  <p className="text-[10px] text-gray-500">Lock nodes to the visual coordinate grid</p>
                </div>
                <button
                  onClick={() => updateSettings('snap', !settings.snap)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    settings.snap ? 'bg-[#ec4899]' : 'bg-gray-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.snap ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-200">Editor Language</p>
                  <p className="text-[10px] text-gray-500">Adjust active localization labels</p>
                </div>
                <div className="flex bg-[#070814] border border-[#1a1c36] rounded-lg p-1">
                  <button
                    onClick={() => updateSettings('language', 'id')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      settings.language === 'id' ? 'bg-[#ec4899] text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Bahasa (ID)
                  </button>
                  <button
                    onClick={() => updateSettings('language', 'en')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      settings.language === 'en' ? 'bg-[#ec4899] text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>

              {/* Reset Workspace Section */}
              <div className="border-t border-[#1a1c36] pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-400">Developer Tools</p>
                  <p className="text-[10px] text-gray-500">Reset all workspace layouts, recent cache, and plugin states</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mereset seluruh Workspace Forge? Semua graph dan status plugin akan dikembalikan ke setelan awal.')) {
                      localStorage.removeItem('forge_sidebar_enabled_v1');
                      localStorage.removeItem('forge_session');
                      localStorage.removeItem('forge_workspace');
                      localStorage.removeItem('forge_recent_graphs_v1');
                      localStorage.removeItem('forge_plugin_state_version_v1');
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-950/40 border border-red-800/30 hover:bg-red-900/40 text-red-400 transition-all duration-200 cursor-pointer"
                >
                  Reset Workspace
                </button>
              </div>
            </div>
          )}

          {activeModal === 'profile' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-black text-2xl text-white shadow-lg mb-3">
                  U
                </div>
                <h5 className="font-extrabold text-sm text-gray-200">Administrator</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">Workspace Creator</p>
              </div>

              <div className="space-y-3.5 border-t border-[#1a1c36] pt-4">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-600">Email</span>
                  <span className="text-xs text-gray-300 col-span-2">admin@forge.dev</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-600">License Status</span>
                  <span className="text-xs text-[#e879f9] col-span-2 font-bold uppercase tracking-wider">Creator License</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-600">Project Role</span>
                  <span className="text-xs text-gray-300 col-span-2">Tech Lead & Maintainer</span>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'about' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20 mb-3">
                  <span className="font-black text-white text-base">F</span>
                </div>
                <h5 className="font-black text-base text-white tracking-wider uppercase">Forge Editor</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">Build tools. Build games.</p>
              </div>

              <div className="space-y-3 border-t border-[#1a1c36] pt-4 text-xs leading-relaxed text-gray-400 text-center max-w-sm mx-auto">
                <p>
                  Forge is a modular node-based workspace built on top of React Flow, allowing game developers to program visual narratives and complex state behaviors.
                </p>
                <div className="flex justify-center gap-6 pt-3 text-[10px] text-gray-500">
                  <div>
                    <span className="block font-bold text-gray-400">Version</span>
                    <span>v{metadata.version}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-400">Created</span>
                    <span>{new Date(metadata.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-400">License</span>
                    <span>MIT Open Source</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1a1c36] flex items-center justify-end bg-[#0d0e26] rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#14152a] hover:bg-[#1a1c36] border border-gray-700 text-gray-300 transition-all duration-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
