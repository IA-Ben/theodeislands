# 🤖 AI Collaboration Panel - Troubleshooting Guide

## ✅ Current Status

**Good News:**
- ✅ Collaboration server is running on port 3002
- ✅ Server has 16 messages from Claude, ChatGPT, and Augment
- ✅ AICollaborationPanel component is in layout.tsx
- ✅ Keyboard shortcut (Shift+A) is set up
- ✅ Component code looks correct

**Issue:**
- ❌ Can't see AI communications in the panel

---

## 🔍 Debugging Steps

### Step 1: Check if Button is Visible

The AI Collaboration Panel should show a floating button in the **bottom-right corner**:

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│                                     │
│                          [🤖 AI Collab] ← Look here!
└─────────────────────────────────────┘
```

**What to look for:**
- Purple-to-orange gradient button
- Text: "🤖 AI Collab"
- Green pulsing dot if connected

---

### Step 2: Try Keyboard Shortcut

Press **Shift + A** (capital A)

**Expected behavior:**
- Panel slides in from bottom-right
- Shows "AI Collaboration Panel" header
- Displays 4 AI participants
- Shows message feed

---

### Step 3: Check Browser Console

Open browser console (F12) and look for:

**Good signs:**
```
✅ No errors
✅ Network requests to http://localhost:3002/api/ai-collaboration
```

**Bad signs:**
```
❌ CORS errors
❌ Failed to fetch
❌ Connection refused
```

---

### Step 4: Verify Server is Running

In terminal, run:
```bash
curl http://localhost:3002/api/ai-collaboration
```

**Expected output:**
```json
{
  "success": true,
  "activeSession": {
    "sessionId": "immersiv.es-platform-roadmap-discussion-1759536159101",
    ...
  }
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Button Not Visible

**Possible causes:**
- Z-index conflict with roadmap page
- Button rendered but hidden behind other elements

**Fix:**
Update AICollaborationPanel z-index to be higher:

```typescript
// In AICollaborationPanel.tsx
// Change z-50 to z-[9999]
className="fixed bottom-4 right-4 z-[9999] ..."
```

---

### Issue 2: CORS Error

**Symptoms:**
```
Access to fetch at 'http://localhost:3002' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Fix:**
The collaboration server needs CORS headers. Check if it's configured.

---

### Issue 3: Server Not Running

**Symptoms:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Fix:**
Start the collaboration server:
```bash
# In a separate terminal
npm run dev:collab
```

---

### Issue 4: Keyboard Shortcut Not Working

**Possible causes:**
- Another component is capturing the event
- Focus is on an input field

**Fix:**
Click somewhere on the page (not in an input) and try Shift+A again.

---

### Issue 5: Panel Opens But No Messages

**Symptoms:**
- Panel opens successfully
- Shows "0 messages"
- Connected indicator shows green

**Possible causes:**
- Messages not loading from server
- Session data structure mismatch

**Fix:**
Check browser console for errors in the fetch response.

---

## 🔧 Quick Fixes

### Fix 1: Increase Z-Index

If the button is hidden behind the roadmap:

```bash
# Edit src/components/ai-collab/AICollaborationPanel.tsx
# Find line with z-50 and change to z-[9999]
```

---

### Fix 2: Add Debug Button

Temporarily add a visible button to test:

```typescript
// In src/app/roadmap/page.tsx
// Add at the top of the page:
<button 
  onClick={() => alert('Test button works!')}
  className="fixed top-4 right-4 z-[9999] bg-red-500 text-white px-4 py-2 rounded"
>
  TEST
</button>
```

If this button is visible, the issue is z-index. If not, something else is wrong.

---

### Fix 3: Force Panel to Open

Temporarily set initial state to visible:

```typescript
// In AICollaborationPanel.tsx
// Change:
const [isVisible, setIsVisible] = useState(false);
// To:
const [isVisible, setIsVisible] = useState(true);
```

This will force the panel to open on page load.

---

## 🎯 Recommended Solution

Based on the roadmap page having `fixed inset-0`, I recommend:

### Option 1: Increase Z-Index (Quick Fix)

Change the AI Collaboration Panel z-index from `z-50` to `z-[9999]`:

```typescript
// Button (when closed)
className="fixed bottom-4 right-4 z-[9999] bg-gradient-to-r..."

// Panel (when open)
className="fixed bottom-4 right-4 z-[9999] w-[600px] h-[700px]..."
```

---

### Option 2: Add to Roadmap Page (Better Integration)

Add the AI Collaboration Panel directly to the roadmap page:

```typescript
// In src/app/roadmap/page.tsx
import AICollaborationPanel from '@/components/ai-collab/AICollaborationPanel';

export default function RoadmapPage() {
  return (
    <>
      <RoadmapBoard />
      <AICollaborationPanel />
    </>
  );
}
```

---

### Option 3: Portal to Body (Best Practice)

Use React Portal to render outside the roadmap:

```typescript
// In AICollaborationPanel.tsx
import { createPortal } from 'react-dom';

export default function AICollaborationPanel() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return createPortal(
    // ... existing panel JSX
    document.body
  );
}
```

---

## 🧪 Testing Checklist

After applying a fix, verify:

- [ ] Button visible in bottom-right corner
- [ ] Button has green pulsing dot (connected)
- [ ] Shift+A opens/closes panel
- [ ] Panel shows 4 AI participants
- [ ] Panel shows 16 messages
- [ ] Messages are from Claude, ChatGPT, Augment
- [ ] Timestamps are visible
- [ ] Can scroll through messages
- [ ] No console errors

---

## 📊 Expected Behavior

### When Working Correctly:

1. **On any page:**
   - See floating "🤖 AI Collab" button (bottom-right)
   - Green dot indicates connection

2. **Press Shift+A:**
   - Panel slides in
   - Shows header: "AI Collaboration Panel"
   - Shows "🟢 Connected • 16 messages"

3. **Participants section:**
   - 🏗️ Claude - Architecture & Implementation
   - 📚 ChatGPT - Research & Documentation
   - 💻 VS Code Codex - Real-time Development
   - 🎯 Augment Code - Code Generation & Optimization

4. **Message feed:**
   - Latest message at bottom
   - Auto-scrolls to new messages
   - Color-coded by AI
   - Shows timestamps
   - Shows message types (Implementation, Question, etc.)

---

## 🚀 Next Steps

1. **Try Shift+A** on the roadmap page
2. **Check browser console** for errors
3. **Apply Fix 1** (increase z-index) if button not visible
4. **Test again**
5. **Report back** what you see!

---

## 💡 Pro Tip

If you're on the roadmap page and can't see the button, try:

1. Navigate to home page: `http://localhost:3000`
2. Press Shift+A
3. See if panel appears there

If it works on home but not roadmap, it's definitely a z-index issue!

---

**Need more help?** Let me know what you see (or don't see) and I'll help debug further! 🤖

