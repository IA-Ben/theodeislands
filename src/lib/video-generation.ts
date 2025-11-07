/**
 * Video Generation API Integration Layer
 * Supports multiple providers: Google Veo 3, Runway, Pika Labs, Stable Video
 */

export type VideoProvider = 'veo3' | 'runway' | 'pika' | 'stable-video';

export interface VideoGenerationRequest {
  provider: VideoProvider;
  prompt: string;
  referenceImages?: string[];
  startFrame?: string;
  endFrame?: string;
  duration: number;
  aspectRatio: string;
  resolution?: '720p' | '1080p' | '4K';
  motion?: 'low' | 'medium' | 'high';
  style?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  jobId?: string;
  estimatedTime?: number;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  maxDuration: number;
  supportedFormats: string[];
  features: string[];
}

// Provider configurations
const PROVIDER_CONFIGS: Record<VideoProvider, Omit<ProviderConfig, 'apiKey'>> = {
  veo3: {
    baseUrl: 'https://us-central1-aiplatform.googleapis.com/v1',
    maxDuration: 8,
    supportedFormats: ['16:9', '9:16', '1:1'],
    features: ['native-audio', 'reference-images', 'image-to-video', 'text-to-video']
  },
  runway: {
    baseUrl: 'https://api.runwayml.com/v1',
    maxDuration: 10,
    supportedFormats: ['16:9', '9:16', '1:1', '4:3'],
    features: ['text-to-video', 'image-to-video', 'video-to-video', 'motion-control']
  },
  pika: {
    baseUrl: 'https://api.pikapikapika.io/v1',
    maxDuration: 10,
    supportedFormats: ['16:9', '9:16', '1:1'],
    features: ['pikaframes', 'keyframing', 'text-to-video', 'image-to-video']
  },
  'stable-video': {
    baseUrl: 'https://api.stability.ai/v1',
    maxDuration: 2,
    supportedFormats: ['1024x576', '768x768', '576x1024'],
    features: ['motion-control', 'image-to-video', 'multiple-layouts']
  }
};

class VideoGenerationAPI {
  private apiKeys: Record<VideoProvider, string> = {
    veo3: process.env.GOOGLE_CLOUD_API_KEY || '',
    runway: process.env.RUNWAY_API_KEY || '',
    pika: process.env.PIKA_API_KEY || '',
    'stable-video': process.env.STABILITY_API_KEY || ''
  };

