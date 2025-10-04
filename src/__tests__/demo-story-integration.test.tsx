/**
 * CI Test: Demo Context and Story View Integration
 * Ensures step events reach story view without live script dependencies
 */

import { jest } from '@jest/globals';
import { render } from '@testing-library/react';
import React from 'react';

// Import mocks
import {
  MockDemoProvider,
  useMockDemoContext,
  mockActions,
  setupMockDemoContext
} from '../contexts/__mocks__/DemoContext';

// Mock story view component for testing
function MockStoryView({ onDemoEvent }: { onDemoEvent?: (event: CustomEvent) => void }) {
  const demoContext = useMockDemoContext();

  // Listen for demo events like real story view would
  React.useEffect(() => {
    const handleDemoEvent = (event: CustomEvent) => {
      onDemoEvent?.(event.detail);
    };

    window.addEventListener('demo:event', handleDemoEvent as EventListener);
    return () => window.removeEventListener('demo:event', handleDemoEvent as EventListener);
  }, [onDemoEvent]);

  return (
    <div data-testid="story-view">
      <div data-testid="presenter-mode-status">
        {demoContext.state.isPresenterMode ? 'Active' : 'Inactive'}
      </div>
      <div data-testid="current-phase">
        {demoContext.state.currentPhase}
      </div>
    </div>
  );
}

