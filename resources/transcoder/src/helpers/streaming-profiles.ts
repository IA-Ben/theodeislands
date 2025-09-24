export interface StreamingProfile {
  name: string;
  suffix: string;
  video: {
    bitrate: string;
    maxrate: string;
    bufsize: string;
    width?: number;
    height?: number;
    scale?: string;
  };
  audio: {
    bitrate: string;
    sampleRate: string;
    channels: string;
  };
}

export interface AdaptiveStreamingConfig {
  profiles: StreamingProfile[];
  hlsConfig: {
    time: string;
    playlistType: string;
    flags: string;
    listSize: string;
  };
}

/**
 * Adaptive streaming profiles optimized for different devices and connections
 */
export const ADAPTIVE_STREAMING_PROFILES: StreamingProfile[] = [
  // Mobile Low (240p) - Very slow connections, older phones
  {
    name: 'Mobile Low',
    suffix: '240p',
    video: {
      bitrate: '400k',
      maxrate: '400k',
      bufsize: '800k',
      scale: 'scale=-2:240', // Maintain aspect ratio, height 240px
    },
    audio: {
      bitrate: '64k',
      sampleRate: '44100',
      channels: '2',
    },
  },

  // Mobile Medium (360p) - Standard mobile, 3G/4G
  {
    name: 'Mobile Medium',
    suffix: '360p',
    video: {
      bitrate: '800k',
      maxrate: '800k',
      bufsize: '1600k',
      scale: 'scale=-2:360',
    },
    audio: {
      bitrate: '96k',
      sampleRate: '44100',
      channels: '2',
    },
  },

  // Mobile High (480p) - Modern smartphones, good 4G
  {
    name: 'Mobile High',
    suffix: '480p',
    video: {
      bitrate: '1200k',
      maxrate: '1200k',
      bufsize: '2400k',
      scale: 'scale=-2:480',
    },
    audio: {
      bitrate: '128k',
      sampleRate: '48000',
      channels: '2',
    },
  },

  // HD (720p) - Desktop, tablets, premium mobile
  {
    name: 'HD',
    suffix: '720p',
    video: {
      bitrate: '2500k',
      maxrate: '2500k',
      bufsize: '5000k',
      scale: 'scale=-2:720',
    },
    audio: {
      bitrate: '128k',
      sampleRate: '48000',
      channels: '2',
    },
  },

  // Full HD (1080p) - High-end devices, fast connections
  {
    name: 'Full HD',
    suffix: '1080p',
    video: {
      bitrate: '4000k',
      maxrate: '4000k',
      bufsize: '8000k',
      scale: 'scale=-2:1080',
    },
    audio: {
      bitrate: '192k',
      sampleRate: '48000',
      channels: '2',
    },
  },
];

/**
 * Create adaptive streaming configuration
 */
export const createAdaptiveStreamingConfig = (): AdaptiveStreamingConfig => ({
  profiles: ADAPTIVE_STREAMING_PROFILES,
  hlsConfig: {
    time: '6', // 6-second segments for better mobile performance
    playlistType: 'vod',
    flags: 'independent_segments',
    listSize: '0',
  },
});

/**
 * Get profile suitable for source video dimensions
 */
export function getOptimalProfiles(
  sourceWidth: number,
  sourceHeight: number
): StreamingProfile[] {
  const sourceAspectRatio = sourceWidth / sourceHeight;
  const isPortrait = sourceHeight > sourceWidth;

  // Filter profiles that don't exceed source resolution
  const suitableProfiles = ADAPTIVE_STREAMING_PROFILES.filter(profile => {
    if (!profile.video.scale) return true;

    // Extract target height from scale parameter
    const scaleMatch = profile.video.scale.match(/scale=-2:(\d+)/);
    if (!scaleMatch) return true;

    const targetHeight = parseInt(scaleMatch[1]);
    const targetWidth = Math.round(targetHeight * sourceAspectRatio);

    // Don't upscale - only include profiles smaller than or equal to source
    return targetHeight <= sourceHeight && targetWidth <= sourceWidth;
  });

  // Always include at least one profile (the smallest if source is very small)
  if (suitableProfiles.length === 0) {
    return [ADAPTIVE_STREAMING_PROFILES[0]]; // Mobile Low
  }

  return suitableProfiles;
}

/**
 * Generate FFmpeg options for a specific profile
 */
export function generateFFmpegOptions(
  profile: StreamingProfile,
  segmentOutputDir: string
): string[] {
  const options = [
    // Video encoding
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-profile:v', 'high',
    '-level', '4.0',
    '-x264-params', 'nal-hrd=cbr:force-cfr=1',

    // Video bitrate
    '-b:v', profile.video.bitrate,
    '-maxrate', profile.video.maxrate,
    '-bufsize', profile.video.bufsize,

    // Audio encoding
    '-c:a', 'aac',
    '-b:a', profile.audio.bitrate,
    '-ar', profile.audio.sampleRate,
    '-ac', profile.audio.channels,

    // HLS settings
    '-f', 'hls',
    '-hls_time', '6',
    '-hls_playlist_type', 'vod',
    '-hls_flags', 'independent_segments',
    '-hls_list_size', '0',
    '-hls_segment_filename', `${segmentOutputDir}/segment_%03d.ts`,
  ];

  // Add scale filter if specified
  if (profile.video.scale) {
    options.push('-vf', profile.video.scale);
  }

  return options;
}