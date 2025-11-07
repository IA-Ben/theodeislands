/**
 * Content Studio API
 * Handles video generation, content publishing, and project management for The Ode Islands
 */

import { NextRequest, NextResponse } from 'next/server';
import { videoGenerationAPI, VideoGenerationRequest, VideoProvider } from '@/lib/video-generation';
import { videoPipeline, PipelineJob, formatPipelineStatus, estimateProcessingTime } from '@/lib/video-pipeline';

interface CreateProjectRequest {
  title: string;
  description: string;
  type: 'video' | 'audio' | 'story' | 'chapter' | 'microgame' | 'asset';
  videoGeneration?: VideoGenerationRequest;
}

interface PublishContentRequest {
  projectId: string;
  publishToOdeIslands: boolean;
  publishToChapter?: string;
  publishToStory?: string;
  metadata?: {
    tags: string[];
    category: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-project':
        return await handleCreateProject(data);

      case 'generate-video':
        return await handleGenerateVideo(data);

      case 'generate-video-pipeline':
        return await handleGenerateVideoPipeline(data);

      case 'check-video-status':
        return await handleCheckVideoStatus(data.provider, data.jobId);

      case 'check-pipeline-status':
        return await handleCheckPipelineStatus(data.jobId);

      case 'publish-content':
        return await handlePublishContent(data);

      case 'get-projects':
        return await handleGetProjects();

      case 'update-project':
        return await handleUpdateProject(data.projectId, data.updates);

      case 'delete-project':
        return await handleDeleteProject(data.projectId);

      case 'test-provider':
        return await handleTestProvider(data.provider);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Content Studio API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCreateProject(data: CreateProjectRequest) {
  try {
    // Generate unique project ID
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const project: any = {
      id: projectId,
      title: data.title,
      description: data.description,
      type: data.type,
      status: 'draft',
      createdAt: new Date().toISOString(),
      assets: [],
      metadata: {
        totalVideos: 0,
        totalDuration: 0,
        estimatedCost: 0
      }
    };

    // If video generation requested, initiate it
    let videoResult = null;
    if (data.videoGeneration) {
      videoResult = await videoGenerationAPI.generateVideo(data.videoGeneration);

      if (videoResult.success) {
        project.status = 'generating';
        project.assets = [{
          id: `asset-${Date.now()}`,
          type: 'video',
          provider: data.videoGeneration.provider,
          jobId: videoResult.jobId,
          status: 'generating',
          prompt: data.videoGeneration.prompt,
          duration: data.videoGeneration.duration,
          estimatedTime: videoResult.estimatedTime,
          createdAt: new Date().toISOString()
        }];
      }
    }

    // Store project (in production, this would go to a database)
    await storeProject(project);

    return NextResponse.json({
      success: true,
      project,
      videoGeneration: videoResult
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project'
    }, { status: 500 });
  }
}

async function handleGenerateVideo(data: VideoGenerationRequest) {
  try {
    const result = await videoGenerationAPI.generateVideo(data);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Video generation failed'
    }, { status: 500 });
  }
}

async function handleGenerateVideoPipeline(data: { projectId: string; videoGeneration: VideoGenerationRequest }) {
  try {
    console.log(`🚀 Starting video pipeline for project ${data.projectId}`);

    const pipelineJob = await videoPipeline.generateAndProcessVideo(
      data.projectId,
      data.videoGeneration
    );

    const estimatedTime = estimateProcessingTime(
      data.videoGeneration.provider,
      data.videoGeneration.duration
    );

    return NextResponse.json({
      success: true,
      job: pipelineJob,
      estimatedCompletionTime: estimatedTime,
      message: 'Video pipeline started successfully'
    });
  } catch (error) {
    console.error('Pipeline generation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Pipeline generation failed'
    }, { status: 500 });
  }
}

async function handleCheckVideoStatus(provider: VideoProvider, jobId: string) {
  try {
    const result = await videoGenerationAPI.checkJobStatus(provider, jobId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    }, { status: 500 });
  }
}

async function handleCheckPipelineStatus(jobId: string) {
  try {
    const job = videoPipeline.getJob(jobId);

    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Pipeline job not found'
      }, { status: 404 });
    }

    const statusInfo = formatPipelineStatus(job.status);

    return NextResponse.json({
      success: true,
      job,
      statusInfo,
      isComplete: job.status === 'completed' || job.status === 'failed'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Pipeline status check failed'
    }, { status: 500 });
  }
}

async function handlePublishContent(data: PublishContentRequest) {
  try {
    // Load project
    const project = await loadProject(data.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project status
    project.status = 'published';
    project.publishedAt = new Date().toISOString();

    if (data.publishToOdeIslands) {
      // Integrate with The Ode Islands content system
      await publishToOdeIslands(project, {
        chapter: data.publishToChapter,
        story: data.publishToStory,
        metadata: data.metadata
      });
    }

    await storeProject(project);

    return NextResponse.json({
      success: true,
      project
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Publishing failed'
    }, { status: 500 });
  }
}

async function handleGetProjects() {
  try {
    const projects = await loadAllProjects();

    return NextResponse.json({
      success: true,
      projects
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load projects'
    }, { status: 500 });
  }
}

async function handleUpdateProject(projectId: string, updates: any) {
  try {
    const project = await loadProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedProject = { ...project, ...updates, updatedAt: new Date().toISOString() };
    await storeProject(updatedProject);

    return NextResponse.json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Update failed'
    }, { status: 500 });
  }
}

