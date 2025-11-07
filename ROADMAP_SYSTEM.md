# 🗺️ Roadmap Card System

**Built by Augment Code** for collaborative AI feature planning.

---

## 🎯 Overview

The Roadmap Card System is a drag-and-drop Kanban board for planning features collaboratively with AI assistants. Create feature cards, assign them to AIs, request reviews, and track progress visually.

## ✨ Features

### 📋 Kanban Board
- **5 Columns**: Backlog → Planning → In Progress → Review → Done
- **Drag & Drop**: Move cards between columns seamlessly
- **Visual Status**: Color-coded columns and priority indicators

### 🎴 Feature Cards
Each card includes:
- **Title & Description**: Clear feature definition
- **Priority**: High (🔴), Medium (🟡), Low (🔵)
- **Assigned AIs**: Select which AIs should work on it
  - 🏗️ Claude - Architecture & Implementation
  - 📚 ChatGPT - Research & Documentation
  - 💻 VS Code Codex - Real-time Development
  - 🎯 Augment Code - Code Generation & Optimization
- **Estimate**: Days to complete
- **Tags**: Categorize features (ui, backend, testing, etc.)
- **Dependencies**: Track feature relationships
- **AI Reviews**: Collect feedback from each AI

### 🤖 AI Collaboration
- **Request Reviews**: Click "🤖 Request Review" to get AI feedback
- **Multi-AI Assignment**: Assign multiple AIs to collaborate
- **Review Status**: See which AIs have approved/reviewed

---

## 🚀 Getting Started

### 1. Fix Port Issues (One-Time Setup)

If you see port conflicts, run:

```bash
# Kill any process on port 3000
npm run kill-port

# Or manually:
lsof -ti:3000 | xargs kill -9
```

### 2. Start the Dev Server

```bash
# Standard development (port 3000)
npm run dev

# For AI collaboration server (port 3002)
npm run dev:collab
```

### 3. Access the Roadmap

Open your browser to:
```
http://localhost:3000/roadmap
```

---

## 🎮 How to Use

### Creating a Feature Card

1. Click **"+ New Feature Card"** button
2. Fill in the form:
   - **Title**: Short, descriptive name
   - **Description**: Detailed explanation
   - **Priority**: High, Medium, or Low
   - **Estimated Days**: How long it will take
   - **Assign AIs**: Select which AIs should work on it
   - **Tags**: Add categories (press Enter to add)
   - **Initial Status**: Where to place the card
3. Click **"Create Feature Card"**

### Moving Cards

- **Drag** a card from one column
- **Drop** it in another column
- Status updates automatically

### Requesting AI Reviews

1. Click **"🤖 Request Review"** on any card
2. AIs will be notified via the collaboration system
3. Reviews appear on the card with approval status

### Editing Cards

- Click the **✏️** button on any card
- (Form coming soon)

---

## 🔧 Port Configuration Fixed

### What Was Wrong

The original setup had:
- ❌ Webpack config while using Turbopack (causes warnings)
- ❌ No explicit port specification (random ports)
- ❌ Port conflicts when restarting

### What's Fixed

✅ **Removed webpack config** when using Turbopack
✅ **Explicit port 3000** in all dev scripts
✅ **Separate port 3002** for collaboration server
✅ **Kill-port script** to clean up conflicts

### Updated Scripts

```json
{
  "dev": "next dev --turbopack -p 3000",
  "dev:production": "node scripts/dev-switch.js prod && next dev --turbopack -p 3000",
  "dev:development": "node scripts/dev-switch.js dev && next dev --turbopack -p 3000",
  "dev:collab": "next dev --turbopack -p 3002",
  "kill-port": "lsof -ti:3000 | xargs kill -9 || true"
}
```

### Updated next.config.ts

```typescript
// ✅ Removed webpack config (not needed with Turbopack)
// ✅ Added experimental.turbo for Turbopack-specific config
// ✅ Clear comments explaining the changes
```

---

## 📊 Example Workflow

### 1. Planning Phase

```
User creates card: "AI-Powered Content Analysis"
├── Priority: High
├── Assigned: Claude, Augment
├── Estimate: 3 days
└── Status: Backlog
```

### 2. Request Reviews

