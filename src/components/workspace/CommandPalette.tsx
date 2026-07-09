import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { commandRegistry } from '../../registry/commandRegistry';
import { searchService, type SearchResult } from '../../services/searchService';
import { LucideIcon } from '../LucideIcon';
import type { CommandDefinition } from '../../types/workspace';

// ─────────────────────────────────────────────────────────────
// CommandPalette: overlay global Ctrl+K (Commands) / Ctrl+P (Search).
// Dua mode dalam satu komponen — keputusan Q2: extend, not split.
// ─────────────────────────────────────────────────────────────

export const CommandPalette: React.FC = () => {
  const { isPaletteOpen, closePalette, paletteMode } = useWorkspace();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset + fokus setiap kali palette dibuka
  useEffect(() => {
    if (isPaletteOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isPaletteOpen]);

  // ── MODE: COMMAND ──────────────────────────────────────────
  const filteredCommands = useMemo<CommandDefinition[]>(
    () => commandRegistry.search(query),
    [query],
  );

  const commandGrouped = useMemo<Record<string, CommandDefinition[]>>(() => {
    const result: Record<string, CommandDefinition[]> = {};
    for (const cmd of filteredCommands) {
      if (!result[cmd.category]) result[cmd.category] = [];
      result[cmd.category].push(cmd);
    }
    return result;
  }, [filteredCommands]);

  // ── MODE: SEARCH ───────────────────────────────────────────
  const searchResults = useMemo<SearchResult[]>(
    () => searchService.search(query),
    [query],
  );

  const searchGrouped = useMemo<Record<string, SearchResult[]>>(() => {
    const result: Record<string, SearchResult[]> = {};
    for (const r of searchResults) {
      if (!result[r.category]) result[r.category] = [];
      result[r.category].push(r);
    }
    return result;
  }, [searchResults]);

  // ── UNIFIED FLAT LIST untuk keyboard nav ──────────────────
  const flatList = useMemo(
    () => (paletteMode === 'command' ? filteredCommands : searchResults),
    [paletteMode, filteredCommands, searchResults],
  );

  const executeActive = useCallback(() => {
    const item = flatList[activeIndex];
    if (!item) return;
    closePalette();
    setTimeout(() => {
      if (paletteMode === 'command') {
        (item as CommandDefinition).handler();
      } else {
        (item as SearchResult).action();
      }
    }, 50);
  }, [flatList, activeIndex, closePalette, paletteMode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeActive();
      }
    },
    [closePalette, flatList.length, executeActive],
  );

  // Scroll active item ke view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Reset activeIndex saat query / mode berubah
  useEffect(() => { setActiveIndex(0); }, [query, paletteMode]);

  if (!isPaletteOpen) return null;

  const isSearch = paletteMode === 'search';

  // Category order
  const commandCategoryOrder = ['Workspace', 'Navigation', 'Dialogue'];
  const searchCategoryOrder  = ['Navigation', 'Recent', 'Workspace'];

  const sortCategories = (cats: string[], order: string[]) =>
    cats.sort((a, b) => {
      const ai = order.indexOf(a) === -1 ? 99 : order.indexOf(a);
      const bi = order.indexOf(b) === -1 ? 99 : order.indexOf(b);
      return ai - bi;
    });

  const sortedCommandCategories = sortCategories(Object.keys(commandGrouped), commandCategoryOrder);
  const sortedSearchCategories  = sortCategories(Object.keys(searchGrouped), searchCategoryOrder);

  // Global index counter untuk keyboard nav
  let globalIndex = 0;

  // Helper — item renderer (commands)
  const renderCommandItem = (cmd: CommandDefinition, itemIndex: number) => {
    const isActive = itemIndex === activeIndex;
    return (
      <div
        key={cmd.id}
        data-active={isActive}
        onMouseEnter={() => setActiveIndex(itemIndex)}
        onClick={() => {
          closePalette();
          setTimeout(() => cmd.handler(), 50);
        }}
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-100"
        style={{
          background: isActive ? 'rgba(0,163,255,0.08)' : 'transparent',
          borderLeft: isActive ? '2px solid #00A3FF' : '2px solid transparent',
        }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all"
          style={{
            background: isActive ? 'rgba(0,163,255,0.15)' : 'rgba(0,163,255,0.04)',
            border: `1px solid ${isActive ? 'rgba(0,163,255,0.3)' : '#1a2d54'}`,
          }}
        >
          <LucideIcon name={cmd.icon} size={13} className={isActive ? 'text-[#00A3FF]' : 'text-[#3d5275]'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate" style={{ color: isActive ? '#F3F4F6' : '#8E9BB4' }}>
            {cmd.label}
          </p>
          {cmd.description && (
            <p className="text-[10px] text-[#3d5275] leading-tight truncate mt-0.5">{cmd.description}</p>
          )}
        </div>
        {cmd.shortcut && (
          <div className="flex items-center gap-1 shrink-0">
            {cmd.shortcut.split('+').map((key, i) => (
              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: '#07122A', border: '1px solid #1a2d54', color: isActive ? '#00A3FF' : '#3d5275' }}>
                {key}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Helper — item renderer (search results)
  const renderSearchItem = (result: SearchResult, itemIndex: number) => {
    const isActive = itemIndex === activeIndex;
    return (
      <div
        key={result.id}
        data-active={isActive}
        onMouseEnter={() => setActiveIndex(itemIndex)}
        onClick={() => {
          closePalette();
          setTimeout(() => result.action(), 50);
        }}
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-100"
        style={{
          background: isActive ? 'rgba(0,163,255,0.08)' : 'transparent',
          borderLeft: isActive ? '2px solid #00A3FF' : '2px solid transparent',
        }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{
            background: isActive ? 'rgba(0,163,255,0.15)' : 'rgba(0,163,255,0.04)',
            border: `1px solid ${isActive ? 'rgba(0,163,255,0.3)' : '#1a2d54'}`,
          }}
        >
          <LucideIcon name={result.icon} size={13} className={isActive ? 'text-[#00A3FF]' : 'text-[#3d5275]'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate" style={{ color: isActive ? '#F3F4F6' : '#8E9BB4' }}>
            {result.title}
          </p>
          {result.subtitle && (
            <p className="text-[10px] text-[#3d5275] leading-tight truncate mt-0.5">{result.subtitle}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(4, 8, 26, 0.75)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) closePalette(); }}
    >
      {/* Modal Card */}
      <div
        className="w-full max-w-xl mx-4 rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: '#0c1833',
          border: '1px solid #1a2d54',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,163,255,0.08)',
        }}
      >
        {/* Mode Tab + Input */}
        <div className="border-b border-[#1a2d54]">
          {/* Mode tabs */}
          <div className="flex border-b border-[#1a2d54]/60">
            <div
              className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest font-mono border-b-2 transition-colors"
              style={{ borderColor: !isSearch ? '#00A3FF' : 'transparent', color: !isSearch ? '#00A3FF' : '#3d5275' }}
            >
              Commands
            </div>
            <div
              className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest font-mono border-b-2 transition-colors"
              style={{ borderColor: isSearch ? '#00A3FF' : 'transparent', color: isSearch ? '#00A3FF' : '#3d5275' }}
            >
              Search
            </div>
          </div>
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3">
            <LucideIcon name={isSearch ? 'Search' : 'Command'} size={15} className="text-[#00A3FF] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSearch ? 'Search graphs, navigation, workspace...' : 'Type a command or search...'}
              className="flex-1 bg-transparent text-[#F3F4F6] text-sm outline-none placeholder-[#3d5275] font-sans"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#3d5275] hover:text-[#8E9BB4] transition-colors">
                <LucideIcon name="X" size={13} />
              </button>
            )}
            <div className="text-[10px] text-[#3d5275] font-mono border border-[#1a2d54] px-1.5 py-0.5 rounded">
              ESC
            </div>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[340px] overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a2d54 transparent' }}
        >
          {flatList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0,163,255,0.06)', border: '1px solid #1a2d54' }}>
                <LucideIcon name="SearchX" size={18} className="text-[#3d5275]" />
              </div>
              <p className="text-[#3d5275] text-sm font-sans">
                No {isSearch ? 'results' : 'commands'} found
              </p>
              {query && <p className="text-[#8E9BB4] text-sm font-mono">"{query}"</p>}
            </div>
          ) : isSearch ? (
            sortedSearchCategories.map((category) => {
              const results = searchGrouped[category];
              return (
                <div key={category}>
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-[#3d5275] uppercase font-mono">{category}</span>
                    <div className="flex-1 h-px bg-[#1a2d54]" />
                  </div>
                  {results.map((result) => renderSearchItem(result, globalIndex++))}
                </div>
              );
            })
          ) : (
            sortedCommandCategories.map((category) => {
              const cmds = commandGrouped[category];
              return (
                <div key={category}>
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-[#3d5275] uppercase font-mono">{category}</span>
                    <div className="flex-1 h-px bg-[#1a2d54]" />
                  </div>
                  {cmds.map((cmd) => renderCommandItem(cmd, globalIndex++))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#1a2d54] flex items-center justify-between">
          <div className="flex items-center gap-3 text-[9px] text-[#3d5275] font-mono">
            <span className="flex items-center gap-1">
              <kbd className="bg-[#07122A] border border-[#1a2d54] px-1 py-0.5 rounded text-[8px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-[#07122A] border border-[#1a2d54] px-1 py-0.5 rounded text-[8px]">↵</kbd>
              Execute
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-[#07122A] border border-[#1a2d54] px-1 py-0.5 rounded text-[8px]">ESC</kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#3d5275]">
            {isSearch ? (
              <span className="text-[#3d5275]">Ctrl+K for commands</span>
            ) : (
              <span className="text-[#3d5275]">Ctrl+P for search</span>
            )}
            <span className="text-[#1a2d54]">·</span>
            <span>{flatList.length} {isSearch ? 'result' : 'command'}{flatList.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
