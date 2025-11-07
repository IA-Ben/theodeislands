# ADR-001: React Context for State Management

**Status:** Accepted  
**Date:** 2025-10-04  
**Deciders:** Claude, Codex, Augment  
**Tags:** state-management, react, architecture

---

## Context

The Ode Islands application needs to share state across multiple components without prop drilling. Key state includes:

- Demo mode configuration and current step
- Theme preferences
- Feature flags
- User session (future)
- Event data (future)

We need a state management solution that:
- Works well with Next.js App Router
- Supports Server and Client Components
- Is simple to understand and maintain
- Doesn't add significant bundle size
- Allows for future scalability

---

## Decision

Use **React Context API** with custom providers for global state management.

**Implementation Pattern:**
```typescript
// 1. Create context with type safety
interface DemoContextType {
  isActive: boolean;
  currentStep: string;
  toggleDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// 2. Create provider component
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  
  const value = {
    ...state,
    // methods
  };
  
  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

// 3. Create custom hook
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return context;
}

// 4. Wrap app in layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DemoProvider>
          {children}
        </DemoProvider>
      </body>
    </html>
  );
}
```

---

## Rationale

### Why React Context?

1. **Built-in Solution** - No additional dependencies
2. **Next.js Compatible** - Works seamlessly with App Router
3. **Type Safe** - Full TypeScript support
4. **Simple API** - Easy to understand and use
5. **Zero Bundle Cost** - Already part of React
6. **Proven Pattern** - Used successfully in DemoContext

### Why Not Alternatives?

**Redux:**
- Too heavy for current needs
- Adds ~10KB to bundle
- Steeper learning curve
- Overkill for simple state

**Zustand:**
- New dependency to maintain
- Team unfamiliar with API
- Not significantly better for our use case

**Jotai/Recoil:**
- Atomic state might be overkill
- Additional learning curve
- Not needed for current complexity

**Props:**
- Prop drilling becomes unmaintainable
- Hard to refactor
- Couples components unnecessarily

---

## Consequences

### Positive

✅ **No Dependencies** - Uses built-in React features  
✅ **Type Safety** - Full TypeScript support with custom hooks  
✅ **Simple API** - Easy for team to understand  
✅ **Flexible** - Can add more contexts as needed  
✅ **Testable** - Easy to mock in tests  
✅ **Server Compatible** - Works with Server Components  

### Negative

⚠️ **Re-render Performance** - All consumers re-render on any state change  
⚠️ **No Built-in DevTools** - Unlike Redux DevTools  
⚠️ **Manual Optimization** - Need to use useMemo/useCallback carefully  
⚠️ **Context Hell** - Too many providers can clutter layout  

### Neutral

🔄 **Migration Path** - Can migrate to Zustand/Redux later if needed  
🔄 **Learning Curve** - Team needs to understand Context patterns  
🔄 **Code Organization** - Need consistent patterns across contexts  

---

## Alternatives Considered

### Option 1: Redux Toolkit

**Pros:**
- Powerful DevTools
- Time-travel debugging
- Middleware support
- Well-documented patterns

**Cons:**
- ~10KB bundle size
- More boilerplate
- Steeper learning curve
- Overkill for current needs

**Why rejected:** Too heavy for our current state management needs. We don't need middleware, time-travel debugging, or complex state logic yet.

---

### Option 2: Zustand

**Pros:**
- Lightweight (~1KB)
- Simple API
- No providers needed
- Good TypeScript support

**Cons:**
- New dependency
- Team unfamiliar
- Not significantly better than Context
- Another pattern to learn

**Why rejected:** While Zustand is excellent, React Context is sufficient for our needs and requires no new dependencies or learning.

---

### Option 3: Prop Drilling

**Pros:**
- No abstraction
- Explicit data flow
- Easy to trace

**Cons:**
- Unmaintainable at scale
- Couples components
- Hard to refactor
- Verbose

**Why rejected:** Already experiencing prop drilling pain in demo mode. Context solves this cleanly.

