import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import { LucideIcon } from '../../components/LucideIcon';
import { nodeRegistry } from '../../platform/workspace/nodeRegistry';
import { InspectorPanel } from './components/InspectorPanel';
import { HistoryPanel } from '../../components/workspace/HistoryPanel';
import { type NodePort } from './types/nodes';
import { DialoguePreviewSimulator } from './components/DialoguePreviewSimulator';

import { useWorkspace } from '../../context/WorkspaceContext';
import { validateDialogueGraph, type ValidationError } from './utils/dialogueValidator';
import { compileDialogueGraph } from './utils/dialogueCompiler';
import { recentGraphManager } from '../../platform/workspace/recentGraphManager';
import { setDialogueHandlers } from './index';

// Import style CSS dari React Flow
import '@xyflow/react/dist/style.css';

// Context untuk mendistribusikan data internal editor (seperti warning validasi)
// ke custom node components tanpa mengotori serialization payload data node.
export const DialogueEditorContext = React.createContext<{
  validationErrors: ValidationError[];
} | null>(null);

export const useDialogueEditor = () => {
  const ctx = React.useContext(DialogueEditorContext);
  if (!ctx) {
    throw new Error('useDialogueEditor must be used inside a DialogueEditorContext.Provider');
  }
  return ctx;
};

