import 'dotenv/config';
import ffmpeg from 'fluent-ffmpeg';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { GCSUploader } from './helpers/gcs-uploader.js';
import {
  ADAPTIVE_STREAMING_PROFILES,
  StreamingProfile,
  getOptimalProfiles,
  generateFFmpegOptions
} from './helpers/streaming-profiles.js';

interface VideoDimensions {
  width: number;
  height: number;
}

interface AdaptiveTranscodingResult {
  success: boolean;
  profiles: string[];
  masterPlaylistPath: string;
  errors: string[];
}

/**
 * Get video dimensions using FFprobe
 */
export const getVideoDimensions = (filePath: string): Promise<VideoDimensions> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      if (!videoStream || !videoStream.width || !videoStream.height) {
        reject(new Error('Could not get video dimensions'));
        return;
      }

      resolve({
        width: videoStream.width,
        height: videoStream.height
      });
    });
  });
};

/**
 * Ensure directory exists
 */
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory ${dirPath}:`, err);
    throw err;
  }
};

/**
 * Generate adaptive streaming variant for a specific profile
 */
const generateAdaptiveVariant = (
  inputFile: string,
  outputDir: string,
  profile: StreamingProfile
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const variantDir = path.join(outputDir, profile.suffix);
    const playlistPath = path.join(variantDir, 'playlist.m3u8');

    // Ensure variant directory exists
    ensureDirectoryExists(variantDir).then(() => {
      const options = generateFFmpegOptions(profile, variantDir);

      console.log(`  - Generating ${profile.name} (${profile.suffix})...`);

      ffmpeg(inputFile)
        .outputOptions(options)
        .output(playlistPath)
        .on('start', (commandLine) => {
          console.log(`    FFmpeg command: ${commandLine.substring(0, 100)}...`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            process.stdout.write(`\r    Progress: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log(`\n    ✅ ${profile.name} completed`);
          resolve(true);
        })
        .on('error', (err) => {
          console.error(`\n    ❌ Error generating ${profile.name}:`, err.message);
          reject(err);
        })
        .run();
    }).catch(reject);
  });
};

/**
 * Generate master playlist for adaptive streaming
 */
