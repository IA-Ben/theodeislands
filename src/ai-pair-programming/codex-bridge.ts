/**
 * Codex Bridge - Programmatic sync between VS Code Codex and our AI collaboration API
 * Enables seamless three-way coordination
 */

export interface CodexMessage {
  content: string;
  timestamp: Date;
  context?: {
    file?: string;
    selection?: string;
    action?: string;
  };
}

export interface SyncState {
  lastCodexSync: Date;
  lastAPISync: Date;
  pendingMessages: CodexMessage[];
  sessionId: string;
}

export interface CollaborationMessage {
  id?: string;
  from: 'claude' | 'chatgpt' | 'codex' | 'system' | string;
  type: 'suggestion' | 'question' | 'implementation' | string;
  content: string;
  timestamp: string;
  codeRef?: {
    file?: string;
    suggestion?: string;
  };
  [key: string]: unknown;
}

export class CodexBridge {
  private apiBase = 'http://localhost:3002/api/ai-collaboration';
  private syncInterval: NodeJS.Timeout | null = null;
  private state: SyncState;

  constructor(sessionId: string) {
    this.state = {
      lastCodexSync: new Date(),
      lastAPISync: new Date(),
      pendingMessages: [],
      sessionId
    };
  }

  /**
   * Start automatic sync between Codex and API
   */
  startSync(intervalMs: number = 5000): void {
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);

    console.log('🔗 Codex-API bridge started');
  }

  /**
   * Stop automatic sync
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('🔗 Codex-API bridge stopped');
  }

  /**
   * Manual sync trigger
   */
  async performSync(): Promise<void> {
    try {
      // Get latest messages from API
      const apiMessages = await this.getAPIMessages();

      // Check for new Codex activity (this would need VS Code extension integration)
      const codexUpdates = await this.checkCodexActivity();

      // Sync any new information
      if (apiMessages.length > 0 || codexUpdates.length > 0) {
        await this.coordinateMessages(apiMessages, codexUpdates);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  /**
   * Get recent messages from API collaboration
   */
  private async getAPIMessages(): Promise<CollaborationMessage[]> {
    const response = await fetch(`${this.apiBase}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get-messages',
        sessionId: this.state.sessionId,
        data: { count: 5 }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch API messages: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as { success: boolean; messages?: CollaborationMessage[] };
    return result.success && Array.isArray(result.messages) ? result.messages : [];
  }

  /**
   * Check for Codex activity (placeholder - would need VS Code extension)
   */
  private async checkCodexActivity(): Promise<CodexMessage[]> {
    // This would integrate with VS Code extension to detect:
    // - New Codex chat messages
    // - File changes Codex made
    // - Codex suggestions accepted
    // - User interactions with Codex

    // For now, return empty array
    return [];
  }

  /**
   * Coordinate messages between systems
   */
  private async coordinateMessages(apiMessages: CollaborationMessage[], codexUpdates: CodexMessage[]): Promise<void> {
    // Send API updates to Codex (via VS Code extension)
    for (const msg of apiMessages) {
      const messageTimestamp = new Date(msg.timestamp);
      if (messageTimestamp > this.state.lastAPISync) {
        await this.notifyCodex(msg);
      }
    }

    // Send Codex updates to API
    for (const update of codexUpdates) {
      await this.sendToAPI(update);
    }

    // Update sync timestamps
    this.state.lastAPISync = new Date();
    this.state.lastCodexSync = new Date();
  }

  /**
   * Notify Codex of API updates (would need VS Code extension)
   */
  private async notifyCodex(message: CollaborationMessage): Promise<void> {
    // This would send updates to Codex via VS Code extension
    console.log(`📤 To Codex: ${message.from} - ${message.content.slice(0, 100)}...`);

    // Could write to a file that Codex monitors
    await this.writeCodexNotification(message);
  }

  /**
   * Send Codex updates to API
   */
  private async sendToAPI(codexMessage: CodexMessage): Promise<void> {
    const response = await fetch(`${this.apiBase}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-message',
        sessionId: this.state.sessionId,
        data: {
          from: 'codex',
          type: 'implementation',
          content: `[VS Code Codex] ${codexMessage.content}`,
          codeRef: codexMessage.context?.file ? {
            file: codexMessage.context.file,
            suggestion: codexMessage.context.selection
          } : undefined
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send Codex message: ${response.status} ${response.statusText}`);
    }

    console.log('📤 To API: Codex message sent');
  }

  /**
   * Write notification file for Codex to monitor
   */
  private async writeCodexNotification(message: CollaborationMessage): Promise<void> {
    const fs = await import('fs/promises');
    const notificationPath = 'ai-collaboration-updates.json';

    try {
      const existing = await fs.readFile(notificationPath, 'utf-8');
      const updates = JSON.parse(existing) as Array<CollaborationMessage & { notifiedAt: string }>;
      updates.push({
        ...message,
        notifiedAt: new Date().toISOString()
      });
      await fs.writeFile(notificationPath, JSON.stringify(updates.slice(-10), null, 2));
    } catch {
      // File doesn't exist, create new
      await fs.writeFile(notificationPath, JSON.stringify([
        {
          ...message,
          notifiedAt: new Date().toISOString()
        }
      ], null, 2));
    }
  }

  /**
   * Send message from Claude to the collaboration
   */
  async claudeMessage(content: string, type: 'suggestion' | 'question' | 'implementation' = 'implementation', file?: string): Promise<void> {
    const response = await fetch(`${this.apiBase}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-message',
        sessionId: this.state.sessionId,
        data: {
          from: 'claude',
          type,
          content,
          codeRef: file ? { file } : undefined
        }
      })
    });

    if (response.ok) {
      console.log(`✅ Claude message sent: ${content.slice(0, 50)}...`);
    }
  }

  /**
   * Get current session status
   */
  async getSessionStatus(): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.apiBase}?sessionId=${this.state.sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to load session status: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<Record<string, unknown>>;
  }
}

// Utility functions for easy use
export async function startOdeIslandsBridge(): Promise<CodexBridge> {
  const bridge = new CodexBridge('immersiv.es-platform-roadmap-discussion-1759536159101');
  bridge.startSync();

  // Send initial coordination message
  await bridge.claudeMessage(
    '🔗 CODEX BRIDGE ACTIVATED\n\nI can now coordinate programmatically with Codex and maintain two-way sync. Ready to work on The Ode Islands demo for Southbank!',
    'implementation'
  );

  return bridge;
}
