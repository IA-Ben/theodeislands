# Asset Uploader (Creator) — Spec

- Drag–drop JSON + media files OR ZIP.
- Validate JSON against schemas in `/schemas`.
- On success: write to your content store and emit `feed:refresh`.
- On error: show inline error list (schema path + message); skip bad files.

## Validations
- `chapters.json`: all `subchapters` must exist in `subchapters.json`.
- Game assets must be present (audio for rhythm, glyphs/targets for others).
- Memories referenced by `reward_id` must exist in `memories.json`.

## UI
- File list with status chips (OK / Warning / Error).
- Buttons: **Preview**, **Publish to Demo**, **Reset Session**.
- Option: auto-generate thumbnails from first video frame (if available).
