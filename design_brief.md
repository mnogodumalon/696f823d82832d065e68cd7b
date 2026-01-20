# Design Brief: Ausgabentracker (Expense Tracker)

## 1. App Analysis

### What This App Does
This is an expense tracking dashboard that helps users monitor their spending across different categories. It displays expenses with amounts, dates, categories, and optional receipts. Users can see their total spending, spending by category, recent expenses, and trends over time.

### Who Uses This
Individuals or small business owners who want to keep track of their daily expenses, monitor spending patterns, and maintain financial awareness. They check the dashboard regularly (daily or weekly) to see where their money is going.

### The ONE Thing Users Care About Most
**How much have I spent recently?** Users want to immediately see their total spending for the current month and quickly understand if they're on track or overspending.

### Primary Actions (IMPORTANT!)
1. **Add new expense** → Primary Action Button (most common: logging daily expenses)
2. View recent expenses
3. Filter by category
4. Check monthly trends

---

## 2. What Makes This Design Distinctive

### Visual Identity
This expense tracker feels grounded and trustworthy through a warm, neutral color palette with sage green accents. Unlike typical financial apps that use stark blues and grays (creating anxiety), this design uses a cream-colored background with earthy tones that make budget tracking feel calm and approachable rather than stressful. The sage green accent color is deliberately chosen to feel natural and balanced—money management as a sustainable habit, not a restrictive chore.

### Layout Strategy
The hero element is the **monthly spending total** positioned prominently at the top, taking up significant vertical space with extra-large typography (64px on desktop, 48px on mobile) and generous whitespace. This creates an immediate focal point.

The layout is **intentionally asymmetric** on desktop with a 2:1 column split—the wide left column contains the hero KPI and spending trend chart (the narrative), while the narrow right column shows category breakdown and recent expenses (the details). This mirrors how users think: "How much did I spend?" (left) followed by "What did I spend it on?" (right).

Visual interest comes from **dramatic size variation**: the hero number dominates, secondary KPIs are medium-sized inline badges (not cards), and the category breakdown uses a compact vertical list with horizontal bars—three completely different treatments that create rhythm and prevent monotony.

### Unique Element
The spending trend chart uses a **thick area fill with gradient from sage green to transparent**, creating a soft, organic shape rather than harsh lines. The gradient gives depth and makes the financial data feel less clinical. Additionally, category spending bars use rounded caps and a subtle inner shadow, making them feel tactile and three-dimensional—like physical progress bars you could touch.

---

## 3. Theme & Colors

### Font
- **Family:** Space Grotesk
- **URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`
- **Why this font:** Space Grotesk has a technical, data-oriented feel with geometric proportions that work beautifully for numbers and financial data. Its slightly condensed letterforms allow large numbers to breathe without overwhelming the layout. The extreme weight range (300 to 700) creates strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 30% 97%)` | `--background` |
| Main text | `hsl(40 10% 15%)` | `--foreground` |
| Card background | `hsl(40 20% 99%)` | `--card` |
| Card text | `hsl(40 10% 15%)` | `--card-foreground` |
| Borders | `hsl(40 15% 88%)` | `--border` |
| Primary action | `hsl(145 25% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(145 30% 55%)` | `--accent` |
| Muted background | `hsl(40 20% 93%)` | `--muted` |
| Muted text | `hsl(40 8% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(145 25% 45%)` | (component use) |
| Error/negative | `hsl(5 70% 55%)` | `--destructive` |

### Why These Colors
The warm cream background (hsl(40 30% 97%)) creates a soft, paper-like quality—like a financial ledger but modern. The sage green primary (hsl(145 25% 45%)) is deliberately desaturated to feel sophisticated rather than "money green." This palette creates a calm, contemplative mood that encourages thoughtful spending review rather than panic.

### Background Treatment
The page background uses a subtle diagonal gradient overlay from `hsl(40 30% 97%)` at top-left to `hsl(40 25% 95%)` at bottom-right. This creates gentle depth and prevents the "flat white canvas" look while remaining minimal. The gradient is barely perceptible but adds warmth and directionality.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile creates visual hierarchy through extreme size contrast: the hero monthly total dominates the entire first viewport (taking 50% of screen height), with a massive 48px number. Everything else below is intentionally smaller, creating a clear "most important → less important" flow.

### What Users See (Top to Bottom)

**Header:**
Simple header with app title "Ausgabentracker" in 20px weight 500, left-aligned, with a subtle bottom border. 16px padding top/bottom. Clean and minimal.

