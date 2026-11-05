# UI & Design System Specification — TuitionMatch

**Document:** 03_UI_Spec.md  
**Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Software Architect / Design Systems Lead  

---

## 1. Design Philosophy & Visual Tone

TuitionMatch combines **academic trustworthiness**, **hyper-local warmth**, and **high-privacy confidence**.
- **Visual anchors:** Clean emerald green (representing education, growth, and neighborhood vitality), deep slate navy (credibility and security), crisp surface whites, and subtle radial accents.
- **Zero-pill discipline:** Avoid floating pill soup; interactive controls use structured tabs, crisp segmented chips, and clear affordances.
- **Micro-interactions:** Smooth spring animations for distance radius switching and contact disclosure reveals.

---

## 2. Color Palette (Exact Hex Tokens)

### 2.1 Light Theme (Default)
| Token Name | Hex Code | Role / Usage |
|---|---|---|
| `--color-primary-50` | `#ECFDF5` | Subtle badge backgrounds, active pill tints |
| `--color-primary-100` | `#D1FAE5` | Highlight borders, selection rings |
| `--color-primary-500` | `#10B981` | Secondary accents, success status |
| `--color-primary-600` | `#059669` | **Primary Brand Color** (CTA buttons, key headers) |
| `--color-primary-700` | `#047857` | Button hover states, emphasized text |
| `--color-slate-900` | `#0F172A` | Primary headings, highest contrast text |
| `--color-slate-700` | `#334155` | Body text, card descriptions |
| `--color-slate-500` | `#64748B` | Subtitles, timestamps, distance annotations |
| `--color-slate-300` | `#CBD5E1` | Default borders, dividers |
| `--color-slate-100` | `#F1F5F9` | Neutral button backgrounds, chip backgrounds |
| `--color-slate-50` | `#F8FAFC` | App background, subtle card canvas |
| `--color-surface-white` | `#FFFFFF` | Card backgrounds, modals, sheets |
| `--color-amber-500` | `#F59E0B` | Warning badges, pending status, ratings |
| `--color-rose-500` | `#EF4444` | Rejected status, cancellation alert, error text |
| `--color-indigo-600` | `#4F46E5` | Verified badge, curriculum tag highlight |

### 2.2 Dark Theme Tokens
| Token Name | Hex Code | Role / Usage |
|---|---|---|
| `--color-dark-bg` | `#0B0F19` | Deepest root canvas |
| `--color-dark-surface` | `#131B2E` | Elevated cards, navigation header |
| `--color-dark-surface-elevated` | `#1E293B` | Modals, flyout menus, drawers |
| `--color-dark-border` | `#24334A` | Card borders, table dividers |
| `--color-dark-text-primary` | `#F8FAFC` | Primary text headings |
| `--color-dark-text-secondary` | `#94A3B8` | Subtitles and meta tags |
| `--color-dark-primary` | `#10B981` | Brightened emerald for dark contrast |

---

## 3. Typography Scale

TuitionMatch utilizes the system UI typography stack:
`font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`

| Style Name | Font Size | Line Height | Font Weight | Letter Spacing | CSS Equivalent |
|---|---|---|---|---|---|
| **Display 1** | 36px (2.25rem) | 44px (1.2) | 700 (Bold) | -0.02em | `text-4xl font-bold tracking-tight` |
| **Heading 1** | 28px (1.75rem) | 36px (1.3) | 700 (Bold) | -0.015em | `text-3xl font-bold tracking-tight` |
| **Heading 2** | 22px (1.375rem) | 28px (1.3) | 600 (Semibold) | -0.01em | `text-2xl font-semibold` |
| **Heading 3** | 18px (1.125rem) | 24px (1.35) | 600 (Semibold) | 0 | `text-lg font-semibold` |
| **Body Large** | 16px (1.0rem) | 24px (1.5) | 500 (Medium) | 0 | `text-base font-medium` |
| **Body Default**| 14px (0.875rem)| 20px (1.45) | 400 (Regular) | 0 | `text-sm font-normal` |
| **Caption / Meta**| 12px (0.75rem) | 16px (1.35) | 500 (Medium) | +0.01em | `text-xs font-medium text-slate-500` |
| **Micro Badge** | 11px (0.6875rem)| 14px (1.2) | 600 (Semibold) | +0.02em | `text-[11px] font-semibold tracking-wide uppercase` |

---

## 4. Spacing, Elevation & Layout Grid

- **Base Rhythm:** 4px grid. All margins and paddings must be multiples of 4 (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px).
- **Container Max-Widths:**
  - Feed / Cards View: `max-w-4xl` (896px)
  - Detail / Form Screens: `max-w-2xl` (672px)
  - App Shell: `max-w-7xl` (1280px)
