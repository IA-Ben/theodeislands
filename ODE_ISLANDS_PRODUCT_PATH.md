# 🏝️ Ode Islands — Product Path Roadmap

**Status:** ✅ 33 Feature Cards Added  
**Date:** 2025-10-04  
**Built by:** Augment Code 🎯

---

## 🎯 Goal

Deliver a **Southbank-ready demo** showcasing:
- Episodic pre-show chapters
- Micro-games
- Memory Wallet
- Event companion
- Post-show memories/achievements

Then scale to **touring runs and licensing**.

---

## 📊 Feature Breakdown

### **By Phase:**
- 🔧 **P0 - Foundations:** 5 features (2-3 weeks)
- 🚀 **P1 - MVP Demo:** 9 features (4-6 weeks)
- 🎪 **P2 - Live Pilot:** 6 features (single showing)
- 🏗️ **P3 - Platformise:** 8 features (runs)
- 📈 **P4 - License & Scale:** 7 features

### **By User Type:**
- 🎭 **End Users:** 13 features
- 👨‍💼 **Creators/Admins:** 20 features

### **By Event Phase:**
- 📅 **Before Event:** 21 features
- 🎪 **At Event:** 4 features
- 📈 **After Event:** 8 features

### **By Priority:**
- 🔴 **High:** 18 features
- 🟡 **Medium:** 13 features
- 🔵 **Low:** 2 features

---

## 🔧 P0 — Foundations (2-3 weeks) - 5 Features

**Goal:** Build the foundation for the Southbank demo

### **1. Brand Kit + 3D UI Shell** 🔴 High
- Ode Islands brand kit with 3D UI shell
- Three.js integration
- Mobile-first, 3D-lite aesthetic
- **Tags:** `ui`, `3d`, `branding`, `three.js`
- **Estimate:** 5 days

### **2. CMS v1 - Content Types** 🔴 High
- Supabase CMS setup
- Content types: Chapters, Sub-chapters, Stamps, Keepsakes, Quests, Merch
- **Tags:** `cms`, `supabase`, `backend`, `content`
- **Estimate:** 6 days

### **3. Asset Pipeline** 🔴 High
- Upload, optimize, CDN delivery
- Images, videos, 3D assets
- **Tags:** `cdn`, `assets`, `optimization`, `pipeline`
- **Estimate:** 4 days

### **4. Analytics Baseline + GDPR** 🔴 High
- Product analytics pipeline
- GDPR consent & privacy compliance
- **Tags:** `analytics`, `gdpr`, `privacy`, `compliance`
- **Estimate:** 3 days

### **5. Demo Mode Toggle** 🔴 High
- Demo mode with scripted data paths
- For Southbank presentation
- **Tags:** `demo`, `feature-flags`, `testing`
- **Estimate:** 2 days

**Total P0:** 20 days (~4 weeks)

---

## 🚀 P1 — MVP Demo (4-6 weeks) - 9 Features

**Goal:** Southbank-ready demo with core experience

### **Before Event (7 features)**

**6. Experience Rails** 🔴 High
- Before/Event/After navigation
- Within current app structure
- **Dependencies:** P0-1
- **Estimate:** 4 days

**7. Pre-show Chapters** 🔴 High
- 3-5 episodic chapter cards
- Branching micro-games
- **Dependencies:** P0-2, P1-1
- **Estimate:** 8 days

**8. Memory Wallet - Collect & View** 🔴 High
- Collect stamps/keepsakes
- View collection, progress bar
- Simple gamification
- **Dependencies:** P0-2
- **Estimate:** 6 days

**9. AI Suggest Feed + Guide v1** 🔴 High
- AI-powered feed with narrative beats
- In-world Guides (Ode Islands lore)
- FAQs, content over menus
- **Estimate:** 7 days

**10. Ticket Unlock System** 🔴 High
- Manual code unlock
- Partner auth stub
- No accounts for demo (magic link)
- **Estimate:** 4 days

**11. AR Preview Effects** 🟡 Medium
- 1-2 lightweight AR effects
- E.g., stamp capture
- AR as optional garnish
- **Dependencies:** P1-3
- **Estimate:** 5 days

