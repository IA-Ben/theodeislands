import 'dotenv/config';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { createGCSUploader, GCSUploader } from './helpers/gcs-uploader.js';
import { processVideoWithAdaptiveStreaming } from './adaptive-transcoder.js';

const inputDir = './in';
const outputDir = './out';

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  const { mkdir } = await import('node:fs/promises');
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

  console.log(`\n🎬 Processing: ${videoFile} with adaptive streaming`);

  try {
    const success = await processVideoWithAdaptiveStreaming(inputPath, outputDir, gcsUploader);

    if (success) {
      console.log(`✅ Successfully processed: ${videoFile}`);
    } else {
      throw new Error(`Failed to process ${videoFile}`);
    }
  } catch (err) {
    console.error(`❌ Failed to process ${videoFile}:`, err);
  }
};

const start = async (): Promise<void> => {
  try {
    console.log('🚀 Starting adaptive streaming video transcoding process...\n');

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
