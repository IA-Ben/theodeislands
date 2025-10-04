# 🎭 Shift+D Rehearsal Baseline Recording

**Date:** 2025-01-04
**Environment:** localhost:3002 Development
**Demo Flag:** Enabled
**Test Type:** Baseline Console Trace Capture

## Pre-Recording Checklist
- [x] Server running on localhost:3002
- [x] Browser console open (Chrome DevTools recommended)
- [x] Demo flag enabled in feature-flags.json
- [x] Clear console before starting (`console.clear()`)

## Expected Flow Sequence

### 1. **Activation (Shift+D)**
```
Expected Console Output:
🎭 Presenter Mode ACTIVATED
🎭 Demo data loaded successfully {chapters: [...], memories: [...], scripts: [...]}
🎭 Loaded Southbank script: {id: "southbank-5min", name: "Southbank 5‑minute", steps: [14 items]}
```

### 2. **Script Start (Space Bar)**
```
Expected Console Output:
🎭 [DEBUG] Flow analysis started for rehearsal
🎭 [DEBUG] Demo Step Executed: {
  step: 1,
  total: 14,
  script: "southbank-5min",
  timestamp: "2025-01-04T...",
  action: "phase:set",
  payload: {phase: "pre"},
  perfNow: 12345.6
}
🎭 [DEBUG] Phase transition: pre → pre
🎭 Demo Step: phase:set {phase: "pre"}
```

### 3. **Full 14-Step Automation**
```
Step Sequence Expected:
1. phase:set {phase: "pre"}
2. navigate {to: "feed"}
3. navigate {to: "chapter", id: "ch-1"}
4. complete {type: "chapter", id: "ch-1"}
5. reward:grant {memoryId: "mem-heart-window"}
6. navigate {to: "game", id: "gm-rhythm-01"}
7. game:result {gameId: "gm-rhythm-01", grade: "A", passed: true}
8. reward:grant {memoryId: "mem-fire-sigil"}
9. navigate {to: "wallet"}
10. phase:set {phase: "show"}
11. navigate {to: "venue"}
12. navigate {to: "merch"}
13. phase:set {phase: "post"}
14. navigate {to: "afterRecap"}
```

### 4. **Flow Analysis Complete**
```
Expected Console Output:
🎭 [DEBUG] Flow analysis complete - check console for results
📊 Total Duration: X.XXs
⏱️  Average Step Duration: XXX.XXms
🐌 Slowest Step: #X - action_name
⚡ Fastest Step: #X - action_name
🔄 Phase Transitions: [{from: "pre", to: "show", stepNumber: 10}, ...]
```

## Timing Expectations

### **Performance Baseline**
- **Total Duration:** 42-45 seconds (14 steps × 3s interval)
- **Step Duration:** 3000ms between auto-advance steps
- **Manual Steps:** <100ms response time
- **Phase Transitions:** 3 total (pre→show→post)

### **Memory Usage**
- **Trace Storage:** ~2-5KB for single run
- **Window Objects:** `__demoStepTrace`, `__demoFlowAnalyzer`, `__demoDebug`

## Manual Verification Commands

### **During Recording - Browser Console**
```javascript
// Check if demo system is loaded
window.__demoFlowAnalyzer ? "✅ Analyzer ready" : "❌ Missing analyzer"

// Monitor trace collection
window.__demoStepTrace?.length || 0

// Get live analysis
window.__demoDebug.getTotalDuration()
```

### **Post-Recording - Analysis**
```javascript
// Full analysis
window.__demoFlowAnalyzer.analyzeFlow()

// Export for baseline comparison
window.__demoDebug.exportTraces()

// Check for performance issues
window.__demoDebug.checkForRepeats()
```

## Success Criteria

### **✅ PASS Requirements**
- [ ] All 14 steps execute in correct order
- [ ] DEBUG traces include step context (step number, timestamp, action, payload)
- [ ] Performance timing captured (`perfNow` values)
- [ ] Flow analysis generates complete report
- [ ] No JavaScript errors in console
- [ ] Phase transitions log correctly (3 transitions)
- [ ] Reward notifications appear for memory grants
- [ ] Manual controls (arrow keys) work during automation

### **🎯 Performance Targets**
- [ ] Total duration: 40-50 seconds
- [ ] Average step duration: ~3000ms
- [ ] No repeat events detected
- [ ] Memory usage stays reasonable (<5MB)

### **❌ FAIL Conditions**
- JavaScript errors during execution
- Steps execute out of order
- Missing DEBUG traces
- Flow analysis unavailable
- Performance significantly outside targets

## Recorded Results (FILL IN DURING TEST)

### **Actual Console Output:**
```
[PASTE ACTUAL CONSOLE LOGS HERE]
```

### **Flow Analysis Results:**
```
[PASTE window.__demoFlowAnalyzer.analyzeFlow() OUTPUT HERE]
```

### **Performance Metrics:**
- **Actual Total Duration:** _____ seconds
- **Actual Average Step:** _____ ms
- **Slowest Step:** #___ - _____
- **Fastest Step:** #___ - _____
- **Repeat Events:** _____

### **Issues Found:**
- [ ] None
- [ ] Performance slower than expected
- [ ] Missing traces
- [ ] JavaScript errors
- [ ] Other: _____

## Baseline for Southbank Team

This recording establishes the performance baseline for:
- Rehearsal timing expectations
- Console debugging workflow
- Performance monitoring
- Issue detection during live demos

**Status:** Ready for Southbank team rehearsal once baseline recorded.