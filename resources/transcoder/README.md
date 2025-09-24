# Video Transcoder with Google Cloud Storage

This transcoder processes video files into HLS format and optionally uploads them to Google Cloud Storage.

## Features

- Converts video files to HLS format (`.m3u8` playlist + `.ts` segments)
- Generates poster images from videos
- Uploads processed videos to Google Cloud Storage
- Supports batch processing of multiple videos

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

### 1. Add Video Files

Place your video files in the `./in` directory:

```bash
cp your-video.mp4 ./in/
```

### 2. Run Transcoder

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

### 3. Output

- **Local**: Processed videos are saved in `./out/[video-name]/`
- **GCS**: Videos are uploaded to `gs://your-bucket/vid/[video-name]/`

## File Structure

```
./in/                    # Input video files
./out/                   # Output HLS files (local)
├── video1/
│   ├── master.m3u8     # HLS playlist
│   ├── segment-000.ts  # Video segments
│   ├── segment-001.ts
│   └── poster.jpg      # Generated thumbnail
└── video2/
    └── ...

# GCS Structure (if enabled)
gs://your-bucket/vid/
├── video1/
│   ├── master.m3u8
│   ├── segment-000.ts
│   ├── segment-001.ts
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

## Example Usage

```bash
# 1. Add video files
cp my-video.mp4 ./in/

# 2. Configure GCS (optional)
export ENABLE_GCS_UPLOAD=true
export GCS_BUCKET_NAME=odeislands
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# 3. Run transcoder
npm run dev
```

The transcoded video will be:
- Saved locally: `./out/my-video/master.m3u8`
- Uploaded to GCS: `gs://odeislands/vid/my-video/master.m3u8`
- Accessible at: `https://storage.googleapis.com/odeislands/vid/my-video/master.m3u8`