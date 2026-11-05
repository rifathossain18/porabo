# Technical Requirements Document (TRD) — TuitionMatch

**Document:** 04_TRD.md  
**Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Software Architect  

---

## 1. Locked Technology Stack & Versions

All dependencies and versions are pinned to avoid churn, breaking changes, and runtime incompatibilities:

| Layer | Technology | Exact Version | Rationale |
|---|---|---|---|
| **Frontend Framework** | React | `^19.0.1` | Concurrent mode, native actions, and high performance |
| **DOM Renderer** | React DOM | `^19.0.1` | Core client rendering target |
| **Language** | TypeScript | `^5.x / 7.x (tsx ^4.21.0)` | Strict static typing and contract adherence |
| **Build Tool & Bundler** | Vite | `^8.3.0` | Ultra-fast HMR and optimized production bundle |
| **Styling Engine** | Tailwind CSS | `^4.3.3` | Zero-runtime CSS with modern `@import "tailwindcss";` |
| **Animation Library** | Motion (Framer) | `^12.23.24` | Spring physics for radius pills and contact reveal |
| **Iconography** | Lucide React | `^0.546.0` | Unified, tree-shakable SVG icon set |
| **Server / Proxy Runtime** | Express / Node.js | `^4.21.2` | Clean API proxy, session management, and geospatial queries |
| **Database Engine** | PostgreSQL with PostGIS | `15+ (Cloud SQL / Supabase)` | Native spatial indexing (`ST_DWithin`, `ST_DistanceSphere`) |
| **Geospatial Computation** | Haversine Formula (JS/SQL) | Native standard | Spherical distance calculations in meters |

---

## 2. Directory & Architecture Structure

```
/
├── /docs/                          # Context Architecture Specifications
│   ├── 01_PRD.md                   # Product Requirements Document
│   ├── 02_AppFlow.md               # User Flows & State Machine
│   ├── 03_UI_Spec.md               # Design System & Component States
│   ├── 04_TRD.md                   # Technical Architecture & Constraints (This file)
│   ├── 05_Schema.md                # Relational DB Schema & RLS Policies
│   └── 06_Plan.md                  # Atomic Sequential Implementation Checklist
├── /src/
│   ├── components/                 # Reusable UI Atoms & Molecules
│   │   ├── common/                 # Buttons, Badges, Modals, Inputs
│   │   ├── layout/                 # Navbar, RoleSwitcher, Footer
│   │   ├── location/               # RadiusFilterPills, LocationPickerModal
│   │   └── tuition/                # TuitionPostCard, ContactRevealCard, ApplicantList
│   ├── context/                    # React Context (AuthContext, LocationContext)
│   ├── hooks/                      # Custom hooks (useGeolocation, useRadiusFilter)
│   ├── lib/                        # Utility functions
│   │   ├── geo.ts                  # Haversine distance & radius matching algorithms
│   │   ├── privacy.ts              # Masking & authorization checkers
│   │   └── types.ts                # Strict TypeScript interfaces
│   ├── services/                   # API clients & simulated offline storage
│   ├── views/                      # Main screen views
│   │   ├── student/                # StudentPostManager, CreatePostView, ExploreTutors
│   │   ├── tutor/                  # TutorFeedView, TutorApplicationView
│   │   └── docs/                   # Architectural Blueprint Hub & Simulator
│   ├── App.tsx                     # Primary router and application orchestrator
│   ├── index.css                   # Global Tailwind CSS imports
│   └── main.tsx                    # React client entry point
├── CLAUDE.md                       # Agent Instructions & Execution Directives
├── .cursorrules                    # Cursor IDE Configuration
├── metadata.json                   # Applet Configuration & Permissions
└── package.json                    # Pinned dependencies
```

---

## 3. Geospatial Engine & Radius Matching

### 3.1 The Haversine Formula (Client & Server Fallback)
For platforms running without PostGIS extension enabled, the following spherical distance formula is used:

