/**
 * Demo Debug Utilities
 * Tools for benchmarking the 5-minute flow and analyzing rehearsal performance
 */

export interface DemoStepTrace {
  step: number;
  total: number;
  script: string;
  timestamp: string;
  action: string;
  payload: Record<string, unknown>;
  perfNow: number;
}

export interface DemoFlowAnalysis {
  totalDuration: number;
  stepDurations: number[];
  averageStepDuration: number;
  slowestStep: DemoStepTrace;
  fastestStep: DemoStepTrace;
  repeatEvents: Array<{
    action: string;
    count: number;
    steps: number[];
  }>;
  phaseTransitions: Array<{
    from: string;
    to: string;
    timestamp: string;
    stepNumber: number;
  }>;
}

type DemoDebugHelpers = {
  analyzeCurrentFlow: () => DemoFlowAnalysis | null;
  clearTraces: () => void;
  exportTraces: () => string;
  getTraces: () => DemoStepTrace[];
  getAverageStepDuration: () => string;
  getTotalDuration: () => string;
  checkForRepeats: () => DemoFlowAnalysis['repeatEvents'];
};

declare global {
  interface Window {
    __demoStepTrace?: DemoStepTrace[];
    __demoFlowAnalyzer?: DemoFlowAnalyzer;
    __demoDebug?: DemoDebugHelpers;
  }
}

class DemoFlowAnalyzer {
  private startTime: number | null = null;
  private scriptId: string | null = null;

  startFlow(scriptId: string) {
    this.scriptId = scriptId;
    this.startTime = performance.now();

    // Clear previous traces
    if (typeof window !== 'undefined') {
      window.__demoStepTrace = [];
    }

    console.log(`🎭 [DEBUG] Starting flow analysis for: ${scriptId}`);
    console.log(`🎭 [DEBUG] Use window.__demoFlowAnalyzer.analyzeFlow() to get results`);
  }

  stopFlow(): DemoFlowAnalysis | null {
    if (!this.startTime || typeof window === 'undefined' || !window.__demoStepTrace) {
      console.warn('🎭 [DEBUG] No flow data to analyze');
      return null;
    }

    const traces = window.__demoStepTrace;
    const endTime = performance.now();

    return this.analyzeTraces(traces, this.startTime, endTime);
  }

  analyzeFlow(): DemoFlowAnalysis | null {
    if (typeof window === 'undefined' || !window.__demoStepTrace) {
      console.warn('🎭 [DEBUG] No trace data available');
      return null;
    }

    const traces = window.__demoStepTrace;
    if (traces.length === 0) {
      console.warn('🎭 [DEBUG] No steps recorded');
      return null;
    }

    const startTime = traces[0].perfNow;
    const endTime = traces[traces.length - 1].perfNow;

    return this.analyzeTraces(traces, startTime, endTime);
  }

  private analyzeTraces(traces: DemoStepTrace[], startTime: number, endTime: number): DemoFlowAnalysis {
    const totalDuration = endTime - startTime;

    // Calculate step durations
    const stepDurations = traces.map((trace, index) => {
      if (index === 0) return 0;
      return trace.perfNow - traces[index - 1].perfNow;
    }).slice(1); // Remove first 0

    const averageStepDuration = stepDurations.reduce((a, b) => a + b, 0) / stepDurations.length;

    // Find slowest and fastest steps
    const slowestStepIndex = stepDurations.indexOf(Math.max(...stepDurations)) + 1;
    const fastestStepIndex = stepDurations.indexOf(Math.min(...stepDurations)) + 1;

    // Detect repeat events
    const actionCounts: Record<string, { count: number; steps: number[] }> = {};
    traces.forEach(trace => {
      const key = `${trace.action}:${JSON.stringify(trace.payload)}`;
      if (!actionCounts[key]) {
        actionCounts[key] = { count: 0, steps: [] };
      }
      actionCounts[key].count++;
      actionCounts[key].steps.push(trace.step);
    });

    const repeatEvents = Object.entries(actionCounts)
      .filter(([, data]) => data.count > 1)
      .map(([action, data]) => ({
        action: action.split(':')[0],
        count: data.count,
        steps: data.steps
      }));

    // Track phase transitions
    const phaseTransitions: Array<{
      from: string;
      to: string;
      timestamp: string;
      stepNumber: number;
    }> = [];

    let currentPhase = 'pre';
    traces.forEach(trace => {
      if (trace.action === 'phase:set') {
        const phase = (trace.payload as { phase?: string }).phase;
        if (phase) {
          phaseTransitions.push({
            from: currentPhase,
            to: phase,
            timestamp: trace.timestamp,
            stepNumber: trace.step
          });
          currentPhase = phase;
        }
      }
    });

    const analysis: DemoFlowAnalysis = {
      totalDuration,
      stepDurations,
      averageStepDuration,
      slowestStep: traces[slowestStepIndex] || traces[0],
      fastestStep: traces[fastestStepIndex] || traces[0],
      repeatEvents,
      phaseTransitions
    };

    this.printAnalysis(analysis);
    return analysis;
  }

