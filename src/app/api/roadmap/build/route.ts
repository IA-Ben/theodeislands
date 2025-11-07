import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface BuildPayload {
  cardId: string;
  branchName: string;
  featureTitle: string;
  summary: string;
  discussion: Array<{
    ai: string;
    type: string;
    content: string;
    phase: string;
    timestamp: string;
  }>;
  generatedFiles?: Array<{
    path: string;
    contents: string;
  }>;
}

const GENERATED_ROOT = path.join(process.cwd(), 'generated', 'roadmap');

export async function POST(request: Request) {
  const payload = (await request.json()) as BuildPayload;

  await fs.mkdir(GENERATED_ROOT, { recursive: true });

  const branchDir = path.join(GENERATED_ROOT, payload.branchName.replace(/[^a-zA-Z0-9-_]/g, '-'));
  await fs.mkdir(branchDir, { recursive: true });

  const summaryFile = path.join(branchDir, 'build-summary.md');
  const transcriptFile = path.join(branchDir, 'ai-discussion.json');

  const summaryContent = `# ${payload.featureTitle}\n\nBranch: ${payload.branchName}\nCard ID: ${payload.cardId}\n\n## Summary\n${payload.summary}\n\n## Generated Files\n${payload.generatedFiles?.map(file => `- ${file.path}`).join('\n') ?? '-'}\n`;

  await fs.writeFile(summaryFile, summaryContent);
  await fs.writeFile(transcriptFile, JSON.stringify(payload.discussion, null, 2));

  const writtenFiles: string[] = ['build-summary.md', 'ai-discussion.json'];

  if (payload.generatedFiles) {
    for (const file of payload.generatedFiles) {
      const targetPath = path.join(branchDir, file.path);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, file.contents);
      writtenFiles.push(file.path);
    }
  }

  return NextResponse.json({
    success: true,
    branchName: payload.branchName,
    files: writtenFiles.map(file => path.relative(process.cwd(), path.join(branchDir, file)))
  });
}
