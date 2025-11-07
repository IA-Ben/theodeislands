'use client';

/**
 * The Ode Islands Content Studio
 * Video generation, story publishing, and content management interface
 * Inspired by Augment's collaboration panel but for creative content creation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// Video generation providers
type VideoProvider = 'veo3' | 'runway' | 'pika' | 'stable-video';
type ContentType = 'video' | 'audio' | 'story' | 'chapter' | 'microgame' | 'asset';

interface VideoGenerationRequest {
  id: string;
  provider: VideoProvider;
  prompt: string;
  referenceImages?: string[];
  startFrame?: string;
  endFrame?: string;
  duration: number;
  aspectRatio: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result?: {
    videoUrl: string;
    audioUrl?: string;
    thumbnailUrl?: string;
  };
  createdAt: string;
}

interface PipelineJob {
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

interface ContentProject {
  id: string;
  title: string;
  type: ContentType;
  description: string;
  status: 'draft' | 'generating' | 'review' | 'published';
  assets: VideoGenerationRequest[];
  createdAt: string;
  publishedAt?: string;
}

const VIDEO_PROVIDERS = {
  veo3: {
    name: 'Google Veo 3',
    emoji: '🎬',
    color: 'bg-blue-500',
    maxDuration: 8,
    features: ['Native Audio', 'Reference Images', 'Image-to-Video'],
    pricing: '$0.40/sec',
    description: 'Premium quality with synchronized audio'
  },
  runway: {
    name: 'Runway Gen-4',
    emoji: '🎭',
    color: 'bg-purple-500',
    maxDuration: 10,
    features: ['Video-to-Video', 'Image-to-Video', 'Text-to-Video'],
    pricing: 'Credits',
    description: 'Reliable and established platform'
  },
  pika: {
    name: 'Pika Labs 2.2',
    emoji: '⚡',
    color: 'bg-orange-500',
    maxDuration: 10,
    features: ['Pikaframes', 'Keyframing', '1080p'],
    pricing: '$0.11/sec',
    description: 'Fast generation with keyframe control'
  },
  'stable-video': {
    name: 'Stable Video',
    emoji: '🌊',
    color: 'bg-green-500',
    maxDuration: 2,
    features: ['Motion Control', 'Multiple Layouts', 'Cost Effective'],
    pricing: '$0.03/sec',
    description: 'Budget-friendly for asset creation'
  }
};

const CONTENT_TYPES = {
  video: { emoji: '🎥', color: 'bg-red-500', name: 'Video Content' },
  audio: { emoji: '🎵', color: 'bg-blue-500', name: 'Audio Content' },
  story: { emoji: '📖', color: 'bg-purple-500', name: 'Story Chapter' },
  chapter: { emoji: '📚', color: 'bg-indigo-500', name: 'Book Chapter' },
  microgame: { emoji: '🎮', color: 'bg-green-500', name: 'Micro Game' },
  asset: { emoji: '🖼️', color: 'bg-yellow-500', name: 'Visual Asset' }
};

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState<'create' | 'projects' | 'library'>('create');
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>('veo3');
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('video');
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [generationQueue, setGenerationQueue] = useState<VideoGenerationRequest[]>([]);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [duration, setDuration] = useState(4);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [usePipeline, setUsePipeline] = useState(true);
  const [pipelineJobs, setPipelineJobs] = useState<PipelineJob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('ode-islands-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save projects to localStorage
  const saveProjects = useCallback((updatedProjects: ContentProject[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('ode-islands-projects', JSON.stringify(updatedProjects));
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setReferenceImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateVideo = async () => {
    if (!prompt.trim() || !projectTitle.trim()) return;

    const videoGenRequest = {
      provider: selectedProvider,
      prompt,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      duration,
      aspectRatio
    };

    const newProject: ContentProject = {
      id: `project-${Date.now()}`,
      title: projectTitle,
      type: selectedContentType,
      description: projectDescription,
      status: 'generating',
      assets: [],
      createdAt: new Date().toISOString()
    };

    saveProjects([...projects, newProject]);

    try {
      if (usePipeline) {
        // Use full pipeline (AI -> Local Encoder -> Google Cloud)
        const response = await fetch('/api/content-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-video-pipeline',
            data: {
              projectId: newProject.id,
              videoGeneration: videoGenRequest
            }
          })
        });

        const result = await response.json();

        if (result.success) {
          console.log('🎬 Pipeline started:', result.job.id);
          setPipelineJobs(prev => [...prev, result.job]);

          // Poll for pipeline status
          pollPipelineStatus(result.job.id, newProject.id);
        } else {
          throw new Error(result.error);
        }
      } else {
        // Use simple video generation only
        const videoRequest: VideoGenerationRequest = {
          id: `video-${Date.now()}`,
          provider: selectedProvider,
          prompt,
          referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
          duration,
          aspectRatio,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        setGenerationQueue(prev => [...prev, { ...videoRequest, status: 'generating' }]);

        const response = await fetch('/api/content-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-video',
            data: videoGenRequest
          })
        });

        const result = await response.json();

        if (result.success) {
          const completedRequest = {
            ...videoRequest,
            status: 'completed' as const,
            result: {
              videoUrl: result.videoUrl,
              audioUrl: result.audioUrl,
              thumbnailUrl: result.thumbnailUrl
            }
          };

          setGenerationQueue(prev => prev.filter(req => req.id !== videoRequest.id));

          const updatedProjects = projects.map(project =>
            project.id === newProject.id
              ? { ...project, status: 'review' as const, assets: [completedRequest] }
              : project
          );
          saveProjects(updatedProjects);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      // Update project status to failed
      const updatedProjects = projects.map(project =>
        project.id === newProject.id
          ? { ...project, status: 'draft' as const }
          : project
      );
      saveProjects(updatedProjects);
    }

    // Reset form
    setPrompt('');
    setProjectTitle('');
    setProjectDescription('');
    setReferenceImages([]);
  };

  const pollPipelineStatus = async (jobId: string, projectId: string) => {
    const poll = async () => {
      try {
        const response = await fetch('/api/content-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check-pipeline-status',
            data: { jobId }
          })
        });

        const result = await response.json();

        if (result.success) {
          // Update pipeline jobs list
          setPipelineJobs(prev =>
            prev.map(job => job.id === jobId ? result.job : job)
          );

          if (result.isComplete) {
            if (result.job.status === 'completed') {
              // Update project with completed pipeline results
              const videoAsset: VideoGenerationRequest = {
                id: `asset-${Date.now()}`,
                provider: result.job.metadata.provider,
                prompt: result.job.metadata.prompt,
                duration: result.job.metadata.duration,
                aspectRatio: result.job.metadata.aspectRatio,
                status: 'completed',
                result: {
                  videoUrl: result.job.playlistUrl || result.job.originalVideoUrl,
                  audioUrl: result.job.audioUrl,
                  thumbnailUrl: result.job.posterUrl
                },
                createdAt: new Date().toISOString()
              };

              const updatedProjects = projects.map(project =>
                project.id === projectId
                  ? {
                      ...project,
                      status: 'review' as const,
                      assets: [videoAsset]
                    }
                  : project
              );
              saveProjects(updatedProjects);
            }
            return; // Stop polling
          }

          // Continue polling
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Pipeline status check failed:', error);
      }
    };

    poll();
  };

  const publishProject = (projectId: string) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, status: 'published' as const, publishedAt: new Date().toISOString() }
        : project
    );
    saveProjects(updatedProjects);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🎭 The Ode Islands Content Studio</h1>
              <p className="text-gray-400">AI-powered video generation and content publishing for mixed reality storytelling</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-700 rounded-lg p-1">
                {(['create', 'projects', 'library'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize",
                      activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-600"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Generation Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provider Selection */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">🎬 Video Generation Provider</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(VIDEO_PROVIDERS).map(([key, provider]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedProvider(key as VideoProvider)}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all",
                        selectedProvider === key
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-600 hover:border-gray-500"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{provider.emoji}</span>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-xs text-gray-400">{provider.pricing}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 mb-2">{provider.description}</div>
                      <div className="flex flex-wrap gap-1">
                        {provider.features.map(feature => (
                          <span key={feature} className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Creation Form */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">✨ Create Content</h2>

                {/* Content Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Content Type</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CONTENT_TYPES).map(([key, type]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedContentType(key as ContentType)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedContentType === key
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        )}
                      >
                        <span>{type.emoji}</span>
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title</label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                      placeholder="Enter project title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-20"
                      placeholder="Describe your content..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Video Generation Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-24"
                      placeholder="Describe the video you want to generate..."
                    />
                  </div>

                  {/* Reference Images */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Reference Images</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-600 rounded-lg p-4 text-gray-400 hover:border-gray-500 transition-colors"
                      >
                        📁 Upload Reference Images
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {referenceImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {referenceImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Reference ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                onClick={() => removeReferenceImage(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pipeline Mode Toggle */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Processing Mode</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={usePipeline}
                          onChange={() => setUsePipeline(true)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-sm">🔧 Full Pipeline</div>
                          <div className="text-xs text-gray-400">AI → Local Encoder → Google Cloud</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!usePipeline}
                          onChange={() => setUsePipeline(false)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-sm">⚡ Simple Generation</div>
                          <div className="text-xs text-gray-400">AI Generation Only</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Generation Parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration ({duration}s)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max={VIDEO_PROVIDERS[selectedProvider].maxDuration}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="4:3">4:3 (Standard)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={generateVideo}
                    disabled={!prompt.trim() || !projectTitle.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {usePipeline ? '🔧 Generate & Process Video' : '🎬 Generate Video Content'}
                  </button>
                </div>
              </div>
            </div>

            {/* Generation Queue & Status */}
            <div className="space-y-6">
              {/* Pipeline Jobs */}
              {pipelineJobs.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🔧 Pipeline Status</h3>
                  <div className="space-y-3">
                    {pipelineJobs.map(job => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'pending': return 'bg-gray-500';
                          case 'downloading': return 'bg-blue-500';
                          case 'transcoding': return 'bg-purple-500';
                          case 'uploading': return 'bg-orange-500';
                          case 'completed': return 'bg-green-500';
                          case 'failed': return 'bg-red-500';
                          default: return 'bg-gray-500';
                        }
                      };

                      const getStatusEmoji = (status: string) => {
                        switch (status) {
                          case 'pending': return '⏳';
                          case 'downloading': return '⬇️';
                          case 'transcoding': return '🎬';
                          case 'uploading': return '☁️';
                          case 'completed': return '✅';
                          case 'failed': return '❌';
                          default: return '⏳';
                        }
                      };

                      return (
                        <div key={job.id} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{VIDEO_PROVIDERS[job.metadata?.provider as keyof typeof VIDEO_PROVIDERS]?.emoji || '🎬'}</span>
                            <span className="text-sm font-medium">Pipeline Job</span>
                            <span className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(job.status)}`}>
                              {getStatusEmoji(job.status)} {job.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-300 mb-2">{job.metadata?.prompt}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(job.status)}`}
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">{job.progress}%</span>
                          </div>
                          {job.status === 'completed' && job.playlistUrl && (
                            <div className="mt-2">
                              <a
                                href={job.playlistUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                🎥 View Processed Video
                              </a>
                            </div>
                          )}
                          {job.status === 'failed' && job.error && (
                            <div className="mt-2 text-xs text-red-400">
                              ❌ {job.error}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Generations */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">⚡ Generation Queue</h3>
                {generationQueue.length === 0 && pipelineJobs.length === 0 ? (
                  <div className="text-center text-gray-400 py-6">
                    <div className="text-2xl mb-2">🎬</div>
                    <div className="text-sm">No active generations</div>
                  </div>
                ) : generationQueue.length > 0 ? (
                  <div className="space-y-3">
                    {generationQueue.map(request => (
                      <div key={request.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{VIDEO_PROVIDERS[request.provider].emoji}</span>
                          <span className="text-sm font-medium">{VIDEO_PROVIDERS[request.provider].name}</span>
                        </div>
                        <div className="text-xs text-gray-300 mb-2">{request.prompt}</div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-400">Generating...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-6">
                    <div className="text-2xl mb-2">🔧</div>
                    <div className="text-sm">Using pipeline mode</div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Studio Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Projects</span>
                    <span className="font-medium">{projects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Published</span>
                    <span className="font-medium">{projects.filter(p => p.status === 'published').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">In Progress</span>
                    <span className="font-medium">{projects.filter(p => p.status === 'generating').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📚 Your Projects</h2>
            {projects.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-4">📝</div>
                <div className="text-lg mb-2">No projects yet</div>
                <div className="text-sm">Create your first content project to get started!</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{CONTENT_TYPES[project.type].emoji}</span>
                      <span className="font-medium">{project.title}</span>
                    </div>
                    <div className="text-sm text-gray-300 mb-3">{project.description}</div>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        project.status === 'published' ? "bg-green-600" :
                        project.status === 'generating' ? "bg-blue-600" :
                        project.status === 'review' ? "bg-yellow-600" :
                        "bg-gray-600"
                      )}>
                        {project.status}
                      </span>
                      {project.status === 'review' && (
                        <button
                          onClick={() => publishProject(project.id)}
                          className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">🎨 Asset Library</h2>
            <div className="text-center text-gray-400 py-12">
              <div className="text-4xl mb-4">🎬</div>
              <div className="text-lg mb-2">Asset Library Coming Soon</div>
              <div className="text-sm">Manage your generated videos, audio, and visual assets</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}