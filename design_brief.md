# Design Brief: Ausgabentracker

## 1. App Analysis

### What This App Does
This is an expense tracking dashboard ("Ausgabentracker") that helps users monitor their spending across different categories. Users can track expenses with amounts, dates, receipts, and categorization. The system maintains expense records with detailed notes and file attachments for receipts.

### Who Uses This
Personal finance managers, small business owners, or anyone tracking their daily/monthly expenses. These are people who want to see where their money goes, understand spending patterns, and maintain an organized record of purchases with supporting documentation.

### The ONE Thing Users Care About Most
**How much money have I spent this month?** Users want to immediately see their total monthly spending to understand if they're on track with their budget.

### Primary Actions (IMPORTANT!)
1. **Add New Expense** → Primary Action Button (most frequent action)
2. View expense details with receipt
3. Filter by category
4. Review monthly trends

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design uses a warm, trustworthy palette with a soft cream background (not harsh white) and rich terracotta accents. This creates a calm, grounded feeling that reduces the anxiety often associated with tracking finances. The warmth signals approachability - "this is helping you, not judging you." The large currency display at the top uses a distinctive slab serif for numbers that feels both modern and established, like reading a premium financial publication.

### Layout Strategy
**Asymmetric hero-driven layout** - The monthly total dominates the top section (60% of mobile viewport, large left column on desktop) using oversized typography and generous whitespace. This creates instant focus. Below, a category breakdown uses a horizontal scroll on mobile (unusual for dashboards, but feels more native-app-like) and an uneven 2-column grid on desktop. The "Recent Expenses" section uses minimal card styling - just subtle borders, no heavy shadows - letting the data breathe. The asymmetry creates natural visual flow from hero → categories → recent items.

### Unique Element
**The category breakdown uses colored vertical bars** (8px thick, rounded caps) next to category names, creating a distinctive visual rhythm that's instantly scannable. Each category gets a warm tone from the terracotta-to-amber spectrum, making the breakdown feel cohesive yet differentiated. On hover/tap, the bars grow slightly with a smooth spring animation, providing subtle feedback that feels premium.

---

## 3. Theme & Colors

### Font
- **Family:** Space Grotesk (headings) + IBM Plex Sans (body)
- **URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap`
- **Why this font:** Space Grotesk brings geometric precision perfect for numbers and data, while remaining warm and approachable. IBM Plex Sans provides excellent readability for body text with a technical-yet-friendly character that suits financial tracking.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 97%)` | `--background` |
| Main text | `hsl(25 15% 20%)` | `--foreground` |
| Card background | `hsl(40 30% 99%)` | `--card` |
| Card text | `hsl(25 15% 20%)` | `--card-foreground` |
| Borders | `hsl(40 20% 88%)` | `--border` |
| Primary action | `hsl(15 70% 55%)` | `--primary` |
| Text on primary | `hsl(40 30% 99%)` | `--primary-foreground` |
| Accent highlight | `hsl(35 80% 60%)` | `--accent` |
| Muted background | `hsl(40 20% 94%)` | `--muted` |
| Muted text | `hsl(25 10% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(145 60% 45%)` | (component use) |
| Error/negative | `hsl(0 70% 55%)` | `--destructive` |