**12. Merch Links + Presenter Script** 🟡 Medium
- Merch integration
- Demo presenter script
- **Estimate:** 2 days

### **At Event (1 feature)**

**13. Event Companion Dashboard** 🔴 High
- Live event companion
- Real-time updates & interactions
- **Dependencies:** P1-1, P1-4
- **Estimate:** 6 days

### **After Event (1 feature)**

**14. Memory Wallet - Share** 🟡 Medium
- Share memories on social media
- **Dependencies:** P1-3
- **Estimate:** 3 days

**Total P1:** 45 days (~9 weeks)

**Out of scope for demo:**
- ❌ Blockchain ticketing/marketplace
- ❌ Indoor navigation
- ❌ Vision Pro

---

## 🎪 P2 — Live Pilot (Single Showing) - 6 Features

**Goal:** Test with real audience, gather KPIs

### **Before Event (1 feature)**

**15. Partner Webhook Auto-unlock** 🔴 High
- Partner webhook integration
- Automatic ticket unlock
- **Dependencies:** P1-5
- **Estimate:** 4 days

### **At Event (2 features)**

**16. Arrival Check-in** 🔴 High
- On-site arrival check-in
- QR code flow
- **Dependencies:** P2-1
- **Estimate:** 3 days

**17. On-site Capture System** 🔴 High
- Capture photos/moments during event
- For post-event Memory Book
- **Dependencies:** P1-3
- **Estimate:** 5 days

### **After Event (3 features)**

**18. Post-event Memory Book** 🔴 High
- Auto-curated Memory Book
- Collected moments, stamps, achievements
- **Dependencies:** P2-3, P1-3
- **Estimate:** 6 days

**19. Achievements System** 🟡 Medium
- Achievements for chapter completion
- On-site actions
- **Dependencies:** P1-2, P1-3
- **Estimate:** 4 days

**20. KPI Dashboard** 🔴 High
- Track activation %
- Items per user, merch CTR
- NPS, stability metrics
- **Dependencies:** P0-4
- **Estimate:** 5 days

**Total P2:** 27 days (~5.5 weeks)

**KPIs to track:**
- ✅ Activation %
- ✅ Items per user
- ✅ Merch CTR
- ✅ NPS
- ✅ Stability

---

## 🏗️ P3 — Platformise for Runs - 8 Features

**Goal:** Scale to multiple events and venues

### **Before Event (6 features)**

**21. Multi-event/Venue Support** 🔴 High
- Multiple events & venues
- Separate configurations
- **Dependencies:** P2-1
- **Estimate:** 7 days

**22. Theming System** 🟡 Medium
- Custom theming per event/venue
- Brand colors, fonts, assets
- **Dependencies:** P0-1, P3-1
- **Estimate:** 5 days

**23. Template Editor** 🔴 High
- Visual editor for scenes/cards
- Chapter templates
- **Dependencies:** P0-2, P3-1
- **Estimate:** 8 days

**24. Roles & Permissions** 🟡 Medium
- User roles & permissions
- Team collaboration
- **Dependencies:** P3-1
- **Estimate:** 5 days

**25. Data Export** 🟡 Medium
- Export analytics, user data, content
- Reporting
- **Dependencies:** P2-6
- **Estimate:** 3 days

**26. Venue Partner SDK** 🟡 Medium
- SDK/embed for venue partners
- Integration API
- **Dependencies:** P3-1
- **Estimate:** 7 days

### **At Event (1 feature)**

**27. Offline Queue** 🔴 High
- Offline queue for spotty venues
- Sync when online
- PWA capabilities
- **Dependencies:** P2-2, P2-3
- **Estimate:** 6 days

### **After Event (1 feature)**

**28. ERC-1155 Keepsakes (Optional)** 🔵 Low
- Blockchain keepsakes
- Custodial wallet
- Optional feature
- **Dependencies:** P1-3
- **Estimate:** 10 days

**Total P3:** 51 days (~10 weeks)

---

## 📈 P4 — License & Scale - 7 Features

**Goal:** Enterprise-ready platform for licensing

### **All Before Event (7 features)**

**29. Pricing Tiers** 🔴 High
- Pricing tiers for different event sizes
- Feature sets
- **Dependencies:** P3-1
- **Estimate:** 4 days