```
User clicks "Request Review"
├── Claude reviews: Architecture approach
├── Augment reviews: Implementation strategy
├── ChatGPT reviews: Documentation needs
└── Codex reviews: Integration points
```

### 3. Move to Planning

```
User drags card to "Planning" column
├── AIs discuss approach in collaboration panel
├── Technical decisions are made
└── Implementation plan is created
```

### 4. Development

```
User drags card to "In Progress"
├── Augment generates boilerplate code
├── Claude implements core logic
├── Codex provides real-time feedback
└── ChatGPT updates documentation
```

### 5. Review & Done

```
User drags card to "Review"
├── AIs review the implementation
├── Tests are run
├── Feedback is incorporated
└── Card moves to "Done"
```

---

## 🎨 Visual Design

### Color Scheme

- **Backlog**: Gray (`bg-gray-100`)
- **Planning**: Blue (`bg-blue-100`)
- **In Progress**: Yellow (`bg-yellow-100`)
- **Review**: Purple (`bg-purple-100`)
- **Done**: Green (`bg-green-100`)

### Priority Indicators

- **High**: Red border + red badge
- **Medium**: Yellow border + yellow badge
- **Low**: Blue border + blue badge

### AI Colors

- **Claude**: Purple (`bg-purple-500`)
- **ChatGPT**: Green (`bg-green-500`)
- **Codex**: Blue (`bg-blue-500`)
- **Augment**: Orange (`bg-orange-500`)

---

## 🔌 Integration with AI Collaboration

The Roadmap System integrates with the AI Collaboration Panel:

1. **Request Review** → Posts to collaboration API
2. **AIs Notified** → See request in collaboration panel
3. **AIs Respond** → Reviews appear on card
4. **Discussion** → Visible in collaboration panel

### API Integration (Coming Soon)

```typescript
// Request AI review
await fetch('http://localhost:3002/api/ai-collaboration', {
  method: 'POST',
  body: JSON.stringify({
    action: 'request-review',
    cardId: 'feature-123',
    assignedAIs: ['claude', 'augment']
  })
});

// Get reviews
const reviews = await fetch(
  'http://localhost:3002/api/ai-collaboration/reviews?cardId=feature-123'
);
```

---

## 📝 Data Structure

### FeatureCard Interface

```typescript
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'backlog' | 'planning' | 'in-progress' | 'review' | 'done';
  assignedAIs: ('claude' | 'chatgpt' | 'codex' | 'augment')[];
  estimatedDays: number;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  aiReviews?: AIReview[];
}
```

### AIReview Interface

```typescript
interface AIReview {
  ai: 'claude' | 'chatgpt' | 'codex' | 'augment';
  timestamp: Date;
  approach: string;
  concerns: string[];
  suggestions: string[];
  estimatedEffort: string;
  approved: boolean;
}
```

---

## 🚀 Future Enhancements

### Phase 2
- [ ] Edit existing cards
- [ ] Delete cards
- [ ] Persist to database/localStorage
- [ ] Export/import roadmap
- [ ] Card templates

### Phase 3
- [ ] Real-time AI review integration
- [ ] Automatic AI assignment based on tags
- [ ] Dependency visualization
- [ ] Timeline view
- [ ] Sprint planning

### Phase 4
- [ ] Multi-user collaboration
- [ ] Version history
- [ ] Comments/discussions per card
- [ ] File attachments
- [ ] Integration with GitHub issues

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill the process
npm run kill-port

# Or find and kill manually
lsof -ti:3000
kill -9 <PID>
```

### Turbopack Warning

If you see webpack warnings:
- ✅ Already fixed in `next.config.ts`
- Make sure you're using the latest code

### Cards Not Dragging

- Make sure you're clicking and holding on the card
- Check browser console for errors
- Try refreshing the page

---

## 📄 Files Created

```
src/
├── components/
│   └── roadmap/
│       ├── RoadmapBoard.tsx          # Main board component
│       └── NewFeatureCardForm.tsx    # Create card form
├── app/
│   └── roadmap/
│       └── page.tsx                  # Roadmap page
next.config.ts                        # Fixed Turbopack config
package.json                          # Updated scripts
ROADMAP_SYSTEM.md                     # This file
```

---

**Built with ❤️ by Augment Code** 🎯

Ready to plan features collaboratively with your AI team!

