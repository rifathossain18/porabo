# Application Flow & State Machine Specification — TuitionMatch

**Document:** 02_AppFlow.md  
**Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Software Architect  

---

## 1. Global Navigation Routing & Roles

TuitionMatch operates on two distinct user persona modes (with instant role switching for dual-role users):
- **Student Mode (`/student/*`)**: Post tuition requirements, inspect applications, select & accept a tutor, reveal contact information.
- **Tutor Mode (`/tutor/*`)**: Set search radius (1km - 5km), discover nearby student requests, submit applications, manage application statuses.

### Route Map

```
/ (Landing / Auth Gateway)
 ├── /auth/login
 ├── /auth/register?role=student|tutor
 ├── /auth/onboarding (Location setup, Area name, GPS pin)
 │
 ├── /student/dashboard (Active Posts, Applications summary)
 │    ├── /student/posts/create (Modal or full-page wizard)
 │    ├── /student/posts/:postId (Post overview & Applicant Inbox)
 │    │    └── /student/posts/:postId/applicants/:applicantId (Tutor profile modal)
 │    │         └── [ACTION: Accept Tutor] -> triggers Contact Unlock Transition
 │    ├── /student/explore-tutors (Nearby tutors with 1-5km radius filter)
 │    └── /student/profile (Address, phone, saved location)
 │
 └── /tutor/feed (Geospatial Feed with 1km, 2km, 3km, 4km, 5km pills)
      ├── /tutor/posts/:postId (Public detail with masked student address)
      │    └── [ACTION: Apply] -> Open Application Drawer
      ├── /tutor/applications (Status tracking: Pending, Accepted, Rejected)
      │    └── /tutor/applications/:appId (When Accepted -> Full Student Contact Screen)
      └── /tutor/profile (Bio, educational degree, subjects taught, base location)
```

---

## 2. Screen-by-Screen State Machine

### 2.1 Screen: Location Acquisition & Onboarding
- **State `LOC_PROMPT`:** System requests browser `navigator.geolocation`.
  - **Action `ALLOW`:** Captures `{ lat, lng }` -> reverse geocodes to `area_name` (e.g., "Uttara Sector 7"). Moves to `LOC_CONFIRMED`.
  - **Action `DENY`:** Displays manual landmark search input + interactive pin picker.
- **State `LOC_CONFIRMED`:** User confirms radius anchor point. Stored in session and user profile.

---

### 2.2 Screen: Tutor Feed & Radius Discovery (`/tutor/feed`)

#### State Table
| State | Trigger | Next State | Display UI |
|---|---|---|---|
| `FEED_LOADING` | Screen mount or Radius tab changed | `FEED_LOADED` / `FEED_EMPTY` | Skeleton card list with pulsing radius badge |
| `FEED_LOADED` | Posts fetched within `R` km | Interactive | List of tuition cards sorted ascending by distance (km) |
| `FEED_EMPTY` | 0 posts found within `R` km | `FEED_EMPTY` | Empty state: "No tuition requests found within {R} km. Try expanding to {R+1} km" |
| `FEED_ERROR` | GPS failed / Network failure | `FEED_ERROR` | Retry button + manual coordinate override |

#### Button Actions & Interactivity:
- **Radius Selector Pills:**
  - `[ 1 km ]`: Queries `ST_DWithin(post.geom, tutor.geom, 1000)`
  - `[ 2 km ]`: Queries within 2,000 meters
  - `[ 3 km ]`: Queries within 3,000 meters
  - `[ 4 km ]`: Queries within 4,000 meters
  - `[ 5 km ]`: Queries within 5,000 meters
  - `[ All ]`: National / City-wide view without distance constraint
- **Card Click (`View Details`):** Navigates to `/tutor/posts/:postId`. Shows approximate location badge (e.g., "Banani Road 11 · 1.3 km away") and "Privacy Protected" indicator.

---

### 2.3 Screen: Tutor Application Submission

#### Flow:
1. Tutor taps **"Apply for Tuition"** button on post `:postId`.
2. **Pre-check guards:**
   - If user is not authenticated -> redirect to `/auth/login?returnTo=/tutor/posts/:postId`.
   - If user already applied -> button displays disabled state **"Already Applied (Pending Review)"**.
   - If post is already `MATCHED` or `CLOSED` -> button disabled with badge **"Tuition Filled"**.
