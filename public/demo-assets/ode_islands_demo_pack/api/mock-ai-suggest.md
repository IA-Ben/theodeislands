# Optional AI Suggest API Hook

If present, the feed calls this to reorder candidate cards. Otherwise it uses heuristics.

**Request**
POST /ai/suggest
Content-Type: application/json

```
{
  "phase": "pre" | "show" | "post",
  "candidates": [{
    "id": "ch-1",
    "type": "chapter" | "subchapter" | "game" | "venue" | "merch" | "after",
    "score": 0.0,
    "tags": ["Act I","RareGap"],
    "explain_hint": "Completing this begins your escape arc."
  }],
  "signals": {
    "ownedMemories": ["mem-..."],
    "recentGrades": {"gm-rhythm-01":"A"},
    "branchCoverage": {"Act I": 0.4, "Act II": 0.1}
  }
}
```

**Response**
```
{
  "order": ["ch-1","gm-rhythm-01","venue-card-01"],
  "explanations": {
    "ch-1":"Because you unlocked Heart House Window.",
    "gm-rhythm-01":"Based on your A grade in Fire’s Lullaby."
  }
}
```
