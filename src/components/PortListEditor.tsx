import React, { useCallback } from 'react';
import { type NodePort } from '../plugins/dialogue/types/nodes';
import { LucideIcon } from './LucideIcon';

interface PortListEditorProps {
  /** Daftar output port saat ini */
  ports: NodePort[];
  /** Dipanggil setiap kali daftar port berubah */
  onChange: (ports: NodePort[]) => void;
  /**
   * Label section yang tampil di UI.
   * Forge tidak tahu apa artinya — plugin yang memberi makna.
   * Contoh: "Dialogue Choices", "State Transitions", "Child Nodes"
   */
  sectionLabel?: string;
  /** Placeholder untuk input teks port baru */
  addPlaceholder?: string;
  /**
   * Port default yang dipakai ketika daftar dikosongkan.
   * Jika tidak diisi, port default adalah { id: 'out', label: 'Out' }.
   */
  defaultPort?: NodePort;
  /** Warna aksen untuk tombol add (default: pink/fuchsia) */
  accentColor?: string;
}

export const PortListEditor: React.FC<PortListEditorProps> = ({
  ports,
  onChange,
  sectionLabel = 'Output Ports',
  addPlaceholder = 'Label port baru...',
  defaultPort = { id: 'out', label: 'Out' },
  accentColor = '#D946EF',
}) => {

  // Apakah saat ini masih pakai single default port?
  const isUsingDefault =
    ports.length === 1 && ports[0].id === defaultPort.id;

  // Tambah port baru.
  // Jika masih di state default (single 'out' port), GANTI port default.
  // Jika sudah ada custom ports, APPEND port baru.
  const handleAdd = useCallback(() => {
    const newPort: NodePort = {
      id: `port_${Date.now()}`,
      label: '',
    };
    if (isUsingDefault) {
      // Ganti default → mulai fresh dengan 1 custom port
      onChange([newPort]);
    } else {
      onChange([...ports, newPort]);
    }
  }, [ports, onChange, isUsingDefault]);

  // Update label satu port berdasarkan index
  const handleLabelChange = useCallback(
    (index: number, label: string) => {
      const updated = ports.map((p, i) => (i === index ? { ...p, label } : p));
      onChange(updated);
    },
    [ports, onChange]
  );

  // Hapus port berdasarkan index
  const handleRemove = useCallback(
    (index: number) => {
      const updated = ports.filter((_, i) => i !== index);
      // Jika semua port dihapus, kembalikan ke port default
      onChange(updated.length > 0 ? updated : [defaultPort]);
    },
    [ports, defaultPort, onChange]
  );



  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-gray-500">
          <LucideIcon name="GitFork" size={10} />
          {sectionLabel}
        </label>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded border transition-all cursor-pointer hover:opacity-80"
          style={{
            color: accentColor,
            borderColor: `${accentColor}40`,
            backgroundColor: `${accentColor}0F`,
          }}
        >
          <LucideIcon name="Plus" size={9} />
          Add Port
        </button>
      </div>

      {/* Status: menggunakan default port */}
      {isUsingDefault ? (
        <div className="rounded-lg border border-dashed border-[#1a1c36] px-3 py-3 text-center">
          <p className="text-[9px] text-gray-700 leading-relaxed">
            Saat ini menggunakan port default{' '}
            <code className="text-gray-600">"{defaultPort.label}"</code>.
            <br />
            Klik <span className="font-bold text-gray-500">+ Add Port</span> untuk menambah port kustom.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {ports.map((port, index) => (
            <div key={port.id} className="flex items-center gap-2 group">
              {/* Handle indicator */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: accentColor, opacity: 0.7 }}
              />

              {/* Label input */}
              <input
                type="text"
                value={port.label}
                onChange={(e) => handleLabelChange(index, e.target.value)}
                placeholder={addPlaceholder}
                className="flex-1 text-xs bg-[#070814] border border-[#1a1c36] rounded-md px-2.5 py-1.5 text-gray-200 focus:outline-none transition-all"
                style={{
                  // Highlight border saat focus dengan warna aksen
                  // Tidak bisa pakai inline style untuk focus, tapi ini cukup
                }}
                onFocus={(e) => (e.target.style.borderColor = `${accentColor}60`)}
                onBlur={(e) => (e.target.style.borderColor = '')}
              />

              {/* Port ID (untuk debugging / referensi) */}
              <span className="text-[8px] text-gray-700 font-mono shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden xl:block">
                {port.id.slice(-6)}
              </span>

              {/* Hapus */}
              <button
                onClick={() => handleRemove(index)}
                className="shrink-0 text-gray-700 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                title="Hapus port ini"
              >
                <LucideIcon name="X" size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hint jumlah port */}
      {!isUsingDefault && (
        <p className="text-[9px] text-gray-700 mt-2">
          {ports.length} output port aktif.{' '}
          {ports.length === 1 && (
            <button
              onClick={() => onChange([defaultPort])}
              className="text-gray-600 hover:text-gray-400 underline cursor-pointer"
            >
              Reset ke default
            </button>
          )}
        </p>
      )}
    </div>
  );
};
