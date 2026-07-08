import React, { useMemo } from 'react';
import { type EditorType } from '../../types';
import { LucideIcon } from '../../components/LucideIcon';
import { useWorkspace } from '../../context/WorkspaceContext';
import { recentGraphManager } from '../../services/recentGraphManager';

interface DashboardProps {
  onSelectTool: (tab: EditorType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  const { metadata, validationErrors, loadProject, layoutTab, historyLogs } = useWorkspace();

  const errorsCount = validationErrors.filter((e) => e.severity === 'error').length;
  const warningsCount = validationErrors.filter((e) => e.severity === 'warning').length;

  const lastSavedTime = metadata.lastSavedAt
    ? new Date(metadata.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  // Read from Recent Graph Manager for accurate last-opened info
  const recentEntry = useMemo(() => recentGraphManager.getLatest(), []);
  const lastOpenedTime = recentEntry
    ? new Date(recentEntry.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : lastSavedTime;

  // Fallback: read saved project node counts
  const savedData = useMemo(() => {
    try {
      return loadProject('dialogue');
    } catch (e) {
      return null;
    }
  }, [loadProject]);

  const nodesCount = recentEntry?.nodeCount ?? savedData?.nodes?.length ?? 0;
  const edgesCount = recentEntry?.edgeCount ?? savedData?.edges?.length ?? 0;

  // ── VIEW 1: HISTORY TIMELINE VIEW ──
  if (layoutTab === 'history') {
    return (
      <div className="flex-1 p-8 bg-[#07122A] text-[#F3F4F6] flex flex-col gap-6 h-full overflow-hidden select-text font-sans">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#8E9BB4]/60 font-mono">Workspace Timeline</span>
          <h2 className="text-lg font-bold text-white mt-1">Activity Log & Save History</h2>
          <p className="text-xs text-[#8E9BB4] mt-1 max-w-2xl leading-relaxed">
            Review the immutable operation timeline for the current active local session. Savepoints are tracked automatically.
          </p>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          {/* Main Log Stack */}
          <div className="flex-1 border border-[#1a2d54] rounded-lg bg-[#0c1833]/30 p-5 overflow-y-auto flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8E9BB4]/65 mb-4 font-mono select-none">
              Recorded Changes
            </h3>

            {historyLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 border border-dashed border-[#1a2d54] rounded-lg">
                <LucideIcon name="History" size={24} className="text-[#8E9BB4]/30 mb-2" />
                <p className="text-xs font-bold text-gray-400">Timeline Empty</p>
                <p className="text-[9px] text-[#8E9BB4]/50 mt-1 max-w-xs leading-normal">
                  Make graph changes or perform undo actions to trigger history save state logs.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {historyLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#0c1833]/60 border border-[#1a2d54] rounded-lg flex items-center justify-between hover:bg-[#122247]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-[#122247] border border-[#1a2d54] flex items-center justify-center text-[#00A3FF]">
                        <LucideIcon name="History" size={10} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-white">{log.label}</span>
                        <span className="text-[8px] text-[#8E9BB4]/40 font-mono block uppercase">OPERATION LOGGED</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#8E9BB4] bg-[#122247] px-2 py-0.5 rounded border border-[#1a2d54]/40">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Savepoint Overview Side Panel */}
          <div className="w-72 border border-[#1a2d54] rounded-lg bg-[#0c1833]/50 p-5 shrink-0 flex flex-col justify-between select-none">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8E9BB4]/65 font-mono">
                Recent Compile States
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 rounded bg-[#122247]/30 border border-[#1a2d54] flex items-start gap-2.5">
                  <div className="shrink-0 text-emerald-400 mt-0.5">
                    <LucideIcon name="CheckCircle" size={12} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-200 uppercase">Savepoint 02 (Autosave)</h5>
                    <p className="text-[8px] text-[#8E9BB4]/65 font-mono mt-0.5">NODES: {nodesCount} | EDGES: {edgesCount}</p>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#122247]/10 border border-[#1a2d54]/40 flex items-start gap-2.5 opacity-60">
                  <div className="shrink-0 text-emerald-400 mt-0.5">
                    <LucideIcon name="CheckCircle" size={12} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-semibold text-gray-400 uppercase">Savepoint 01</h5>
                    <p className="text-[8px] text-[#8E9BB4]/45 font-mono mt-0.5">NODES: {nodesCount} | EDGES: {edgesCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#122247] p-3.5 rounded-lg border border-[#1a2d54]/60 text-[9px] text-[#8E9BB4] leading-relaxed">
              <span className="font-bold text-white block mb-1">💡 Sandbox Info</span>
              Savepoints compile and output straight to local storage. Export to generate external file outputs.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 2: COLLABORATORS PANEL VIEW ──
  if (layoutTab === 'collaborators') {
    return (
      <div className="flex-1 p-8 bg-[#07122A] text-[#F3F4F6] flex flex-col gap-6 h-full overflow-hidden select-text font-sans">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#8E9BB4]/60 font-mono">Workspace Team</span>
          <h2 className="text-lg font-bold text-white mt-1">Project Collaborators</h2>
          <p className="text-xs text-[#8E9BB4] mt-1 max-w-2xl leading-relaxed">
            Manage developer permissions and track activity scopes. Collaboration functions locally during alpha release.
          </p>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          {/* Members Table */}
          <div className="flex-1 border border-[#1a2d54] rounded-lg bg-[#0c1833]/30 p-5 overflow-y-auto flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8E9BB4]/65 mb-4 font-mono select-none">
              Contributor Members
            </h3>

            <div className="border border-[#1a2d54] rounded-lg overflow-hidden divide-y divide-[#1a2d54]/60 font-mono text-[10px]">
              
              {/* Member Row 1 (Owner) */}
              <div className="p-3.5 flex items-center justify-between bg-[#0c1833]/65">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#122247] border border-[#00A3FF]/30 flex items-center justify-center font-bold text-[#00A3FF]">
                    U
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white block font-sans">User (You)</span>
                    <span className="text-[8px] text-[#8E9BB4]/40 block uppercase">OWNER / LEAD ARCHITECT</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#00A3FF] bg-[#00A3FF]/5 px-2 py-0.5 rounded border border-[#00A3FF]/20 font-bold">ALL ACCESS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online"></span>
                </div>
              </div>

              {/* Member Row 2 (Guest placeholder) */}
              <div className="p-3.5 flex items-center justify-between opacity-50 bg-[#0c1833]/15">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#122247] border border-[#1a2d54] flex items-center justify-center font-bold text-gray-500">
                    D
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-300 block font-sans">Developer Candidate</span>
                    <span className="text-[8px] text-[#8E9BB4]/40 block uppercase">INVITED MEMBER</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 bg-gray-950 px-2 py-0.5 rounded border border-gray-900">PENDING</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700" title="Offline"></span>
                </div>
              </div>

            </div>
          </div>

          {/* Invitation Side Panel */}
          <div className="w-80 border border-[#1a2d54] rounded-lg bg-[#0c1833]/50 p-5 shrink-0 flex flex-col justify-between select-none">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8E9BB4]/65 font-mono">
                  Invite Member
                </h3>
                <span className="text-[6px] font-bold bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20 px-1 py-0.5 rounded font-mono uppercase">
                  SOON
                </span>
              </div>
              
              <div className="space-y-2.5">
                <div>
                  <label className="text-[8px] uppercase tracking-widest font-bold text-[#8E9BB4]/55 block mb-1 font-mono">Email Address</label>
                  <input
                    type="text"
                    placeholder="collaborator@company.com"
                    disabled
                    className="w-full bg-[#07122A] border border-[#1a2d54] rounded px-3 py-1.5 text-xs text-gray-500 focus:outline-none placeholder-gray-700 cursor-not-allowed font-mono"
                  />
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-widest font-bold text-[#8E9BB4]/55 block mb-1 font-mono">Scope Permissions</label>
                  <select
                    disabled
                    className="w-full bg-[#07122A] border border-[#1a2d54] rounded px-3 py-1.5 text-xs text-gray-600 focus:outline-none cursor-not-allowed font-mono font-bold"
                  >
                    <option>READ-WRITE ACCESS</option>
                  </select>
                </div>
                <button
                  disabled
                  className="w-full py-1.5 rounded bg-gray-900 border border-gray-800 text-gray-600 font-bold text-[10px] uppercase tracking-wider cursor-not-allowed mt-2 font-mono"
                >
                  Send Invitation
                </button>
              </div>
            </div>

            <div className="bg-[#122247]/40 p-3.5 rounded-lg border border-[#1a2d54]/60 text-[9px] text-[#8E9BB4] leading-relaxed">
              <span className="font-bold text-white block mb-1">👥 Local Sandbox Mode</span>
              Collaborator connections are compiled locally. Multi-user cloud pipelines will launch in the beta SDK release.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 3: DEFAULT WORKSPACE LAUNCHER VIEW ──
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#07122A] text-[#F3F4F6] select-none flex flex-col gap-5 h-full justify-center font-sans">
      
      {/* 1. Compact Welcome Hero Banner */}
      <div className="rounded-lg border border-[#1a2d54] bg-[#0c1833] p-5 lg:px-7 lg:py-5.5 flex items-center justify-between relative overflow-hidden shrink-0">
        
        {/* Banner Details */}
        <div className="space-y-2.5 max-w-xl z-10">
          <h2 className="text-lg lg:text-xl font-bold text-white tracking-wide">
            Welcome back.
          </h2>
          <p className="text-xs text-[#8E9BB4] leading-relaxed max-w-lg">
            Resume building your dialogue trees or read the library documentation.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onSelectTool('dialogue')}
              className="flex items-center gap-2 py-1.5 px-3.5 rounded bg-[#00A3FF] hover:bg-[#008be6] text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm font-mono"
            >
              <LucideIcon name="Play" size={11} className="fill-white/10" />
              Resume Last Session
            </button>
            <button
              onClick={() => onSelectTool('docs')}
              className="flex items-center gap-2 py-1.5 px-3.5 rounded border border-[#1a2d54] hover:bg-[#122247]/50 text-[#8E9BB4] hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer font-mono"
            >
              <LucideIcon name="FileText" size={11} />
              View Documentation
            </button>
          </div>
        </div>

        {/* Blueprint Vector Icon decoration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
          <LucideIcon name="Compass" size={100} className="stroke-[1]" />
        </div>
      </div>

      {/* 2. Primary Workspace Module (Full-Width Dialogue Trees Card) */}
      <div
        onClick={() => onSelectTool('dialogue')}
        className="rounded-lg border border-[#1a2d54] hover:border-[#00A3FF]/45 bg-[#0c1833]/50 p-5 flex flex-col justify-between min-h-[160px] cursor-pointer group transition-all duration-150 shrink-0"
      >
        <div>
          {/* Header: Icon & Active badge */}
          <div className="flex items-center justify-between mb-3.5 font-sans">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#122247] border border-[#1a2d54] text-[#00A3FF]">
                <LucideIcon name="MessageSquare" size={14} />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-[#00A3FF] transition-all">
                Dialogue Trees
              </h4>
            </div>
            <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20 uppercase tracking-widest font-mono">
              Active Session
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-[#8E9BB4] leading-relaxed mb-4 max-w-2xl">
            Visual graph editor for complex branching narratives and character interactions. Supports conditional logic and localization hooks.
          </p>

          {/* Active Statistics Metadata Grid */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono font-medium text-[#8E9BB4]/65">
            <div className="flex items-center gap-1">
              <span>NODES:</span>
              <span className="text-[#00A3FF] font-bold">{nodesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>CONNECTIONS:</span>
              <span className="text-[#00A3FF] font-bold">{edgesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>LAST OPENED:</span>
              <span className="text-[#00A3FF] font-bold">{lastOpenedTime}</span>
            </div>
            
            {/* Validation Feedback tag */}
            <div className="flex items-center gap-1.5 ml-2 border-l border-[#1a2d54]/45 pl-6">
              {errorsCount > 0 ? (
                <div className="flex items-center gap-1 text-red-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  <span>{errorsCount} CRITICAL ERRORS DETECTED</span>
                </div>
              ) : warningsCount > 0 ? (
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>{warningsCount} WARNINGS PENDING</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>ALL GRAPH CHECKS PASSED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer action */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1a2d54]/40 mt-4 select-none">
          <span className="text-[8px] text-[#8E9BB4]/50 font-mono font-bold uppercase">
            LAST MODIFIED: {lastSavedTime}
          </span>
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-[#00A3FF] group-hover:text-white transition-all font-mono">
            <span>Continue Editing</span>
            <LucideIcon name="ChevronRight" size={10} className="group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 3. Muted Coming Soon Modules Grid (Agnostic flat bottom row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0 font-mono">
        
        {/* Quest Editor (Soon) */}
        <div className="rounded-lg border border-[#1a2d54]/20 bg-[#0c1833]/15 p-2.5 flex items-center justify-between opacity-[0.18] cursor-not-allowed">
          <div className="flex items-center gap-2 min-w-0">
            <LucideIcon name="Compass" size={12} className="text-gray-500 shrink-0" />
            <span className="text-[9px] font-bold text-gray-400 truncate font-sans">Quest Editor</span>
          </div>
          <span className="text-[6px] font-bold bg-gray-950 px-1 py-0.5 rounded text-gray-600">SOON</span>
        </div>

        {/* Skill Tree (Soon) */}
        <div className="rounded-lg border border-[#1a2d54]/20 bg-[#0c1833]/15 p-2.5 flex items-center justify-between opacity-[0.18] cursor-not-allowed">
          <div className="flex items-center gap-2 min-w-0">
            <LucideIcon name="GitFork" size={12} className="text-gray-500 shrink-0" />
            <span className="text-[9px] font-bold text-gray-400 truncate font-sans">Skill Tree</span>
          </div>
          <span className="text-[6px] font-bold bg-gray-950 px-1 py-0.5 rounded text-gray-600">SOON</span>
        </div>

        {/* Wave Spawner (Soon) */}
        <div className="rounded-lg border border-[#1a2d54]/20 bg-[#0c1833]/15 p-2.5 flex items-center justify-between opacity-[0.18] cursor-not-allowed">
          <div className="flex items-center gap-2 min-w-0">
            <LucideIcon name="Waves" size={12} className="text-gray-500 shrink-0" />
            <span className="text-[9px] font-bold text-gray-400 truncate font-sans">Wave Spawner</span>
          </div>
          <span className="text-[6px] font-bold bg-gray-950 px-1 py-0.5 rounded text-gray-600">SOON</span>
        </div>

        {/* Item Database (Soon) */}
        <div className="rounded-lg border border-[#1a2d54]/20 bg-[#0c1833]/15 p-2.5 flex items-center justify-between opacity-[0.18] cursor-not-allowed">
          <div className="flex items-center gap-2 min-w-0">
            <LucideIcon name="Package" size={12} className="text-gray-500 shrink-0" />
            <span className="text-[9px] font-bold text-gray-400 truncate font-sans">Item Database</span>
          </div>
          <span className="text-[6px] font-bold bg-gray-950 px-1 py-0.5 rounded text-gray-600">SOON</span>
        </div>

        {/* Enemy Database (Soon) */}
        <div className="rounded-lg border border-[#1a2d54]/20 bg-[#0c1833]/15 p-2.5 flex items-center justify-between opacity-[0.18] cursor-not-allowed">
          <div className="flex items-center gap-2 min-w-0">
            <LucideIcon name="Skull" size={12} className="text-gray-500 shrink-0" />
            <span className="text-[9px] font-bold text-gray-400 truncate font-sans">Enemy Database</span>
          </div>
          <span className="text-[6px] font-bold bg-gray-950 px-1 py-0.5 rounded text-gray-600">SOON</span>
        </div>

      </div>

    </div>
  );
};