```typescript
/**
 * Computes great-circle distance between two coordinates in kilometers.
 * Precision: within ~0.5% due to spherical earth approximation.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g. 1.4 km)
}
```

### 3.2 SQL PostGIS Spatial Query
When querying directly on PostgreSQL with PostGIS:
```sql
-- Fetch posts within :radius_km of user's coordinates
SELECT 
    id,
    title,
    subject,
    grade_level,
    salary_budget,
    area_name,
    latitude,
    longitude,
    status,
    ROUND((ST_DistanceSphere(geom, ST_MakePoint(:user_lng, :user_lat)) / 1000)::numeric, 1) AS distance_km
FROM tuition_posts
WHERE status = 'OPEN'
  AND ST_DWithin(
        geom, 
        ST_MakePoint(:user_lng, :user_lat)::geography, 
        :radius_km * 1000
      )
ORDER BY distance_km ASC;
```

---

## 4. Privacy Shield Architecture & Data Masking

### 4.1 Strict Serialization Rules
A student's private identity must **never** be transmitted over the wire to unaccepted users:

| Field | Public Feed (`/api/posts`) | Post Detail (`/api/posts/:id`) | Accepted Tutor Endpoint (`/api/posts/:id/contact`) |
|---|---|---|---|
| `student_id` | Masked / Anonymized | Masked / Anonymized | Full UUID |
| `student_name` | "Parent of Grade 9 Student" | "Mrs. Nasreen (Guardian)" | "Nasreen Akhter" |
| `phone_number` | `NULL` | `NULL` | `+880 1819-987654` |
| `whatsapp_number` | `NULL` | `NULL` | `+880 1819-987654` |
| `area_name` | "Mirpur 10" | "Mirpur 10 (Near Metro)" | "Mirpur 10" |
| `exact_address` | `NULL` | `NULL` | "House 42, Road 7, Block D, Apt 3B" |
| `latitude / longitude`| Obfuscated (+/- 200m fuzz) | Obfuscated (+/- 200m fuzz) | Exact coordinate pin |

### 4.2 Contact Disclosure Authorization Guard
The server endpoint for `/api/posts/:id/contact` MUST enforce this strict authorization invariant:

```typescript
function canAccessContactDetails(post: TuitionPost, requesterUserId: string, acceptedApplication?: TuitionApplication): boolean {
  // 1. If requester is the student who created the post -> ALLOW
  if (post.student_id === requesterUserId) return true;

  // 2. If an application exists, status is ACCEPTED, and tutor_id matches requester -> ALLOW
  if (
    acceptedApplication &&
    acceptedApplication.post_id === post.id &&
    acceptedApplication.tutor_id === requesterUserId &&
    acceptedApplication.status === 'ACCEPTED'
  ) {
    return true;
  }

  // 3. Otherwise -> STRICT REJECTION
  return false;
}
```

---

## 5. Third-Party Integrations & Formats

### 5.1 Geolocation Provider
- **Primary:** Browser HTML5 Geolocation API (`navigator.geolocation.getCurrentPosition`).
- **Options:** `{ enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }`.
- **Fallback Reverse Geocoding:** OpenStreetMap Nominatim reverse API or Google Geocoding proxy.

### 5.2 Direct Communication URL Schemes
Once contact details are unlocked, the UI provides native URI schemes:
- **Direct Phone Dial:** `tel:${cleanPhoneNumber}`
- **WhatsApp Web & App Direct Chat:**
  `https://wa.me/${countryCode}${phoneWithoutPlus}?text=${encodeURIComponent("Hello, I am the tutor accepted for your tuition post on TuitionMatch.")}`

### 5.3 Anti-Spam & Rate Limits
- Max active applications per tutor: **10 per 24-hour rolling window**.
- Max open posts per student: **3 active posts**.
- Duplicate application prevention enforced at DB level via unique constraint: `UNIQUE(post_id, tutor_id)`.
