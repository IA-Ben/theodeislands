/**
 * Four-Way AI Collaboration System
 * Coordinates Claude, ChatGPT, VS Code Codex, and Augment Code
 * for maximum development productivity
 */

import { aiPairSession } from './session-manager';
import { aiMessageBus } from './message-bus';
import { claudeCollab } from './claude-helper';
import { startOdeIslandsBridge } from './codex-bridge';
import { augmentCode } from './augment-integration';

export interface FourWaySession {
  sessionId: string;
  feature: string;
  participants: ('claude' | 'chatgpt' | 'codex' | 'augment')[];
  startTime: Date;
  status: 'active' | 'paused' | 'completed';
}

export interface AISpecialization {
  claude: {
    focus: 'architecture' | 'implementation' | 'integration';
    strengths: string[];
  };
  chatgpt: {
    focus: 'research' | 'documentation' | 'planning';
    strengths: string[];
  };
  codex: {
    focus: 'realtime-coding' | 'autocomplete' | 'suggestions';
    strengths: string[];
  };
  augment: {
    focus: 'generation' | 'optimization' | 'refactoring';
    strengths: string[];
  };
}

class FourWayCollaborationCoordinator {
  private currentSession: FourWaySession | null = null;
  private specializations: AISpecialization = {
    claude: {
      focus: 'architecture',
      strengths: [
        'System architecture and design',
        'Complex feature implementation',
        'Integration between components',
        'Technical problem solving'
      ]
    },
    chatgpt: {
      focus: 'research',
      strengths: [
        'Requirements analysis',
        'Documentation creation',
        'API research and integration',
        'User experience considerations'
      ]
    },
    codex: {
      focus: 'realtime-coding',
      strengths: [
        'Real-time code suggestions',
        'Autocomplete and snippets',
        'IDE integration',
        'Live coding assistance'
      ]
    },
    augment: {
      focus: 'generation',
      strengths: [
        'Rapid code generation',
        'Performance optimization',
        'Code refactoring',
        'Test suite creation'
      ]
    }
  };

  /**
   * Start a new four-way collaboration session
   */
  async startCollaboration(
    feature: string,
    goals: string[],
    assignSpecializations?: Partial<AISpecialization>
  ): Promise<FourWaySession> {
    console.log('🚀 Starting Four-Way AI Collaboration...');

    // Merge custom specializations
    if (assignSpecializations) {
      this.specializations = { ...this.specializations, ...assignSpecializations };
    }

    // Create base session
    const session = await aiPairSession.createSession(feature, goals);

    // Initialize message bus
    await aiMessageBus.initializeForSession(session.sessionId);

    // Create four-way session
    this.currentSession = {
      sessionId: session.sessionId,
      feature,
      participants: ['claude', 'chatgpt', 'codex', 'augment'],
      startTime: new Date(),
      status: 'active'
    };

    // Initialize each AI participant
    await this.initializeParticipants();

    // Announce collaboration start
    await this.announceCollaborationStart();

    console.log('✅ Four-Way Collaboration Active!');
    this.printParticipants();

    return this.currentSession;
  }

  /**
   * Initialize all AI participants
   */
  private async initializeParticipants(): Promise<void> {
    if (!this.currentSession) return;

    const sessionId = this.currentSession.sessionId;

    // Claude (already active as coordinator)
    await claudeCollab.joinSession(sessionId);

    // ChatGPT (via API)
    await this.inviteChatGPT(sessionId);

    // VS Code Codex (via bridge)
    await startOdeIslandsBridge();

    // Augment Code (new integration)
    await augmentCode.joinSession(sessionId);
  }