**Hero Section (The FIRST thing users see):**
Full-width section with 32px padding, centered content:
- Small label "Ausgaben diesen Monat" in 14px weight 400, muted color
- Giant number showing total monthly spending in 48px weight 700, dark foreground color
- Format: "1.234,56 €" (German number format with Euro symbol)
- Small trend indicator below: "↑ 12% vs. Vormonat" in 12px with accent color for increase, muted for decrease
- Takes approximately 50% of viewport height with generous whitespace above/below the number
- Background: subtle card background with 16px border radius
- **Why this is the hero:** Users open the app asking "How much have I spent?" This answers immediately.

**Section 2: Quick Stats (Inline Badges)**
Horizontal row of 2 compact stat badges, equal width, 12px gap:
1. "Letzte 7 Tage" - amount in 18px weight 600
2. "Durchschnitt/Tag" - amount in 18px weight 600
- Each badge: 12px padding, muted background, rounded 8px, centered text
- NOT cards—inline badges for compactness

**Section 3: Ausgaben nach Kategorie**
Card with title "Nach Kategorie" (16px weight 600):
- Vertical list of category breakdowns (max 5 categories, sorted by amount descending)
- Each item: category name left, amount right, horizontal bar below showing percentage of total
- Bar: full width, 8px height, rounded caps, sage green fill with opacity based on percentage
- 12px spacing between items

**Section 4: Spending Trend Chart**
Card with title "Entwicklung" (16px weight 600):
- Simplified area chart showing last 30 days
- Mobile simplification: show every 5th day label, thinner stroke (2px), smaller height (200px)
- Gradient fill from accent to transparent

**Section 5: Letzte Ausgaben**
Card with title "Letzte Ausgaben" (16px weight 600):
- List of 5 most recent expenses, sorted by date descending
- Each as compact card:
  - Top row: description (14px weight 500) | amount (16px weight 600)
  - Bottom row: category badge (12px, muted background) | date (12px muted color)
- 8px spacing between expense cards

**Bottom Navigation / Action:**
**Fixed bottom action button** (sticky at bottom of viewport):
- Full-width button with 16px horizontal margin (creating "floating" effect)
- Label: "+ Neue Ausgabe"
- Sage green background, white text, 48px height (comfortable thumb target)
- 8px margin from bottom edge
- Slight shadow for elevation

### Mobile-Specific Adaptations
Content stacks vertically in single column. Chart is simplified with fewer data labels. All functionality remains visible—nothing hidden. Expense list limited to 5 items to prevent excessive scrolling, with "Alle anzeigen" link at bottom.

### Touch Targets
Primary action button: 48px height (comfortable thumb tap). Category items and expense cards: minimum 44px tap area. Chart: tap on data point shows exact value in tooltip.

### Interactive Elements (if applicable)
- Tap on category item → shows all expenses in that category (filtered view)
- Tap on expense card → opens detail view with description, notes, receipt image if available
- Tap on chart data point → shows exact amount for that day

---

## 5. Desktop Layout

### Overall Structure
Asymmetric 2-column layout with 2:1 width ratio (left column 66%, right column 33% with 24px gap):
- **Left column:** Hero KPI + Spending trend chart (the main narrative)
- **Right column:** Category breakdown + Recent expenses (supporting details)

The eye travels: (1) Hero number (top-left, largest element) → (2) Trend chart (directly below) → (3) Category breakdown (top-right) → (4) Recent expenses (bottom-right).

Visual interest comes from the dramatic width difference between columns and size variation—hero number is 64px, chart takes 400px height, while right column has compact, dense information.

### Section Layout

**Top Area (spans full width above columns):**
- Header with title "Ausgabentracker" (24px weight 600) on left
- Quick stats inline badges on right (same as mobile)
- 16px padding, subtle bottom border

**Main Content Area (2-column split):**

**Left Column (66% width):**
1. Hero KPI card (top):
   - 48px padding all around (generous whitespace)
   - "Ausgaben diesen Monat" label 16px weight 400 muted
   - Total amount 64px weight 700 dark
   - Trend indicator 14px with accent/muted color
   - Card background, 12px border radius, subtle shadow

2. Spending Trend Chart (below, 24px gap):
   - Title "Entwicklung (Letzte 30 Tage)" 20px weight 600
   - Area chart 400px height
   - Full data labels every 5 days
   - Gradient fill, rounded line caps
   - Card background, 12px border radius

**Right Column (33% width):**
1. Category Breakdown (top):
   - Title "Nach Kategorie" 18px weight 600
   - Vertical list of all categories with bars
   - Compact 8px spacing, 16px padding
   - Card background

