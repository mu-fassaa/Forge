import { type EditorType } from '../types';

// ─────────────────────────────────────────────────────────────
// SessionService: menyimpan dan memulihkan state workspace
// ke localStorage. Digunakan oleh WorkspaceContext untuk
// restore session saat Forge dibuka kembali.
//
// Keputusan (Q4): Forge selalu membuka Dashboard saat startup.
// lastActiveTab disimpan agar Dashboard bisa menampilkan
// tombol "Resume" yang tepat.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'forge_workspace_session_v1';

export interface WorkspaceSession {
  /** Tab terakhir yang aktif sebelum Forge ditutup */
  lastActiveTab: EditorType;
  /** ISO timestamp saat session disimpan */
  savedAt: string;
}

class SessionService {
  /**
   * Simpan session saat ini ke localStorage.
   */
  save(session: Omit<WorkspaceSession, 'savedAt'>): void {
    try {
      const data: WorkspaceSession = {
        ...session,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[SessionService] Failed to save session:', e);
    }
  }

  /**
   * Baca session terakhir dari localStorage.
   * Mengembalikan null jika belum ada session.
   */
  restore(): WorkspaceSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as WorkspaceSession;
    } catch {
      return null;
    }
  }

  /**
   * Hapus session tersimpan.
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Singleton instance
export const sessionService = new SessionService();
