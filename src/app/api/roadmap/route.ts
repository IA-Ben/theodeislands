import { NextRequest, NextResponse } from 'next/server';
import {
  getRoadmapCards,
  addRoadmapCard,
  updateRoadmapCard,
  deleteRoadmapCard,
  type RoadmapCardRecord
} from '@/lib/roadmap-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cards = await getRoadmapCards();
  return NextResponse.json({ success: true, cards });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Omit<RoadmapCardRecord, 'id' | 'createdAt'>;
  const card = await addRoadmapCard(payload);
  return NextResponse.json({ success: true, card });
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as { id: string; patch: Partial<RoadmapCardRecord> };
  const updated = await updateRoadmapCard(body.id, body.patch);
  if (!updated) {
    return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, card: updated });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
  }
  const removed = await deleteRoadmapCard(id);
  return NextResponse.json({ success: removed });
}