const DialogueEditorContent: React.FC = () => {
  const {
    loadProject,
    setActiveEditor,
    addHistoryLog,
    pushStateToStack,
    settings,
    layoutTab,
    setActiveModal,
    setValidationErrors,
    addNotification,
    saveProject,
    metadata,
  } = useWorkspace();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // ── Muat data simpanan pertama kali (On Mount) ──────────────
  useEffect(() => {
    const savedData = loadProject('dialogue');
    if (savedData) {
      setNodes(savedData.nodes || []);
      setEdges(savedData.edges || []);
      // Push state awal ke undo stack agar bisa di-undo
      // pushStateToStack(savedData.nodes || [], savedData.edges || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sinkronkan Active Editor Registry ──────────────────────
  useEffect(() => {
    setActiveEditor({
      id: 'dialogue',
      nodes,
      edges,
      setNodes,
      setEdges,
      previewComponent: DialoguePreviewSimulator,
      publishInfo: {
        title: 'Dialogue Tree Compiled',
        description: "Dialogue tree schemas are verified and ready to be imported by Godot's parser.",
      },
    });
    return () => {
      setActiveEditor(null);
    };
  }, [nodes, edges, setNodes, setEdges, setActiveEditor]);

  // ── Dialogue Command & Shortcut Registration (Plugin) ────────────────
  // Dialogue mendaftarkan commandnya sendiri. Core tidak tahu ini.
  const nodesRef = React.useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = React.useRef(edges);
  edgesRef.current = edges;
  const saveProjectRef = React.useRef(saveProject);
  saveProjectRef.current = saveProject;
  const setActiveModalRef = React.useRef(setActiveModal);
  setActiveModalRef.current = setActiveModal;
  const addNotificationRef = React.useRef(addNotification);
  addNotificationRef.current = addNotification;
  const metadataRef = React.useRef(metadata);
  metadataRef.current = metadata;

  // ── Dialogue Handlers Binding ──────────────────────────────
  useEffect(() => {
    setDialogueHandlers({
      save: () => {
        saveProjectRef.current(nodesRef.current, edgesRef.current, 'dialogue');
        recentGraphManager.updateCounts('dialogue', nodesRef.current.length, edgesRef.current.length);
        addNotificationRef.current('success', 'Project saved successfully.');
      },
      validate: () => {
        const errors = validateDialogueGraph(nodesRef.current, edgesRef.current);
        if (errors.length === 0) {
          addNotificationRef.current('success', 'Graph validation passed — no errors found.');
        } else {
          addNotificationRef.current('warning', `Validation found ${errors.length} issue(s).`);
        }
      },
      export: () => {
        const errors = validateDialogueGraph(nodesRef.current, edgesRef.current);
        if (errors.length > 0) {
          addNotificationRef.current('warning', 'Fix validation errors before exporting.');
          return;
        }
        compileDialogueGraph(nodesRef.current, edgesRef.current);
        addNotificationRef.current('success', 'Dialogue graph compiled successfully.');
      }
    });

    // Catat sesi ini ke Recent Graph Manager
    recentGraphManager.add({
      graphId: 'dialogue',
      projectName: metadataRef.current.name,
      editorType: 'Dialogue Editor',
      lastOpenedAt: new Date().toISOString(),
      nodeCount: nodesRef.current.length,
      edgeCount: edgesRef.current.length,
    });    return () => {
      setDialogueHandlers(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Node yang sedang dipilih di canvas
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const allNodeDefs = useMemo(() => nodeRegistry.getAll(), []);
  const [nodeTypeToAdd, setNodeTypeToAdd] = useState<string>(allNodeDefs[0]?.type ?? 'dialogue');
  const reactFlowNodeTypes = useMemo(() => nodeRegistry.buildNodeTypes(), []);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportedJsonText, setExportedJsonText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Koneksi antar node ──────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      pushStateToStack(nodes, edges);
      setEdges((eds) => addEdge(params, eds));
      addHistoryLog('Connected nodes');
    },
    [setEdges, nodes, edges, pushStateToStack, addHistoryLog]
  );

  // ── Sinkronkan selectedNode saat selection berubah ──────────
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        // Ambil versi terbaru dari state — bukan dari closure lama
        setSelectedNode(selectedNodes[0]);
      } else {
        setSelectedNode(null);
      }
    },
    []
  );

  // Sinkronkan data selectedNode agar selalu up-to-date saat nodes berubah
  // (mencegah inspector menampilkan data lama)
  const currentSelectedNode = useMemo(() => {
    if (!selectedNode) return null;
    return nodes.find((n) => n.id === selectedNode.id) ?? null;
  }, [selectedNode, nodes]);

  // ── Handler update data node dari Inspector ─────────────────
  const { setIsDirty } = useWorkspace();
  
  const handleNodeDataChange = useCallback(
    (nodeId: string, key: string, value: unknown) => {
      // Pindahkan state saat ini ke undo stack sebelum mengedit
      // Untuk mencegah flood stack saat mengetik, kita hanya push jika canvas bersih (tidak dirty)
      setNodes((prevNodes) => {
        const targetNode = prevNodes.find(n => n.id === nodeId);
        if (targetNode && targetNode.data[key] !== value) {
          setIsDirty(true);
        }
        return prevNodes.map((n) => {
          if (n.id !== nodeId) return n;
          return { ...n, data: { ...n.data, [key]: value } };
        });
      });
    },
    [setNodes, setIsDirty]
  );

  // ── Handler update output ports node dari Inspector ──────────
  // Forge Core: mengubah outputs di root level node.
  const handleNodeOutputsChange = useCallback(
    (nodeId: string, newOutputs: NodePort[]) => {
      pushStateToStack(nodes, edges);
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.id !== nodeId) return n;
          return { ...n, ...({ outputs: newOutputs } as any) };
        })
      );
      addHistoryLog('Modified output ports');
    },
    [setNodes, nodes, edges, pushStateToStack, addHistoryLog]
  );

  // ── Tambah node baru dari registry ──────────────────────────
  const handleAddNode = useCallback(
    (type: string) => {
      if (type === 'start') {
        const hasStartNode = nodes.some((n) => n.type === 'start');
        if (hasStartNode) {
          addNotification('warning', 'Only one Start Node is allowed per graph.');
          return;
        }
      }
      
      pushStateToStack(nodes, edges);
      const def = nodeRegistry.get(type);
      const nodeId = `${type}_node_${Date.now()}`;
      const newNode: Node = {
        id: nodeId,
        type,
        position: {
          x: 150 + Math.random() * 200,
          y: 100 + Math.random() * 150,
        },
        data: { ...def.defaultData },
        ...({ inputs: def.inputs, outputs: def.outputs } as any),
      };
      setNodes((prev) => [...prev, newNode]);
      addHistoryLog(`Added ${def.title}`);
    },
    [setNodes, nodes, edges, pushStateToStack, addHistoryLog, addNotification]
  );

  // ── Clear canvas ─────────────────────────────────────────────
  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh node dan hubungan di canvas?')) {
      pushStateToStack(nodes, edges);
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      addHistoryLog('Cleared canvas');
    }
  }, [setNodes, setEdges, nodes, edges, pushStateToStack, addHistoryLog]);

  // ── Export JSON ──────────────────────────────────────────────
  const generateExportJson = useCallback(() => {
    const compiled = compileDialogueGraph(nodes, edges);
    return JSON.stringify(compiled, null, 2);
  }, [nodes, edges]);


  const handleOpenExportModal = () => {
    setExportedJsonText(generateExportJson());
    setIsExportModalOpen(true);
    setCopySuccess(false);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedJsonText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks: ', err);
    }
  };

  const handleDownloadJsonFile = () => {
    const blob = new Blob([exportedJsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'forge_dialogue_export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Run Validation Engine ──────────────────────────────────
  const validationErrors = useMemo(() => {
    return validateDialogueGraph(nodes, edges);
  }, [nodes, edges]);

  // ── Sync Validation Errors to Workspace Context ──────────────
  useEffect(() => {
    setValidationErrors(validationErrors);
    return () => {
      setValidationErrors([]);
    };
  }, [validationErrors, setValidationErrors]);

  return (
    <DialogueEditorContext.Provider value={{ validationErrors }}>
      <div className="flex-1 flex flex-col h-full bg-[#070814] select-none">
      {/* ── Topbar / Toolbar ── */}
      <div className="h-14 border-b border-[#1a2d54] px-6 flex items-center justify-between bg-[#0c1833] z-10 shrink-0 font-sans select-none">
        <div>
          <div className="flex items-center gap-2">
            <LucideIcon name="MessageSquare" className="text-[#00A3FF]" size={15} />
            <h3 className="font-extrabold text-[#F3F4F6] text-xs tracking-wider uppercase">Dialogue Trees</h3>
          </div>
          <p className="text-[10px] text-[#8E9BB4]/65 mt-0.5 font-mono">
            Design branching narrative dialogues, events, and conditions.
          </p>
        </div>

        {/* Grouped Toolbar Controls */}
        <div className="flex items-center gap-3 font-mono">
          {/* GROUP 1: Node Creator */}
          <div className="flex items-center gap-1.5 bg-[#07122A] border border-[#1a2d54] rounded-lg p-1">
            <select
              value={nodeTypeToAdd}
              onChange={(e) => setNodeTypeToAdd(e.target.value)}
              className="bg-transparent text-gray-300 text-[10px] font-bold px-2 py-0.5 focus:outline-none border-none cursor-pointer uppercase"
            >
              {allNodeDefs.map((def) => (
                <option key={def.type} value={def.type} className="bg-[#0c1833] text-gray-300 uppercase">
                  {def.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleAddNode(nodeTypeToAdd)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold bg-[#00A3FF] hover:bg-[#008be6] text-white transition-all duration-150 cursor-pointer shadow-sm uppercase font-mono"
            >
              <LucideIcon name="Plus" size={11} className="stroke-[3]" />
              Add Node
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#1a2d54]" />

          {/* GROUP 2: Simulator & Operations */}
          <button
            onClick={() => setActiveModal('preview')}
            disabled={nodes.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-150 cursor-pointer uppercase ${
              nodes.length === 0
                ? 'opacity-30 border-[#1a2d54] text-gray-500 cursor-not-allowed'
                : 'bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
            }`}
          >
            <LucideIcon name="Play" size={11} className="fill-emerald-400/10" />
            Preview Graph
          </button>

          <button
            onClick={handleOpenExportModal}
            disabled={nodes.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-150 cursor-pointer uppercase ${
              nodes.length === 0
                ? 'opacity-30 border-[#1a2d54] text-gray-500 cursor-not-allowed'
                : 'border-[#00A3FF]/20 text-[#00A3FF] bg-[#00A3FF]/5 hover:bg-[#00A3FF]/10 hover:border-[#00A3FF]/40'
            }`}
          >
            <LucideIcon name="Code" size={11} />
            Export JSON
          </button>

          <div className="h-4 w-[1px] bg-[#1a2d54]" />

          {/* GROUP 3: Canvas Cleanup */}
          <button
            onClick={handleClearCanvas}
            disabled={nodes.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer uppercase ${
              nodes.length === 0
                ? 'opacity-30 bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-red-500/5 hover:bg-red-500/15 border-red-500/25 text-red-400'
            }`}
          >
            <LucideIcon name="Trash2" size={11} />
            Clear
          </button>
        </div>
      </div>

      {/* ── Main area: Canvas + Inspector ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div
          className="flex-1 relative bg-[#070814]"
          onContextMenu={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('forge:contextmenu', {
              detail: { clientX: e.clientX, clientY: e.clientY },
            }));
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={reactFlowNodeTypes}
            snapToGrid={settings.snap}
            snapGrid={[20, 20]}
            fitView
          >
            {settings.grid && <Background color="#16172e" gap={20} size={1.5} />}
            <Controls className="!bg-[#0b0c1e] !border-[#1a1c36] !text-gray-400 !rounded-lg !overflow-hidden" />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4 select-none">
              <div className="w-12 h-12 rounded bg-[#00A3FF]/5 flex items-center justify-center mb-3 border border-[#00A3FF]/15 text-[#00A3FF]/50">
                <LucideIcon name="MessageSquare" size={20} />
              </div>
              <h4 className="text-gray-300 font-bold text-xs mb-1">Dialogue Graph Canvas Empty</h4>
              <p className="text-[10px] text-gray-500 max-w-xs leading-normal">
                Select node type and click{' '}
                <span className="text-[#00A3FF] font-bold">"Add Node"</span> to begin editing narrative tracks.
              </p>
            </div>
          )}
        </div>

        {/* Right side drawer: Switch based on header tabs */}
        {layoutTab === 'explorer' ? (
          <InspectorPanel
            selectedNode={currentSelectedNode}
            onNodeDataChange={handleNodeDataChange}
            onNodeOutputsChange={handleNodeOutputsChange}
          />
        ) : layoutTab === 'history' ? (
          <HistoryPanel
            editorNodes={nodes}
            editorEdges={edges}
            setEditorNodes={setNodes}
            setEditorEdges={setEdges}
          />
        ) : (
          <div className="w-72 min-w-[288px] h-full bg-[#0b0c1e] border-l border-[#14152a] flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <div className="w-10 h-10 rounded-full bg-[#0d0e26] border border-[#1a1c36] flex items-center justify-center mb-2.5">
              <LucideIcon name="Users" size={16} />
            </div>
            <p className="text-xs font-bold text-gray-400">Collaborators</p>
            <p className="text-[9px] text-gray-600 mt-1 max-w-[200px] leading-relaxed">
              Collaboration features are currently in early development.
            </p>
          </div>
        )}
      </div>

      {/* ── Modal Export JSON ── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
          <div className="relative w-full max-w-2xl bg-[#0c1833] border border-[#1a2d54] rounded-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1a2d54] flex items-center justify-between bg-[#122247]/20 select-none">
              <div className="flex items-center gap-2">
                <LucideIcon name="Code" className="text-[#00A3FF]" size={15} />
                <h4 className="font-extrabold text-xs text-gray-200 tracking-wider uppercase font-mono">
                  Exported Dialogue JSON (Godot Ready)
                </h4>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <LucideIcon name="X" size={15} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#07122A] font-mono text-[11px] text-gray-300 leading-relaxed">
              <pre className="whitespace-pre-wrap">{exportedJsonText}</pre>
            </div>

            <div className="px-6 py-4 border-t border-[#1a2d54] flex items-center justify-end gap-3 bg-[#122247]/30 select-none">
              <button
                onClick={handleCopyToClipboard}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer font-mono ${
                  copySuccess
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#07122A] hover:bg-[#122247]/50 border border-[#1a2d54] text-gray-300'
                }`}
              >
                <LucideIcon name={copySuccess ? 'Check' : 'Copy'} size={12} />
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleDownloadJsonFile}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#00A3FF] hover:bg-[#008be6] text-white transition-all duration-200 shadow-md cursor-pointer font-mono"
              >
                <LucideIcon name="Download" size={12} />
                Download JSON File
              </button>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DialogueEditorContext.Provider>
  );
};

export const DialogueEditor: React.FC = () => (
  <ReactFlowProvider>
    <DialogueEditorContent />
  </ReactFlowProvider>
);
