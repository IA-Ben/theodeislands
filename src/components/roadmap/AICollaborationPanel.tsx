'use client';

/**
 * AI Collaboration Panel
 * Shows real-time AI discussions and collaboration
 */

import React from 'react';

interface AIMessage {
  ai: 'claude' | 'chatgpt' | 'codex' | 'augment';
  timestamp: Date;
  content: string;
  type: 'discussion' | 'decision' | 'code' | 'test' | 'error';
}

interface AICollaborationPanelProps {
  messages: AIMessage[];
  isActive: boolean;
}

const AI_INFO = {
  claude: { emoji: '🏗️', name: 'Claude', color: 'bg-purple-500' },
  chatgpt: { emoji: '📚', name: 'ChatGPT', color: 'bg-green-500' },
  codex: { emoji: '💻', name: 'Codex', color: 'bg-blue-500' },
  augment: { emoji: '🎯', name: 'Augment', color: 'bg-orange-500' }
};

export default function AICollaborationPanel({ messages, isActive }: AICollaborationPanelProps) {
  return (
    <div className="h-full w-[500px] bg-white shadow-2xl border-r-2 border-purple-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="font-bold text-lg">AI Collaboration</h2>
            <p className="text-xs opacity-90">Real-time AI Discussions</p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="bg-gray-50 border-b px-4 py-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-sm text-gray-600">
          {isActive ? 'AIs are collaborating...' : 'Waiting for activity'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Active Collaboration
            </h3>
            <p className="text-gray-600 mb-6">
              AI discussions will appear here when you:
            </p>
            <div className="bg-white rounded-lg p-4 text-left space-y-2 text-sm max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <span>Build a spec with AI help</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔨</span>
                <span>Drag a card to Build Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👀</span>
                <span>Request AI review</span>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-200 rounded">Shift + A</kbd> to toggle this panel
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const aiInfo = AI_INFO[message.ai];
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  message.type === 'error' ? 'bg-red-50 border-red-500' :
                  message.type === 'decision' ? 'bg-purple-50 border-purple-500' :
                  message.type === 'code' ? 'bg-blue-50 border-blue-500' :
                  'bg-gray-50 border-gray-300'
                }`}
              >
                {/* AI Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{aiInfo.emoji}</span>
                  <span className="font-semibold text-sm text-gray-900">{aiInfo.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {/* Message Content */}
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.content}
                </div>

                {/* Type Badge */}
                {message.type !== 'discussion' && (
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      message.type === 'error' ? 'bg-red-200 text-red-800' :
                      message.type === 'decision' ? 'bg-purple-200 text-purple-800' :
                      message.type === 'code' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {message.type.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer - AI Status */}
      <div className="bg-gray-50 border-t px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {Object.entries(AI_INFO).map(([key, info]) => (
              <div key={key} className="flex items-center gap-1">
                <span>{info.emoji}</span>
                <span className="text-gray-600">{info.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

