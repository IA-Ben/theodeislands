'use client';

/**
 * Spec Builder Panel
 * AI-assisted specification building for feature cards
 */

import React, { useState, useCallback } from 'react';
import type { FeatureCard } from './RoadmapBoard';

type SectionStatus = 'not-started' | 'in-progress' | 'complete';

interface Suggestion {
  id: string;
  sectionId: string;
  model: 'claude' | 'chatgpt' | 'codex' | 'augment';
  prompt: string;
  output_md: string;
  tokens: number;
  createdAt: Date;
}

interface SpecSection {
  id: string;
  name: string;
  order: number;
  content_md: string;
  status: SectionStatus;
  rules: {
    minWords?: number;
    requiredBlocks?: string[];
  };
  suggestions: Suggestion[];
  history: {
    ts: Date;
    userId: string;
    action: string;
    meta?: any;
  }[];
}

interface SpecBuilderProps {
  card: FeatureCard;
  onClose: () => void;
  onSaveSpec: (cardId: string, spec: SpecSection[]) => void;
}

const AI_PARTICIPANTS = {
  claude: { emoji: '🏗️', name: 'Claude', color: 'bg-purple-500' },
  chatgpt: { emoji: '📚', name: 'ChatGPT', color: 'bg-green-500' },
  codex: { emoji: '💻', name: 'Codex', color: 'bg-blue-500' },
  augment: { emoji: '🎯', name: 'Augment', color: 'bg-orange-500' }
};

const DEFAULT_SPEC_SECTIONS: SpecSection[] = [
  {
    id: 'overview',
    name: '📋 Overview',
    order: 0,
    content_md: '',
    status: 'not-started',
    rules: { minWords: 50 },
    suggestions: [],
    history: []
  },
  {
    id: 'requirements',
    name: '✅ Requirements',
    order: 1,
    content_md: '',
    status: 'not-started',
    rules: { minWords: 100, requiredBlocks: ['Functional', 'Non-Functional'] },
    suggestions: [],
    history: []
  },
  {
    id: 'architecture',
    name: '🏗️ Architecture',
    order: 2,
    content_md: '',
    status: 'not-started',
    rules: { minWords: 100 },
    suggestions: [],
    history: []
  },
  {
    id: 'implementation',
    name: '⚙️ Implementation Details',
    order: 3,
    content_md: '',
    status: 'not-started',
    rules: { minWords: 100 },
    suggestions: [],
    history: []
  },
  {
    id: 'testing',
    name: '🧪 Testing Strategy',
    order: 4,
    content_md: '',
    status: 'not-started',
    rules: { minWords: 75 },
    suggestions: [],
    history: []
  },
  {
    id: 'acceptance',
    name: '✓ Acceptance Criteria',
    order: 5,
    content_md: '',
    status: 'not-started',
    rules: { minWords: 50 },
    suggestions: [],
    history: []
  }
];

