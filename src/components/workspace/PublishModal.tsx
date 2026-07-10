import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';

type StepStatus = 'idle' | 'loading' | 'success' | 'failed';

export const PublishModal: React.FC = () => {
  const { activeModal, setActiveModal, addNotification, validationErrors, activeEditor } = useWorkspace();

  const [step1, setStep1] = useState<StepStatus>('idle');
  const [step2, setStep2] = useState<StepStatus>('idle');
  const [progress, setProgress] = useState(0);

  const isOpen = activeModal === 'publish';
  const hasErrors = validationErrors.some((err: any) => err.severity === 'error') ||
    validationErrors.some((err: any) => err.type === 'no-start');

  // Run the compilation pipeline automatically when the modal is opened
  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStep1('idle');
      setStep2('idle');
      setProgress(0);
      return;
    }

    if (hasErrors) {
      setStep1('failed');
      return;
    }

    let isMounted = true;

    const runPipeline = async () => {
      // Step 1: Validate
      if (!isMounted) return;
      setStep1('loading');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (!isMounted) return;
      setStep1('success');

      // Step 2: Compile
      setStep2('loading');
      
      // Animate progress bar
      const interval = setInterval(() => {
        if (!isMounted) {
          clearInterval(interval);
          return;
        }
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep2('success');
            addNotification('success', 'Build generated successfully! Forge target is ready.');
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    };

    runPipeline();

    return () => {
      isMounted = false;
    };
  }, [isOpen, addNotification, hasErrors]);

  if (!isOpen) return null;

  const handleClose = () => setActiveModal(null);

  const isCompleted = step1 === 'success' && step2 === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
      <div className="relative w-full max-w-md bg-[#0b0c1e] border border-[#1a1c36] rounded-xl shadow-2xl flex flex-col animate-fade-in text-gray-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1a1c36] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LucideIcon name="UploadCloud" className="text-[#ec4899]" size={16} />
            <h4 className="font-extrabold text-sm tracking-wider uppercase">Publish Module Workflow</h4>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            disabled={!isCompleted}
          >
            <LucideIcon name="X" size={16} />
          </button>
        </div>

        {/* Modal Body */}
        {hasErrors ? (
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 flex items-start gap-3">
              <div className="shrink-0 text-red-400 mt-0.5 animate-pulse">
                <LucideIcon name="AlertOctagon" size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-red-400">Compilation Aborted</h5>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Forge cannot compile your graph due to critical design validation errors. Please resolve the issues marked on the nodes before publishing.
                </p>
              </div>
            </div>
            
            <div className="border border-[#1a1c36] rounded-xl overflow-hidden bg-[#070814]/50 max-h-48 overflow-y-auto divide-y divide-[#14152a]">
              {validationErrors.filter((e: any) => e.severity === 'error').map((err: any, idx: number) => (
                <div key={idx} className="p-3 text-[10px] flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">[Error]</span>
                  <span className="text-gray-400 leading-normal">{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Step 1: Validation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                  step1 === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : step1 === 'loading'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-[#070814] border-gray-800 text-gray-600'
                }`}>
                  {step1 === 'success' ? (
                    <LucideIcon name="Check" size={12} className="stroke-[3]" />
                  ) : step1 === 'loading' ? (
                    <LucideIcon name="Loader2" size={12} className="animate-spin" />
                  ) : '1'}
                </div>
                <div>
                  <p className={`text-xs font-bold ${step1 === 'loading' ? 'text-indigo-400' : 'text-gray-300'}`}>
                    Validate Project
                  </p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Check duplicate start nodes & structural constraints</p>
                </div>
              </div>
              {step1 === 'success' && <span className="text-[9px] font-bold text-emerald-400 uppercase">Valid</span>}
              {step1 === 'loading' && <span className="text-[9px] text-indigo-400 animate-pulse">Running...</span>}
            </div>

            {/* Step 2: Compile */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                    step2 === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : step2 === 'loading'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-[#070814] border-gray-800 text-gray-600'
                  }`}>
                    {step2 === 'success' ? (
                      <LucideIcon name="Check" size={12} className="stroke-[3]" />
                    ) : step2 === 'loading' ? (
                      <LucideIcon name="Loader2" size={12} className="animate-spin" />
                    ) : '2'}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${step2 === 'loading' ? 'text-indigo-400' : 'text-gray-300'}`}>
                      Generate Target Build
                    </p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Compile relational schema into clean JSON</p>
                  </div>
                </div>
                {step2 === 'success' && <span className="text-[9px] font-bold text-emerald-400 uppercase">Success</span>}
                {step2 === 'loading' && <span className="text-[9px] text-indigo-400">{progress}%</span>}
              </div>

              {/* Custom Premium Progress Bar */}
              {step2 === 'loading' && (
                <div className="w-full bg-[#070814] border border-[#1a1c36] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full rounded-full transition-all duration-150 animate-progress-pulse"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Success summary animation */}
            {isCompleted && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mb-2.5 text-emerald-400 shadow shadow-emerald-500/10">
                  <LucideIcon name="Trophy" size={18} />
                </div>
                <h5 className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
                  {activeEditor?.publishInfo?.title || 'Build Completed'}
                </h5>
                <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                  {activeEditor?.publishInfo?.description || 'Project compiled successfully. Active schemas are compiled and ready for runtime import.'}
                </p>
              </div>
            )}

          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1a1c36] flex items-center justify-end bg-[#0d0e26] rounded-b-xl gap-2.5 shrink-0">
          <button
            onClick={handleClose}
            disabled={!isCompleted && !hasErrors}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              hasErrors
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                : isCompleted
                ? 'bg-[#ec4899] hover:bg-[#db2777] text-white shadow-md'
                : 'bg-gray-800 text-gray-500 border border-gray-900 cursor-not-allowed'
            }`}
          >
            {hasErrors ? 'Close & Fix Issues' : isCompleted ? 'Finish Workflow' : 'Processing...'}
          </button>
        </div>
      </div>
    </div>
  );
};
