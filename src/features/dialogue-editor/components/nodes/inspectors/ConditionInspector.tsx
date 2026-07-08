import React from 'react';
import { type InspectorProps } from '../../../../../registry/nodeRegistry';
import { type ConditionNodeData } from '../../../types/nodes';
import { LucideIcon } from '../../../../../components/LucideIcon';

const OPERATORS = ['==', '>', '<', '>=', '<=', '!='];

export const ConditionInspector: React.FC<InspectorProps<ConditionNodeData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-5">
      {/* Parameter */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="Database" size={10} />
          Variable / Parameter
        </label>
        <input
          type="text"
          value={data.parameter || ''}
          onChange={(e) => onChange('parameter', e.target.value)}
          placeholder="Nama variabel... (mis: player_gold)"
          className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Operator + Value berdampingan */}
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">
          <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
            <LucideIcon name="Equal" size={10} />
            Operator
          </label>
          <select
            value={data.operator || '=='}
            onChange={(e) => onChange('operator', e.target.value)}
            className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-2 py-2 text-gray-200 focus:outline-none focus:border-amber-500/50 transition-all"
          >
            {OPERATORS.map((op) => (
              <option key={op} value={op} className="bg-[#0b0c1e]">{op}</option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
            <LucideIcon name="Hash" size={10} />
            Value
          </label>
          <input
            type="text"
            value={data.value || ''}
            onChange={(e) => onChange('value', e.target.value)}
            placeholder="Nilai perbandingan..."
            className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Preview kondisi */}
      <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2.5">
        <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500/60 mb-1">Preview</p>
        <code className="text-xs text-amber-300 font-mono">
          if ({data.parameter || '?'} {data.operator || '=='} {data.value || '?'})
        </code>
      </div>
    </div>
  );
};