export default function SpecBuilderPanel({ card, onClose, onSaveSpec }: SpecBuilderProps) {
  const [sections, setSections] = useState<SpecSection[]>(DEFAULT_SPEC_SECTIONS);
  const [activeSection, setActiveSection] = useState('overview');
  const [isRequestingAIHelp, setIsRequestingAIHelp] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate section status based on content and rules
  const calculateSectionStatus = useCallback((section: SpecSection): SectionStatus => {
    const wordCount = section.content_md.trim().split(/\s+/).filter(w => w.length > 0).length;
    const hasBlocks = section.content_md.includes('##') || section.content_md.includes('```');

    // Check for placeholders (lint check)
    const hasPlaceholders = /lorem|suggestion for|TODO|FIXME|placeholder/i.test(section.content_md);

    // Not started: <50 words and no blocks
    if (wordCount < 50 && !hasBlocks) {
      return 'not-started';
    }

    // Complete: meets rules + no placeholders
    const meetsMinWords = !section.rules.minWords || wordCount >= section.rules.minWords;
    const hasRequiredBlocks = !section.rules.requiredBlocks ||
      section.rules.requiredBlocks.every(block =>
        section.content_md.toLowerCase().includes(block.toLowerCase())
      );

    if (meetsMinWords && hasRequiredBlocks && !hasPlaceholders) {
      return 'complete';
    }

    // Otherwise in progress
    return 'in-progress';
  }, []);

  // Auto-update section status when content changes
  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;

      const updated = { ...section, content_md: content };
      updated.status = calculateSectionStatus(updated);

      return updated;
    }));
  }, [calculateSectionStatus]);

  const generateAISuggestion = (ai: string, sectionId: string): string => {
    const suggestions: Record<string, Record<string, string>> = {
      overview: {
        claude: `## Overview\n\n**Feature:** ${card.title}\n\n**Purpose:** ${card.description}\n\n**Priority:** ${card.priority.toUpperCase()}\n**Estimated Effort:** ${card.estimatedDays} days\n\n**User Impact:** This feature will enable users to ${card.description.toLowerCase()}, improving their overall experience during the ${card.eventPhase.replace('-', ' ')} phase.`,
        chatgpt: `## User Story\n\nAs a **${card.userType.replace('-', ' ')}**, I want to ${card.description.toLowerCase()}, so that I can have a better experience during ${card.eventPhase.replace('-', ' ')}.\n\n## Success Metrics\n- User engagement increase\n- Feature adoption rate\n- User satisfaction score`,
        codex: `## Technical Overview\n\n**Component Type:** ${card.tags.includes('ui') ? 'UI Component' : 'Backend Service'}\n**Tech Stack:** Next.js, React, TypeScript${card.tags.includes('3d') ? ', Three.js' : ''}${card.tags.includes('supabase') ? ', Supabase' : ''}\n**Integration Points:** ${card.tags.join(', ')}\n\n**Complexity:** ${card.priority === 'high' ? 'High' : card.priority === 'medium' ? 'Medium' : 'Low'}`,
        augment: `## Project Scope\n\n**Dependencies:** ${card.dependencies?.length ? card.dependencies.join(', ') : 'None - can start immediately'}\n**Tags:** ${card.tags.join(', ')}\n**Phase:** ${card.eventPhase.replace('-', ' ')}\n\n**Recommended Approach:** Start with ${card.tags[0]} implementation, then iterate based on user feedback.`
      },
      requirements: {
        claude: `## Functional Requirements\n\n1. **Core Functionality**\n   - Implement ${card.title.toLowerCase()}\n   - Support ${card.userType.replace('-', ' ')} workflows\n   - Integrate with existing ${card.eventPhase.replace('-', ' ')} features\n\n2. **User Experience**\n   - Mobile-first responsive design\n   - Intuitive navigation\n   - Clear feedback and error handling`,
        chatgpt: `## User Requirements\n\n**Must Have:**\n- ${card.description}\n- Mobile-responsive interface\n- Accessibility compliance (WCAG 2.1 AA)\n\n**Should Have:**\n- Offline support for ${card.eventPhase === 'at-event' ? 'spotty venue connectivity' : 'better UX'}\n- Social sharing capabilities\n\n**Nice to Have:**\n- Advanced analytics\n- Customization options`,
        codex: `## Technical Requirements\n\n**Performance:**\n- Page load < 2s\n- Time to interactive < 3s\n- Lighthouse score > 90\n\n**Compatibility:**\n- iOS Safari 14+\n- Chrome/Edge (latest 2 versions)\n- Progressive Web App support\n\n**Data:**\n- ${card.tags.includes('cms') ? 'CMS integration via Supabase' : 'API integration'}\n- Real-time updates ${card.tags.includes('real-time') ? '(WebSocket)' : '(polling)'}`,
        augment: `## Non-Functional Requirements\n\n**Security:**\n- ${card.userType === 'creator-admin' ? 'Role-based access control' : 'Secure user data handling'}\n- GDPR compliance\n- Data encryption at rest and in transit\n\n**Scalability:**\n- Support ${card.eventPhase === 'at-event' ? '1000+ concurrent users' : '10,000+ total users'}\n- CDN for static assets\n- Database query optimization`
      },
      architecture: {
        claude: `## System Architecture\n\n**Frontend:**\n- Next.js 15 App Router\n- React 19 with TypeScript\n- ${card.tags.includes('3d') ? 'Three.js for 3D rendering' : 'Tailwind CSS for styling'}\n\n**Backend:**\n- ${card.tags.includes('supabase') ? 'Supabase (PostgreSQL + Auth + Storage)' : 'Next.js API Routes'}\n- ${card.tags.includes('real-time') ? 'WebSocket for real-time updates' : 'REST API'}\n\n**Infrastructure:**\n- Vercel hosting\n- CDN for assets\n- Analytics pipeline`,
        chatgpt: `## Component Structure\n\n**Main Components:**\n1. \`${card.title.replace(/\s+/g, '')}Container\` - Main container\n2. \`${card.title.replace(/\s+/g, '')}UI\` - User interface\n3. \`${card.title.replace(/\s+/g, '')}Logic\` - Business logic\n\n**Data Flow:**\nUser Action → Component → API → Database → Response → UI Update\n\n**State Management:**\n- React hooks (useState, useEffect)\n- Context for global state\n- ${card.tags.includes('real-time') ? 'WebSocket subscriptions' : 'SWR for data fetching'}`,
        codex: `## Technical Architecture\n\n\`\`\`typescript\n// Component hierarchy\n${card.title.replace(/\s+/g, '')}/\n├── index.tsx          // Main component\n├── components/        // Sub-components\n├── hooks/            // Custom hooks\n├── utils/            // Helper functions\n└── types.ts          // TypeScript types\n\`\`\`\n\n**API Endpoints:**\n- GET /api/${card.title.toLowerCase().replace(/\s+/g, '-')}\n- POST /api/${card.title.toLowerCase().replace(/\s+/g, '-')}\n${card.tags.includes('real-time') ? '- WebSocket /ws/updates' : ''}`,
        augment: `## Integration Points\n\n**Dependencies:**\n${card.dependencies?.length ? card.dependencies.map(d => `- ${d}`).join('\n') : '- No dependencies - standalone feature'}\n\n**Integrations:**\n${card.tags.map(tag => `- ${tag.charAt(0).toUpperCase() + tag.slice(1)} integration`).join('\n')}\n\n**Data Sources:**\n- ${card.tags.includes('cms') ? 'Supabase CMS' : 'API endpoints'}\n- ${card.tags.includes('analytics') ? 'Analytics pipeline' : 'User events'}`
      },
      implementation: {
        claude: `## Implementation Plan\n\n**Phase 1: Setup (Day 1-2)**\n- Create component structure\n- Set up TypeScript types\n- Configure ${card.tags.includes('supabase') ? 'Supabase client' : 'API routes'}\n\n**Phase 2: Core Features (Day 3-${Math.ceil(card.estimatedDays * 0.6)})**\n- Implement main functionality\n- Add UI components\n- Integrate with backend\n\n**Phase 3: Polish (Day ${Math.ceil(card.estimatedDays * 0.6) + 1}-${card.estimatedDays})**\n- Error handling\n- Loading states\n- Responsive design`,
        chatgpt: `## User Flow\n\n1. **Entry Point:** User navigates to ${card.title}\n2. **Initial State:** ${card.tags.includes('auth') ? 'Check authentication' : 'Load data'}\n3. **Main Interaction:** User ${card.description.toLowerCase()}\n4. **Feedback:** Show success/error messages\n5. **Exit:** ${card.eventPhase === 'at-event' ? 'Return to event dashboard' : 'Navigate to next step'}\n\n**Edge Cases:**\n- No internet connection\n- Invalid input\n- Server errors`,
        codex: `## Code Structure\n\n\`\`\`typescript\n// src/components/${card.title.toLowerCase().replace(/\s+/g, '-')}/index.tsx\n\nexport default function ${card.title.replace(/\s+/g, '')}() {\n  // State management\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  \n  // Data fetching\n  useEffect(() => {\n    fetchData();\n  }, []);\n  \n  // Render\n  return (\n    <div className="container">\n      {/* UI components */}\n    </div>\n  );\n}\n\`\`\``,
        augment: `## Development Checklist\n\n**Setup:**\n- [ ] Create feature branch\n- [ ] Set up component files\n- [ ] Configure dependencies\n\n**Development:**\n- [ ] Implement core logic\n- [ ] Add UI components\n- [ ] Write unit tests\n- [ ] Add error handling\n\n**Integration:**\n- [ ] Connect to ${card.tags.includes('supabase') ? 'Supabase' : 'API'}\n- [ ] Test with real data\n- [ ] Add analytics tracking`
      },
      testing: {
        claude: `## Testing Strategy\n\n**Unit Tests:**\n- Component rendering\n- User interactions\n- State management\n- Helper functions\n\n**Integration Tests:**\n- API integration\n- ${card.tags.includes('supabase') ? 'Supabase queries' : 'Data flow'}\n- Error scenarios\n\n**E2E Tests:**\n- Complete user journey\n- ${card.eventPhase.replace('-', ' ')} workflow\n- Cross-browser compatibility`,
        chatgpt: `## Test Cases\n\n**Happy Path:**\n1. User successfully ${card.description.toLowerCase()}\n2. Data saves correctly\n3. UI updates as expected\n\n**Error Cases:**\n1. Network failure\n2. Invalid input\n3. Server error\n4. Timeout\n\n**Edge Cases:**\n1. Empty state\n2. Maximum data\n3. Concurrent users`,
        codex: `## Test Implementation\n\n\`\`\`typescript\n// __tests__/${card.title.toLowerCase().replace(/\s+/g, '-')}.test.tsx\n\nimport { render, screen } from '@testing-library/react';\nimport ${card.title.replace(/\s+/g, '')} from '../index';\n\ndescribe('${card.title}', () => {\n  it('renders correctly', () => {\n    render(<${card.title.replace(/\s+/g, '')} />);\n    expect(screen.getByText('...')).toBeInTheDocument();\n  });\n  \n  it('handles user interaction', async () => {\n    // Test implementation\n  });\n});\n\`\`\`\n\n**Coverage Target:** 80%+`,
        augment: `## QA Checklist\n\n**Functional:**\n- [ ] All features work as specified\n- [ ] Error messages are clear\n- [ ] Loading states display correctly\n\n**Performance:**\n- [ ] Page loads in < 2s\n- [ ] No memory leaks\n- [ ] Smooth animations\n\n**Accessibility:**\n- [ ] Keyboard navigation\n- [ ] Screen reader support\n- [ ] WCAG 2.1 AA compliance\n\n**Mobile:**\n- [ ] Responsive on all devices\n- [ ] Touch interactions work\n- [ ] Offline support ${card.eventPhase === 'at-event' ? '(critical)' : '(nice to have)'}`
      },
      acceptance: {
        claude: `## Acceptance Criteria\n\n**Core Functionality:**\n- ✓ ${card.title} is fully implemented\n- ✓ ${card.description}\n- ✓ Works on mobile and desktop\n- ✓ ${card.tags.includes('real-time') ? 'Real-time updates function correctly' : 'Data persists correctly'}\n\n**Quality:**\n- ✓ No critical bugs\n- ✓ Test coverage > 80%\n- ✓ Performance benchmarks met`,
        chatgpt: `## User Acceptance\n\n**User Can:**\n- ✓ Access ${card.title} from ${card.eventPhase.replace('-', ' ')} section\n- ✓ ${card.description}\n- ✓ See clear feedback for all actions\n- ✓ Use feature on mobile device\n\n**User Cannot:**\n- ✗ Break the feature with invalid input\n- ✗ Experience data loss\n- ✗ Get stuck in error states`,
        codex: `## Technical Acceptance\n\n**Code Quality:**\n- ✓ TypeScript strict mode passes\n- ✓ ESLint with no errors\n- ✓ All tests passing\n- ✓ Code reviewed and approved\n\n**Performance:**\n- ✓ Lighthouse score > 90\n- ✓ Bundle size optimized\n- ✓ No console errors\n\n**Deployment:**\n- ✓ Builds successfully\n- ✓ Works in production\n- ✓ Analytics tracking active`,
        augment: `## Definition of Done\n\n**Development:**\n- ✓ Feature complete per spec\n- ✓ Code reviewed\n- ✓ Tests written and passing\n- ✓ Documentation updated\n\n**Deployment:**\n- ✓ Deployed to staging\n- ✓ QA approved\n- ✓ Product owner approved\n- ✓ Ready for production\n\n**Post-Launch:**\n- ✓ Monitoring in place\n- ✓ Analytics tracking\n- ✓ Support documentation ready`
      }
    };

    return suggestions[sectionId]?.[ai] || `${AI_PARTICIPANTS[ai as keyof typeof AI_PARTICIPANTS].name}'s suggestion for this section...`;
  };

  const requestAIHelp = useCallback(async (sectionId: string) => {
    setIsRequestingAIHelp(true);

    // Simulate AI responses with real suggestions
    setTimeout(() => {
      setSections(prev => prev.map(section => {
        if (section.id !== sectionId) return section;

        const newSuggestions: Suggestion[] = card.assignedAIs.map(ai => ({
          id: `${sectionId}-${ai}-${Date.now()}`,
          sectionId,
          model: ai,
          prompt: `Generate ${section.name} for ${card.title}`,
          output_md: generateAISuggestion(ai, sectionId),
          tokens: Math.floor(Math.random() * 500) + 200, // Mock token count
          createdAt: new Date()
        }));

        return {
          ...section,
          suggestions: [...section.suggestions, ...newSuggestions],
          history: [
            ...section.history,
            {
              ts: new Date(),
              userId: 'current-user',
              action: 'suggestion_requested',
              meta: { models: card.assignedAIs }
            }
          ]
        };
      }));

      setIsRequestingAIHelp(false);
    }, 1500);
  }, [card]);

  const acceptAISuggestion = useCallback((sectionId: string, suggestionId: string, suggestion: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;

      // Add suggestion with attribution
      const timestamp = new Date().toLocaleString();
      const aiModel = section.suggestions.find(s => s.id === suggestionId)?.model || 'AI';
      const attribution = `\n\n---\n*Added by ${AI_PARTICIPANTS[aiModel as keyof typeof AI_PARTICIPANTS]?.name || aiModel} at ${timestamp}*\n\n`;

      const newContent = section.content_md + attribution + suggestion;
      const updated = { ...section, content_md: newContent };
      updated.status = calculateSectionStatus(updated);

      // Add to history
      updated.history = [
        ...section.history,
        {
          ts: new Date(),
          userId: 'current-user',
          action: 'suggestion_accepted',
          meta: { suggestionId, model: aiModel }
        }
      ];

      return updated;
    }));
  }, [calculateSectionStatus]);

  const handleSaveSpec = useCallback(() => {
    setIsSaving(true);

    // Simulate save
    setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);

      // Call parent callback
      onSaveSpec(card.id, sections);
    }, 500);
  }, [card.id, sections, onSaveSpec]);

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-orange-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📝 Build Specification</h2>
            <p className="text-sm text-gray-800 mt-1 font-medium">{card.title}</p>
            {lastSaved && (
              <p className="text-xs text-gray-600 mt-1">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-sm text-gray-600 animate-pulse">Saving...</span>
            )}
            <button
              onClick={handleSaveSpec}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              💾 Save Spec
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Section Navigation */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Sections</h3>
            <div className="space-y-1">
              {sections.map(section => {
                const statusIcon =
                  section.status === 'complete' ? '✓' :
                  section.status === 'in-progress' ? '◔' :
                  '▢';
                const statusColor =
                  section.status === 'complete' ? 'text-green-600' :
                  section.status === 'in-progress' ? 'text-yellow-600' :
                  'text-gray-400';

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-purple-100 text-purple-900 font-semibold'
                        : 'hover:bg-gray-100 text-gray-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{section.name}</span>
                      <span className={`text-sm font-bold ${statusColor}`}>{statusIcon}</span>
                    </div>
                    {section.suggestions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Array.from(new Set(section.suggestions.map(s => s.model))).map((model, idx) => (
                          <span key={idx} className="text-xs">
                            {AI_PARTICIPANTS[model].emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Assigned AIs */}
            <div className="mt-6 pt-6 border-t border-gray-300">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Assigned AIs</h3>
              <div className="space-y-2">
                {card.assignedAIs.map(ai => (
                  <div
                    key={ai}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className={`${AI_PARTICIPANTS[ai].color} text-white px-2 py-1 rounded text-xs font-semibold`}>
                      {AI_PARTICIPANTS[ai].emoji}
                    </span>
                    <span className="text-gray-900 font-medium">{AI_PARTICIPANTS[ai].name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentSection && (
              <>
                {/* Section Header */}
                <div className="border-b px-6 py-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentSection.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Status: <span className={
                          currentSection.status === 'complete' ? 'text-green-600 font-semibold' :
                          currentSection.status === 'in-progress' ? 'text-yellow-600 font-semibold' :
                          'text-gray-500'
                        }>
                          {currentSection.status === 'complete' ? '✓ Complete' :
                           currentSection.status === 'in-progress' ? '◔ In Progress' :
                           '▢ Not Started'}
                        </span>
                        {currentSection.rules.minWords && (
                          <span className="ml-2 text-gray-500">
                            • {currentSection.content_md.trim().split(/\s+/).filter(w => w.length > 0).length} / {currentSection.rules.minWords} words
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => requestAIHelp(currentSection.id)}
                      disabled={isRequestingAIHelp}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold"
                    >
                      {isRequestingAIHelp ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>AIs Thinking...</span>
                        </>
                      ) : (
                        <>
                          <span>🤖</span>
                          <span>Request AI Help</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Editor */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <textarea
                      value={currentSection.content_md}
                      onChange={(e) => updateSectionContent(currentSection.id, e.target.value)}
                      placeholder={`Start typing or Request AI Help...\n\nThis section requires ${currentSection.rules.minWords || 50} words minimum.`}
                      className="w-full h-full min-h-[400px] p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono text-sm text-gray-900 placeholder:text-gray-500 bg-white"
                    />
                  </div>

                  {/* AI Suggestions Sidebar */}
                  {currentSection.suggestions.length > 0 && (
                    <div className="w-96 border-l bg-gray-50 p-4 overflow-y-auto">
                      <h4 className="font-bold text-gray-900 mb-3 text-base">AI Suggestions</h4>
                      <div className="space-y-3">
                        {currentSection.suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="bg-white rounded-lg p-3 border-2 border-gray-200 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`${AI_PARTICIPANTS[suggestion.model].color} text-white px-2 py-1 rounded text-xs font-semibold`}>
                                  {AI_PARTICIPANTS[suggestion.model].emoji}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                  {AI_PARTICIPANTS[suggestion.model].name}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {suggestion.tokens} tok
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              Updated: {suggestion.createdAt.toLocaleTimeString()}
                            </p>
                            <div className="text-sm text-gray-900 mb-3 font-medium max-h-32 overflow-y-auto whitespace-pre-wrap">
                              {suggestion.output_md.substring(0, 200)}
                              {suggestion.output_md.length > 200 && '...'}
                            </div>
                            <button
                              onClick={() => acceptAISuggestion(currentSection.id, suggestion.id, suggestion.output_md)}
                              className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 transition-colors font-semibold"
                            >
                              ✓ Accept & Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

