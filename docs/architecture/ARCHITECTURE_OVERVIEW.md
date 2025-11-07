# 🏗️ The Ode Islands - Architecture Overview

**Maintained by:** Augment Code 🎯  
**Last Updated:** 2025-10-04  
**Version:** 1.0

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Project Structure](#project-structure)
5. [Key Systems](#key-systems)
6. [Data Flow](#data-flow)
7. [Integration Points](#integration-points)
8. [Performance Considerations](#performance-considerations)
9. [Security](#security)
10. [Future Architecture](#future-architecture)

---

## 🎯 System Overview

**The Ode Islands** is an immersive storytelling platform combining:
- Mixed reality experiences
- AI-powered content generation
- Event management and ticketing
- Interactive storytelling
- Memory collection and sharing

**Target Users:**
- **End Users:** Event attendees experiencing the story
- **Creators/Admins:** Event organizers and content creators

**Event Phases:**
- **Before Event:** Discovery, registration, anticipation
- **At Event:** Live mixed reality experience
- **After Event:** Memory collection, sharing, community

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15.4.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety (strict mode)
- **Turbopack** - Fast bundler for development

### Styling
- **Tailwind CSS v4** - Utility-first CSS
- **Manrope Font** - Custom typography

### State Management
- **React Context API** - Global state (DemoContext, ThemeContext)
- **useState/useReducer** - Local component state
- **Server Components** - Server-side state

### Data & Content
- **JSON files** - Static content (public/data/)
- **File system** - Content storage
- **HLS streaming** - Video delivery

### AI Integration
- **Google Veo 3** - Video generation (8s, native audio)
- **Runway ML** - Video generation (10s, motion control)
- **Pika Labs** - Video generation (10s, keyframing)
- **Stable Video** - Video generation (2s, cost-effective)
- **AI Collaboration API** - Multi-AI coordination (port 3002)

### Development Tools
- **ESLint** - Code linting
- **Git** - Version control
- **Feature Flags** - Progressive rollout

---

## 🏛️ Architecture Patterns

### 1. **App Router Architecture**

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home page
├── roadmap/
│   └── page.tsx        # Roadmap feature
├── content-studio/
│   └── page.tsx        # Content creation
└── api/
    └── content-studio/
        └── route.ts    # API endpoints
```

**Pattern:** File-system based routing with Server Components by default

---

### 2. **Component Architecture**

```
components/
├── ai-collab/          # AI collaboration UI
├── cms/                # Content management
├── demo/               # Demo mode features
├── roadmap/            # Roadmap planning
├── DevIndicator.tsx    # Development utilities
└── CacheDebugger.tsx   # Performance tools
```

**Pattern:** Feature-based organization with co-located components

---

### 3. **Context Providers**

```typescript
// Pattern: Provider wraps app in layout.tsx
<DemoProvider>
  <DevIndicator />
  <CacheDebugger />
  {children}
  <PresenterModePortal />
  <AICollaborationPanel />
</DemoProvider>
```

**Used for:**
- Demo mode state
- Theme preferences
- User authentication (future)
- Feature flags

---

### 4. **Portal Pattern**

```typescript
// Pattern: Render outside component tree
import { createPortal } from 'react-dom';

return createPortal(
  <PresenterMode />,
  document.body
);
```

**Used for:**
- Modals and overlays
- Presenter mode
- AI collaboration panel
- Build panel

---

### 5. **Event-Driven Architecture**

```typescript
// Pattern: CustomEvent for cross-component communication
window.dispatchEvent(new CustomEvent('demo:navigate', {
  detail: { step: 'chapter-1' }
}));

window.addEventListener('demo:navigate', (e) => {
  // Handle navigation
});
```

**Used for:**
- Demo mode coordination
- AI collaboration messages
- Build progress updates

---

### 6. **Feature Flags**

```typescript
// Pattern: Production guards with tree-shaking
const FEATURE_FLAGS = {
  enableDemoMode: process.env.NODE_ENV === 'development',
  enableAICollab: true,
  enableContentStudio: true
};

if (FEATURE_FLAGS.enableDemoMode) {
  // Demo code (removed in production build)
}
```

**Benefits:**
- Safe progressive rollout
- A/B testing capability
- Emergency kill switch
- Clean production builds

---

## 📁 Project Structure

```
theodeislands/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── roadmap/            # Roadmap feature
│   │   ├── content-studio/     # Content creation
│   │   └── api/                # API routes
│   │
│   ├── components/             # React components
│   │   ├── ai-collab/          # AI collaboration
│   │   ├── cms/                # Content management
│   │   ├── demo/               # Demo mode
│   │   └── roadmap/            # Roadmap planning
│   │
│   ├── contexts/               # React contexts
│   │   ├── DemoContext.tsx     # Demo state
│   │   └── ThemeContext.tsx    # Theme state
│   │
│   ├── lib/                    # Utilities & services
│   │   ├── video-generation.ts # Video API wrapper
│   │   └── utils.ts            # Helper functions
│   │
│   └── ai-pair-programming/    # AI collaboration
│       ├── session-manager.ts  # Session handling
│       ├── codex-bridge.ts     # Codex integration
│       ├── augment-helper.ts   # Augment integration
│       └── live-sync.ts        # Real-time sync
│
├── public/
│   ├── data/                   # Static content
│   │   ├── ode-islands.json    # Story data
│   │   └── events.json         # Event data
│   └── assets/                 # Images, videos
│
├── docs/
│   └── architecture/           # Architecture docs
│       ├── ARCHITECTURE_OVERVIEW.md
│       └── ADRs/               # Decision records
│
├── demo-assets/                # Demo configurations
│   └── ode_islands_demo_pack/
│
└── [config files]              # Next.js, TypeScript, etc.
```

---

## 🔑 Key Systems

### 1. **AI Collaboration System**

**Purpose:** Coordinate multiple AI agents working together

**Components:**
- Session Manager (session-manager.ts)
- AI Collaboration Panel (AICollaborationPanel.tsx)
- Message Bus (CustomEvent-based)
- Collaboration API (port 3002)

**AI Agents:**
- 🏗️ Claude - Architecture & Implementation
- 📚 ChatGPT - Research & Documentation
- 💻 Codex - Real-time Development
- 🎯 Augment - Code Generation & Optimization

**Flow:**
```
1. User creates feature card
2. Augment starts AI discussion
3. AIs collaborate on architecture
4. User drags card to Build Panel
5. AIs execute 11-phase build
6. Progress tracked in real-time
7. Code deployed to feature branch
```

---

### 2. **Content Studio**

**Purpose:** AI-powered video and content generation

**Components:**
- Content Studio UI (content-studio/page.tsx)
- Video Generation API (lib/video-generation.ts)
- Provider Abstraction (supports 4 providers)
- Project Management

**Providers:**
- Google Veo 3 (8s, native audio)
- Runway ML (10s, motion control)
- Pika Labs (10s, keyframing)
- Stable Video (2s, cost-effective)

**Flow:**
```
1. Creator selects content type
2. Chooses video provider
3. Writes prompt
4. Generates video
5. Reviews result
6. Publishes to Ode Islands
```

---

### 3. **Roadmap System**

**Purpose:** Feature planning and AI-powered development

**Components:**
- Roadmap Board (RoadmapBoard.tsx)
- Feature Cards (drag & drop)
- Spec Builder (SpecBuilderPanel.tsx)
- Build Panel (BuildPanel.tsx)
- Filters (RoadmapFilters.tsx)

**Workflow:**
```
1. Create feature card
2. Assign AIs
3. Build specification
4. Request AI reviews
5. Drag to Build Panel
6. AIs collaborate to build
7. Track progress
8. Deploy when complete
```

---

### 4. **Demo Mode**

**Purpose:** Presenter-friendly demo for Southbank showcase

**Components:**
- Demo Context (DemoContext.tsx)
- Presenter Mode (PresenterMode.tsx)
- Demo Scripts (demo-assets/)
- Event Bus (CustomEvent)

**Features:**
- Shift+D to toggle
- 5-minute scripted flow
- Keyboard shortcuts (1-6)
- Progress indicators
- Before/Event/After phases

---

## 🔄 Data Flow

### Content Delivery

```
Static Content (JSON)
    ↓
Next.js Server Component
    ↓
React Client Component
    ↓
User Interface
```

### Video Generation

```
User Input (Prompt)
    ↓
Content Studio API
    ↓
Video Provider (Veo3/Runway/Pika/Stable)
    ↓
Generated Video URL
    ↓
HLS Streaming
    ↓
User Playback
```

### AI Collaboration

```
Feature Request
    ↓
Roadmap Card Created
    ↓
AI Discussion (via API)
    ↓
Spec Built
    ↓
Build Panel (11 phases)
    ↓
Code Generated
    ↓
Tests Run
    ↓
Deployed to Branch
```

---

## 🔗 Integration Points

### External Services

**Video Generation:**
- Google Cloud (Veo 3)
- Runway ML API
- Pika Labs API
- Stability AI API

**Future Integrations:**
- Ticketing system
- Payment processing
- Email service
- Analytics
- CDN for assets

### Internal APIs

**AI Collaboration API (port 3002):**
```
GET  /api/ai-collaboration          # Get active session
POST /api/ai-collaboration          # Create session/send message
GET  /api/ai-collaboration?sessionId # Get session details
```

**Content Studio API:**
```
POST /api/content-studio?action=create-project
POST /api/content-studio?action=generate-video
GET  /api/content-studio?action=get-projects
POST /api/content-studio?action=publish-content
```

---

## ⚡ Performance Considerations

### Current Optimizations

1. **Server Components** - Reduce client bundle
2. **Turbopack** - Fast development builds
3. **Code Splitting** - Lazy load features
4. **Image Optimization** - Next.js Image component
5. **HLS Streaming** - Efficient video delivery

### Performance Targets

- **Page Load:** < 2s
- **Time to Interactive:** < 3s
- **Lighthouse Score:** > 90
- **Bundle Size:** < 500KB (main)
- **Video Start:** < 1s

### Future Optimizations

- [ ] Service Worker (PWA)
- [ ] Offline support
- [ ] Edge caching
- [ ] Image CDN
- [ ] Bundle analysis
- [ ] Tree shaking optimization

---

## 🔐 Security

### Current Measures

1. **TypeScript** - Type safety
2. **Environment Variables** - API keys protected
3. **CORS** - API access control
4. **Input Validation** - Form validation

### Future Security

- [ ] Authentication (NextAuth.js)
- [ ] Authorization (RBAC)
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Content Security Policy
- [ ] API key rotation
- [ ] Audit logging

---

## 🚀 Future Architecture

### Planned Enhancements

**Phase 1: Core Features (Q1 2025)**
- User authentication
- Ticketing system
- Payment integration
- Email notifications

**Phase 2: Scale (Q2 2025)**
- Database (PostgreSQL)
- Redis caching
- CDN integration
- Load balancing

**Phase 3: Advanced (Q3 2025)**
- Real-time features (WebSocket)
- Mobile app (React Native)
- Blockchain integration (optional)
- Advanced analytics

---

## 📚 Related Documentation

- [ADR Index](./ADRs/README.md) - Architecture Decision Records
- [API Documentation](./API.md) - API reference
- [Component Guide](./COMPONENTS.md) - Component patterns
- [Deployment Guide](./DEPLOYMENT.md) - Deployment process

---

**Maintained by Augment Code 🎯**  
*Keeping architecture documented and accessible!*

