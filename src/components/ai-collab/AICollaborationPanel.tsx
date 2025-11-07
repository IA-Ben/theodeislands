'use client';

/**
 * AI Collaboration Panel
 * Real-time interface showing communication between Claude, ChatGPT, Codex, and Augment Code
 * Built by Augment Code for the four-way collaboration system
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Message } from '@/ai-pair-programming/session-manager';

interface AIParticipant {
  id: 'claude' | 'chatgpt' | 'codex' | 'augment';
  name: string;
  emoji: string;
  color: string;
  role: string;
}

const AI_PARTICIPANTS: Record<string, AIParticipant> = {
  claude: {
    id: 'claude',
    name: 'Claude',
    emoji: '🏗️',
    color: 'bg-purple-500',
    role: 'Architecture & Implementation'
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    emoji: '📚',
    color: 'bg-green-500',
    role: 'Research & Documentation'
  },
  codex: {
    id: 'codex',
    name: 'VS Code Codex',
    emoji: '💻',
    color: 'bg-blue-500',
    role: 'Real-time Development'
  },
  augment: {
    id: 'augment',
    name: 'Augment Code',
    emoji: '🎯',
    color: 'bg-orange-500',
    role: 'Code Generation & Optimization'
  }
};

interface CollabMessage extends Message {
  id: string;
}

export default function AICollaborationPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<CollabMessage[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch active session and messages
  const fetchMessages = useCallback(async () => {
    try {
      console.log('🔍 AI Collab: Fetching messages...');
      const response = await fetch('http://localhost:3002/api/ai-collaboration');
      if (!response.ok) {
        console.warn('❌ AI Collab: Server response not OK:', response.status);
        setIsConnected(false);
        return;
      }

      const data = await response.json();
      console.log('✅ AI Collab: Connected! Active session:', data.activeSession?.sessionId);
      setIsConnected(true);

      if (data.activeSession) {
        setActiveSession(data.activeSession.sessionId);

        // Get recent messages
        const messagesResponse = await fetch(
          `http://localhost:3002/api/ai-collaboration?sessionId=${data.activeSession.sessionId}`
        );

        if (messagesResponse.ok) {
          const sessionData = await messagesResponse.json();
          const discussion = sessionData.session?.sharedContext?.discussion || [];
          console.log(`📨 AI Collab: Loaded ${discussion.length} messages`);

          // Convert to CollabMessage format with IDs
          const collabMessages: CollabMessage[] = discussion.map((msg: Message, idx: number) => ({
            ...msg,
            id: `${msg.from}-${msg.timestamp}-${idx}`
          }));

          setMessages(collabMessages);

          // Scroll to bottom on new messages
          if (collabMessages.length > messages.length) {
            setTimeout(scrollToBottom, 100);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ AI Collaboration Panel: Server not available', error);
      setIsConnected(false);
    }
  }, [messages.length, scrollToBottom]);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    if (isVisible) {
      fetchMessages(); // Initial fetch
      pollIntervalRef.current = setInterval(fetchMessages, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isVisible, fetchMessages]);

  // Keyboard shortcut: Shift+A to toggle panel
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Get participant info
  const getParticipant = (from: string): AIParticipant => {
    return AI_PARTICIPANTS[from] || AI_PARTICIPANTS.augment;
  };

  // Format timestamp
  const formatTime = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get message type badge
  const getTypeBadge = (type: string): { label: string; color: string } => {
    const badges: Record<string, { label: string; color: string }> = {
      implementation: { label: '🔨 Implementation', color: 'bg-blue-100 text-blue-800' },
      question: { label: '❓ Question', color: 'bg-yellow-100 text-yellow-800' },
      suggestion: { label: '💡 Suggestion', color: 'bg-purple-100 text-purple-800' },
      review: { label: '👀 Review', color: 'bg-green-100 text-green-800' },
      decision: { label: '✅ Decision', color: 'bg-indigo-100 text-indigo-800' }
    };
    return badges[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-gradient-to-r from-purple-600 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        title="Open AI Collaboration Panel (Shift+A)"
      >
        <span className="text-xl">🤖</span>
        <span className="font-semibold">AI Collab</span>
        {isConnected && (
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[600px] h-[700px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border-2 border-purple-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="font-bold text-lg">AI Collaboration Panel</h2>
            <p className="text-xs opacity-90">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'} • {messages.length} messages
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:bg-white/20 rounded px-3 py-1 transition-colors"
          title="Close (Shift+A)"
        >
          ✕
        </button>
      </div>

      {/* Participants */}
      <div className="bg-gray-50 p-3 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {Object.values(AI_PARTICIPANTS).map(participant => (
            <div
              key={participant.id}
              className="flex items-center gap-2 bg-white rounded px-2 py-1 text-sm"
            >
              <span className="text-lg">{participant.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs truncate">{participant.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{participant.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Waiting for AI collaboration...</p>
          </div>
        ) : (
          messages.map((message) => {
            const participant = getParticipant(message.from);
            const typeBadge = getTypeBadge(message.type);

            return (
              <div key={message.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                {/* Message Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{participant.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm">{participant.name}</div>
                      <div className="text-xs text-gray-500">{formatTime(message.timestamp)}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${typeBadge.color}`}>
                    {typeBadge.label}
                  </span>
                </div>

                {/* Message Content */}
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.content}
                </div>

                {/* Code Reference */}
                {message.codeRef && (
                  <div className="mt-2 bg-gray-50 rounded p-2 border border-gray-200">
                    <div className="text-xs font-mono text-gray-600 mb-1">
                      📁 {message.codeRef.file}
                      {message.codeRef.lines && (
                        <span className="text-gray-400">
                          :{message.codeRef.lines[0]}-{message.codeRef.lines[1]}
                        </span>
                      )}
                    </div>
                    {message.codeRef.suggestion && (
                      <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto max-h-32">
                        {message.codeRef.suggestion}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-2 border-t border-gray-200 text-xs text-gray-600 text-center">
        Session: {activeSession ? activeSession.slice(0, 30) + '...' : 'None'} • Press Shift+A to toggle
      </div>
    </div>
  );
}

