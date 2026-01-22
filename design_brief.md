# Design Brief: Ausgabentracker Dashboard

## 1. App Analysis

### What This App Does
Ausgabentracker (Expense Tracker) helps users track their spending across different categories. Users can log expenses with amounts, dates, categories, descriptions, and attach receipts. The app provides an overview of spending patterns to help users understand where their money goes.

### Who Uses This
Individuals or small business owners who want to monitor their expenses. They need quick insights into total spending, category breakdown, and recent transactions. They care about staying on budget and identifying spending patterns.

### The ONE Thing Users Care About Most
**How much money have I spent this month?** This is the first question users ask when opening the app. The total monthly expense amount is the hero metric.

### Primary Actions (IMPORTANT!)
1. **Add new expense** → Primary Action Button (most common action - users log expenses multiple times per day)
2. View expense details (receipt, notes)
3. Filter by category or date range

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design uses a warm, approachable color palette with a soft cream background and deep teal accents. This creates a calm, reassuring feeling - managing money shouldn't feel stressful or corporate. The typography is bold and confident using Source Sans 3, with extreme weight contrast (300 vs 700) that makes numbers pop. The hero KPI uses an oversized euro amount that feels almost celebratory rather than intimidating - normalizing the act of tracking expenses.

### Layout Strategy
**Asymmetric with clear hero dominance.** The monthly total takes up massive visual space at the top (almost 40% of mobile viewport) with a large, bold number treatment. Secondary metrics are intentionally smaller and grouped tightly together, creating visual tension between the hero and supporting data. On desktop, the layout breaks into unequal columns: a wide left column (2/3) for the hero and trend chart, and a narrow right sidebar (1/3) for category breakdown and recent items. This mirrors the user's mental model: "how much total?" (left) vs "where did it go?" (right).

The visual interest comes from:
- Extreme size difference between hero (72px on mobile) and secondary metrics (16px)
- Tight clustering of category chips vs generous whitespace around hero
- Mix of card containers and inline elements (not everything boxed)
- Vertical rhythm that alternates dense and spacious sections

### Unique Element
**Category badges with spending amounts** appear as pill-shaped chips with subtle background colors derived from the teal accent. Instead of boring table rows, each category is a rounded badge showing "Lebensmittel €234.50" with a gentle hover lift effect. This makes the category breakdown feel less like accounting and more like visual organization - similar to tag clouds in note-taking apps. The badges use a 20px border radius (more than typical 8px) to feel distinctly softer.

---

## 3. Theme & Colors

### Font
- **Family:** Source Sans 3
- **URL:** `https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap`
- **Why this font:** Source Sans 3 is a professional, readable sans-serif with excellent weight range (300-700). It's distinctive enough to avoid the "generic Inter" look but remains highly legible for numbers and financial data. The thin weight (300) creates beautiful contrast for labels while the bold (700) makes euro amounts commanding.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 97%)` | `--background` |
| Main text | `hsl(25 15% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(25 15% 20%)` | `--card-foreground` |
| Borders | `hsl(40 15% 88%)` | `--border` |
| Primary action | `hsl(180 45% 35%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(180 40% 92%)` | `--accent` |
| Muted background | `hsl(40 20% 95%)` | `--muted` |
| Muted text | `hsl(25 8% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(145 50% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 55%)` | `--destructive` |

### Why These Colors
The warm cream background (hsl 40 25% 97%) creates a welcoming, paper-like feel - like a ledger or journal, but modern. It's not stark white, which would feel cold for financial data. The deep teal accent (hsl 180 45% 35%) adds professionalism and trust (financial associations) while remaining distinctive - it's not the overused blue of banking apps. The very light teal backgrounds for category badges create subtle visual grouping without overwhelming the page.

