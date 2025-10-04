/**
 * Mock Demo Context for Testing
 * Provides controllable demo context state for unit tests
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MockDemoState {
  isPresenterMode: boolean;
  currentPhase: 'pre' | 'show' | 'post';
  currentScript: string | null;
  currentStep: number;
  isPlaying: boolean;
}

export interface MockDemoContextType {
  state: MockDemoState;
  togglePresenterMode: () => void;
  emitEvent: (type: string, payload: Record<string, unknown>) => void;
  jumpToChapter: (chapterId: string) => void;
  playSegment: (segmentId: string) => void;
  setEmotionMeter: (level: number) => void;
  setPhase: (phase: 'pre' | 'show' | 'post') => void;
  grantReward: (memoryId: string) => void;
  isEnabled: boolean;
}

// Mock implementation tracking for tests
export const mockActions = {
  calls: [] as Array<{ method: string; args: unknown[] }>,
  clear: () => { mockActions.calls = []; },
  wasCalledWith: (method: string, ...args: unknown[]) => {
    return mockActions.calls.some(call =>
      call.method === method &&
      JSON.stringify(call.args) === JSON.stringify(args)
    );
  }
};

const MockDemoContext = createContext<MockDemoContextType | null>(null);

export function MockDemoProvider({
  children,
  initialState = {},
  isEnabled = true
}: {
  children: ReactNode;
  initialState?: Partial<MockDemoState>;
  isEnabled?: boolean;
}) {
  const [state, setState] = useState<MockDemoState>({
    isPresenterMode: false,
    currentPhase: 'pre',
    currentScript: null,
    currentStep: 0,
    isPlaying: false,
    ...initialState
  });

  const togglePresenterMode = () => {
    mockActions.calls.push({ method: 'togglePresenterMode', args: [] });
    setState(prev => ({ ...prev, isPresenterMode: !prev.isPresenterMode }));
    console.log('🎭 [MOCK] Presenter mode toggled:', !state.isPresenterMode);
  };

  const emitEvent = (type: string, payload: Record<string, unknown>) => {
    mockActions.calls.push({ method: 'emitEvent', args: [type, payload] });
    console.log('🎭 [MOCK] Event emitted:', type, payload);

    // Simulate event dispatch for tests
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('demo:event', {
        detail: { type, payload, timestamp: Date.now() }
      }));
    }
  };

  const jumpToChapter = (chapterId: string) => {
    mockActions.calls.push({ method: 'jumpToChapter', args: [chapterId] });
    console.log('🎭 [MOCK] Jump to chapter:', chapterId);
    emitEvent('navigate:chapter', { chapterId });
  };

  const playSegment = (segmentId: string) => {
    mockActions.calls.push({ method: 'playSegment', args: [segmentId] });
    console.log('🎭 [MOCK] Play segment:', segmentId);
    emitEvent('play:segment', { segmentId });
  };

  const setEmotionMeter = (level: number) => {
    mockActions.calls.push({ method: 'setEmotionMeter', args: [level] });
    console.log('🎭 [MOCK] Set emotion meter:', level);
    emitEvent('emotion:set', { level });
  };

  const setPhase = (phase: 'pre' | 'show' | 'post') => {
    mockActions.calls.push({ method: 'setPhase', args: [phase] });
    setState(prev => ({ ...prev, currentPhase: phase }));
    console.log('🎭 [MOCK] Phase set:', phase);
    emitEvent('phase:set', { phase });
  };

  const grantReward = (memoryId: string) => {
    mockActions.calls.push({ method: 'grantReward', args: [memoryId] });
    console.log('🎭 [MOCK] Grant reward:', memoryId);
    emitEvent('reward:grant', { memoryId });

    // Mock reward notification
    showMockRewardNotification(memoryId);
  };

  const contextValue: MockDemoContextType = {
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

  return (
    <MockDemoContext.Provider value={contextValue}>
      {children}
    </MockDemoContext.Provider>
  );
}

export function useMockDemoContext(): MockDemoContextType {
  const context = useContext(MockDemoContext);

  if (!context) {
    // Return mock fallback for tests
    return {
      state: {
        isPresenterMode: false,
        currentPhase: 'pre',
        currentScript: null,
        currentStep: 0,
        isPlaying: false
      },
      togglePresenterMode: () => console.log('🎭 [MOCK] togglePresenterMode (fallback)'),
      emitEvent: () => console.log('🎭 [MOCK] emitEvent (fallback)'),
      jumpToChapter: () => console.log('🎭 [MOCK] jumpToChapter (fallback)'),
      playSegment: () => console.log('🎭 [MOCK] playSegment (fallback)'),
      setEmotionMeter: () => console.log('🎭 [MOCK] setEmotionMeter (fallback)'),
      setPhase: () => console.log('🎭 [MOCK] setPhase (fallback)'),
      grantReward: () => console.log('🎭 [MOCK] grantReward (fallback)'),
      isEnabled: false
    };
  }

  return context;
}

// Mock reward notification for testing
function showMockRewardNotification(memoryId: string) {
  console.log(`🎭 [MOCK] Showing reward notification: ${memoryId}`);

  if (typeof window !== 'undefined') {
    // Simulate reward notification event
    window.dispatchEvent(new CustomEvent('demo:reward:shown', {
      detail: { memoryId, timestamp: Date.now() }
    }));
  }
}

// Test utilities
export const createMockDemoState = (overrides: Partial<MockDemoState> = {}): MockDemoState => ({
  isPresenterMode: false,
  currentPhase: 'pre',
  currentScript: null,
  currentStep: 0,
  isPlaying: false,
  ...overrides
});

// For Jest testing
export const setupMockDemoContext = (options: {
  initialState?: Partial<MockDemoState>;
  isEnabled?: boolean;
} = {}) => {
  mockActions.clear();
  return {
    MockDemoProvider: ({ children }: { children: ReactNode }) => (
      <MockDemoProvider
        initialState={options.initialState}
        isEnabled={options.isEnabled}
      >
        {children}
      </MockDemoProvider>
    ),
    mockActions
  };
};

// Export for compatibility with real context
export { MockDemoProvider as DemoProvider };
export { useMockDemoContext as useDemoContext };