### Why These Colors
The warm cream base (not stark white) creates a softer, more inviting experience. The terracotta primary color (#D96846) feels earthy and trustworthy - not the aggressive red of debt warnings, nor the clinical blue of banking apps. The amber accent adds brightness without harshness. Together, they create a "warm afternoon light" feeling that makes financial tracking feel less stressful.

### Background Treatment
The page background uses a subtle noise texture (5% opacity) overlaid on the cream base, creating a tactile, paper-like quality. This adds just enough texture to prevent the "flat digital" feeling while maintaining minimalism. The noise is barely perceptible but adds warmth.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is designed with a bold hero-first approach. The monthly total takes the entire first viewport, using massive typography (72px for the number) with breathing room, making the hero truly dominant. Below, categories use a horizontal scrolling row (not stacked cards), creating a more app-like, native feel. Visual interest comes from extreme size variation: hero is 6x larger than category cards.

### What Users See (Top to Bottom)

**Header:**
App title "Ausgaben" (18px, medium weight, muted color) aligned left, with a subtle settings icon (20px) aligned right. Minimal height (60px), fades slightly on scroll.

**Hero Section (The FIRST thing users see):**
**"Diesen Monat"** - The total monthly spending
- **What:** Large currency display showing total expenses for current month
- **Size:** Takes 55-60% of viewport height, centered vertically and horizontally
- **Styling:**
  - Label "Diesen Monat" (14px, uppercase, tracked, muted color, top)
  - Amount in huge bold Space Grotesk (72px, primary color for emphasis)
  - Small context text below: "23 Ausgaben" (12px, muted)
  - Subtle comparison: "↑ 12% vs. letzten Monat" (11px, accent color if up, success if down)
- **Why hero:** This is the single most important question users have - "How much have I spent?"

**Section 2: Nach Kategorie**
Horizontal scrolling row of category breakdown cards. Each card:
- Width: 140px, height: 100px, snap scroll
- Left edge colored vertical bar (8px, category color)
- Category name (14px, medium)
- Amount (24px, bold)
- Percentage of total (11px, muted)
Shows 4-5 categories, sorted by amount descending

**Section 3: Letzte Ausgaben**
Vertical list of recent expense items (latest 10):
- Minimal card style (just bottom border, no shadows)
- Each item shows: description (left), amount (right), date below (muted)
- Small category dot (6px) next to description
- Tap to expand full details
- "Alle anzeigen" link at bottom

**Bottom Navigation / Action:**
Fixed bottom button: "+ Ausgabe hinzufügen" (full-width, 56px height, primary color, slight shadow for elevation)

### Mobile-Specific Adaptations
Categories use horizontal scroll instead of stacking (more engaging, uses less vertical space). The hero section uses even larger typography on mobile because there's less competing for attention. Recent expenses show only essential fields (description, amount, date) - full details on tap.

### Touch Targets
All buttons minimum 44px height. Category cards are 100px tall for comfortable tapping. The primary action button is 56px tall, positioned in easy thumb reach at bottom.

### Interactive Elements
Tapping a recent expense expands an inline detail view showing full notes, receipt thumbnail (if exists), and category. Tapping a category card filters the "Recent Expenses" list to show only that category.

---

## 5. Desktop Layout

### Overall Structure
**Wide asymmetric 3-section layout:**
- **Left column (40%):** Hero section + monthly trend chart
- **Right column (60%):** Top: category breakdown (3-column grid), Bottom: recent expenses table
The eye goes: hero number (top-left) → categories (top-right) → chart (mid-left) → recent list (bottom-right)

Visual interest comes from the unequal column split and mixing large hero block with a tight grid layout.

### Section Layout

**Top area (full-width header):**
App title and date range selector (subtle dropdown for filtering by month)

**Left column (40% width):**
- Hero KPI: Monthly total (same styling as mobile but 64px font)
- Below: Line chart showing daily spending trend for the month (300px height)

**Right column (60% width):**
- Top half: Category breakdown in 3-column grid (equal columns)
  - Each category card: vertical colored bar on left, name, amount, % of total
  - 6-8 categories visible
- Bottom half: Recent expenses as a clean table
  - Columns: Date | Description | Category | Amount
  - Zebra striping (subtle muted background every other row)
  - 10 rows visible, scroll for more

**Bottom right corner:**
Primary action button positioned as a fixed element (bottom-right corner, 60px × 60px circle, FAB style)

### What Appears on Hover
- Category cards: colored bar expands from 8px to 12px width, slight background color fade-in
- Recent expense rows: background color becomes slightly more visible, receipt icon appears if available
- Chart data points: tooltip showing exact amount and date

### Clickable/Interactive Areas
- Clicking a category card filters the recent expenses table to show only that category (with clear filter indicator at top of table)
- Clicking an expense row opens a side panel (slides in from right) with full details including receipt image, all notes, edit/delete options
- Clicking chart data points highlights that specific expense in the table

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Diesen Monat"
- **Data source:** Ausgaben app
- **Calculation:** Sum of all `betrag` (amount) fields where `datum` is in current month (YYYY-MM format)
- **Display:** Extra-large number (72px mobile, 64px desktop) in Space Grotesk bold, terracotta color. Currency symbol (EUR) shown smaller (28px) as suffix.
- **Context shown:**
  - Count of expenses below number: "23 Ausgaben"
  - Comparison to previous month: "↑ 12% vs. letzten Monat" with arrow
- **Why this is the hero:** This is the single most critical metric - users open the app to see their monthly spending total. Everything else is context for this number.

### Secondary KPIs

**Durchschnitt pro Tag**
- Source: Ausgaben
- Calculation: Monthly total ÷ days in current month
- Format: currency (EUR)
- Display: Small card in category grid (desktop) or inline text below hero (mobile)

**Größte Ausgabe**
- Source: Ausgaben
- Calculation: Max `betrag` in current month
- Format: currency (EUR) with description
- Display: Small stat in muted text below hero

### Chart

- **Type:** Line chart with area fill - WHY: Shows spending trend over time, area fill helps visualize cumulative effect
- **Title:** "Tägliche Ausgaben"
- **What question it answers:** "When did I spend the most this month?" and "Is my spending accelerating or slowing?"
- **Data source:** Ausgaben app
- **X-axis:** `datum` field (date), label: "Tag"
- **Y-axis:** Sum of `betrag` per day, label: "EUR"
- **Mobile simplification:** Hidden on mobile (vertical space too precious, hero + categories tell the main story)
- **Styling:** Terracotta line (2px), light terracotta area fill (15% opacity), rounded line joins

### Lists/Tables

**Letzte Ausgaben (Recent Expenses)**
- **Purpose:** Quick scan of recent spending for memory/verification, spot-check for errors
- **Source:** Ausgaben app
- **Fields shown:**
  - Mobile: beschreibung, betrag, datum, kategorie (as colored dot)
  - Desktop: datum, beschreibung, kategorie (full name with colored bar), betrag
- **Mobile style:** Minimal cards (just bottom border separator)
- **Desktop style:** Clean table with zebra striping
- **Sort:** By `datum` descending (newest first)
- **Limit:** 10 items

**Nach Kategorie (Category Breakdown)**
- **Purpose:** Understand spending distribution across categories
- **Source:** Ausgaben app, grouped by `kategorie` field (applookup), joined with Kategorien app for names
- **Fields shown:** Category name (from Kategorien.kategoriename), total amount (sum of betrag), percentage of monthly total
- **Mobile style:** Horizontal scroll cards (140px wide)
- **Desktop style:** 3-column grid of cards
- **Sort:** By total amount descending
- **Limit:** Show all categories with expenses in current month

### Primary Action Button (REQUIRED!)

- **Label:** "+ Ausgabe hinzufügen"
- **Action:** `add_record` - Opens a form modal to create new expense
- **Target app:** Ausgaben
- **What data:** Form contains:
  - `beschreibung` (text input, required)
  - `betrag` (number input with EUR symbol, required)
  - `datum` (date picker, defaults to today)
  - `kategorie` (dropdown populated from Kategorien app records)
  - `notizen` (textarea, optional)
  - `beleg` (file upload, optional)
- **Mobile position:** `bottom_fixed` - Full-width button fixed to bottom of screen (56px height), always visible, slides up when modal opens
- **Desktop position:** `fab` - Floating action button in bottom-right corner (60px circle with + icon), opens centered modal
- **Why this action:** Adding expenses is the primary user workflow - users need quick access to log spending as it happens. This button should be one tap/click away at all times.

---

## 7. Visual Details

### Border Radius
Rounded (12px for cards, 8px for small elements like buttons, 16px for the FAB). Creates a friendly, modern feel without going full-pill.

### Shadows
Subtle for most elements:
- Cards: `0 1px 3px rgba(0,0,0,0.08)`
- Primary button: `0 4px 12px rgba(217,104,70,0.20)` (colored shadow for emphasis)
- FAB: `0 6px 16px rgba(0,0,0,0.12)` (more elevated)
- Hovering cards: shadow expands to `0 4px 8px rgba(0,0,0,0.12)`

### Spacing
Spacious - generous whitespace to reduce financial stress:
- Section gaps: 48px (desktop), 32px (mobile)
- Card padding: 24px
- Hero section: 64px vertical padding (mobile), creates breathing room

### Animations
- **Page load:** Stagger fade-in - hero appears first (100ms), then categories (150ms delay), then list (200ms delay)
- **Hover effects:**
  - Cards: smooth 200ms ease for shadow and scale (1.02x)
  - Category bars: spring animation (300ms) expanding width
  - Buttons: subtle lift (2px translate up)
- **Tap feedback:**
  - All tappable elements scale down to 0.98 on active state
  - Primary button shows ripple effect from tap point
  - Category cards: colored bar pulses briefly

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(40 25% 97%);
  --foreground: hsl(25 15% 20%);
  --card: hsl(40 30% 99%);
  --card-foreground: hsl(25 15% 20%);
  --popover: hsl(40 30% 99%);
  --popover-foreground: hsl(25 15% 20%);
  --primary: hsl(15 70% 55%);
  --primary-foreground: hsl(40 30% 99%);
  --secondary: hsl(40 20% 94%);
  --secondary-foreground: hsl(25 15% 20%);
  --muted: hsl(40 20% 94%);
  --muted-foreground: hsl(25 10% 50%);
  --accent: hsl(35 80% 60%);
  --accent-foreground: hsl(25 15% 20%);
  --destructive: hsl(0 70% 55%);
  --border: hsl(40 20% 88%);
  --input: hsl(40 20% 88%);
  --ring: hsl(15 70% 55%);
  --radius: 0.75rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Space Grotesk + IBM Plex Sans)
- [ ] All CSS variables copied exactly
- [ ] Background noise texture applied (subtle)
- [ ] Mobile layout matches Section 4 (hero dominates, horizontal scroll categories)
- [ ] Desktop layout matches Section 5 (40/60 asymmetric split)
- [ ] Hero element uses 72px font on mobile, 64px on desktop
- [ ] Category bars use colored vertical accent (8px, rounded)
- [ ] Colors create warm, trustworthy mood described in Section 2
- [ ] Primary action button positioned correctly (bottom-fixed mobile, FAB desktop)
- [ ] Chart hidden on mobile, visible on desktop
- [ ] All animations feel smooth and premium