### Background Treatment
The background is a solid warm cream with no gradient or texture. This intentional simplicity lets the content breathe and keeps focus on the numbers. The warmth comes from the slight yellow undertone in the hsl(40...) base, creating a subtle but noticeable difference from pure white.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile creates dramatic visual hierarchy through size. The hero KPI dominates the entire first viewport (60% of screen height) with massive typography and generous whitespace. Secondary elements are intentionally compact and tightly grouped below, creating a clear "primary vs supporting" visual relationship. The layout flows vertically with distinct sections separated by whitespace, not borders.

### What Users See (Top to Bottom)

**Header:**
App title "Ausgabentracker" in 24px weight 600, left-aligned. Month selector (dropdown) in top-right showing current month. Clean, minimal header with 20px padding.

**Hero Section (The FIRST thing users see):**
- **What:** Total monthly expenses in euros
- **Size:** Takes up 60% of first viewport (approximately 400px height on standard phone)
- **Styling:**
  - Euro amount in 72px weight 700, deep foreground color
  - Label "Ausgaben diesen Monat" in 16px weight 300, muted color, positioned above number
  - Small trend indicator below: "↑ €45.20 vs. letzten Monat" in 14px muted text
  - Surrounded by 40px vertical padding (top and bottom) for breathing room
  - No card background - sits directly on cream background
- **Why:** Users open the app to answer "how much have I spent?" - this massive number answers immediately

**Section 2: Schnellstatistiken (Compact inline stats)**
- Horizontal row with 3 mini-stats (no cards, just inline text):
  - Anzahl Ausgaben: "23 Einträge"
  - Durchschnitt: "€42.30"
  - Höchste: "€156.00"
- Each stat: label in 12px weight 400 muted, value in 18px weight 600
- 8px gap between stats, 24px top margin from hero
- Creates density contrast with spacious hero above

**Section 3: Ausgaben nach Kategorie**
- Title "Nach Kategorie" in 18px weight 600, 32px top margin
- Category badges stacked vertically with 8px gaps:
  - Each badge: category name + amount, e.g. "Lebensmittel €234.50"
  - Pill shape (20px border radius), teal accent background
  - 14px weight 600 text, 12px vertical padding, 16px horizontal
  - Takes full width on mobile
- Shows top 5 categories by spending

**Section 4: Letzte Ausgaben**
- Title "Letzte Ausgaben" in 18px weight 600, 32px top margin
- Simple card list (not table):
  - Each expense card: white background, 12px border radius, 16px padding
  - Top line: Description (16px weight 600) + Amount (16px weight 700, right-aligned)
  - Bottom line: Category badge (small pill) + Date (14px muted)
  - 12px gap between cards
- Shows last 8 expenses

**Bottom Navigation / Action:**
- Fixed bottom button: "Neue Ausgabe erfassen"
- Full-width, 56px height (thumb-friendly)
- Primary teal color, white text, 16px weight 600
- Positioned 20px from screen bottom (thumb zone)
- Subtle shadow: `0 -2px 10px hsl(0 0% 0% / 0.1)`

### Mobile-Specific Adaptations
- Category badges stack vertically (not horizontal wrap) for easier tapping
- Recent expenses use cards instead of table rows
- Chart (if added later) would be simplified to show only last 7 days
- All content flows single-column, no side-by-side elements
- Nothing is hidden - all functionality available on mobile

### Touch Targets
- Category badges: minimum 44px height with full-width tap area
- Month selector: minimum 44px tap target
- Expense cards: full card tappable (minimum 60px height)
- Primary action button: 56px height, full width (easy thumb reach)

### Interactive Elements
- **Expense cards**: Tap to open detail sheet showing full description, notes, category, date, and receipt image (if available)
- **Category badges**: Tap to filter expenses by that category
- **Month selector**: Tap to open month picker

---

## 5. Desktop Layout

### Overall Structure
**Unequal two-column layout (2/3 left, 1/3 right)** with generous whitespace. The left column contains the hero KPI and trend chart (stacked vertically), creating a clear "big picture" area. The right sidebar contains category breakdown and recent expenses - the "details" column. The asymmetry creates visual flow: eye starts at large hero (top-left), flows down through chart, then right to categories and recent items.

