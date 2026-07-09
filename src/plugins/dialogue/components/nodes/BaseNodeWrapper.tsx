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
  headerColorClass?: string; // Warna aksen header (misal: text-[#00A3FF])
}

export const BaseNodeWrapper: React.FC<BaseNodeWrapperProps> = ({
  id,
  selected,
  title,
  inputs,
  outputs,
  children,
  headerColorClass = 'text-[#00A3FF]',
}) => {
  const updateNodeInternals = useUpdateNodeInternals();

  // Membaca warning validasi dari DialogueEditorContext jika tersedia
  let nodeErrors: any[] = [];
  try {
    const editorCtx = useDialogueEditor();
    nodeErrors = editorCtx.validationErrors.filter((err) => err.nodeId === id);
  } catch (e) {
    // Fallback aman untuk non-dialogue editor
  }

  const hasErrors = nodeErrors.length > 0;
  const hasErrorSeverity = nodeErrors.some((e) => e.severity === 'error');

  // Hitung border styling dinamis berdasarkan status selected dan validasi
  const getBorderColorClass = () => {
    if (selected) return 'border-[#00A3FF] shadow-sm shadow-[#00A3FF]/15';
    if (hasErrors) {
      return hasErrorSeverity
        ? 'border-red-500/80 shadow-sm shadow-red-500/10'
        : 'border-amber-500/80 shadow-sm shadow-amber-500/10';
    }
    return 'border-[#1a2d54] hover:border-gray-600';
  };

  // Re-measure handle coordinates when outputs length changes
  useEffect(() => {
    updateNodeInternals(id);
  }, [
    id,
    updateNodeInternals,
    outputs.length,
    inputs.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    outputs.map((o) => o.id).join(','),
    inputs.map((i) => i.id).join(','),
  ]);

  return (
    <div
      className={`rounded-lg border bg-[#0c1833] text-[#F3F4F6] w-56 shadow-md transition-all duration-150 select-none ${getBorderColorClass()}`}
    >
      {/* 1. Render Input Handles (Atas) secara otomatis & merata */}
      <div className="relative w-full h-0">
        {inputs.map((port, idx) => {
          const leftPercent = ((idx + 1) * 100) / (inputs.length + 1);
          return (
            <div key={port.id} className="absolute" style={{ left: `${leftPercent}%` }}>
              <Handle
                type="target"
                position={Position.Top}
                id={port.id}
                className="!w-2.5 !h-2.5 !bg-[#00A3FF] !border-2 !border-[#07122A] hover:!bg-[#F3F4F6] transition-colors -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
              />
              {port.label && (
                <span className="absolute text-[7px] text-[#8E9BB4]/65 font-bold font-mono -top-3.5 -translate-x-1/2 whitespace-nowrap">
                  {port.label.toUpperCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Header Kartu */}
      <div className="px-3.5 py-1.5 border-b border-[#1a2d54] bg-[#122247]/40 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[9px] font-bold uppercase tracking-widest truncate ${headerColorClass}`}>
            {title}
          </span>
          {hasErrors && (
            <div
              className="shrink-0 flex items-center justify-center p-0.5 rounded cursor-help"
              title={nodeErrors.map((e: any) => e.message).join('\n')}
            >
              <LucideIcon
                name="AlertTriangle"
                size={10}
                className={hasErrorSeverity ? 'text-red-400' : 'text-amber-400'}
              />
            </div>
          )}
        </div>
        <span className="text-[8px] font-bold text-[#8E9BB4]/50 shrink-0 font-mono">
          ID: {id.split('_').pop()?.toUpperCase()}
        </span>
      </div>

      {/* Area Konten Node Spesifik */}
      <div className="p-3.5 space-y-2">
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
                className="!w-2.5 !h-2.5 !bg-[#00A3FF] !border-2 !border-[#07122A] hover:!bg-[#F3F4F6] transition-colors -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
              />
              {port.label && (
                <span className="absolute text-[7px] text-[#8E9BB4]/65 font-bold font-mono top-1.5 -translate-x-1/2 whitespace-nowrap">
                  {port.label.toUpperCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
