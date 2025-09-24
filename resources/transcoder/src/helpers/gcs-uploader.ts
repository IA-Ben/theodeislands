import { Storage } from '@google-cloud/storage';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

interface GCSConfig {
  bucketName: string;
  keyFilename?: string;
  projectId?: string;
}

interface UploadResult {
  success: boolean;
  uploadedFiles: string[];
  errors: string[];
}

export class GCSUploader {
  private storage: Storage;
  private bucketName: string;

  constructor(config: GCSConfig) {
    this.bucketName = config.bucketName;

    // Initialize Google Cloud Storage
    this.storage = new Storage({
      keyFilename: config.keyFilename,
      projectId: config.projectId,
    });
  }

  /**
   * Upload a single file to GCS
   */
  async uploadFile(
    localFilePath: string,
    destinationPath: string
  ): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);

      await bucket.upload(localFilePath, {
        destination: destinationPath,
        metadata: {
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });

      console.log(`✅ Uploaded: ${localFilePath} → gs://${this.bucketName}/${destinationPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to upload ${localFilePath}:`, error);
      return false;
    }
  }

  /**
   * Upload all files in a directory to GCS
   */
  async uploadDirectory(
    localDirPath: string,
    gcsDestinationPath: string
  ): Promise<UploadResult> {
    const result: UploadResult = {
      success: true,
      uploadedFiles: [],
      errors: []
    };

    try {
      const files = await readdir(localDirPath, { recursive: true });

      console.log(`📤 Uploading ${files.length} files from ${localDirPath} to gs://${this.bucketName}/${gcsDestinationPath}`);

      for (const file of files) {
        if (typeof file === 'string') {
          const localFilePath = path.join(localDirPath, file);
          const gcsFilePath = path.join(gcsDestinationPath, file).replace(/\\/g, '/'); // Ensure forward slashes for GCS

          const success = await this.uploadFile(localFilePath, gcsFilePath);

          if (success) {
            result.uploadedFiles.push(gcsFilePath);
          } else {
            result.errors.push(`Failed to upload ${file}`);
            result.success = false;
          }
        }
      }

      if (result.success) {
        console.log(`🎉 Successfully uploaded all ${result.uploadedFiles.length} files!`);
      } else {
        console.log(`⚠️ Upload completed with ${result.errors.length} errors`);
      }

    } catch (error) {
      console.error('❌ Error reading directory:', error);
      result.success = false;
      result.errors.push(`Failed to read directory: ${error}`);
    }

    return result;
  }

  /**
   * Upload video directory (with HLS files) to the /vid folder in GCS
   */
  async uploadVideoDirectory(
    localVideoDir: string,
    videoName: string
  ): Promise<UploadResult> {
    const gcsPath = `vid/${videoName}`;
    return this.uploadDirectory(localVideoDir, gcsPath);
  }

  /**
   * Check if bucket exists and is accessible
   */
  async testConnection(): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const [exists] = await bucket.exists();

      if (exists) {
        console.log(`✅ Successfully connected to GCS bucket: ${this.bucketName}`);
        return true;
      } else {
        console.error(`❌ Bucket '${this.bucketName}' does not exist or is not accessible`);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to connect to GCS:', error);
      return false;
    }
  }
}

/**
 * Create GCS uploader instance from environment variables
 */
export function createGCSUploader(): GCSUploader | null {
  const bucketName = process.env.GCS_BUCKET_NAME || 'odeislands';
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.GCS_PROJECT_ID;

  if (!bucketName) {
    console.error('❌ GCS_BUCKET_NAME environment variable is required');
    return null;
  }

  return new GCSUploader({
    bucketName,
    keyFilename,
    projectId,
  });
}