import React from 'react';
import { LucideIcon } from '../../components/LucideIcon';

// ─────────────────────────────────────────────────────────────
// HelloPluginDocs: konten dokumentasi Hello Plugin.
// Dirender oleh DocsPage via docsRegistry.
// ─────────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    title: 'Command Registration',
    icon: 'Terminal',
    shortcut: 'Ctrl+H',
    description: 'Registers `hello.greet` command via commandRegistry. Available in Command Palette (Ctrl+K).',
    code: `commandRegistry.register({\n  id: 'hello.greet',\n  label: 'Hello Plugin: Greet',\n  category: 'Hello Plugin',\n  icon: 'Sparkles',\n  shortcut: 'Ctrl+H',\n  handler: () => addNotification('success', '👋 Hello!'),\n});`,
  },
  {
    title: 'Keyboard Shortcut',
    icon: 'Keyboard',
    shortcut: 'Ctrl+H',
    description: 'Registers a global shortcut via shortcutRegistry. Triggers the greet command from anywhere.',
    code: `shortcutRegistry.register({\n  key: 'ctrl+h',\n  commandId: 'hello.greet',\n  handler: () => addNotification('success', '👋 Hello!'),\n});`,
  },
  {
    title: 'Context Menu',
    icon: 'MousePointer2',
    description: 'Registers canvas context menu group via contextMenuRegistry. Right-click the Hello Plugin canvas.',
    code: `contextMenuRegistry.registerGroup({\n  id: 'hello.canvas',\n  label: 'Hello Plugin',\n  items: [\n    { id: 'hello.say', label: 'Say Hello', handler: () => { ... } },\n  ],\n});`,
  },
  {
    title: 'Sidebar Entry',
    icon: 'Sidebar',
    description: 'Registers a sidebar navigation entry via sidebarRegistry with enable/disable toggle.',
    code: `sidebarRegistry.register({\n  id: 'hello-plugin',\n  label: 'Hello Plugin',\n  icon: 'Sparkles',\n  section: 'plugins',\n});`,
  },
  {
    title: 'Node Type',
    icon: 'GitBranch',
    description: 'Registers `hello.greeting` node type via nodeRegistry. Node appears in Dialogue Editor.',
    code: `nodeRegistry.register({\n  type: 'hello.greeting',\n  title: 'Hello Greeting',\n  component: HelloNode,\n  inspectorComponent: HelloNodeInspector,\n  defaultData: { message: 'Hello, World!', author: 'Hello Plugin' },\n});`,
  },
  {
    title: 'Documentation',
    icon: 'BookOpen',
    description: 'Registers this documentation section via docsRegistry. You are reading it right now.',
    code: `docsRegistry.register({\n  id: 'hello.intro',\n  title: 'Hello Plugin',\n  pluginName: 'Hello Plugin',\n  icon: 'Sparkles',\n  content: HelloPluginDocs,\n});`,
  },
];

export const HelloPluginDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div
        className="rounded-lg p-4 space-y-2"
        style={{
          background: 'rgba(0,163,255,0.04)',
          border: '1px solid rgba(0,163,255,0.12)',
        }}
      >
        <div className="flex items-center gap-2">
          <LucideIcon name="Sparkles" size={14} className="text-[#00A3FF]" />
          <h3 className="text-sm font-bold text-white">Hello Plugin</h3>
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,163,255,0.1)', color: '#00A3FF', border: '1px solid rgba(0,163,255,0.2)' }}
          >
            v0.5.5
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          A proof-of-concept plugin that demonstrates Forge Platform Layer modularity.
          Hello Plugin proves that a plugin can use ALL platform services without modifying Core.
        </p>
      </div>

      {/* Capabilities */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#3d5275] font-mono mb-4">
          Proven Capabilities
        </h3>
        <div className="space-y-4">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid #1a2d54', background: '#070814' }}
            >
              <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{ borderBottom: '1px solid #1a2d54', background: 'rgba(255,255,255,0.02)' }}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(0,163,255,0.08)', border: '1px solid rgba(0,163,255,0.15)' }}
                >
                  <LucideIcon name={cap.icon} size={12} className="text-[#00A3FF]" />
                </div>
                <span className="text-xs font-bold text-white">{cap.title}</span>
                {cap.shortcut && (
                  <div className="flex items-center gap-1 ml-auto">
                    {cap.shortcut.split('+').map((k, j) => (
                      <kbd
                        key={j}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: '#07122A', border: '1px solid #1a2d54', color: '#00A3FF' }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <p className="text-xs text-gray-400 leading-relaxed">{cap.description}</p>
                <pre
                  className="text-[10px] font-mono leading-relaxed rounded-md px-3 py-2.5 overflow-x-auto"
                  style={{
                    background: '#04081a',
                    border: '1px solid #1a2d54',
                    color: '#8E9BB4',
                  }}
                >
                  <code>{cap.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verdict */}
      <div
        className="rounded-lg p-4 space-y-2"
        style={{
          background: 'rgba(16,185,129,0.04)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}
      >
        <div className="flex items-center gap-2">
          <LucideIcon name="CheckCircle2" size={14} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-emerald-300">Platform Layer Verified</h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Hello Plugin successfully registered all 6 platform services without modifying any Core file.
          Forge Platform Layer is ready for Plugin SDK development.
        </p>
      </div>
    </div>
  );
};
