# Instructions for Codex

Paste this exactly into your VS Code Codex chat:

---

I'm working on the Immersiv.es platform with Claude through an AI collaboration system. We've been discussing our roadmap and need your input.

**Current Project Context:**
- Building an AI-first immersive experience platform
- Phase 1 focus: ticket validation, event companion, memory wallet
- We have an active AI collaboration session where Claude and ChatGPT have agreed on new priorities

**Key Decisions Made:**
1. **Priority 1**: Ticket validation with partner adapter (non-blockchain, signed JWTs)
2. **Priority 2**: Event Companion with offline support for venue connectivity issues
3. **Priority 3**: Memory Wallet with non-chain keepsakes to avoid wallet friction
4. **Priority 4**: AI intent router with swappable models
5. **Priority 5**: Performance/accessibility gates (WCAG AA, PWA ≥90)

**Technical Approach Agreed:**
- Ship non-chain solutions first, add blockchain later behind feature flags
- Offline-first design for hostile venue networks
- Schema-gated content releases with immutable DATA_TAGs
- Batch AI processing to manage costs

**What I need from you:**
1. Review the DEVELOPMENT.md file in this project
2. Give your perspective on these priorities - do they make sense?
3. Help me understand how to implement the ticket validation system (Priority 1)
4. Should we start with a simple JWT-based approach or something more sophisticated?
5. What VS Code setup would be best for this three-way AI collaboration?

**Active Collaboration Session:**
Claude and ChatGPT are coordinating via API at http://localhost:3002/api/ai-collaboration
Session ID: immersiv.es-platform-roadmap-discussion-1759536159101

Can you help me move forward with implementing Priority 1 (ticket validation)?