# PROJECT STATUS — I Wanna Play Pickleball
**Last Updated:** May 2025  
**Maintained by:** Hiram Santana & Steven Bettencourt

---

## 🌐 LIVE URLS
| Purpose | URL |
|---|---|
| Signup Form | https://hiramlosangeles-crypto.github.io/pickleball-form/ |
| Main Site | https://iwannaplaypickleball.com |
| Warm-Up Page | https://iwannaplaypickleball.com/warmup |

---

## 👥 TEAM
| Role | Name | Email |
|---|---|---|
| Organizer / Dev | Hiram Santana | hiramlosangeles@gmail.com |
| Co-organizer | Steven Bettencourt | steven@iwannaplaypickleball.com |

Both emails receive all admin alerts and confirmation notifications.

---

## 🏗️ STACK
- **Frontend:** Pure HTML/CSS/JS — no frameworks
- **Hosting:** GitHub Pages
- **Backend:** Google Apps Script (Web App)
- **Database:** Google Sheets (Sunday Signups sheet)
- **Fonts:** Inter via Google Fonts

---

## 📁 FILE STRUCTURE

pickleball-form/
├── index.html               # Main form — 3-step flow
├── script.js                # All form logic, phone lookup, submission
├── style_jan25_sunset.css   # All styles — sunset purple/yellow/orange theme
├── homepage.html            # Homepage
├── logo.png                 # Site wordmark
├── banner.jpg               # Hero banner (desktop only)
├── banner.png               # Banner alternate
├── calendar-icon.png        # Generic SUN calendar SVG icon
├── og-image.jpg             # Open Graph image for link previews
├── player-hero.jpg          # Player hero image
├── player-hero2.jpg         # Player hero image alt
├── phoenix-logo.png         # Phoenix logo asset
├── README.md                # Repo readme
└── doc/                     # Project documentation
├── PROJECT_STATUS.md    # ← this file
└── CURRENT_TASKS.md     # Task list and priorities

---

## 🎨 COLOR PALETTE (STRICT — DO NOT CHANGE)
| Token | Hex | Usage |
|---|---|---|
| Primary Purple | `#9B51E0` | Borders, highlights, primary brand |
| Primary Yellow | `#FFE500` | Accents, CTAs, selected states |
| Primary Orange | `#FFA500` | Warnings, Sunday Only card |
| Background Dark | `#1a0a2e` | Page background |
| Card Background | `#2d1b4e` | Form cards, inputs |
| Card Hover | `#3d2b5e` | Hover states |
| Text Primary | `#ffffff` | Main text |
| Text Secondary | `#d4c5f9` | Subtitles, descriptions |

Sunset gradient (buttons): `#9B51E0 → #D946EF → #FF6B9D → #FF8C69 → #FFB84D → #FFE500`

---

## ⚙️ BACKEND CONFIG
- **Script URL:** `https://script.google.com/macros/s/AKfycbwBFmuf3MN6YDgqkMhONvFHtXeuw9yNAU_4PwtbBFGN7FlexBjbA6pz3VkoCSbwhkiK/exec`
- **Actions:** `getNext3Sundays`, `lookupPhone`, POST form submission
- **Max players per date:** 8
- **Payment amount:** $4 per person
- **Venmo handle:** @Steven-Bettencourt-4
- **Zelle phone:** (310) 433-8281
- **Zelle email:** bettencourtdesign@me.com

---

## 📋 FORM FLOW (3 STEPS)
### Step 0 — Date Picker
- Loads next 3 Sundays dynamically from Google Apps Script
- Generic SVG calendar icon (SUN in yellow on purple) — DO NOT revert to date-specific images
- Full dates show red border + FULL label
- Selected date shows yellow glow border

### Step 1 — Player Info & Payment
- Phone number with auto-lookup (debounced 500ms)
- Returning players get welcome message + auto-fill
- 1 or 2 player selection (dynamic name fields)
- Email field
- Payment: Venmo or Zelle ONLY — Cash permanently removed, do not reintroduce
- $4/person — Venmo amount bug has been fixed, always verify on changes

### Step 2 — Signup Type (Required Radio)
- **Priority Alerts** (recommended) — shows extra fields: home court, skill level, best days, best times
- **Sunday Only** — bright orange gradient card, no extra fields required
- Skill levels: Social, Beginner, Intermediate, Advanced

### Confirmation Screen
- Rainbow border gradient
- Shows game details, payment amount, email
- Links to warm-up page and homepage

---

## 🔄 WORKFLOW
1. Edit files locally in VS Code
2. Save changes
3. In GitHub Desktop: review changes → write commit message → **Commit to main** → **Push origin**
4. Wait ~2 minutes for GitHub Pages to deploy
5. Hard-refresh browser (Cmd+Shift+R) to test

---

## ⚠️ KNOWN ISSUES & RULES
- **Cash payment PERMANENTLY removed** — never reintroduce under any circumstances
- **Venmo amount is bug-prone** — always verify `$4 × playerCount` logic after any payment changes
- **Calendar icons are generic SVGs** — do not revert to date-specific images
- **Always deliver complete file replacements** — not partial diffs
- **Test all UI at 375px minimum** viewport width (iPhone SE)
- Recurring structural HTML issues (misplaced tags, duplicate blocks) — always review full file before editing





