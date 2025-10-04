# 🚀 Vercel Preview Deployment Guide

## Deployment Commands Ready to Execute

### 1. **Create Feature Branch**
```bash
git checkout -b demo/presenter-mode
```

### 2. **Clean Lint Issues (Optional - for cleaner deployment)**
```bash
# Skip for now since we have working demo - can fix lint warnings later
# The critical functionality is working despite lint warnings
```

### 3. **Stage Phase 1 Changes**
```bash
git add \
  src/components/demo/ \
  src/contexts/DemoContext.tsx \
  src/contexts/__mocks__/ \
  src/lib/demo-data-loader.ts \
  src/lib/demo-debug-utils.ts \
  src/lib/feature-flags.ts \
  src/lib/__mocks__/ \
  src/__tests__/ \
  src/app/layout.tsx \
  public/demo-assets/ \
  DEMO_VERIFICATION_GUIDE.md \
  SHIFT_D_REHEARSAL_BASELINE.md
```

### 4. **Commit Phase 1**
```bash
git commit -m "feat: Add Presenter Demo Mode for Southbank

🎭 Phase 1 Complete - Foundation & QA Ready

✅ Portal-based presenter mode overlay (Shift+D toggle)
✅ 5-minute Southbank script automation
✅ Production guards with tree-shaking verification
✅ DEBUG-level tracing and flow analysis
✅ Comprehensive test mocks for CI coverage
✅ Demo data loader with fallback support
✅ Event bus with safety guards (debounce, kill switch)

Technical Implementation:
- Non-invasive React portal overlay
- Feature flag system with environment controls
- Mock implementations for unit testing
- Performance monitoring and trace analysis
- Read-only event bus for story view integration

Ready for Southbank rehearsal 🚀

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@anthropic.com>"
```

### 5. **Push Feature Branch**
```bash
git push -u origin demo/presenter-mode
```

### 6. **Vercel Environment Variables**

Set these in Vercel dashboard for the preview branch:

```bash
# Enable demo for preview environment
NEXT_PUBLIC_DEMO_ENABLED=true

# Keep kill switch disabled for testing
NEXT_PUBLIC_DEMO_KILL_SWITCH=false

# Set environment mode
NODE_ENV=production
```

## Vercel Preview Configuration

### **Branch Settings**
- **Branch:** `demo/presenter-mode`
- **Auto-deploy:** Enabled
- **Environment:** Preview
- **Domain:** Will be auto-generated (theodeislands-git-demo-presenter-mode-[user].vercel.app)

### **Environment Variables for Preview Only**
```
NEXT_PUBLIC_DEMO_ENABLED=true
NEXT_PUBLIC_DEMO_KILL_SWITCH=false
```

### **Main Branch Protection**
```
# Main branch keeps demo disabled
NEXT_PUBLIC_DEMO_ENABLED=false
NEXT_PUBLIC_DEMO_KILL_SWITCH=false
```

## Post-Deployment Verification

### **1. Smoke Test Preview URL**
- Visit preview URL
- Press Shift+D - should activate presenter mode
- Press Space - should start 5-minute script
- Check browser console for DEBUG traces

### **2. Rehearsal Handoff**
- Share preview URL with Southbank team
- Provide `DEMO_VERIFICATION_GUIDE.md`
- Include `SHIFT_D_REHEARSAL_BASELINE.md` for expectations

### **3. Performance Baseline**
```javascript
// In browser console on preview URL:
window.__demoFlowAnalyzer.analyzeFlow()
window.__demoDebug.getTotalDuration()
window.__demoDebug.exportTraces()
```

## Success Criteria

### **✅ PASS Requirements**
- [ ] Preview deploys successfully
- [ ] Shift+D activates presenter mode
- [ ] 5-minute script executes all 14 steps
- [ ] DEBUG traces appear in console
- [ ] Flow analysis tools available
- [ ] No critical JavaScript errors
- [ ] Tree-shaking working (main branch has demo disabled)

### **🎯 Ready for Southbank Rehearsal**
Once preview passes smoke test:
- Share preview URL
- Schedule rehearsal session
- Collect feedback and performance data
- Iterate based on rehearsal results

## Rollback Plan

If issues found:
```bash
# Quick disable via kill switch
# Update Vercel environment variable:
NEXT_PUBLIC_DEMO_KILL_SWITCH=true

# Or remove branch entirely
git push origin --delete demo/presenter-mode
```

## Next Steps After Successful Preview

1. **Southbank rehearsal feedback**
2. **Performance optimization based on real usage**
3. **Phase 2: Enhanced demo data integration**
4. **Phase 3: Advanced script automation**
5. **Phase 4: Production polish**

---

**Ready to execute deployment! 🚀**