import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { type NodePort, type ForgeNodeType } from '../../types/nodes';

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

  // Setiap kali jumlah atau ID output/input handle berubah,
  // beritahu React Flow untuk re-measure posisi handle.
  // Tanpa ini, handle baru yang ditambahkan secara dinamis
  // tidak bisa dijadikan sumber/target koneksi.
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, outputs.length, inputs.length,
      // Juga re-measure jika ID handle berubah (port dihapus/ditambah)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      outputs.map(o => o.id).join(','),
      inputs.map(i => i.id).join(',')]);

  return (
    <div
      className={`rounded-xl border bg-[#0b0c1e] text-gray-200 w-64 shadow-xl transition-all duration-200 select-none ${
        selected
          ? 'border-[#ec4899] shadow-[#ec4899]/10 shadow-lg'
          : 'border-[#1a1c36] hover:border-gray-700'
      }`}
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
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${headerColorClass}`}>
          {title}
        </span>
        <span className="text-[9px] font-bold text-gray-500">
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
