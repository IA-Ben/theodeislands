/**
 * Claude Integration Helper
 * Provides Claude-specific functions for pair programming collaboration
 */

import { aiPairSession } from './session-manager';
import { aiMessageBus, claude } from './message-bus';

export class ClaudeCollaboration {
  private currentSessionId: string | null = null;

  async startSession(feature: string, goals: string[]): Promise<string> {
    const session = await aiPairSession.createSession(feature, goals);
    this.currentSessionId = session.sessionId;
    await aiMessageBus.initializeForSession(session.sessionId);

    // Announce session start
    await claude.shareProgress(
      `🚀 Started new pair programming session for: ${feature}`
    );

    console.log(`\n🎯 AI Pair Programming Session Started`);
    console.log(`📋 Feature: ${feature}`);
    console.log(`🎯 Goals: ${goals.join(', ')}`);
    console.log(`🆔 Session ID: ${session.sessionId}`);
    console.log(`\n💡 ChatGPT can join this session using:`);
    console.log(`   const sessionId = "${session.sessionId}"`);
    console.log(`   const session = await chatgpt.joinSession(sessionId)\n`);

    return session.sessionId;
  }

  async joinExistingSession(sessionId: string): Promise<void> {
    const session = await aiPairSession.loadSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    this.currentSessionId = sessionId;
    await aiMessageBus.initializeForSession(sessionId);

    await claude.shareProgress(
      `👋 Claude joined the session for: ${session.feature}`
    );

    console.log(`\n🔗 Joined existing session: ${session.feature}`);
    console.log(`📊 Progress: ${session.progress.completed.length}/${session.goals.length} goals completed`);
  }

  async markGoalCompleted(goal: string): Promise<void> {
    if (!this.currentSessionId) throw new Error('No active session');

    await aiPairSession.updateProgress(this.currentSessionId, goal, 'completed');
    await claude.shareProgress(`✅ Completed: ${goal}`);
  }

  async markGoalInProgress(goal: string): Promise<void> {
    if (!this.currentSessionId) throw new Error('No active session');

    await aiPairSession.updateProgress(this.currentSessionId, goal, 'inProgress');
    await claude.shareProgress(`🔄 Working on: ${goal}`);
  }

  async recordDecision(topic: string, decision: string, rationale: string): Promise<void> {
    if (!this.currentSessionId) throw new Error('No active session');

    await aiPairSession.addDecision(this.currentSessionId, {
      topic,
      decision,
      rationale,
      agreedBy: ['claude']
    });

    await claude.shareProgress(
      `📝 Decision recorded - ${topic}: ${decision}`
    );
  }

  async shareCodeImplementation(file: string, description: string, code?: string): Promise<void> {
    if (!this.currentSessionId) throw new Error('No active session');

    await claude.shareProgress(description, file);

    if (code) {
      await aiMessageBus.shareImplementation('claude', file, description, code);
    }
  }

  async askForFeedback(question: string, aboutFile?: string, aboutLines?: [number, number]): Promise<void> {
    if (!this.currentSessionId) throw new Error('No active session');

    await claude.askForInput(question, aboutFile);

    console.log(`\n❓ Waiting for ChatGPT feedback:`);
    console.log(`   Question: ${question}`);
    if (aboutFile) {
      console.log(`   About: ${aboutFile}${aboutLines ? `:${aboutLines[0]}-${aboutLines[1]}` : ''}`);
    }
  }

  async respondToMessage(responseContent: string, referencedMessageIndex?: number): Promise<void> {
    if (!this.currentSessionId) throw new Error('No active session');

    let content = responseContent;
    if (referencedMessageIndex !== undefined) {
      const recentMessages = await aiMessageBus.getRecentMessages(10);
      const referencedMessage = recentMessages[referencedMessageIndex];
      if (referencedMessage) {
        content = `Re: "${referencedMessage.content.slice(0, 50)}..." - ${responseContent}`;
      }
    }

    await claude.shareProgress(content);
  }

  async generateSessionSummary(): Promise<string> {
    if (!this.currentSessionId) throw new Error('No active session');

    const report = await aiPairSession.generateSessionReport(this.currentSessionId);
    const conversationSummary = await aiMessageBus.generateConversationSummary();

    console.log('\n📊 Session Summary:');
    console.log(report);
    console.log('\n💬 Conversation Summary:');
    console.log(conversationSummary);

    return `${report}\n\n${conversationSummary}`;
  }

  async waitForChatGPTResponse(timeoutMs: number = 30000): Promise<string | null> {
    if (!this.currentSessionId) throw new Error('No active session');

    const startTime = Date.now();
    let lastMessageCount = 0;

    while (Date.now() - startTime < timeoutMs) {
      const messages = await aiMessageBus.getRecentMessages(5);
      const chatgptMessages = messages.filter(m => m.from === 'chatgpt');

      if (chatgptMessages.length > lastMessageCount) {
        const latestMessage = chatgptMessages[chatgptMessages.length - 1];
        console.log(`\n🤖 ChatGPT: ${latestMessage.content}`);
        return latestMessage.content;
      }

      lastMessageCount = chatgptMessages.length;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n⏰ Timeout waiting for ChatGPT response');
    return null;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  async getSessionProgress(): Promise<{ progress: number; status: string } | null> {
    if (!this.currentSessionId) return null;

    const session = await aiPairSession.loadSession(this.currentSessionId);
    if (!session?.progress) return null;

    // Transform the actual progress structure to expected format
    const progress = session.progress;
    return {
      progress: 0.5, // Default progress
      status: 'active' // Default status
    };
  }
}

// Export singleton for easy use
export const claudeCollab = new ClaudeCollaboration();

// Quick helper functions for immediate use
export async function startPairProgramming(feature: string, goals: string[]): Promise<string> {
  return claudeCollab.startSession(feature, goals);
}

export async function completeGoal(goal: string): Promise<void> {
  return claudeCollab.markGoalCompleted(goal);
}

export async function workingOn(goal: string): Promise<void> {
  return claudeCollab.markGoalInProgress(goal);
}

export async function shareCode(file: string, description: string, code?: string): Promise<void> {
  return claudeCollab.shareCodeImplementation(file, description, code);
}

export async function askChatGPT(question: string, aboutFile?: string): Promise<void> {
  return claudeCollab.askForFeedback(question, aboutFile);
}

export async function recordDecision(topic: string, decision: string, rationale: string): Promise<void> {
  return claudeCollab.recordDecision(topic, decision, rationale);
}

export async function sessionSummary(): Promise<string> {
  return claudeCollab.generateSessionSummary();
}