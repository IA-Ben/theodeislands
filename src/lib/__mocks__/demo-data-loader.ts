/**
 * Mock Demo Data Loader for Testing
 * Provides controllable demo data for unit tests and collaborators
 */

export interface MockDemoChapter {
  id: string;
  title: string;
  synopsis: string;
  media: {
    cover: string;
    audio: string;
  };
  prerequisites: string[];
  reward_id: string;
  subchapters: string[];
  explain_hint: string;
}

export interface MockDemoMemory {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Holo';
  set: string;
  lore: string;
}

export interface MockDemoScript {
  id: string;
  name: string;
  steps: MockDemoStep[];
}

export interface MockDemoStep {
  action: string;
  payload: Record<string, unknown>;
}

export interface MockDemoData {
  chapters: MockDemoChapter[];
  memories: MockDemoMemory[];
  scripts: MockDemoScript[];
  shortcuts: {
    global: string;
    overlay: Record<string, string>;
  };
}

// Mock data for testing
const MOCK_DEMO_DATA: MockDemoData = {
  chapters: [
    {
      id: "ch-test",
      title: "Test Chapter — Mock House",
      synopsis: "A test chapter for unit testing.",
      media: {
        cover: "/mock/chapters/ch-test.jpg",
        audio: "/mock/audio/ch-test.mp3"
      },
      prerequisites: [],
      reward_id: "mem-test-reward",
      subchapters: ["sc-test-1"],
      explain_hint: "This is a test chapter for demo testing."
    }
  ],
  memories: [
    {
      id: "mem-test-reward",
      name: "Test Memory",
      image: "/mock/mem/test.png",
      rarity: "Common",
      set: "Test Set",
      lore: "A memory created for testing purposes."
    }
  ],
  scripts: [
    {
      id: "test-script",
      name: "Test Script",
      steps: [
        { action: "phase:set", payload: { phase: "pre" } },
        { action: "navigate", payload: { to: "chapter", id: "ch-test" } },
        { action: "reward:grant", payload: { memoryId: "mem-test-reward" } },
        { action: "phase:set", payload: { phase: "post" } }
      ]
    }
  ],
  shortcuts: {
    global: "Shift+D",
    overlay: {
      feed: "1",
      chapter: "2",
      wallet: "4"
    }
  }
};

class MockDemoDataLoader {
  private mockData: MockDemoData = MOCK_DEMO_DATA;
  private shouldFail = false;
  private loadDelay = 0;

  // Test control methods
  setMockData(data: Partial<MockDemoData>) {
    this.mockData = { ...this.mockData, ...data };
  }

  setShouldFail(fail: boolean) {
    this.shouldFail = fail;
  }

  setLoadDelay(ms: number) {
    this.loadDelay = ms;
  }

  reset() {
    this.mockData = MOCK_DEMO_DATA;
    this.shouldFail = false;
    this.loadDelay = 0;
  }

  // Mock implementation of loader methods
  async loadDemoData(): Promise<MockDemoData> {
    if (this.loadDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.loadDelay));
    }

    if (this.shouldFail) {
      throw new Error('Mock demo data loader failure');
    }

    console.log('🎭 [MOCK] Demo data loaded', this.mockData);
    return this.mockData;
  }

  getChapters(): MockDemoChapter[] {
    return this.mockData.chapters;
  }

  getMemories(): MockDemoMemory[] {
    return this.mockData.memories;
  }

  getScripts(): MockDemoScript[] {
    return this.mockData.scripts;
  }

  getShortcuts() {
    return this.mockData.shortcuts;
  }

  getScript(scriptId: string): MockDemoScript | undefined {
    return this.mockData.scripts.find(script => script.id === scriptId);
  }

  getChapter(chapterId: string): MockDemoChapter | undefined {
    return this.mockData.chapters.find(chapter => chapter.id === chapterId);
  }

  getMemory(memoryId: string): MockDemoMemory | undefined {
    return this.mockData.memories.find(memory => memory.id === memoryId);
  }
}

// Export singleton mock instance
export const mockDemoDataLoader = new MockDemoDataLoader();

// Jest-style mock functions for testing
export const createMockDemoScript = (overrides: Partial<MockDemoScript> = {}): MockDemoScript => ({
  id: "test-script",
  name: "Test Script",
  steps: [
    { action: "phase:set", payload: { phase: "pre" } }
  ],
  ...overrides
});

export const createMockDemoStep = (overrides: Partial<MockDemoStep> = {}): MockDemoStep => ({
  action: "test:action",
  payload: { test: true },
  ...overrides
});

// Test utilities
export const simulateDemoEvents = {
  executeStep: (step: MockDemoStep) => {
    console.log(`🎭 [MOCK] Simulating step: ${step.action}`, step.payload);

    // Trigger custom events for testing
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('demo:step', {
        detail: { action: step.action, payload: step.payload }
      }));
    }
  },

  playScript: (script: MockDemoScript) => {
    console.log(`🎭 [MOCK] Playing script: ${script.name}`);
    script.steps.forEach((step, index) => {
      setTimeout(() => {
        simulateDemoEvents.executeStep(step);
      }, index * 100); // 100ms between steps for testing
    });
  },

  grantReward: (memoryId: string) => {
    console.log(`🎭 [MOCK] Granting reward: ${memoryId}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('demo:reward', {
        detail: { memoryId }
      }));
    }
  }
};

// Export types for TypeScript compatibility
export type { MockDemoChapter as DemoChapter };
export type { MockDemoMemory as DemoMemory };
export type { MockDemoScript as DemoScript };
export type { MockDemoStep as DemoStep };
export type { MockDemoData as DemoData };

// Default export for easy mocking
export default mockDemoDataLoader;
