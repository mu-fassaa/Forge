import React from 'react';
import { type InspectorProps } from '../../../../../platform/workspace/nodeRegistry';
import { type EventNodeData } from '../../../types/nodes';
import { LucideIcon } from '../../../../../components/LucideIcon';

export const EventInspector: React.FC<InspectorProps<EventNodeData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-5">
      {/* Event Name */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="Zap" size={10} />
          Event Name
        </label>
        <input
          type="text"
          value={data.eventName || ''}
          onChange={(e) => onChange('eventName', e.target.value)}
          placeholder="Nama event... (mis: StartQuest)"
          className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Event Value (opsional) */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="Tag" size={10} />
          Event Value
          <span className="text-gray-700 normal-case tracking-normal font-normal ml-1">(opsional)</span>
        </label>
        <input
          type="text"
          value={data.eventValue || ''}
          onChange={(e) => onChange('eventValue', e.target.value)}
          placeholder="Parameter payload... (mis: quest_id_01)"
          className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      {/* Preview signal */}
      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 px-3 py-2.5">
        <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-500/60 mb-1">Signal Preview</p>
        <code className="text-xs text-emerald-300 font-mono">
          emit("{data.eventName || 'EventName'}", "{data.eventValue || ''}")
        </code>
      </div>
    </div>
  );
};
