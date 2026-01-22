# Design Brief: Ausgabentracker

## 1. App Analysis

### What This App Does
This is a personal expense tracking application ("Ausgabentracker") that helps users record and monitor their spending. Users can log expenses with amounts, dates, categories, descriptions, notes, and attach receipts. Categories can be customized to organize spending (e.g., Groceries, Transport, Entertainment).

### Who Uses This
German-speaking individuals who want to track personal or household expenses. They are NOT tech-savvy - they want a simple, clear view of where their money is going without complex financial jargon or overwhelming charts.

### The ONE Thing Users Care About Most
**"Wie viel habe ich diesen Monat ausgegeben?"** (How much have I spent this month?)
Users open the app to instantly see their current month's total spending - this is the anchor point for all financial awareness.

### Primary Actions (IMPORTANT!)
1. **Ausgabe hinzufügen** → Primary Action Button - Users log expenses frequently, often immediately after a purchase
2. View spending by category to understand where money goes
3. Review recent expenses to verify logged items

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design uses a **warm, approachable aesthetic** with a soft ivory background and a rich teal accent color. This creates a sense of calm control over finances - not the cold, clinical blue of banking apps, but something more personal and inviting. The warmth says "this is YOUR money, not a corporation's spreadsheet."

### Layout Strategy
- **Hero dominance through scale**: The monthly total takes up significant vertical space with extremely large typography (72px on mobile), creating immediate visual hierarchy
- **Asymmetric layout on desktop**: 60/40 split with the hero and chart on the left, recent transactions on the right - this mirrors the natural reading flow (overview first, details second)
- **Visual interest through typography contrast**: Bold 72px hero number against 14px muted labels creates dramatic hierarchy
- **Breathing room**: Generous padding around the hero creates a "spotlight" effect

