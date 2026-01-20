# Design Brief: Ausgabentracker

## 1. App Analysis

### What This App Does
This is an expense tracking dashboard that helps users monitor their spending across different categories. Users can see their total expenses, spending breakdown by category, recent transactions, and trends over time to stay on top of their budget.

### Who Uses This
Personal finance users who want to track their daily expenses - individuals monitoring their spending habits, budgeting for monthly goals, or anyone who needs visibility into where their money goes.

### The ONE Thing Users Care About Most
**Total spending this month** - Users opening this app want to immediately know: "How much have I spent?" This is their budget pulse check.

### Primary Actions (IMPORTANT!)
1. **Add new expense** → Primary Action Button (most frequent action)
2. View expense details (see receipt, edit notes)
3. Filter by category or date range

---

## 2. What Makes This Design Distinctive

### Visual Identity
This design uses a warm, earthy palette with a sand-beige background and deep teal accent, creating a grounded, trustworthy feeling appropriate for financial tracking. The warmth counters the stress people often feel about money, while the teal accent adds a professional, calm confidence. Unlike harsh white dashboards, this feels like a personal journal.

### Layout Strategy
The layout is **intentionally asymmetric** with a dominant hero card that creates immediate visual focus. The hero (monthly total) takes roughly 40% of the viewport on desktop, using oversized typography (72px) and extra whitespace to make it impossible to miss. This asymmetry creates visual tension and flow - your eye is drawn to the big number first, then flows naturally down to supporting information.

Secondary elements use size variation (not uniform cards) - the category breakdown uses a compact horizontal scroll on mobile and a 2-column grid on desktop, while recent expenses use a simple list format (not cards) to reduce visual noise. This mix of formats prevents the "everything's a card" monotony.

