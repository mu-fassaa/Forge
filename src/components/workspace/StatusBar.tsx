import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

export const StatusBar: React.FC = () => {
  const { settings, validationErrors, activeEditor } = useWorkspace();

  const errorsCount = validationErrors.filter((e) => e.severity === 'error').length;
  const warningsCount = validationErrors.filter((e) => e.severity === 'warning').length;

  return (
    <div className="h-6 bg-[#0c1833] border-t border-[#1a2d54] px-4 flex items-center justify-between text-[10px] text-[#8E9BB4] select-none shrink-0 font-mono">
      {/* Kiri: Status Editor Aktif */}
      <div className="flex items-center gap-1.5 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]"></span>
        <span>EDITOR: {activeEditor ? activeEditor.id.toUpperCase() : 'LAUNCHER'}</span>
      </div>

      {/* Tengah: Validasi Graph Terkini */}
      <div className="flex items-center gap-4">
        {(() => {
          if (!activeEditor) return null;

          const isEmpty = activeEditor.nodes && activeEditor.nodes.length === 0;
          const hasNoStart = validationErrors.some((e) => e.type === 'no-start');

          if (isEmpty) {
            return (
              <div className="flex items-center gap-1 text-[#8E9BB4]/80 font-bold">
                <LucideIcon name="CircleDot" size={11} className="text-[#00A3FF]" />
                <span>READY TO START</span>
              </div>
            );
          }

          if (errorsCount > 0) {
            return (
              <div className="flex items-center gap-1 text-red-400 font-bold">
                <LucideIcon name="AlertOctagon" size={11} />
                <span>VALIDATION ERROR ({errorsCount} {errorsCount === 1 ? 'ERROR' : 'ERRORS'})</span>
              </div>
            );
          }

          if (hasNoStart) {
            return (
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <LucideIcon name="AlertTriangle" size={11} />
                <span>MISSING START NODE</span>
              </div>
            );
          }

          if (warningsCount > 0) {
            return (
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <LucideIcon name="AlertTriangle" size={11} />
                <span>VALIDATION WARNING ({warningsCount} {warningsCount === 1 ? 'WARNING' : 'WARNINGS'})</span>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <LucideIcon name="CheckCircle" size={11} />
              <span>GRAPH VALIDATED</span>
            </div>
          );
        })()}
      </div>

      {/* Kanan: Preferensi Workspace */}
      <div className="flex items-center gap-3 text-[9px] tracking-wide font-medium">
        <div className="flex items-center gap-1 bg-[#122247] px-2 py-0.5 rounded border border-[#1a2d54]">
          <span>AUTOSAVE</span>
          <span className={settings.autosave ? 'text-[#00A3FF] font-bold' : 'text-gray-600'}>
            {settings.autosave ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#122247] px-2 py-0.5 rounded border border-[#1a2d54]">
          <span>GRID</span>
          <span className={settings.grid ? 'text-[#00A3FF] font-bold' : 'text-gray-600'}>
            {settings.grid ? 'SNAPPING' : 'FREE'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#122247] px-2 py-0.5 rounded border border-[#1a2d54]">
          <span>LOCALE</span>
          <span className="text-[#00A3FF] font-bold">{settings.language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
