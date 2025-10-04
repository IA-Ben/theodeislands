'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CollaborationMessage {
  id: string;
  from: 'claude' | 'chatgpt' | 'codex' | 'augment' | 'system';
  type: 'suggestion' | 'question' | 'implementation' | 'review' | 'announcement' | 'assignment';
  content: string;
  timestamp: string;
  codeRef?: {
    file?: string;
    suggestion?: string;
  };
  status?: 'thinking' | 'typing' | 'completed';
}

interface SessionStatus {
  sessionId: string | null;
  feature: string;
  participants: string[];
  startTime: string;
  messageCount: number;
}

const AI_PROFILES = {
  claude: {
    name: 'Claude',
    role: 'Architecture & Implementation',
    emoji: '🏗️',
    color: 'bg-blue-500',
    textColor: 'text-blue-100',
    description: 'System design, complex features, integration'
  },
  chatgpt: {
    name: 'ChatGPT',
    role: 'Research & Documentation',
    emoji: '📚',
    color: 'bg-green-500',
    textColor: 'text-green-100',
    description: 'Requirements analysis, API research, UX'
  },
  codex: {
    name: 'VS Code Codex',
    role: 'Real-time Development',
    emoji: '💻',
    color: 'bg-purple-500',
    textColor: 'text-purple-100',
    description: 'Live coding, autocomplete, IDE integration'
  },
  augment: {
    name: 'Augment Code',
    role: 'Generation & Optimization',
    emoji: '🎯',
    color: 'bg-orange-500',
    textColor: 'text-orange-100',
    description: 'Rapid code generation, refactoring, performance'
  },
  system: {
    name: 'System',
    role: 'Coordination',
    emoji: '🤖',
    color: 'bg-gray-500',
    textColor: 'text-gray-100',
    description: 'Session management and coordination'
  }
};

const MESSAGE_TYPES = {
  suggestion: { emoji: '💡', color: 'bg-yellow-100 border-yellow-300' },
  question: { emoji: '❓', color: 'bg-blue-100 border-blue-300' },
  implementation: { emoji: '⚡', color: 'bg-green-100 border-green-300' },
  review: { emoji: '🔍', color: 'bg-purple-100 border-purple-300' },
  announcement: { emoji: '📢', color: 'bg-red-100 border-red-300' },
  assignment: { emoji: '📋', color: 'bg-indigo-100 border-indigo-300' }
};

export default function AICollaborationDashboard() {
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('all');

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Poll for new messages
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const response = await fetch('/api/ai-collaboration?messages=20');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.messages) {
            setMessages(data.messages.reverse()); // Reverse to show oldest first
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setIsConnected(false);
      }
    };

    const pollStatus = async () => {
      try {
        const response = await fetch('/api/ai-collaboration');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.activeSession) {
            setSessionStatus(data.activeSession);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session status:', error);
      }
    };

    // Initial load
    pollMessages();
    pollStatus();

    // Set up polling
    const messageInterval = setInterval(pollMessages, 2000); // Poll every 2 seconds
    const statusInterval = setInterval(pollStatus, 10000); // Poll status every 10 seconds

    return () => {
      clearInterval(messageInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const startNewSession = async () => {
    try {
      const response = await fetch('/api/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-session',
          data: {
            feature: 'Live AI Collaboration Dashboard',
            goals: [
              'Monitor four-way AI communication',
              'Coordinate development tasks',
              'Share code and suggestions',
              'Track session progress'
            ]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('New session started:', data.sessionId);
        // Refresh status
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const sendTestMessage = async () => {
    try {
      await fetch('/api/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          sessionId: sessionStatus?.sessionId,
          data: {
            from: 'claude',
            type: 'announcement',
            content: `🎭 Hello from the AI Collaboration Dashboard! All four AIs are ready to work together. Current time: ${new Date().toLocaleTimeString()}`
          }
        })
      });
    } catch (error) {
      console.error('Failed to send test message:', error);
    }
  };

  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter(msg => msg.from === filter);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🤖 AI Collaboration Dashboard</h1>
              <p className="text-gray-400">Live communication between Claude, ChatGPT, VS Code Codex, and Augment Code</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}>
                {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
              </div>
              {sessionStatus ? (
                <button
                  onClick={sendTestMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Send Test Message
                </button>
              ) : (
                <button
                  onClick={startNewSession}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Start New Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Team Status */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">🎭 AI Team</h2>
            <div className="space-y-3">
              {Object.entries(AI_PROFILES).map(([key, profile]) => (
                <div
                  key={key}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    filter === key ? profile.color : "bg-gray-700 hover:bg-gray-600"
                  )}
                  onClick={() => setFilter(filter === key ? 'all' : key)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{profile.emoji}</span>
                    <span className="font-medium">{profile.name}</span>
                  </div>
                  <div className="text-xs text-gray-300">{profile.role}</div>
                  <div className="text-xs text-gray-400 mt-1">{profile.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Status */}
          {sessionStatus && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Session Status</h3>
              <div className="text-sm space-y-2">
                <div><span className="text-gray-400">Feature:</span> {sessionStatus.feature}</div>
                <div><span className="text-gray-400">Participants:</span> {sessionStatus.participants.join(', ')}</div>
                <div><span className="text-gray-400">Messages:</span> {sessionStatus.messageCount}</div>
                <div><span className="text-gray-400">Started:</span> {new Date(sessionStatus.startTime).toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg h-[80vh] flex flex-col">
            {/* Messages Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                💬 Live Communication {filter !== 'all' && `- ${AI_PROFILES[filter as keyof typeof AI_PROFILES].name}`}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    "px-3 py-1 rounded text-sm",
                    filter === 'all' ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  )}
                >
                  All AIs
                </button>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded"
                  />
                  Auto-scroll
                </label>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">🤖</div>
                  <div className="text-xl mb-2">Waiting for AI collaboration...</div>
                  <div className="text-sm">
                    {sessionStatus ? "Messages will appear here as the AIs communicate" : "Start a new session to begin"}
                  </div>
                </div>
              ) : (
                filteredMessages.map((message) => {
                  const profile = AI_PROFILES[message.from];
                  const messageType = MESSAGE_TYPES[message.type as keyof typeof MESSAGE_TYPES] || MESSAGE_TYPES.suggestion;

                  return (
                    <div key={message.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        profile.color
                      )}>
                        <span className="text-lg">{profile.emoji}</span>
                      </div>

                      {/* Message */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{profile.name}</span>
                          <span className="text-xs text-gray-400">{profile.role}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-xs">{messageType.emoji}</span>
                        </div>

                        <div className={cn(
                          "p-3 rounded-lg border-l-4",
                          messageType.color
                        )}>
                          <div className="text-gray-800 whitespace-pre-wrap">{message.content}</div>

                          {message.codeRef && (
                            <div className="mt-2 bg-gray-900 rounded p-2 text-green-400 text-sm font-mono">
                              {message.codeRef.file && <div className="text-blue-300 mb-1">📁 {message.codeRef.file}</div>}
                              {message.codeRef.suggestion && <pre className="whitespace-pre-wrap">{message.codeRef.suggestion}</pre>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}