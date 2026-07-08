import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

interface LogEntry {
  type: string;
  speaker?: string;
  text: string;
}

export const PreviewModal: React.FC = () => {
  const { activeModal, setActiveModal, activeEditor } = useWorkspace();

  const [history, setHistory] = useState<LogEntry[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const isOpen = activeModal === 'preview';

  const nodes = activeEditor?.nodes || [];
  const edges = activeEditor?.edges || [];

  const handleClose = () => setActiveModal(null);

  // Dynamic log writing handler for the sub-previewer
  const addLog = (entry: LogEntry) => {
    setHistory((prev) => [...prev, entry]);
  };

  // Reset logs when simulator is opened
  useEffect(() => {
    if (isOpen) {
      setHistory([]);
      setVariables({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Pluggable Preview Component registered by the active editor plugin
  const ActivePreviewComponent = activeEditor?.previewComponent as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
      <div className="relative w-full max-w-3xl bg-[#0b0c1e] border border-[#1a1c36] rounded-xl shadow-2xl flex flex-col h-[75vh] animate-fade-in text-gray-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1a1c36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <LucideIcon name="MessageSquare" className="text-[#D946EF]" size={16} />
            <h4 className="font-extrabold text-sm tracking-wider uppercase">Active Preview Simulator</h4>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <LucideIcon name="X" size={16} />
          </button>
        </div>

        {/* Workspace: Split Simulator & variables/logs tracker */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Kiri: Pluggable Simulator (Agnostic Canvas Container) */}
          {ActivePreviewComponent ? (
            <ActivePreviewComponent
              nodes={nodes}
              edges={edges}
              variables={variables}
              setVariables={setVariables}
              addLog={addLog}
              onClose={handleClose}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#070814]/50 border-r border-[#1a1c36]/50">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <LucideIcon name="AlertTriangle" size={16} />
              </div>
              <h5 className="text-xs font-bold text-gray-300">No Preview Component</h5>
              <p className="text-[9px] text-gray-600 max-w-[240px] leading-relaxed text-center mt-1">
                The active editor has not registered any pluggable simulator view to render inside this preview modal.
              </p>
            </div>
          )}

          {/* Kanan: Variables & Live Console Logs (Agnostic Console Dashboard) */}
          <div className="w-64 bg-[#090a18] flex flex-col overflow-hidden shrink-0">
            
            {/* Live variables state */}
            <div className="p-4 border-b border-[#14152a] shrink-0">
              <span className="text-[8px] uppercase tracking-widest font-extrabold text-gray-500 block mb-2 font-bold">Live Variables</span>
              {Object.keys(variables).length === 0 ? (
                <p className="text-[10px] text-gray-700 italic">No variables changed yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {Object.entries(variables).map(([name, val]) => (
                    <div key={name} className="flex justify-between items-center text-[10px] font-mono bg-[#070814] border border-[#1a1c36] px-2 py-1 rounded">
                      <span className="text-gray-400">{name}</span>
                      <span className="text-indigo-400 font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live console changes logger */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <span className="text-[8px] uppercase tracking-widest font-extrabold text-gray-500 block mb-2 shrink-0 font-bold font-bold">Simulator Logs</span>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[9px] text-gray-400">
                {history.map((log, index) => (
                  <div key={index} className="leading-normal border-b border-[#14152a]/20 pb-1">
                    {log.type === 'system' && <span className="text-gray-600">[SYS] {log.text}</span>}
                    {log.type === 'event' && <span className="text-emerald-400">[EVT] {log.text}</span>}
                    {log.type === 'variable' && <span className="text-indigo-400">[VAR] {log.text}</span>}
                    {log.type === 'condition' && <span className="text-amber-400">[CND] {log.text}</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1a1c36] flex items-center justify-end bg-[#0d0e26] rounded-b-xl shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#14152a] hover:bg-[#1a1c36] border border-gray-700 text-gray-300 transition-all duration-200 cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