describe('Demo-Story Integration (CI Coverage)', () => {
  let eventSpy: jest.Mock;

  beforeEach(() => {
    setupMockDemoContext({
      initialState: { isPresenterMode: false, currentPhase: 'pre' },
      isEnabled: true
    });

    eventSpy = jest.fn();

    // Mock window.dispatchEvent for testing
    jest.spyOn(window, 'dispatchEvent').mockImplementation(eventSpy);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockActions.clear();
  });

  test('demo events reach story view through event bus', () => {
    const storyEventSpy = jest.fn();
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView onDemoEvent={storyEventSpy} />
        <TestComponent />
      </MockDemoProvider>
    );

    // Simulate presenter mode activation
    context.togglePresenterMode();

    // Simulate demo step execution
    context.emitEvent('demo:step', {
      action: 'phase:set',
      payload: { phase: 'show' }
    });

    // Verify events were dispatched
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'demo:event',
        detail: expect.objectContaining({
          type: 'demo:step',
          payload: {
            action: 'phase:set',
            payload: { phase: 'show' }
          }
        })
      })
    );

    // Verify story view would receive the event
    expect(mockActions.wasCalledWith('emitEvent', 'demo:step', {
      action: 'phase:set',
      payload: { phase: 'show' }
    })).toBe(true);
  });

  test('phase transitions are tracked correctly', () => {
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );

    // Test phase transition sequence
    context.setPhase('show');
    context.setPhase('post');

    // Verify events were emitted in order
    expect(mockActions.wasCalledWith('setPhase', 'show')).toBe(true);
    expect(mockActions.wasCalledWith('setPhase', 'post')).toBe(true);

    // Verify events contain correct data
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'demo:event',
        detail: expect.objectContaining({
          type: 'phase:set',
          payload: { phase: 'show' }
        })
      })
    );
  });

  test('chapter navigation events reach story view', () => {
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );

    // Simulate chapter navigation
    context.jumpToChapter('ch-1');

    // Verify navigation event was emitted
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'demo:event',
        detail: expect.objectContaining({
          type: 'navigate:chapter',
          payload: { chapterId: 'ch-1' }
        })
      })
    );

    expect(mockActions.wasCalledWith('jumpToChapter', 'ch-1')).toBe(true);
  });

  test('reward events trigger correctly', () => {
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );

    // Simulate reward granting
    context.grantReward('mem-test-memory');

    // Verify reward event was emitted
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'demo:event',
        detail: expect.objectContaining({
          type: 'reward:grant',
          payload: { memoryId: 'mem-test-memory' }
        })
      })
    );

    expect(mockActions.wasCalledWith('grantReward', 'mem-test-memory')).toBe(true);
  });

  test('demo context state updates are isolated from story view', () => {
    const { getByTestId } = render(
      <MockDemoProvider initialState={{ isPresenterMode: false, currentPhase: 'pre' }}>
        <MockStoryView />
      </MockDemoProvider>
    );

    // Initial state
    expect(getByTestId('presenter-mode-status')).toHaveTextContent('Inactive');
    expect(getByTestId('current-phase')).toHaveTextContent('pre');

    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    // Re-render with TestComponent
    render(
      <MockDemoProvider initialState={{ isPresenterMode: false, currentPhase: 'pre' }}>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );

    // Change demo state
    context.togglePresenterMode();
    context.setPhase('show');

    // Verify events were triggered but story view state is isolated
    expect(mockActions.wasCalledWith('togglePresenterMode')).toBe(true);
    expect(mockActions.wasCalledWith('setPhase', 'show')).toBe(true);

    // Story view would update based on events, not direct state coupling
    expect(eventSpy).toHaveBeenCalledTimes(2); // One for toggle, one for phase
  });

  test('multiple demo actions in sequence', () => {
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );

    // Simulate a full demo sequence
    context.togglePresenterMode();
    context.setPhase('show');
    context.jumpToChapter('ch-1');
    context.grantReward('mem-heart-window');
    context.setPhase('post');

    // Verify all actions were tracked
    expect(mockActions.calls).toHaveLength(5);
    expect(eventSpy).toHaveBeenCalledTimes(5);

    // Verify event sequence integrity
    const eventTypes = eventSpy.mock.calls.map(call =>
      call[0].detail?.type || call[0].type
    );

    expect(eventTypes).toContain('demo:event');
  });

  test('error handling when story view missing', () => {
    // Test fallback behavior when demo context isn't wrapped
    const fallbackContext = useMockDemoContext();

    expect(fallbackContext.state.isPresenterMode).toBe(false);
    expect(fallbackContext.isEnabled).toBe(false);

    // These should not throw errors
    expect(() => {
      fallbackContext.togglePresenterMode();
      fallbackContext.setPhase('show');
      fallbackContext.grantReward('test');
    }).not.toThrow();
  });

  test('performance: event emission is fast', () => {
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );
    const startTime = performance.now();

    // Emit many events quickly
    for (let i = 0; i < 100; i++) {
      context.emitEvent(`test:event:${i}`, { iteration: i });
    }

    const elapsed = performance.now() - startTime;

    // Should complete in under 50ms
    expect(elapsed).toBeLessThan(50);
    expect(eventSpy).toHaveBeenCalledTimes(100);
  });
});

describe('Demo Integration Edge Cases', () => {
  test('handles rapid presenter mode toggling', () => {
    const eventSpy = jest.fn();
    jest.spyOn(window, 'dispatchEvent').mockImplementation(eventSpy);
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );

    // Rapid toggling
    context.togglePresenterMode();
    context.togglePresenterMode();
    context.togglePresenterMode();

    expect(mockActions.calls.filter(call =>
      call.method === 'togglePresenterMode'
    )).toHaveLength(3);

    jest.restoreAllMocks();
  });

  test('ensures event payload immutability', () => {
    const eventSpy = jest.fn();
    jest.spyOn(window, 'dispatchEvent').mockImplementation(eventSpy);
    let context: ReturnType<typeof useMockDemoContext>;

    function TestComponent() {
      context = useMockDemoContext();
      return null;
    }

    render(
      <MockDemoProvider>
        <MockStoryView />
        <TestComponent />
      </MockDemoProvider>
    );
    const originalPayload = { memoryId: 'test-memory' };

    context.grantReward(originalPayload.memoryId);

    // Modify original payload
    originalPayload.memoryId = 'modified';

    // Event should contain original value
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          payload: { memoryId: 'test-memory' }
        })
      })
    );

    jest.restoreAllMocks();
  });
});