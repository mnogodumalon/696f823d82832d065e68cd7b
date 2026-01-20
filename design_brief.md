# Design Brief: Ausgabentracker (Expense Tracker)

## 1. App Analysis

### What This App Does
This is a personal expense tracking system that helps users log, categorize, and monitor their spending. Users can record expenses with amounts, dates, categories, receipts, and notes. The app allows them to see spending patterns, track expenses by category, and maintain financial awareness.

### Who Uses This
Personal finance users who want to understand where their money goes. They're probably checking this daily or weekly to log new expenses and review spending patterns. They care about staying on budget and identifying spending trends.

### The ONE Thing Users Care About Most
**How much have I spent this month?** This is the immediate question users want answered when opening the dashboard. Monthly spending is the primary indicator of financial health and budget adherence.

### Primary Actions (IMPORTANT!)
1. **Add new expense** → Primary Action Button (most common action - happens multiple times per day)
2. View expense details
3. Filter by category
4. View spending trends

This dashboard is NOT read-only - users need to quickly add expenses as they happen throughout the day.

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design uses a warm financial aesthetic with a soft cream background (hsl(40 25% 98%)) paired with a refined deep teal accent (hsl(185 55% 35%)). This creates a grounded, trustworthy feel - not the sterile blue of banking apps, but a warmer, more approachable tone that makes expense tracking feel less stressful. The combination of cream and teal suggests clarity and calm, perfect for managing money without anxiety.

### Layout Strategy
The layout is **asymmetric with a clear hero** - the monthly total dominates the top of the screen with significantly larger typography (72px on desktop, 56px on mobile) and generous whitespace. This creates immediate visual hierarchy.

**Visual interest is created through:**
- **Extreme size variation**: Hero number is 4-5x larger than secondary KPIs
- **Typography hierarchy**: 300/700 weight contrast (not subtle 400/500)
- **Mixed container styles**: Hero uses a full-width subtle gradient card, secondary KPIs use compact inline badges (no cards), category breakdown uses standard cards
- **Asymmetric grid**: Not everything aligned - hero spans full width, then 2-column unequal layout below (60/40 split)

The hero's dominance is achieved through size, position (top), whitespace (40px padding around it), and a subtle gradient background that differentiates it from other elements.

### Unique Element
The monthly spending hero card features a **subtle vertical gradient background** from cream to a barely-perceptible teal tint (hsl(185 30% 96%)), creating depth without being obvious. Combined with large 72px typography using Space Grotesk at weight 300 (ultra-light), the number feels both prominent and elegant - not heavy or aggressive. The amount includes an animated counting effect on load, making the data feel alive.

---

## 3. Theme & Colors

### Font
- **Family:** Space Grotesk
- **URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`
- **Why this font:** Space Grotesk is a geometric sans-serif with technical precision that suits financial data perfectly. It's clean and readable for numbers while having distinctive character (unusual 'g' and 'a' shapes) that prevents it from feeling generic. The wide range of weights (300-700) allows for dramatic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 98%)` | `--background` |
| Main text | `hsl(0 0% 10%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(0 0% 10%)` | `--card-foreground` |
| Borders | `hsl(40 10% 88%)` | `--border` |
| Primary action | `hsl(185 55% 35%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(185 60% 92%)` | `--accent` |
| Muted background | `hsl(40 15% 94%)` | `--muted` |
| Muted text | `hsl(0 0% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(142 60% 45%)` | (component use) |
| Error/negative | `hsl(0 70% 50%)` | `--destructive` |

### Why These Colors
The warm cream background (hsl(40 25% 98%)) creates a softer, less clinical feel than pure white - this makes financial tracking feel approachable rather than intimidating. The deep teal primary (hsl(185 55% 35%)) conveys trust and clarity without the overused blue of traditional finance apps. It's distinctive enough to be memorable but professional enough for money management.

### Background Treatment
The page background is a solid warm cream (hsl(40 25% 98%)). The hero card has a subtle vertical gradient: `linear-gradient(to bottom, hsl(40 25% 98%), hsl(185 30% 96%))` - barely perceptible but creates depth. This gradient is unique to the hero, making it stand out without being loud.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile creates visual hierarchy through **extreme size variation**. The monthly total hero occupies ~40% of the first viewport with massive 56px typography, immediately answering the user's primary question. Everything below is compact and scannable, using inline badges instead of cards to conserve space while maintaining clear information.

