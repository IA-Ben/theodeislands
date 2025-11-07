# 🚀 Quick Start Guide

**Get up and running with AI Collaborative Development in 5 minutes!**

---

## ⚡ Fast Setup

### 1. Clean Up Ports (One-Time)

```bash
npm run kill-port
```

This kills any process using port 3000.

### 2. Start Development Server

```bash
npm run dev
```

Server starts on `http://localhost:3000`

### 3. Open the Roadmap

Navigate to:
```
http://localhost:3000/roadmap
```

---

## 🎯 Your First Feature (2 Minutes)

### Step 1: Create a Card (30 seconds)

1. Click **"+ New Feature Card"**
2. Fill in:
   - Title: "My First AI Feature"
   - Description: "Testing the AI collaborative workflow"
   - Priority: High
   - Estimated Days: 1
   - Assign: All 4 AIs (Claude, ChatGPT, Codex, Augment)
   - Tags: test, demo
3. Click **"Create Feature Card"**

### Step 2: Build the Spec (1 minute)

1. Click **"📝 Build Spec"** on your card
2. In the Overview section, type:
   ```
   This is a test feature to learn the AI collaborative workflow.
   ```
3. Click **"🤖 Request AI Help"**
4. Watch as all 4 AIs provide suggestions
5. Click **"✓ Accept & Add"** on any suggestion you like
6. Click **"💾 Save Spec"**

### Step 3: Start the Build (30 seconds)

1. Make sure Build Panel is visible (bottom of screen)
2. **Drag your card** from the board
3. **Drop it** into the Build Panel
4. Watch the AI build process begin! 🎉

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + A` | Toggle AI Collaboration Panel |
| `Shift + D` | Toggle Presenter Mode (if enabled) |

---

## 📊 What You'll See

### Roadmap Board

```
┌─────────────────────────────────────────────────────────┐
│  🗺️ Feature Roadmap                  [+ New Feature]   │
├─────────┬─────────┬─────────┬─────────┬───────────────┤
│ Backlog │Planning │Progress │ Review  │     Done      │
│         │         │         │         │               │
│  [Card] │         │         │         │               │
│         │         │         │         │               │
└─────────┴─────────┴─────────┴─────────┴───────────────┘
```

### Build Panel (Bottom)

```
┌─────────────────────────────────────────────────────────┐
│  🎯 Build Panel                                         │
│  Drag feature cards here to start AI build process     │
├─────────────────────────────────────────────────────────┤
│  Active Builds:                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ My First AI Feature                               │ │
│  │ 💬→🏗️→👀→⚙️→🧪→🔍→🔧→🚀→👤→🌿→▲                  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### AI Collaboration Panel (Shift+A)

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI Collaboration                              [✕]   │
├─────────────────────────────────────────────────────────┤
│  🏗️ Claude: Analyzing architecture...                  │
│  📚 ChatGPT: Researching best practices...             │
│  💻 Codex: Checking integration points...              │
│  🎯 Augment: Generating code structure...              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Understanding the Workflow

### The 3 Main Panels

1. **Roadmap Board** (Top)
   - Plan features
   - Organize work
   - Track status

2. **Build Panel** (Bottom)
   - Drop cards to build
   - Monitor progress
   - View AI activity

3. **AI Collaboration Panel** (Shift+A)
   - See AI discussions
   - Monitor decisions
   - Track progress

### The Build Pipeline

```
Card Created
    ↓
Spec Built (with AI help)
    ↓
Dragged to Build Panel
    ↓
AI Discussion → Architecture → Review
    ↓
Build → Test → Code Review → Fix
    ↓
Local Deploy → Human Testing
    ↓
Feature Branch → Vercel Deploy
    ↓
Done! 🎉
```

---

## 💡 Pro Tips

### 1. Start Small

Your first feature should be simple:
- Single component
- Clear requirements
- 1-2 day estimate

### 2. Use All 4 AIs

Each AI has strengths:
- 🏗️ **Claude** - Complex logic & architecture
- 📚 **ChatGPT** - Research & documentation
- 💻 **Codex** - Integration & real-time dev
- 🎯 **Augment** - Code generation & optimization

### 3. Build Good Specs

The better your spec, the better the AI output:
- Be specific
- Include examples
- Define edge cases
- Request AI help for each section

### 4. Monitor the Build

Watch the Build Panel:
- See which phase is active
- Check AI activity
- Catch errors early

### 5. Test Thoroughly

Don't skip human testing:
- Click through everything
- Try to break it
- Check mobile
- Verify accessibility

---

## 🐛 Common Issues

### Port Already in Use

```bash
npm run kill-port
npm run dev
```

### Build Panel Not Showing

Click the **"⬆️ Show Build Panel"** button (bottom right)

### Card Won't Drag

Make sure you're clicking and holding on the card itself, not a button

### AIs Not Responding

Check that the collaboration server is running:
```bash
# In another terminal
npm run dev:collab
```

---

## 📚 Learn More

- **Full Workflow**: [AI_COLLABORATIVE_WORKFLOW.md](./AI_COLLABORATIVE_WORKFLOW.md)
- **Roadmap System**: [ROADMAP_SYSTEM.md](./ROADMAP_SYSTEM.md)
- **AI Collaboration**: [src/components/ai-collab/README.md](./src/components/ai-collab/README.md)

---

## 🎯 Next Steps

Once you're comfortable with the basics:

1. **Create a Real Feature**
   - Something you actually need
   - Use the full spec builder
   - Let AIs collaborate

2. **Experiment with AI Assignment**
   - Try different AI combinations
   - See which works best for different tasks

3. **Customize the Workflow**
   - Add your own build phases
   - Integrate with your tools
   - Extend the system

4. **Share Your Results**
   - Deploy to Vercel
   - Get team feedback
   - Iterate and improve

---

## 🆘 Need Help?

### Check the Logs

1. Open browser console (F12)
2. Look for errors
3. Check network tab

### View AI Discussions

1. Press `Shift+A`
2. Read the AI conversation
3. See what they're working on

### Review the Spec

1. Click "📝 Build Spec" on any card
2. See what the AIs understood
3. Clarify if needed

---

## ✅ Success Checklist

After your first feature, you should have:

- [ ] Created a feature card
- [ ] Built a spec with AI help
- [ ] Dragged card to Build Panel
- [ ] Watched the build process
- [ ] Seen AI collaboration in action
- [ ] Tested the feature locally
- [ ] Created a feature branch
- [ ] Deployed to Vercel preview

**Congratulations! You're now using AI collaborative development!** 🎉

---

**Built with ❤️ by Augment Code** 🎯

*Making AI collaboration accessible to every developer*

