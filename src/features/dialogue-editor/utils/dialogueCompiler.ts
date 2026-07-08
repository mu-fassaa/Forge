export interface CompiledDialogueGraph {
  metadata: {
    compiledAt: string;
    nodeCount: number;
    edgeCount: number;
  };
  start_node: string | null;
  nodes: Record<string, CompiledNode>;
}

export interface CompiledNode {
  id: string;
  type: string;
  data: Record<string, any>;
  next?: string | null;
  next_true?: string | null;
  next_false?: string | null;
  choices?: {
    id: string;
    text: string;
    next: string | null;
  }[];
}

/**
 * Mengompilasi visual graph (nodes & edges) dari React Flow menjadi format data relasional
 * yang bersih, tanpa metadata visual editor, dan siap digunakan oleh engine loader (Godot/Unity).
 */
export const compileDialogueGraph = (nodes: any[], edges: any[]): CompiledDialogueGraph => {
  const startNode = nodes.find((n) => n.type === 'start');
  const startNodeId = startNode?.id ?? null;

  const nodesMap: Record<string, CompiledNode> = {};

  nodes.forEach((node) => {
    const outgoing = edges.filter((e) => e.source === node.id);

    const compiled: CompiledNode = {
      id: node.id,
      type: node.type,
      data: { ...node.data },
    };

    if (node.type === 'start') {
      const edge = outgoing.find((e) => e.sourceHandle === 'out') ?? outgoing[0];
      compiled.next = edge?.target ?? null;
      
    } else if (node.type === 'condition') {
      compiled.next_true = outgoing.find((e) => e.sourceHandle === 'true')?.target ?? null;
      compiled.next_false = outgoing.find((e) => e.sourceHandle === 'false')?.target ?? null;

    } else if (node.type === 'dialogue') {
      const choices = node.data?.choices || [];
      if (choices.length > 0) {
        compiled.choices = choices.map((choice: any) => {
          const matchingEdge = outgoing.find((e) => e.sourceHandle === choice.id);
          return {
            id: choice.id,
            text: choice.text,
            next: matchingEdge?.target ?? null,
          };
        });
      } else {
        const edge = outgoing.find((e) => e.sourceHandle === 'out') ?? outgoing[0];
        compiled.next = edge?.target ?? null;
      }

    } else if (node.type === 'event' || node.type === 'variable') {
      const edge = outgoing.find((e) => e.sourceHandle === 'out') ?? outgoing[0];
      compiled.next = edge?.target ?? null;
    }

    nodesMap[node.id] = compiled;
  });

  return {
    metadata: {
      compiledAt: new Date().toISOString(),
      nodeCount: nodes.length,
      edgeCount: edges.length,
    },
    start_node: startNodeId,
    nodes: nodesMap,
  };
};
