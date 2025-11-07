/**
 * Video Processing Pipeline Integration
 * Connects AI-generated videos to local transcoder and Google Cloud Storage
 */

import { videoGenerationAPI, VideoGenerationRequest, VideoGenerationResponse } from './video-generation';
import { promises as fs } from 'fs';
import path from 'path';

export interface VideoPipelineConfig {
  inputDir: string;
  outputDir: string;
  transcoderPath: string;
  enableGCSUpload: boolean;
  gcsProjectId?: string;
  gcsBucketName?: string;
}

export interface PipelineJob {
  id: string;
  projectId: string;
  status: 'pending' | 'downloading' | 'transcoding' | 'uploading' | 'completed' | 'failed';
  originalVideoUrl: string;
  localVideoPath?: string;
  transcodedPath?: string;
  gcsPath?: string;
  playlistUrl?: string;
  posterUrl?: string;
  progress: number;
  error?: string;
  startTime: Date;
  endTime?: Date;
  metadata: {
    provider: string;
    prompt: string;
    duration: number;
    aspectRatio: string;
  };
}

export class VideoPipeline {
  private config: VideoPipelineConfig;
  private activeJobs = new Map<string, PipelineJob>();

  constructor(config: VideoPipelineConfig) {
    this.config = config;
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.config.inputDir, { recursive: true });
      await fs.mkdir(this.config.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create pipeline directories:', error);
    }
  }

  /**
   * Start a complete video processing pipeline
   */
  async processVideo(
    projectId: string,
    videoGenRequest: VideoGenerationRequest
  ): Promise<PipelineJob> {
    const jobId = `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: PipelineJob = {
      id: jobId,
      projectId,
      status: 'pending',
      originalVideoUrl: '',
      progress: 0,
      startTime: new Date(),
      metadata: {
        provider: videoGenRequest.provider,
        prompt: videoGenRequest.prompt,
        duration: videoGenRequest.duration,
        aspectRatio: videoGenRequest.aspectRatio
      }
    };

    this.activeJobs.set(jobId, job);

    try {
      // Step 1: Generate video with AI
      await this.updateJobStatus(jobId, 'downloading', 10);
      const videoResult = await videoGenerationAPI.generateVideo(videoGenRequest);

      if (!videoResult.success || !videoResult.videoUrl) {
        throw new Error(videoResult.error || 'Video generation failed');
      }

      job.originalVideoUrl = videoResult.videoUrl;

      // Check if this is mock generation (no real transcoding needed)
      if (videoResult.videoUrl.includes('sample-videos.com') || videoResult.jobId?.startsWith('mock-')) {
        console.log(`🎬 Mock processing detected for job ${jobId}, skipping transcoder`);

        // Simulate processing steps
        await this.updateJobStatus(jobId, 'downloading', 25);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.updateJobStatus(jobId, 'transcoding', 50);
        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.updateJobStatus(jobId, 'uploading', 80);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Set mock processed URLs
        job.playlistUrl = videoResult.videoUrl.replace('.mp4', '.m3u8');
        job.posterUrl = videoResult.thumbnailUrl;
        job.gcsPath = `mock/vid/${jobId}`;

        await this.updateJobStatus(jobId, 'completed', 100);
        job.endTime = new Date();
        return job;
      }

      // Step 2: Download generated video to local input directory
      await this.updateJobStatus(jobId, 'downloading', 25);
      const localVideoPath = await this.downloadVideo(videoResult.videoUrl, jobId);
      job.localVideoPath = localVideoPath;

      // Step 3: Process through local transcoder
      await this.updateJobStatus(jobId, 'transcoding', 50);
      const transcodedPath = await this.transcodeVideo(localVideoPath, jobId);
      job.transcodedPath = transcodedPath;

      // Step 4: Upload to Google Cloud Storage (if enabled)
      if (this.config.enableGCSUpload) {
        await this.updateJobStatus(jobId, 'uploading', 80);
        const gcsResult = await this.uploadToGCS(transcodedPath, jobId);
        job.gcsPath = gcsResult.gcsPath;
        job.playlistUrl = gcsResult.playlistUrl;
        job.posterUrl = gcsResult.posterUrl;
      }

      // Step 5: Complete
      await this.updateJobStatus(jobId, 'completed', 100);
      job.endTime = new Date();

      return job;

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.endTime = new Date();
      this.activeJobs.set(jobId, job);

      console.error(`Pipeline job ${jobId} failed:`, error);
      throw error;
    }
  }

  /**
   * Download video from AI generation service to local storage
   */
  private async downloadVideo(videoUrl: string, jobId: string): Promise<string> {
    const fileName = `${jobId}.mp4`;
    const localPath = path.join(this.config.inputDir, fileName);

    try {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(localPath, buffer);

      console.log(`✅ Downloaded video to: ${localPath}`);
      return localPath;

    } catch (error) {
      console.error(`❌ Failed to download video for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Process video through local transcoder
   */
  private async transcodeVideo(inputPath: string, jobId: string): Promise<string> {
    const outputDir = path.join(this.config.outputDir, jobId);

    return new Promise(async (resolve, reject) => {
      console.log(`🎬 Starting transcoding for job ${jobId}...`);

      try {
        // Dynamically import spawn only on server side
        const { spawn } = await import('child_process');

        // Run the transcoder process
        const transcoder = spawn('node', [
          path.join(this.config.transcoderPath, 'build/app.js'),
          '--input', inputPath,
          '--output', outputDir,
          '--adaptive',
          '--upload', this.config.enableGCSUpload ? 'true' : 'false'
        ], {
          cwd: this.config.transcoderPath,
          stdio: ['pipe', 'pipe', 'pipe']
        });

      let stdout = '';
      let stderr = '';

      transcoder.stdout.on('data', (data) => {
        stdout += data.toString();

        // Parse progress from transcoder output
        const progressMatch = data.toString().match(/Progress: (\d+)%/);
        if (progressMatch) {
          const progress = Math.max(50, Math.min(75, 50 + (parseInt(progressMatch[1]) * 0.25)));
          this.updateJobProgress(jobId, progress);
        }
      });

      transcoder.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      transcoder.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Transcoding completed for job ${jobId}`);
          resolve(outputDir);
        } else {
          console.error(`❌ Transcoding failed for job ${jobId} with code ${code}`);
          console.error('stderr:', stderr);
          reject(new Error(`Transcoding failed with exit code ${code}`));
        }
      });

      transcoder.on('error', (error) => {
        console.error(`❌ Transcoder process error for job ${jobId}:`, error);
        reject(error);
      });
      } catch (error) {
        console.error(`❌ Failed to start transcoder for job ${jobId}:`, error);
        reject(error);
      }
    });
  }

  /**
   * Upload transcoded video to Google Cloud Storage
   */
  private async uploadToGCS(outputDir: string, jobId: string): Promise<{
    gcsPath: string;
    playlistUrl: string;
    posterUrl: string;
  }> {
    try {
      // The transcoder should have already uploaded to GCS if enabled
      // We just need to construct the URLs
      const bucketName = this.config.gcsBucketName || 'odeislands';
      const gcsPath = `vid/${jobId}`;

      const playlistUrl = `https://storage.googleapis.com/${bucketName}/${gcsPath}/master.m3u8`;
      const posterUrl = `https://storage.googleapis.com/${bucketName}/${gcsPath}/poster.jpg`;

      console.log(`✅ Video available at: ${playlistUrl}`);

      return {
        gcsPath,
        playlistUrl,
        posterUrl
      };

    } catch (error) {
      console.error(`❌ Failed to get GCS URLs for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Update job status and progress
   */
  private async updateJobStatus(
    jobId: string,
    status: PipelineJob['status'],
    progress: number
  ): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = status;
      job.progress = progress;
      this.activeJobs.set(jobId, job);

      console.log(`📊 Job ${jobId}: ${status} (${progress}%)`);
    }
  }

  /**
   * Update job progress only
   */
  private updateJobProgress(jobId: string, progress: number): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.progress = progress;
      this.activeJobs.set(jobId, job);
    }
  }

  /**
   * Get job status
   */
  getJob(jobId: string): PipelineJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all jobs for a project
   */
  getProjectJobs(projectId: string): PipelineJob[] {
    return Array.from(this.activeJobs.values()).filter(job => job.projectId === projectId);
  }

  /**
   * Get all active jobs
   */
  getAllJobs(): PipelineJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Clean up completed/failed jobs older than specified hours
   */
  cleanupOldJobs(hoursOld: number = 24): void {
    const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));

    for (const [jobId, job] of this.activeJobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.endTime &&
        job.endTime < cutoffTime
      ) {
        this.activeJobs.delete(jobId);
        console.log(`🧹 Cleaned up old job: ${jobId}`);
      }
    }
  }

  /**
   * Generate video with full pipeline processing
   */
  async generateAndProcessVideo(
    projectId: string,
    request: VideoGenerationRequest
  ): Promise<PipelineJob> {
    console.log(`🚀 Starting full video pipeline for project ${projectId}`);
    console.log(`   Provider: ${request.provider}`);
    console.log(`   Prompt: ${request.prompt}`);
    console.log(`   Duration: ${request.duration}s`);

    return this.processVideo(projectId, request);
  }
}

// Default pipeline configuration
const defaultConfig: VideoPipelineConfig = {
  inputDir: './resources/transcoder/in',
  outputDir: './resources/transcoder/out',
  transcoderPath: './resources/transcoder',
  enableGCSUpload: process.env.GCS_BUCKET_NAME ? true : false,
  gcsProjectId: process.env.GCS_PROJECT_ID,
  gcsBucketName: process.env.GCS_BUCKET_NAME || 'odeislands'
};

// Export singleton instance
export const videoPipeline = new VideoPipeline(defaultConfig);

// Utility functions
export function formatPipelineStatus(status: PipelineJob['status']): {
  label: string;
  color: string;
  emoji: string;
} {
  const statusMap = {
    pending: { label: 'Pending', color: 'bg-gray-500', emoji: '⏳' },
    downloading: { label: 'Downloading', color: 'bg-blue-500', emoji: '⬇️' },
    transcoding: { label: 'Transcoding', color: 'bg-purple-500', emoji: '🎬' },
    uploading: { label: 'Uploading', color: 'bg-orange-500', emoji: '☁️' },
    completed: { label: 'Completed', color: 'bg-green-500', emoji: '✅' },
    failed: { label: 'Failed', color: 'bg-red-500', emoji: '❌' }
  };

  return statusMap[status];
}

export function estimateProcessingTime(
  provider: string,
  duration: number
): number {
  // Estimates in seconds
  const baseGenerationTime = {
    'veo3': 30,
    'runway': 60,
    'pika': 45,
    'stable-video': 20
  };

  const generationTime = baseGenerationTime[provider as keyof typeof baseGenerationTime] || 45;
  const transcodingTime = duration * 15; // ~15 seconds of transcoding per video second
  const uploadTime = duration * 5; // ~5 seconds of upload per video second

  return generationTime + transcodingTime + uploadTime;
}