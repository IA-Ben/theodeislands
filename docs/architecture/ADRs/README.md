# Architecture Decision Records (ADRs)

**Maintained by:** Augment Code 🎯

---

## What are ADRs?

Architecture Decision Records document important architectural decisions made during the project. They provide context for why decisions were made and help future developers understand the reasoning.

---

## ADR Index

### Active Decisions

- [ADR-001: React Context for State Management](./ADR-001-react-context-state-management.md)
- [ADR-002: Portal Pattern for Overlays](./ADR-002-portal-pattern-overlays.md)
- [ADR-003: Event-Driven AI Collaboration](./ADR-003-event-driven-ai-collaboration.md)
- [ADR-004: Feature Flags with Tree-Shaking](./ADR-004-feature-flags-tree-shaking.md)
- [ADR-005: Multi-Provider Video Generation](./ADR-005-multi-provider-video-generation.md)

### Superseded Decisions

_(None yet)_

---

## ADR Template

When creating a new ADR, use this template:

```markdown
# ADR-XXX: [Title]

**Status:** [Proposed | Accepted | Deprecated | Superseded]  
**Date:** YYYY-MM-DD  
**Deciders:** [List of people/AIs involved]  
**Tags:** [relevant, tags, here]

---

## Context

What is the issue we're facing? What factors are driving this decision?

## Decision

What is the change we're proposing or have agreed to?

## Rationale

Why did we choose this approach? What makes it the best option?

## Consequences

### Positive
- What benefits does this bring?
- What problems does it solve?

### Negative
- What drawbacks or limitations exist?
- What technical debt might this create?

### Neutral
- What changes are required?
- What stays the same?

## Alternatives Considered

What other options did we evaluate?

### Option 1: [Name]
- **Pros:** ...
- **Cons:** ...
- **Why rejected:** ...

### Option 2: [Name]
- **Pros:** ...
- **Cons:** ...
- **Why rejected:** ...

## Implementation

How will this be implemented?

- Files affected
- Code patterns
- Migration steps (if applicable)

## Validation

How will we know this decision was correct?

- Success metrics
- Performance targets
- User feedback

## References

- Links to related discussions
- External documentation
- Similar patterns in other projects

---

**Recorded by:** [Name]  
**Last Updated:** YYYY-MM-DD
```

---

## How to Create an ADR

### 1. Identify the Decision

When you encounter an architectural decision that:
- Affects multiple components
- Has long-term implications
- Involves trade-offs
- Needs to be communicated to the team

→ Create an ADR!

### 2. Number the ADR

Use the next sequential number (ADR-XXX)

### 3. Write the ADR

Use the template above and fill in all sections

### 4. Review with Team

Share with relevant AIs and stakeholders:
- 🏗️ Claude - Architecture review
- 📚 ChatGPT - Documentation review
- 💻 Codex - Implementation review
- 🎯 Augment - Coordination

### 5. Update Status

- **Proposed** - Under discussion
- **Accepted** - Decision made and implemented
- **Deprecated** - No longer recommended
- **Superseded** - Replaced by newer ADR

### 6. Link from Code

Reference ADRs in code comments:
```typescript
// Using React Context for state management (see ADR-001)
export const DemoContext = createContext<DemoContextType | undefined>(undefined);
```

---

## ADR Lifecycle

```
Proposed → Discussion → Accepted → Implemented
                ↓
            Deprecated (if needed)
                ↓
            Superseded (by new ADR)
```

---

## Benefits of ADRs

✅ **Context Preservation** - Future developers understand why decisions were made  
✅ **Knowledge Sharing** - Team alignment on architectural choices  
✅ **Decision Tracking** - History of what was considered and why  
✅ **Onboarding** - New team members can quickly understand architecture  
✅ **Avoiding Rework** - Don't revisit already-decided questions  

---

## When to Create an ADR

### ✅ Do create ADRs for:

- Technology choices (frameworks, libraries)
- Architectural patterns (state management, routing)
- Data structures (schemas, APIs)
- Integration approaches (third-party services)
- Performance strategies (caching, optimization)
- Security decisions (authentication, authorization)

### ❌ Don't create ADRs for:

- Minor implementation details
- Temporary workarounds
- Obvious choices with no alternatives
- Decisions that can be easily changed

---

## Maintaining ADRs

### Augment's Responsibilities:

1. **Create ADRs** for major architectural decisions
2. **Update status** as decisions evolve
3. **Link ADRs** to related code and documentation
4. **Review ADRs** periodically for relevance
5. **Deprecate ADRs** when superseded

### Team Responsibilities:

1. **Propose ADRs** when facing architectural decisions
2. **Review ADRs** before implementation
3. **Reference ADRs** in code and discussions
4. **Update ADRs** if context changes

---

## Quick Reference

### Creating an ADR

```bash
# 1. Copy template
cp docs/architecture/ADRs/TEMPLATE.md docs/architecture/ADRs/ADR-XXX-title.md

# 2. Fill in details
# Edit the file with decision details

# 3. Commit
git add docs/architecture/ADRs/ADR-XXX-title.md
git commit -m "docs: Add ADR-XXX for [decision]"
```

### Updating an ADR

```bash
# 1. Edit the file
# Update status, add consequences, etc.

# 2. Update "Last Updated" date

# 3. Commit
git commit -m "docs: Update ADR-XXX status to Accepted"
```

---

**Maintained by Augment Code 🎯**  
*Documenting decisions for future clarity!*

