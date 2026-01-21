# Design Brief: Ausgabentracker (Expense Tracker)

## 1. App Analysis

### What This App Does
This is an expense tracking application where users log their purchases, categorize them, and track spending over time. It helps users understand where their money goes by organizing expenses into categories (Lebensmittel, Transport, Unterhaltung, etc.) and providing visual insights into spending patterns.

### Who Uses This
Individuals who want to gain control over their personal finances. They might be trying to save money, understand spending habits, or simply stay organized. They're not accountants - they just want a quick, clear view of "Where did my money go?" and the ability to quickly log new expenses as they happen.

### The ONE Thing Users Care About Most
**How much have I spent this month?** This is the first question on their mind when opening the app. The total monthly spending needs to be immediately visible, large, and impossible to miss. Everything else (category breakdowns, recent expenses) supports this primary insight.

### Primary Actions (IMPORTANT!)
1. **Log new expense** → Primary Action Button (Most frequent: capturing receipts right after purchase)
2. View category breakdown (to understand patterns)
3. Review recent expenses (to verify or recall transactions)

This dashboard is NOT read-only - users actively log expenses throughout the day!

---

## 2. What Makes This Design Distinctive

### Visual Identity
This design uses a warm, organic color scheme that makes financial tracking feel less stressful and more approachable. The terracotta accent color (instead of corporate blue or aggressive red) creates a grounded, earthy atmosphere - money management should feel calm, not anxiety-inducing. The use of **Source Serif 4** for large numbers gives financial data a sense of authority and trustworthiness (like a quality newspaper's financial section), while remaining modern and readable.

### Layout Strategy
The layout creates drama through extreme size contrast. The hero element (monthly total) occupies a massive card that dominates the top of the screen - roughly 3x larger than any other element. This isn't just "bigger," it's DRAMATICALLY bigger, making the monthly total feel like the sun in a solar system of supporting data.

On desktop, the layout uses asymmetry: a dominant left column (60% width) contains the hero and spending chart, while a narrower right column (40%) shows the category breakdown. This creates visual tension and guides the eye naturally from hero → chart → categories → recent expenses.

Visual interest comes from:
- Extreme size variation (hero card vs. secondary cards)
- Mixing serif numbers (hero) with sans-serif UI text
- Alternating between card containers and inline list items
- Using the warm terracotta accent sparingly (only on the hero and primary button)

### Unique Element
The hero KPI card has a subtle warm gradient background (cream to pale terracotta) that makes it feel physically elevated from the rest of the page. Combined with the large serif number and generous padding, it feels like a piece of premium stationery - something you'd want to frame. The €999.99 display uses a large serif font (Source Serif 4, 48px weight 700) that makes the financial number feel authoritative yet approachable.

---

## 3. Theme & Colors

### Font
- **Family:** Source Serif 4 (for large numbers only) + Manrope (for UI text)
- **URL:** `https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@300;400;700&family=Manrope:wght@400;500;600;700&display=swap`
- **Why these fonts:** Source Serif 4 gives financial numbers a sense of gravitas and trustworthiness (like quality financial publications), while Manrope provides clean, modern UI text that doesn't compete for attention. This combination creates hierarchy: serif = important numbers, sans-serif = everything else.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(30 25% 97%)` | `--background` |
| Main text | `hsl(25 15% 25%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(25 15% 25%)` | `--card-foreground` |
| Borders | `hsl(30 15% 88%)` | `--border` |
| Primary action | `hsl(15 60% 55%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(15 60% 55%)` | `--accent` |
| Muted background | `hsl(30 20% 94%)` | `--muted` |
| Muted text | `hsl(25 10% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(145 60% 45%)` | (component use) |
| Error/negative | `hsl(0 70% 55%)` | `--destructive` |

Additional colors for implementation:
- `--popover`: `hsl(0 0% 100%)`
- `--popover-foreground`: `hsl(25 15% 25%)`
- `--secondary`: `hsl(30 20% 94%)`
- `--secondary-foreground`: `hsl(25 15% 25%)`
- `--accent-foreground`: `hsl(0 0% 100%)`
- `--input`: `hsl(30 15% 88%)`
- `--ring`: `hsl(15 60% 55%)`

### Why These Colors
The warm cream background (`hsl(30 25% 97%)`) creates a welcoming, less clinical feeling than stark white. The terracotta primary color (`hsl(15 60% 55%)`) is earthy and calming - it's associated with stability and warmth rather than danger or urgency. This palette says "you're in control" rather than "you're in debt panic." The dark brown text (`hsl(25 15% 25%)`) provides excellent contrast while maintaining the warm, organic feel.

### Background Treatment
The page background is a warm off-white with subtle cream undertones. Cards sit on this background in pure white, creating subtle depth without harsh shadows. The hero card has a barely-visible linear gradient from cream to pale terracotta (5% opacity) that makes it feel warm and inviting.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile prioritizes the hero element dramatically - it takes up roughly 50% of the first viewport, making the monthly total impossible to miss. Visual hierarchy is created through extreme size differences: the hero number is 40px, while secondary KPIs are 24px, and list items are 14px. This creates clear scanning levels.

### What Users See (Top to Bottom)

**Header:**
Clean, minimal header with "Ausgabentracker" in Manrope 600 (20px) on the left, and the month selector on the right. No clutter, just essential context.

**Hero Section (The FIRST thing users see):**
A large white card with subtle shadow that dominates the screen. Inside:
- "Ausgaben dieses Monat" label (14px, muted)
- The total amount in **Source Serif 4, 40px, weight 700** in dark brown
- Small trend indicator below ("+12% vs. letzter Monat" in 12px)
- Takes roughly 45-50% of viewport height
- Generous padding (24px) creates breathing room
- Very subtle gradient background (cream to pale terracotta, 5% opacity)

**Why this is the hero:** Users open this app to answer one question: "How much have I spent?" This answers it immediately and unmissably.

**Section 2: Quick Category Overview**
Compact horizontal scrollable row of category pills showing top 3 categories:
- Each pill: icon + category name + amount
- Inline badges, NOT cards (more space-efficient)
- Allows quick scanning without vertical scroll
- 16px height per pill

**Section 3: Spending Trend Chart**
White card containing a simple line chart showing last 7 days of spending:
- Clean, minimal axis labels
- Single terracotta line with area fill
- Mobile-optimized: 7 data points max, larger touch targets
- Shows spending pattern at a glance

**Section 4: Recent Expenses List**
Simple card list of last 5 expenses:
- Each item: Category icon (left) | Description + Category name | Amount (right)
- Clean, scannable layout
- 14px text, amounts in semibold
- Tap to view full details

**Bottom Navigation / Action:**
Fixed bottom action button (sticky, always visible):
- "Ausgabe hinzufügen" button in terracotta
- Full width with safe area padding
- 56px height (comfortable thumb target)
- Positioned in thumb zone for right-handed users

### Mobile-Specific Adaptations
- Hero card is proportionally MUCH larger on mobile (50% viewport vs 30% on desktop)
- Category overview becomes horizontal scroll instead of grid
- Chart shows 7 days instead of 30 (simplified for small screen)
- Recent expenses limited to 5 items instead of 10
- Category breakdown is accessed via tap on the scrollable pills (not always visible)

### Touch Targets
All interactive elements minimum 44px tap target:
- List items: 60px height
- Bottom button: 56px height
- Category pills: 48px height
- Month selector: 44px minimum

### Interactive Elements
- Tap on category pills → opens bottom sheet with full category breakdown
- Tap on expense list item → opens detailed view with receipt image, notes
- Swipe left on expense item → quick delete action

---

## 5. Desktop Layout

### Overall Structure
The desktop layout uses an asymmetric two-column grid to create visual interest and natural reading flow:
- **Left column (60% width):** Hero card + Spending chart (stacked vertically)
- **Right column (40% width):** Category breakdown + Recent expenses

The eye naturally flows: Hero (top-left, largest) → Chart (below hero) → Categories (top-right) → Recent expenses (bottom-right).

Visual interest comes from the unequal column widths and the dramatic size difference between the hero card and everything else. The hero is roughly 3x larger than any secondary element.

### Section Layout

**Top Area:**
Clean header with "Ausgabentracker" (left), month selector (center), and optional date range picker (right).

**Main Content Area (Two columns):**

*Left Column (60%):*
1. **Hero Card (top):**
   - Large white card with subtle gradient background
   - Takes full column width
   - 200px height
   - Contains monthly total in 48px Source Serif 4
   - Prominent but not overwhelming

2. **Spending Trend Chart (below hero):**
   - Full column width
   - 320px height
   - White card with 30-day line chart
   - Shows daily spending pattern

*Right Column (40%):*
1. **Category Breakdown (top):**
   - Stacked cards or inline list
   - Each category: icon + name + amount + percentage bar
   - 8-10 categories visible without scroll
   - More compact than hero but clearly readable

2. **Recent Expenses (below categories):**
   - Clean table or card list
   - Columns: Date | Description | Category | Amount
   - Last 10 expenses
   - Alternating row backgrounds for scannability

### What Appears on Hover
- **Hero card:** No change (it's just data display)
- **Chart data points:** Tooltip showing exact amount and date
- **Category items:** Highlight row, show "Click for details" hint
- **Expense list items:** Subtle background color change, show receipt icon if available

### Clickable/Interactive Areas
- **Category items:** Click to filter chart by that category
- **Expense list items:** Click to open detail modal with full info, receipt image, notes, edit/delete options
- **Chart bars/lines:** Click data point to see all expenses from that day

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Ausgaben dieses Monat" (Expenses This Month)
- **Data source:** "ausgaben" app
- **Calculation:** Sum of all `betrag` (amount) fields where `datum` (date) is in current month
- **Display:** Large currency number in Source Serif 4, 48px weight 700, dark brown color. Format: €1,234.56 with proper locale formatting. Displayed in a card with subtle cream-to-terracotta gradient background (5% opacity) and generous padding (32px).
- **Context shown:** Below the main number, show comparison to last month: "+12% vs. letzter Monat" in 12px muted text with small trend arrow icon
- **Why this is the hero:** Users open this dashboard to immediately answer "How much have I spent this month?" This is the primary question driving all financial awareness. Everything else (categories, trends, individual expenses) exists to explain THIS number.

### Secondary KPIs

**Average Daily Spending**
- Source: ausgaben app
- Calculation: Sum of current month `betrag` / number of days elapsed in month
- Format: currency (€X.XX/Tag)
- Display: Small white card, 18px semibold number, positioned below hero or in right column

**Number of Transactions**
- Source: ausgaben app
- Calculation: Count of records in current month
- Format: number with label ("15 Ausgaben")
- Display: Inline text or small card, 16px regular

**Top Spending Category**
- Source: ausgaben app with kategorie lookup
- Calculation: Group by kategorie, sum betrag, show highest
- Format: Category name + amount
- Display: Highlighted in category breakdown section

### Chart

- **Type:** Area chart (line with fill) - Shows continuous trend over time which is intuitive for spending patterns. Area fill emphasizes total accumulation.
- **Title:** "Ausgaben Verlauf" (Spending Trend)
- **What question it answers:** "Is my spending increasing, decreasing, or stable?" and "When do I spend the most?" Users need to see patterns - do they overspend on weekends? At month-end? This visualization reveals habits.
- **Data source:** ausgaben app
- **X-axis:** `datum` field, formatted as "1. Jan" for daily view
- **Y-axis:** Sum of `betrag` per day, formatted as "€XXX"
- **Styling:** Terracotta line (2px width) with 20% opacity terracotta area fill, subtle grid lines
- **Mobile simplification:** Show only last 7 days instead of 30, larger touch points, simplified axis labels (just day numbers, not dates)

### Lists/Tables

**Recent Expenses List**
- Purpose: Quick verification of recent transactions and easy access to edit/delete
- Source: ausgaben app with kategorie lookup for category names
- Fields shown:
  - datum (formatted as "Heute", "Gestern", or "15. Jan")
  - beschreibung (description text)
  - kategorie name (from lookup, with icon)
  - betrag (amount in bold)
- Mobile style: Card list, each item 60px height, icon left, amount right, description and category stacked in middle
- Desktop style: Clean table with columns: Date | Description | Category | Amount. Alternating row backgrounds for scannability.
- Sort: Most recent first (datum DESC)
- Limit: 5 items on mobile, 10 on desktop
- Hover: Show receipt icon if beleg field is not null

**Category Breakdown List**
- Purpose: Understanding which categories consume the most budget
- Source: ausgaben app grouped by kategorie
- Fields shown:
  - Category icon + name (from kategorien app via lookup)
  - Total amount for this category this month
  - Percentage of total spending
  - Visual percentage bar
- Mobile style: Horizontal scroll pills for top 3, tap to see full list in bottom sheet
- Desktop style: Vertical stacked cards or inline list items, all visible without scroll
- Sort: By total amount DESC (highest spending category first)
- Limit: All categories (typically 5-10)

### Primary Action Button (REQUIRED!)

**⚠️ Every dashboard MUST have a primary action.** This is NOT a read-only view!

- **Label:** "Ausgabe hinzufügen" (Add Expense)
- **Action:** add_record - Opens a form modal/sheet to create new expense
- **Target app:** "ausgabe_erfassen" app (app_id: 696f8229befaff34971e38ed)
- **What data:** Form fields:
  - kategorie_auswahl (Category) - Select dropdown populated from kategorien app
  - beschreibung_ausgabe (Description) - Text input
  - betrag_ausgabe (Amount) - Number input, currency formatted
  - datum_ausgabe (Date) - Date picker, defaults to today
  - beleg_upload (Receipt) - Optional file upload
  - notizen_ausgabe (Notes) - Optional textarea
- **Mobile position:** bottom_fixed - Sticky button at bottom of screen, always accessible in thumb zone, 56px height, full width with safe area padding
- **Desktop position:** header - Large prominent button in top-right of header, terracotta background with white text
- **Why this action:** Users need to log expenses immediately after purchases (while receipt is in hand, details are fresh). Making this one tap away encourages consistent tracking, which is essential for expense tracking to be useful. If logging is friction-full, users abandon the app.

**Button styling:**
- Background: Terracotta (`hsl(15 60% 55%)`)
- Text: White, Manrope 600 (semibold), 16px
- Border radius: 8px
- Hover: Slightly darker terracotta
- Press feedback: Subtle scale down animation

---

## 7. Visual Details

### Border Radius
Rounded (8px) - Creates a friendly, approachable feel without being too playful. Corners are soft but not pill-shaped. Consistent 8px across all cards, buttons, and input fields.

### Shadows
Subtle - Cards use a gentle shadow that creates depth without drama:
- Default cards: `0 1px 3px rgba(0,0,0,0.06)`
- Hero card: `0 4px 12px rgba(0,0,0,0.08)` (slightly elevated)
- Hover state: `0 4px 12px rgba(0,0,0,0.12)` (more pronounced)
No harsh black shadows - always use warm transparent black that blends with cream background.

### Spacing
Normal with strategic spaciousness - Base spacing unit is 16px. Hero card gets extra padding (32px) to emphasize importance. Section gaps are 24px. Card internal padding is 20px. The goal is breathing room without feeling sparse.

### Animations
- **Page load:** Subtle stagger - Hero fades in first (100ms), then secondary elements stagger in (50ms delays between each). Total animation: ~400ms. Creates polished feel without being slow.
- **Hover effects:**
  - Cards: Gentle shadow increase (transition: 200ms ease)
  - Buttons: Slight color darken + scale(0.98) on press
  - List items: Background color fade-in (150ms)
- **Tap feedback:**
  - All interactive elements scale(0.98) on press
  - Ripple effect on primary button
  - Haptic feedback trigger (if browser supports)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@300;400;700&family=Manrope:wght@400;500;600;700&display=swap');

:root {
  --background: hsl(30 25% 97%);
  --foreground: hsl(25 15% 25%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(25 15% 25%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(25 15% 25%);
  --primary: hsl(15 60% 55%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(30 20% 94%);
  --secondary-foreground: hsl(25 15% 25%);
  --muted: hsl(30 20% 94%);
  --muted-foreground: hsl(25 10% 50%);
  --accent: hsl(15 60% 55%);
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 70% 55%);
  --destructive-foreground: hsl(0 0% 100%);
  --border: hsl(30 15% 88%);
  --input: hsl(30 15% 88%);
  --ring: hsl(15 60% 55%);
  --radius: 8px;

  /* Typography */
  --font-serif: 'Source Serif 4', serif;
  --font-sans: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
  font-family: var(--font-sans);
}

/* Hero numbers use serif */
.hero-number {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 48px;
  line-height: 1.1;
}

/* Hero card gradient background */
.hero-card {
  background: linear-gradient(135deg, hsl(40 30% 98%) 0%, hsl(15 30% 95%) 100%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Fonts loaded from URL above (both Source Serif 4 and Manrope)
- [ ] All CSS variables copied exactly into src/index.css
- [ ] Mobile layout matches Section 4 (hero dominates, bottom fixed button)
- [ ] Desktop layout matches Section 5 (60/40 asymmetric columns)
- [ ] Hero element is prominent as described (48px serif, gradient background)
- [ ] Colors create warm, calm atmosphere as described in Section 2
- [ ] Primary action button is present and positioned correctly (bottom-fixed mobile, header desktop)
- [ ] Hero card has subtle gradient background
- [ ] Chart uses terracotta color with area fill
- [ ] All spacing uses 16px base unit with strategic variations
- [ ] Animations are subtle (stagger on load, gentle hover effects)
- [ ] Category breakdown groups expenses properly
- [ ] Recent expenses list pulls from ausgaben app with proper lookups
