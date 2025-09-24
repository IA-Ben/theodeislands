import ffmpeg from 'fluent-ffmpeg';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createGCSUploader, GCSUploader } from './helpers/gcs-uploader.js';

const inputDir = './in';
const outputDir = './out';

interface VideoConfig {
  '-profile:v': string;
  '-level': string;
  '-x264-params': string;
  '-b:v': string;
  '-maxrate': string;
  '-bufsize': string;
  '-hls_time': string;
  '-hls_playlist_type': string;
  '-hls_flags': string;
  '-hls_list_size': string;
  '-ac': string;
  '-ar': string;
  '-b:a': string;
  '-hls_segment_filename': string;
}

const createVideoConfig = (segmentOutputDir: string): VideoConfig => ({
  '-profile:v': 'high',
  '-level': '4.0',
  '-x264-params': 'nal-hrd=cbr:force-cfr=1',
  '-b:v': '2984k',
  '-maxrate': '2984k',
  '-bufsize': '5968k',
  '-hls_time': '6',
  '-hls_playlist_type': 'vod',
  '-hls_flags': 'independent_segments',
  '-hls_list_size': '0',
  '-ac': '2',
  '-ar': '48000',
  '-b:a': '128k',
  '-hls_segment_filename': `${segmentOutputDir}/segment-%03d.ts`,
});

const generateVideo = (
  inputFile: string,
  videoOutputDir: string,
  dim: { width: number; height: number },
): Promise<boolean> => {
  try {
    return new Promise((resolve, reject) => {
      const config = Object.entries(
        createVideoConfig(videoOutputDir),
      ).flat() as string[];
      ffmpeg(inputFile)
        .addOption('-preset', 'fast')
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`${dim.width}x${dim.height}`)
        .videoBitrate(2800)
        .audioBitrate(128)
        .outputOptions(config)
        .output(`${videoOutputDir}/master.m3u8`)
        .on('end', () => {
          console.log('- HLS stream generated');
          resolve(true);
        })
        .on('error', err => {
          console.error('❌ Error processing HLS:', err.message);
          reject(err);
        })
        .run();
    });
  } catch (err) {
    console.error('Error creating video', err);
    return Promise.resolve(false);
  }
};

const generateImage = (
  inputFile: string,
  imageOutputDir: string,
): Promise<boolean> => {
  try {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputFile)
        .frames(1)
        .seekInput(0)
        .output(`${imageOutputDir}/poster.jpg`)
        .outputOptions('-qscale:v 2');
      command
        .on('end', () => {
          console.log('- Poster frame generated');
          resolve(true);
        })
        .on('error', err => {
          console.error('❌ Error generating poster:', err.message);
          reject(err);
        })
        .run();
    });
  } catch (err) {
    console.error('Error creating image', err);
    return Promise.resolve(false);
  }
};

const getVideoDimensions = (filePath: string): Promise<{ width: number; height: number }> => {
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

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory ${dirPath}:`, err);
    throw err;
  }
};

const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv'];
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext);
};

const processVideo = async (videoFile: string, gcsUploader?: GCSUploader): Promise<void> => {
  const inputPath = path.join(inputDir, videoFile);
  const baseName = path.parse(videoFile).name;
  const videoOutputDir = path.join(outputDir, baseName);

  console.log(`\n🎬 Processing: ${videoFile}`);

  try {
    // Ensure output directory exists
    await ensureDirectoryExists(videoOutputDir);

    // Get video dimensions
    const dimensions = await getVideoDimensions(inputPath);
    console.log(`- Dimensions: ${dimensions.width}x${dimensions.height}`);

    // Generate HLS video
    const videoStart = Date.now();
    const videoSuccess = await generateVideo(inputPath, videoOutputDir, dimensions);
    const videoTime = ((Date.now() - videoStart) / 1000).toFixed(1);

    if (!videoSuccess) {
      throw new Error('Failed to generate HLS video');
    }
    console.log(`- Video processing completed in ${videoTime}s`);

    // Generate poster image
    const imageStart = Date.now();
    const imageSuccess = await generateImage(inputPath, videoOutputDir);
    const imageTime = ((Date.now() - imageStart) / 1000).toFixed(1);

    if (!imageSuccess) {
      throw new Error('Failed to generate poster image');
    }
    console.log(`- Image processing completed in ${imageTime}s`);

    // Upload to Google Cloud Storage if configured
    if (gcsUploader) {
      console.log(`- Uploading to Google Cloud Storage...`);
      const uploadStart = Date.now();
      const uploadResult = await gcsUploader.uploadVideoDirectory(videoOutputDir, baseName);
      const uploadTime = ((Date.now() - uploadStart) / 1000).toFixed(1);

      if (uploadResult.success) {
        console.log(`- Upload completed in ${uploadTime}s (${uploadResult.uploadedFiles.length} files)`);
      } else {
        console.error(`- Upload failed after ${uploadTime}s:`, uploadResult.errors);
        throw new Error('Failed to upload to GCS');
      }
    }

    console.log(`✅ Successfully processed: ${videoFile}`);

  } catch (err) {
    console.error(`❌ Failed to process ${videoFile}:`, err);
  }
};

const start = async (): Promise<void> => {
  try {
    console.log('🚀 Starting video transcoding process...\n');

    // Initialize Google Cloud Storage uploader (optional)
    let gcsUploader: GCSUploader | undefined;
    const useGCS = process.env.ENABLE_GCS_UPLOAD === 'true';

    if (useGCS) {
      console.log('📤 Initializing Google Cloud Storage...');
      const uploader = createGCSUploader();

      if (uploader) {
        const connected = await uploader.testConnection();
        if (connected) {
          gcsUploader = uploader;
          console.log('✅ GCS upload enabled\n');
        } else {
          console.log('❌ GCS connection failed - continuing without upload\n');
        }
      } else {
        console.log('❌ GCS configuration invalid - continuing without upload\n');
      }
    } else {
      console.log('📁 GCS upload disabled - videos will only be saved locally\n');
    }

    // Ensure output directory exists
    await ensureDirectoryExists(outputDir);

    // Read input directory
    const files = await readdir(inputDir);
    const videoFiles = files.filter(isVideoFile);

    if (videoFiles.length === 0) {
      console.log('No video files found in the input directory.');
      return;
    }

    console.log(`Found ${videoFiles.length} video file(s) to process:`);
    videoFiles.forEach(file => console.log(`- ${file}`));

    // Process each video file sequentially
    for (const videoFile of videoFiles) {
      await processVideo(videoFile, gcsUploader);
    }

    console.log('\n🎉 All videos processed successfully!');

  } catch (err) {
    console.error('❌ Error in main process:', err);
    process.exit(1);
  }
};

// Run the main function
start().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});
