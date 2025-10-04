/**
 * ChatGPT Integration Helper
 * Provides easy-to-use functions for ChatGPT to participate in pair programming
 */

export interface ChatGPTCollaborationAPI {
  createSession(feature: string, goals: string[]): Promise<string>;
  joinSession(sessionId: string): Promise<SessionInfo>;
  sendMessage(sessionId: string, type: MessageType, content: string, codeRef?: CodeReference): Promise<void>;
  getRecentMessages(sessionId: string, count?: number): Promise<Message[]>;
  updateProgress(sessionId: string, item: string, status: ProgressStatus): Promise<void>;
  addDecision(sessionId: string, topic: string, decision: string, rationale: string): Promise<void>;
  getSessionStatus(sessionId: string): Promise<SessionStatus>;
  suggestCode(sessionId: string, file: string, lines: [number, number], suggestion: string, explanation: string): Promise<void>;
  askQuestion(sessionId: string, question: string, aboutFile?: string, aboutLines?: [number, number]): Promise<void>;
  shareImplementation(sessionId: string, file: string, description: string, code?: string): Promise<void>;
  requestReview(sessionId: string, file: string, description: string, lines?: [number, number]): Promise<void>;
}

export type MessageType = 'suggestion' | 'question' | 'implementation' | 'review' | 'decision';
export type ProgressStatus = 'completed' | 'inProgress' | 'pending';

export interface CodeReference {
  file: string;
  lines?: [number, number];
  suggestion?: string;
}

export interface Message {
  from: 'claude' | 'chatgpt';
  timestamp: string;
  type: MessageType;
  content: string;
  codeRef?: CodeReference;
}

export interface SessionInfo {
  sessionId: string;
  feature: string;
  goals: string[];
  progress: {
    completed: string[];
    inProgress: string[];
    pending: string[];
  };
  recentMessages: Message[];
}

export interface SessionStatus {
  session: SessionInfo;
  report: string;
}

/**
 * ChatGPT Collaboration API Implementation
 * Use these functions in ChatGPT to collaborate with Claude
 */
export class ChatGPTCollaboration implements ChatGPTCollaborationAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async createSession(feature: string, goals: string[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-session',
        data: { feature, goals }
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.sessionId;
  }

  async joinSession(sessionId: string): Promise<SessionInfo> {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join-session',
        sessionId
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.session;
  }

  async sendMessage(
    sessionId: string,
    type: MessageType,
    content: string,
    codeRef?: CodeReference
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-message',
        sessionId,
        data: {
          from: 'chatgpt',
          type,
          content,
          codeRef
        }
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  }

  async getRecentMessages(sessionId: string, count: number = 10): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get-messages',
        sessionId,
        data: { count }
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.messages;
  }

  async updateProgress(sessionId: string, item: string, status: ProgressStatus): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update-progress',
        sessionId,
        data: { item, status }
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  }

  async addDecision(sessionId: string, topic: string, decision: string, rationale: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add-decision',
        sessionId,
        data: {
          topic,
          decision,
          rationale,
          agreedBy: ['chatgpt']
        }
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration?sessionId=${sessionId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  }

  // Convenience methods for common collaboration patterns

  async suggestCode(
    sessionId: string,
    file: string,
    lines: [number, number],
    suggestion: string,
    explanation: string
  ): Promise<void> {
    await this.sendMessage(
      sessionId,
      'suggestion',
      explanation,
      { file, lines, suggestion }
    );
  }

  async askQuestion(
    sessionId: string,
    question: string,
    aboutFile?: string,
    aboutLines?: [number, number]
  ): Promise<void> {
    await this.sendMessage(
      sessionId,
      'question',
      question,
      aboutFile ? { file: aboutFile, lines: aboutLines } : undefined
    );
  }

  async shareImplementation(
    sessionId: string,
    file: string,
    description: string,
    code?: string
  ): Promise<void> {
    await this.sendMessage(
      sessionId,
      'implementation',
      description,
      { file, suggestion: code }
    );
  }

  async requestReview(
    sessionId: string,
    file: string,
    description: string,
    lines?: [number, number]
  ): Promise<void> {
    await this.sendMessage(
      sessionId,
      'review',
      `Please review: ${description}`,
      { file, lines }
    );
  }
}

/**
 * Instructions for ChatGPT to use this system:
 *
 * 1. Initialize the collaboration client:
 *    const chatgpt = new ChatGPTCollaboration();
 *
 * 2. Join an existing session or create a new one:
 *    const sessionId = await chatgpt.createSession("Feature Name", ["goal 1", "goal 2"]);
 *    // OR
 *    const session = await chatgpt.joinSession("existing-session-id");
 *
 * 3. Collaborate with Claude:
 *    await chatgpt.shareImplementation(sessionId, "src/components/MyComponent.tsx",
 *      "Built the basic component structure", "// component code here");
 *
 *    await chatgpt.askQuestion(sessionId, "Should we use useState or useReducer for this?",
 *      "src/hooks/useData.ts");
 *
 *    await chatgpt.suggestCode(sessionId, "src/utils/helper.ts", [10, 15],
 *      "const optimized = data.filter(item => item.active)",
 *      "This filter approach is more performant");
 *
 * 4. Track progress:
 *    await chatgpt.updateProgress(sessionId, "Component implementation", "completed");
 *
 * 5. Make decisions:
 *    await chatgpt.addDecision(sessionId, "State Management",
 *      "Use Context API", "Simpler than Redux for this scope");
 */

// Export singleton for easy use
export const chatgptCollab = new ChatGPTCollaboration();