async function handleDeleteProject(projectId: string) {
  try {
    await deleteProject(projectId);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed'
    }, { status: 500 });
  }
}

async function handleTestProvider(provider: VideoProvider) {
  try {
    const isConnected = await videoGenerationAPI.testProvider(provider);

    return NextResponse.json({
      success: true,
      connected: isConnected,
      provider
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Test failed'
    });
  }
}

// Storage functions (in production, these would use a real database)
async function storeProject(project: any) {
  // For now, we'll use file system storage
  // In production, this would be PostgreSQL, MongoDB, etc.
  const fs = await import('fs/promises');
  const path = `./data/projects/${project.id}.json`;

  try {
    await fs.mkdir('./data/projects', { recursive: true });
    await fs.writeFile(path, JSON.stringify(project, null, 2));
  } catch (error) {
    console.error('Failed to store project:', error);
  }
}

async function loadProject(projectId: string) {
  try {
    const fs = await import('fs/promises');
    const path = `./data/projects/${projectId}.json`;
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function loadAllProjects() {
  try {
    const fs = await import('fs/promises');
    const files = await fs.readdir('./data/projects');
    const projects = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(`./data/projects/${file}`, 'utf-8');
        projects.push(JSON.parse(data));
      }
    }

    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return [];
  }
}

async function deleteProject(projectId: string) {
  try {
    const fs = await import('fs/promises');
    const path = `./data/projects/${projectId}.json`;
    await fs.unlink(path);
  } catch (error) {
    console.error('Failed to delete project:', error);
  }
}

async function publishToOdeIslands(project: any, options: any) {
  // Integration with The Ode Islands content system
  // This would update the main story/chapter data structures

  try {
    const fs = await import('fs/promises');

    // Load existing Ode Islands data
    const odeDataPath = './public/data/ode-islands.json';
    let odeData;

    try {
      const data = await fs.readFile(odeDataPath, 'utf-8');
      odeData = JSON.parse(data);
    } catch {
      // Create new structure if file doesn't exist
      odeData = {
        stories: [],
        chapters: [],
        assets: [],
        microgames: []
      };
    }

    // Add content based on project type
    switch (project.type) {
      case 'video':
      case 'asset':
        odeData.assets = odeData.assets || [];
        odeData.assets.push({
          id: project.id,
          title: project.title,
          description: project.description,
          type: 'video',
          url: project.assets[0]?.videoUrl,
          audioUrl: project.assets[0]?.audioUrl,
          thumbnailUrl: project.assets[0]?.thumbnailUrl,
          duration: project.assets[0]?.duration,
          chapter: options.chapter,
          story: options.story,
          tags: options.metadata?.tags || [],
          createdAt: project.createdAt,
          publishedAt: project.publishedAt
        });
        break;

      case 'chapter':
        odeData.chapters = odeData.chapters || [];
        odeData.chapters.push({
          id: project.id,
          title: project.title,
          description: project.description,
          story: options.story,
          assets: project.assets.map((asset: any) => asset.id),
          difficulty: options.metadata?.difficulty,
          tags: options.metadata?.tags || [],
          createdAt: project.createdAt,
          publishedAt: project.publishedAt
        });
        break;

      case 'story':
        odeData.stories = odeData.stories || [];
        odeData.stories.push({
          id: project.id,
          title: project.title,
          description: project.description,
          chapters: [], // Will be populated as chapters are added
          category: options.metadata?.category,
          tags: options.metadata?.tags || [],
          createdAt: project.createdAt,
          publishedAt: project.publishedAt
        });
        break;

      case 'microgame':
        odeData.microgames = odeData.microgames || [];
        odeData.microgames.push({
          id: project.id,
          title: project.title,
          description: project.description,
          difficulty: options.metadata?.difficulty || 'medium',
          chapter: options.chapter,
          story: options.story,
          assets: project.assets.map((asset: any) => asset.id),
          tags: options.metadata?.tags || [],
          createdAt: project.createdAt,
          publishedAt: project.publishedAt
        });
        break;
    }

    // Save updated Ode Islands data
    await fs.writeFile(odeDataPath, JSON.stringify(odeData, null, 2));

    console.log(`Published ${project.type} "${project.title}" to The Ode Islands`);
  } catch (error) {
    console.error('Failed to publish to Ode Islands:', error);
    throw error;
  }
}

// GET endpoint for retrieving projects and status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const projectId = searchParams.get('projectId');

  switch (action) {
    case 'projects':
      return await handleGetProjects();

    case 'project':
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
      }
      const project = await loadProject(projectId);
      return NextResponse.json({
        success: !!project,
        project
      });

    case 'providers':
      const providers = ['veo3', 'runway', 'pika', 'stable-video'].map(id => ({
        id,
        ...videoGenerationAPI.getProviderInfo(id as VideoProvider)
      }));
      return NextResponse.json({
        success: true,
        providers
      });

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}