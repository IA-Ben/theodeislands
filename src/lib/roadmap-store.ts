import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'roadmap.json');

export type Participant = 'claude' | 'chatgpt' | 'codex' | 'augment';

export interface RoadmapCardRecord {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'backlog' | 'planning' | 'in-progress' | 'review' | 'done';
  assignedAIs: Participant[];
  estimatedDays: number;
  dependencies: string[];
  tags: string[];
  createdAt: string;
  buildStatus?: 'not-started' | 'building' | 'testing' | 'deployed' | 'complete';
  userType: 'end-user' | 'creator-admin';
  eventPhase: 'before-event' | 'at-event' | 'after-event';
  generatedFiles?: string[];
  branchName?: string;
  completedAt?: string;
  aiReviews?: unknown;
  spec?: unknown;
}

interface RoadmapData {
  cards: RoadmapCardRecord[];
}

async function readRoadmapFile(): Promise<RoadmapData> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as RoadmapData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const empty: RoadmapData = { cards: [] };
      await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
      await fs.writeFile(DATA_PATH, JSON.stringify(empty, null, 2));
      return empty;
    }
    throw error;
  }
}

async function writeRoadmapFile(data: RoadmapData): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function getRoadmapCards(): Promise<RoadmapCardRecord[]> {
  const data = await readRoadmapFile();
  return data.cards;
}

export async function addRoadmapCard(input: Omit<RoadmapCardRecord, 'id' | 'createdAt'>): Promise<RoadmapCardRecord> {
  const data = await readRoadmapFile();

  const card: RoadmapCardRecord = {
    ...input,
    id: `feature-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  data.cards.push(card);

  await writeRoadmapFile(data);
  return card;
}

export async function updateRoadmapCard(id: string, patch: Partial<RoadmapCardRecord>): Promise<RoadmapCardRecord | null> {
  const data = await readRoadmapFile();
  const index = data.cards.findIndex(card => card.id === id);
  if (index === -1) return null;

  const current = data.cards[index];
  const updated: RoadmapCardRecord = {
    ...current,
    ...patch,
    createdAt: patch.createdAt ?? current.createdAt
  };

  data.cards[index] = updated;

  await writeRoadmapFile(data);
  return updated;
}

export async function deleteRoadmapCard(id: string): Promise<boolean> {
  const data = await readRoadmapFile();
  const initial = data.cards.length;
  data.cards = data.cards.filter(card => card.id !== id);
  await writeRoadmapFile(data);
  return data.cards.length < initial;
}
