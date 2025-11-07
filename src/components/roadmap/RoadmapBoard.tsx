'use client';

/**
 * Roadmap Board - Drag & Drop Feature Planning
 * Built by Augment Code for collaborative AI feature planning
 */

import React, { useState, useCallback, DragEvent, useMemo, useEffect } from 'react';
import NewFeatureCardForm from './NewFeatureCardForm';
import SpecBuilderPanel from './SpecBuilderPanel';
import BuildPanel from './BuildPanel';
import AICollaborationPanel from './AICollaborationPanel';
import RoadmapFilters, { type FilterState } from './RoadmapFilters';

export type UserType = 'end-user' | 'creator-admin';
export type EventPhase = 'before-event' | 'at-event' | 'after-event';

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'backlog' | 'planning' | 'in-progress' | 'review' | 'done';
  assignedAIs: ('claude' | 'chatgpt' | 'codex' | 'augment')[];
  estimatedDays: number;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  aiReviews?: AIReview[];
  spec?: SpecSection[];
  buildStatus?: 'not-started' | 'building' | 'testing' | 'deployed' | 'complete';
  generatedFiles?: string[];
  branchName?: string;
  completedAt?: Date;
  userType: UserType;
  eventPhase: EventPhase;
}

export interface SpecSection {
  id: string;
  title: string;
  content: string;
  aiContributions: {
    ai: 'claude' | 'chatgpt' | 'codex' | 'augment';
    suggestion: string;
    timestamp: Date;
  }[];
}

export interface AIReview {
  ai: 'claude' | 'chatgpt' | 'codex' | 'augment';
  timestamp: Date;
  approach: string;
  concerns: string[];
  suggestions: string[];
  estimatedEffort: string;
  approved: boolean;
}

const COLUMNS = [
  { id: 'backlog', title: '📋 Backlog', color: 'bg-gray-100' },
  { id: 'planning', title: '🎯 Planning', color: 'bg-blue-100' },
  { id: 'in-progress', title: '🚀 In Progress', color: 'bg-yellow-100' },
  { id: 'review', title: '👀 Review', color: 'bg-purple-100' },
  { id: 'done', title: '✅ Done', color: 'bg-green-100' }
] as const;

const AI_COLORS = {
  claude: 'bg-purple-500',
  chatgpt: 'bg-green-500',
  codex: 'bg-blue-500',
  augment: 'bg-orange-500'
};

const AI_EMOJIS = {
  claude: '🏗️',
  chatgpt: '📚',
  codex: '💻',
  augment: '🎯'
};

const PRIORITY_COLORS = {
  high: 'border-red-500 bg-red-50',
  medium: 'border-yellow-500 bg-yellow-50',
  low: 'border-blue-500 bg-blue-50'
};

type FeatureCardDTO = Omit<FeatureCard, 'createdAt' | 'aiReviews' | 'spec' | 'completedAt'> & {
  createdAt: string;
  aiReviews?: (Omit<AIReview, 'timestamp'> & { timestamp: string })[];
  spec?: (Omit<SpecSection, 'aiContributions'> & {
    aiContributions: Array<Omit<SpecSection['aiContributions'][number], 'timestamp'> & { timestamp: string }>;
  })[];
  completedAt?: string;
};

const mapReviewFromDTO = (review: any): AIReview => ({
  ...review,
  timestamp: new Date(review.timestamp)
});

const mapSpecFromDTO = (section: any): SpecSection => ({
  ...section,
  aiContributions: section.aiContributions.map((contrib: any) => ({
    ...contrib,
    timestamp: new Date(contrib.timestamp)
  }))
});

const fromDTO = (dto: FeatureCardDTO): FeatureCard => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
  aiReviews: dto.aiReviews?.map(mapReviewFromDTO),
  spec: dto.spec?.map(mapSpecFromDTO)
});

const toDTO = (card: FeatureCard): FeatureCardDTO => ({
  ...card,
  createdAt: card.createdAt.toISOString(),
  completedAt: card.completedAt ? card.completedAt.toISOString() : undefined,
  aiReviews: card.aiReviews?.map(review => ({
    ...review,
    timestamp: review.timestamp.toISOString()
  })),
  spec: card.spec?.map(section => ({
    ...section,
    aiContributions: section.aiContributions.map(contrib => ({
      ...contrib,
      timestamp: contrib.timestamp.toISOString()
    }))
  }))
});

