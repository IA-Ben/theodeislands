'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { featureFlags } from '@/lib/feature-flags';
import type { DemoEvent, DemoState } from '@/lib/demo-data-loader';

// Using imported types from demo-data-loader

interface DemoContextType {
  state: DemoState;
  togglePresenterMode: () => void;
  emitEvent: (type: string, payload: Record<string, unknown>) => void;
  jumpToChapter: (chapterId: string) => void;
  playSegment: (segmentId: string) => void;
  setEmotionMeter: (level: number) => void;
  setPhase: (phase: 'pre' | 'show' | 'post') => void;
  grantReward: (memoryId: string) => void;
  isEnabled: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>({
    isPresenterMode: false,
    currentPhase: 'pre',
    currentScript: null,
    currentStep: 0,
    isPlaying: false
  });

  const isEnabled = featureFlags.isDemoEnabled();

  // Event bus implementation with Codex's safety guards
  const emitEvent = useCallback((type: string, payload: Record<string, unknown>) => {
    if (!isEnabled || featureFlags.isKillSwitchActive()) {
      return;
    }

    const event: DemoEvent = {
      type,
      payload,
      timestamp: Date.now()
    };

    // Debounce rapid-fire commands
    const eventKey = `${type}-${JSON.stringify(payload)}`;
    const lastEvent = (window as unknown as { __lastDemoEvent?: { key: string; timestamp: number } }).__lastDemoEvent;
    const now = Date.now();

    if (lastEvent?.key === eventKey && now - lastEvent.timestamp < 100) {
      return; // Debounced
    }

    (window as unknown as { __lastDemoEvent: { key: string; timestamp: number } }).__lastDemoEvent = { key: eventKey, timestamp: now };

    // Emit to event bus (read-only for story view)
    window.dispatchEvent(new CustomEvent('demo:event', {
      detail: event
    }));

    console.log('🎭 Demo Event:', type, payload);
  }, [isEnabled]);

  // Demo controller methods
  const jumpToChapter = useCallback((chapterId: string) => {
    emitEvent('navigate:chapter', { chapterId });
  }, [emitEvent]);

  const playSegment = useCallback((segmentId: string) => {
    emitEvent('play:segment', { segmentId });
  }, [emitEvent]);

  const setEmotionMeter = useCallback((level: number) => {
    emitEvent('emotion:set', { level: Math.max(0, Math.min(100, level)) });
  }, [emitEvent]);

  const setPhase = useCallback((phase: 'pre' | 'show' | 'post') => {
    setState(prev => ({ ...prev, currentPhase: phase }));
    emitEvent('phase:set', { phase });
  }, [emitEvent]);

  const grantReward = useCallback((memoryId: string) => {
    emitEvent('reward:grant', { memoryId });

    // Show reward notification
    showRewardNotification(memoryId);
  }, [emitEvent]);

  const togglePresenterMode = useCallback(() => {
    if (!isEnabled) {
      console.warn('Demo mode is disabled');
      return;
    }

    setState(prev => {
      const newMode = !prev.isPresenterMode;

      if (newMode) {
        console.log('🎭 Presenter Mode ACTIVATED');
        emitEvent('presenter:activated', {});
      } else {
        console.log('🎭 Presenter Mode DEACTIVATED');
        emitEvent('presenter:deactivated', {});
      }

      return {
        ...prev,
        isPresenterMode: newMode
      };
    });
  }, [isEnabled, emitEvent]);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!isEnabled) return;

      // Shift+D to toggle presenter mode
      if (e.shiftKey && e.key === 'D') {
        e.preventDefault();
        togglePresenterMode();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isEnabled, togglePresenterMode]);

  const contextValue: DemoContextType = {
    state,
    togglePresenterMode,
    emitEvent,
    jumpToChapter,
    playSegment,
    setEmotionMeter,
    setPhase,
    grantReward,
    isEnabled
  };

  // Don't render context if demo is disabled (tree-shaking optimization)
  if (!isEnabled || featureFlags.isKillSwitchActive()) {
    return <>{children}</>;
  }

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext(): DemoContextType {
  const context = useContext(DemoContext);

  if (!context) {
    // Return safe fallback when demo is disabled
    return {
      state: {
        isPresenterMode: false,
        currentPhase: 'pre',
        currentScript: null,
        currentStep: 0,
        isPlaying: false
      },
      togglePresenterMode: () => {},
      emitEvent: () => {},
      jumpToChapter: () => {},
      playSegment: () => {},
      setEmotionMeter: () => {},
      setPhase: () => {},
      grantReward: () => {},
      isEnabled: false
    };
  }

  return context;
}

// Helper function for reward notifications
function showRewardNotification(memoryId: string) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg';
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-xl">🏆</span>
      <div>
        <div class="font-bold">Memory Unlocked!</div>
        <div class="text-sm opacity-90">${memoryId}</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  notification.style.opacity = '0';
  notification.style.transform = 'translate(-50%, -20px)';

  requestAnimationFrame(() => {
    notification.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    notification.style.opacity = '1';
    notification.style.transform = 'translate(-50%, 0px)';
  });

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 400);
  }, 4000);
}