### Unique Element
**The hero card uses a subtle gradient background** (sand-beige to slightly warmer cream) with a thick left border in the teal accent color. The monthly total number uses a sophisticated serif font (Source Serif 4) at 72px, contrasting sharply with the sans-serif UI font (Plus Jakarta Sans) used elsewhere. This serif-sans mix creates typographic tension that feels intentional and refined - like a high-end banking app, not a generic dashboard.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans (UI elements) + Source Serif 4 (hero numbers)
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&family=Source+Serif+4:wght@400;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans is modern and highly readable for UI text, with excellent weight variations for hierarchy. Source Serif 4 for hero numbers adds financial sophistication and makes large numbers feel important and authoritative. The serif-sans combination creates visual distinction that signals "this was designed intentionally."

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(38 30% 96%)` | `--background` |
| Main text | `hsl(20 10% 20%)` | `--foreground` |
| Card background | `hsl(40 40% 98%)` | `--card` |
| Card text | `hsl(20 10% 20%)` | `--card-foreground` |
| Borders | `hsl(38 20% 88%)` | `--border` |
| Primary action | `hsl(180 45% 35%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(180 45% 35%)` | `--accent` |
| Muted background | `hsl(38 20% 92%)` | `--muted` |
| Muted text | `hsl(20 8% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(142 40% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The warm sand-beige background (hsl 38 30% 96%) creates a calm, paper-like feeling - less clinical than white, more approachable. The deep teal primary (hsl 180 45% 35%) is sophisticated and trustworthy without being corporate-boring blue. This combination feels grounded and warm while maintaining professionalism - like a leather-bound expense journal, not a spreadsheet.

### Background Treatment
The main page background uses a subtle CSS gradient from `hsl(38 30% 96%)` to `hsl(38 25% 94%)` (top to bottom), creating very gentle depth. The hero card has its own gradient from `hsl(40 40% 98%)` to `hsl(42 35% 97%)` with a 4px thick left border in the teal accent. This layering of subtle gradients adds visual richness without being distracting.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile layout creates hierarchy through extreme size variation. The hero card dominates the first viewport (takes 50% of screen height on initial load), using 56px serif numbers that command attention. Below it, category chips use horizontal scroll (compact, thumb-friendly), and recent expenses use a clean vertical list with generous tap targets (minimum 48px height).

### What Users See (Top to Bottom)

**Header:**
Sticky header with "Ausgabentracker" title (20px, semibold) on left, filter icon on right. Background matches page background with subtle bottom border. Height: 56px.

**Hero Section (The FIRST thing users see):**
**Monthly Total Card** - Takes approximately 50% of viewport height on load.
- Display: "Diesen Monat" label (14px, muted color, regular weight)
- Main number: "1.234,56 €" (56px, Source Serif 4 Bold, teal accent color)
- Trend indicator: "↓ 12% vs. letzten Monat" (13px, success green, below number)
- Styling: White card with gradient background, 4px teal left border, 16px border-radius, generous padding (24px vertical, 20px horizontal)
- Why this is the hero: This answers the user's primary question instantly - "How much have I spent this month?" The large serif number feels significant and demands attention. The trend provides immediate context without cluttering.

**Section 2: Category Breakdown**
- Label: "Nach Kategorie" (16px, semibold, margin-bottom: 12px)
- Display: Horizontal scrolling row of category chips
- Each chip: Icon + category name + amount (e.g., "🍔 Essen 345 €")
- Chip style: Muted background, 12px border-radius, compact padding (8px 12px), 14px text
- Shows top 5 categories, scrollable
- Why here: After seeing the total, users want to know "Where did it go?" This compact format shows multiple categories without taking vertical space.

**Section 3: Recent Expenses**
- Label: "Letzte Ausgaben" (16px, semibold, margin-bottom: 12px)
- Display: Vertical list (NOT cards - clean list items)
- Each item:
  - Left: Description (14px, semibold) + Category badge (12px, muted)
  - Right: Amount (16px, semibold) + Date (12px, muted)
  - Divider between items
  - Min height: 64px for comfortable tapping
- Shows latest 10 expenses
- Why here: After overview (total + categories), users want to see actual transactions to verify or recall what they spent on.

**Bottom Navigation / Action:**
**Fixed bottom button** - "Ausgabe hinzufügen" - Full width minus 16px side margins, 56px height, teal background, white text, 12px border-radius, positioned 16px from bottom with safe-area-inset padding. Stays fixed while scrolling (z-index: 50).

### Mobile-Specific Adaptations
Content stacks vertically with clear section spacing (24px between sections). Hero card uses larger padding on mobile (24px) to create breathing room. Category chips scroll horizontally to avoid vertical cramping. Recent expenses list uses larger touch targets (64px min height) versus desktop's more compact rows.

### Touch Targets
All interactive elements minimum 48px height. The bottom action button is 56px for extra comfort. Category chips are 36px height (acceptable for secondary actions). Each expense list item is 64px for easy tapping.

### Interactive Elements
- Tapping an expense item opens a detail modal showing: full description, category, amount, date, receipt image (if available), notes
- Tapping a category chip filters the recent expenses list to show only that category
- Tapping the filter icon in header opens date range selector

---

## 5. Desktop Layout

### Overall Structure
**Two-column layout with asymmetric widths:**
- Left column: 65% width (hero + chart + recent expenses)
- Right column: 35% width (category breakdown + quick stats)

The eye follows an F-pattern: hero (top-left) → category column (right) → chart (mid-left) → recent expenses (bottom-left).

Visual interest comes from the size dominance of the hero card (takes full width of left column), contrasting with the stacked, compact elements in the right column.

### Section Layout

**Top area:**
- Left (65%): Hero card - Monthly total with same gradient treatment as mobile, but larger numbers (72px)
- Right (35%): Quick stats stack
  - "Durchschnitt/Tag" (average per day this month)
  - "Anzahl Ausgaben" (count of expenses)
  - Each stat: compact card, 32px numbers, 12px label

**Main content area:**
- Left (65%):
  - Spending trend chart (line chart showing daily totals for last 30 days)
  - Recent expenses list (table format - 5 columns: Datum, Beschreibung, Kategorie, Betrag, Actions)
- Right (35%):
  - Category breakdown (vertical list, NOT horizontal scroll)
  - Each category: name, icon, bar showing percentage of total, amount

**Proportions:**
Container max-width: 1400px, centered. Gap between columns: 24px. Sections within columns: 20px vertical spacing.

### What Appears on Hover
- Expense list rows: subtle background change to muted color, "Details anzeigen" link fades in on right
- Category bars: show exact percentage tooltip
- Chart data points: tooltip showing exact date and amount
- Action button: slight darkening of teal background

### Clickable/Interactive Areas
- Clicking an expense row opens the same detail modal as mobile
- Clicking a category in the right column filters the expenses list
- Clicking chart data points does NOT open anything (chart is for visualization only)
- Clicking "Details anzeigen" link on hover opens expense detail modal

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Diesen Monat" (This Month)
- **Data source:** "ausgaben" app
- **Calculation:** Sum of `betrag` field where `datum` is in current month (YYYY-MM format)
- **Display:** Large serif number (72px desktop / 56px mobile, Source Serif 4 Bold) in teal accent color, centered in gradient card with 4px thick left border
- **Context shown:**
  - Comparison to previous month as percentage change (e.g., "↓ 12% vs. letzten Monat")
  - Green if spending decreased, red if increased
- **Why this is the hero:** This is the primary question users have when opening the app - "How much have I spent this month?" It's the budget pulse check that determines their financial peace of mind.

### Secondary KPIs

**Durchschnitt pro Tag (Average per Day)**
- Source: ausgaben app
- Calculation: Sum of current month `betrag` / number of days elapsed in current month
- Format: currency (EUR)
- Display: Compact card in right column (desktop) / inline badge under hero (mobile), 32px number, 12px muted label

**Anzahl Ausgaben (Number of Expenses)**
- Source: ausgaben app
- Calculation: Count of records where `datum` is in current month
- Format: number
- Display: Compact card in right column (desktop) / inline badge under hero (mobile), 32px number, 12px muted label

### Chart

- **Type:** Line chart with area fill (shows trend AND magnitude)
- **Title:** "Ausgaben Trend (30 Tage)"
- **What question it answers:** "Am I spending more or less over time?" Users can spot patterns (e.g., weekend spending spikes)
- **Data source:** ausgaben app
- **X-axis:** `datum` field, grouped by day, showing last 30 days, label format: "DD. MMM" (e.g., "15. Jan")
- **Y-axis:** Sum of `betrag` per day, label: "EUR", starts at 0
- **Mobile simplification:** Shows last 14 days instead of 30, smaller height (200px vs 300px), fewer x-axis labels (every 3rd day)
- **Styling:** Teal line (2px), light teal area fill (20% opacity), white background, subtle grid lines

### Lists/Tables

**Recent Expenses List**

- **Purpose:** Shows actual transactions so users can verify spending and recall what they bought
- **Source:** ausgaben app
- **Fields shown:**
  - Mobile: `beschreibung`, `betrag`, `datum`, category name (via `kategorie` lookup)
  - Desktop: All above plus `notizen` preview (first 40 chars), "Details" action link
- **Mobile style:** Clean vertical list with dividers, left-aligned description/category, right-aligned amount/date
- **Desktop style:** Table with 5 columns (Datum | Beschreibung | Kategorie | Betrag | Actions)
- **Sort:** By `datum` descending (newest first)
- **Limit:** 10 most recent expenses

**Category Breakdown**

- **Purpose:** Shows spending distribution to help users identify their biggest expense areas
- **Source:** ausgaben app (aggregated) + kategorien app (for category names)
- **Fields shown:** Category name (from kategorien lookup), total amount, percentage of total
- **Mobile style:** Horizontal scrolling chips showing "Icon + Name + Amount"
- **Desktop style:** Vertical list in right column, each row shows: category name, horizontal bar (width = percentage), amount
- **Sort:** By total amount descending (highest spending first)
- **Limit:** Top 10 categories

### Primary Action Button (REQUIRED!)

- **Label:** "Ausgabe hinzufügen" (Add Expense)
- **Action:** add_record (opens form modal to create new expense record)
- **Target app:** "ausgaben" app (app_id: 696f8228ac959abad478a05a)
- **What data:** Form fields:
  - `beschreibung` (text input, required, placeholder: "z.B. Mittagessen")
  - `betrag` (number input, required, placeholder: "0,00", suffix: "€")
  - `datum` (date picker, defaults to today, format: YYYY-MM-DD)
  - `kategorie` (select dropdown, populated from kategorien app, required)
  - `notizen` (textarea, optional, placeholder: "Notizen...")
  - `beleg` (file upload, optional, accept: "image/*,application/pdf")
- **Mobile position:** bottom_fixed (56px height, full width minus margins, 16px from bottom with safe-area padding)
- **Desktop position:** header (top-right corner, standard button size)
- **Why this action:** Adding expenses is the most frequent action users take. Every time they buy something, they need to log it. Making this one tap away on mobile (thumb-reachable at bottom) and one click on desktop (top-right convention) removes friction from expense tracking.

---

## 7. Visual Details

### Border Radius
- Cards: 16px (rounded, modern but not pill-shaped)
- Buttons: 12px (slightly rounder for friendly feel)
- Chips/badges: 8px (more subtle)
- Input fields: 8px (consistent with badges)

### Shadows
Subtle elevation:
- Cards: `0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08)`
- Hero card: Slightly elevated: `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)`
- Buttons on hover: `0 4px 8px rgba(0, 0, 0, 0.12)`
- Modal: `0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)`

### Spacing
Normal to spacious:
- Section spacing: 24px (clear separation)
- Card internal padding: 20px mobile / 24px desktop
- Hero card internal padding: 24px mobile / 32px desktop (extra breathing room)
- List item padding: 16px vertical, 20px horizontal
- Gap between columns: 24px

### Animations
- **Page load:** Subtle stagger - hero fades in first (100ms delay), then categories (200ms), then chart (300ms), then list (400ms). Each fade-in uses `opacity 0 → 1` with ease-out timing.
- **Hover effects:**
  - Buttons: background darkens 10%, shadow increases (150ms transition)
  - List rows: background changes to muted color (100ms transition)
  - Chart points: scale up 1.2x, tooltip fades in (200ms)
- **Tap feedback:** Mobile buttons: scale down to 0.97 on touch, spring back on release (200ms spring animation)
- **Modal open:** Slide up from bottom on mobile (300ms ease-out), fade + scale on desktop (200ms)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(38 30% 96%);
  --foreground: hsl(20 10% 20%);
  --card: hsl(40 40% 98%);
  --card-foreground: hsl(20 10% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(20 10% 20%);
  --primary: hsl(180 45% 35%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(38 20% 92%);
  --secondary-foreground: hsl(20 10% 20%);
  --muted: hsl(38 20% 92%);
  --muted-foreground: hsl(20 8% 50%);
  --accent: hsl(180 45% 35%);
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 65% 50%);
  --destructive-foreground: hsl(0 0% 100%);
  --border: hsl(38 20% 88%);
  --input: hsl(38 20% 88%);
  --ring: hsl(180 45% 35%);
  --radius: 1rem;
}
```

Additional custom properties for gradients:

```css
:root {
  --gradient-page: linear-gradient(to bottom, hsl(38 30% 96%), hsl(38 25% 94%));
  --gradient-hero: linear-gradient(to bottom, hsl(40 40% 98%), hsl(42 35% 97%));
  --accent-border: 4px solid hsl(180 45% 35%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (both Plus Jakarta Sans and Source Serif 4)
- [ ] All CSS variables copied exactly
- [ ] Page background uses subtle gradient (--gradient-page)
- [ ] Hero card uses gradient background (--gradient-hero) with 4px left border in teal
- [ ] Hero number uses Source Serif 4 at 72px (desktop) / 56px (mobile) in teal color
- [ ] Mobile layout matches Section 4 - hero dominates viewport, categories scroll horizontally, fixed bottom button
- [ ] Desktop layout matches Section 5 - 65/35 column split, hero in top-left
- [ ] Primary action button is fixed at bottom on mobile, in header on desktop
- [ ] All shadows and border-radius values match Section 7
- [ ] Category breakdown shows horizontal bars on desktop
- [ ] Chart shows last 30 days on desktop, 14 days on mobile
- [ ] Recent expenses limit to 10 items
- [ ] Form modal includes all fields specified in Primary Action Button section
