# AI Collaboration Panel

**Built by Augment Code** for the four-way AI collaboration system.

## 🎯 Overview

The AI Collaboration Panel provides a real-time visual interface showing communication between all AI participants:
- 🏗️ **Claude** - Architecture & Implementation
- 📚 **ChatGPT** - Research & Documentation  
- 💻 **VS Code Codex** - Real-time Development
- 🎯 **Augment Code** - Code Generation & Optimization

## 🚀 Features

### Real-Time Message Feed
- Live polling every 2 seconds for new messages
- Auto-scroll to latest messages
- Color-coded participants with emojis
- Message type badges (Implementation, Question, Suggestion, Review, Decision)

### Code Reference Display
- Shows file paths and line numbers
- Syntax-highlighted code snippets
- Inline code suggestions from AIs

### Keyboard Shortcuts
- **Shift+A** - Toggle panel visibility
- Works alongside **Shift+D** for Presenter Mode

### Connection Status
- Live connection indicator
- Graceful fallback when server unavailable
- Session ID display

## 📦 Installation

Already integrated into the main app layout! Just start the dev server:

```bash
npm run dev
```

## 🎮 Usage

### Opening the Panel

1. **Keyboard Shortcut**: Press `Shift+A` anywhere in the app
2. **Click Button**: Click the floating "AI Collab" button in bottom-right corner

### Viewing Messages

The panel shows all AI communications in chronological order:
- **Implementation** messages (🔨) - Code implementations and progress updates
- **Question** messages (❓) - Questions between AIs
- **Suggestion** messages (💡) - Code suggestions and improvements
- **Review** messages (👀) - Code reviews and feedback
- **Decision** messages (✅) - Architectural decisions

### Code References

When an AI references code, you'll see:
- File path (e.g., `src/components/demo/PresenterMode.tsx`)
- Line numbers (e.g., `:45-60`)
- Code snippet with syntax highlighting

## 🔧 Technical Details

### Architecture

```
AICollaborationPanel.tsx
├── State Management
│   ├── isVisible (panel toggle)
│   ├── messages (message history)
│   ├── activeSession (current session ID)
│   └── isConnected (server status)
├── API Integration
│   ├── GET /api/ai-collaboration (active session)
│   └── GET /api/ai-collaboration?sessionId=... (messages)
└── UI Components
    ├── Header (title, status, close button)
    ├── Participants Grid (4 AI cards)
    ├── Message Feed (scrollable list)
    └── Footer (session info, shortcuts)
```

### Message Polling

```typescript
// Polls every 2 seconds when panel is visible
useEffect(() => {
  if (isVisible) {
    fetchMessages(); // Initial fetch
    pollIntervalRef.current = setInterval(fetchMessages, 2000);
  }
  return () => clearInterval(pollIntervalRef.current);
}, [isVisible]);
```

### Type Safety

```typescript
interface CollabMessage extends Message {
  id: string; // Unique identifier for React keys
}

interface AIParticipant {
  id: 'claude' | 'chatgpt' | 'codex' | 'augment';
  name: string;
  emoji: string;
  color: string;
  role: string;
}
```

## 🎨 Styling

- **Gradient Header**: Purple to Orange (matches AI theme)
- **Participant Cards**: White cards with emoji + role
- **Message Cards**: White with subtle shadows
- **Code Blocks**: Dark theme with syntax highlighting
- **Status Indicators**: Green (connected) / Red (disconnected)

## 🔌 API Endpoints

### Get Active Session
```
GET http://localhost:3002/api/ai-collaboration
Response: { activeSession: { sessionId, feature, ... } }
```

### Get Session Messages
```
GET http://localhost:3002/api/ai-collaboration?sessionId=xxx
Response: { session: { sharedContext: { discussion: [...] } } }
```

## 🧪 Testing

The panel gracefully handles:
- ✅ Server not running (shows disconnected status)
- ✅ No active session (shows "No messages yet")
- ✅ Network errors (console warning, no crash)
- ✅ Rapid toggling (proper cleanup of intervals)

## 🚀 Future Enhancements

Potential improvements:
- [ ] WebSocket support for instant updates (no polling)
- [ ] Message filtering by AI or type
- [ ] Search functionality
- [ ] Export conversation history
- [ ] Inline code editing from suggestions
- [ ] Voice notifications for new messages
- [ ] Participant status (active/idle)
- [ ] Message reactions/threading

## 📝 Example Usage

### For Claude
```typescript
import { augmentCollab } from '@/ai-pair-programming/augment-helper';

await augmentCollab.shareImplementation(
  'src/components/NewFeature.tsx',
  'Built the new feature component',
  '// Code here...'
);
```

### For ChatGPT
```typescript
// Via API
await fetch('http://localhost:3002/api/ai-collaboration', {
  method: 'POST',
  body: JSON.stringify({
    action: 'send-message',
    sessionId: 'xxx',
    data: {
      from: 'chatgpt',
      type: 'question',
      content: 'How should we handle error states?'
    }
  })
});
```

### For Codex
```typescript
// Via Codex Bridge
await codexBridge.sendMessage({
  from: 'codex',
  type: 'suggestion',
  content: 'Consider using React.memo here',
  codeRef: { file: 'src/components/Heavy.tsx', lines: [10, 20] }
});
```

## 🤝 Contributing

This component is part of the four-way AI collaboration system. When adding features:

1. Maintain type safety with TypeScript
2. Handle server unavailability gracefully
3. Keep UI responsive (no blocking operations)
4. Follow existing color/emoji conventions
5. Test with all four AI participants

## 📄 License

Part of The Ode Islands project.

---

**Built with ❤️ by Augment Code** 🎯

