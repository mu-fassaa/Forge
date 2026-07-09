import React, { useState, useEffect, useCallback } from 'react';
import { LucideIcon } from '../../../components/LucideIcon';

interface DialoguePreviewSimulatorProps {
  nodes: any[];
  edges: any[];
  variables: Record<string, string>;
  setVariables: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  addLog: (entry: { type: 'dialogue' | 'event' | 'variable' | 'condition' | 'system'; text: string }) => void;
  onClose: () => void;
}

export const DialoguePreviewSimulator: React.FC<DialoguePreviewSimulatorProps> = ({
  nodes,
  edges,
  variables,
  setVariables,
  addLog,
  onClose,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  // Helper to start/restart the preview simulator
  const startSimulation = useCallback(() => {
    // 1. Cari start node
    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) {
      addLog({ type: 'system', text: 'Error: No "Start Node" found on the canvas.' });
      return;
    }

    addLog({ type: 'system', text: 'Dialogue simulation restarted.' });
    setVariables({});

    // Temukan node yang terhubung ke output start node
    const firstEdge = edges.find((e) => e.source === startNode.id);
    if (firstEdge) {
      setCurrentNodeId(firstEdge.target);
    } else {
      setCurrentNodeId(null);
      addLog({ type: 'system', text: 'Branch ended: Start Node has no output connection.' });
    }
  }, [nodes, edges, addLog, setVariables]);

  // Restart simulator on init
  useEffect(() => {
    startSimulation();
  }, [startSimulation]);

  // Cari detail node aktif saat ini
  const currentNode = nodes.find((n) => n.id === currentNodeId) ?? null;

  // Lanjutkan eksekusi ke target node ID
  const advanceToNode = (targetId: string, choiceLabel?: string) => {
    if (choiceLabel) {
      addLog({ type: 'system', text: `Selected option: "${choiceLabel}"` });
    }
    setCurrentNodeId(targetId);
  };

  // Skip / Auto advance untuk non-interactive nodes
  const skipNode = (sourceHandle: string = 'out') => {
    if (!currentNodeId) return;
    const outgoingEdge = edges.find(
      (e) => e.source === currentNodeId && (e.sourceHandle === sourceHandle || !e.sourceHandle)
    );
    if (outgoingEdge) {
      setCurrentNodeId(outgoingEdge.target);
    } else {
      setCurrentNodeId(null);
      addLog({ type: 'system', text: 'Conversation reached a dead end (no connected outputs).' });
    }
  };

  // Simulasi eval kondisi
  const handleConditionChoice = (outcome: boolean) => {
    addLog({
      type: 'condition',
      text: `Evaluated Condition branch to: ${outcome ? 'TRUE' : 'FALSE'}`,
    });
    skipNode(outcome ? 'true' : 'false');
  };

  // Simulasi execute set variable
  const executeVariableNode = () => {
    if (!currentNode) return;
    const { variableName = '?', operation = 'set', value = '?' } = currentNode.data as any;
    const opText = operation === 'set' ? '=' : operation === 'add' ? '+=' : '-=';

    addLog({
      type: 'variable',
      text: `Set variable: ${variableName} ${opText} ${value}`,
    });

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

    addLog({
      type: 'event',
      text: `Fired event signal: "${eventName}"${payloadText}`,
    });

    skipNode();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#070814]/50 border-r border-[#1a1c36]/50 relative">
      {/* Absolute top helper tags for agnostic clean interface */}
      <div className="absolute top-4 left-4 text-[9px] text-gray-600 font-mono select-none">
        Live Sandbox | Variables Active: {Object.keys(variables).length}
      </div>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-[9px] text-gray-500 hover:text-gray-300 font-mono flex items-center gap-1 cursor-pointer bg-[#0b0c1e] px-2 py-1 rounded border border-[#1a1c36] transition-all"
      >
        <LucideIcon name="X" size={8} /> Exit Sandbox
      </button>

      {/* Simulation Canvas / Dialogue Screen */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 w-full mb-6 mt-6">
        {currentNode ? (
          <div className="w-full space-y-5 animate-fade-in">
            {/* Dialogue Card View */}
            {currentNode.type === 'dialogue' && (
              <div className="rounded-2xl bg-[#0b0c1e] border border-[#D946EF]/25 p-5 shadow-xl max-w-md mx-auto w-full relative">
                <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-[#D946EF]/10 border border-[#D946EF]/20 text-[8px] tracking-widest uppercase font-black text-[#e879f9]">
                  {currentNode.data.speaker || 'Karakter'}
                </div>
                <p className="text-sm font-semibold text-gray-200 leading-relaxed pt-2">
                  {currentNode.data.text || (
                    <span className="italic text-gray-600">Belum ada percakapan...</span>
                  )}
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
                  if ({currentNode.data.parameter || '?'} {currentNode.data.operator || '=='}{' '}
                  {currentNode.data.value || '?'})
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
                  {currentNode.data.variableName || '?'}{' '}
                  {currentNode.data.operation === 'set'
                    ? '='
                    : currentNode.data.operation === 'add'
                    ? '+='
                    : '-='}{' '}
                  {currentNode.data.value || '?'}
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
                  Conversation ended with status:{' '}
                  <code className="text-red-400">"{currentNode.data.endType || 'default'}"</code>
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
                          <span>
                            {choice.text || (
                              <span className="italic opacity-50">Tanpa label teks...</span>
                            )}
                          </span>
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
  );
};
