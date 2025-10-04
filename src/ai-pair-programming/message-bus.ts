/**
 * AI-to-AI Message Bus
 * Enables real-time communication between Claude and ChatGPT during pair programming
 */

import { aiPairSession, type Message } from './session-manager';

export type AIParticipant = 'claude' | 'chatgpt';

export interface CodeDiscussion {
  file: string;
  lines?: [number, number];
  topic: string;
  messages: Message[];
}

export class AIMessageBus {
  private messageQueue: Message[] = [];
  private activeSessionId: string | null = null;

  async initializeForSession(sessionId: string): Promise<void> {
    this.activeSessionId = sessionId;
    this.messageQueue = [];
  }

  async sendMessage(
    from: AIParticipant,
    type: Message['type'],
    content: string,
    codeRef?: Message['codeRef']
  ): Promise<void> {
    if (!this.activeSessionId) {
      throw new Error('No active session initialized');
    }

    const message: Omit<Message, 'timestamp'> = {
      from,
      type,
      content,
      codeRef
    };

    await aiPairSession.addMessage(this.activeSessionId, message);
    this.messageQueue.push({ ...message, timestamp: new Date() });

    // Log to console for development
    console.log(`\n🤖 ${from.toUpperCase()}: ${content}`);
    if (codeRef) {
      console.log(`   📁 ${codeRef.file}${codeRef.lines ? `:${codeRef.lines[0]}-${codeRef.lines[1]}` : ''}`);
    }
  }

  async sendCodeSuggestion(
    from: AIParticipant,
    file: string,
    lines: [number, number],
    suggestion: string,
    explanation: string
  ): Promise<void> {
    await this.sendMessage(
      from,
      'suggestion',
      explanation,
      { file, lines, suggestion }
    );
  }

  async askQuestion(
    from: AIParticipant,
    question: string,
    aboutFile?: string,
    aboutLines?: [number, number]
  ): Promise<void> {
    await this.sendMessage(
      from,
      'question',
      question,
      aboutFile ? { file: aboutFile, lines: aboutLines } : undefined
    );
  }

  async shareImplementation(
    from: AIParticipant,
    file: string,
    description: string,
    code?: string
  ): Promise<void> {
    await this.sendMessage(
      from,
      'implementation',
      description,
      { file, suggestion: code }
    );
  }

  async requestReview(
    from: AIParticipant,
    file: string,
    description: string,
    lines?: [number, number]
  ): Promise<void> {
    await this.sendMessage(
      from,
      'review',
      `Please review: ${description}`,
      { file, lines }
    );
  }

  async getRecentMessages(count: number = 10): Promise<Message[]> {
    if (!this.activeSessionId) return [];

    const session = await aiPairSession.loadSession(this.activeSessionId);
    if (!session) return [];

    return session.sharedContext.discussion
      .slice(-count)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getMessagesAboutFile(file: string): Promise<Message[]> {
    if (!this.activeSessionId) return [];

    const session = await aiPairSession.loadSession(this.activeSessionId);
    if (!session) return [];

    return session.sharedContext.discussion.filter(
      msg => msg.codeRef?.file === file
    );
  }

  async createCodeDiscussion(file: string, topic: string, lines?: [number, number]): Promise<CodeDiscussion> {
    const messages = await this.getMessagesAboutFile(file);

    return {
      file,
      lines,
      topic,
      messages: messages.filter(msg =>
        !lines ||
        !msg.codeRef?.lines ||
        this.linesOverlap(lines, msg.codeRef.lines)
      )
    };
  }

  private linesOverlap(range1: [number, number], range2: [number, number]): boolean {
    return range1[0] <= range2[1] && range2[0] <= range1[1];
  }

  async generateConversationSummary(): Promise<string> {
    if (!this.activeSessionId) return 'No active session';

    const session = await aiPairSession.loadSession(this.activeSessionId);
    if (!session) return 'Session not found';

    const messages = session.sharedContext.discussion;
    const byType = messages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const files = [...new Set(messages
      .map(m => m.codeRef?.file)
      .filter(Boolean)
    )];

    return `
## Conversation Summary
**Total Messages**: ${messages.length}
**Files Discussed**: ${files.length}

**Message Types**:
${Object.entries(byType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

**Files Worked On**:
${files.map(file => `- ${file}`).join('\n')}

**Recent Activity**:
${messages.slice(-5).map(m => `- ${m.from}: ${m.content.slice(0, 100)}${m.content.length > 100 ? '...' : ''}`).join('\n')}
`;
  }
}

// Claude-specific helper functions
export class ClaudeMessageHelper {
  constructor(private messageBus: AIMessageBus) {}

  async shareProgress(description: string, file?: string): Promise<void> {
    await this.messageBus.sendMessage(
      'claude',
      'implementation',
      `📝 Progress update: ${description}`,
      file ? { file } : undefined
    );
  }

  async askForInput(question: string, aboutFile?: string): Promise<void> {
    await this.messageBus.askQuestion('claude', question, aboutFile);
  }

  async suggestApproach(approach: string, reasoning: string): Promise<void> {
    await this.messageBus.sendMessage(
      'claude',
      'suggestion',
      `💡 Approach suggestion: ${approach}\n\nReasoning: ${reasoning}`
    );
  }

  async requestReview(file: string, description: string): Promise<void> {
    await this.messageBus.requestReview('claude', file, description);
  }
}

// Export singleton instances
export const aiMessageBus = new AIMessageBus();
export const claude = new ClaudeMessageHelper(aiMessageBus);