const generateMasterPlaylist = async (
  outputDir: string,
  profiles: StreamingProfile[]
): Promise<string> => {
  const masterPlaylistPath = path.join(outputDir, 'master.m3u8');

  let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:6\n\n';

  for (const profile of profiles) {
    // Extract bandwidth from bitrate (convert 400k -> 400000)
    const videoBandwidth = parseInt(profile.video.bitrate.replace('k', '')) * 1000;
    const audioBandwidth = parseInt(profile.audio.bitrate.replace('k', '')) * 1000;
    const totalBandwidth = videoBandwidth + audioBandwidth;

    // Extract resolution from scale parameter
    let resolution = '';
    if (profile.video.scale) {
      const scaleMatch = profile.video.scale.match(/scale=-2:(\d+)/);
      if (scaleMatch) {
        const height = parseInt(scaleMatch[1]);
        const width = Math.round(height * (16/9)); // Assume 16:9 aspect ratio as default
        resolution = `,RESOLUTION=${width}x${height}`;
      }
    }

    masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${totalBandwidth}${resolution}\n`;
    masterPlaylist += `${profile.suffix}/playlist.m3u8\n\n`;
  }

  // Write master playlist to file
  const fs = await import('node:fs/promises');
  await fs.writeFile(masterPlaylistPath, masterPlaylist);

  console.log(`📝 Master playlist generated: ${masterPlaylistPath}`);
  return masterPlaylistPath;
};

/**
 * Generate poster image from video
 */
const generatePosterImage = (
  inputFile: string,
  outputDir: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const posterPath = path.join(outputDir, 'poster.jpg');

    ffmpeg(inputFile)
      .frames(1)
      .seekInput(0)
      .output(posterPath)
      .outputOptions('-qscale:v 2')
      .on('end', () => {
        console.log('📸 Poster image generated');
        resolve(true);
      })
      .on('error', (err) => {
        console.error('❌ Error generating poster:', err.message);
        reject(err);
      })
      .run();
  });
};

/**
 * Process video with adaptive streaming
 */
export const processVideoWithAdaptiveStreaming = async (
  inputFilePath: string,
  baseOutputDir: string,
  gcsUploader?: GCSUploader
): Promise<boolean> => {
  const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
  const videoOutputDir = path.join(baseOutputDir, fileName);

  try {
    console.log(`📐 Analyzing video dimensions...`);

    // Get video dimensions
    const dimensions = await getVideoDimensions(inputFilePath);
    console.log(`- Dimensions: ${dimensions.width}x${dimensions.height}`);

    // Determine optimal profiles based on source resolution
    const profiles = getOptimalProfiles(dimensions.width, dimensions.height);
    console.log(`- Selected ${profiles.length} streaming profiles:`);
    profiles.forEach(profile => {
      console.log(`  • ${profile.name} (${profile.suffix}) - ${profile.video.bitrate}`);
    });

    // Ensure output directory exists
    await ensureDirectoryExists(videoOutputDir);

    console.log(`\n🎬 Starting adaptive streaming transcoding...`);

    // Generate all streaming variants
    const transcodeStartTime = Date.now();
    const results = await Promise.allSettled(
      profiles.map(profile => generateAdaptiveVariant(inputFilePath, videoOutputDir, profile))
    );

    // Check results
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    if (failureCount > 0) {
      console.log(`\n⚠️  ${failureCount} profile(s) failed to generate`);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(`- ${profiles[index].name}: ${result.reason}`);
        }
      });
    }

    if (successCount === 0) {
      throw new Error('All streaming profiles failed to generate');
    }

    const transcodeTime = ((Date.now() - transcodeStartTime) / 1000).toFixed(1);
    console.log(`\n✅ Transcoding completed in ${transcodeTime}s (${successCount}/${profiles.length} profiles)`);

    // Generate master playlist
    const masterPlaylistPath = await generateMasterPlaylist(videoOutputDir, profiles);

    // Generate poster image
    console.log(`\n📸 Generating poster image...`);
    const posterStartTime = Date.now();
    await generatePosterImage(inputFilePath, videoOutputDir);
    const posterTime = ((Date.now() - posterStartTime) / 1000).toFixed(1);
    console.log(`- Poster generation completed in ${posterTime}s`);

    // Upload to Google Cloud Storage if configured
    if (gcsUploader) {
      console.log(`\n📤 Uploading to Google Cloud Storage...`);
      const uploadStartTime = Date.now();
      const uploadResult = await gcsUploader.uploadVideoDirectory(videoOutputDir, fileName);
      const uploadTime = ((Date.now() - uploadStartTime) / 1000).toFixed(1);

      if (uploadResult.success) {
        console.log(`- Upload completed in ${uploadTime}s (${uploadResult.uploadedFiles.length} files)`);
        console.log(`- Available at: https://storage.googleapis.com/${gcsUploader['bucketName']}/vid/${fileName}/master.m3u8`);
      } else {
        console.error(`- Upload failed after ${uploadTime}s:`, uploadResult.errors);
        throw new Error('Failed to upload to GCS');
      }
    }

    const totalTime = ((Date.now() - transcodeStartTime) / 1000).toFixed(1);
    console.log(`\n🎉 Successfully processed ${fileName} with adaptive streaming in ${totalTime}s`);

    return true;

  } catch (error) {
    console.error(`❌ Failed to process ${fileName}:`, error);
    return false;
  }
};

/**
 * Process single video (legacy function for backward compatibility)
 */
export const processVideo = async (
  videoFile: string,
  gcsUploader?: GCSUploader
): Promise<void> => {
  const inputPath = path.join('./in', videoFile);
  const success = await processVideoWithAdaptiveStreaming(inputPath, './out', gcsUploader);

  if (!success) {
    throw new Error(`Failed to process ${videoFile}`);
  }
};