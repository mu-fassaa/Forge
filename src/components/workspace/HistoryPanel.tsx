import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

interface HistoryPanelProps {
  /**
   * Paling bagus jika panel ini menerima refs ke state nodes/edges aktif dari editor,
   * atau jika editor menyalurkan control undo/redo-nya.
   * Karena React Flow butuh setNodes & setEdges, kita bisa meneruskannya
   * atau mengontrol undo/redo dari parent.
   */
  editorNodes?: any[];
  editorEdges?: any[];
  setEditorNodes?: (nodes: any) => void;
  setEditorEdges?: (edges: any) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  editorNodes = [],
  editorEdges = [],
  setEditorNodes,
  setEditorEdges,
}) => {
  const {
    historyLogs,
    clearHistory,
    undo,
    redo,
    addNotification,
  } = useWorkspace();

  const handleUndo = () => {
    if (!setEditorNodes || !setEditorEdges) {
      addNotification('warning', 'Undo is not supported in the current workspace context.');
      return;
    }
    undo(editorNodes, editorEdges, setEditorNodes, setEditorEdges);
  };

  const handleRedo = () => {
    if (!setEditorNodes || !setEditorEdges) {
      addNotification('warning', 'Redo is not supported in the current workspace context.');
      return;
    }
    redo(editorNodes, editorEdges, setEditorNodes, setEditorEdges);
  };

  return (
    <div className="w-72 min-w-[288px] h-full bg-[#0b0c1e] border-l border-[#14152a] flex flex-col text-gray-200">
      
      {/* Header */}
      <div className="h-14 border-b border-[#14152a] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <LucideIcon name="History" size={14} className="text-purple-400" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300">History & Timeline</span>
        </div>
        
        {/* Clear Button */}
        {historyLogs.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Undo/Redo Action Bar */}
      <div className="px-4 py-3 border-b border-[#14152a] flex items-center gap-2 shrink-0 bg-[#090a18]">
        <button
          onClick={handleUndo}
          disabled={!setEditorNodes}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg border border-[#1a1c36] hover:border-gray-600 bg-[#070814] text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <LucideIcon name="Undo2" size={12} />
          Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={!setEditorNodes}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg border border-[#1a1c36] hover:border-gray-600 bg-[#070814] text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <LucideIcon name="Redo2" size={12} />
          Redo
        </button>
      </div>

      {/* History Log Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {historyLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-10 h-10 rounded-full bg-[#0d0e26] border border-[#1a1c36] flex items-center justify-center mb-2.5">
              <LucideIcon name="History" size={16} className="text-gray-700" />
            </div>
            <p className="text-xs font-bold text-gray-600">No actions recorded</p>
            <p className="text-[9px] text-gray-700 max-w-[200px] mt-1 leading-relaxed">
              Your edits, node movements, and link connections will appear here.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-purple-500/10 pl-3.5 ml-2.5 space-y-4">
            {historyLogs.map((log) => (
              <div key={log.id} className="relative group">
                
                {/* Timeline node marker */}
                <div className="absolute -left-[20px] top-1.5 w-2 h-2 rounded-full bg-purple-500 ring-4 ring-[#0b0c1e] group-first:bg-pink-500 group-first:animate-pulse" />
                
                <div>
                  <span className="text-[9px] text-gray-600 font-mono block">{log.timestamp}</span>
                  <p className="text-xs font-bold text-gray-300 mt-0.5 leading-snug">{log.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
