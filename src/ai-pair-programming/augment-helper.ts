/**
 * Augment Code Helper
 * Provides Augment-specific functions for pair programming collaboration
 */

import { aiPairSession } from './session-manager';
import { aiMessageBus } from './message-bus';

export class AugmentCollaboration {
  private currentSessionId: string | null = null;

  async joinSession(sessionId: string): Promise<void> {
    this.currentSessionId = sessionId;
    await aiMessageBus.initializeForSession(sessionId);

    // Announce joining
    await this.shareProgress(
      `🎯 Augment Code joining the collaboration! Ready to help with code generation, optimization, and testing.`
    );
  }

  async shareProgress(description: string, file?: string): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    await aiMessageBus.sendMessage(
      'augment',
      'implementation',
      `📝 ${description}`,
      file ? { file } : undefined
    );
  }

  async shareImplementation(file: string, description: string, code?: string): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    await aiMessageBus.shareImplementation(
      'augment',
      file,
      description,
      code
    );
  }

  async askQuestion(question: string, aboutFile?: string): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    await aiMessageBus.askQuestion(
      'augment',
      question,
      aboutFile
    );
  }

  async suggestCode(
    file: string,
    lines: [number, number],
    suggestion: string,
    explanation: string
  ): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    await aiMessageBus.sendCodeSuggestion(
      'augment',
      file,
      lines,
      suggestion,
      explanation
    );
  }

  async updateProgress(item: string, status: 'completed' | 'inProgress' | 'pending'): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    await aiPairSession.updateProgress(this.currentSessionId, item, status);
  }
}

// Singleton instance
export const augmentCollab = new AugmentCollaboration();
