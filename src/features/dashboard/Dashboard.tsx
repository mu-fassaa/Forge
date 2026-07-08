import React from 'react';
import { EDITOR_TOOLS } from '../../utils/tools';
import { type EditorType } from '../../types';
import { LucideIcon } from '../../components/LucideIcon';

interface DashboardProps {
  onSelectTool: (tab: EditorType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 flex flex-col justify-between h-full bg-[#070814]">
      <div>
        {/* Welcome Banner & Server Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-[#14152a]/60 pb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
              Selamat Datang di <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Forge Workspace</span>
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xl">
              Buat dialog percakapan, quest, pohon skill, wave musuh, dan kelola database di satu tempat terpusat.
            </p>
          </div>

          {/* Indicator Server Connection */}
          <div className="flex items-center gap-2 bg-[#0b0c1e] border border-[#14152a] px-3 py-1.5 rounded-lg w-fit h-fit self-start sm:self-center">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ec4899] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ec4899]"></span>
            </span>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#e879f9]">
              Connected to v1.0.0 server
            </span>
          </div>
        </div>

        {/* Grid of Tools / Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EDITOR_TOOLS.map((tool) => {
            const isComingSoon = tool.status === 'coming-soon';
            
            return (
              <div
                key={tool.id}
                onClick={() => !isComingSoon && onSelectTool(tool.id)}
                className={`relative group rounded-xl border bg-[#0b0c1e] p-6 flex flex-col justify-between min-h-[220px] transition-all duration-300 ${
                  isComingSoon
                    ? 'border-[#14152a] opacity-55 cursor-not-allowed'
                    : 'border-[#1a1c36] hover:border-[#ec4899]/30 hover:bg-[#0e1027]/40 hover:shadow-[0_0_30px_rgba(236,72,153,0.04)] cursor-pointer'
                }`}
              >
                <div>
                  {/* Tool Header: Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-tr ${tool.color} bg-opacity-10 text-white shadow-sm border border-purple-500/10`}>
                      <LucideIcon name={tool.icon} size={18} />
                    </div>
                    {tool.badge && !isComingSoon && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#ec4899]/10 text-[#e879f9] border border-[#ec4899]/20 uppercase tracking-wider">
                        {tool.badge}
                      </span>
                    )}
                    {isComingSoon && (
                      <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-900 px-2 py-0.5 rounded-md">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-500">Coming</span>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-500">Soon</span>
                      </div>
                    )}
                  </div>

                  {/* Name & Desc */}
                  <h4 className="text-base font-bold text-gray-100 mb-2 group-hover:text-[#e879f9] transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                    {tool.description}
                  </p>
                </div>

                {/* Card Action Link */}
                {!isComingSoon && (
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-[#ec4899] group-hover:text-[#e879f9] transition-all pt-2">
                    <span>Buka Editor</span>
                    <LucideIcon name="ChevronRight" size={12} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Metrics Bar (Status Project) */}
      <div className="mt-12 pt-6 border-t border-[#14152a]/60 flex flex-wrap items-center justify-start gap-4 select-none">
        
        {/* Project Size Box */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0b0c1e] border border-[#14152a] min-w-[200px]">
          <div className="p-2 rounded bg-purple-950/20 text-[#c084fc] border border-purple-500/10">
            <LucideIcon name="Layers" size={14} />
          </div>
          <div>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-extrabold">Project Size</p>
            <p className="text-xs font-bold text-gray-200">1.42 GB</p>
          </div>
        </div>

        {/* Active Team Box */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0b0c1e] border border-[#14152a] min-w-[200px]">
          <div className="p-2 rounded bg-pink-950/20 text-[#f472b6] border border-pink-500/10">
            <LucideIcon name="Users" size={14} />
          </div>
          <div>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-extrabold">Active Team</p>
            <p className="text-xs font-bold text-gray-200">4 Contributors</p>
          </div>
        </div>

        {/* Last Push Box */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0b0c1e] border border-[#14152a] min-w-[200px]">
          <div className="p-2 rounded bg-blue-950/20 text-[#60a5fa] border border-blue-500/10">
            <LucideIcon name="Clock" size={14} />
          </div>
          <div>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-extrabold">Last Push</p>
            <p className="text-xs font-bold text-gray-200">24 mins ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};
