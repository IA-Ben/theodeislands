/**
 * Unit tests for demo mocks and stubs
 * Ensures CI can test presenter bus without live script dependencies
 */

import { jest } from '@jest/globals';

// Mock implementations
import {
  mockDemoDataLoader,
  createMockDemoScript,
  createMockDemoStep,
  simulateDemoEvents
} from '../lib/__mocks__/demo-data-loader';

import {
  useMockDemoContext,
  mockActions,
  createMockDemoState,
  setupMockDemoContext
} from '../contexts/__mocks__/DemoContext';

// Test suites
describe('Demo Data Loader Mocks', () => {
  beforeEach(() => {
    mockDemoDataLoader.reset();
  });

  test('loads mock demo data successfully', async () => {
    const data = await mockDemoDataLoader.loadDemoData();

    expect(data).toBeDefined();
    expect(data.chapters).toHaveLength(1);
    expect(data.memories).toHaveLength(1);
    expect(data.scripts).toHaveLength(1);
    expect(data.shortcuts.global).toBe('Shift+D');
  });

  test('handles load failure with shouldFail flag', async () => {
    mockDemoDataLoader.setShouldFail(true);

    await expect(mockDemoDataLoader.loadDemoData()).rejects.toThrow(
      'Mock demo data loader failure'
    );
  });

  test('simulates load delay', async () => {
    const startTime = Date.now();
    mockDemoDataLoader.setLoadDelay(100);

    await mockDemoDataLoader.loadDemoData();
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeGreaterThanOrEqual(100);
  });

  test('gets specific mock data by ID', async () => {
    await mockDemoDataLoader.loadDemoData();

    const script = mockDemoDataLoader.getScript('test-script');
    const chapter = mockDemoDataLoader.getChapter('ch-test');
    const memory = mockDemoDataLoader.getMemory('mem-test-reward');

    expect(script?.name).toBe('Test Script');
    expect(chapter?.title).toBe('Test Chapter — Mock House');
    expect(memory?.name).toBe('Test Memory');
  });

  test('creates mock demo objects with helpers', () => {
    const customScript = createMockDemoScript({
      name: 'Custom Test Script',
      steps: [
        createMockDemoStep({ action: 'custom:action', payload: { test: 'value' } })
      ]
    });

    expect(customScript.name).toBe('Custom Test Script');
    expect(customScript.steps).toHaveLength(1);
    expect(customScript.steps[0].action).toBe('custom:action');
  });
});

describe('Demo Context Mocks', () => {
  beforeEach(() => {
    setupMockDemoContext({
      initialState: { isPresenterMode: false, currentPhase: 'pre' },
      isEnabled: true
    });
  });

  test('tracks method calls correctly', () => {
    const context = useMockDemoContext();

    context.togglePresenterMode();
    context.setPhase('show');
    context.grantReward('test-memory');

    expect(mockActions.wasCalledWith('togglePresenterMode')).toBe(true);
    expect(mockActions.wasCalledWith('setPhase', 'show')).toBe(true);
    expect(mockActions.wasCalledWith('grantReward', 'test-memory')).toBe(true);
  });

  test('creates mock demo state with overrides', () => {
    const state = createMockDemoState({
      isPresenterMode: true,
      currentPhase: 'post',
      currentStep: 5
    });

    expect(state.isPresenterMode).toBe(true);
    expect(state.currentPhase).toBe('post');
    expect(state.currentStep).toBe(5);
    expect(state.isPlaying).toBe(false); // default value
  });

  test('emits mock events correctly', () => {
    const context = useMockDemoContext();
    const eventSpy = jest.fn();

    // Mock window.dispatchEvent for testing
    const originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = eventSpy;

    context.emitEvent('test:event', { data: 'test' });

    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'demo:event',
        detail: expect.objectContaining({
          type: 'test:event',
          payload: { data: 'test' }
        })
      })
    );

    // Restore original function
    window.dispatchEvent = originalDispatchEvent;
  });

  test('provides fallback context when not wrapped in provider', () => {
    const fallbackContext = useMockDemoContext();

    expect(fallbackContext.state.isPresenterMode).toBe(false);
    expect(fallbackContext.isEnabled).toBe(false);
    expect(typeof fallbackContext.togglePresenterMode).toBe('function');
  });
});

describe('Demo Event Simulation', () => {
  test('simulates individual step execution', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const step = createMockDemoStep({
      action: 'phase:set',
      payload: { phase: 'show' }
    });

    simulateDemoEvents.executeStep(step);

    expect(consoleSpy).toHaveBeenCalledWith(
      '🎭 [MOCK] Simulating step: phase:set',
      { phase: 'show' }
    );

    consoleSpy.mockRestore();
  });

  test('simulates script playback with timing', (done) => {
    const script = createMockDemoScript({
      steps: [
        createMockDemoStep({ action: 'step1' }),
        createMockDemoStep({ action: 'step2' })
      ]
    });

    const eventSpy = jest.fn();
    const originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = eventSpy;

    simulateDemoEvents.playScript(script);

    // Check that events are fired with timing
    setTimeout(() => {
      expect(eventSpy).toHaveBeenCalledTimes(2);
      window.dispatchEvent = originalDispatchEvent;
      done();
    }, 250); // Wait for both 100ms spaced events
  });

  test('simulates reward granting', () => {
    const eventSpy = jest.fn();
    const originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = eventSpy;

    simulateDemoEvents.grantReward('test-memory-123');

    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'demo:reward',
        detail: { memoryId: 'test-memory-123' }
      })
    );

    window.dispatchEvent = originalDispatchEvent;
  });
});

describe('CI Integration Tests', () => {
  test('can run full mock demo flow without dependencies', async () => {
    // Setup mock environment
    setupMockDemoContext();

    // Load mock data
    await mockDemoDataLoader.loadDemoData();
    const script = mockDemoDataLoader.getScript('test-script');

    // Verify CI can execute without real dependencies
    expect(script).toBeDefined();
    expect(script?.steps).toHaveLength(4);

    // Simulate script execution
    if (script) {
      script.steps.forEach(step => {
        simulateDemoEvents.executeStep(step);
      });
    }

    // Verify all steps were simulated
    expect(mockActions.calls.length).toBeGreaterThan(0);
  });

  test('mocks provide TypeScript compatibility', () => {
    // Verify mock types match real interfaces
    const script = createMockDemoScript();
    const step = createMockDemoStep();
    const state = createMockDemoState();

    // These should compile without TypeScript errors
    expect(typeof script.id).toBe('string');
    expect(typeof script.name).toBe('string');
    expect(Array.isArray(script.steps)).toBe(true);

    expect(typeof step.action).toBe('string');
    expect(step.payload).toBeDefined();

    expect(typeof state.isPresenterMode).toBe('boolean');
    expect(['pre', 'show', 'post']).toContain(state.currentPhase);
  });
});

// Performance test for mock operations
describe('Mock Performance', () => {
  test('mock operations complete within reasonable time', async () => {
    const startTime = Date.now();

    // Perform multiple mock operations
    await mockDemoDataLoader.loadDemoData();

    for (let i = 0; i < 100; i++) {
      createMockDemoScript();
      createMockDemoStep();
      createMockDemoState();
    }

    const elapsed = Date.now() - startTime;

    // Should complete in under 100ms
    expect(elapsed).toBeLessThan(100);
  });
});
