import React from 'react';
import { EDITOR_TOOLS } from '../utils/tools';
import { type EditorType } from '../types';
import { LucideIcon } from '../components/LucideIcon';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: EditorType;
  setActiveTab: (tab: EditorType) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070814] text-[#f3f4f6]">
      {/* Sidebar - Panel Kiri */}
      <aside className="w-64 border-r border-[#14152a] bg-[#0b0c1e] flex flex-col h-full select-none">
        
        {/* Logo & Versi */}
        <div className="p-5 border-b border-[#14152a] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="font-black text-white text-base">F</span>
          </div>
          <div>
            <h1 className="font-extrabold text-sm leading-tight text-white tracking-wide uppercase">Forge</h1>
            <p className="text-[9px] text-gray-500 tracking-wider font-bold">V0.4.2 EARLY ACCESS</p>
          </div>
        </div>

        {/* Tombol New Module */}
        <div className="px-4 py-4">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#ec4899] hover:bg-[#db2777] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.15)] cursor-pointer">
            <LucideIcon name="Plus" size={14} className="stroke-[3]" />
            New Module
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-5">
          {/* Menu Utama */}
          <div>
            <span className="px-3 text-[9px] uppercase font-extrabold tracking-widest text-gray-500 block mb-2">
              Menu Utama
            </span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-purple-950/20 text-purple-300 border border-purple-500/10 shadow-[inset_0_0_12px_rgba(236,72,153,0.05)]'
                  : 'text-gray-400 hover:bg-[#14152a]/50 hover:text-gray-200 border border-transparent'
              }`}
            >
              <LucideIcon name="LayoutDashboard" size={16} />
              Dashboard
            </button>
          </div>

          {/* Editors & Databases */}
          <div>
            <span className="px-3 text-[9px] uppercase font-extrabold tracking-widest text-gray-500 block mb-2">
              Editors & Databases
            </span>
            <div className="space-y-1">
              {EDITOR_TOOLS.map((tool) => {
                const isActive = activeTab === tool.id;
                const isComingSoon = tool.status === 'coming-soon';

                return (
                  <button
                    key={tool.id}
                    onClick={() => !isComingSoon && setActiveTab(tool.id)}
                    disabled={isComingSoon}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? 'bg-[#ec4899]/10 text-[#e879f9] border-[#ec4899]/20'
                        : isComingSoon
                        ? 'opacity-40 text-gray-500 border-transparent cursor-not-allowed'
                        : 'text-gray-400 hover:bg-[#14152a]/50 hover:text-gray-200 border-transparent hover:border-gray-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LucideIcon name={tool.icon} size={16} />
                      <span>{tool.sidebarName || tool.name}</span>
                    </div>
                    {isComingSoon && (
                      <span className="text-[8px] uppercase tracking-wider font-extrabold bg-[#14152a] px-1.5 py-0.5 rounded text-gray-500">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Settings */}
          <div>
            <div className="space-y-1">
              <button
                disabled
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-500 opacity-40 border border-transparent cursor-not-allowed"
              >
                <LucideIcon name="Settings" size={16} />
                Project Settings
              </button>
            </div>
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-[#14152a] bg-[#090a18] text-[10px] text-gray-500 flex flex-col gap-2">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer text-left">
            <LucideIcon name="FileText" size={12} />
            Documentation
          </button>
          <div className="flex items-center justify-between pt-1 border-t border-[#14152a]/50 text-[9px]">
            <span>v1.0.0-beta</span>
            <a href="#" className="hover:text-gray-300">Support</a>
          </div>
        </div>
      </aside>

      {/* Panel Utama (Kanan) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Atas */}
        <header className="h-14 border-b border-[#14152a] bg-[#0b0c1e] px-6 flex items-center justify-between select-none">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xs text-gray-300 uppercase tracking-widest">
              Forge Project Manager
            </span>
          </div>

          {/* Tabs Menu Tengah */}
          <div className="flex h-full items-center gap-6">
            <button className="h-full border-b-2 border-[#ec4899] text-[#e879f9] text-xs font-bold px-1 transition-all cursor-pointer">
              Explorer
            </button>
            <button className="h-full border-b-2 border-transparent text-gray-400 hover:text-gray-200 text-xs font-semibold px-1 transition-all cursor-pointer">
              History
            </button>
            <button className="h-full border-b-2 border-transparent text-gray-400 hover:text-gray-200 text-xs font-semibold px-1 transition-all cursor-pointer">
              Collaborators
            </button>
          </div>

          {/* Tombol Aksi Kanan */}
          <div className="flex items-center gap-4">
            {/* Notifikasi & Cloud Status */}
            <div className="flex items-center gap-3 text-gray-400">
              <button className="hover:text-white transition-colors cursor-pointer relative">
                <LucideIcon name="Bell" size={16} />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#ec4899] rounded-full"></span>
              </button>
              <button className="hover:text-white transition-colors cursor-pointer">
                <LucideIcon name="Cloud" size={16} />
              </button>
            </div>

            {/* Garis Pemisah */}
            <div className="h-4 w-[1px] bg-[#14152a]"></div>

            {/* Tombol Save & Publish */}
            <button className="px-3.5 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-300 font-bold text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer">
              Save
            </button>
            <button className="px-3.5 py-1.5 rounded-lg bg-[#ec4899] hover:bg-[#db2777] text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-200 shadow-[0_0_10px_rgba(236,72,153,0.15)] cursor-pointer">
              Publish
            </button>

            {/* Avatar Pengguna */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-purple-400/25 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-pink-500/10 cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Area Workspace Utama */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#070814]">
          {children}
        </main>
      </div>
    </div>
  );
};
