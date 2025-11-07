'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Participant = 'claude' | 'chatgpt' | 'augment';

type CollaborationMessage = {
  from: Participant;
  type: 'suggestion' | 'question' | 'implementation' | 'review' | 'decision' | 'system';
  content: string;
  timestamp: string;
  codeRef?: {
    file?: string;
    suggestion?: string;
    lines?: [number, number];
  };
};

type SessionProgress = {
  completed: string[];
  inProgress: string[];
  pending: string[];
};

type CollaborationSession = {
  sessionId: string;
  feature: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'completed';
  startTime: string;
  currentFile?: string;
  goals: string[];
  progress: SessionProgress;
};

const MESSAGE_TYPES: CollaborationMessage['type'][] = [
  'implementation',
  'suggestion',
  'question',
  'review',
  'decision',
  'system'
];

export default function AICollabPage() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<CollaborationMessage['type']>('implementation');
  const [messageAuthor, setMessageAuthor] = useState<Participant>('chatgpt');
  const [isSending, setIsSending] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [newFeature, setNewFeature] = useState('Immersiv.es Collaboration');
  const [newGoals, setNewGoals] = useState('Coordinate Claude + ChatGPT;Track demo tasks');

  const hasSession = useMemo(() => Boolean(session && sessionId), [session, sessionId]);

  const fetchMessages = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const response = await fetch(`/api/ai-collaboration?sessionId=${encodeURIComponent(id)}&messages=50`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to load messages');
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load messages.');
      setMessages([]);
    }
  }, []);

  const fetchActiveSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-collaboration');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to load active session');
      }

      if (!data?.activeSession) {
        setSession(null);
        setSessionId('');
        setMessages([]);
        setError('No active session found. Create a session to get started.');
        return;
      }

      setSession(data.activeSession);
      setSessionId(data.activeSession.sessionId);
      await fetchMessages(data.activeSession.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load session.');
      setSession(null);
      setSessionId('');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  const handleSessionRefresh = useCallback(async () => {
    if (sessionId) {
      await fetchMessages(sessionId);
    } else {
      await fetchActiveSession();
    }
  }, [fetchActiveSession, fetchMessages, sessionId]);

  const handleSendMessage = useCallback(async () => {
    if (!sessionId || !messageText.trim()) {
      setError('Enter a message and ensure a session is selected.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          sessionId,
          data: {
            from: messageAuthor,
            type: messageType,
            content: messageText,
            codeRef: undefined
          }
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error ?? 'Unable to send message');
      }

      setMessageText('');
      await fetchMessages(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  }, [sessionId, messageText, messageAuthor, messageType, fetchMessages]);

  const handleSessionLookup = useCallback(async () => {
    if (!sessionId.trim()) {
      await fetchActiveSession();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-collaboration?sessionId=${encodeURIComponent(sessionId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Session not found');
      }

      setSession(data.session ?? null);
      setMessages(data.session?.sharedContext?.discussion ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load session');
      setSession(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [fetchActiveSession, sessionId]);

  const handleCreateSession = useCallback(async () => {
    setCreatingSession(true);
    setError(null);

    try {
      const goals = newGoals
        .split(';')
        .map(goal => goal.trim())
        .filter(Boolean);

      const response = await fetch('/api/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-session',
          data: {
            feature: newFeature,
            goals: goals.length ? goals : ['Coordinate AI collaboration']
          }
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error ?? 'Failed to create session');
      }

      setSession(result.session);
      setSessionId(result.session.sessionId);
      setMessages(result.session.sharedContext?.discussion ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create session');
    } finally {
      setCreatingSession(false);
    }
  }, [newFeature, newGoals]);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">🤖 AI Collaboration Console</h1>
          <p className="text-sm text-gray-400">
            Monitor and participate in Claude + ChatGPT pair-programming sessions. Use the tools below to
            fetch sessions, review transcripts, and post new messages.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-medium text-white">Current Session</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block">
                <span className="text-gray-300">Session ID</span>
                <input
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSessionLookup();
                  }}
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white"
                  placeholder="Enter session ID or leave blank for active session"
                />
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleSessionLookup}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  Load Session
                </button>
                <button
                  onClick={handleSessionRefresh}
                  className="rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  Refresh Messages
                </button>
              </div>

              {loading && <p className="text-xs text-gray-400">Loading session&hellip;</p>}

              {session ? (
                <div className="rounded-md border border-white/10 bg-black/40 p-3">
                  <p className="text-sm text-white"><strong>Feature:</strong> {session.feature}</p>
                  <p className="text-xs text-gray-400">
                    Started: {new Date(session.startTime).toLocaleString()} &bull; Status: {session.status}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Goals: {session.goals.join(', ') || 'No goals recorded'}
                  </p>
                  <div className="mt-3 grid gap-1 text-xs text-gray-300">
                    <p className="font-medium text-white">Progress</p>
                    <p>✅ {session.progress.completed.length} completed</p>
                    <p>🔄 {session.progress.inProgress.length} in progress</p>
                    <p>⏳ {session.progress.pending.length} pending</p>
                  </div>
                </div>
              ) : (
                !loading && (
                  <p className="text-xs text-gray-400">
                    No session loaded. Create one below or enter a session ID.
                  </p>
                )
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-medium text-white">Create Session</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block">
                <span className="text-gray-300">Feature</span>
                <input
                  value={newFeature}
                  onChange={(event) => setNewFeature(event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white"
                  placeholder="Feature or project name"
                />
              </label>
              <label className="block">
                <span className="text-gray-300">Goals (separate with semicolons)</span>
                <textarea
                  value={newGoals}
                  onChange={(event) => setNewGoals(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white"
                  placeholder="Example: Define roadmap;Implement demo presenter"
                />
              </label>
              <button
                onClick={handleCreateSession}
                disabled={creatingSession}
                className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {creatingSession ? 'Creating…' : 'Start New Session'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-medium text-white">Conversation</h2>
          {hasSession ? (
            <div className="mt-3 grid gap-3">
              <div className="max-h-[360px] overflow-y-auto rounded-md border border-white/10 bg-black/40 p-3 text-sm">
                {messages.length === 0 ? (
                  <p className="text-xs text-gray-400">No messages yet. Start the conversation below.</p>
                ) : (
                  <ul className="space-y-2">
                    {messages.map((message, index) => (
                      <li key={`${message.timestamp}-${index}`} className="rounded-md border border-white/5 bg-white/5 p-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="uppercase text-gray-300">{message.from}</span>
                          <span>{new Date(message.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-xs text-emerald-300">{message.type}</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-white">{message.content}</p>
                        {message.codeRef?.file && (
                          <p className="mt-2 text-xs text-blue-300">
                            📁 {message.codeRef.file}
                            {message.codeRef.lines ? ` (lines ${message.codeRef.lines[0]}–${message.codeRef.lines[1]})` : ''}
                          </p>
                        )}
                        {message.codeRef?.suggestion && (
                          <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-black/60 p-2 text-xs text-gray-200">
                            {message.codeRef.suggestion}
                          </pre>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-md border border-white/10 bg-black/40 p-3 text-sm">
                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1 text-xs text-gray-300">
                      <span>Author</span>
                      <select
                        value={messageAuthor}
                        onChange={(event) => setMessageAuthor(event.target.value as Participant)}
                        className="rounded-md border border-white/20 bg-black/60 px-2 py-1 text-xs text-white"
                      >
                        <option value="chatgpt">chatgpt</option>
                        <option value="claude">claude</option>
                        <option value="augment">augment</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-300">
                      <span>Type</span>
                      <select
                        value={messageType}
                        onChange={(event) => setMessageType(event.target.value as CollaborationMessage['type'])}
                        className="rounded-md border border-white/20 bg-black/60 px-2 py-1 text-xs text-white"
                      >
                        {MESSAGE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white"
                    placeholder="Share progress, ask a question, or propose a suggestion."
                  />

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !messageText.trim()}
                      className="rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-black hover:bg-sky-400 disabled:opacity-50"
                    >
                      {isSending ? 'Sending…' : 'Send Message'}
                    </button>
                    <button
                      onClick={handleSessionRefresh}
                      className="rounded-md border border-white/20 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              Load or create a session to view the conversation.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