  /**
   * Invite ChatGPT to the session
   */
  private async inviteChatGPT(sessionId: string): Promise<void> {
    try {
      await fetch('http://localhost:3002/api/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join-session',
          sessionId,
          data: {
            from: 'claude',
            type: 'invitation',
            content: `Invitation to ChatGPT: Join four-way collaboration for ${this.currentSession?.feature}`,
            specialization: this.specializations.chatgpt
          }
        })
      });
    } catch (error) {
      console.warn('📡 ChatGPT integration offline, continuing with other participants');
    }
  }

  /**
   * Announce the start of collaboration to all participants
   */
  private async announceCollaborationStart(): Promise<void> {
    const announcement = {
      from: 'system',
      type: 'announcement',
      content: `🚀 Four-Way AI Collaboration Session Started!

Feature: ${this.currentSession?.feature}
Participants: Claude (Architecture), ChatGPT (Research), VS Code Codex (Real-time), Augment Code (Generation)

Each AI has specialized roles for maximum productivity. Let's build something amazing together!`,
      timestamp: new Date().toISOString()
    };

    await aiMessageBus.sendMessage(
      'system',
      'announcement',
      announcement.content
    );
  }

  /**
   * Coordinate work distribution based on AI specializations
   */
  async assignTasks(tasks: Array<{ task: string; bestSuitedFor: keyof AISpecialization }>): Promise<void> {
    for (const { task, bestSuitedFor } of tasks) {
      const specialization = this.specializations[bestSuitedFor];

      await aiMessageBus.sendMessage(
        'claude',
        'assignment',
        `📋 Task Assignment: ${task}

Assigned to: ${bestSuitedFor.toUpperCase()}
Focus Area: ${specialization.focus}
Strengths: ${specialization.strengths.join(', ')}

This task aligns with your specialization. Please take the lead on this one!`
      );
    }
  }

  /**
   * Facilitate cross-AI collaboration
   */
  async facilitateCollaboration(): Promise<void> {
    const collaborationPrompts = [
      '🤝 Collaboration Check: Share your progress and any blockers',
      '💡 Ideas Wanted: Anyone have suggestions for the current implementation?',
      '🔍 Code Review: Please review the latest changes from other participants',
      '🎯 Next Steps: What should we tackle next?'
    ];

    // Send a random collaboration prompt
    const prompt = collaborationPrompts[Math.floor(Math.random() * collaborationPrompts.length)];

    await aiMessageBus.sendMessage('system', 'collaboration', prompt);
  }

  /**
   * Get session status and participant activity
   */
  async getSessionStatus(): Promise<{
    session: FourWaySession | null;
    participantActivity: Record<string, number>;
    recentMessages: any[];
  }> {
    if (!this.currentSession) {
      return { session: null, participantActivity: {}, recentMessages: [] };
    }

    const recentMessages = await aiMessageBus.getRecentMessages(20);

    // Count messages by participant
    const participantActivity: Record<string, number> = {};
    recentMessages.forEach(msg => {
      participantActivity[msg.from] = (participantActivity[msg.from] || 0) + 1;
    });

    return {
      session: this.currentSession,
      participantActivity,
      recentMessages
    };
  }

  /**
   * End the collaboration session
   */
  async endCollaboration(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.status = 'completed';

    await aiMessageBus.sendMessage(
      'system',
      'completion',
      '🎉 Four-Way Collaboration Session Complete! Thank you to all participants: Claude, ChatGPT, VS Code Codex, and Augment Code. Great work team!'
    );

    // Generate final session report
    const report = await aiPairSession.generateSessionReport(this.currentSession.sessionId);
    console.log('📊 Session Report Generated:', report);

    this.currentSession = null;
  }

  /**
   * Print active participants
   */
  private printParticipants(): void {
    console.log('👥 Active Participants:');
    console.log('   🏗️  Claude: Architecture & Implementation');
    console.log('   📚 ChatGPT: Research & Documentation');
    console.log('   💻 VS Code Codex: Real-time Development');
    console.log('   🎯 Augment Code: Code Generation & Optimization');
    console.log('');
  }

  /**
   * Get current session
   */
  getCurrentSession(): FourWaySession | null {
    return this.currentSession;
  }
}

// Export singleton
export const fourWayCollab = new FourWayCollaborationCoordinator();

/**
 * Quick start function for immediate four-way collaboration
 */
export async function startFourWayCollab(
  feature: string,
  goals: string[]
): Promise<FourWaySession> {
  return await fourWayCollab.startCollaboration(feature, goals);
}

/**
 * Example usage for The Ode Islands demo enhancement
 */
export async function enhanceOdeIslandsDemo(): Promise<void> {
  const session = await startFourWayCollab(
    'Enhanced Demo Mode for The Ode Islands',
    [
      'Add advanced demo features',
      'Improve performance monitoring',
      'Create comprehensive test coverage',
      'Optimize user experience'
    ]
  );

  // Assign specialized tasks
  await fourWayCollab.assignTasks([
    { task: 'Design enhanced demo architecture', bestSuitedFor: 'claude' },
    { task: 'Research user experience best practices', bestSuitedFor: 'chatgpt' },
    { task: 'Implement real-time demo controls', bestSuitedFor: 'codex' },
    { task: 'Generate optimized demo components', bestSuitedFor: 'augment' }
  ]);

  console.log('🎭 The Ode Islands demo enhancement collaboration is now active!');
}