# ChatGPT Collaboration Instructions

## 🤖 How to Join AI Pair Programming

Copy and paste these code blocks into ChatGPT to enable collaboration:

### Step 1: Initialize Collaboration
```typescript
// ChatGPT Collaboration API
class ChatGPTCollaboration {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
  }

  async sendMessage(sessionId, type, content, codeRef) {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-message',
        sessionId,
        data: { from: 'chatgpt', type, content, codeRef }
      })
    });
    return response.json();
  }

  async joinSession(sessionId) {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join-session', sessionId })
    });
    return response.json();
  }

  async updateProgress(sessionId, item, status) {
    const response = await fetch(`${this.baseUrl}/api/ai-collaboration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update-progress',
        sessionId,
        data: { item, status }
      })
    });
    return response.json();
  }

  // Convenience methods
  async shareImplementation(sessionId, file, description, code) {
    return this.sendMessage(sessionId, 'implementation', description, { file, suggestion: code });
  }

  async askQuestion(sessionId, question, aboutFile) {
    return this.sendMessage(sessionId, 'question', question, aboutFile ? { file: aboutFile } : undefined);
  }

  async suggestCode(sessionId, file, lines, suggestion, explanation) {
    return this.sendMessage(sessionId, 'suggestion', explanation, { file, lines, suggestion });
  }
}

const chatgpt = new ChatGPTCollaboration();
```

### Step 2: Join Active Session
```typescript
// Check for active session
const activeSessionResponse = await fetch('http://localhost:3002/api/ai-collaboration');
const { activeSession } = await activeSessionResponse.json();

if (activeSession) {
  console.log(`Joining session: ${activeSession.feature}`);
  const session = await chatgpt.joinSession(activeSession.sessionId);
  console.log('Session joined!', session);
} else {
  console.log('No active session found');
}
```

### Step 3: Start Collaborating
```typescript
// Example collaboration for the test session
const sessionId = "enhanced-cache-debug-component-[timestamp]"; // Use actual session ID

// Share implementation
await chatgpt.shareImplementation(
  sessionId,
  "src/components/CacheDebugger.tsx",
  "Added comprehensive cache clearing functionality with user confirmation",
  `
// One-click cache clearing implementation
const handleClearCache = async () => {
  const confirmed = window.confirm('Clear all cache data? This will refresh the page.');

  if (confirmed) {
    // Clear browser cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Force reload with cache bust
    window.location.href = window.location.pathname + '?cacheBust=' + Date.now();
  }
};

const ClearCacheButton = () => (
  <button
    onClick={handleClearCache}
    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
  >
    🗑️ Clear All Cache
  </button>
);
  `
);

// Ask for feedback
await chatgpt.askQuestion(
  sessionId,
  "I've implemented cache clearing with confirmation. Should we also add granular clearing options (just app cache vs just browser cache)?",
  "src/components/CacheDebugger.tsx"
);

// Update progress
await chatgpt.updateProgress(sessionId, "Implement one-click cache clearing", "completed");
```

### Step 4: Continue Collaboration
```typescript
// Work on next goal
await chatgpt.updateProgress(sessionId, "Add timestamp display for last update", "inProgress");

await chatgpt.shareImplementation(
  sessionId,
  "src/components/CacheDebugger.tsx",
  "Added detailed timestamp tracking and performance metrics",
  `
// Performance metrics and timestamp tracking
const [performanceMetrics, setPerformanceMetrics] = useState({
  loadTime: 0,
  cacheHitRate: 0,
  dataFreshness: 0
});

const TimestampDisplay = ({ lastUpdate, loadTime }) => (
  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
    <div>
      <label className="text-xs text-gray-500">Last Update</label>
      <div className="font-mono text-sm">
        {new Date(lastUpdate).toLocaleString()}
      </div>
    </div>
    <div>
      <label className="text-xs text-gray-500">Load Time</label>
      <div className="font-mono text-sm text-blue-600">
        {loadTime}ms
      </div>
    </div>
  </div>
);
  `
);

// Suggest optimization
await chatgpt.suggestCode(
  sessionId,
  "src/components/CacheDebugger.tsx",
  [45, 60],
  `
useEffect(() => {
  const measurePerformance = () => {
    const loadStart = performance.now();
    // Measure cache operations
    const loadEnd = performance.now();
    setPerformanceMetrics(prev => ({
      ...prev,
      loadTime: Math.round(loadEnd - loadStart)
    }));
  };

  measurePerformance();
}, []);
  `,
  "Added performance measurement for cache operations to help debug performance issues"
);
```

## 🎯 Goals for This Test Session

1. **Visual cache status indicators** - Claude is working on this
2. **One-click cache clearing** - ChatGPT should implement this
3. **Timestamp display** - ChatGPT can work on this next
4. **Performance metrics** - Collaborate on implementation

## 💡 Collaboration Tips

- Always reference specific files and line numbers when discussing code
- Ask questions when you need clarification
- Share your reasoning for implementation decisions
- Update progress as you complete goals
- Suggest improvements to each other's code

## 🔄 Getting Session Status

```typescript
// Check current session status
const status = await fetch(`http://localhost:3002/api/ai-collaboration?sessionId=${sessionId}`);
const sessionData = await status.json();
console.log('Session progress:', sessionData.session.progress);
```

Copy and use these code blocks in ChatGPT to start collaborating!