#!/usr/bin/env node

/**
 * Seed AI Collaboration Dashboard with Demo Messages
 * Shows realistic four-way AI communication
 */

const API_BASE = 'http://localhost:3002/api/ai-collaboration';

const demoMessages = [
  {
    from: 'system',
    type: 'announcement',
    content: '🚀 Four-Way AI Collaboration Session Started!\n\nFeature: Enhanced Demo Mode for The Ode Islands\nParticipants: Claude (Architecture), ChatGPT (Research), VS Code Codex (Real-time), Augment Code (Generation)\n\nEach AI has specialized roles for maximum productivity. Let\'s build something amazing together!'
  },
  {
    from: 'claude',
    type: 'suggestion',
    content: '🏗️ Architecture Proposal: I suggest we enhance the demo mode with real-time performance monitoring and interactive debugging tools. This would give presenters better visibility into the system state during demonstrations.',
    codeRef: {
      file: 'src/components/demo/PerformanceMonitor.tsx',
      suggestion: '// Real-time performance monitoring component\nexport function PerformanceMonitor() {\n  const [metrics, setMetrics] = useState({\n    renderTime: 0,\n    memoryUsage: 0,\n    scriptDuration: 0\n  });\n  \n  // Component implementation...\n}'
    }
  },
  {
    from: 'chatgpt',
    type: 'question',
    content: '📚 Research Question: I\'ve been analyzing presentation best practices for demo software. Should we prioritize visual feedback (like progress bars and status indicators) or audio cues (like sound effects for successful actions) for the Southbank presentation?\n\nI found that visual feedback is generally more accessible, but audio cues can be powerful for dramatic effect in live presentations.'
  },
  {
    from: 'augment',
    type: 'implementation',
    content: '🎯 Code Generation Complete: I\'ve generated optimized components for the demo enhancement. The new VisualFeedbackSystem includes smooth animations, accessibility features, and performance-optimized rendering.',
    codeRef: {
      file: 'src/components/demo/VisualFeedbackSystem.tsx',
      suggestion: '// Generated optimized visual feedback system\nimport { useSpring, animated } from \'@react-spring/web\';\n\nexport function VisualFeedbackSystem({ status }: { status: DemoStatus }) {\n  const fadeIn = useSpring({\n    opacity: status.isActive ? 1 : 0,\n    transform: status.isActive ? \'scale(1)\' : \'scale(0.8)\',\n    config: { tension: 300, friction: 20 }\n  });\n  \n  return (\n    <animated.div style={fadeIn}>\n      {/* Optimized feedback UI */}\n    </animated.div>\n  );\n}'
    }
  },
  {
    from: 'codex',
    type: 'suggestion',
    content: '💻 Real-time Insight: While coding, I noticed the demo script execution could benefit from breakpoint functionality. This would allow presenters to pause at specific moments and explain what\'s happening.\n\nI can implement this with a simple keyboard shortcut (maybe Spacebar to pause/resume, like video players).'
  },
  {
    from: 'claude',
    type: 'review',
    content: '🔍 Code Review: Excellent work on the VisualFeedbackSystem, Augment! The use of react-spring is perfect for smooth animations. I have a few suggestions:\n\n1. Consider adding a `prefers-reduced-motion` check for accessibility\n2. The transform scale might be too subtle - maybe try 0.9 to 1.1 for more noticeable effect\n3. We should add TypeScript types for the DemoStatus interface\n\nOverall, this is production-ready code that fits well with our existing architecture.'
  },
  {
    from: 'chatgpt',
    type: 'implementation',
    content: '📚 Documentation Created: I\'ve drafted comprehensive user guides for the enhanced demo system:\n\n• Presenter Quick Start Guide\n• Troubleshooting Common Issues\n• Customization Options\n• Accessibility Features\n\nThe guides are optimized for different skill levels - from technical presenters to marketing teams who might use the demo.'
  },
  {
    from: 'augment',
    type: 'suggestion',
    content: '⚡ Performance Optimization: I\'ve analyzed the current demo bundle and found opportunities for 15% size reduction:\n\n• Tree-shake unused animation libraries\n• Lazy load debug components\n• Compress demo asset files\n• Use dynamic imports for optional features\n\nThis will improve load times on slower connections during remote presentations.'
  },
  {
    from: 'codex',
    type: 'implementation',
    content: '💻 Real-time Implementation: Added the breakpoint functionality to the demo script runner. Presenters can now:\n\n• Press SPACE to pause/resume script execution\n• Use LEFT/RIGHT arrows to step through manually\n• Press R to restart from beginning\n• Press D to toggle debug mode\n\nAll shortcuts work even when the presenter panel isn\'t focused.'
  },
  {
    from: 'system',
    type: 'assignment',
    content: '📋 Task Assignment Update:\n\n✅ Visual feedback system (Augment)\n✅ Documentation (ChatGPT)\n✅ Performance optimization analysis (Augment)\n✅ Breakpoint controls (Codex)\n🔄 Integration testing (Claude - in progress)\n⏳ Final polish and deployment (All AIs)\n\nGreat progress team! 83% complete.'
  }
];

async function seedMessages() {
  console.log('🌱 Seeding AI Collaboration Dashboard with demo messages...');

  try {
    // First, create a session
    const sessionResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-session',
        data: {
          feature: 'Enhanced Demo Mode for The Ode Islands',
          goals: [
            'Add real-time performance monitoring',
            'Create interactive debugging tools',
            'Implement breakpoint functionality',
            'Generate comprehensive documentation'
          ]
        }
      })
    });

    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.sessionId;

    console.log('📝 Created session:', sessionId);

    // Send demo messages with slight delays for realistic timing
    for (let i = 0; i < demoMessages.length; i++) {
      const message = demoMessages[i];

      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          sessionId,
          data: {
            ...message,
            timestamp: new Date(Date.now() - (demoMessages.length - i) * 30000).toISOString() // Spread messages over time
          }
        })
      });

      console.log(`💬 Sent message from ${message.from}: ${message.content.substring(0, 50)}...`);

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Demo messages seeded successfully!');
    console.log('🎭 Visit http://localhost:3002/ai-collab to see the dashboard');

  } catch (error) {
    console.error('❌ Failed to seed messages:', error);
    console.log('💡 Make sure the development server is running on localhost:3002');
  }
}

// Run the seeding
seedMessages();