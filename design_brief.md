# Design Brief: Ausgabentracker (Expense Tracker)

## 1. App Analysis

### What This App Does
This is a personal expense tracking application where users log their daily expenses, organize them by categories, and monitor their spending patterns. The app helps users understand where their money goes and identify spending trends over time.

### Who Uses This
Budget-conscious individuals who want to maintain financial awareness without complicated accounting. They need quick expense logging and clear spending insights at a glance. Typical users check the app daily when logging receipts or weekly when reviewing spending patterns.

### The ONE Thing Users Care About Most
**Total monthly spending.** Users want to immediately see how much they've spent this month to gauge if they're on track with their budget. This is the question they ask themselves every time they open the app: "How much have I spent so far?"

### Primary Actions (IMPORTANT!)
1. **Log a new expense** → Primary Action Button (most frequent action - happens multiple times daily)
2. View spending by category (weekly review)
3. Check recent expenses (verifying logged items)

This dashboard is interactive - users must be able to quickly add expenses without navigating away.

---

## 2. What Makes This Design Distinctive

### Visual Identity
This design uses a warm, earthy palette with a soft cream background and terracotta/rust accents that evoke the feeling of a well-organized physical ledger or receipt book. The warm tones create a friendly, approachable atmosphere that makes expense tracking feel less stressful. Unlike cold, corporate finance apps with blue/gray palettes, this feels personal and grounded - like a trusted notebook rather than an audit tool.

### Layout Strategy
The layout uses **asymmetric proportions** to create visual flow and emphasize the hero metric. The monthly total dominates the top section with generous whitespace, taking up roughly 40% of the initial viewport on mobile. Below it, category breakdowns are shown in varied sizes based on spending amount - the highest-spending categories get more visual weight through larger cards. This creates a natural visual hierarchy that mirrors the user's mental model: "How much total?" followed by "Where did it go?"

The layout breaks away from uniform grid patterns by using:
- **Size variation:** Hero is 3x larger than secondary KPIs
- **Asymmetric columns on desktop:** 2:1 ratio (main content left, activity feed right)
- **Grouped spacing:** Category cards tightly grouped, large gap before recent expenses section
- **Mixed formats:** Numbers + bar chart + list (not everything in cards)

### Unique Element
The hero monthly total is displayed inside a subtle, hand-drawn-style border (using a slightly organic border-radius and a warm shadow) that makes it feel like a highlighted section in a physical notebook. The number itself uses an extra-bold serif typeface at 56px on mobile, creating typographic impact. A thin horizontal line with a small circle marker separates it from the secondary metrics below - this line detail echoes the visual language of ruled notebook paper, reinforcing the "trusted ledger" metaphor.

---

## 3. Theme & Colors