Maximum width: 1400px, centered. 40px horizontal padding.

Visual interest comes from the dramatic width difference between columns (not 50/50 split) and the mix of large (hero) and compact (sidebar) elements.

### Section Layout

**Top area (full-width header):**
- App title on left, month selector on right
- 80px height, 32px vertical padding

**Main content area (2/3 width, left column):**
- Hero KPI: Same treatment as mobile but with horizontal layout
  - Label on left, number on right, trend below
  - 200px height with 48px padding
  - No background (sits on cream)
- Spending trend chart below hero (32px gap):
  - White card background, 16px border radius
  - 400px height
  - 24px padding
  - Line chart showing daily spending for current month

**Supporting area (1/3 width, right sidebar):**
- "Nach Kategorie" section at top:
  - Category badges in 2-column grid (not stacked)
  - 12px gap between badges
  - Each badge sized to content (not full-width)
- "Letzte Ausgaben" below (24px gap):
  - Compact list (not cards)
  - Simple rows with description + amount
  - 8px vertical padding per row
  - Shows last 10 items

**Column gap:** 32px between left and right columns

### What Appears on Hover
- **Category badges**: Slight lift effect (`translateY(-2px)`) and shadow increase
- **Expense rows**: Background changes to muted color, cursor becomes pointer
- **Primary action button**: Background darkens slightly
- **Month selector**: Background changes to accent color

### Clickable/Interactive Areas
- **Expense rows**: Click to open modal with full expense details (description, notes, category, date, receipt image preview)
- **Category badges**: Click to filter view to show only expenses in that category
- **Chart data points**: Hover shows exact daily total in tooltip

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Ausgaben diesen Monat"
- **Data source:** `ausgaben` app
- **Calculation:** Sum of all `betrag` (amount) fields where `datum` (date) falls within selected month
- **Display:**
  - Mobile: 72px bold euro amount centered with label above
  - Desktop: Horizontal layout with label on left, number on right
  - Format: "€1,234.56" with German number formatting
- **Context shown:**
  - Trend vs previous month: "↑ €45.20 vs. letzten Monat" (positive = red, negative = green)
  - Count: Small text showing "aus 23 Ausgaben"
- **Why this is the hero:** Users open the app specifically to check how much they've spent. This answers the primary question immediately.

### Secondary KPIs

**Anzahl Ausgaben (Number of Expenses)**
- Source: `ausgaben` app
- Calculation: Count of records where `datum` is in selected month
- Format: "23 Einträge"
- Display: Inline stat (mobile), small card (desktop)

**Durchschnittsausgabe (Average Expense)**
- Source: `ausgaben` app
- Calculation: Sum of `betrag` / count of records for selected month
- Format: "€42.30"
- Display: Inline stat (mobile), small card (desktop)

**Höchste Ausgabe (Highest Expense)**
- Source: `ausgaben` app
- Calculation: Maximum `betrag` value for selected month
- Format: "€156.00"
- Display: Inline stat (mobile), small card (desktop)

### Chart

- **Type:** Line chart - shows spending trend over time, helps users see daily patterns and spikes
- **Title:** "Ausgabenverlauf"
- **What question it answers:** "When did I spend the most? Are there patterns in my daily spending?"
- **Data source:** `ausgaben` app
- **X-axis:** `datum` field, grouped by day, format "1. Jan"
- **Y-axis:** Sum of `betrag` per day, format "€1,234"
- **Styling:** Smooth line with teal stroke (--primary), subtle area fill (teal at 10% opacity), dot markers on hover
- **Mobile simplification:** Show last 7 days only, smaller height (250px vs 400px), hide grid lines

### Lists/Tables

