/**
 * Demo Data Loader
 * Loads and manages demo data from the demo pack
 */

// Shared demo types
export interface DemoEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp?: string;
}

export interface DemoState {
  isPresenterMode: boolean;
  currentPhase: 'pre' | 'show' | 'post';
  currentScript?: string | null;
  currentStep?: number;
  isPlaying?: boolean;
}

export interface DemoChapter {
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

export interface DemoMemory {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Holo';
  set: string;
  lore: string;
}

export interface DemoScript {
  id: string;
  name: string;
  steps: DemoStep[];
}

export interface DemoStep {
  action: string;
  payload: Record<string, unknown>;
}

export interface DemoShortcuts {
  global: string;
  overlay: Record<string, string>;
}

export interface DemoData {
  chapters: DemoChapter[];
  memories: DemoMemory[];
  scripts: DemoScript[];
  shortcuts: DemoShortcuts;
}

class DemoDataLoader {
  private static instance: DemoDataLoader;
  private demoData: DemoData | null = null;
  private loaded = false;

  private constructor() {}

  static getInstance(): DemoDataLoader {
    if (!DemoDataLoader.instance) {
      DemoDataLoader.instance = new DemoDataLoader();
    }
    return DemoDataLoader.instance;
  }

  async loadDemoData(): Promise<DemoData> {
    if (this.loaded && this.demoData) {
      return this.demoData;
    }

    try {
      // Load all demo data files
      const [chaptersResponse, memoriesResponse, scriptsResponse] = await Promise.all([
        this.fetchDemoFile('/demo-assets/ode_islands_demo_pack/data/examples/chapters.json'),
        this.fetchDemoFile('/demo-assets/ode_islands_demo_pack/data/examples/memories.json'),
        this.fetchDemoFile('/demo-assets/ode_islands_demo_pack/demo/demoScripts.json')
      ]);

      const chapters = await chaptersResponse.json();
      const memories = await memoriesResponse.json();
      const scriptsData = await scriptsResponse.json();

      this.demoData = {
        chapters,
        memories,
        scripts: scriptsData.scripts,
        shortcuts: scriptsData.shortcuts
      };

      this.loaded = true;
      console.log('🎭 Demo data loaded successfully', this.demoData);
      return this.demoData;

    } catch (error) {
      console.error('Failed to load demo data:', error);

      // Return fallback demo data
      this.demoData = this.getFallbackData();
      return this.demoData;
    }
  }

  private async fetchDemoFile(path: string): Promise<Response> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return response;
  }

  private getFallbackData(): DemoData {
    return {
      chapters: [
        {
          id: "ch-1",
          title: "Ode to Him — Heart House",
          synopsis: "Escape the house; face the Mean Girls' Glade.",
          media: {
            cover: "/assets/chapters/ch-1.jpg",
            audio: "/assets/audio/ch-1.mp3"
          },
          prerequisites: [],
          reward_id: "mem-heart-window",
          subchapters: ["sc-1a", "sc-1b"],
          explain_hint: "Completing this begins your escape arc."
        }
      ],
      memories: [
        {
          id: "mem-heart-window",
          name: "Heart House Window",
          image: "/assets/mem/heart-window.png",
          rarity: "Common",
          set: "Act I",
          lore: "A shard from the window you broke to escape."
        },
        {
          id: "mem-fire-sigil",
          name: "Fire's Sigil",
          image: "/assets/mem/fire-sigil.gif",
          rarity: "Rare",
          set: "Act I",
          lore: "A mark of wakefulness granted by the fire."
        }
      ],
      scripts: [
        {
          id: "southbank-5min",
          name: "Southbank 5‑minute",
          steps: [
            { action: "phase:set", payload: { phase: "pre" } },
            { action: "navigate", payload: { to: "chapter", id: "ch-1" } },
            { action: "complete", payload: { type: "chapter", id: "ch-1" } },
            { action: "reward:grant", payload: { memoryId: "mem-heart-window" } },
            { action: "phase:set", payload: { phase: "show" } },
            { action: "navigate", payload: { to: "venue" } },
            { action: "phase:set", payload: { phase: "post" } }
          ]
        }
      ],
      shortcuts: {
        global: "Shift+D",
        overlay: {
          feed: "1",
          chapter: "2",
          gameAutoPass: "3",
          wallet: "4",
          venue: "5",
          recap: "6",
          uploader: "U"
        }
      }
    };
  }

  // Getter methods for loaded data
  getChapters(): DemoChapter[] {
    return this.demoData?.chapters || [];
  }

  getMemories(): DemoMemory[] {
    return this.demoData?.memories || [];
  }

  getScripts(): DemoScript[] {
    return this.demoData?.scripts || [];
  }

  getShortcuts(): DemoShortcuts {
    return this.demoData?.shortcuts || { global: "Shift+D", overlay: {} };
  }

  getScript(scriptId: string): DemoScript | undefined {
    return this.getScripts().find(script => script.id === scriptId);
  }

  getChapter(chapterId: string): DemoChapter | undefined {
    return this.getChapters().find(chapter => chapter.id === chapterId);
  }

  getMemory(memoryId: string): DemoMemory | undefined {
    return this.getMemories().find(memory => memory.id === memoryId);
  }
}

// Export singleton instance
export const demoDataLoader = DemoDataLoader.getInstance();

// Helper function for React components
export async function useDemoData(): Promise<DemoData> {
  return await demoDataLoader.loadDemoData();
}