# Development & Production Pipeline

This project uses a dual-environment system for safe development and testing without affecting the live production site.

## 🚀 Quick Start

### Development Mode
```bash
npm run dev:development
```
- Shows **🚀 Local Dev** indicator
- Uses `ode-islands.dev.json` data
- Full console logging
- Hot reload enabled

### Production Testing Mode
```bash
npm run dev:production
```
- No dev indicator
- Uses production `ode-islands.json` data
- Minimal logging
- Production-like behavior

## 🌍 Environment Detection

The app automatically detects environment based on:
- `NODE_ENV === 'development'` (local dev)
- URL contains `git-development` (Vercel preview)
- URL parameter `?dev=true` (manual override)

## 📁 Data Pipeline

### File Structure
```
src/app/data/
├── ode-islands.json      # Production data
└── ode-islands.dev.json  # Development data

public/data/              # Auto-copied for fetch()
├── ode-islands.json
└── ode-islands.dev.json
```

### Data Loading Logic
1. **Development**: Tries to load `ode-islands.dev.json`, falls back to production
2. **Production**: Always loads `ode-islands.json`
3. **Console logs** show which data was loaded

## 🔄 Workflow Commands

### Data Management
```bash
npm run data:dev          # Switch to development data
npm run data:prod         # Switch to production data
```

### Development
```bash
npm run dev               # Standard development
npm run dev:development   # Force development mode
npm run dev:production    # Test production mode locally
```

### Video Transcoding
```bash
npm run transcode:watch   # Auto-process videos in /in folder
npm run upload           # Upload processed videos to GCS
```

## 🚦 Branch Strategy

- **`main`** → Production deployment (auto-deploy to live site)
- **`development`** → Staging environment (preview URLs)
- **Feature branches** → Development testing

## 🌐 Vercel Environments

### Production
- **URL**: `https://your-domain.com`
- **Branch**: `main`
- **Data**: `ode-islands.json`
- **Environment**: Production

### Preview/Staging
- **URL**: `https://your-site-git-development.vercel.app`
- **Branch**: `development`
- **Data**: `ode-islands.dev.json` (auto-detected)
- **Environment**: Preview

### Feature Previews
- **URL**: `https://your-site-git-[branch-name].vercel.app`
- **Branch**: Any feature branch
- **Data**: Based on branch content
- **Environment**: Preview

## 🎨 Development Features

### Visual Indicators
- **🚀 Local Dev**: Local development server
- **🚀 Preview**: Vercel preview deployment
- **🚀 Dev Mode**: Manual dev mode (`?dev=true`)
- **No indicator**: Production mode

### Console Logging
Development mode includes helpful logs:
```
🚀 Loaded development data    # Dev data loaded
📱 Loaded production data     # Production data loaded
📱 Loaded production data (fallback)  # Dev data failed, using prod
```

## 🔧 Safe Testing Workflow

### 1. Create Feature Branch
```bash
git checkout development
git pull origin development
git checkout -b feature/new-chapter
```

### 2. Make Changes
- Edit `src/app/data/ode-islands.dev.json` for content changes
- Test locally with `npm run dev:development`
- Commit changes to feature branch

### 3. Test on Preview
```bash
git push origin feature/new-chapter
```
- Vercel creates preview URL
- Test on actual deployment
- Share preview URL for feedback

### 4. Merge to Staging
```bash
git checkout development
git merge feature/new-chapter
git push origin development
```
- Updates staging environment
- Final testing before production

### 5. Deploy to Production
```bash
git checkout main
git merge development
git push origin main
```
- Deploys to live site
- Production data automatically used

## ⚡ Advanced Usage

### Manual Environment Override
Add `?dev=true` to any URL to force development mode:
- `https://your-site.com/chapter-1?dev=true`
- `https://preview-url.vercel.app/chapter-1?dev=true`

### Direct Data Editing
1. Edit `src/app/data/ode-islands.dev.json`
2. Run `npm run data:dev` to copy to public folder
3. Refresh browser to see changes

### Video Pipeline Integration
1. Add MP4s to `resources/transcoder/in/`
2. Run `npm run transcode:watch`
3. Videos auto-process and upload to GCS
4. Update JSON with new video URLs
5. Test in development environment first

## 🛡️ Safety Features

- **Branch protection**: `main` branch protected from direct pushes
- **Data isolation**: Dev changes don't affect production
- **Visual indicators**: Always know which environment you're in
- **Automatic fallbacks**: Dev data failures fall back to production
- **Preview URLs**: Test changes before going live
- **Cache-busting**: Automatic fresh data loading with manual override options

## 🔄 Cache Management

### Automatic Cache-Busting
The app automatically handles caching issues:
- **Development**: Always fetches fresh data with timestamp parameters
- **Production**: Uses build timestamps to invalidate cache on deployments
- **Fallbacks**: Static imports as backup if fetch fails

### Manual Cache Clearing (For Team)
If you're not seeing updates, use these methods:

#### Method 1: URL Parameters
Add these to any URL to force fresh data:
- `?debug=cache` - Shows cache debug panel
- `?dev=true` - Forces development mode with fresh data
- `?cacheBust=123` - Bypasses cache (any number)

#### Method 2: Cache Debug Panel
1. Add `?debug=cache` to your URL
2. Click **"CLEAR CACHE & RELOAD"** button
3. Or use **"HARD REFRESH"** for browser cache clear

#### Method 3: Browser Methods
- **Hard Refresh**: Cmd/Ctrl + Shift + R
- **Force Refresh**: Cmd/Ctrl + F5
- **Clear Site Data**: Browser Developer Tools > Application > Storage

### Console Logging
Watch browser console for cache status:
```
🔄 Fetching fresh data: /data/ode-islands.dev.json?v=1703123456789
✅ Successfully loaded ode-islands.dev.json with cache-buster
🚀 Loaded development data with cache-busting
```

## 📝 Best Practices

1. **Always test in development first**
2. **Use descriptive commit messages**
3. **Test on multiple devices using preview URLs**
4. **Keep development data in sync with production structure**
5. **Merge to `development` branch before `main`**
6. **Use feature branches for all changes**

## 🛣️ Product Roadmap

### Upcoming Features

#### 🎥 Video Analysis Pipeline
**Status**: Planned
**Priority**: Medium

Enhance the existing video transcoding pipeline with AI-powered content analysis:

**Features:**
- **Visual Content Identification**: Automatically detect and tag visual elements (faces, objects, scenes, colors, movement patterns)
- **Accessibility Descriptions**: Generate detailed audio descriptions for visually impaired users
- **Searchable Metadata**: Extract keywords, themes, and content tags for search functionality
- **Content Categorization**: Automatic classification of video content type (narrative, behind-scenes, character moments)

**Technical Approach:**
- Integrate with Google Cloud Video Intelligence API or similar service
- Add frame extraction at key moments for analysis
- Generate structured metadata JSON alongside video files
- Extend existing GCS upload pipeline to include metadata
- Create accessibility-compliant video descriptions following WCAG guidelines

**Benefits:**
- Enhanced searchability across video content
- Improved accessibility compliance
- Better content organization and discovery
- Automated content tagging reduces manual work

**Implementation Notes:**
- Extend existing `adaptive-transcoder.ts` pipeline
- Add new analysis step after transcoding, before GCS upload
- Store metadata in structured format for easy integration
- Consider cost implications of AI analysis services

This pipeline ensures you can experiment safely while maintaining a stable production environment! 🚀