**30. Sandbox Tenant** 🟡 Medium
- Sandbox environment
- Testing & demos
- **Dependencies:** P3-1
- **Estimate:** 3 days

**31. Documentation & Guides** 🔴 High
- Comprehensive docs
- API reference, getting started guides
- **Dependencies:** P3-3, P3-7
- **Estimate:** 6 days

**32. Support Playbook** 🟡 Medium
- Customer support playbook
- FAQs, troubleshooting, escalation
- **Estimate:** 4 days

**33. Security Review** 🔴 High
- Security audit
- Penetration testing
- **Dependencies:** P3-4
- **Estimate:** 5 days

**34. DPA Pack** 🟡 Medium
- Data Processing Agreement
- Enterprise customers
- **Dependencies:** P0-4
- **Estimate:** 3 days

**35. SLOs & Observability** 🔴 High
- Service Level Objectives
- Monitoring, alerting, observability
- **Dependencies:** P2-6
- **Estimate:** 6 days

**Total P4:** 31 days (~6 weeks)

---

## 🎯 Principles (Implemented)

✅ **AI-first feed + in-world Guides** (P1-4)  
✅ **Keep current app structure** (P1-1)  
✅ **No accounts for demo** (P1-5)  
✅ **Mobile-first, 3D-lite** (P0-1)  
✅ **AR as optional garnish** (P1-6)

---

## 🛠️ Tech Stack (Reflected in Cards)

- **FE:** Next.js/React + Three.js (PWA)
- **CMS/Data:** Supabase (authless demo unlock)
- **AI:** Hosted LLM for Suggest/Guide
- **Analytics:** Product analytics + event pipeline
- **Infra:** Vercel/Google Cloud, CI/CD, feature flags

---

## 📊 Timeline Summary

| Phase | Duration | Features | Focus |
|-------|----------|----------|-------|
| **P0** | 2-3 weeks | 5 | Foundations |
| **P1** | 4-6 weeks | 9 | MVP Demo (Southbank) |
| **P2** | 3-4 weeks | 6 | Live Pilot |
| **P3** | 8-10 weeks | 8 | Platformise |
| **P4** | 5-6 weeks | 7 | License & Scale |
| **Total** | **22-29 weeks** | **35** | **Full Platform** |

---

## 🚀 How to Use the Roadmap

### **View by Phase:**

1. Go to: http://localhost:3000/roadmap
2. All 33 cards are organized by status
3. Use filters to view by user type or event phase

### **Build Features:**

1. **Pick a P0 feature** (start with foundations)
2. Click **"📝 Spec"** to build detailed spec
3. **Drag to Build Panel** (right side)
4. Watch **multi-AI collaboration**
5. Get **production-ready code in VS Code**!

### **Suggested Build Order:**

**Week 1-3: P0 Foundations**
1. Brand Kit + 3D UI Shell
2. CMS v1
3. Asset Pipeline
4. Analytics + GDPR
5. Demo Mode

**Week 4-9: P1 MVP Demo**
6. Experience Rails
7. Pre-show Chapters
8. Memory Wallet
9. AI Suggest Feed
10. Ticket Unlock
11. Event Companion
12. AR Preview
13. Merch Links
14. Memory Sharing

**Week 10-14: P2 Live Pilot**
15. Partner Webhook
16. Check-in
17. On-site Capture
18. Memory Book
19. Achievements
20. KPI Dashboard

---

## ✅ What's Working

- ✅ 33 feature cards from your product path
- ✅ Organized by P0-P4 phases
- ✅ Mapped to Before/Event/After
- ✅ Dependencies tracked
- ✅ Time estimates included
- ✅ Priorities set
- ✅ AI assignments ready
- ✅ Ready to build!

---

## 🎯 Next Steps

1. **Review the roadmap** at http://localhost:3000/roadmap
2. **Start with P0** - Build foundations first
3. **Use AI collaboration** - Drag cards to Build Panel
4. **Track progress** - Move cards through columns
5. **Prepare for Southbank** - Focus on P1 features

---

**Built by Augment Code** 🎯  
*Your Ode Islands product path is ready to build!* 🏝️

