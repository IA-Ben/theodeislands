# Adaptive Video Transcoder with Automated Workflow

This transcoder processes video files into adaptive streaming HLS format with multiple quality profiles and optionally uploads them to Google Cloud Storage. It supports both manual batch processing and automated file watching.

## Features

- **Adaptive Streaming**: Generates multiple quality profiles (240p, 360p, 480p, 720p, 1080p) optimized for different devices and connection speeds
- **Mobile Optimization**: Intelligent profile selection based on source video resolution to avoid upscaling
- **Automated Workflow**: File system watcher automatically processes MP4s when added to the input folder
- **Batch Processing**: Process multiple videos manually
- **Poster Generation**: Creates thumbnail images from videos
- **Google Cloud Storage**: Optional upload to GCS with organized folder structure
- **Progress Tracking**: Real-time progress monitoring and detailed logging

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google Cloud Storage (Optional)

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Enable GCS upload
ENABLE_GCS_UPLOAD=true

# Your GCS bucket name (defaults to 'odeislands')
GCS_BUCKET_NAME=your-bucket-name

# Your GCP project ID
GCS_PROJECT_ID=your-project-id

# Path to your service account key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 3. Google Cloud Authentication

#### Option A: Service Account Key File

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin → Service Accounts
3. Create a new service account or use existing one
4. Generate a JSON key file
5. Set the path in `GOOGLE_APPLICATION_CREDENTIALS`

#### Option B: Default Authentication (if running on GCP)

If running on Google Cloud Platform, authentication will use the default service account automatically.

### 4. Set Permissions

Your service account needs the following permissions:
- `Storage Object Creator` (to upload files)
- `Storage Object Viewer` (to test connectivity)

## Usage

### Mode 1: Automated File Watching (Recommended)

The watcher automatically processes any MP4 files added to the `./in` directory:

```bash
# Development mode (auto-reload watcher)
npm run dev:watch

# Production mode
npm run build
npm run start:watch
```

**Usage**: Simply drop MP4 files into the `./in` folder and they'll be automatically processed with adaptive streaming profiles.

### Mode 2: Manual Batch Processing

Process all existing files in the input directory:

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Output Structure

Each processed video creates an organized directory with adaptive streaming variants:

- **Local**: `./out/[video-name]/`
  - `master.m3u8` - Master playlist for adaptive streaming
  - `240p/`, `360p/`, `480p/`, `720p/`, `1080p/` - Quality variant folders
  - `poster.jpg` - Generated thumbnail
- **GCS**: `gs://your-bucket/vid/[video-name]/` (same structure)

## Adaptive Streaming Structure

```
./in/                    # Input video files (MP4s)
./out/                   # Output adaptive streaming files
├── video1/
│   ├── master.m3u8     # Master playlist (adaptive streaming)
│   ├── 240p/
│   │   ├── playlist.m3u8
│   │   └── segment_*.ts
│   ├── 360p/
│   │   ├── playlist.m3u8
│   │   └── segment_*.ts
│   ├── 720p/
│   │   ├── playlist.m3u8
│   │   └── segment_*.ts
│   └── poster.jpg
└── video2/
    └── ...

# GCS Structure (if enabled)
gs://your-bucket/vid/
├── video1/
│   ├── master.m3u8
│   ├── 240p/, 360p/, 720p/, etc.
│   └── poster.jpg
└── video2/
    └── ...
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ENABLE_GCS_UPLOAD` | Enable Google Cloud Storage upload | `false` | No |
| `GCS_BUCKET_NAME` | GCS bucket name | `odeislands` | If GCS enabled |
| `GCS_PROJECT_ID` | Google Cloud project ID | - | If GCS enabled |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | - | If GCS enabled |

## Troubleshooting

### GCS Connection Issues

1. **Check credentials**: Ensure your service account key is valid
2. **Verify permissions**: Make sure your service account has proper bucket access
3. **Test bucket access**: The transcoder will test connectivity on startup

### Video Processing Issues

1. **Check FFmpeg**: Ensure FFmpeg is installed on your system
2. **Supported formats**: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`, `.wmv`
3. **Check logs**: Error details are printed to console

## Quick Start Examples

### Automated Processing (Recommended)

```bash
# 1. Configure GCS (optional)
export ENABLE_GCS_UPLOAD=true
export GCS_BUCKET_NAME=odeislands
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# 2. Start the automated watcher
npm run dev:watch

# 3. Add video files (in another terminal or file manager)
cp my-video.mp4 ./in/
# The video will be automatically processed with adaptive streaming!
```

### Manual Batch Processing

```bash
# 1. Add video files first
cp video1.mp4 video2.mp4 ./in/

# 2. Process all videos at once
npm run dev
```

## Adaptive Streaming Output

Each processed video generates:
- **Master playlist**: `./out/my-video/master.m3u8` - Entry point for adaptive streaming
- **Multiple qualities**: Automatically selected based on source resolution
- **Mobile optimized**: Lower bitrates and resolutions for better mobile experience
- **GCS URLs**: `https://storage.googleapis.com/odeislands/vid/my-video/master.m3u8`

Players will automatically choose the best quality based on device capabilities and connection speed.