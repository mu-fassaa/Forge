import React from 'react';
import { type InspectorProps } from '../../../../../platform/workspace/nodeRegistry';
import { type VariableNodeData } from '../../../types/nodes';
import { LucideIcon } from '../../../../../components/LucideIcon';

const OPERATIONS = [
  { value: 'set', label: 'Set (=)' },
  { value: 'add', label: 'Add (+)' },
  { value: 'subtract', label: 'Subtract (-)' },
];

export const VariableInspector: React.FC<InspectorProps<VariableNodeData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-5">
      {/* Variable Name */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="Variable" size={10} />
          Variable Name
        </label>
        <input
          type="text"
          value={data.variableName || ''}
          onChange={(e) => onChange('variableName', e.target.value)}
          placeholder="Nama variabel... (mis: player_gold)"
          className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Operation */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="Settings2" size={10} />
          Operation
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {OPERATIONS.map((op) => (
            <button
              key={op.value}
              onClick={() => onChange('operation', op.value)}
              className={`text-[10px] font-bold py-1.5 rounded-md border transition-all cursor-pointer ${
                data.operation === op.value
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-transparent border-[#1a1c36] text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Value */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="Hash" size={10} />
          Value
        </label>
        <input
          type="text"
          value={data.value || ''}
          onChange={(e) => onChange('value', e.target.value)}
          placeholder="Nilai baru..."
          className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/15 px-3 py-2.5">
        <p className="text-[9px] uppercase tracking-widest font-bold text-indigo-400/60 mb-1">Preview</p>
        <code className="text-xs text-indigo-300 font-mono">
          {data.variableName || '?'} {data.operation === 'set' ? '=' : data.operation === 'add' ? '+=' : '-='} {data.value || '?'}
        </code>
      </div>
    </div>
  );
};