- **Shadows & Elevation:**
  - `elevation-0`: No shadow, border `border border-slate-200 dark:border-slate-800`
  - `elevation-card`: `shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]`
  - `elevation-hover`: `shadow-[0_12px_24px_-8px_rgba(15,23,42,0.12),0_4px_8px_-2px_rgba(15,23,42,0.06)]`
  - `elevation-modal`: `shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)]`

---

## 5. Core Component Design Specs

### 5.1 Radius Distance Selector (1 km, 2 km, 3 km, 4 km, 5 km)
The key signature control of the tuition platform.

- **Structure:** Segmented interactive rail with discrete distance values:
  `[ 1 km ]`  `[ 2 km ]`  `[ 3 km ]`  `[ 4 km ]`  `[ 5 km ]`  `[ All ]`
- **States:**
  - **Default (Inactive):**
    - Background: `#FFFFFF` (Dark: `#1E293B`)
    - Border: `1px solid #E2E8F0` (Dark: `#334155`)
    - Text: `#475569` (Dark: `#94A3B8`), `font-medium text-sm`
  - **Hover:**
    - Background: `#F8FAFC` (Dark: `#24334A`)
    - Border: `#CBD5E1`
  - **Active / Selected:**
    - Background: `#059669` (Emerald 600)
    - Text: `#FFFFFF` with bold weight
    - Icon: `<Compass className="w-3.5 h-3.5 inline mr-1" />`
    - Shadow: `0 2px 6px rgba(5,150,105,0.3)`
  - **Animation:** `motion.div layoutId="activeRadiusPill"` with spring `stiffness: 400, damping: 30`.

### 5.2 Tuition Post Card
- **Header:**
  - Subject Badge (e.g., `Higher Math & Physics`, bg: `#ECFDF5`, text: `#047857`)
  - Grade/Level (e.g., `Class 10 (SSC / English Version)`)
  - Distance Chip: Right-aligned badge with radar icon:
    - If `< 1.0 km`: `bg-emerald-100 text-emerald-800 border-emerald-200` ("0.6 km away • 7 min walk")
    - If `1.0 - 3.0 km`: `bg-sky-100 text-sky-800 border-sky-200` ("2.1 km away • Short ride")
    - If `3.1 - 5.0 km`: `bg-slate-100 text-slate-700 border-slate-200` ("4.2 km away")
- **Body:**
  - Approximate Location: "Mirpur 10 (Near Metro Station)" — *exact house hidden*
  - Salary Budget: `৳ 8,000 / month` or `$250 / mo`
  - Schedule: `3 days/week • 1.5 hrs/day`
- **Footer:**
  - Application count indicator: `4 applied`
  - Action Button: `[ Apply Now ]` or `[ View Details ]`

### 5.3 Privacy-Shielded Contact Disclosure Card (Locked vs Unlocked)

#### Locked State (Visible before Student Clicks "Accept"):
- Container: Border dashed `#CBD5E1`, background `#F8FAFC`
- Graphic: Shield Lock Icon with amber/emerald badge
- Headline: *"Exact Address & Contact Locked"*
- Subtext: *"To safeguard student privacy and avoid spam, full contact details (phone, WhatsApp, and building address) are disclosed only to the accepted tutor."*
- Masked Items:
  - Phone: `+880 17•• ••••••` (Locked icon)
  - Address: `Dhanmondi, Dhaka` (Exact road & house encrypted)

#### Unlocked State (Triggered upon `status === 'ACCEPTED'`):
- Container: Border solid `2px #10B981`, background `#F0FDF4`
- Graphic: Unlocked Verified Checkmark with glowing emerald border
- Headline: *"Contact Details Unlocked! Congratulations on matching."*
- Action Grid:
  - **Direct Call Button:** `tel:+8801712345678` (Emerald CTA with Phone icon)
  - **WhatsApp Direct Button:** `https://wa.me/8801712345678?text=Hello...` (Green WhatsApp icon)
  - **Full Address Box:** Exact building, road, floor, and special guardian instructions.
  - **Copy Address Button:** One-tap clipboard copy.

### 5.4 Application Status Badges
- `PENDING`: Background `#FEF3C7` (Amber 100), Text `#B45309` (Amber 700), Border `#FDE68A`
- `ACCEPTED`: Background `#D1FAE5` (Emerald 100), Text `#065F46` (Emerald 800), Border `#A7F3D0`
- `REJECTED`: Background `#FEE2E2` (Rose 100), Text `#991B1B` (Rose 800), Border `#FECACA`
- `WITHDRAWN`: Background `#F1F5F9` (Slate 100), Text `#475569` (Slate 600), Border `#E2E8F0`