---

## Implementation

### Files Affected

**Created:**
- `src/contexts/DemoContext.tsx` - Demo mode state
- `src/contexts/ThemeContext.tsx` - Theme preferences (future)

**Modified:**
- `src/app/layout.tsx` - Wrap with providers
- `src/components/demo/PresenterMode.tsx` - Use context
- `src/components/demo/PresenterModePortal.tsx` - Use context

### Code Pattern

**Context Structure:**
```typescript
contexts/
├── DemoContext.tsx
│   ├── DemoState interface
│   ├── DemoContext creation
│   ├── DemoProvider component
│   └── useDemo hook
└── ThemeContext.tsx (future)
```

**Usage Pattern:**
```typescript
// In any component
import { useDemo } from '@/contexts/DemoContext';

function MyComponent() {
  const { isActive, currentStep, toggleDemo } = useDemo();
  
  return (
    <div>
      {isActive && <p>Step: {currentStep}</p>}
      <button onClick={toggleDemo}>Toggle</button>
    </div>
  );
}
```

### Migration Steps

1. ✅ Create DemoContext (completed)
2. ✅ Wrap app in DemoProvider (completed)
3. ✅ Update components to use useDemo (completed)
4. 🔄 Create additional contexts as needed
5. 🔄 Optimize with useMemo/useCallback if performance issues

---

## Validation

### Success Metrics

✅ **No Prop Drilling** - State accessible without passing props  
✅ **Type Safety** - No TypeScript errors  
✅ **Performance** - No noticeable re-render issues  
✅ **Developer Experience** - Easy to add new state  

### Performance Targets

- **Re-render Time:** < 16ms (60fps)
- **Context Updates:** < 5ms
- **Bundle Impact:** 0KB (built-in)

### Monitoring

- Watch for excessive re-renders (React DevTools)
- Monitor bundle size (no increase expected)
- Track developer feedback on API usability

---

## Future Considerations

### When to Migrate

Consider migrating to Zustand or Redux if:
- State becomes very complex (>10 contexts)
- Need middleware (logging, persistence)
- Performance issues from re-renders
- Need DevTools for debugging
- Team requests more powerful solution

### Optimization Strategies

If performance issues arise:

1. **Split Contexts** - Separate frequently-changing state
2. **Use useMemo** - Memoize context values
3. **Use useCallback** - Memoize context methods
4. **Selector Pattern** - Only subscribe to needed state
5. **Consider Zustand** - If optimization isn't enough

### Example Optimization

```typescript
// Before (re-renders on any state change)
const value = { state, setState };

// After (only re-renders when state changes)
const value = useMemo(
  () => ({ state, setState }),
  [state]
);
```

---

## References

- [React Context Documentation](https://react.dev/reference/react/useContext)
- [Next.js Context Guide](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#using-context-providers)
- [When to Use Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Context Performance](https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions)

### Related ADRs

- ADR-002: Portal Pattern for Overlays (uses DemoContext)
- ADR-004: Feature Flags with Tree-Shaking (could use Context)

### Code Examples

- `src/contexts/DemoContext.tsx` - Reference implementation
- `src/components/demo/PresenterMode.tsx` - Usage example

---

**Recorded by:** Augment Code 🎯  
**Last Updated:** 2025-10-04

---

## Appendix: Context Best Practices

### Do's ✅

- Create custom hooks (useDemo, useTheme)
- Type context values properly
- Throw error if used outside provider
- Use useMemo for context values
- Split contexts by concern
- Document context purpose

### Don'ts ❌

- Don't put all state in one context
- Don't update context too frequently
- Don't forget to memoize values
- Don't use context for local state
- Don't nest too many providers
- Don't skip TypeScript types

### Example: Good Context

```typescript
// ✅ Good: Focused, typed, memoized
interface UserContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = useCallback(async (credentials: Credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
  }, []);
  
  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

---

**This ADR documents our decision to use React Context for state management and provides guidance for future development.**

