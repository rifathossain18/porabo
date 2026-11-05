# Product Requirements Document (PRD) — TuitionMatch

**Project Name:** Porabo  
**Document Version:** 1.0.0  
**Status:** Approved for Architecture & Implementation  
**Owner:** Principal Software Architect  
**Target Delivery:** MVP Phase 1  

---

## 1. Executive Summary & Core Problem

### 1.1 The Problem
In urban and suburban communities, private home and neighborhood tuition is a multi-billion dollar informal market, yet it remains fundamentally broken:
1. **Inefficient Neighborhood Discovery:** Students and tutors often live within 1 to 5 kilometers of each other (walking or cycling distance) but have no hyper-local discovery mechanism. They rely on word-of-mouth or crowded Facebook groups with zero geographic filtering.
2. **Severe Privacy & Safety Concerns:** In informal groups, students (often young minors or their parents) post their personal phone numbers, exact residential street addresses, and family details publicly. This leads to harassment, spam, and safety vulnerabilities.
3. **Application Clutter & Unstructured Hiring:** When a tuition need is posted, dozens of unqualified candidates spam the student with calls and WhatsApp messages, overwhelming the student/parent without any structured selection or portfolio comparison.

### 1.2 The Solution
**TuitionMatch** is a hyper-local, privacy-first tuition marketplace where:
- **Students** post tuition requirements with approximate landmark locations.
- **Tutors** discover open tuition opportunities filtered strictly by distance radius (**1 km, 2 km, 3 km, 4 km, 5 km**).
- **Tutors submit structured applications** directly on the post.
- **Privacy Shield:** A student's exact physical address, phone number, and WhatsApp link are **completely encrypted and hidden** until the student reviews all candidates and explicitly **Accepts** the single tutor of their choice.
- **Mutual Unlock:** Once accepted, the tuition contract locks, the chosen tutor receives full logistical details, and all other applications are gracefully closed.

---

## 2. Target Personas

### Persona A: The Student / Parent ("Rahim / Mrs. Ahmed")
- **Profile:** High school student or parent of a grade 1–12 student seeking a reliable, verified tutor.
- **Key Pain Point:** Hesitant to share phone numbers or apartment numbers publicly; needs someone living nearby (within 1–3 km) so the tutor is punctual and familiar with local school curriculums.
- **Key Goal:** Post a tuition requirement, view candidate distance and qualifications, and safely hire exactly one trusted tutor without receiving 50 unsolicited phone calls.

### Persona B: The Tutor / Teacher ("Farhana / Tanvir")
- **Profile:** University undergraduate, graduate, or professional school teacher looking for tuition opportunities to supplement income.
- **Key Pain Point:** Traveling more than 4–5 km during peak traffic hours is exhausted and unprofitable; difficult to find tuition posts right in their neighborhood or apartment block.
- **Key Goal:** Set current location, tap "1 km" or "2 km", find student posts within walking distance, apply with their credentials and expected fee, and get notified immediately upon acceptance.

---

## 3. MVP User Stories

### Epics & Acceptance Criteria

#### Epic 1: Hyper-Local Radius Discovery (1 km – 5 km)
- **US-1.1:** As a Tutor, I want to filter tuition posts by discrete radius buttons (**1 km, 2 km, 3 km, 4 km, 5 km**) based on my current GPS coordinates or saved base location, so that I only see opportunities within feasible travel distance.
  - *Acceptance Criteria:*
    - UI provides single-tap radius selector tabs: `1 km`, `2 km`, `3 km`, `4 km`, `5 km`, and `All`.
    - Distance is computed via the Haversine formula / PostGIS spatial functions accurate to within 10 meters.
    - Each tuition card displays the calculated distance (e.g., `"0.8 km away"`).
- **US-1.2:** As a Student, I want to browse available tutors within 1–5 km who have registered in my area, so that I can gauge the local teacher supply before or after posting.

#### Epic 2: Tuition Request Posting (Student)
- **US-2.1:** As a Student, I want to post a tuition vacancy specifying Subject(s), Class/Grade level, Curriculum (e.g., National/Cambridge/Edexcel), Days per week, Salary/Budget, and Preferred Tutor Gender.
  - *Acceptance Criteria:*
    - Form requires approximate area/neighborhood (e.g., "Dhanmondi Block B" or "Green Park Sector 3") and coordinates.
    - Exact street address and apartment number are stored in a secured column, not exposed in public queries.
    - Post starts with status `OPEN`.

#### Epic 3: Structured Application Workflow (Tutor)
- **US-3.1:** As a Tutor, I want to apply to an `OPEN` tuition post within my selected radius by submitting my proposed monthly fee, weekly availability, and a concise cover proposal.
  - *Acceptance Criteria:*
    - One application per tutor per post (enforced by unique database constraint).
    - Tutor cannot apply to their own post.
    - Tutor contact info is masked from public feed; only tutor's public profile, academic background, and application message are visible to the student.

#### Epic 4: Selection & Privacy Shield Unlock (Student & Accepted Tutor)
- **US-4.1:** As a Student, I want to review all received applications in an organized applicant inbox, comparing distance, qualification, and proposal.
- **US-4.2:** As a Student, I want to click **"Accept Tutor"** on my preferred candidate, triggering:
  - Post status transition: `OPEN` -> `MATCHED` / `CLOSED`.
  - Application status transition: Candidate set to `ACCEPTED`; all other pending applicants set to `REJECTED`.
  - Mutual contact unlock: The accepted tutor immediately gains access to the student's exact address, direct phone number, and one-tap WhatsApp link.
  - The student simultaneously receives the tutor's verified phone number and contact details.

#### Epic 5: Location Configuration & Fallback
- **US-5.1:** As a user (Student or Tutor), I want to set my location using one-tap browser GPS or choose a landmark on a map, with full support for manual coordinates if GPS permission is denied.

---

## 4. Success Metrics (KPIs)

| Metric | Target (MVP) | Measurement Method |
|---|---|---|
| **Radius Match Accuracy** | 100% within specified boundary | Haversine distance tests |
| **Privacy Zero-Leakage** | 0 un-authorized contact disclosures | Automated security & RLS audits |
| **Median Time-to-Application** | < 4 hours | Timestamp delta: `post.created_at` to `first_app.created_at` |
| **Acceptance-to-Contact Flow** | > 85% successful unlocks | Ratio of `ACCEPTED` apps to contact view events |
| **Spam Reduction** | 0 cold calls to students before acceptance | Enforced by architecture |

---

## 5. Out of Scope (Strict Non-Goals for MVP)

To ensure rapid, defect-free execution and zero architectural scope creep, the following are strictly **NON-GOALS** for the MVP:

1. **In-App Payment Gateway & Escrow:** Tuition salaries are negotiated and paid directly between student and tutor in person or via local bank/mobile wallet (e.g., bKash, UPI, Cash). No payment gateway integration in Phase 1.
2. **In-App Video Classroom & Whiteboard:** Lessons occur in-person at the student's/tutor's home or via external video software (Zoom, Google Meet).
3. **Multi-Tutor Acceptance:** A tuition request can have only **one** accepted tutor. Multi-tutor batch hiring is out of scope.
4. **Automated Bidding Auctions:** Posts do not support continuous down-bidding wars; tutors submit a single structured proposal.
5. **Real-time Live Geotracking:** No live Uber-style moving car tracking. Locations are static base points (home/study location) refreshed on demand.
6. **Background Police Checks:** Automated criminal record verification API is deferred to v2. Initial trust is built through academic ID photo uploads and student reviews.
