# Implementation Plan & Atomic Roadmap — TuitionMatch

**Document:** 06_Plan.md  
**Version:** 1.0.0  
**Status:** In Progress (Living Document — MUST BE UPDATED AFTER EACH STEP)  
**Author:** Principal Software Architect  

> **CRITICAL DIRECTIVE FOR CODING AGENTS (Claude Code / Cursor):**  
> Do not execute multiple unordered steps simultaneously. Follow this checklist strictly from Phase 1 through Phase 6.  
> Immediately upon finishing each atomic item, edit this file and mark the checkbox with `[x]` and record the timestamp/commit note.

---

## Progress Overview

| Phase | Description | Status | Completion |
|---|---|---|---|
| **Phase 0** | Context Architecture & Blueprint Hub | Complete | 100% |
| **Phase 1** | Database Models, Spatial Indexing & Auth Context | Ready | 0% |
| **Phase 2** | Geospatial Engine & Haversine Distance Filters (1–5 km) | Ready | 0% |
| **Phase 3** | Student Workflow (Post Creation & Applicant Inbox) | Ready | 0% |
| **Phase 4** | Tutor Workflow (Radius Feed Discovery & Application Submission) | Ready | 0% |
| **Phase 5** | Privacy Shield & Atomic Contact Disclosure Engine | Ready | 0% |
| **Phase 6** | Validation, Edge Cases, Error Boundaries & Production Audit | Ready | 0% |

---

## Phase 0: Context Architecture & Specification Foundation
- [x] **0.1 Generate 01_PRD.md** — Core problem, personas, MVP stories, metrics, non-goals.
- [x] **0.2 Generate 02_AppFlow.md** — Screen state machine, transitions, error/empty states.
- [x] **0.3 Generate 03_UI_Spec.md** — Exact hex palette, typography, spacing, component states.
- [x] **0.4 Generate 04_TRD.md** — Pinned tech stack, folder structure, geospatial formulas, security.
- [x] **0.5 Generate 05_Schema.md** — Relational schema, indexes, RLS policies, acceptance stored procedure.
- [x] **0.6 Generate 06_Plan.md** — Atomic sequential checklist (This document).
- [x] **0.7 Create Root CLAUDE.md & .cursorrules** — Directives instructing agents to read docs and update plan.
- [x] **0.8 Initialize Architecture Explorer & Interactive Simulator in App.tsx** — Live demonstration viewer.

---

## Phase 1: Database Models, Spatial Indexing & Auth Context
- [ ] **1.1 Types & Interfaces (`src/lib/types.ts`)**
  - Define `User`, `TuitionPost`, `TuitionApplication`, `Notification`, and `GeoCoordinates`.
  - Define enums `UserRole`, `PostStatus`, `ApplicationStatus`.
- [ ] **1.2 Auth & Persona Context (`src/context/AuthContext.tsx`)**
  - Implement active user state with role switching (`STUDENT` <-> `TUTOR`).
  - Preload realistic mock test accounts for Rahim (Student) and Farhana (Tutor).
- [ ] **1.3 Mock Data Store & Local Storage Persistence (`src/services/dataService.ts`)**
  - Seed mock tuition posts with realistic coordinates across 1km, 2km, 3km, 4km, and 5km bands.
  - Implement local storage syncing so applications and acceptances persist between reloads.

---

## Phase 2: Geospatial Engine & Radius Filter (1–5 km)
- [ ] **2.1 Haversine Distance Calculator (`src/lib/geo.ts`)**
  - Implement `calculateHaversineDistance(lat1, lon1, lat2, lon2)`.
  - Add unit test validation ensuring <0.1 km deviation from theoretical spherical geodesic.
- [ ] **2.2 Geolocation Provider (`src/context/LocationContext.tsx`)**
  - Browser HTML5 `navigator.geolocation` hook.
  - Graceful fallback for permission denial with preset landmark quick-select.
- [ ] **2.3 Segmented Radius Filter Pills Component (`src/components/location/RadiusFilterPills.tsx`)**
  - Render options: `[ 1 km ]`, `[ 2 km ]`, `[ 3 km ]`, `[ 4 km ]`, `[ 5 km ]`, `[ All ]`.
  - Smooth animation with Motion layout tags and dynamic count indicators.

---

## Phase 3: Student Workflow (Post Creation & Applicant Inbox)
- [ ] **3.1 Tuition Post Creation Modal (`src/components/tuition/CreatePostModal.tsx`)**
  - Form fields: Subject, Grade level, Curriculum, Days/week, Monthly budget, Area name, Exact address.
  - Form validation: Budget > 0, required subjects, location coordinates.
- [ ] **3.2 Student Active Posts View (`src/views/student/StudentPostsView.tsx`)**
  - Display cards with badges for active applications received count.
  - Quick action: "View Applications (N)".
- [ ] **3.3 Applicant Review & Selection Drawer (`src/components/tuition/ApplicantInboxDrawer.tsx`)**
  - List candidates with calculated distance (e.g., "0.9 km away").
  - Show academic qualifications, proposed salary, and cover note.

---

## Phase 4: Tutor Workflow (Feed Discovery & Application Submission)
- [ ] **4.1 Nearby Tuition Feed (`src/views/tutor/TutorFeedView.tsx`)**
  - Integrated with the 1km - 5km radius selector.
  - Display tuition cards ordered ascending by distance.
  - Empty state with radar illustration when 0 posts exist in selected radius.
- [ ] **4.2 Tuition Details & Application Modal (`src/components/tuition/ApplyModal.tsx`)**
  - Masked student address view (shows neighborhood e.g. "Dhanmondi Block 4", hides house/phone).
  - Inputs: Proposed fee, schedule availability, short pitch.
  - Enforce duplicate application guard.

---

## Phase 5: Privacy Shield & Atomic Contact Disclosure Engine
- [ ] **5.1 Privacy Authorization Checker (`src/lib/privacy.ts`)**
  - Implement `getMaskedContact()` and `getDisclosedContact()`.
  - Strict conditional return: only reveal phone, WhatsApp, and exact street address if application status is `ACCEPTED`.
- [ ] **5.2 Atomic "Accept Tutor" Flow (`src/services/dataService.ts:acceptTutor`)**
  - Transition chosen application to `ACCEPTED`.
  - Transition all other applications for the post to `REJECTED`.
  - Lock post status to `MATCHED`.
- [ ] **5.3 Mutual Contact Unlock Card (`src/components/tuition/ContactRevealCard.tsx`)**
  - Animated reveal container with success green styling.
  - Action buttons: "Click to Call", "Open WhatsApp Chat", "Copy Exact Street Address".

---

## Phase 6: Edge Cases, Quality Audit & Final Verification
- [ ] **6.1 Zero-Result Radius Boundary Testing**
  - Verify that a post at 1.2 km does NOT appear in the 1 km filter but DOES appear in 2 km.
- [ ] **6.2 Application Collision & Double Submission Guard**
  - Verify disabled states and idempotent submissions.
- [ ] **6.3 Responsive Mobile/Tablet/Desktop Layout Audit**
  - Test on mobile width (375px), tablet (768px), and desktop (1200px).
- [ ] **6.4 Compilation & Lint Verification**
  - Execute `compile_applet` and resolve any TypeScript or bundler errors.
