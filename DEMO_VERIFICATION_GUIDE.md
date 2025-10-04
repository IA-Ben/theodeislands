# 🎭 Demo Verification Guide

## Pre-Flight Checklist

### Environment Setup
- ✅ Server running on `localhost:3002`
- ✅ Development mode active (look for 🚀 indicator)
- ✅ Browser console open for trace capture

## Shift+D Flow Verification

### 1. **Activation Test**
```
Action: Press Shift+D
Expected:
  - Presenter Mode overlay appears in top-right
  - Console log: "🎭 Presenter Mode ACTIVATED"
  - Bottom-right shows "Press Shift+D for Demo Mode" when inactive
```

### 2. **UI Elements Check**
```
Verify Overlay Contains:
  ✅ 🎭 Presenter Mode header with ✕ Close button
  ✅ Current Phase indicator (pre/show/post buttons)
  ✅ ▶ Play Southbank 5‑minute button
  ✅ Manual step controls (← Prev / Next →)
  ✅ Shortcuts reference (1-6, Space, ← →)
```

### 3. **5-Minute Script Automation Test**
```
Action: Press Space bar (or click ▶ Play button)
Expected Console Trace Pattern:

🎭 [DEBUG] Flow analysis started for rehearsal
🎭 [DEBUG] Demo Step Executed: {
  step: 1,
  total: 14,
  script: "southbank-5min",
  timestamp: "2025-01-04T...",
  action: "phase:set",
  payload: { phase: "pre" }
}
🎭 [DEBUG] Phase transition: pre → pre
🎭 Demo Step: phase:set { phase: "pre" }

[Continue for all 14 steps...]

Final step should be:
🎭 [DEBUG] Demo Step Executed: {
  step: 14,
  total: 14,
  script: "southbank-5min",
  action: "navigate",
  payload: { to: "afterRecap" }
}
🎭 [DEBUG] Flow analysis complete - check console for results
```

### 4. **Manual Step Control Test**
```
Actions: Use ← → arrow keys
Expected:
  - Right arrow advances to next step
  - Left arrow goes to previous step
  - Step counter updates (e.g., "2/14")
  - Current step display shows action and payload
```

### 5. **Keyboard Shortcuts Test**
```
Test Each Shortcut:
  1 → 🎭 [DEBUG] Navigation: feed
  2 → 🎭 [DEBUG] Navigation: chapter (ch-1)
  3 → 🎭 Demo: Auto-pass game
  4 → 🎭 Demo: Navigate to wallet
  5 → 🎭 [DEBUG] Phase transition: current → show
  6 → 🎭 [DEBUG] Phase transition: current → post
```

### 6. **Flow Analysis Console Commands**
```
Test in Browser Console:

  window.__demoFlowAnalyzer.analyzeFlow()
  // Should return analysis object with:
  // - totalDuration, stepDurations, averageStepDuration
  // - slowestStep, fastestStep
  // - repeatEvents, phaseTransitions

  window.__demoDebug.getTotalDuration()
  // Returns: "X.XXs"

  window.__demoDebug.checkForRepeats()
  // Returns: array of any duplicate events

  window.__demoDebug.exportTraces()
  // Returns: JSON string with full trace data
```

## Success Criteria

### ✅ **PASS Requirements**
- [ ] Shift+D toggles presenter mode overlay
- [ ] Space bar starts/stops 5-minute script automation
- [ ] All 14 script steps execute with DEBUG traces
- [ ] Manual arrow key controls work
- [ ] Keyboard shortcuts 1-6 trigger correct actions
- [ ] Flow analysis tools available in console
- [ ] No JavaScript errors in console
- [ ] Phase transitions log correctly
- [ ] Reward notifications appear

### ❌ **FAIL Conditions**
- JavaScript errors during execution
- Missing DEBUG traces
- Script automation stops mid-flow
- Keyboard shortcuts not working
- Flow analysis tools unavailable

## Expected Performance

### **5-Minute Script Timing**
- Total duration: ~3-5 minutes (3s between steps)
- 14 steps total
- Average step duration: ~200-300ms
- No repeat events should be detected

### **Memory Usage**
- Demo traces stored in `window.__demoStepTrace`
- Should not exceed 1MB for single run
- Traces can be cleared with `window.__demoDebug.clearTraces()`

## Troubleshooting

### Common Issues
```
Issue: Shift+D not working
Fix: Ensure presenter mode is enabled in feature flags

Issue: Script not starting
Fix: Check demo data loaded correctly in console

Issue: Missing DEBUG traces
Fix: Verify development mode is active

Issue: Performance issues
Fix: Clear traces with __demoDebug.clearTraces()
```

## Handoff to Southbank Team

Once verification passes, the system is ready for Southbank rehearsal with:
- Complete 5-minute automated demo flow
- Manual presenter controls for flexibility
- Performance monitoring and trace analysis
- Production-ready safety guards