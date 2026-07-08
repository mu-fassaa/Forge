import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

interface LogEntry {
  type: 'dialogue' | 'event' | 'variable' | 'condition' | 'system';
  speaker?: string;
  text: string;
}

export const PreviewModal: React.FC = () => {
  const { activeModal, setActiveModal, activeEditor, addNotification } = useWorkspace();

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const isOpen = activeModal === 'preview';

  const nodes = activeEditor?.nodes || [];
  const edges = activeEditor?.edges || [];

  // Helper to start/restart the preview simulator
  const startSimulation = useCallback(() => {
    // 1. Cari start node
    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) {
      addNotification('error', 'Cannot simulate: No "Start Node" found on the canvas.');
      setActiveModal(null);
      return;
    }

    setHistory([{ type: 'system', text: 'Dialogue simulation started.' }]);
    setVariables({});

    // Temukan node yang terhubung ke output start node
    const firstEdge = edges.find((e) => e.source === startNode.id);
    if (firstEdge) {
      setCurrentNodeId(firstEdge.target);
    } else {
      setCurrentNodeId(null);
      setHistory((prev) => [
        ...prev,
        { type: 'system', text: 'Branch ended: Start Node has no output connection.' },
      ]);
    }
  }, [nodes, edges, addNotification, setActiveModal]);

  // Restart simulator when modal is opened
  useEffect(() => {
    if (isOpen) {
      startSimulation();
    }
  }, [isOpen, startSimulation]);

  if (!isOpen) return null;

  const handleClose = () => setActiveModal(null);

  // Cari detail node aktif saat ini
  const currentNode = nodes.find((n) => n.id === currentNodeId) ?? null;

  // Lanjutkan eksekusi ke target node ID
  const advanceToNode = (targetId: string, choiceLabel?: string) => {
    if (choiceLabel) {
      setHistory((prev) => [...prev, { type: 'system', text: `Selected option: "${choiceLabel}"` }]);
    }
    setCurrentNodeId(targetId);
  };

  // Skip / Auto advance untuk non-interactive nodes
  const skipNode = (sourceHandle: string = 'out') => {
    if (!currentNodeId) return;
    const outgoingEdge = edges.find((e) => e.source === currentNodeId && (e.sourceHandle === sourceHandle || !e.sourceHandle));
    if (outgoingEdge) {
      setCurrentNodeId(outgoingEdge.target);
    } else {
      setCurrentNodeId(null);
      setHistory((prev) => [...prev, { type: 'system', text: 'Conversation reached a dead end (no connected outputs).' }]);
    }
  };

  // Simulasi eval kondisi
  const handleConditionChoice = (outcome: boolean) => {
    setHistory((prev) => [
      ...prev,
      { type: 'condition', text: `Evaluated Condition branch to: ${outcome ? 'TRUE' : 'FALSE'}` },
    ]);
    skipNode(outcome ? 'true' : 'false');
  };

  // Simulasi execute set variable
  const executeVariableNode = () => {
    if (!currentNode) return;
    const { variableName = '?', operation = 'set', value = '?' } = currentNode.data as any;
    const opText = operation === 'set' ? '=' : operation === 'add' ? '+=' : '-=';
    
    setHistory((prev) => [
      ...prev,
      { type: 'variable', text: `Set variable: ${variableName} ${opText} ${value}` },
    ]);
    
    // Update local variables state
    setVariables((prev) => {
      const currentVal = parseFloat(prev[variableName] || '0') || 0;
      const modVal = parseFloat(value) || 0;
      let newVal = value;
      if (operation === 'add') newVal = (currentVal + modVal).toString();
      if (operation === 'subtract') newVal = (currentVal - modVal).toString();
      return { ...prev, [variableName]: newVal };
    });

    skipNode();
  };

  // Simulasi trigger event
  const executeEventNode = () => {
    if (!currentNode) return;
    const { eventName = '?', eventValue = '' } = currentNode.data as any;
    const payloadText = eventValue ? ` with payload "${eventValue}"` : '';
    
    setHistory((prev) => [
      ...prev,
      { type: 'event', text: `Fired event signal: "${eventName}"${payloadText}` },
    ]);
    
    skipNode();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
      <div className="relative w-full max-w-2xl bg-[#0b0c1e] border border-[#1a1c36] rounded-xl shadow-2xl flex flex-col h-[75vh] animate-fade-in text-gray-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1a1c36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <LucideIcon name="MessageSquare" className="text-[#D946EF]" size={16} />
            <h4 className="font-extrabold text-sm tracking-wider uppercase">Dialogue Simulator</h4>
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
          
          {/* Kiri: Simulator Sandbox */}
          <div className="flex-1 flex flex-col justify-between p-6 bg-[#070814]/50 border-r border-[#1a1c36]/50 relative">
            
            {/* Simulation Canvas / Dialogue Screen */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 w-full mb-6">
              
              {currentNode ? (
                <div className="w-full space-y-5 animate-fade-in">
                  
                  {/* Dialogue Card View */}
                  {currentNode.type === 'dialogue' && (
                    <div className="rounded-2xl bg-[#0b0c1e] border border-[#D946EF]/25 p-5 shadow-xl max-w-md mx-auto w-full relative">
                      <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-[#D946EF]/10 border border-[#D946EF]/20 text-[8px] tracking-widest uppercase font-black text-[#e879f9]">
                        {currentNode.data.speaker || 'Karakter'}
                      </div>
                      <p className="text-sm font-semibold text-gray-200 leading-relaxed pt-2">
                        {currentNode.data.text || <span className="italic text-gray-600">Belum ada percakapan...</span>}
                      </p>
                    </div>
                  )}

                  {/* Condition Node View */}
                  {currentNode.type === 'condition' && (
                    <div className="rounded-2xl bg-[#0b0c1e] border border-amber-500/25 p-5 shadow-xl max-w-sm mx-auto w-full text-center space-y-3">
                      <div className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <LucideIcon name="GitBranch" size={13} />
                        Evaluate Condition
                      </div>
                      <code className="block text-[10px] text-amber-300 font-mono bg-amber-500/5 px-2.5 py-1.5 rounded border border-amber-500/10">
                        if ({currentNode.data.parameter || '?'} {currentNode.data.operator || '=='} {currentNode.data.value || '?'})
                      </code>
                      <p className="text-[10px] text-gray-500">Pick which pathway to simulate:</p>
                    </div>
                  )}

                  {/* Variable Node View */}
                  {currentNode.type === 'variable' && (
                    <div className="rounded-2xl bg-[#0b0c1e] border border-indigo-500/25 p-5 shadow-xl max-w-sm mx-auto w-full text-center space-y-3">
                      <div className="text-indigo-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <LucideIcon name="Variable" size={13} />
                        Assign Variable
                      </div>
                      <code className="block text-[10px] text-indigo-300 font-mono bg-indigo-500/5 px-2.5 py-1.5 rounded border border-indigo-500/10">
                        {currentNode.data.variableName || '?'} {currentNode.data.operation === 'set' ? '=' : currentNode.data.operation === 'add' ? '+=' : '-='} {currentNode.data.value || '?'}
                      </code>
                    </div>
                  )}

                  {/* Event Node View */}
                  {currentNode.type === 'event' && (
                    <div className="rounded-2xl bg-[#0b0c1e] border border-emerald-500/25 p-5 shadow-xl max-w-sm mx-auto w-full text-center space-y-3">
                      <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <LucideIcon name="Zap" size={13} />
                        Trigger Event Signal
                      </div>
                      <code className="block text-[10px] text-emerald-300 font-mono bg-emerald-500/5 px-2.5 py-1.5 rounded border border-emerald-500/10">
                        emit("{currentNode.data.eventName || '?'}")
                      </code>
                    </div>
                  )}

                  {/* End Node View */}
                  {currentNode.type === 'end' && (
                    <div className="rounded-2xl bg-[#0b0c1e] border border-red-500/25 p-5 shadow-xl max-w-sm mx-auto w-full text-center space-y-3">
                      <div className="text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <LucideIcon name="CircleStop" size={13} />
                        Conversation Terminated
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Conversation ended with status: <code className="text-red-400">"{currentNode.data.endType || 'default'}"</code>
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-2">
                    <LucideIcon name="CircleStop" size={16} />
                  </div>
                  <h5 className="text-xs font-bold text-gray-300">Simulation Finished</h5>
                  <p className="text-[9px] text-gray-600 max-w-[240px] leading-relaxed mx-auto">
                    The conversation path reached a terminal end node or has no output connections.
                  </p>
                </div>
              )}

            </div>

            {/* Interaction Options Drawer (Bawah) */}
            <div className="shrink-0 bg-[#0b0c1e] border border-[#1a1c36] rounded-xl p-4 min-h-[96px] flex flex-col justify-center gap-2.5">
              {currentNode ? (
                <>
                  {/* Dialogue Choices */}
                  {currentNode.type === 'dialogue' && (
                    <>
                      {currentNode.data.choices && currentNode.data.choices.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {currentNode.data.choices.map((choice: any) => {
                            // Temukan target targetId dari handle-edge
                            const matchingEdge = edges.find(
                              (e) => e.source === currentNode.id && e.sourceHandle === choice.id
                            );
                            const isDisabled = !matchingEdge;

                            return (
                              <button
                                key={choice.id}
                                disabled={isDisabled}
                                onClick={() => advanceToNode(matchingEdge!.target, choice.text)}
                                className={`w-full text-xs font-bold py-2 px-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                                  isDisabled
                                    ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed'
                                    : 'bg-[#D946EF]/5 border-[#D946EF]/30 hover:border-[#D946EF]/60 text-[#e879f9] cursor-pointer'
                                }`}
                              >
                                <span>{choice.text || <span className="italic opacity-50">Tanpa label teks...</span>}</span>
                                <LucideIcon name="ChevronRight" size={12} />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          onClick={() => skipNode('out')}
                          className="w-full text-xs font-bold py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          Continue
                          <LucideIcon name="ChevronRight" size={12} />
                        </button>
                      )}
                    </>
                  )}

                  {/* Condition Branches options */}
                  {currentNode.type === 'condition' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConditionChoice(true)}
                        className="flex-1 text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all cursor-pointer"
                      >
                        Simulate True
                      </button>
                      <button
                        onClick={() => handleConditionChoice(false)}
                        className="flex-1 text-xs font-bold py-2 bg-red-600/70 hover:bg-red-600 text-white rounded-lg transition-all cursor-pointer"
                      >
                        Simulate False
                      </button>
                    </div>
                  )}

                  {/* Variable Assign continue */}
                  {currentNode.type === 'variable' && (
                    <button
                      onClick={executeVariableNode}
                      className="w-full text-xs font-bold py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Apply & Continue
                    </button>
                  )}

                  {/* Event fire continue */}
                  {currentNode.type === 'event' && (
                    <button
                      onClick={executeEventNode}
                      className="w-full text-xs font-bold py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Fire Signal & Continue
                    </button>
                  )}

                  {/* End node finish */}
                  {currentNode.type === 'end' && (
                    <button
                      onClick={startSimulation}
                      className="w-full text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LucideIcon name="RotateCcw" size={12} />
                      Restart Dialogue
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={startSimulation}
                  className="w-full text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LucideIcon name="RotateCcw" size={12} />
                  Restart Simulation
                </button>
              )}
            </div>

          </div>

          {/* Kanan: Variables & Live Console Logs */}
          <div className="w-64 bg-[#090a18] flex flex-col overflow-hidden shrink-0">
            
            {/* Live variables state */}
            <div className="p-4 border-b border-[#14152a] shrink-0">
              <span className="text-[8px] uppercase tracking-widest font-extrabold text-gray-500 block mb-2">Live Variables</span>
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
              <span className="text-[8px] uppercase tracking-widest font-extrabold text-gray-500 block mb-2 shrink-0">Simulator Logs</span>
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