**Ausgaben nach Kategorie (Category Breakdown)**
- Purpose: Users need to see which categories consume most budget
- Source: `ausgaben` app, join with `kategorien` via `kategorie` applookup field
- Calculation: Group expenses by category, sum `betrag` for each
- Fields shown: Category name (from `kategorien.kategoriename`) + total amount
- Mobile style: Stacked pill badges, full-width
- Desktop style: 2-column grid of pill badges
- Sort: By total amount descending
- Limit: Top 8 categories

**Letzte Ausgaben (Recent Expenses)**
- Purpose: Quick access to recent transactions for review or editing
- Source: `ausgaben` app
- Fields shown:
  - `beschreibung` (description)
  - `betrag` (amount)
  - `kategorie` (category name from lookup)
  - `datum` (date, format "15. Jan")
- Mobile style: Card list with description + amount on top line, category badge + date on bottom
- Desktop style: Compact rows (description left, amount right, category + date below in muted text)
- Sort: By `datum` descending (newest first)
- Limit: Last 8 (mobile), last 10 (desktop)

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Ausgabe erfassen"
- **Action:** add_record (opens form modal/sheet)
- **Target app:** `ausgabe_erfassen` app (696f8229befaff34971e38ed)
- **What data:** Form contains:
  - `kategorie_auswahl` (category dropdown - applookup to kategorien)
  - `beschreibung_ausgabe` (text input)
  - `betrag_ausgabe` (number input with € prefix)
  - `datum_ausgabe` (date picker, default to today)
  - `beleg_upload` (optional file upload)
  - `notizen_ausgabe` (optional textarea)
- **Mobile position:** bottom_fixed (56px height, 20px from bottom, full-width)
- **Desktop position:** header (top-right corner, next to month selector)
- **Why this action:** Users log expenses multiple times per day - it's the primary interaction. Making it one-tap accessible removes friction from habit-building.

---

## 7. Visual Details

### Border Radius
- Cards: 12px (modern but not too rounded)
- Category badges: 20px (distinctly pill-shaped)
- Buttons: 8px (slightly rounded)
- Input fields: 6px (subtle)

### Shadows
- Cards: Subtle - `0 1px 3px hsl(0 0% 0% / 0.08)`
- Hover cards: Elevated - `0 4px 12px hsl(0 0% 0% / 0.12)`
- Bottom action button: `0 -2px 10px hsl(0 0% 0% / 0.1)` (upward shadow)
- No shadows on hero KPI (sits flat on background)

### Spacing
- Section vertical gaps: 32px (spacious)
- Card internal padding: 24px (desktop), 16px (mobile)
- Inline stats gap: 8px (compact)
- Category badges gap: 8px (compact)
- Expense list gap: 12px

### Animations
- **Page load:** Stagger - Hero fades in first (0ms), then secondary stats (100ms delay), then categories (200ms), then recent list (300ms)
- **Hover effects:**
  - Category badges: `transform: translateY(-2px)` with 200ms ease
  - Buttons: Background color transition 150ms
  - Expense rows: Background color transition 150ms
- **Tap feedback:**
  - Buttons: Scale down to 0.98 on active state
  - Cards: Subtle background darken on tap

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(40 25% 97%);
  --foreground: hsl(25 15% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(25 15% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(25 15% 20%);
  --primary: hsl(180 45% 35%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 20% 95%);
  --secondary-foreground: hsl(25 15% 20%);
  --muted: hsl(40 20% 95%);
  --muted-foreground: hsl(25 8% 50%);
  --accent: hsl(180 40% 92%);
  --accent-foreground: hsl(25 15% 20%);
  --destructive: hsl(0 65% 55%);
  --border: hsl(40 15% 88%);
  --input: hsl(40 15% 88%);
  --ring: hsl(180 45% 35%);
  --radius: 0.75rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5
- [ ] Hero element is prominent as described (72px on mobile, dramatic sizing)
- [ ] Colors create warm, approachable mood described in Section 2
- [ ] Category badges use 20px border radius (not default 8px)
- [ ] Primary action button fixed at bottom on mobile
- [ ] Month selector functional in header
- [ ] Interactive elements (expense details, category filtering) work as specified