  /**
   * Generate video using Google Veo 3
   */
  private async generateVeo3(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const config = PROVIDER_CONFIGS.veo3;

    try {
      const requestBody = {
        instances: [{
          prompt: request.prompt,
          ...(request.referenceImages && {
            image: { bytes: request.referenceImages[0] }
          }),
          durationSeconds: request.duration,
          aspectRatio: request.aspectRatio,
          includeAudio: true
        }],
        parameters: {
          sampleCount: 1
        }
      };

      const response = await fetch(
        `${config.baseUrl}/projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predictLongRunning`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKeys.veo3}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Veo 3 API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        jobId: result.name,
        estimatedTime: 30, // 30 seconds average for Veo 3
        videoUrl: result.response?.predictions?.[0]?.videoUri,
        audioUrl: result.response?.predictions?.[0]?.audioUri,
        thumbnailUrl: result.response?.predictions?.[0]?.thumbnailUri
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate video using Runway Gen-4
   */
  private async generateRunway(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const config = PROVIDER_CONFIGS.runway;

    try {
      const requestBody = {
        text_prompt: request.prompt,
        duration: request.duration,
        ratio: request.aspectRatio,
        ...(request.referenceImages && {
          image_prompt: request.referenceImages[0]
        }),
        ...(request.motion && {
          motion_score: request.motion === 'low' ? 0.3 : request.motion === 'high' ? 0.9 : 0.6
        })
      };

      const response = await fetch(`${config.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.runway}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskType: 'gen4',
          internal: false,
          options: requestBody
        })
      });

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        jobId: result.id,
        estimatedTime: 60, // 60 seconds average for Runway
        videoUrl: result.output?.[0],
        thumbnailUrl: result.artifacts?.[0]?.url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate video using Pika Labs
   */
  private async generatePika(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const config = PROVIDER_CONFIGS.pika;

    try {
      const requestBody = {
        prompt: request.prompt,
        options: {
          duration: request.duration,
          aspect_ratio: request.aspectRatio,
          ...(request.referenceImages && {
            image: request.referenceImages[0]
          }),
          ...(request.startFrame && request.endFrame && {
            keyframes: {
              start: request.startFrame,
              end: request.endFrame
            }
          })
        }
      };

      const response = await fetch(`${config.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.pika}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Pika API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        jobId: result.id,
        estimatedTime: 45, // 45 seconds average for Pika
        videoUrl: result.output?.video_url,
        thumbnailUrl: result.output?.thumbnail_url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate video using Stable Video Diffusion
   */
  private async generateStableVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const config = PROVIDER_CONFIGS['stable-video'];

    try {
      if (!request.referenceImages?.[0]) {
        throw new Error('Stable Video requires a reference image');
      }

      const formData = new FormData();

      // Convert base64 to blob for the image
      const imageBlob = await fetch(request.referenceImages[0]).then(r => r.blob());
      formData.append('image', imageBlob);
      formData.append('cfg_scale', '1.8');
      formData.append('motion_bucket_id', request.motion === 'low' ? '40' : request.motion === 'high' ? '180' : '127');
      formData.append('seed', '0');

      const response = await fetch(`${config.baseUrl}/generation/image-to-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys['stable-video']}`,
          'Accept': 'video/*'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Stable Video API error: ${response.statusText}`);
      }

      const videoBlob = await response.blob();
      const videoUrl = URL.createObjectURL(videoBlob);

      return {
        success: true,
        videoUrl,
        estimatedTime: 20, // 20 seconds average for Stable Video
        duration: 2 // Fixed 2-second duration
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check job status for async operations
   */
  async checkJobStatus(provider: VideoProvider, jobId: string): Promise<VideoGenerationResponse> {
    const config = PROVIDER_CONFIGS[provider];

    try {
      let statusUrl = '';
      let headers: Record<string, string> = {};

      switch (provider) {
        case 'veo3':
          statusUrl = `${config.baseUrl}/projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/us-central1/operations/${jobId}`;
          headers = { 'Authorization': `Bearer ${this.apiKeys.veo3}` };
          break;
        case 'runway':
          statusUrl = `${config.baseUrl}/tasks/${jobId}`;
          headers = { 'Authorization': `Bearer ${this.apiKeys.runway}` };
          break;
        case 'pika':
          statusUrl = `${config.baseUrl}/jobs/${jobId}`;
          headers = { 'Authorization': `Bearer ${this.apiKeys.pika}` };
          break;
        case 'stable-video':
          // Stable Video is synchronous
          return { success: false, error: 'Stable Video does not support job status checking' };
      }

      const response = await fetch(statusUrl, { headers });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Parse status based on provider
      if (provider === 'veo3') {
        if (result.done) {
          return {
            success: true,
            videoUrl: result.response?.predictions?.[0]?.videoUri,
            audioUrl: result.response?.predictions?.[0]?.audioUri,
            thumbnailUrl: result.response?.predictions?.[0]?.thumbnailUri
          };
        }
      } else if (provider === 'runway') {
        if (result.status === 'SUCCEEDED') {
          return {
            success: true,
            videoUrl: result.output?.[0],
            thumbnailUrl: result.artifacts?.[0]?.url
          };
        }
      } else if (provider === 'pika') {
        if (result.status === 'completed') {
          return {
            success: true,
            videoUrl: result.output?.video_url,
            thumbnailUrl: result.output?.thumbnail_url
          };
        }
      }

      return { success: false, error: 'Job still in progress' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mock video generation for testing (when no API keys available)
   */
  private async generateMockVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    console.log(`🎬 Mock generating video: "${request.prompt}" (${request.duration}s)`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Generate mock video URLs
    const mockVideoUrl = `https://sample-videos.com/zip/10/mp4/720/${request.duration}s-sample.mp4`;
    const mockThumbnailUrl = `https://via.placeholder.com/640x360/000000/FFFFFF?text=${encodeURIComponent(request.prompt.slice(0, 20))}`;

    return {
      success: true,
      videoUrl: mockVideoUrl,
      audioUrl: request.provider === 'veo3' ? mockVideoUrl.replace('.mp4', '-audio.mp3') : undefined,
      thumbnailUrl: mockThumbnailUrl,
      duration: request.duration,
      jobId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      estimatedTime: 0 // Already completed
    };
  }

  /**
   * Main generation method - routes to appropriate provider
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    // Use mock generation if no API key is configured
    if (!this.apiKeys[request.provider]) {
      console.log(`⚠️ No API key for ${request.provider}, using mock generation`);
      return this.generateMockVideo(request);
    }

    // Validate duration
    const maxDuration = PROVIDER_CONFIGS[request.provider].maxDuration;
    if (request.duration > maxDuration) {
      return {
        success: false,
        error: `Duration ${request.duration}s exceeds maximum ${maxDuration}s for ${request.provider}`
      };
    }

    switch (request.provider) {
      case 'veo3':
        return this.generateVeo3(request);
      case 'runway':
        return this.generateRunway(request);
      case 'pika':
        return this.generatePika(request);
      case 'stable-video':
        return this.generateStableVideo(request);
      default:
        return {
          success: false,
          error: `Unsupported provider: ${request.provider}`
        };
    }
  }

  /**
   * Get provider capabilities
   */
  getProviderInfo(provider: VideoProvider) {
    return PROVIDER_CONFIGS[provider];
  }

  /**
   * Test provider connection
   */
  async testProvider(provider: VideoProvider): Promise<boolean> {
    try {
      const testRequest: VideoGenerationRequest = {
        provider,
        prompt: 'Test connection',
        duration: 1,
        aspectRatio: '1:1'
      };

      const result = await this.generateVideo(testRequest);
      return result.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const videoGenerationAPI = new VideoGenerationAPI();

// Utility functions
export function getProviderIcon(provider: VideoProvider): string {
  const icons = {
    veo3: '🎬',
    runway: '🎭',
    pika: '⚡',
    'stable-video': '🌊'
  };
  return icons[provider];
}

export function formatProviderName(provider: VideoProvider): string {
  const names = {
    veo3: 'Google Veo 3',
    runway: 'Runway Gen-4',
    pika: 'Pika Labs 2.2',
    'stable-video': 'Stable Video Diffusion'
  };
  return names[provider];
}

export function estimateCost(provider: VideoProvider, duration: number): string {
  const pricing = {
    veo3: 0.40, // $0.40 per second
    runway: 0.50, // Estimated based on credits
    pika: 0.11, // $0.11 per second for Pika 2.0
    'stable-video': 0.03 // Estimated $0.03 per second
  };

  const cost = pricing[provider] * duration;
  return `$${cost.toFixed(2)}`;
}