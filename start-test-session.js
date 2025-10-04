/**
 * Start a test AI pair programming session
 * Run this to begin collaboration between Claude and ChatGPT
 */

const { startPairProgramming, workingOn, shareCode, askChatGPT } = require('./src/ai-pair-programming/claude-helper');

async function runTest() {
  try {
    console.log('🧪 Starting AI Pair Programming Test Session...\n');

    // Create test session
    const sessionId = await startPairProgramming(
      "Enhanced Cache Debug Component",
      [
        "Add visual cache status indicators",
        "Implement one-click cache clearing",
        "Add timestamp display for last update",
        "Include performance metrics"
      ]
    );

    // Mark first goal as in progress
    await workingOn("Add visual cache status indicators");

    // Share initial implementation
    await shareCode(
      "src/components/CacheDebugger.tsx",
      "Added visual status indicators with color coding",
      `// Enhanced cache status indicators
const StatusIndicator = ({ status, lastUpdate }) => (
  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
    <div className={cn(
      "w-2 h-2 rounded-full",
      status === 'fresh' && "bg-green-500",
      status === 'stale' && "bg-yellow-500"
    )} />
    <span className="text-sm">{status}</span>
    <span className="text-xs text-gray-500">
      {new Date(lastUpdate).toLocaleTimeString()}
    </span>
  </div>
);`
    );

    // Ask ChatGPT to collaborate
    await askChatGPT(
      "I've implemented visual indicators. Can you work on the one-click cache clearing? We need both browser cache and app state clearing.",
      "src/components/CacheDebugger.tsx"
    );

    console.log('\n✅ Test session ready!');
    console.log('\n📋 ChatGPT Instructions:');
    console.log('To join this session, ChatGPT should use:');
    console.log(`
// Join session
const chatgpt = new ChatGPTCollaboration("http://localhost:3002");
const session = await chatgpt.joinSession("${sessionId}");

// Share implementation
await chatgpt.shareImplementation(
  "${sessionId}",
  "src/components/CacheDebugger.tsx",
  "Added comprehensive cache clearing functionality"
);

// Ask questions
await chatgpt.askQuestion(
  "${sessionId}",
  "Should we add user confirmation before clearing cache?"
);

// Update progress
await chatgpt.updateProgress("${sessionId}", "Implement one-click cache clearing", "completed");
    `);

    return sessionId;

  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();