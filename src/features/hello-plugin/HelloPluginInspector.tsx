import React from 'react';
import { type InspectorProps } from '../../registry/nodeRegistry';
import { type HelloNodeData } from './HelloPluginNode';

// ─────────────────────────────────────────────────────────────
// HelloNodeInspector: form editor untuk Hello Node.
// Dirender di panel kanan saat node dipilih.
// ─────────────────────────────────────────────────────────────
export const HelloNodeInspector: React.FC<InspectorProps<HelloNodeData>> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#1a2d54]">
        <div
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,163,255,0.1)', border: '1px solid rgba(0,163,255,0.2)' }}
        >
          <span className="text-[8px] font-bold text-[#00A3FF]">H</span>
        </div>
        <span className="text-[10px] font-bold text-[#8E9BB4] uppercase tracking-wider font-mono">
          Hello Node
        </span>
      </div>

      {/* Message Field */}
      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#3d5275] font-mono mb-1.5">
          Message
        </label>
        <textarea
          value={data.message ?? ''}
          onChange={(e) => onChange('message', e.target.value)}
          rows={3}
          placeholder="Enter your hello message..."
          className="w-full bg-[#07122A] border border-[#1a2d54] rounded-md px-2.5 py-2 text-xs text-[#F3F4F6] placeholder-[#3d5275] outline-none focus:border-[#00A3FF]/50 transition-colors resize-none font-sans"
        />
        <p className="text-[9px] text-[#3d5275] mt-1 font-mono">
          {(data.message?.length ?? 0)} characters
        </p>
      </div>

      {/* Author Field */}
      <div>
        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#3d5275] font-mono mb-1.5">
          Author
        </label>
        <input
          type="text"
          value={data.author ?? ''}
          onChange={(e) => onChange('author', e.target.value)}
          placeholder="e.g. Hello Plugin"
          className="w-full bg-[#07122A] border border-[#1a2d54] rounded-md px-2.5 py-2 text-xs text-[#F3F4F6] placeholder-[#3d5275] outline-none focus:border-[#00A3FF]/50 transition-colors font-sans"
        />
      </div>

      {/* Read-only: Plugin badge */}
      <div
        className="flex items-center gap-2 px-2.5 py-2 rounded-md"
        style={{ background: 'rgba(0,163,255,0.04)', border: '1px solid rgba(0,163,255,0.1)' }}
      >
        <span className="text-[9px] font-mono text-[#3d5275]">Registered by:</span>
        <span className="text-[9px] font-bold font-mono text-[#00A3FF]">Hello Plugin v0.5.5</span>
      </div>
    </div>
  );
};
