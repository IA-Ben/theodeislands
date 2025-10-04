'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDemoContext } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';
import { demoDataLoader, DemoScript, DemoStep } from '@/lib/demo-data-loader';
import { featureFlags } from '@/lib/feature-flags';
import { demoFlowAnalyzer } from '@/lib/demo-debug-utils';


export default function PresenterModePortal() {
  const { state, togglePresenterMode, jumpToChapter, setPhase, grantReward, isEnabled } = useDemoContext();
  const [isMounted, setIsMounted] = useState(false);
  const [currentScript, setCurrentScript] = useState<DemoScript | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [southbankScript, setSouthbankScript] = useState<DemoScript | null>(null);
  const { isPresenterMode, currentPhase } = state;

  // Early tree-shaking guard for production builds
  const shouldRender = useMemo(() => featureFlags.shouldIncludeDemoBundle(), []);

  // Portal mounting and demo data loading
  useEffect(() => {
    let cancelled = false;
    setIsMounted(true);

    demoDataLoader.loadDemoData()
      .then(() => {
        if (cancelled) return;
        const script = demoDataLoader.getScript('southbank-5min');
        if (script) {
          setSouthbankScript(script);
          console.log('🎭 Loaded Southbank script:', script);
        }
      })
      .catch(error => {
        if (!cancelled) {
          console.error('Failed to load demo data:', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const autoPassGame = useCallback(() => {
    console.log('🎭 Demo: Auto-pass game');
  }, []);

  const navigateToWallet = useCallback(() => {
    console.log('🎭 Demo: Navigate to wallet');
  }, []);

  const executeStep = useCallback((step: DemoStep) => {
    if (!currentScript) {
      return;
    }

    const timestamp = new Date().toISOString();
    const stepContext = {
      step: currentStep + 1,
      total: currentScript.steps.length,
      script: currentScript.id,
      timestamp,
      action: step.action,
      payload: step.payload
    };

    console.log('🎭 [DEBUG] Demo Step Executed:', stepContext);

    if (typeof window !== 'undefined') {
      const globalObject = window as unknown as { __demoStepTrace?: Array<Record<string, unknown>> };
      if (!globalObject.__demoStepTrace) {
        globalObject.__demoStepTrace = [];
      }
      globalObject.__demoStepTrace.push({
        ...stepContext,
        perfNow: performance.now()
      });
    }

    switch (step.action) {
      case 'phase:set': {
        const nextPhase = step.payload.phase as 'pre' | 'show' | 'post';
        console.log(`🎭 [DEBUG] Phase transition: ${currentPhase} → ${nextPhase}`);
        setPhase(nextPhase);
        break;
      }
      case 'navigate': {
        const destination = step.payload.to as string | undefined;
        const chapterId = step.payload.id as string | undefined;
        console.log(`🎭 [DEBUG] Navigation: ${destination}${chapterId ? ` (${chapterId})` : ''}`);
        if (destination === 'chapter' && chapterId) {
          jumpToChapter(chapterId);
        }
        break;
      }
      case 'reward:grant': {
        const memoryId = step.payload.memoryId as string | undefined;
        if (memoryId) {
          console.log(`🎭 [DEBUG] Reward granted: ${memoryId}`);
          grantReward(memoryId);
        }
        break;
      }
      default:
        console.log(`🎭 [DEBUG] Unhandled step: ${step.action}`, step.payload);
    }
  }, [currentPhase, currentScript, currentStep, grantReward, jumpToChapter, setPhase]);

  const nextStep = useCallback(() => {
    if (!currentScript) return;
    if (currentStep < currentScript.steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      executeStep(currentScript.steps[nextStepIndex]);
    }
  }, [currentScript, currentStep, executeStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const togglePlayback = useCallback(() => {
    if (!currentScript && southbankScript) {
      setCurrentScript(southbankScript);
      setCurrentStep(0);
    }

    setIsPlaying(prev => {
      const nextPlayingState = !prev;

      const activeScript = currentScript ?? southbankScript;
      if (nextPlayingState && activeScript) {
        demoFlowAnalyzer.startFlow(activeScript.id);
        console.log('🎭 [DEBUG] Flow analysis started for rehearsal');
      }

      if (!nextPlayingState) {
        const analysis = demoFlowAnalyzer.stopFlow();
        if (analysis) {
          console.log('🎭 [DEBUG] Flow analysis complete - check console for results');
        }
      }

      return nextPlayingState;
    });
  }, [currentScript, southbankScript]);

  // Keyboard shortcuts (only when presenter mode is active)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!isPresenterMode || !isEnabled) return;

      // Numbered shortcuts 1-6
      const shortcuts: Record<string, () => void> = {
        '1': () => jumpToChapter('ch-1'),
        '2': () => jumpToChapter('ch-2'),
        '3': () => autoPassGame(),
        '4': () => navigateToWallet(),
        '5': () => setPhase('show'),
        '6': () => setPhase('post'),
      };

      if (shortcuts[e.key]) {
        e.preventDefault();
        shortcuts[e.key]();
      }

      // Space to play/pause script
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      }

      // Arrow keys for manual step control
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousStep();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [autoPassGame, isEnabled, isPresenterMode, jumpToChapter, navigateToWallet, nextStep, previousStep, setPhase, togglePlayback]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying || !currentScript) return;

    const timer = setTimeout(() => {
      if (currentStep < currentScript.steps.length - 1) {
        nextStep();
      } else {
        setIsPlaying(false);
      }
    }, 3000); // 3 seconds between steps for demo

    return () => clearTimeout(timer);
  }, [isPlaying, currentScript, currentStep, nextStep]);

  // Don't render if not enabled or tree-shaking guard disabled
  if (!isEnabled || !isMounted || !shouldRender) {
    return null;
  }

  const presenterModeUI = (
    <>
      {/* Hint when presenter mode is off */}
      {!state.isPresenterMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm opacity-70 hover:opacity-100 transition-opacity">
            Press Shift+D for Demo Mode
          </div>
        </div>
      )}

      {/* Presenter Mode Overlay */}
      {state.isPresenterMode && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Demo Control Panel */}
          <div className="absolute top-4 right-4 pointer-events-auto">
            <div className="bg-black/90 backdrop-blur-sm text-white rounded-lg p-4 min-w-80 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  🎭 <span>Presenter Mode</span>
                </h3>
                <button
                  onClick={togglePresenterMode}
                  className="text-red-400 hover:text-red-300 text-sm hover:bg-red-900/20 px-2 py-1 rounded"
                >
                  ✕ Close
                </button>
              </div>

              {/* Phase Indicator */}
              <div className="mb-4 p-2 bg-gray-800 rounded">
                <div className="text-xs text-gray-400 mb-1">Current Phase</div>
                <div className="flex gap-2">
                  {(['pre', 'show', 'post'] as const).map(phase => (
                    <button
                      key={phase}
                      onClick={() => setPhase(phase)}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium capitalize",
                        state.currentPhase === phase
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      )}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Script Controls */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={togglePlayback}
                    className={cn(
                      "px-3 py-1 rounded text-sm font-medium flex items-center gap-1",
                      isPlaying
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {isPlaying ? "⏸ Pause" : `▶ Play ${southbankScript?.name || 'Script'}`}
                  </button>

                  {currentScript && (
                    <span className="text-sm text-gray-400">
                      {currentStep + 1}/{currentScript.steps.length}
                    </span>
                  )}
                </div>

                {/* Manual Step Controls */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!currentScript || currentStep >= currentScript.steps.length - 1}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Current Step Display */}
              {currentScript && (
                <div className="mb-4 p-2 bg-gray-800 rounded text-sm">
                  <div className="font-medium text-green-400 mb-1">Current Step:</div>
                  <div className="text-white">{currentScript.steps[currentStep]?.action}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {JSON.stringify(currentScript.steps[currentStep]?.payload, null, 2)}
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts */}
              <div>
                <div className="font-medium text-sm mb-2 text-gray-300">Shortcuts:</div>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                  <div>1 - Chapter 1</div>
                  <div>2 - Chapter 2</div>
                  <div>3 - Auto Game</div>
                  <div>4 - Wallet</div>
                  <div>5 - Show Phase</div>
                  <div>6 - Post Phase</div>
                  <div>Space - Play/Pause</div>
                  <div>← → - Manual Steps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {currentScript && isPlaying && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
              <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium">
                    {currentScript.name}
                  </span>
                  <div className="text-xs text-gray-400">
                    Step {currentStep + 1}/{currentScript.steps.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  // Use portal to render outside the main app tree
  return createPortal(presenterModeUI, document.body);
}
