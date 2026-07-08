import { type ComponentType } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { type NodePort } from '../features/dialogue-editor/types/nodes';

// ─────────────────────────────────────────────────────────────
// InspectorProps: kontrak yang harus dipenuhi oleh setiap
// inspector component. Generik agar bisa dipakai semua node.
// ─────────────────────────────────────────────────────────────
export interface InspectorProps<TData extends Record<string, unknown> = Record<string, unknown>> {
  /** ID node yang sedang diedit */
  nodeId: string;
  /** Data payload node saat ini */
  data: TData;
  /** Callback untuk update satu field data node */
  onChange: (key: string, value: unknown) => void;
  /**
   * Output port node saat ini.
   * Inspector bisa membaca ini untuk menampilkan daftar port,
   * dan memanggil onOutputsChange untuk mengubahnya.
   */
  outputs: NodePort[];
  /**
   * Callback untuk mengganti seluruh daftar output port.
   * Forge core yang menangani sinkronisasi ke React Flow state.
   */
  onOutputsChange: (outputs: NodePort[]) => void;
}


// ─────────────────────────────────────────────────────────────
// NodeDefinition: kontrak yang harus dipenuhi oleh setiap node
// yang ingin didaftarkan ke Forge Registry.
// ─────────────────────────────────────────────────────────────
export interface NodeDefinition<TData extends Record<string, unknown> = Record<string, unknown>> {
  /** ID unik node, dipakai sebagai key di React Flow dan JSON export */
  type: string;

  /** Label yang tampil di dropdown "Add Node" */
  title: string;

  /** Deskripsi singkat, ditampilkan sebagai tooltip / subtitle */
  description: string;

  /** Nama icon dari Lucide Icons */
  icon: string;

  /** Warna aksen (hex / CSS) — dipakai di header card dan badge */
  color: string;

  /** React component yang dirender di canvas untuk node ini (tampilan ringkas) */
  component: ComponentType<NodeProps<Node<TData>>>;

  /**
   * React component yang dirender di Inspector Panel sisi kanan.
   * Berisi form edit lengkap untuk data node.
   */
  inspectorComponent: ComponentType<InspectorProps<TData>>;

  /** Data default saat node pertama kali ditambahkan ke canvas */
  defaultData: TData;

  /** Port input default node ini */
  inputs: NodePort[];

  /** Port output default node ini */
  outputs: NodePort[];
}

// ─────────────────────────────────────────────────────────────
// NodeRegistry: Map global yang menyimpan semua definisi node.
// ─────────────────────────────────────────────────────────────
class NodeRegistry {
  private registry = new Map<string, NodeDefinition>();

  register(definition: NodeDefinition): void {
    if (this.registry.has(definition.type)) {
      console.warn(`[NodeRegistry] Node type "${definition.type}" sudah terdaftar. Akan ditimpa.`);
    }
    this.registry.set(definition.type, definition);
  }

  get(type: string): NodeDefinition {
    const def = this.registry.get(type);
    if (!def) {
      throw new Error(`[NodeRegistry] Node type "${type}" tidak ditemukan.`);
    }
    return def;
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }

  getAll(): NodeDefinition[] {
    return Array.from(this.registry.values());
  }

  buildNodeTypes(): Record<string, ComponentType<NodeProps<Node<any>>>> {
    const types: Record<string, ComponentType<NodeProps<Node<any>>>> = {};
    this.registry.forEach((def, key) => {
      types[key] = def.component;
    });
    return types;
  }
}

// Singleton instance
export const nodeRegistry = new NodeRegistry();
