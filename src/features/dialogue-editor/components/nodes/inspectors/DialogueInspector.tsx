import React from 'react';
import { type InspectorProps } from '../../../../../registry/nodeRegistry';
import { type DialogueNodeData } from '../../../types/nodes';
import { PortListEditor } from '../../../../../components/PortListEditor';
import { LucideIcon } from '../../../../../components/LucideIcon';

export const DialogueInspector: React.FC<InspectorProps<DialogueNodeData>> = ({
  data,
  onChange,
  outputs,
  onOutputsChange,
}) => {
  const handlePortsChange = (newPorts: any[]) => {
    // 1. Update outputs visual handle (di React Flow root level)
    onOutputsChange(newPorts);

    // 2. Sinkronkan dengan payload data.choices (untuk simulator & compile)
    const isDefault = newPorts.length === 1 && newPorts[0].id === 'out';
    if (isDefault) {
      onChange('choices', []);
    } else {
      onChange(
        'choices',
        newPorts.map((p) => ({ id: p.id, text: p.label }))
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Speaker */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="User" size={10} />
          Speaker
        </label>
        <input
          type="text"
          value={data.speaker || ''}
          onChange={(e) => onChange('speaker', e.target.value)}
          placeholder="Nama karakter..."
          className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#D946EF]/50 focus:ring-1 focus:ring-[#D946EF]/20 transition-all"
        />
      </div>

      {/* Dialogue Text */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500 mb-2">
          <LucideIcon name="MessageSquare" size={10} />
          Dialogue Text
        </label>
        <textarea
          value={data.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          placeholder="Tulis percakapan di sini..."
          rows={4}
          className="w-full text-xs bg-[#070814] border border-[#1a1c36] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#D946EF]/50 focus:ring-1 focus:ring-[#D946EF]/20 transition-all resize-none leading-relaxed"
        />
        <p className="text-[9px] text-gray-600 mt-1">{(data.text || '').length} karakter</p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1a1c36]" />

      {/* Output Ports */}
      <div>
        <PortListEditor
          ports={outputs}
          onChange={handlePortsChange}
          sectionLabel="Dialogue Choices"
          addPlaceholder="Teks pilihan dialog..."
          defaultPort={{ id: 'out', label: 'Out' }}
          accentColor="#D946EF"
        />

        {/* Hint kontekstual untuk developer/user */}
        {outputs.length > 1 || (outputs.length === 1 && outputs[0].id !== 'out') ? (
          <div className="mt-3 rounded-lg bg-[#D946EF]/5 border border-[#D946EF]/15 px-3 py-2">
            <p className="text-[9px] text-[#D946EF]/60 leading-relaxed">
              Setiap pilihan di atas otomatis membuat output port di node. Hubungkan ke node berikutnya di canvas.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
