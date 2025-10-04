/**
 * Test Script for AI Pair Programming System
 * Demonstrates Claude and ChatGPT collaboration workflow
 */

import { startPairProgramming, workingOn, shareCode, askChatGPT, completeGoal, recordDecision } from './src/ai-pair-programming/claude-helper';

async function testPairProgramming() {
  console.log('🧪 Testing AI Pair Programming System...\n');

  // Start a test session for a small feature
  const sessionId = await startPairProgramming(
    "Enhanced Cache Debug Component",
    [
      "Add visual cache status indicators",
      "Implement one-click cache clearing",
      "Add timestamp display for last update",
      "Include performance metrics"
    ]
  );

  console.log(`✅ Session created: ${sessionId}\n`);

  // Simulate Claude starting work
  await workingOn("Add visual cache status indicators");

  await shareCode(
    "src/components/CacheDebugger.tsx",
    "Starting with enhanced visual indicators for cache status",
    `
// Enhanced cache status indicators
const [cacheStatus, setCacheStatus] = useState({
  lastUpdate: Date.now(),
  dataSource: 'unknown',
  cacheSize: 0,
  isStale: false
});

const StatusIndicator = ({ status }: { status: string }) => (
  <div className={cn(
    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm",
    status === 'fresh' && "bg-green-100 text-green-800",
    status === 'stale' && "bg-yellow-100 text-yellow-800",
    status === 'error' && "bg-red-100 text-red-800"
  )}>
    <div className={cn(
      "w-2 h-2 rounded-full",
      status === 'fresh' && "bg-green-500",
      status === 'stale' && "bg-yellow-500",
      status === 'error' && "bg-red-500"
    )} />
    {status}
  </div>
);`
  );

  // Ask ChatGPT for input
  await askChatGPT(
    "I've started with visual indicators. Could you work on the one-click cache clearing functionality? I'm thinking we need both browser cache and application cache clearing.",
    "src/components/CacheDebugger.tsx"
  );

  console.log('\n⏳ Waiting for ChatGPT to respond and collaborate...\n');

  // Simulate more collaboration
  await recordDecision(
    "Visual Design Approach",
    "Use color-coded status indicators with icons",
    "Provides immediate visual feedback and is accessible for colorblind users"
  );

  console.log('\n🎯 Test session is ready for ChatGPT collaboration!');
  console.log('\n📋 For ChatGPT to join this session, use:');
  console.log(`
// In ChatGPT:
const { ChatGPTCollaboration } = require('./src/ai-pair-programming/chatgpt-integration');
const chatgpt = new ChatGPTCollaboration();

// Join the session
const session = await chatgpt.joinSession("${sessionId}");

// Start collaborating
await chatgpt.shareImplementation(
  "${sessionId}",
  "src/components/CacheDebugger.tsx",
  "Added one-click cache clearing with browser and app cache support",
  \`// ChatGPT's implementation here\`
);

await chatgpt.askQuestion(
  "${sessionId}",
  "Should we add a confirmation dialog for cache clearing?"
);
  `);

  return sessionId;
}

// Run the test
testPairProgramming().catch(console.error);