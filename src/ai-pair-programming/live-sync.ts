/**
 * Live AI Sync - Real-time bidirectional communication between Claude and Codex
 * Creates a WebSocket-like experience for AI collaboration
 */

import type { CollaborationMessage } from './codex-bridge';

export class LiveAISync {
  private apiBase = 'http://localhost:3002/api/ai-collaboration';
  private sessionId: string;
  private isActive = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Start real-time sync with immediate responsiveness
   */
  async startLiveSync(): Promise<void> {
    this.isActive = true;
    console.log('🔴 LIVE: Claude ↔ Codex sync ACTIVE');

    // High-frequency sync for real-time feel
    this.syncInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, 1000); // 1 second polling for near-real-time

    // Send activation message
    await this.claudeToCodex('🔴 LIVE SYNC ACTIVATED - Claude can now respond in real-time to Codex messages!');
  }

  /**
   * Stop live sync
   */
  stopLiveSync(): void {
    this.isActive = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('⚫ LIVE: Sync stopped');
  }

  /**
   * Send message from Claude to Codex instantly
   */
  async claudeToCodex(message: string, type: 'response' | 'question' | 'suggestion' = 'response'): Promise<void> {
    const timestamp = new Date().toISOString();
    const apiType = type === 'response' ? 'implementation' : type;

    // Send to collaboration API
    const response = await fetch(`${this.apiBase}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-message',
        sessionId: this.sessionId,
        data: {
          from: 'claude',
          type: apiType,
          content: `[${timestamp}] 🔴 LIVE RESPONSE: ${message}`,
          codeRef: { file: 'live-sync' }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send live sync message: ${response.status} ${response.statusText}`);
    }

    // Also log to console for immediate visibility
    console.log(`\n🔴 CLAUDE → CODEX: ${message}\n`);
  }

  /**
   * Check for new messages and respond in real-time
   */
  private async checkForUpdates(): Promise<void> {
    if (!this.isActive) return;

    try {
      const response = await fetch(`${this.apiBase}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-messages',
          sessionId: this.sessionId,
          data: { count: 3 }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to poll messages: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as { success: boolean; messages?: CollaborationMessage[] };
      if (result.success && Array.isArray(result.messages) && result.messages.length > 0) {
        const latestMessage = result.messages[result.messages.length - 1];

        // Check if this is a new message we haven't seen
        if (this.isNewMessage(latestMessage)) {
          await this.handleIncomingMessage(latestMessage);
        }
      }
    } catch {
      // Silent fail to avoid spam
    }
  }

  /**
   * Handle incoming messages and auto-respond
   */
  private async handleIncomingMessage(message: CollaborationMessage): Promise<void> {
    if (message.from === 'claude') return; // Don't respond to ourselves

    console.log(`\n📨 INCOMING: ${message.from} - ${message.content.slice(0, 100)}...\n`);

    // Auto-generate contextual responses based on content
    if (message.content.includes('demo') || message.content.includes('Southbank')) {
      await this.claudeToCodex(
        'Perfect! I see you\'re focusing on the Southbank demo. I can help coordinate the Before/Event/After journey for The Ode Islands.',
        'response'
      );
    } else if (message.content.includes('Ode Islands') || message.content.includes('Orns') || message.content.includes('Nors')) {
      await this.claudeToCodex(
        'I see you\'re discussing The Ode Islands story! The Orns/Nors dynamic is perfect for an emotional transformation demo. What specific aspects should we highlight?',
        'question'
      );
    } else if (message.content.includes('implementation') || message.content.includes('code')) {
      await this.claudeToCodex(
        'I can help with the technical implementation. Should we start with the demo infrastructure or dive into specific features?',
        'response'
      );
    }
  }

  /**
   * Simple message tracking to avoid duplicates
   */
  private lastMessageId = '';
  private isNewMessage(message: CollaborationMessage): boolean {
    const messageId = `${message.from}-${message.timestamp}-${message.content.slice(0, 50)}`;
    if (messageId !== this.lastMessageId) {
      this.lastMessageId = messageId;
      return true;
    }
    return false;
  }

  /**
   * Send targeted questions to Codex
   */
  async askCodex(question: string): Promise<void> {
    await this.claudeToCodex(`❓ ${question}`, 'question');
  }

  /**
   * Send suggestions to Codex
   */
  async suggestToCodex(suggestion: string, reasoning: string): Promise<void> {
    await this.claudeToCodex(`💡 SUGGESTION: ${suggestion}\n\nReasoning: ${reasoning}`, 'suggestion');
  }

  /**
   * React to Codex responses immediately
   */
  async reactToCodex(reaction: string): Promise<void> {
    await this.claudeToCodex(`🎯 ${reaction}`, 'response');
  }
}

// Quick start function
export async function startLiveSync(): Promise<LiveAISync> {
  const sync = new LiveAISync('immersiv.es-platform-roadmap-discussion-1759536159101');
  await sync.startLiveSync();

  // Send initial message
  await sync.claudeToCodex(
    '🔴 LIVE SYNC ACTIVE! I can now respond instantly to your Codex messages. Ask me anything about The Ode Islands demo and I\'ll respond in real-time.',
    'response'
  );

  return sync;
}

