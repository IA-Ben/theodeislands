export type AIParticipant = 'claude' | 'chatgpt' | 'codex' | 'augment';
export type UserType = 'end-user' | 'creator-admin';
export type EventPhase = 'before-event' | 'at-event' | 'after-event';

export interface SpecSection {
  id: string;
  title: string;
  content: string;
  aiContributions: Array<{
    ai: AIParticipant;
    suggestion: string;
    timestamp: string;
  }>;
}

export interface AIReview {
  ai: AIParticipant;
  timestamp: string;
  approach: string;
  concerns: string[];
  suggestions: string[];
  estimatedEffort: string;
  approved: boolean;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'backlog' | 'planning' | 'in-progress' | 'review' | 'done';
  assignedAIs: AIParticipant[];
  estimatedDays: number;
  dependencies: string[];
  tags: string[];
  createdAt: string;
  aiReviews?: AIReview[];
  spec?: SpecSection[];
  buildStatus?: 'not-started' | 'building' | 'testing' | 'deployed';
  userType: UserType;
  eventPhase: EventPhase;
}

export type RoadmapCardInput = Omit<FeatureCard, 'id' | 'createdAt'>;
