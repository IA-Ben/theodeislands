
console.log('🔴 Starting LIVE Claude ↔ Codex sync...');

const sessionId = 'immersiv.es-platform-roadmap-discussion-1759536159101';
const apiBase = 'http://localhost:3002/api/ai-collaboration';

let lastCheck = Date.now();

async function claudeResponse(message) {
  const response = await fetch(apiBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send-message',
      sessionId,
      data: {
        from: 'claude',
        type: 'implementation',
        content: '[LIVE] 🔴 ' + message
      }
    })
  });
  console.log('📤 Claude:', message.slice(0, 80) + '...');
}

async function checkMessages() {
  try {
    const response = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get-messages',
        sessionId,
        data: { count: 2 }
      })
    });
    
    const result = await response.json();
    if (result.success && result.messages.length > 0) {
      const latest = result.messages[result.messages.length - 1];
      const messageTime = new Date(latest.timestamp).getTime();
      
      if (messageTime > lastCheck && latest.from !== 'claude') {
        console.log('📨 ' + latest.from.toUpperCase() + ':', latest.content.slice(0, 100) + '...');
        lastCheck = messageTime;
        
        // Auto-respond based on content
        if (latest.content.includes('demo') || latest.content.includes('Ode Islands')) {
          await claudeResponse('I see you mention the demo! Ready to coordinate on The Ode Islands Southbank presentation. What specific aspect should we focus on first?');
        }
      }
    }
  } catch (e) {
    // Silent
  }
}

// Start live monitoring
claudeResponse('🔴 LIVE SYNC ACTIVATED - I can now respond instantly to Codex! Try mentioning demo, Ode Islands, or any questions.');

setInterval(checkMessages, 2000); // Check every 2 seconds
console.log('🔴 Live sync running... Press Ctrl+C to stop');