2. Recent Expenses (below, 24px gap):
   - Title "Letzte Ausgaben" 18px weight 600
   - List of 8 most recent expenses
   - More compact than mobile (12px item padding)
   - Card background

**Primary Action Button:**
Positioned in top-right corner of header (next to quick stats):
- "+ Neue Ausgabe" button
- Sage green background, white text
- 40px height, 24px horizontal padding
- Rounded 8px, subtle hover lift effect

### What Appears on Hover
- **Expense cards:** Lift slightly (2px transform up) with stronger shadow
- **Category items:** Highlight background changes to muted, cursor pointer
- **Chart data points:** Tooltip appears showing exact amount and date
- **Primary action button:** Darkens slightly (hsl(145 25% 40%)) and lifts 1px

### Clickable/Interactive Areas (if applicable)
Same as mobile:
- Click category → filter to show only expenses in that category
- Click expense card → detail view with full info
- Click chart point → highlight that day's expenses below

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Ausgaben diesen Monat"
- **Data source:** Ausgaben app
- **Calculation:** Sum of all `betrag` values where `datum` is in current month (year-month match)
- **Display:** Large number (64px desktop, 48px mobile) in bold weight (700), dark foreground color. Format as German currency: "1.234,56 €"
- **Context shown:** Comparison to previous month as percentage increase/decrease. If increase: "↑ 12% vs. Vormonat" in accent color. If decrease: "↓ 8% vs. Vormonat" in muted color.
- **Why this is the hero:** This immediately answers "How much have I spent this month?"—the primary question users have when opening the app. It provides instant financial awareness.

### Secondary KPIs

**Last 7 Days Total**
- Source: Ausgaben app
- Calculation: Sum of `betrag` where `datum` is within last 7 days
- Format: German currency "234,50 €"
- Display: Inline badge, 18px weight 600, muted background

**Average Per Day**
- Source: Ausgaben app
- Calculation: Total monthly spending ÷ number of days in current month (so far)
- Format: German currency "45,20 €"
- Display: Inline badge, 18px weight 600, muted background

### Chart (if applicable)
- **Type:** Area chart (filled line) - **WHY:** Area charts show cumulative spending trend over time, making it easy to see if spending is accelerating or steady. The filled area emphasizes volume/magnitude of spending.
- **Title:** "Entwicklung (Letzte 30 Tage)"
- **What question it answers:** "Is my spending increasing, decreasing, or steady over time?"
- **Data source:** Ausgaben app
- **X-axis:** `datum` field, format as "DD.MM" for daily points over last 30 days, label "Datum"
- **Y-axis:** Cumulative sum of `betrag`, label "Betrag (EUR)"
- **Mobile simplification:** Reduced height (200px vs 400px), show every 5th day label instead of all labels, thinner stroke (2px vs 3px)
- **Styling:** Gradient fill from `hsl(145 30% 55% / 0.3)` at top to `hsl(145 30% 55% / 0.05)` at bottom. Stroke: 3px solid accent color with rounded line caps.

### Lists/Tables (if applicable)

**Category Breakdown (Nach Kategorie)**
- Purpose: Show which categories consume most of budget, enabling users to identify spending patterns
- Source: Join Ausgaben + Kategorien (via `kategorie` applookup field)
- Fields shown:
  - Category name (from Kategorien.kategoriename)
  - Total amount spent in that category (sum of Ausgaben.betrag where kategorie matches)
  - Percentage bar (visual representation of this category vs. total spending)
- Mobile style: Vertical list in card, each item with name left + amount right + percentage bar below
- Desktop style: Same as mobile (vertical list works well in narrow right column)
- Sort: By total amount descending (highest spending categories first)
- Limit: Show all categories on desktop, top 5 on mobile with "Alle anzeigen" link
- **Bar styling:** 8px height, rounded caps, sage green fill with opacity = (category total / grand total), subtle inner shadow

**Recent Expenses (Letzte Ausgaben)**
- Purpose: Quick access to recently logged expenses for review or editing
- Source: Ausgaben app
- Fields shown:
  - `beschreibung` (14px weight 500 on first line)
  - `betrag` (16px weight 600, right-aligned on first line)
  - `kategorie` (resolve via applookup, show as small badge 12px, muted background, second line left)
  - `datum` (format as "DD.MM.YYYY", 12px muted color, second line right)
- Mobile style: Compact cards, 2-line layout as described above, 8px spacing between cards
- Desktop style: Same but 12px padding (slightly tighter), show 8 items instead of 5
- Sort: By `datum` descending (most recent first)
- Limit: 5 items on mobile, 8 on desktop