  private printAnalysis(analysis: DemoFlowAnalysis) {
    console.group('🎭 [DEBUG] Demo Flow Analysis');

    console.log(`📊 Total Duration: ${(analysis.totalDuration / 1000).toFixed(2)}s`);
    console.log(`⏱️  Average Step Duration: ${analysis.averageStepDuration.toFixed(2)}ms`);

    if (analysis.slowestStep) {
      console.log(`🐌 Slowest Step: #${analysis.slowestStep.step} - ${analysis.slowestStep.action}`);
    }

    if (analysis.fastestStep) {
      console.log(`⚡ Fastest Step: #${analysis.fastestStep.step} - ${analysis.fastestStep.action}`);
    }

    if (analysis.repeatEvents.length > 0) {
      console.warn(`🔄 Repeat Events Detected:`, analysis.repeatEvents);
    }

    if (analysis.phaseTransitions.length > 0) {
      console.log(`🔄 Phase Transitions:`, analysis.phaseTransitions);
    }

    console.log(`📈 Step Durations:`, analysis.stepDurations.map(d => `${d.toFixed(2)}ms`));

    console.groupEnd();
  }

  // Utility methods for browser console
  getTraces(): DemoStepTrace[] {
    return (typeof window !== 'undefined' && window.__demoStepTrace) || [];
  }

  clearTraces() {
    if (typeof window !== 'undefined') {
      window.__demoStepTrace = [];
    }
    console.log('🎭 [DEBUG] Traces cleared');
  }

  exportTraces(): string {
    const traces = this.getTraces();
    const analysis = this.analyzeFlow();

    return JSON.stringify({
      traces,
      analysis,
      exportedAt: new Date().toISOString(),
      script: this.scriptId
    }, null, 2);
  }
}

// Global instance for browser console access
if (typeof window !== 'undefined') {
  window.__demoFlowAnalyzer = new DemoFlowAnalyzer();
}

export const demoFlowAnalyzer = new DemoFlowAnalyzer();

// Helper functions for console debugging
export const debugHelpers = {
  analyzeCurrentFlow: () => demoFlowAnalyzer.analyzeFlow(),
  clearTraces: () => demoFlowAnalyzer.clearTraces(),
  exportTraces: () => demoFlowAnalyzer.exportTraces(),
  getTraces: () => demoFlowAnalyzer.getTraces(),

  // Quick analysis functions
  getAverageStepDuration: () => {
    const analysis = demoFlowAnalyzer.analyzeFlow();
    return analysis ? `${analysis.averageStepDuration.toFixed(2)}ms` : 'No data';
  },

  getTotalDuration: () => {
    const analysis = demoFlowAnalyzer.analyzeFlow();
    return analysis ? `${(analysis.totalDuration / 1000).toFixed(2)}s` : 'No data';
  },

  checkForRepeats: () => {
    const analysis = demoFlowAnalyzer.analyzeFlow();
    return analysis?.repeatEvents || [];
  }
};

// Expose debug helpers to console
if (typeof window !== 'undefined') {
  const globalWindow = window as Window & { __demoDebug?: DemoDebugHelpers };
  globalWindow.__demoDebug = debugHelpers;
  console.log('🎭 [DEBUG] Demo debug helpers available at window.__demoDebug');
  console.log('🎭 [DEBUG] Flow analyzer available at window.__demoFlowAnalyzer');
}