### Font
- **Family:** Source Serif 4
- **URL:** `https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@300;400;600;700&display=swap`
- **Why this font:** Source Serif 4 brings warmth and trustworthiness to financial data. Serif fonts are associated with traditional publishing and formal documents, which creates gravitas for money-related information. The variable weights (300 to 700) allow strong typographic hierarchy without feeling corporate. This font feels sophisticated but approachable - like a quality paper goods brand.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(35 30% 96%)` | `--background` |
| Main text | `hsl(25 20% 20%)` | `--foreground` |
| Card background | `hsl(40 40% 99%)` | `--card` |
| Card text | `hsl(25 20% 25%)` | `--card-foreground` |
| Borders | `hsl(35 20% 85%)` | `--border` |
| Primary action | `hsl(12 70% 50%)` | `--primary` |
| Text on primary | `hsl(40 40% 99%)` | `--primary-foreground` |
| Accent highlight | `hsl(25 60% 45%)` | `--accent` |
| Muted background | `hsl(35 25% 92%)` | `--muted` |
| Muted text | `hsl(25 15% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(140 40% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

Additional colors for specific use:
- **Secondary action:** `hsl(35 15% 40%)` (muted brown for less important buttons)
- **Popover background:** `hsl(40 40% 99%)` | `--popover`
- **Popover text:** `hsl(25 20% 25%)` | `--popover-foreground`
- **Input border:** `hsl(35 20% 85%)` | `--input`
- **Focus ring:** `hsl(12 70% 50%)` | `--ring`

### Why These Colors
The warm cream background (not pure white) creates an analog, paper-like feel that reduces digital harshness. The terracotta/rust primary color (`hsl(12 70% 50%)`) is distinctive - it's neither generic red nor orange, but a warm, earthy tone associated with terracotta pottery and handcrafted objects. This creates a feeling of substance and craftsmanship. The brown text (`hsl(25 20% 20%)`) instead of pure black softens readability while maintaining excellent contrast.

### Background Treatment
The background uses a subtle vertical gradient from `hsl(35 30% 96%)` at the top to `hsl(35 28% 94%)` at the bottom. This creates a gentle sense of depth and prevents the flat, lifeless feel of a solid color. The gradient is barely noticeable (only 2% lightness difference) but adds subliminal warmth - like a slight texture variation in paper.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile creates hierarchy through **extreme size differences and vertical rhythm**. The hero monthly total takes up 45% of the first viewport with generous padding, making it impossible to miss. Everything below flows in a single column with varied spacing - tight gaps within logical groups, large gaps between sections. This creates "breathing moments" that help users scan quickly.

### What Users See (Top to Bottom)

**Header:**
Fixed top bar with app title "Ausgabentracker" (left, 18px semibold) and month selector (right, dropdown showing "Januar 2026"). Background: `--card`, subtle bottom border. Height: 56px for comfortable tap targets.

**Hero Section (The FIRST thing users see):**
- **What:** Current month total spending in EUR
- **Size:** Takes 45% of viewport height (approximately 300px on standard phone)
- **Styling:**
  - Large number: 56px bold, color `--foreground`
  - Label above: "Ausgaben Januar" in 14px, color `--muted-foreground`
  - Contained in a card with organic border (12px radius with slight variation) and warm shadow
  - Extra padding: 32px vertical, 24px horizontal
  - Background: `--card`
- **Why this is the hero:** This answers the immediate question "How much have I spent?" that every user asks when opening the app. It provides instant budget awareness.

**Section 2: Quick Stats Row**
- Horizontal scrollable row of 3 mini-KPIs (each 100px wide, 80px tall)
- Left to right: "Diese Woche" (this week), "Durchschnitt/Tag" (daily avg), "Anzahl Ausgaben" (count)
- Compact cards with 16px number, 12px label
- Purpose: Quick context metrics without overwhelming the hero
- Inline format (not full-width cards) to save vertical space

**Section 3: Ausgaben nach Kategorie (Spending by Category)**
- Section title: "Nach Kategorie" (20px semibold, 24px margin-top)
- Vertical stack of category cards, sorted by amount descending
- Each card shows:
  - Left: Category name (16px semibold)
  - Right: Amount in EUR (18px bold, accent color)
  - Below: Horizontal bar chart showing % of total (8px tall, rounded, accent color with muted background)
- Card spacing: 12px gap between cards
- Show top 5 categories, then "Alle anzeigen" link

**Section 4: Letzte Ausgaben (Recent Expenses)**
- Section title: "Letzte Ausgaben" (20px semibold, 32px margin-top for section break)
- List of 8 most recent expenses
- Each item (not card, just list row with border-bottom):
  - Left: Description (14px) + Category badge (12px, muted background)
  - Right: Amount (16px bold)
  - Below: Date (12px, muted color)
- Tap any item to view details
- "Alle anzeigen" link at bottom

**Bottom Navigation / Action:**
Fixed bottom button: "Ausgabe hinzufügen" (Add Expense)
- Full width minus 16px margin each side
- 56px tall (thumb-friendly)
- Primary color, rounded corners (12px)
- Fixed position with 16px bottom margin
- Shadow to lift above content
- Opens add expense modal

### Mobile-Specific Adaptations
- Category breakdown uses vertical stacked cards instead of desktop's multi-column grid
- Quick stats are horizontally scrollable to save vertical space
- Recent expenses show compact format (description + amount only, details on tap)
- All content is visible on mobile; nothing is hidden - users expect full functionality

### Touch Targets
- All interactive elements minimum 44px height (iOS guideline)
- Bottom action button is 56px for comfortable thumb reach
- Category cards have 48px tap targets (full card is tappable)
- Month selector in header is 44px tall

### Interactive Elements
- **Category cards:** Tap to see all expenses in that category (filtered view)
- **Recent expense items:** Tap to view full expense details (description, date, receipt image if available, notes)
- **"Alle anzeigen" links:** Navigate to full lists
- **Primary action button:** Opens modal form to add new expense

---

## 5. Desktop Layout

### Overall Structure
Desktop uses a **2-column asymmetric layout (2:1 ratio)** to maximize horizontal space:
- **Left column (66% width):** Main content - hero, categories, chart
- **Right column (33% width):** Activity sidebar - recent expenses, quick actions
- **Maximum width:** 1400px, centered
- **Gap between columns:** 32px

The eye travels: Top-left hero → Down left column for categories/chart → Right column for recent activity. This F-pattern creates natural scanning flow.

### Section Layout

**Top area (full-width header bar):**
- App title left, month selector center, export/settings right
- Height: 64px
- Subtle border-bottom

**Left Column (Main Content):**

1. **Hero KPI Card (top of left column):**
   - Monthly total in large serif (64px bold)
   - Takes full width of left column, 180px tall
   - Extra padding and organic border treatment

2. **Quick Stats Row (below hero):**
   - 3 KPIs side-by-side (equal width)
   - 16px gap between
   - 32px margin-top

3. **Categories Section (below stats):**
   - Title: "Ausgaben nach Kategorie"
   - 2-column grid of category cards
   - Each card shows name, amount, and horizontal bar
   - Cards are variable height based on whether they include trend info on hover

4. **Spending Trend Chart (below categories):**
   - Full width of left column
   - Line chart showing daily spending over the month
   - 400px tall

**Right Column (Activity Sidebar):**

1. **Quick Add Card (sticky top):**
   - Compact form: Category dropdown + Amount input + Add button
   - Stays visible while scrolling
   - Allows instant expense logging without modal

2. **Recent Expenses List:**
   - Scrollable list of recent expenses
   - More detailed than mobile: shows description, category, amount, date, receipt icon if available
   - 10 most recent items

### What Appears on Hover
- **Category cards:** Show trend indicator (up/down from last month) and percentage change
- **Chart data points:** Tooltip with exact date and amount
- **Recent expense items:** Slight background color change + cursor pointer
- **Primary action areas:** Subtle shadow increase to indicate interactivity

### Clickable/Interactive Areas
- **Category cards:** Click to filter view to that category and see detailed expense list
- **Chart data points:** Click to jump to that day's expenses
- **Recent expense items:** Click to open detail modal with full info and receipt image
- **Quick Add form:** Submit directly from sidebar without leaving dashboard

---

## 6. Components

### Hero KPI

**Monatliche Gesamtausgaben (Monthly Total Spending)**

- **Title:** "Ausgaben Januar" (or current month name)
- **Data source:** Ausgaben app (app_id: 696f8228ac959abad478a05a)
- **Calculation:** Sum of `betrag` field for all records where `datum` is in current month
- **Display:**
  - Mobile: 56px bold serif, dark foreground color
  - Desktop: 64px bold serif
  - Format: EUR with 2 decimals (e.g., "1.234,56 €")
  - Contained in card with organic border and warm shadow
  - Label above in muted color: "Ausgaben [Monat]"
- **Context shown:** Small text below showing comparison to last month: "+12% vs. Dezember" or "−8% vs. Dezember" with appropriate color (destructive for increase, success for decrease)
- **Why this is the hero:** This is the primary financial awareness metric - users need to know their monthly spend at a glance to stay on budget. All other metrics support understanding this number.

### Secondary KPIs

**Ausgaben diese Woche (This Week's Spending)**
- Source: Ausgaben app
- Calculation: Sum of `betrag` where `datum` is in current week (Monday-Sunday)
- Format: Currency (EUR)
- Display: Small card, 18px number, 12px label, mobile horizontal scroll

**Durchschnitt pro Tag (Daily Average)**
- Source: Ausgaben app
- Calculation: Monthly total ÷ number of days elapsed in month
- Format: Currency (EUR)
- Display: Small card, 18px number, 12px label

**Anzahl Ausgaben (Number of Expenses)**
- Source: Ausgaben app
- Calculation: Count of all records in current month
- Format: Number
- Display: Small card, 18px number, 12px label

### Chart

- **Type:** Line chart (shows spending trend over time - users want to see patterns and peaks)
- **Title:** "Ausgabenverlauf" (Spending Trend)
- **What question it answers:** "When did I spend the most this month?" and "Is my spending accelerating or slowing down?" Helps identify spending patterns like weekend vs. weekday spending.
- **Data source:** Ausgaben app
- **X-axis:** Date (datum field), format: "1. Jan", "2. Jan", etc. for current month
- **Y-axis:** Amount in EUR (betrag field), cumulative sum per day
- **Mobile simplification:**
  - Show every 3rd date label on x-axis
  - Reduce height to 280px
  - Hide gridlines except major ones
  - Larger touch targets for data points
- **Styling:**
  - Line color: accent color (`hsl(25 60% 45%)`)
  - Line width: 3px
  - Fill gradient below line: accent color at 20% opacity fading to 0%
  - Dot on today's data point in primary color

### Lists/Tables

**Ausgaben nach Kategorie (Spending by Category)**
- Purpose: Users need to see which categories consume most budget to make informed decisions
- Source: Ausgaben app, joined with Kategorien app for category names
- Fields shown: kategoriename (from Kategorien via applookup), sum of betrag
- Mobile style: Vertical stacked cards, sorted by amount desc
- Desktop style: 2-column grid of cards
- Sort: By total amount descending
- Limit: Top 5 on mobile, all on desktop
- Card format:
  - Category name (16px semibold)
  - Amount (18px bold, accent color)
  - Horizontal bar showing % of total spending
  - On desktop hover: Show trend vs. last month

**Letzte Ausgaben (Recent Expenses)**
- Purpose: Quick verification of recently logged expenses and access to details
- Source: Ausgaben app
- Fields shown: beschreibung, betrag, datum, kategoriename (via applookup), beleg (receipt indicator icon)
- Mobile style: Simple list with border separators
- Desktop style: More detailed list with all fields visible
- Sort: By datum descending
- Limit: 8 items on mobile, 10 on desktop
- List item format:
  - Mobile: Description + amount on one line, category badge + date on second line
  - Desktop: All fields in one row (description, category, date, amount, receipt icon)

### Primary Action Button (REQUIRED!)

**⚠️ This is the most important interactive element!**

- **Label:** "Ausgabe hinzufügen" (Add Expense)
- **Action:** add_record → Opens modal form to create new expense
- **Target app:** Ausgaben app (app_id: 696f8228ac959abad478a05a)
- **What data:** Form collects these fields:
  - datum (date picker, default to today)
  - kategorie (dropdown populated from Kategorien app)
  - beschreibung (text input)
  - betrag (number input, EUR)
  - notizen (textarea, optional)
  - beleg (file upload, optional)
- **Mobile position:** bottom_fixed (56px tall, 16px margins, always visible, shadows above content)
- **Desktop position:** Two locations:
  1. Inline quick-add form in right sidebar (compact: just category + amount + add button)
  2. Full form button in header (for complete entry with all fields)
- **Why this action:** Logging expenses is the core workflow. Users do this multiple times per day. Making it one tap/click away removes friction and encourages consistent tracking, which is essential for the app's value proposition. If expense entry requires navigation, users will delay logging and forget details.

**Desktop Quick-Add Form (Sidebar):**
- Category dropdown (full width)
- Amount input (full width, EUR suffix)
- "Hinzufügen" button (primary color, full width)
- Validates and submits without modal
- Success feedback: Toast + updates dashboard
- For full details (receipt, notes), users click header button to open full modal

---

## 7. Visual Details

### Border Radius
**Rounded (12px)** with a twist: The hero card uses slightly varied corner radii (10px, 14px, 11px, 13px clockwise from top-left) to create a subtle organic, hand-drawn feel. This small detail breaks the digital perfection and reinforces the "personal notebook" metaphor. All other cards use standard 12px radius.

### Shadows
**Elevated with warmth:** Cards use layered shadows that include a warm tint:
- Main shadow: `0 2px 8px hsla(25 40% 30% / 0.08)`
- Secondary shadow: `0 0px 2px hsla(25 40% 30% / 0.04)`
- Hero card adds: `0 4px 16px hsla(12 40% 50% / 0.06)` for extra emphasis

The warm shadow tones (using hue 25/12 instead of neutral gray) subtly tie into the color palette and prevent the harsh, cold look of pure gray shadows.

### Spacing
**Spacious** - Extra whitespace creates calm and focus:
- Section vertical spacing: 48px on desktop, 32px on mobile
- Card padding: 24px on desktop, 20px on mobile
- Hero padding: 32px vertical, 24px horizontal (mobile), 40px vertical, 32px horizontal (desktop)
- Gap between category cards: 16px (desktop), 12px (mobile)
- Component internal spacing: 12px (e.g., label to value)

The generous spacing prevents the "cramped" feeling common in data dashboards and reinforces the minimal, breathing aesthetic.

### Animations
- **Page load:** Stagger animation - elements fade in sequentially with 50ms delay between each (hero → stats → categories → chart → list). Duration: 300ms ease-out. This creates a polished, considered entrance.
- **Hover effects:**
  - Cards: Scale up 1.01, shadow increases, transition 200ms ease
  - Buttons: Brightness increases 110%, transition 150ms ease
  - Category bars: Width animates to show percentage on mount, 500ms ease-out with 100ms stagger
- **Tap feedback:**
  - Mobile buttons: Scale down to 0.98 on active state, instant feedback
  - Cards: Background darkens slightly (5% darker) on touch
- **Data updates:** When adding expense, new data fades in (300ms) and updated numbers count up from old to new value (800ms ease-out)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@300;400;600;700&display=swap');

:root {
  /* Base colors */
  --background: hsl(35 30% 96%);
  --foreground: hsl(25 20% 20%);

  /* Card colors */
  --card: hsl(40 40% 99%);
  --card-foreground: hsl(25 20% 25%);

  /* Popover colors */
  --popover: hsl(40 40% 99%);
  --popover-foreground: hsl(25 20% 25%);

  /* Primary action colors */
  --primary: hsl(12 70% 50%);
  --primary-foreground: hsl(40 40% 99%);

  /* Secondary colors */
  --secondary: hsl(35 15% 40%);
  --secondary-foreground: hsl(40 40% 99%);

  /* Muted colors */
  --muted: hsl(35 25% 92%);
  --muted-foreground: hsl(25 15% 50%);

  /* Accent colors */
  --accent: hsl(25 60% 45%);
  --accent-foreground: hsl(40 40% 99%);

  /* Destructive colors */
  --destructive: hsl(0 65% 50%);
  --destructive-foreground: hsl(40 40% 99%);

  /* Border and input */
  --border: hsl(35 20% 85%);
  --input: hsl(35 20% 85%);
  --ring: hsl(12 70% 50%);

  /* Chart color */
  --chart-1: hsl(25 60% 45%);
  --chart-2: hsl(12 70% 50%);
  --chart-3: hsl(35 50% 55%);
  --chart-4: hsl(20 55% 50%);
  --chart-5: hsl(30 45% 50%);

  /* Radius */
  --radius: 12px;
}

/* Font family application */
body {
  font-family: 'Source Serif 4', serif;
}

/* Background gradient */
body {
  background: linear-gradient(
    to bottom,
    hsl(35 30% 96%),
    hsl(35 28% 94%)
  );
  min-height: 100vh;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Source Serif 4 with weights 300, 400, 600, 700)
- [ ] All CSS variables copied exactly into src/index.css
- [ ] Background gradient applied to body
- [ ] Mobile layout matches Section 4 (vertical flow, hero dominant, bottom action button)
- [ ] Desktop layout matches Section 5 (2:1 asymmetric columns, sidebar quick-add)
- [ ] Hero element is prominent as described (large serif number, organic border, warm shadow)
- [ ] Category cards show horizontal bar charts with percentage
- [ ] Primary action button fixed at bottom on mobile, quick-add form in desktop sidebar
- [ ] All colors create warm, earthy feeling described in Section 2
- [ ] Animations applied: stagger on load, hover effects, count-up on data change
- [ ] Chart uses line type with gradient fill below
- [ ] Recent expenses are tappable to view details
- [ ] Month selector in header allows changing time period
- [ ] API integration follows CLAUDE.md rules (date format YYYY-MM-DD, extractRecordId for applookup)
