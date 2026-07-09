import React, { useState, useEffect, useCallback } from 'react';
import { contextMenuRegistry } from '../../platform/commands/contextMenuRegistry';
import { LucideIcon } from '../LucideIcon';

// ─────────────────────────────────────────────────────────────
// ContextMenuOverlay: merender context menu registry saat
// right-click pada canvas area. Scope v0.5.1: canvas only.
//
// Cara kerja:
// 1. DialogueEditor memanggil `onContextMenu` pada wrapper div
// 2. Wrapper memancarkan custom event 'forge:contextmenu'
// 3. Overlay ini mendengar event tersebut dan merender menu
// ─────────────────────────────────────────────────────────────

interface MenuPosition {
  x: number;
  y: number;
}

export const ContextMenuOverlay: React.FC = () => {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [contextData, setContextData] = useState<{ x: number; y: number } | undefined>();

  const close = useCallback(() => setPosition(null), []);

  useEffect(() => {
    const handleForgeContextMenu = (e: Event) => {
      const custom = e as CustomEvent<{ clientX: number; clientY: number }>;
      setPosition({ x: custom.detail.clientX, y: custom.detail.clientY });
      setContextData({ x: custom.detail.clientX, y: custom.detail.clientY });
    };

    const handleGlobalClick = () => close();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('forge:contextmenu', handleForgeContextMenu);
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('forge:contextmenu', handleForgeContextMenu);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [close]);

  if (!position) return null;

  const groups = contextMenuRegistry.getGroups();
  if (groups.length === 0) return null;

  // Clamp position agar menu tidak keluar layar
  const menuWidth = 220;
  const menuHeight = groups.reduce((h, g) => h + (g.label ? 28 : 0) + g.items.length * 34, 8);
  const x = Math.min(position.x, window.innerWidth - menuWidth - 8);
  const y = Math.min(position.y, window.innerHeight - menuHeight - 8);

  return (
    <div
      className="fixed z-[9998]"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="rounded-lg overflow-hidden py-1 min-w-[220px]"
        style={{
          background: '#0c1833',
          border: '1px solid #1a2d54',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,163,255,0.06)',
        }}
      >
        {groups.map((group, gi) => (
          <div key={group.id}>
            {/* Separator between groups */}
            {gi > 0 && <div className="h-px bg-[#1a2d54] mx-2 my-1" />}

            {/* Group label */}
            {group.label && (
              <div className="px-3 pt-1.5 pb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#3d5275] font-mono">
                  {group.label}
                </span>
              </div>
            )}

            {/* Items */}
            {group.items.map((item) => (
              <div key={item.id}>
                {item.separator && <div className="h-px bg-[#1a2d54] mx-2 my-1" />}
                <button
                  onClick={() => {
                    if (!item.disabled) {
                      close();
                      item.handler(contextData);
                    }
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    item.disabled
                      ? 'text-[#2a3d5a] cursor-not-allowed'
                      : 'text-[#8E9BB4] hover:bg-[#122247] hover:text-white cursor-pointer'
                  }`}
                >
                  {item.icon && (
                    <LucideIcon
                      name={item.icon}
                      size={13}
                      className={item.disabled ? 'text-[#2a3d5a]' : 'text-[#3d5275]'}
                    />
                  )}
                  <span className="flex-1 text-xs font-medium">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[9px] font-mono text-[#3d5275] bg-[#07122A] border border-[#1a2d54] px-1 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
