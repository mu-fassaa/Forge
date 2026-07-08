import React, { useCallback, useMemo, useState } from 'react';
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
import { nodeRegistry } from '../../registry/nodeRegistry';
import { InspectorPanel } from './components/InspectorPanel';
import { type NodePort } from './types/nodes';

// Side-effect import: mendaftarkan semua node dialogue ke registry global
import './components/nodes/definitions';

// Import style CSS dari React Flow
import '@xyflow/react/dist/style.css';

const DialogueEditorContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
  const handleNodeDataChange = useCallback(
    (nodeId: string, key: string, value: unknown) => {
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.id !== nodeId) return n;
          return { ...n, data: { ...n.data, [key]: value } };
        })
      );
    },
    [setNodes]
  );

  // ── Handler update output ports node dari Inspector ──────────
  // Forge Core: mengubah outputs di root level node.
  // Inspector yang memanggil ini tidak perlu tahu tentang React Flow.
  const handleNodeOutputsChange = useCallback(
    (nodeId: string, newOutputs: NodePort[]) => {
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.id !== nodeId) return n;
          return { ...n, ...({ outputs: newOutputs } as any) };
        })
      );
    },
    [setNodes]
  );

  // ── Tambah node baru dari registry ──────────────────────────
  const handleAddNode = useCallback(
    (type: string) => {
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
    },
    [setNodes]
  );

  // ── Clear canvas ─────────────────────────────────────────────
  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh node dan hubungan di canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  }, [setNodes, setEdges]);

  // ── Export JSON ──────────────────────────────────────────────
  const generateExportJson = useCallback(() => {
    const targetNodeIds = new Set(edges.map((e) => e.target));
    const startNode = nodes.find((n) => !targetNodeIds.has(n.id))?.id ?? nodes[0]?.id ?? null;
    const nodesMap: Record<string, any> = {};

    nodes.forEach((node) => {
      // Baca outputs dari root node (bukan dari data)
      const nodeOutputs: { id: string; label: string }[] = (node as any).outputs ?? [];
      const outgoing = edges.filter((e) => e.source === node.id);

      const nodeData: Record<string, any> = {
        id: node.id,
        type: node.type,
        data: node.data,
      };

      if (node.type === 'condition') {
        // Condition: selalu dua port fixed (true / false)
        nodeData.next_true = outgoing.find((e) => e.sourceHandle === 'true')?.target ?? null;
        nodeData.next_false = outgoing.find((e) => e.sourceHandle === 'false')?.target ?? null;

      } else if (
        nodeOutputs.length > 0 &&
        !(nodeOutputs.length === 1 && nodeOutputs[0].id === 'out')
      ) {
        // Node dengan custom output ports (misalnya Dialogue dengan pilihan):
        // Ekspor sebagai array choices, setiap port punya next-nya sendiri.
        // Forge Core tidak tahu ini "choices" — hanya tahu ada N output port.
        nodeData.choices = nodeOutputs.map((port) => ({
          port_id: port.id,
          label: port.label,
          next: outgoing.find((e) => e.sourceHandle === port.id)?.target ?? null,
        }));

      } else {
        // Node dengan single output 'out'
        const edge = outgoing.find((e) => e.sourceHandle === 'out') ?? outgoing[0];
        nodeData.next = edge?.target ?? null;
      }

      nodesMap[node.id] = nodeData;
    });

    return JSON.stringify({ start_node: startNode, nodes: nodesMap }, null, 2);
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070814] select-none">
      {/* ── Topbar ── */}
      <div className="h-14 border-b border-[#14152a] px-6 flex items-center justify-between bg-[#0b0c1e] z-10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <LucideIcon name="MessageSquare" className="text-[#e879f9]" size={16} />
            <h3 className="font-extrabold text-gray-200 text-xs tracking-wider uppercase">Dialogue Trees</h3>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Kelola node generik dan hubungkan alur cerita game secara terstruktur.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Dropdown + Add Node */}
          <div className="flex items-center gap-1.5 bg-[#070814] border border-[#1a1c36] rounded-lg p-1">
            <select
              value={nodeTypeToAdd}
              onChange={(e) => setNodeTypeToAdd(e.target.value)}
              className="bg-transparent text-gray-300 text-xs font-bold px-2.5 py-1 focus:outline-none border-none cursor-pointer"
            >
              {allNodeDefs.map((def) => (
                <option key={def.type} value={def.type} className="bg-[#0b0c1e] text-gray-300">
                  {def.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleAddNode(nodeTypeToAdd)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#ec4899] hover:bg-[#db2777] text-white transition-all duration-200 cursor-pointer shadow-sm"
            >
              <LucideIcon name="Plus" size={12} className="stroke-[3]" />
              Add Node
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#1a1c36]" />

          <button
            onClick={handleOpenExportModal}
            disabled={nodes.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
              nodes.length === 0
                ? 'opacity-30 border-gray-800 text-gray-500 cursor-not-allowed'
                : 'border-[#ec4899]/30 text-[#e879f9] bg-[#ec4899]/5 hover:bg-[#ec4899]/10 hover:border-[#ec4899]/50'
            }`}
          >
            <LucideIcon name="Code" size={12} />
            Export JSON
          </button>

          <button
            onClick={handleClearCanvas}
            disabled={nodes.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              nodes.length === 0
                ? 'opacity-30 bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400'
            }`}
          >
            <LucideIcon name="Trash2" size={12} />
            Clear
          </button>
        </div>
      </div>

      {/* ── Main area: Canvas + Inspector ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative bg-[#070814]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={reactFlowNodeTypes}
            fitView
          >
            <Background color="#16172e" gap={20} size={1.5} />
            <Controls className="!bg-[#0b0c1e] !border-[#1a1c36] !text-gray-400 !rounded-lg !overflow-hidden" />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              <div className="w-14 h-14 rounded-full bg-[#ec4899]/5 flex items-center justify-center mb-3 border border-[#ec4899]/10 text-[#e879f9]/50">
                <LucideIcon name="MessageSquare" size={24} />
              </div>
              <h4 className="text-gray-300 font-bold text-xs mb-1">Canvas Dialogue Kosong</h4>
              <p className="text-[10px] text-gray-500 max-w-xs">
                Pilih tipe node di dropdown lalu klik{' '}
                <span className="text-[#ec4899] font-bold">"Add Node"</span> untuk mulai.
              </p>
            </div>
          )}
        </div>

        {/* Inspector Panel */}
        <InspectorPanel
          selectedNode={currentSelectedNode}
          onNodeDataChange={handleNodeDataChange}
          onNodeOutputsChange={handleNodeOutputsChange}
        />
      </div>

      {/* ── Modal Export JSON ── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
          <div className="relative w-full max-w-2xl bg-[#0b0c1e] border border-[#1a1c36] rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[#1a1c36] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LucideIcon name="Code" className="text-[#e879f9]" size={16} />
                <h4 className="font-extrabold text-sm text-gray-200 tracking-wider uppercase">
                  Exported Dialogue JSON (Godot Ready)
                </h4>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#070814] font-mono text-[11px] text-gray-300 leading-relaxed">
              <pre className="whitespace-pre-wrap">{exportedJsonText}</pre>
            </div>

            <div className="px-6 py-4 border-t border-[#1a1c36] flex items-center justify-end gap-3 bg-[#0d0e26]">
              <button
                onClick={handleCopyToClipboard}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  copySuccess
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#14152a] hover:bg-[#1a1c36] border border-gray-700 text-gray-300'
                }`}
              >
                <LucideIcon name={copySuccess ? 'Check' : 'Copy'} size={12} />
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleDownloadJsonFile}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#ec4899] hover:bg-[#db2777] text-white transition-all duration-200 shadow-md cursor-pointer"
              >
                <LucideIcon name="Download" size={12} />
                Download JSON File
              </button>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DialogueEditor: React.FC = () => (
  <ReactFlowProvider>
    <DialogueEditorContent />
  </ReactFlowProvider>
);
