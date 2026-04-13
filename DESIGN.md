# Design Brief: Concept Grow Institute

## Purpose & Audience
Educational LMS serving Indian students and admins. Professional, accessible, community-focused learning platform with cultural warmth.

## Visual Direction
Professional warmth, not corporate cold. Warm terracotta primary paired with cool slate secondary and bright teal accents. Soft rounded corners (10px), generous spacing, dual-hierarchy typography for clear visual storytelling.

## Tone & Differentiation
Accessible expertise. Rejection of generic "tech blue"—instead, warm earth tones signal trust and care. Subtle micro-interactions on focus/hover. Admin and student experiences cleanly distinguished via sidebar accent borders and content hierarchy.

## Color Palette

| Token | Light OKLCH | Dark OKLCH | Purpose |
|---|---|---|---|
| Primary | `0.57 0.25 40` (warm ochre) | `0.72 0.22 38` | Buttons, navigation, core actions |
| Secondary | `0.52 0.08 264` (cool slate) | `0.72 0.12 264` | Secondary actions, links |
| Accent | `0.65 0.25 176` (teal) | `0.72 0.22 176` | Achievements, progress, highlights |
| Success | `0.68 0.22 142` (vibrant green) | `0.75 0.20 142` | Completion, positive states |
| Destructive | `0.56 0.24 20` (red) | `0.65 0.19 22` | Warnings, deletions |
| Background | `0.98 0.01 40` (cream) | `0.14 0.02 38` (near-black) | Page base |
| Foreground | `0.18 0.03 38` (charcoal) | `0.95 0.01 40` (off-white) | Text |
| Muted | `0.92 0.02 40` | `0.25 0.02 38` | Disabled, secondary text |

## Typography

| Tier | Family | Usage |
|---|---|---|
| Display | Space Grotesk (woff2) | Headlines, navigation labels, admin section titles |
| Body | DM Sans (woff2) | Paragraph text, course titles, labels |
| Mono | JetBrains Mono (woff2) | Code blocks, assignments, technical content |

Type scale: 12px, 14px, 16px, 18px, 20px, 24px, 32px. Weight hierarchy via body-regular + bold.

## Shape Language
Consistent border radius: 10px (`--radius: 0.625rem`). Cards, inputs, buttons—all soft, never sharp. Dark mode uses same radius; warmth maintained across themes.

## Structural Zones

| Zone | Light Treatment | Dark Treatment | Purpose |
|---|---|---|---|
| Sidebar | `bg-sidebar` off-white, `border-r` subtle | Dark grey, `border-r` cool | Navigation, role distinction |
| Header | `bg-card` white, `border-b` subtle | `bg-card` dark, `border-b` cool | Title, breadcrumb, controls |
| Main Content | `bg-background` cream | `bg-background` near-black | Course cards, modules, feed |
| Cards | `bg-card` elevated white | `bg-card` elevated dark | Course, assignment, quiz containers |
| Footer | `bg-muted/30` light warm | `bg-muted/20` dark | Announcements, secondary info |

## Component Patterns
- **Buttons**: Primary (warm bg, white text), secondary (slate bg), tertiary (no bg, slate text).
- **Cards**: Elevated shadow (`shadow-elevated`), soft radius, course/assignment/quiz consistent styling.
- **Progress**: Teal accent on cream background; percentage text right-aligned.
- **Badges**: Achievement badges use accent color; status badges use semantic colors.
- **Forms**: Warm input borders on focus; clear label hierarchy; error states in red.

## Motion & Interaction
Single smooth transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`. Applied to hover states, focus rings, popover entrance. No bounce, no complexity—confidence through restraint.

## Spacing & Rhythm
Generous baseline (16px). Sections separated by 24–32px. Cards internal padding 16–24px. Modular scale: 4px, 8px, 12px, 16px, 24px, 32px.

## Admin vs. Student Cues
Admin sidebar has warm ochre accent border on active items. Student interface uses teal accents for progress/achievements. Both share core tokens; role distinction via accent application only.

## Signature Detail
Warm ochre (#B8652A equivalent) primary color anchors the entire system. Indian education deserves its own color language—not borrowed from tech conventions.

## Constraints
- No arbitrary colors; all OKLCH tokens in theme.
- No decorative gradients; depth via layering and shadow.
- Typography pairs: Display + Body only; no three-font stacks.
- Dark mode maintains warmth; never inverts to cold blue-grey.
- All interactive elements (`hover`, `focus`, `active`) use consistent smooth transition.
