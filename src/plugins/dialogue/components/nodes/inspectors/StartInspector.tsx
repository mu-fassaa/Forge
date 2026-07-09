import React from 'react';
import { type InspectorProps } from '../../../../../platform/workspace/nodeRegistry';
import { LucideIcon } from '../../../../../components/LucideIcon';

export const StartInspector: React.FC<InspectorProps<Record<string, unknown>>> = () => {
  return (
    <div className="rounded-xl border border-dashed border-[#1a1c36] p-4 text-center">
      <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mx-auto mb-2.5">
        <LucideIcon name="Play" size={14} className="ml-0.5" />
      </div>
      <p className="text-xs font-bold text-gray-400">Start Graph Entry</p>
      <p className="text-[10px] text-gray-600 leading-relaxed mt-1">
        This is the main entry point of the dialogue graph execution. It requires no configurations. Connect its output port to initiate dialogue flows.
      </p>
    </div>
  );
};