### Unique Element
**The category spending breakdown uses horizontal progress bars** with rounded ends that fill proportionally to category spend vs. total spend. Each bar uses a slightly different shade from a teal-to-sage gradient, creating a cohesive but visually interesting breakdown without needing a pie chart. The bars animate in on load with a subtle stagger effect.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a friendly, approachable character with slightly rounded terminals that softens the often-harsh world of finance. It's highly legible for numbers while maintaining warmth.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(45 30% 97%)` | `--background` |
| Main text | `hsl(200 25% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(200 25% 20%)` | `--card-foreground` |
| Borders | `hsl(45 15% 88%)` | `--border` |
| Primary action | `hsl(175 45% 35%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(175 35% 92%)` | `--accent` |
| Muted background | `hsl(45 20% 94%)` | `--muted` |
| Muted text | `hsl(200 10% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(160 50% 40%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The **warm ivory background** (slight yellow undertone) creates comfort and approachability. The **teal primary** is sophisticated but friendly - it's not the aggressive blue of corporate banking. The combination feels like a well-designed notebook or planner rather than enterprise software.

### Background Treatment
The background is a solid warm ivory (`hsl(45 30% 97%)`). Cards are pure white, creating subtle contrast that makes them "lift" off the page without needing heavy shadows.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
The hero KPI dominates the first viewport - users see their monthly total immediately with no scrolling required. Secondary information stacks vertically below. Visual interest comes from:
- Massive typography on the hero (72px)
- Horizontal category bars that contrast with the vertical card stack
- Generous whitespace around the hero creating a "spotlight" effect

### What Users See (Top to Bottom)

**Header:**
- Left: App title "Ausgabentracker" (18px, semibold)
- Right: Current month/year as pill badge (e.g., "Januar 2026")

**Hero Section (The FIRST thing users see):**
- Takes approximately 35% of viewport height
- Large label: "Ausgaben diesen Monat" (14px, muted, uppercase tracking)
- Giant number: "€ 1.234,56" (72px, bold, foreground color)
- Subtext showing comparison: "↑ 12% vs. letzter Monat" or "↓ 8% vs. letzter Monat" (14px, colored green/red accordingly)
- The number uses tabular figures for proper alignment
- Why this is the hero: This single number answers "how am I doing?" instantly

**Section 2: Kategorien-Übersicht (Category Breakdown)**
- Compact card with subtle shadow
- Title: "Nach Kategorie" (16px, semibold)
- Horizontal progress bars for top 4 categories
- Each bar shows: Category name, amount, visual bar
- Bar colors use teal gradient shades: `hsl(175 45% 35%)`, `hsl(175 40% 45%)`, `hsl(175 35% 55%)`, `hsl(175 30% 65%)`
- "Alle Kategorien" link at bottom if more than 4

**Section 3: Letzte Ausgaben (Recent Expenses)**
- Title: "Letzte Ausgaben" (16px, semibold)
- List of 5 most recent expenses
- Each item shows: Description (bold), Category pill, Amount (right-aligned), Date (muted, small)
- Simple dividers between items (no cards within cards)
- "Alle anzeigen" link at bottom

**Bottom Navigation / Action:**
- Fixed bottom button: "＋ Ausgabe hinzufügen" (full width, primary color, 56px height)
- 16px margin from edges, 16px margin from bottom (safe area aware)

### Mobile-Specific Adaptations
- Category chart hidden (bars only, no full chart)
- Transaction list limited to 5 items
- All horizontal layouts become vertical stacks

### Touch Targets
- Primary action button: 56px height
- List items: 56px minimum height for comfortable tapping
- Category bars: Not tappable (pure display)

### Interactive Elements
- Tapping a transaction in the list could show full details (description, notes, receipt) in a bottom sheet - but only if there's additional data to show

---

## 5. Desktop Layout

### Overall Structure
**Two-column asymmetric layout: 60% left / 40% right**

The eye flows: Hero total (top-left) → Monthly chart (below hero) → Recent transactions (right column)

Visual interest is created through:
- The size differential between hero and secondary elements
- The chart spanning the full left column width
- Right column cards stacked vertically with consistent spacing

### Section Layout

**Top area (full width):**
- Header bar with app title left, month selector right
- Subtle bottom border

**Left column (60%):**
- Hero KPI card (same design as mobile but with 96px number)
- Below hero: Area chart showing daily spending for current month
- Chart title: "Tägliche Ausgaben - Januar 2026"
- X-axis: Days of month (1, 5, 10, 15, 20, 25, 30)
- Y-axis: Euro amounts
- Area fill uses primary color at 20% opacity

**Right column (40%):**
- Card 1: "Nach Kategorie" - Horizontal bars (same as mobile)
- Card 2: "Letzte Ausgaben" - List of 8 most recent
- Primary action button at top of right column (not fixed)

### What Appears on Hover
- Transaction list items: Subtle background highlight
- Chart data points: Tooltip showing exact amount and date
- Category bars: Show percentage of total

### Clickable/Interactive Areas
- Transaction items: Click to expand inline with full details
- "Alle Kategorien" and "Alle anzeigen" links navigate to filtered views

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Ausgaben diesen Monat
- **Data source:** Ausgaben app
- **Calculation:** Sum of all `betrag` where `datum` is in current month
- **Display:** Massive number (72px mobile, 96px desktop), Euro currency format with German locale (€ 1.234,56)
- **Context shown:** Percentage change vs. previous month (green down arrow = good/less spending, red up arrow = more spending)
- **Why this is the hero:** Users want instant awareness of current spending level

### Secondary KPIs

**Anzahl Transaktionen (Transaction Count)**
- Source: Ausgaben app
- Calculation: Count of records where datum is in current month
- Format: Number
- Display: Shown as subtext below comparison percentage ("32 Transaktionen")

### Chart
- **Type:** Area chart - WHY: Shows spending pattern over time, area fill creates visual weight that emphasizes cumulative feeling of spending
- **Title:** Tägliche Ausgaben - [Monat Jahr]
- **What question it answers:** "When did I spend money this month?" - helps identify spending spikes
- **Data source:** Ausgaben app
- **X-axis:** Day of month (datum field, grouped by day)
- **Y-axis:** Sum of betrag per day (€)
- **Mobile simplification:** Chart is hidden on mobile - category bars provide simpler breakdown instead

### Lists/Tables

**Letzte Ausgaben (Recent Expenses)**
- Purpose: Quick verification of recent entries, spot-check accuracy
- Source: Ausgaben app
- Fields shown: beschreibung, kategorie (resolved to name), betrag, datum
- Mobile style: Simple list with dividers, 5 items
- Desktop style: Simple list with dividers, 8 items
- Sort: By datum descending (newest first)
- Limit: 5 mobile, 8 desktop

**Kategorien-Übersicht (Category Breakdown)**
- Purpose: Understand where money is going
- Source: Ausgaben app grouped by kategorie, joined to Kategorien for names
- Fields shown: Category name, total amount, percentage bar
- Mobile style: Horizontal progress bars
- Desktop style: Horizontal progress bars
- Sort: By total amount descending
- Limit: Top 4 categories (with "Alle" link for more)

### Primary Action Button (REQUIRED!)

- **Label:** "＋ Ausgabe hinzufügen"
- **Action:** add_record
- **Target app:** Ausgaben (app_id: 696f8228ac959abad478a05a)
- **What data:** Form with fields:
  - betrag (number, required) - "Betrag (EUR)"
  - beschreibung (text, required) - "Beschreibung"
  - kategorie (select from Kategorien) - "Kategorie"
  - datum (date, default today) - "Datum"
  - notizen (textarea, optional) - "Notizen"
- **Mobile position:** bottom_fixed
- **Desktop position:** top of right column (inline)
- **Why this action:** Users log expenses immediately after spending - this is the most frequent action by far

---

## 7. Visual Details

### Border Radius
Rounded (8px) - Friendly without being childish

### Shadows
Subtle - Cards use `0 1px 3px rgba(0,0,0,0.08)` - just enough to lift without feeling heavy

### Spacing
Spacious - 24px padding in cards, 16px gap between elements, 32px between major sections. The generous spacing creates calm.

### Animations
- **Page load:** Staggered fade-in (hero first, then cards top to bottom, 100ms stagger)
- **Hover effects:** Cards lift slightly (translateY -2px), subtle shadow increase
- **Tap feedback:** Buttons scale to 98% briefly

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(45 30% 97%);
  --foreground: hsl(200 25% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(200 25% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(200 25% 20%);
  --primary: hsl(175 45% 35%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(45 20% 94%);
  --secondary-foreground: hsl(200 25% 20%);
  --muted: hsl(45 20% 94%);
  --muted-foreground: hsl(200 10% 50%);
  --accent: hsl(175 35% 92%);
  --accent-foreground: hsl(175 45% 25%);
  --destructive: hsl(0 65% 50%);
  --border: hsl(45 15% 88%);
  --input: hsl(45 15% 88%);
  --ring: hsl(175 45% 35%);
  --radius: 0.5rem;
}
```

**Additional custom properties for this design:**

```css
:root {
  --success: hsl(160 50% 40%);
  --chart-primary: hsl(175 45% 35%);
  --chart-primary-light: hsl(175 45% 35% / 0.2);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero dominant, fixed bottom button)
- [ ] Desktop layout matches Section 5 (60/40 split, chart on left)
- [ ] Hero element is prominent as described (72px mobile, 96px desktop)
- [ ] Colors create the warm, approachable mood described in Section 2
- [ ] Category bars use gradient shades of primary color
- [ ] Area chart uses primary color at 20% opacity for fill
- [ ] German number formatting (€ 1.234,56)
- [ ] Month comparison shows correct arrow direction (down = good)
- [ ] Primary action button is fixed on mobile, inline on desktop
- [ ] Form for adding expense includes all specified fields