### What Users See (Top to Bottom)

**Header:**
Clean header with app title "Ausgabentracker" (20px, weight 600) on left, no other clutter. Height: 64px with bottom border in `--border` color.

**Hero Section (The FIRST thing users see):**
Full-width card with subtle gradient background, massive visual weight:
- **What:** Monthly spending total in EUR
- **Size:** Takes ~40% of viewport height (minimum 280px). Number is 56px, weight 300, letter-spacing -0.02em
- **Styling:**
  - Gradient background: `linear-gradient(to bottom, hsl(40 25% 98%), hsl(185 30% 96%))`
  - 32px vertical padding, 24px horizontal
  - Label "Ausgaben diesen Monat" in 14px, weight 500, muted color above number
  - Comparison text below: "234 € mehr als letzter Monat" in 13px, muted
- **Why this is the hero:** Answers the immediate question "Am I on budget?" - most important metric for expense tracking

**Section 2: Quick Stats (Inline Badges)**
Three compact KPIs displayed as **inline badges** (not cards) in a horizontal row with subtle background:
- Average per day (this month)
- Number of expenses (this month)
- Most expensive category (this month)

Each badge: compact height (48px), muted background (hsl(40 15% 94%)), 12px padding, 8px radius
Typography: Label 11px weight 500 muted, value 16px weight 600 foreground
Creates contrast with hero's massive card - these are compact and informative.

**Section 3: Category Breakdown**
Title "Nach Kategorie" (16px, weight 600), then vertical stack of category cards:
- Each card shows: category name, amount, percentage bar
- Bar uses teal accent color with subtle opacity
- Cards are 56px height, simple white background
- Sort by amount descending, show top 5 categories

**Section 4: Recent Expenses**
Title "Letzte Ausgaben" (16px, weight 600), then list of expense cards:
- Each card: date (small, muted), description (medium, bold), amount (right-aligned, large)
- Limit to 8 most recent
- Cards are compact (64px height), white background, subtle border

**Bottom Navigation / Action:**
**Fixed bottom button** (sticky position):
- Full-width teal button with "+ Ausgabe hinzufügen" text
- Height: 56px for comfortable thumb tap
- Shadow: `0 -2px 8px rgba(0,0,0,0.08)` to lift above content
- Opens expense form modal on tap
- Always visible regardless of scroll position
- This is the PRIMARY ACTION - most important interaction on mobile

### Mobile-Specific Adaptations
- Hero number is 56px on mobile vs 72px desktop (still massive relative to screen)
- Quick stats use horizontal scroll if needed (rare on modern phones)
- Category breakdown limited to top 5 (vs top 8 on desktop)
- Recent expenses limited to 8 items (vs 10 on desktop)
- No hover states - everything uses tap/touch feedback
- Chart is simplified: fewer data points, larger touch targets for tooltips

### Touch Targets
All interactive elements minimum 44x44px tap area. The primary action button is 56px height for comfortable thumb reach. Category and expense cards are minimum 56px height for easy tapping.

### Interactive Elements
- **Expense cards are tappable** - tap opens detail modal showing full expense info (description, notes, receipt image if available, category)
- **Category cards are tappable** - tap opens filtered view of expenses in that category
- Subtle tap feedback: card scales to 0.98 with 150ms transition

---

## 5. Desktop Layout

### Overall Structure
Desktop uses a **2-column asymmetric layout** with 60/40 split:

**Left column (60% width):**
1. Hero card (monthly total) - full width of left column
2. Category breakdown chart/list - full width of left column

**Right column (40% width):**
1. Quick stats (stacked vertically, not horizontal)
2. Recent expenses list (scrollable)

**Visual flow:** Eye goes to the massive hero number (top-left), then down the left column to categories, with peripheral awareness of right column stats and recent activity.

**Visual interest:** The asymmetric 60/40 split creates tension. The hero spans full width of its column but uses generous whitespace. Not everything is boxed - quick stats use minimal cards with subtle backgrounds.

### Section Layout