### Primary Action Button (REQUIRED!)

- **Label:** "+ Neue Ausgabe"
- **Action:** add_record (opens inline form or dialog to create new expense)
- **Target app:** Ausgaben app
- **What data:** Form contains:
  - `datum`: Date picker (defaults to today)
  - `beschreibung`: Text input (required)
  - `betrag`: Number input with "EUR" suffix (required)
  - `kategorie`: Select dropdown populated from Kategorien app (optional)
  - `notizen`: Textarea (optional)
  - `beleg`: File upload for receipt image (optional)
- **Mobile position:** bottom_fixed (sticky button at bottom of screen, floats above content)
- **Desktop position:** header (top-right corner next to quick stats)
- **Why this action:** Adding a new expense is the most frequent user action (daily habit of logging spending as it happens). Making this one-tap accessible encourages consistent tracking, which is the core value of the app.

**Form behavior:**
On submit, call `LivingAppsService.createAusgabenEntry()` with form data, then refresh dashboard data to show new expense immediately. On success, show brief toast notification "Ausgabe gespeichert" and clear form for next entry.

---

## 7. Visual Details

### Border Radius
**rounded (8-12px range)**
- Cards: 12px
- Buttons: 8px
- Input fields: 8px
- Badges: 8px
- Category bars: 4px (rounded caps)

### Shadows
**subtle with elevation hierarchy**
- Default cards: `0 1px 3px hsl(40 10% 15% / 0.08)`
- Hero card: `0 2px 8px hsl(40 10% 15% / 0.10)` (slightly stronger)
- Hover state: `0 4px 12px hsl(40 10% 15% / 0.12)` (lifted)
- Bottom action button: `0 -2px 8px hsl(40 10% 15% / 0.10)` (upward shadow)

### Spacing
**normal with generous hero whitespace**
- Default card padding: 20px
- Hero card padding: 48px desktop, 32px mobile (extra breathing room)
- Section gaps: 24px desktop, 16px mobile
- List item spacing: 12px
- Inline element gaps: 8px

### Animations
- **Page load:** stagger (hero fades in first 0.2s, then sections stagger down with 0.1s delay each, total 0.5s)
- **Hover effects:**
  - Cards: transform translateY(-2px) with 0.2s ease
  - Buttons: darken background and lift 1px with 0.15s ease
  - Category bars: highlight with brightness(1.1) on 0.2s ease
- **Tap feedback:**
  - Buttons: scale(0.98) on active state
  - Cards: subtle background color change to muted
  - Chart points: pulse animation on tooltip appear

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(40 30% 97%);
  --foreground: hsl(40 10% 15%);
  --card: hsl(40 20% 99%);
  --card-foreground: hsl(40 10% 15%);
  --popover: hsl(40 20% 99%);
  --popover-foreground: hsl(40 10% 15%);
  --primary: hsl(145 25% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 20% 93%);
  --secondary-foreground: hsl(40 10% 15%);
  --muted: hsl(40 20% 93%);
  --muted-foreground: hsl(40 8% 45%);
  --accent: hsl(145 30% 55%);
  --accent-foreground: hsl(40 10% 15%);
  --destructive: hsl(5 70% 55%);
  --border: hsl(40 15% 88%);
  --input: hsl(40 15% 88%);
  --ring: hsl(145 25% 45%);
  --radius: 0.75rem;
}
```

**Additional custom properties for gradient:**
```css
:root {
  --gradient-from: hsl(40 30% 97%);
  --gradient-to: hsl(40 25% 95%);
  --chart-gradient-start: hsl(145 30% 55% / 0.3);
  --chart-gradient-end: hsl(145 30% 55% / 0.05);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Space Grotesk with weights 300,400,500,600,700)
- [ ] All CSS variables copied exactly into src/index.css
- [ ] Background gradient applied: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`
- [ ] Mobile layout matches Section 4 (single column, hero dominates, fixed bottom button)
- [ ] Desktop layout matches Section 5 (2:1 asymmetric columns, button in header)
- [ ] Hero element is 64px on desktop, 48px on mobile with generous padding
- [ ] Category bars use gradient fill and rounded caps as described
- [ ] Chart uses area fill with gradient from chart-gradient-start to chart-gradient-end
- [ ] All shadows applied with subtle elevation hierarchy
- [ ] Stagger animation on page load (hero first, then sections)
- [ ] Hover states work on all interactive elements
- [ ] Primary action button opens form that calls LivingAppsService.createAusgabenEntry()
- [ ] German number formatting used throughout ("1.234,56 €")
- [ ] Colors create warm, calm mood as described in Section 2
