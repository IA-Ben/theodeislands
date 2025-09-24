import 'dotenv/config';
import chokidar from 'chokidar';
import path from 'node:path';
import { stat } from 'node:fs/promises';
import { createGCSUploader, GCSUploader } from './helpers/gcs-uploader.js';
import { processVideoWithAdaptiveStreaming } from './adaptive-transcoder.js';

const inputDir = './in';
const outputDir = './out';

interface WatcherConfig {
  inputDir: string;
  outputDir: string;
  gcsUploader?: GCSUploader;
  debounceMs: number;
}

class VideoWatcher {
  private config: WatcherConfig;
  private processingQueue = new Set<string>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(config: WatcherConfig) {
    this.config = config;
  }

  /**
   * Start watching for video files
   */
  async start(): Promise<void> {
    console.log(`👀 Watching for video files in: ${this.config.inputDir}`);

    const watcher = chokidar.watch(this.config.inputDir, {
      ignored: /^\./,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000, // Wait 2s after file stops changing
        pollInterval: 100,
      },
    });

    // Handle new files
    watcher.on('add', async (filePath: string) => {
      await this.handleFileEvent('added', filePath);
    });

    // Handle file changes
    watcher.on('change', async (filePath: string) => {
      await this.handleFileEvent('changed', filePath);
    });

    // Handle errors
    watcher.on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

    console.log('✅ File watcher started successfully');
    console.log('📁 Drop MP4 files into the /in folder to auto-process them');
    console.log('🔄 Press Ctrl+C to stop watching\n');

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping file watcher...');
      watcher.close().then(() => {
        console.log('✅ File watcher stopped');
        process.exit(0);
      });
    });
  }

  /**
   * Handle file system events
   */
  private async handleFileEvent(event: string, filePath: string): Promise<void> {
    const fileName = path.basename(filePath);

    // Check if it's a video file
    if (!this.isVideoFile(fileName)) {
      return;
    }

    console.log(`📁 File ${event}: ${fileName}`);

    // Clear existing debounce timer
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(filePath);
      await this.processVideo(filePath);
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Process a video file
   */
  private async processVideo(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);

    // Check if already processing
    if (this.processingQueue.has(filePath)) {
      console.log(`⏳ Already processing: ${fileName}`);
      return;
    }

    try {
      // Verify file exists and is readable
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        console.log(`❌ Not a file: ${fileName}`);
        return;
      }

      // Add to processing queue
      this.processingQueue.add(filePath);

      console.log(`\n🎬 Auto-processing: ${fileName}`);
      const startTime = Date.now();

      // Process with adaptive streaming
      const success = await processVideoWithAdaptiveStreaming(
        filePath,
        this.config.outputDir,
        this.config.gcsUploader
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (success) {
        console.log(`✅ Successfully processed ${fileName} in ${duration}s`);
      } else {
        console.log(`❌ Failed to process ${fileName} after ${duration}s`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error);
    } finally {
      // Remove from processing queue
      this.processingQueue.delete(filePath);
    }
  }

  /**
   * Check if file is a supported video format
   */
  private isVideoFile(filename: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv'];
    const ext = path.extname(filename).toLowerCase();
    return videoExtensions.includes(ext);
  }

  /**
   * Get current processing status
   */
  getStatus() {
    return {
      watching: true,
      inputDir: this.config.inputDir,
      processing: Array.from(this.processingQueue),
      queueLength: this.processingQueue.size,
    };
  }
}

/**
 * Initialize and start the video watcher
 */
async function startWatcher(): Promise<void> {
  console.log('🚀 Starting automated video transcoding watcher...\n');

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
        console.log('✅ GCS upload enabled');
      } else {
        console.log('❌ GCS connection failed - continuing without upload');
      }
    } else {
      console.log('❌ GCS configuration invalid - continuing without upload');
    }
  } else {
    console.log('📁 GCS upload disabled - videos will only be saved locally');
  }

  console.log(''); // Add spacing

  // Create and start watcher
  const watcher = new VideoWatcher({
    inputDir,
    outputDir,
    gcsUploader,
    debounceMs: 1000, // 1 second debounce
  });

  await watcher.start();
}

// Run the watcher
startWatcher().catch(error => {
  console.error('❌ Failed to start watcher:', error);
  process.exit(1);
});