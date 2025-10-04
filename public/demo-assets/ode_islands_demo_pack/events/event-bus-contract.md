# Event Bus Contract (delta-only)

Publish these events from existing views; subscribe in feed, wallet, recap, and demo overlay.

## Events (topics)

- `progress:chapterCompleted` — payload: `{ chapterId }`
- `progress:subchapterCompleted` — payload: `{ subchapterId }`
- `game:result` — payload: `{ gameId, grade: "S"|"A"|"B"|"C", passed: boolean }`
- `reward:grant` — payload: `{ memoryId }`
- `reward:revoke` — payload: `{ memoryId }` (demo only)
- `wallet:reset` — payload: `{}` (demo only)
- `feed:refresh` — payload: `{ reason }`
- `phase:set` — payload: `{ phase: "pre"|"show"|"post" }`
- `demo:runScript` — payload: `{ scriptId }`
- `demo:toggleLatency` — payload: `{ ms }`

## Subscription hints
- **Feed** listens to `progress:*`, `game:result`, `reward:*`, `phase:set`, `demo:*` to rerank.
- **Wallet** listens to `reward:*`, `wallet:reset`.
- **Recap** listens to `progress:*`, `game:result`, `reward:*` to build session timeline.
