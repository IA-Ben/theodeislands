/**
 * AI Pair Programming Session Manager
 * Coordinates real-time collaboration between Claude and ChatGPT
 */

export type Participant = 'claude' | 'chatgpt' | 'augment';

export interface AIPairSession {
  sessionId: string;
  feature: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
  currentFile?: string;
  goals: string[];
  progress: {
    completed: string[];
    inProgress: string[];
    pending: string[];
  };
  sharedContext: {
    decisions: Decision[];
    codeChanges: CodeChange[];
    discussion: Message[];
  };
}

export interface Message {
  from: Participant;
  timestamp: Date;
  type: 'suggestion' | 'question' | 'implementation' | 'review' | 'decision' | 'system';
  content: string;
  codeRef?: {
    file: string;
    lines?: [number, number];
    suggestion?: string;
  };
}

export interface CodeChange {
  file: string;
  author: Participant;
  timestamp: Date;
  description: string;
  diff: string;
  approved: boolean;
}

export interface Decision {
  topic: string;
  decision: string;
  rationale: string;
  agreedBy: Participant[];
  timestamp: Date;
}

export class AIPairSessionManager {
  private sessionsDir = 'src/ai-pair-programming/sessions';

  async createSession(feature: string, goals: string[]): Promise<AIPairSession> {
    const sessionId = `${feature.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const session: AIPairSession = {
      sessionId,
      feature,
      participants: ['claude', 'chatgpt', 'augment'],
      status: 'active',
      startTime: new Date(),
      goals,
      progress: {
        completed: [],
        inProgress: [],
        pending: goals
      },
      sharedContext: {
        decisions: [],
        codeChanges: [],
        discussion: []
      }
    };

    await this.saveSession(session);
    return session;
  }

  async addMessage(sessionId: string, message: Omit<Message, 'timestamp'>): Promise<void> {
    const session = await this.loadSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.sharedContext.discussion.push({
      ...message,
      timestamp: new Date()
    });

    await this.saveSession(session);
  }

  async addCodeChange(sessionId: string, change: Omit<CodeChange, 'timestamp' | 'approved'>): Promise<void> {
    const session = await this.loadSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.sharedContext.codeChanges.push({
      ...change,
      timestamp: new Date(),
      approved: false
    });

    await this.saveSession(session);
  }

  async addDecision(sessionId: string, decision: Omit<Decision, 'timestamp'>): Promise<void> {
    const session = await this.loadSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.sharedContext.decisions.push({
      ...decision,
      timestamp: new Date()
    });

    await this.saveSession(session);
  }

  async updateProgress(sessionId: string, item: string, newStatus: 'completed' | 'inProgress' | 'pending'): Promise<void> {
    const session = await this.loadSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Ensure progress object is properly initialized
    if (!session.progress) {
      session.progress = { completed: [], inProgress: [], pending: [] };
    }
    if (!session.progress.completed) session.progress.completed = [];
    if (!session.progress.inProgress) session.progress.inProgress = [];
    if (!session.progress.pending) session.progress.pending = [];

    // Remove from all arrays
    session.progress.completed = session.progress.completed.filter(i => i !== item);
    session.progress.inProgress = session.progress.inProgress.filter(i => i !== item);
    session.progress.pending = session.progress.pending.filter(i => i !== item);

    // Add to appropriate array
    session.progress[newStatus].push(item);

    await this.saveSession(session);
  }

  async loadSession(sessionId: string): Promise<AIPairSession | null> {
    try {
      const fs = await import('fs/promises');
      const path = `${this.sessionsDir}/${sessionId}.json`;
      const data = await fs.readFile(path, 'utf-8');
      return JSON.parse(data, (key, value) => {
        if (key.includes('Time') || key === 'timestamp') {
          return new Date(value);
        }
        return value;
      }) as AIPairSession;
    } catch {
      return null;
    }
  }

  private async saveSession(session: AIPairSession): Promise<void> {
    const fs = await import('fs/promises');
    const { dirname } = await import('path');

    const sessionFile = `${this.sessionsDir}/${session.sessionId}.json`;
    const sessionDir = dirname(sessionFile);
    await fs.mkdir(sessionDir, { recursive: true });

    await fs.writeFile(
      sessionFile,
      JSON.stringify(session, null, 2)
    );
  }

  async getActiveSession(): Promise<AIPairSession | null> {
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(this.sessionsDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const session = await this.loadSession(file.replace('.json', ''));
          if (session?.status === 'active') {
            return session;
          }
        }
      }
    } catch {
      // Directory might not exist yet
    }

    return null;
  }

  async generateSessionReport(sessionId: string): Promise<string> {
    const session = await this.loadSession(sessionId);
    if (!session) return 'Session not found';

    const report = `
# AI Pair Programming Session Report
**Feature**: ${session.feature}
**Session ID**: ${session.sessionId}
**Duration**: ${session.startTime.toISOString()} - ${session.status === 'completed' ? 'Completed' : 'Ongoing'}

## Progress
✅ **Completed**: ${session.progress.completed.join(', ') || 'None'}
🔄 **In Progress**: ${session.progress.inProgress.join(', ') || 'None'}
⏳ **Pending**: ${session.progress.pending.join(', ') || 'None'}

## Key Decisions
${session.sharedContext.decisions.map(d => `- **${d.topic}**: ${d.decision} (${d.rationale})`).join('\n')}

## Code Changes
${session.sharedContext.codeChanges.map(c => `- **${c.file}** by ${c.author}: ${c.description}`).join('\n')}

## Discussion Summary
${session.sharedContext.discussion.length} messages exchanged between Claude and ChatGPT.

## Next Steps
${session.progress.pending.map(p => `- [ ] ${p}`).join('\n')}
`;

    return report;
  }
}

// Export singleton instance
export const aiPairSession = new AIPairSessionManager();
