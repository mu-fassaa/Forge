import React from 'react';
import { LucideIcon } from '../../components/LucideIcon';

interface ShortcutItem {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'S'], description: 'Save current workspace state' },
  { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
  { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
  { keys: ['Delete'], description: 'Remove selected node or edge' },
  { keys: ['Spacebar'], description: 'Hold and drag to pan canvas' },
];

export const DocsPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#070814] overflow-y-auto select-text">
      {/* Top Header */}
      <div className="h-14 border-b border-[#14152a] px-8 flex items-center justify-between bg-[#0b0c1e] shrink-0">
        <div className="flex items-center gap-2">
          <LucideIcon name="BookOpen" className="text-indigo-400" size={16} />
          <h3 className="font-extrabold text-gray-200 text-xs tracking-wider uppercase">Forge Manual & Docs</h3>
        </div>
      </div>

      {/* Main Contents */}
      <div className="max-w-4xl w-full mx-auto px-8 py-10 space-y-12">
        
        {/* Intro Hero */}
        <div className="space-y-3.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome to Forge Editor</h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
            Forge is an open-source, modular node-based toolkit designed to build game development tooling. 
            Create complex branched narrative graphs, variables, triggers, or FSM configurations, and export them direct to your game engine of choice.
          </p>
        </div>

        {/* Section: Core Features */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 border-b border-[#1a1c36] pb-2">
            Core Concepts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="rounded-xl border border-[#1a1c36] bg-[#0b0c1e]/60 p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                <LucideIcon name="Blocks" size={16} />
              </div>
              <h4 className="text-xs font-bold text-gray-200">1. Plugin-Based Nodes</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Every node type is a self-contained definition registered in the Forge Node Registry. Modular components separate visuals from raw logic.
              </p>
            </div>

            <div className="rounded-xl border border-[#1a1c36] bg-[#0b0c1e]/60 p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <LucideIcon name="SlidersHorizontal" size={16} />
              </div>
              <h4 className="text-xs font-bold text-gray-200">2. Shared Inspector</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Visualizing node internals in the Canvas is kept minimal. Detailed form editing is dynamically piped to the unified sidebar Inspector.
              </p>
            </div>

            <div className="rounded-xl border border-[#1a1c36] bg-[#0b0c1e]/60 p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <LucideIcon name="UploadCloud" size={16} />
              </div>
              <h4 className="text-xs font-bold text-gray-200">3. Target Publishing</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Verify node branching pipelines instantly and compile clean Godot-ready relational JSON structures in a simple 3-step pipeline.
              </p>
            </div>

          </div>
        </div>

        {/* Section: Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-pink-400 border-b border-[#1a1c36] pb-2">
            Keyboard Shortcuts
          </h2>
          <div className="border border-[#1a1c36] rounded-xl overflow-hidden bg-[#0b0c1e]/40">
            <div className="divide-y divide-[#14152a]">
              {SHORTCUTS.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 text-xs">
                  <span className="text-gray-400 font-semibold">{s.description}</span>
                  <div className="flex items-center gap-1.5">
                    {s.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        <kbd className="px-2 py-1 rounded bg-[#070814] border border-[#1a1c36] font-mono text-[9px] font-bold text-gray-300 shadow">
                          {k}
                        </kbd>
                        {kIdx < s.keys.length - 1 && <span className="text-gray-600 font-bold">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Godot Engine Loader */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 border-b border-[#1a1c36] pb-2">
            Loading Exports in Godot (GDScript)
          </h2>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              When publishing, Forge compiles all nodes and branches into a single JSON graph. You can load this directly in a Godot scene script to parse dialogue or handle state:
            </p>
            <pre className="p-4 bg-[#070814] border border-[#14152a] rounded-lg text-[10px] font-mono text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
{`# Load and parse dialogue tree export
var file = FileAccess.open("res://dialogue_export.json", FileAccess.READ)
var data = JSON.parse_string(file.get_as_text())

var active_node_id = data.start_node
var active_node = data.nodes[active_node_id]

func display_dialogue():
    print(active_node.data.speaker, ": ", active_node.data.text)
    
    if active_node.has("choices"):
        # Branch choice pathways
        for choice in active_node.choices:
            print(" - Option: ", choice.label, " (Target ID: ", choice.next, ")")`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};
