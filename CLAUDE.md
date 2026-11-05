# TuitionMatch — AI Coding Agent Directives (CLAUDE.md)

Welcome, AI Engineer / Claude Code / Coding Agent. This repository adheres to a strict **6-Document Context Architecture**. Before writing, modifying, or testing any single line of code, you must strictly comply with the following operational protocol.

---

## 1. MANDATORY: The 6-Document Reading Protocol
You are strictly forbidden from modifying application source code until you have ingested and understood the specifications in `/docs/`:

1. **`/docs/01_PRD.md`**: Understand the core problem, user personas, MVP scope, and the strict **Out of Scope (Non-Goals)**. Never implement features marked as Non-Goals (e.g. no in-app payment escrow, no video classrooms).
2. **`/docs/02_AppFlow.md`**: Understand the screen-by-screen state machine, navigation routes, button actions, and empty/error states.
3. **`/docs/03_UI_Spec.md`**: Follow exact design tokens, hex codes (Emerald `#059669`, Slate `#0F172A`), spacing rules (4px grid), and component state requirements.
4. **`/docs/04_TRD.md`**: Adhere to the pinned tech stack, folder hierarchy, geospatial Haversine logic, and privacy masking constraints.
5. **`/docs/05_Schema.md`**: Follow the relational schema, SQL types, PostGIS spatial queries, Row-Level Security (RLS) rules, and the atomic `accept_tuition_tutor` transaction.
6. **`/docs/06_Plan.md`**: The living implementation roadmap.

---

## 2. MANDATORY: Step-by-Step Execution & Plan Tracking
- **Sequential Execution:** Always work along the dependency chain specified in `/docs/06_Plan.md` (Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6). Do NOT jump ahead to later phases.
- **Update Plan After Every Step:** As soon as you complete an atomic sub-task (e.g., `1.1 Types & Interfaces`), you **MUST immediately edit `/docs/06_Plan.md`** and mark that task `[x]`, noting the completion timestamp or file details.

---

## 3. CORE ARCHITECTURAL INVARIANTS (NEVER BREAK)

### 3.1 The Privacy Shield (Zero-Leakage Invariant)
- **Student Address & Phone Number are PRIVATE:** They must **NEVER** be sent in public feed APIs or displayed on public cards.
- Only the approximate neighborhood/area name (e.g., `"Banani Road 11"`) and calculated distance (e.g., `"1.4 km away"`) may be shown before acceptance.
- The student's exact physical address (house, road, floor) and phone/WhatsApp number may **ONLY be unlocked** when:
  1. The student explicitly clicks **"Accept Tutor"** on that tutor's application.
  2. The application status changes to `ACCEPTED`.
- Any code that returns raw student phone numbers to an unaccepted applicant is considered a critical security failure.

### 3.2 The 1km – 5km Radius Filter Invariant
- The platform's defining feature is hyper-local discovery.
- Tutors must be able to toggle distance filters: `1 km`, `2 km`, `3 km`, `4 km`, `5 km`, or `All`.
- Distances must be computed using spherical coordinates via Haversine or PostGIS functions.
- If a post is 1.4 km away:
  - It **must not** appear when the user selects `1 km`.
  - It **must** appear when the user selects `2 km`, `3 km`, `4 km`, `5 km`, or `All`.

### 3.3 Atomic Single-Tutor Acceptance
- A tuition post can have multiple applicants, but only **one** accepted tutor.
- When a tutor is accepted:
  - Post status changes to `MATCHED`.
  - The chosen tutor's application changes to `ACCEPTED`.
  - All other applications for that post are immediately marked `REJECTED`.

---

## 4. Code Quality & Conventions
- **TypeScript:** Strict mode enabled. No `any` types; use interfaces defined in `src/lib/types.ts`.
- **Styling:** Tailwind CSS v4 via utility classes. No inline CSS style objects or separate CSS files.
- **Icons:** Use `lucide-react`.
- **Animations:** Use `motion` for layout transitions and reveal animations.
- **Verification:** Always run `compile_applet` to confirm successful build after substantial edits.
