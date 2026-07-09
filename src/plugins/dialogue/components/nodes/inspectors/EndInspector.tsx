import React from 'react';
import { type InspectorProps } from '../../../../../platform/workspace/nodeRegistry';
import { type EndNodeData } from '../../../types/nodes';
import { LucideIcon } from '../../../../../components/LucideIcon';

const END_TYPES = [
  { value: 'default', label: 'Default', description: 'Percakapan selesai normal', icon: 'CheckCircle', color: 'text-gray-400 border-gray-600' },
  { value: 'complete', label: 'Complete', description: 'Quest / misi selesai', icon: 'Trophy', color: 'text-emerald-400 border-emerald-500/40' },
  { value: 'fail', label: 'Fail', description: 'Percakapan gagal / ditolak', icon: 'XCircle', color: 'text-red-400 border-red-500/40' },
];

export const EndInspector: React.FC<InspectorProps<EndNodeData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-3">
          <LucideIcon name="CircleStop" size={10} />
          End Type
        </label>
        <div className="space-y-2">
          {END_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onChange('endType', type.value)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                data.endType === type.value
                  ? `bg-[#0b0c1e] ${type.color} border-opacity-100`
                  : 'bg-transparent border-[#1a1c36] hover:border-gray-600'
              }`}
            >
              <LucideIcon
                name={type.icon as any}
                size={14}
                className={data.endType === type.value ? type.color.split(' ')[0] : 'text-gray-600'}
              />
              <div>
                <p className={`text-xs font-bold ${data.endType === type.value ? type.color.split(' ')[0] : 'text-gray-400'}`}>
                  {type.label}
                </p>
                <p className="text-[9px] text-gray-600">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
