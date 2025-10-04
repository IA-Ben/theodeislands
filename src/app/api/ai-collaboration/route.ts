/**
 * AI Collaboration API
 * Enables ChatGPT to participate in pair programming sessions with Claude
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiPairSession } from '../../../ai-pair-programming/session-manager';
import { aiMessageBus } from '../../../ai-pair-programming/message-bus';
import type { Message } from '../../../ai-pair-programming/session-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, sessionId } = body;

    switch (action) {
      case 'create-session':
        return await handleCreateSession(data);

      case 'join-session':
        return await handleJoinSession(sessionId);

      case 'send-message':
        return await handleSendMessage(sessionId, data);

      case 'get-messages':
        return await handleGetMessages(sessionId, data.count);

      case 'update-progress':
        return await handleUpdateProgress(sessionId, data);

      case 'add-decision':
        return await handleAddDecision(sessionId, data);

      case 'get-session-status':
        return await handleGetSessionStatus(sessionId);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Collaboration API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCreateSession(data: { feature: string; goals: string[] }) {
  const session = await aiPairSession.createSession(data.feature, data.goals);

  return NextResponse.json({
    success: true,
    sessionId: session.sessionId,
    session
  });
}

async function handleJoinSession(sessionId: string) {
  const session = await aiPairSession.loadSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    session,
    recentMessages: session.sharedContext.discussion.slice(-10)
  });
}

async function handleSendMessage(sessionId: string, data: Omit<Message, 'timestamp'>) {
  await aiMessageBus.initializeForSession(sessionId);
  await aiMessageBus.sendMessage(data.from, data.type, data.content, data.codeRef);

  return NextResponse.json({ success: true });
}

async function handleGetMessages(sessionId: string, count: number = 10) {
  await aiMessageBus.initializeForSession(sessionId);
  const messages = await aiMessageBus.getRecentMessages(count);

  return NextResponse.json({
    success: true,
    messages
  });
}

async function handleUpdateProgress(sessionId: string, data: { item: string; status: 'completed' | 'inProgress' | 'pending' }) {
  await aiPairSession.updateProgress(sessionId, data.item, data.status);

  return NextResponse.json({ success: true });
}

async function handleAddDecision(sessionId: string, data: { topic: string; decision: string; rationale: string; agreedBy: string[] }) {
  await aiPairSession.addDecision(sessionId, {
    topic: data.topic,
    decision: data.decision,
    rationale: data.rationale,
    agreedBy: data.agreedBy as ('claude' | 'chatgpt')[]
  });

  return NextResponse.json({ success: true });
}

async function handleGetSessionStatus(sessionId: string) {
  const session = await aiPairSession.loadSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const report = await aiPairSession.generateSessionReport(sessionId);

  return NextResponse.json({
    success: true,
    session,
    report
  });
}

// GET endpoint for session info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    // Return active session if no specific session requested
    const activeSession = await aiPairSession.getActiveSession();
    return NextResponse.json({
      success: true,
      activeSession
    });
  }

  return await handleGetSessionStatus(sessionId);
}