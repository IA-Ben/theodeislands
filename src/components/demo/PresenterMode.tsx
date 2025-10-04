'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDemoContext } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';
import type { DemoScript, DemoStep } from '@/lib/demo-data-loader';

export default function PresenterMode() {
  const { isEnabled, togglePresenterMode } = useDemoContext();
  const [currentScript, setCurrentScript] = useState<DemoScript | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Demo script from the pack (memoised so callbacks keep a stable ref)
  const southbankScript = useMemo<DemoScript>(() => ({
    id: "southbank-5min",
    name: "Southbank 5‑minute",
    steps: [
      { action: "phase:set", payload: { phase: "pre" } },
      { action: "navigate", payload: { to: "feed" } },
      { action: "navigate", payload: { to: "chapter", id: "ch-1" } },
      { action: "complete", payload: { type: "chapter", id: "ch-1" } },
      { action: "reward:grant", payload: { memoryId: "mem-heart-window" } },
      { action: "navigate", payload: { to: "game", id: "gm-rhythm-01" } },
      { action: "game:result", payload: { gameId: "gm-rhythm-01", grade: "A", passed: true } },
      { action: "reward:grant", payload: { memoryId: "mem-fire-sigil" } },
      { action: "navigate", payload: { to: "wallet" } },
      { action: "phase:set", payload: { phase: "show" } },
      { action: "navigate", payload: { to: "venue" } },
      { action: "navigate", payload: { to: "merch" } },
      { action: "phase:set", payload: { phase: "post" } },
      { action: "navigate", payload: { to: "afterRecap" } }
    ]
  }), []);

  const navigateToSection = useCallback((section: string) => {
    window.dispatchEvent(new CustomEvent('demo:navigate', {
      detail: { to: section }
    }));

    console.log(`🎭 Demo: Navigate to ${section}`);
  }, []);

  const autoPassGame = useCallback(() => {
    window.dispatchEvent(new CustomEvent('demo:game:autoPass'));
    console.log('🎭 Demo: Auto-pass game');
  }, []);

  const showUploader = useCallback(() => {
    window.dispatchEvent(new CustomEvent('demo:uploader:show'));
    console.log('🎭 Demo: Show uploader');
  }, []);

  const executeStep = useCallback((step: DemoStep) => {
    console.log(`🎭 Demo Step: ${step.action}`, step.payload);

    window.dispatchEvent(new CustomEvent('demo:step', {
      detail: { action: step.action, payload: step.payload }
    }));

    if (step.action === 'navigate') {
      const destination = step.payload.to as string | undefined;
      if (destination) {
        navigateToSection(destination);
      }
    }
  }, [navigateToSection]);

  const togglePlayback = useCallback(() => {
    if (!currentScript) {
      setCurrentScript(southbankScript);
      setCurrentStep(0);
    }
    setIsPlaying(prev => !prev);
  }, [currentScript, southbankScript]);

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

  const onToggle = useCallback(() => {
    togglePresenterMode();
    console.log('🎭 Toggle presenter mode');
  }, [togglePresenterMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Shift+D to toggle presenter mode
      if (e.shiftKey && e.key === 'D') {
        e.preventDefault();
        onToggle();
        return;
      }

      // Only handle shortcuts when presenter mode is active
      if (!isEnabled) return;

      // Numbered shortcuts 1-6
      const shortcuts: Record<string, () => void> = {
        '1': () => navigateToSection('feed'),
        '2': () => navigateToSection('chapter'),
        '3': autoPassGame,
        '4': () => navigateToSection('wallet'),
        '5': () => navigateToSection('venue'),
        '6': () => navigateToSection('recap'),
        'u': showUploader,
        'U': showUploader,
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
  }, [isEnabled, navigateToSection, autoPassGame, showUploader, togglePlayback, nextStep, previousStep, onToggle]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying || !currentScript) return;

    const timer = setTimeout(() => {
      if (currentStep < currentScript.steps.length - 1) {
        nextStep();
      } else {
        setIsPlaying(false);
      }
    }, 2000); // 2 seconds between steps

    return () => clearTimeout(timer);
  }, [isPlaying, currentScript, currentStep, nextStep]);

  if (!isEnabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm opacity-50">
          Press Shift+D for Demo Mode
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Demo Overlay Panel */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-black/90 backdrop-blur-sm text-white rounded-lg p-4 min-w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">🎭 Presenter Mode</h3>
            <button
              onClick={onToggle}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              ✕ Close
            </button>
          </div>

          {/* Script Controls */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={togglePlayback}
                className={cn(
                  "px-3 py-1 rounded text-sm font-medium",
                  isPlaying
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play Southbank Script"}
              </button>

              {currentScript && (
                <span className="text-sm text-gray-300">
                  Step {currentStep + 1}/{currentScript.steps.length}
                </span>
              )}
            </div>

            {/* Manual Step Controls */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm"
              >
                ← Prev
              </button>
              <button
                onClick={nextStep}
                disabled={!currentScript || currentStep >= currentScript.steps.length - 1}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Current Step Display */}
          {currentScript && (
            <div className="mb-4 p-2 bg-gray-800 rounded text-sm">
              <div className="font-medium text-green-400">Current Step:</div>
              <div>{currentScript.steps[currentStep]?.action}</div>
              <div className="text-gray-400 text-xs mt-1">
                {JSON.stringify(currentScript.steps[currentStep]?.payload)}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div>
            <div className="font-medium text-sm mb-2">Shortcuts:</div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
              <div>1 - Feed</div>
              <div>2 - Chapter</div>
              <div>3 - Auto Game</div>
              <div>4 - Wallet</div>
              <div>5 - Venue</div>
              <div>6 - Recap</div>
              <div>U - Uploader</div>
              <div>Space - Play/Pause</div>
              <div>← → - Manual Steps</div>
              <div>Shift+D - Toggle</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {currentScript && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-400"
              )} />
              <span className="text-sm font-medium">
                {currentScript.name} - {currentStep + 1}/{currentScript.steps.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
