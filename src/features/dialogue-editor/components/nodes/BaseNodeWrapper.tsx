import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { type NodePort, type ForgeNodeType } from '../../types/nodes';
import { useDialogueEditor } from '../../DialogueEditor';
import { LucideIcon } from '../../../../components/LucideIcon';

interface BaseNodeWrapperProps {
  id: string;
  type: ForgeNodeType;
  selected?: boolean;
  title: string;
  inputs: NodePort[];
  outputs: NodePort[];
  children: React.ReactNode;
  headerColorClass?: string; // Warna aksen header (misal: text-[#e879f9])
}

export const BaseNodeWrapper: React.FC<BaseNodeWrapperProps> = ({
  id,
  selected,
  title,
  inputs,
  outputs,
  children,
  headerColorClass = 'text-[#e879f9]',
}) => {
  const updateNodeInternals = useUpdateNodeInternals();

  // Membaca warning validasi dari DialogueEditorContext jika tersedia.
  // Dibuat aman (fallback kosong) agar tetap reusable di sub-editor lain kelak.
  let nodeErrors: any[] = [];
  try {
    const editorCtx = useDialogueEditor();
    nodeErrors = editorCtx.validationErrors.filter((err) => err.nodeId === id);
  } catch (e) {
    // Graceful exit for non-dialogue editors
  }

  const hasErrors = nodeErrors.length > 0;
  const hasErrorSeverity = nodeErrors.some((e) => e.severity === 'error');

  // Hitung border styling dinamis berdasarkan status selected dan validasi
  const getBorderColorClass = () => {
    if (selected) return 'border-[#ec4899] shadow-[#ec4899]/10 shadow-lg';
    if (hasErrors) {
      return hasErrorSeverity
        ? 'border-red-500/70 shadow-red-500/5 shadow-md'
        : 'border-amber-500/70 shadow-amber-500/5 shadow-md';
    }
    return 'border-[#1a1c36] hover:border-gray-700';
  };

  // Setiap kali jumlah atau ID output/input handle berubah,
  // beritahu React Flow untuk re-measure posisi handle.
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, outputs.length, inputs.length,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      outputs.map(o => o.id).join(','),
      inputs.map(i => i.id).join(',')]);

  return (
    <div
      className={`rounded-xl border bg-[#0b0c1e] text-gray-200 w-64 shadow-xl transition-all duration-200 select-none ${getBorderColorClass()}`}
    >
      {/* 1. Render Input Handles (Atas) secara otomatis & merata */}
      <div className="relative w-full h-0">
        {inputs.map((port, idx) => {
          // Menghitung persentase letak handle agar terbagi rata secara horizontal
          const leftPercent = ((idx + 1) * 100) / (inputs.length + 1);
          return (
            <div key={port.id} className="absolute" style={{ left: `${leftPercent}%` }}>
              <Handle
                type="target"
                position={Position.Top}
                id={port.id}
                className="!w-2.5 !h-2.5 !bg-[#ec4899] !border-2 !border-[#070814] hover:!bg-[#e879f9] transition-colors -translate-x-1/2 -translate-y-1/2"
              />
              {port.label && (
                <span className="absolute text-[8px] text-gray-500 font-bold -top-4 -translate-x-1/2 whitespace-nowrap">
                  {port.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Header Kartu */}
      <div className="px-4 py-2.5 border-b border-[#1a1c36] bg-[#0d0e26] rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[10px] font-extrabold uppercase tracking-widest truncate ${headerColorClass}`}>
            {title}
          </span>
          {hasErrors && (
            <div
              className="shrink-0 flex items-center justify-center p-0.5 rounded cursor-help"
              title={nodeErrors.map((e: any) => e.message).join('\n')}
            >
              <LucideIcon
                name="AlertTriangle"
                size={11}
                className={hasErrorSeverity ? 'text-red-400' : 'text-amber-400'}
              />
            </div>
          )}
        </div>
        <span className="text-[9px] font-bold text-gray-500 shrink-0 font-mono">
          ID: {id.split('_').pop()}
        </span>
      </div>

      {/* Area Konten Node Spesifik */}
      <div className="p-4 space-y-3">
        {children}
      </div>

      {/* 2. Render Output Handles (Bawah) secara otomatis & merata */}
      <div className="relative w-full h-0">
        {outputs.map((port, idx) => {
          const leftPercent = ((idx + 1) * 100) / (outputs.length + 1);
          return (
            <div key={port.id} className="absolute" style={{ left: `${leftPercent}%` }}>
              <Handle
                type="source"
                position={Position.Bottom}
                id={port.id}
                className="!w-2.5 !h-2.5 !bg-[#ec4899] !border-2 !border-[#070814] hover:!bg-[#e879f9] transition-colors -translate-x-1/2 -translate-y-1/2"
              />
              {port.label && (
                <span className="absolute text-[8px] text-gray-500 font-bold top-2 -translate-x-1/2 whitespace-nowrap">
                  {port.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