const mergeCardsById = (existing: FeatureCard[], incoming: FeatureCard[]): FeatureCard[] => {
  const map = new Map(existing.map(card => [card.id, card] as const));
  for (const card of incoming) {
    map.set(card.id, card);
  }
  return Array.from(map.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

const SAMPLE_CARDS: FeatureCard[] = [
  // P0 — FOUNDATIONS (2-3 weeks)
  {
    id: 'p0-1',
    title: 'Brand Kit + 3D UI Shell',
    description: 'Ode Islands brand kit with 3D UI shell in the Ode aesthetic using Three.js',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex', 'augment'],
    estimatedDays: 5,
    dependencies: [],
    tags: ['ui', '3d', 'branding', 'three.js'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },
  {
    id: 'p0-2',
    title: 'CMS v1 - Content Types',
    description: 'Supabase CMS for Chapters, Sub-chapters, Stamps, Keepsakes, Quests, and Merch',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex', 'augment'],
    estimatedDays: 6,
    dependencies: [],
    tags: ['cms', 'supabase', 'backend', 'content'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p0-3',
    title: 'Asset Pipeline',
    description: 'Upload, optimize, and CDN delivery for images, videos, and 3D assets',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 4,
    dependencies: [],
    tags: ['cdn', 'assets', 'optimization', 'pipeline'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p0-4',
    title: 'Analytics Baseline + GDPR',
    description: 'Product analytics pipeline with GDPR consent and privacy compliance',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'augment'],
    estimatedDays: 3,
    dependencies: [],
    tags: ['analytics', 'gdpr', 'privacy', 'compliance'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p0-5',
    title: 'Demo Mode Toggle',
    description: 'Demo mode with scripted data paths for Southbank presentation',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 2,
    dependencies: [],
    tags: ['demo', 'feature-flags', 'testing'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },

  // P1 — MVP DEMO (4-6 weeks) - Before Event
  {
    id: 'p1-1',
    title: 'Experience Rails (Before/Event/After)',
    description: 'Navigation structure for Before/Event/After experience within current app',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex', 'augment'],
    estimatedDays: 4,
    dependencies: ['p0-1'],
    tags: ['ui', 'navigation', 'structure'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },
  {
    id: 'p1-2',
    title: 'Pre-show Chapters',
    description: '3-5 episodic chapter cards with branching micro-games',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'chatgpt', 'codex'],
    estimatedDays: 8,
    dependencies: ['p0-2', 'p1-1'],
    tags: ['chapters', 'storytelling', 'games', 'interactive'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },
  {
    id: 'p1-3',
    title: 'Memory Wallet - Collect & View',
    description: 'Collect stamps/keepsakes, view collection, progress bar, simple gamification',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex', 'augment'],
    estimatedDays: 6,
    dependencies: ['p0-2'],
    tags: ['wallet', 'collection', 'gamification', 'progress'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },
  {
    id: 'p1-4',
    title: 'AI Suggest Feed + Guide v1',
    description: 'AI-powered feed with narrative beats, FAQs, and in-world Guides (Ode Islands lore)',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'chatgpt', 'augment'],
    estimatedDays: 7,
    dependencies: [],
    tags: ['ai', 'llm', 'feed', 'guide', 'narrative'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },
  {
    id: 'p1-5',
    title: 'Ticket Unlock System',
    description: 'Manual code unlock + partner auth stub (no accounts for demo)',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex'],
    estimatedDays: 4,
    dependencies: [],
    tags: ['auth', 'unlock', 'magic-link', 'authless'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },
  {
    id: 'p1-6',
    title: 'AR Preview Effects',
    description: '1-2 lightweight AR effects (e.g., stamp capture) as optional garnish',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 5,
    dependencies: ['p1-3'],
    tags: ['ar', 'mobile', 'camera', 'optional'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },
  {
    id: 'p1-7',
    title: 'Merch Links + Presenter Script',
    description: 'Merch integration links and demo presenter script for Southbank',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['chatgpt', 'augment'],
    estimatedDays: 2,
    dependencies: [],
    tags: ['merch', 'demo', 'presentation'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'before-event'
  },

  // P1 — MVP DEMO - At Event
  {
    id: 'p1-8',
    title: 'Event Companion Dashboard',
    description: 'Live event companion experience with real-time updates and interactions',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex', 'augment'],
    estimatedDays: 6,
    dependencies: ['p1-1', 'p1-4'],
    tags: ['companion', 'real-time', 'event', 'dashboard'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'at-event'
  },

  // P1 — MVP DEMO - After Event
  {
    id: 'p1-9',
    title: 'Memory Wallet - Share',
    description: 'Share collected memories and keepsakes on social media',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 3,
    dependencies: ['p1-3'],
    tags: ['sharing', 'social', 'memories'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'after-event'
  },

  // P2 — LIVE PILOT (single showing)
  {
    id: 'p2-1',
    title: 'Partner Webhook Auto-unlock',
    description: 'Partner webhook integration for automatic ticket unlock',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex'],
    estimatedDays: 4,
    dependencies: ['p1-5'],
    tags: ['webhook', 'integration', 'ticketing', 'api'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p2-2',
    title: 'Arrival Check-in',
    description: 'On-site arrival check-in flow for event attendees',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 3,
    dependencies: ['p2-1'],
    tags: ['check-in', 'on-site', 'qr-code'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'at-event'
  },
  {
    id: 'p2-3',
    title: 'On-site Capture System',
    description: 'Capture photos/moments during event for post-event Memory Book',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 5,
    dependencies: ['p1-3'],
    tags: ['capture', 'photos', 'on-site', 'memories'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'at-event'
  },
  {
    id: 'p2-4',
    title: 'Post-event Memory Book',
    description: 'Auto-curated Memory Book with collected moments, stamps, and achievements',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'chatgpt', 'augment'],
    estimatedDays: 6,
    dependencies: ['p2-3', 'p1-3'],
    tags: ['memory-book', 'curation', 'ai', 'achievements'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'after-event'
  },
  {
    id: 'p2-5',
    title: 'Achievements System',
    description: 'Achievements for chapter completion and on-site actions',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 4,
    dependencies: ['p1-2', 'p1-3'],
    tags: ['achievements', 'gamification', 'rewards'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'after-event'
  },
  {
    id: 'p2-6',
    title: 'KPI Dashboard',
    description: 'Track activation %, items per user, merch CTR, NPS, and stability metrics',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'augment'],
    estimatedDays: 5,
    dependencies: ['p0-4'],
    tags: ['kpi', 'analytics', 'dashboard', 'metrics'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'after-event'
  },

  // P3 — PLATFORMISE FOR RUNS
  {
    id: 'p3-1',
    title: 'Multi-event/Venue Support',
    description: 'Support multiple events and venues with separate configurations',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'codex', 'augment'],
    estimatedDays: 7,
    dependencies: ['p2-1'],
    tags: ['multi-tenant', 'venues', 'events', 'platform'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p3-2',
    title: 'Theming System',
    description: 'Custom theming per event/venue with brand colors, fonts, and assets',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['claude', 'codex'],
    estimatedDays: 5,
    dependencies: ['p0-1', 'p3-1'],
    tags: ['theming', 'branding', 'customization'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p3-3',
    title: 'Template Editor',
    description: 'Visual editor for creating scenes, cards, and chapter templates',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'chatgpt', 'codex'],
    estimatedDays: 8,
    dependencies: ['p0-2', 'p3-1'],
    tags: ['editor', 'templates', 'cms', 'visual'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p3-4',
    title: 'Roles & Permissions',
    description: 'User roles and permissions system for team collaboration',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['claude', 'codex'],
    estimatedDays: 5,
    dependencies: ['p3-1'],
    tags: ['auth', 'roles', 'permissions', 'rbac'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p3-5',
    title: 'Data Export',
    description: 'Export analytics, user data, and content for reporting',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 3,
    dependencies: ['p2-6'],
    tags: ['export', 'data', 'reporting', 'csv'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'after-event'
  },
  {
    id: 'p3-6',
    title: 'Offline Queue',
    description: 'Offline queue for spotty venue connectivity with sync when online',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 6,
    dependencies: ['p2-2', 'p2-3'],
    tags: ['offline', 'pwa', 'sync', 'queue'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'at-event'
  },
  {
    id: 'p3-7',
    title: 'Venue Partner SDK',
    description: 'SDK/embed for venue partners to integrate Ode Islands experience',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['claude', 'codex', 'augment'],
    estimatedDays: 7,
    dependencies: ['p3-1'],
    tags: ['sdk', 'embed', 'api', 'partners'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p3-8',
    title: 'ERC-1155 Keepsakes (Optional)',
    description: 'Blockchain keepsakes with custodial wallet (optional feature)',
    priority: 'low',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 10,
    dependencies: ['p1-3'],
    tags: ['blockchain', 'nft', 'erc-1155', 'wallet', 'optional'],
    createdAt: new Date(),
    userType: 'end-user',
    eventPhase: 'after-event'
  },

  // P4 — LICENSE & SCALE
  {
    id: 'p4-1',
    title: 'Pricing Tiers',
    description: 'Pricing tiers for different event sizes and feature sets',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['claude', 'augment'],
    estimatedDays: 4,
    dependencies: ['p3-1'],
    tags: ['pricing', 'tiers', 'monetization', 'saas'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p4-2',
    title: 'Sandbox Tenant',
    description: 'Sandbox environment for testing and demos without affecting production',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 3,
    dependencies: ['p3-1'],
    tags: ['sandbox', 'testing', 'demo', 'environment'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p4-3',
    title: 'Documentation & Guides',
    description: 'Comprehensive docs, API reference, and getting started guides',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['chatgpt', 'augment'],
    estimatedDays: 6,
    dependencies: ['p3-3', 'p3-7'],
    tags: ['docs', 'documentation', 'guides', 'api'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p4-4',
    title: 'Support Playbook',
    description: 'Customer support playbook with FAQs, troubleshooting, and escalation',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['chatgpt', 'augment'],
    estimatedDays: 4,
    dependencies: [],
    tags: ['support', 'playbook', 'customer-service'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p4-5',
    title: 'Security Review',
    description: 'Comprehensive security audit and penetration testing',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 5,
    dependencies: ['p3-4'],
    tags: ['security', 'audit', 'pentest', 'compliance'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p4-6',
    title: 'DPA Pack',
    description: 'Data Processing Agreement pack for enterprise customers',
    priority: 'medium',
    status: 'backlog',
    assignedAIs: ['chatgpt', 'augment'],
    estimatedDays: 3,
    dependencies: ['p0-4'],
    tags: ['dpa', 'legal', 'compliance', 'gdpr'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  },
  {
    id: 'p4-7',
    title: 'SLOs & Observability',
    description: 'Service Level Objectives, monitoring, alerting, and observability stack',
    priority: 'high',
    status: 'backlog',
    assignedAIs: ['codex', 'augment'],
    estimatedDays: 6,
    dependencies: ['p2-6'],
    tags: ['slo', 'monitoring', 'observability', 'devops'],
    createdAt: new Date(),
    userType: 'creator-admin',
    eventPhase: 'before-event'
  }
];

// Version for forcing reload of new cards
const ROADMAP_VERSION = '2.0-ode-islands';

// Load cards from localStorage or use sample cards
const loadCards = (): FeatureCard[] => {
  if (typeof window === 'undefined') return SAMPLE_CARDS;

  try {
    const savedVersion = localStorage.getItem('roadmap-version');
    const saved = localStorage.getItem('roadmap-cards');

    // If version doesn't match, use new sample cards
    if (savedVersion !== ROADMAP_VERSION) {
      console.log('🔄 New roadmap version detected, loading fresh cards');
      localStorage.setItem('roadmap-version', ROADMAP_VERSION);
      localStorage.setItem('roadmap-cards', JSON.stringify(SAMPLE_CARDS));
      return SAMPLE_CARDS;
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      return parsed.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        aiReviews: card.aiReviews?.map((review: any) => ({
          ...review,
          timestamp: new Date(review.timestamp)
        })),
        spec: card.spec?.map((section: any) => ({
          ...section,
          aiContributions: section.aiContributions?.map((contrib: any) => ({
            ...contrib,
            timestamp: new Date(contrib.timestamp)
          }))
        }))
      }));
    }
  } catch (error) {
    console.error('Error loading cards from localStorage:', error);
  }

  return SAMPLE_CARDS;
};

export default function RoadmapBoard() {
  const [cards, setCards] = useState<FeatureCard[]>(loadCards);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [specBuilderCard, setSpecBuilderCard] = useState<FeatureCard | null>(null);
  const [editingCard, setEditingCard] = useState<FeatureCard | null>(null);
  const [showBuildPanel, setShowBuildPanel] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{
    ai: 'claude' | 'chatgpt' | 'codex' | 'augment';
    timestamp: Date;
    content: string;
    type: 'discussion' | 'decision' | 'code' | 'test' | 'error';
  }>>([]);
  const [filters, setFilters] = useState<FilterState>({
    userType: 'all',
    eventPhase: 'all'
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Hydrate from server-side roadmap store
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/roadmap');
        if (!response.ok) {
          throw new Error(`Failed to load roadmap: ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled && Array.isArray(data.cards)) {
          const fetched = (data.cards as FeatureCardDTO[]).map(fromDTO);
          setCards(prev => mergeCardsById(prev, fetched));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load roadmap from API', error);
          setLoadError('Unable to sync roadmap with server. Using local data.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('roadmap-cards', JSON.stringify(cards));
        console.log('💾 Roadmap saved to localStorage:', cards.length, 'cards');
      } catch (error) {
        console.error('Error saving cards to localStorage:', error);
      }
    }
  }, [cards]);

  // Keyboard shortcut: Shift + A to toggle AI Collaboration Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAIPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';

    // Add card data for Build Panel
    const card = cards.find(c => c.id === cardId);
    if (card) {
      e.dataTransfer.setData('application/json', JSON.stringify(card));
    }
  }, [cards]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, newStatus: FeatureCard['status']) => {
    e.preventDefault();
    
    if (!draggedCard) return;

    setCards(prev => prev.map(card => 
      card.id === draggedCard 
        ? { ...card, status: newStatus }
        : card
    ));

    const updateStatus = async (cardId: string, status: FeatureCard['status']) => {
      try {
        await fetch('/api/roadmap', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cardId, patch: { status } })
        });
      } catch (error) {
        console.error('Failed to update card status', error);
      }
    };

    updateStatus(draggedCard, newStatus);

    setDraggedCard(null);
  }, [draggedCard]);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
  }, []);

  // Filter cards based on active filters
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const userTypeMatch = filters.userType === 'all' || card.userType === filters.userType;
      const eventPhaseMatch = filters.eventPhase === 'all' || card.eventPhase === filters.eventPhase;
      return userTypeMatch && eventPhaseMatch;
    });
  }, [cards, filters]);

  const getCardsByStatus = useCallback((status: FeatureCard['status']) => {
    return filteredCards.filter(card => card.status === status);
  }, [filteredCards]);

  const handleCreateCard = useCallback(async (newCard: Omit<FeatureCard, 'id' | 'createdAt' | 'aiReviews'>) => {
    const payload: any = {
      ...newCard,
      buildStatus: newCard.buildStatus ?? 'not-started'
    };

    try {
      setIsSyncing(true);
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Failed to create card: ${response.status}`);
      }
      const data = await response.json();
      if (data.card) {
        const card = fromDTO(data.card as FeatureCardDTO);
        setCards(prev => [...prev, card]);
      }
    } catch (error) {
      console.error('Failed to create roadmap card', error);
      // Fallback locally to avoid losing user input
      const fallback: FeatureCard = {
        ...newCard,
        id: `local-${Date.now()}`,
        createdAt: new Date(),
        buildStatus: newCard.buildStatus ?? 'not-started'
      };
      setCards(prev => [...prev, fallback]);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleEditCard = useCallback((cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setEditingCard(card);
    }
  }, [cards]);

  const handleUpdateCard = useCallback(async (updatedCard: FeatureCard) => {
    setCards(prev => prev.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    ));
    setEditingCard(null);

    try {
      await fetch('/api/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: updatedCard.id, patch: toDTO(updatedCard) })
      });
    } catch (error) {
      console.error('Failed to update roadmap card', error);
    }
  }, []);

  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      setCards(prev => prev.filter(card => card.id !== cardId));
      try {
        await fetch(`/api/roadmap?id=${encodeURIComponent(cardId)}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to delete roadmap card', error);
      }
    }
  }, []);

  const handleBuildSpec = useCallback((cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setSpecBuilderCard(card);
    }
  }, [cards]);

  const handleSaveSpec = useCallback((cardId: string, spec: SpecSection[]) => {
    setCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, spec } : card
    ));
    setSpecBuilderCard(null);

    fetch('/api/roadmap', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: cardId,
        patch: {
          spec: spec.map(section => ({
            ...section,
            aiContributions: section.aiContributions.map(contrib => ({
              ...contrib,
              timestamp: contrib.timestamp.toISOString()
            }))
          }))
        }
      })
    }).catch(err => console.error('Failed to save spec', err));
  }, []);

  const handleCardDroppedInBuildPanel = useCallback((card: FeatureCard) => {
    // Update card status to building
    setCards(prev => prev.map(c =>
      c.id === card.id ? { ...c, buildStatus: 'building', status: 'in-progress' } : c
    ));

    fetch('/api/roadmap', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: card.id,
        patch: {
          buildStatus: 'building',
          status: 'in-progress'
        }
      })
    }).catch(err => console.error('Failed to mark card building', err));

    // Add AI collaboration message
    setAiMessages(prev => [...prev, {
      ai: 'augment',
      timestamp: new Date(),
      content: `🔨 Starting build for: ${card.title}\n\nAssigned AIs: ${card.assignedAIs.join(', ')}\n\nInitiating multi-AI collaboration...`,
      type: 'discussion'
    }]);

    // Auto-open AI panel when build starts
    setShowAIPanel(true);
  }, []);

  const handleBuildComplete = useCallback((cardId: string, result: {
    files: string[];
    branchName: string;
    aiContributions: any;
  }) => {
    console.log('🎉 Build complete for card:', cardId, result);

    // Update card to done status
    setCards(prev => prev.map(c =>
      c.id === cardId ? {
        ...c,
        status: 'done',
        buildStatus: 'complete',
        generatedFiles: result.files,
        branchName: result.branchName,
        completedAt: new Date()
      } : c
    ));

    fetch('/api/roadmap', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: cardId,
        patch: {
          status: 'done',
          buildStatus: 'complete',
          generatedFiles: result.files,
          branchName: result.branchName,
          completedAt: new Date().toISOString()
        }
      })
    }).catch(err => console.error('Failed to persist build completion', err));

    // Add completion message to AI panel
    setAiMessages(prev => [...prev, {
      ai: 'augment',
      timestamp: new Date(),
      content: `🎉 Build complete!\n\n✅ Files:\n${result.files.join('\n')}\n\n🌿 Branch: ${result.branchName}\n\nCard moved to Done! 🚀`,
      type: 'decision'
    }]);

    // Save to localStorage
    setTimeout(() => {
      const updatedCards = cards.map(c =>
        c.id === cardId ? {
          ...c,
          status: 'done',
          buildStatus: 'complete',
          generatedFiles: result.files,
          branchName: result.branchName,
          completedAt: new Date()
        } : c
      );
      localStorage.setItem('roadmap-cards', JSON.stringify(updatedCards));
    }, 100);
  }, [cards]);

  const handleClearData = useCallback(() => {
    if (confirm('⚠️ This will delete all cards and reset to sample data. Are you sure?')) {
      localStorage.removeItem('roadmap-cards');
      setCards(SAMPLE_CARDS);
      console.log('🗑️ Roadmap data cleared, reset to sample cards');
    }
  }, []);

  const requestAIReview = useCallback(async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    console.log('🤖 Requesting AI review for card:', cardId);

    try {
      const response = await fetch('http://localhost:3002/api/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-review',
          data: {
            cardId: card.id,
            title: card.title,
            description: card.description,
            spec: card.spec,
            assignedAIs: card.assignedAIs
          }
        })
      });

      if (response.ok) {
        console.log('✅ AI review requested successfully');
        // In a real implementation, we'd update the card with reviews
      } else {
        console.warn('⚠️ AI collaboration API not available');
      }
    } catch (error) {
      console.warn('⚠️ Could not connect to AI collaboration API:', error);
    }
  }, [cards]);

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      {/* AI Collaboration Panel - Left Side */}
      <div className={`fixed left-0 top-0 h-full transition-transform duration-300 ease-in-out z-40 ${
        showAIPanel ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AICollaborationPanel
          messages={aiMessages}
          isActive={aiMessages.length > 0 && aiMessages[aiMessages.length - 1].timestamp.getTime() > Date.now() - 60000}
        />
      </div>

      {/* Toggle AI Panel Button - Left Side */}
      <button
        onClick={() => setShowAIPanel(!showAIPanel)}
        className={`fixed top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-6 shadow-lg hover:shadow-xl transition-all z-50 flex flex-col items-center gap-2 ${
          showAIPanel ? 'left-[500px] rounded-r-lg' : 'left-0 rounded-r-lg animate-pulse'
        }`}
        title={showAIPanel ? 'Hide AI Panel (Shift+A)' : 'Show AI Panel (Shift+A)'}
      >
        <span className="text-2xl">{showAIPanel ? '◀️' : '▶️'}</span>
        <div className="flex flex-col gap-0.5">
          {(showAIPanel ? 'HIDE' : 'AI').split('').map((letter, i) => (
            <span key={i} className="font-bold text-xs leading-none">{letter}</span>
          ))}
        </div>
      </button>

      {/* Main Content Area */}
      <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🗺️ Feature Roadmap</h1>
            <p className="text-gray-600 mt-1">Drag cards between columns • Click to edit • Request AI reviews</p>
            <p className="text-xs text-gray-500 mt-1">💾 Auto-saved to localStorage • {cards.length} cards total</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearData}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm"
              title="Reset to sample data"
            >
              🗑️ Clear Data
            </button>
            <button
              onClick={() => setShowNewCardForm(true)}
              className="bg-gradient-to-r from-purple-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              + New Feature Card
            </button>
          </div>
        </div>
        {loadError && (
          <div className="mt-4 rounded-md border border-yellow-400/60 bg-yellow-200/40 px-4 py-2 text-sm text-yellow-900">
            {loadError}
          </div>
        )}
        {isSyncing && (
          <div className="mt-4 rounded-md border border-blue-400/60 bg-blue-200/30 px-4 py-2 text-sm text-blue-900">
            Syncing roadmap with server...
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="max-w-[1800px] mx-auto">
        <RoadmapFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Board */}
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-5 gap-4">
          {COLUMNS.map(column => {
            const columnCards = getCardsByStatus(column.id as FeatureCard['status']);
            
            return (
              <div
                key={column.id}
                className={`${column.color} rounded-lg p-4 min-h-[600px]`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as FeatureCard['status'])}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">{column.title}</h2>
                  <span className="bg-white px-2 py-1 rounded text-sm font-semibold text-gray-600">
                    {columnCards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {columnCards.map(card => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${PRIORITY_COLORS[card.priority]} cursor-move hover:shadow-md transition-all ${
                        draggedCard === card.id ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm flex-1">
                          {card.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          card.priority === 'high' ? 'bg-red-100 text-red-800' :
                          card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {card.priority}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {card.description}
                      </p>

                      {/* User Type & Event Phase Badges */}
                      <div className="flex gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          card.userType === 'end-user'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {card.userType === 'end-user' ? '👤 End User' : '⚙️ Admin'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          card.eventPhase === 'before-event' ? 'bg-green-100 text-green-700' :
                          card.eventPhase === 'at-event' ? 'bg-orange-100 text-orange-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {card.eventPhase === 'before-event' ? '📅 Before' :
                           card.eventPhase === 'at-event' ? '🎪 During' :
                           '📊 After'}
                        </span>
                      </div>

                      {/* Tags */}
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {card.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Assigned AIs */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Assigned:</span>
                        <div className="flex gap-1">
                          {card.assignedAIs.map(ai => (
                            <span
                              key={ai}
                              className={`${AI_COLORS[ai]} text-white text-xs px-2 py-1 rounded`}
                              title={ai}
                            >
                              {AI_EMOJIS[ai]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Estimate */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>⏱️ {card.estimatedDays}d</span>
                        {card.dependencies.length > 0 && (
                          <span>🔗 {card.dependencies.length} deps</span>
                        )}
                      </div>

                      {/* AI Reviews */}
                      {card.aiReviews && card.aiReviews.length > 0 && (
                        <div className="border-t pt-2 mt-2">
                          <div className="text-xs text-gray-600 mb-1">AI Reviews:</div>
                          <div className="flex gap-1">
                            {card.aiReviews.map(review => (
                              <span
                                key={review.ai}
                                className={`text-xs px-2 py-1 rounded ${
                                  review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {AI_EMOJIS[review.ai]} {review.approved ? '✓' : '⏳'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Build Status */}
                      {card.spec && (
                        <div className="mb-2 text-xs text-green-600 flex items-center gap-1">
                          <span>✓</span>
                          <span>Spec Complete</span>
                        </div>
                      )}
                      {card.buildStatus && card.buildStatus !== 'not-started' && (
                        <div className="mb-2 text-xs flex items-center gap-1">
                          {card.buildStatus === 'building' && <span className="text-blue-600 animate-pulse">🔨 Building...</span>}
                          {card.buildStatus === 'testing' && <span className="text-yellow-600">🧪 Testing...</span>}
                          {card.buildStatus === 'deployed' && <span className="text-green-600">✓ Deployed</span>}
                          {card.buildStatus === 'complete' && (
                            <div className="flex flex-col gap-1">
                              <span className="text-green-600 font-semibold">✅ Build Complete!</span>
                              {card.generatedFiles && card.generatedFiles.length > 0 && (
                                <span className="text-gray-600">📁 {card.generatedFiles.length} files</span>
                              )}
                              {card.branchName && (
                                <span className="text-purple-600">🌿 {card.branchName}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col gap-2 mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCard(card.id)}
                            className="flex-1 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleBuildSpec(card.id)}
                            className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors font-semibold"
                          >
                            📝 Spec
                          </button>
                          <button
                            onClick={() => requestAIReview(card.id)}
                            className="flex-1 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors font-semibold"
                          >
                            🤖 Review
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          💡 Drag to Build Panel to start →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Card Form Modal */}
      {showNewCardForm && (
        <NewFeatureCardForm
          onClose={() => setShowNewCardForm(false)}
          onSubmit={handleCreateCard}
        />
      )}

      {/* Edit Card Form Modal */}
      {editingCard && (
        <NewFeatureCardForm
          onClose={() => setEditingCard(null)}
          onSubmit={handleUpdateCard as any}
          existingCard={editingCard}
        />
      )}

      {/* Spec Builder Panel */}
      {specBuilderCard && (
        <SpecBuilderPanel
          card={specBuilderCard}
          onClose={() => setSpecBuilderCard(null)}
          onSaveSpec={handleSaveSpec as any}
        />
      )}
      </div>
      {/* End Main Content Area */}

      {/* Build Panel with slide animation - Right Side */}
      <div className={`fixed right-0 top-0 h-full transition-transform duration-300 ease-in-out z-40 ${
        showBuildPanel ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <BuildPanel
          onCardDropped={handleCardDroppedInBuildPanel}
          onBuildComplete={handleBuildComplete}
        />
      </div>

      {/* Toggle Build Panel Button - Right Side */}
      <button
        onClick={() => setShowBuildPanel(!showBuildPanel)}
        className={`fixed top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-orange-600 text-white px-3 py-6 shadow-lg hover:shadow-xl transition-all z-50 flex flex-col items-center gap-2 ${
          showBuildPanel ? 'right-[600px] rounded-l-lg' : 'right-0 rounded-l-lg animate-pulse'
        }`}
        title={showBuildPanel ? 'Hide Build Panel' : 'Show Build Panel'}
      >
        <span className="text-2xl">{showBuildPanel ? '▶️' : '◀️'}</span>
        <div className="flex flex-col gap-0.5">
          {(showBuildPanel ? 'HIDE' : 'BUILD').split('').map((letter, i) => (
            <span key={i} className="font-bold text-xs leading-none">{letter}</span>
          ))}
        </div>
      </button>
    </div>
  );
}