**Top area:**
Hero card spans full width of left column (60% of screen), 320px height:
- Massive 72px number with 300 weight
- Gradient background
- Generous padding (48px vertical, 40px horizontal)
- Comparison text below number

**Left column (main content):**
- Hero (described above)
- 32px gap
- "Ausgaben nach Kategorie" section with horizontal bar chart (recharts)
  - Shows all categories with spending bars
  - Teal bars with percentage labels
  - Height: 400px

**Right column (supporting):**
- Quick stats (3 cards stacked vertically, 24px gap between)
  - Each card: 96px height, white background, minimal padding
  - Large number (28px weight 700), small label above (12px muted)
- 32px gap
- "Letzte Ausgaben" title
- Scrollable list of recent expenses (max-height: 500px, custom scrollbar)
  - 10 most recent
  - Compact cards (56px height)

### What Appears on Hover
- **Expense cards:** Subtle background color shift to `--accent` (light teal) and 2px left border in `--primary` slides in
- **Category bars:** Tooltip shows exact amount and percentage on hover
- **Add button:** Slight scale to 1.02 and deeper teal shade
- **Quick stat cards:** Very subtle shadow increase (`0 2px 8px rgba(0,0,0,0.08)`)

### Clickable/Interactive Areas
- **Expense cards (click):** Opens detail modal with full expense information, receipt preview, edit/delete actions
- **Category bars (click):** Opens filtered view showing all expenses in that category in a modal or side panel
- **Quick stat cards (click):** Opens relevant filtered view (e.g., "Most expensive category" opens that category's expenses)

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Ausgaben diesen Monat
- **Data source:** Ausgaben app
- **Calculation:** Sum of `betrag` field for all records where `datum` is in current month (compare to `new Date()`)
- **Display:**
  - Ultra-large number: 72px desktop / 56px mobile, weight 300, teal color `--primary`
  - EUR symbol and formatting: "1.234,56 €" (German format)
  - Label above in 16px muted
  - Gradient card background
- **Context shown:**
  - Comparison to previous month: "234 € mehr als letzter Monat" in 14px muted below number
  - Calculate by comparing current month sum to previous month sum
  - Show green if less, red if more
- **Why this is the hero:** Users open the dashboard to immediately see if they're on budget this month. This is the single most important financial metric for expense tracking.

### Secondary KPIs

**Durchschnitt pro Tag**
- Source: Ausgaben app
- Calculation: Current month total ÷ number of days so far this month
- Format: currency (EUR with 2 decimals)
- Display: Inline badge on mobile, vertical card on desktop (96px height)

**Anzahl Ausgaben**
- Source: Ausgaben app
- Calculation: Count of records in current month
- Format: number
- Display: Inline badge on mobile, vertical card on desktop (96px height)

**Größte Kategorie**
- Source: Ausgaben app + Kategorien app (lookup)
- Calculation: Group by category, find category with highest total, show category name
- Format: category name string
- Display: Inline badge on mobile, vertical card on desktop (96px height)

### Chart (if applicable)
- **Type:** Horizontal bar chart - shows categories side-by-side for easy comparison
- **Title:** Ausgaben nach Kategorie
- **What question it answers:** "Which categories am I spending most on?" - helps identify spending patterns
- **Data source:** Ausgaben app (with kategorie lookup to Kategorien app)
- **X-axis:** Amount in EUR (0 to max category amount)
- **Y-axis:** Category names (from Kategorien app via kategorie lookup)
- **Mobile simplification:** Show as stacked vertical cards with small horizontal bars (percentage bars) instead of full chart

### Lists/Tables

**Letzte Ausgaben (Recent Expenses)**
- Purpose: Quick overview of recent spending activity - users want to verify expenses and spot patterns
- Source: Ausgaben app
- Fields shown:
  - `datum` (formatted as "24. Jan" using date-fns)
  - `beschreibung` (main text, bold)
  - `betrag` (right-aligned, prominent)
  - `kategorie` name (small badge below description, resolved via lookup)
- Mobile style: Vertical stack of cards, 64px height each, 8px gap
- Desktop style: Vertical stack in right column, 56px height each, scrollable
- Sort: By `datum` descending (newest first)
- Limit: 8 on mobile, 10 on desktop

### Primary Action Button (REQUIRED!)

**⚠️ Every dashboard MUST have a primary action.** This is NOT a read-only view!

- **Label:** "+ Ausgabe hinzufügen" (with plus icon)
- **Action:** add_record - opens modal form to create new expense
- **Target app:** Ausgaben app (APP_IDS.AUSGABEN)
- **What data:** Form contains these fields:
  - `beschreibung` (text input, required)
  - `betrag` (number input, required, EUR currency format)
  - `datum` (date picker, defaults to today, required)
  - `kategorie` (select dropdown, loads from Kategorien app, optional)
  - `notizen` (textarea, optional)
  - `beleg` (file upload, optional - but note: handled by simple URL input or note that upload is available)
- **Mobile position:** bottom_fixed - sticky button at bottom of screen, always visible, 56px height
- **Desktop position:** header - top-right corner as prominent button next to app title
- **Why this action:** Users add expenses multiple times daily as they spend money. This needs to be instantly accessible - maximum 1 tap/click to reach the form. Making this fixed/prominent ensures users never have to hunt for it.

---

## 7. Visual Details

### Border Radius
Rounded (12px for cards, 8px for buttons, 6px for badges) - modern but not overly rounded

### Shadows
Subtle elevation system:
- Cards: `0 1px 3px rgba(0,0,0,0.08)`
- Hero card: `0 2px 8px rgba(0,0,0,0.06)` (slightly more elevated)
- Fixed button: `0 -2px 8px rgba(0,0,0,0.08)` (upward shadow)
- Hover: increase shadow slightly to `0 4px 12px rgba(0,0,0,0.12)`

### Spacing
Spacious - generous whitespace around hero (48px vertical), consistent 24-32px gaps between sections, 16px padding in standard cards. The breathing room makes the data feel calm and digestible.

### Animations
- **Page load:** Stagger effect - hero fades in first (200ms), then quick stats (staggered by 50ms each), then sections below (staggered by 100ms)
- **Hero number:** Counts up from 0 to actual value over 800ms with easing (creates "wow" moment)
- **Hover effects:**
  - Cards: smooth 200ms transition to accent background
  - Buttons: 150ms scale to 1.02
  - Shadows: 200ms transition
- **Tap feedback (mobile):** Scale to 0.98 over 150ms, bounces back

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(40 25% 98%);
  --foreground: hsl(0 0% 10%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(0 0% 10%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(0 0% 10%);
  --primary: hsl(185 55% 35%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 15% 90%);
  --secondary-foreground: hsl(0 0% 10%);
  --muted: hsl(40 15% 94%);
  --muted-foreground: hsl(0 0% 45%);
  --accent: hsl(185 60% 92%);
  --accent-foreground: hsl(0 0% 10%);
  --destructive: hsl(0 70% 50%);
  --border: hsl(40 10% 88%);
  --input: hsl(40 10% 88%);
  --ring: hsl(185 55% 35%);
  --radius: 0.75rem;
}
```

**Additional custom variables for this design:**

```css
:root {
  --hero-gradient: linear-gradient(to bottom, hsl(40 25% 98%), hsl(185 30% 96%));
  --success-color: hsl(142 60% 45%);
  --chart-primary: hsl(185 55% 35%);
  --chart-secondary: hsl(185 40% 60%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Space Grotesk 300,400,500,600,700)
- [ ] All CSS variables copied exactly to src/index.css
- [ ] Mobile layout matches Section 4 (hero dominates, inline badges, fixed bottom button)
- [ ] Desktop layout matches Section 5 (60/40 asymmetric split)
- [ ] Hero element is prominent as described (72px/56px, gradient, massive whitespace)
- [ ] Colors create the mood described in Section 2 (warm cream + deep teal)
- [ ] Primary action button is fixed bottom on mobile, header on desktop
- [ ] Expense form modal works and creates records in Ausgaben app
- [ ] Category data is properly resolved from applookup URLs
- [ ] Animations work: hero number counts up, staggered fade-in, hover effects
- [ ] Touch/tap feedback works on mobile
- [ ] Chart displays categories correctly with teal bars
- [ ] Recent expenses show correct data with German date formatting