3. **Application Modal/Drawer:**
   - Input: Expected Monthly Remuneration (prefilled with student budget, editable).
   - Input: Available Days & Time Slots (e.g., "Sun, Tue, Thu after 5:00 PM").
   - Input: Short Proposal Message (e.g., "I am a 3rd year CSE student with 2 years experience teaching Physics & Higher Math").
4. **Submit Action:**
   - Optimistic UI: Button changes to `Submitting...` -> on success: Toast **"Application sent! You will receive notification if accepted."**

---

### 2.4 Screen: Student Post Management & Applicant Review (`/student/posts/:postId`)

#### State Table:
| Post Status | Student Action | View State |
|---|---|---|
| `OPEN` | Review incoming applications | Shows list of applicant cards with distance, tutor credentials, proposed fee. |
| `APPLICANT_CLICKED` | Click applicant | Opens Drawer with Tutor's full academic bio, experience, and application cover note. |
| `CONFIRM_MODAL` | Click `Accept This Tutor` | Opens High-Impact Confirmation Modal: *"Accepting [Tutor Name] will lock this tuition and reveal your direct contact & address to each other. Other candidates will be notified."* |
| `MATCHED` | After confirmation confirmed | Post locked. Primary banner displays: **"Tutor Matched! Contact details revealed below."** |

---

### 2.5 Screen: Mutual Contact Disclosure Screen

This is the central privacy-safety pivot of the application:

```
[ BEFORE ACCEPTANCE ]
Student View of Tutor:
  - Tutor Name: "Farhana K."
  - Rating: ★ 4.9 (14 reviews)
  - Degree: "B.Sc in Mathematics, University of Dhaka"
  - Distance: "1.4 km from your study location"
  - Phone: "•••••••••• (Hidden until accepted)"
  - Address: "Mirpur Section 2 (Exact street hidden)"

Tutor View of Student:
  - Student: "Grade 10 - English Medium"
  - Area: "Mirpur Section 1"
  - Distance: "1.4 km away"
  - Phone: "•••••••••• (Hidden until accepted)"
  - Exact Address: "Hidden until accepted"

=========================================
  STUDENT CLICKS: [ ACCEPT TUTOR ]
=========================================

[ AFTER ACCEPTANCE (MUTUAL UNLOCK) ]
Student View of Tutor:
  - Phone: +880 1712-345678 [ Click to Call ] [ Chat on WhatsApp ]
  - Full Name: Farhana Khanom
  - Email: farhana.k@edu.com
  - Direct Action: "Call Tutor Now" / "Message on WhatsApp"

Tutor View of Student:
  - Student / Guardian: Mrs. Nasreen Akhter
  - Phone: +880 1819-987654 [ Click to Call ] [ Chat on WhatsApp ]
  - Exact Location: House 42, Road 7, Block D, Mirpur 1
  - Special Delivery Notes: "Ring 3rd floor calling bell; ask for Mrs. Nasreen"
```

---

## 3. Empty & Error States Matrix

| Scenario | Trigger | UI Manifestation | Recovery Action |
|---|---|---|---|
| **Location Disabled** | Browser denies GPS | Amber warning bar on top of screen | Button: "Enter Landmark Manually" or "Use Default City Center" |
| **Zero Posts in Radius** | 1km filter returns 0 results | Illustrated radar with zero dots | Prompt: "No posts within 1km. Tap [ 2 km ] or [ 3 km ] to widen your search." |
| **Post Closed Mid-Application** | Another tutor was accepted while submitting | Red alert toast: "This post was just filled by another candidate." | Redirect back to feed; refresh post list |
| **Duplicate Application** | Double-click or multi-tab submit | Graceful idempotency catch: "Application already recorded." | Navigate to `/tutor/applications` |
| **Unauthorized Contact Access** | Direct API hit to contact endpoint when status != `ACCEPTED` | HTTP 403 Forbidden with payload `{ error: "CONTACT_LOCKED_PENDING_ACCEPTANCE" }` | UI stays locked; zero leaks |
