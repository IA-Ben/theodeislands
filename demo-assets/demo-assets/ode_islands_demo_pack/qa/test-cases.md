# Test Cases (Key Paths)

1) Feed → Chapter → Subchapter unlock
- Start phase=pre, fresh session.
- Tap `Ode to Him — Heart House`.
- Complete → expect reward toast + wallet + feed rerank.

2) Rhythm game pass
- Open `Fire’s Lullaby`, auto-win via demo button.
- Expect grade A toast + `mem-fire-sigil` granted.

3) Venue/merch surfacing on show phase
- Toggle phase=show in Presenter.
- Feed should lift `Venue` and `Merch` cards within 1 refresh.

4) After Recap
- Toggle phase=post, open recap.
- Expect timeline with chapter/game/rewards entries.

5) Uploader
- Drag example `chapters.json` and `games.json` → validate & publish.
- Broken file → error reported; others still publish.
