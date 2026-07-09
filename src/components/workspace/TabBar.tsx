import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

// ─────────────────────────────────────────────────────────────
// TabBar: visual strip di bawah header yang menampilkan
// editor yang sedang aktif sebagai "tab".
//
// Keputusan (Q1): Single Active Graph — hanya satu tab editor
// yang bisa aktif dalam satu waktu. Dashboard selalu ada
// sebagai home tab. Editor lain muncul saat dibuka dan
// hilang saat ditutup (navigate ke dashboard).
// ─────────────────────────────────────────────────────────────

interface TabConfig {
  id: string;
  label: string;
  icon: string;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  dialogue: { id: 'dialogue', label: 'Dialogue Trees', icon: 'MessageSquare' },
  docs:     { id: 'docs',     label: 'Documentation', icon: 'FileText' },
  quest:    { id: 'quest',    label: 'Quest Editor',   icon: 'Compass' },
  skill:    { id: 'skill',    label: 'Skill Tree',     icon: 'GitFork' },
};

export const TabBar: React.FC = () => {
  const { activeTab, navigate, isDirty } = useWorkspace();

  // Hanya tampilkan TabBar jika ada editor yang aktif (bukan dashboard)
  if (activeTab === 'dashboard') return null;

  const tabConfig = TAB_CONFIGS[activeTab];
  if (!tabConfig) return null;

  return (
    <div
      className="flex items-center h-9 border-b border-[#1a2d54] bg-[#0c1833] shrink-0 select-none"
      style={{ paddingLeft: '4px' }}
    >
      {/* Home tab (Dashboard) — always present, not closeable */}
      <button
        onClick={() => navigate('dashboard')}
        className="flex items-center gap-1.5 px-3 h-full text-[10px] font-bold font-mono text-[#8E9BB4] hover:text-white transition-colors border-r border-[#1a2d54]"
      >
        <LucideIcon name="LayoutDashboard" size={11} />
        <span className="uppercase tracking-wider">Home</span>
      </button>

      {/* Active editor tab */}
      <div
        className="flex items-center gap-1.5 px-3 h-full border-r border-[#1a2d54]"
        style={{
          background: 'rgba(0,163,255,0.06)',
          borderBottom: '2px solid #00A3FF',
        }}
      >
        <LucideIcon name={tabConfig.icon} size={11} className="text-[#00A3FF]" />
        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#F3F4F6]">
          {tabConfig.label}
        </span>
        {isDirty && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5"
            title="Unsaved changes"
          />
        )}
        {/* Close tab — navigate back to dashboard */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate('dashboard');
          }}
          className="ml-1 text-[#3d5275] hover:text-[#8E9BB4] transition-colors cursor-pointer"
          title="Close tab"
        >
          <LucideIcon name="X" size={10} />
        </button>
      </div>
    </div>
  );
};
