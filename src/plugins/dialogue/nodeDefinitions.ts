import { type NodeDefinition } from '../../platform/workspace/nodeRegistry';
import { StartNode } from './components/nodes/StartNode';
import { StartInspector } from './components/nodes/inspectors/StartInspector';
import { DialogueNode } from './components/nodes/DialogueNode';
import { DialogueInspector } from './components/nodes/inspectors/DialogueInspector';
import { ConditionNode } from './components/nodes/ConditionNode';
import { ConditionInspector } from './components/nodes/inspectors/ConditionInspector';
import { EventNode } from './components/nodes/EventNode';
import { EventInspector } from './components/nodes/inspectors/EventInspector';
import { VariableNode } from './components/nodes/VariableNode';
import { VariableInspector } from './components/nodes/inspectors/VariableInspector';
import { EndNode } from './components/nodes/EndNode';
import { EndInspector } from './components/nodes/inspectors/EndInspector';

// ─────────────────────────────────────────────────────────────
// Dialogue Node Definitions
// ─────────────────────────────────────────────────────────────

export const dialogueNodeDefs: NodeDefinition[] = [
  // 1. Start Node
  {
    type: 'start',
    title: 'Start Node',
    description: 'First node to evaluate - Execution entry point.',
    icon: 'Play',
    color: '#10B981',
    component: StartNode as any,
    inspectorComponent: StartInspector as any,
    defaultData: {},
    inputs: [],
    outputs: [{ id: 'out', label: 'Out' }],
  },
  
  // 2. Dialogue Node
  {
    type: 'dialogue',
    title: 'Dialogue Card',
    description: 'Karakter berbicara — menampilkan teks percakapan.',
    icon: 'MessageSquare',
    color: '#D946EF',
    component: DialogueNode as any,
    inspectorComponent: DialogueInspector as any,
    defaultData: {
      speaker: 'Karakter',
      text: 'Isi percakapan...',
    },
    inputs: [{ id: 'in', label: 'In' }],
    outputs: [{ id: 'out', label: 'Out' }],
  },
  
  // 3. Condition Node
  {
    type: 'condition',
    title: 'Condition Card',
    description: 'Bercabang berdasarkan kondisi parameter permainan.',
    icon: 'GitFork',
    color: '#3B82F6',
    component: ConditionNode as any,
    inspectorComponent: ConditionInspector as any,
    defaultData: {
      parameter: 'player_hp',
      operator: '==',
      value: '100',
    },
    inputs: [{ id: 'in', label: 'In' }],
    outputs: [
      { id: 'out-true', label: 'True' },
      { id: 'out-false', label: 'False' },
    ],
  },
  
  // 4. Event Node
  {
    type: 'event',
    title: 'Trigger Event',
    description: 'Memancarkan signal event ke game engine (Godot/Unity).',
    icon: 'Zap',
    color: '#F59E0B',
    component: EventNode as any,
    inspectorComponent: EventInspector as any,
    defaultData: {
      eventName: 'quest_start',
      eventValue: '1',
    },
    inputs: [{ id: 'in', label: 'In' }],
    outputs: [{ id: 'out', label: 'Out' }],
  },
  
  // 5. Variable Node
  {
    type: 'variable',
    title: 'Set Variable',
    description: 'Mengubah nilai parameter global permainan.',
    icon: 'Database',
    color: '#06B6D4',
    component: VariableNode as any,
    inspectorComponent: VariableInspector as any,
    defaultData: {
      variableName: 'gold',
      operation: 'add',
      value: '10',
    },
    inputs: [{ id: 'in', label: 'In' }],
    outputs: [{ id: 'out', label: 'Out' }],
  },
  
  // 6. End Node
  {
    type: 'end',
    title: 'End Node',
    description: 'Menghentikan jalannya alur dialog permainan.',
    icon: 'AlertOctagon',
    color: '#EF4444',
    component: EndNode as any,
    inspectorComponent: EndInspector as any,
    defaultData: {
      endType: 'complete',
    },
    inputs: [{ id: 'in', label: 'In' }],
    outputs: [],
  },
];
