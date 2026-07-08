import { type Node } from '@xyflow/react';

// 1. Jenis Node yang didukung oleh Forge
export type ForgeNodeType = 'start' | 'dialogue' | 'condition' | 'event' | 'variable' | 'end';

// 2. Definisi Port/Handle Node (Input / Output)
export interface NodePort {
  id: string;      // ID unik port (misal: 'in', 'out-true', 'out-false')
  label?: string;  // Label teks opsional yang ditampilkan di UI dekat handle
}

// 3. Payload Data khusus untuk masing-masing tipe Node

export interface DialogueChoice {
  id: string;
  text: string;
}

export interface DialogueNodeData {
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
  [key: string]: unknown;
}

export interface ConditionNodeData {
  parameter: string;
  operator: '==' | '>' | '<' | '>=' | '<=';
  value: string;
  [key: string]: unknown;
}

export interface EventNodeData {
  eventName: string;
  eventValue?: string;
  [key: string]: unknown;
}

export interface VariableNodeData {
  variableName: string;
  operation: 'set' | 'add' | 'subtract';
  value: string;
  [key: string]: unknown;
}

export interface EndNodeData {
  endType: 'complete' | 'fail' | 'default';
  [key: string]: unknown;
}

// 4. Base Node Interface yang menyatukan semuanya.
// Kita membuat generic type TData yang diwariskan dari Node React Flow.
export interface ForgeNodeExtra {
  inputs: NodePort[];
  outputs: NodePort[];
}

export type ForgeNode<TData extends Record<string, unknown> = Record<string, any>> = Node<TData, ForgeNodeType> & ForgeNodeExtra;
