# Design Brief: Ausgabentracker

## 1. App Analysis

### What This App Does
The Ausgabentracker is an expense tracking application that allows users to record, categorize, and monitor their spending. It consists of three interconnected apps: "Kategorien" for expense categories, "Ausgaben" for the actual expense records with amounts, dates, descriptions, and optional receipts, and "Ausgabe erfassen" for the data entry form.

### Who Uses This
German-speaking individuals who want to keep track of their personal or small business expenses. They're practical people who want a quick overview of where their money goes without the complexity of full accounting software.

### The ONE Thing Users Care About Most
**"Wie viel habe ich diesen Monat ausgegeben?"** (How much have I spent this month?)

Users open this app to quickly see their current monthly spending total and understand their spending patterns by category.

### Primary Actions (IMPORTANT!)
1. **Ausgabe hinzufügen** → Primary Action Button (Add new expense - the most common action)
2. View expenses by category
3. Browse recent expenses

---

## 2. What Makes This Design Distinctive

### Visual Identity
This design uses a sophisticated forest green accent against a warm off-white background, creating a grounded, trustworthy feel appropriate for financial tracking. The green evokes stability and growth—psychological associations that help users feel positive about tracking their finances rather than anxious. The warm paper-like background gives the dashboard a tangible, almost notebook-like quality.

### Layout Strategy
- **Asymmetric layout on desktop** with the hero spending total prominently positioned in a wide left column, creating immediate visual impact
- **Hero emphasis through size**: The monthly total is displayed at 56px on desktop, dwarfing secondary KPIs at 24px—a 2.3x size ratio that creates unmistakable hierarchy
- **Whitespace as luxury**: Generous padding around the hero section (48px on desktop) signals importance
- **Secondary elements in compact format**: Category breakdown uses horizontal bars, not cards, to avoid competing with the hero
- **Size variation**: Mix of full-width hero, medium cards for chart, and compact list for recent expenses

### Unique Element
The category breakdown uses a distinctive horizontal bar visualization where each category shows both the amount and a proportional bar colored with a muted tint of the primary green. The bars have slightly rounded ends and a subtle inner shadow, giving them a tactile, almost physical quality like paper tabs in a ledger.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a professional, slightly geometric character that feels modern and trustworthy—perfect for a financial app. Its rounded terminals soften the numbers without losing clarity.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(45 30% 97%)` | `--background` |
| Main text | `hsl(150 20% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(150 20% 15%)` | `--card-foreground` |
| Borders | `hsl(45 15% 88%)` | `--border` |
| Primary action | `hsl(158 45% 32%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(158 35% 92%)` | `--accent` |
| Muted background | `hsl(45 20% 94%)` | `--muted` |
| Muted text | `hsl(150 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(158 50% 40%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The forest green primary creates a sense of financial stability and growth. The warm cream background (slight yellow undertone) feels welcoming and less clinical than pure white. This combination evokes the feeling of a well-organized leather notebook—professional yet personal.

### Background Treatment
The page background uses a warm off-white (`hsl(45 30% 97%)`) with a subtle cream undertone. Cards are pure white, creating a gentle lift from the background without harsh shadows. This layering creates depth while maintaining the light, airy feel.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
The hero dominates the first viewport, taking approximately 35% of screen height. Visual interest is created through extreme typography contrast (hero at 44px, secondary at 14px) and the horizontal category bars below that create a rhythmic pattern.

### What Users See (Top to Bottom)

**Header:**
- Simple, clean header with app title "Ausgabentracker" in 18px semibold
- No navigation clutter—this is a single-page dashboard

**Hero Section (The FIRST thing users see):**
- **What:** Monthly spending total displayed as currency
- **Size:** 44px font weight 700, centered, takes ~35% of first viewport
- **Label:** "Diesen Monat" (This month) in 14px muted text above the number
- **Styling:** The number itself is in the dark foreground color with a subtle text shadow for depth
- **Supporting:** Current month name displayed below in muted text (e.g., "Januar 2026")
- **Why hero:** This directly answers the user's primary question: "How much have I spent?"

**Section 2: Kategorien-Übersicht (Category Overview)**
- Horizontal scroll container with category pills
- Each pill shows: category name + amount spent (e.g., "Lebensmittel €234")
- Pills have the muted green background with dark text
- Compact design: 12px text, 8px padding
- Why here: Users want to quickly see WHERE money went

**Section 3: Spending Trend Chart**
- Simple area chart showing last 7 days of spending
- Minimal axis labels, clean green fill
- Height: 160px
- Shows daily spending pattern at a glance
- Light grid lines, no heavy borders

**Section 4: Letzte Ausgaben (Recent Expenses)**
- Simple list, last 5 expenses
- Each row: Description (left), Amount (right), Date below description in muted
- Minimal dividers (1px border-bottom)
- Tap to expand and show category/notes if available

**Bottom Navigation / Action:**
- Fixed bottom button: "Ausgabe hinzufügen" (Add Expense)
- Full width minus 16px padding on each side
- 56px height for comfortable thumb tap
- Primary green background, white text, rounded-lg

### Mobile-Specific Adaptations
- Category overview becomes horizontal scroll instead of vertical bars
- Chart simplified to area chart without detailed labels
- Recent expenses as compact list instead of cards
- All content accessible through scrolling, nothing hidden

### Touch Targets
- Bottom action button: 56px height (exceeds 44px minimum)
- Category pills: 44px touch target height
- List items: 56px minimum height per row

### Interactive Elements
- Tapping a recent expense row reveals full details (category, notes, receipt link)
- Category pills can be tapped to filter (future enhancement, visually indicated with subtle feedback)

---

## 5. Desktop Layout

### Overall Structure
Asymmetric two-column layout:
- **Left column (65%):** Hero spending total + spending chart
- **Right column (35%):** Category breakdown + recent expenses
- Maximum content width: 1200px, centered with auto margins
- Gap between columns: 32px

Eye flow: Hero total (top-left) → Chart (below hero) → Categories (top-right) → Recent (bottom-right)

### Section Layout

**Top Area (Left Column - Hero):**
- Monthly total at 56px, positioned with 48px top padding
- "Diesen Monat" label above in 14px uppercase tracking-wide muted
- Month name below in 16px muted
- Entire hero section has 48px bottom padding before chart

**Main Content (Left Column - Chart):**
- Card containing area chart
- Title: "Ausgaben der letzten 30 Tage"
- Chart height: 280px
- Shows spending over time with smooth area fill
- Hover shows exact amount for each day

**Right Column - Top (Categories):**
- Card with title "Nach Kategorie"
- Horizontal bar chart style list
- Each category: name on left, amount on right, proportional bar behind
- Bars use primary color at 15% opacity
- Sorted by amount descending
- Shows all categories

**Right Column - Bottom (Recent):**
- Card with title "Letzte Ausgaben"
- Table-style list, last 10 expenses
- Columns: Datum | Beschreibung | Kategorie | Betrag
- Subtle row hover effect
- Amounts right-aligned, formatted as currency

### What Appears on Hover
- Chart: Tooltip with exact date and amount
- Category bars: Full amount with percentage of total
- Recent expense rows: Subtle background highlight, shows notes if available

### Clickable/Interactive Areas
- Category bars: Click to filter recent expenses by category (visual feedback on click)
- Recent expense rows: Click to view full details in a slide-over panel

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Gesamtausgaben diesen Monat
- **Data source:** Ausgaben app, filtered by current month
- **Calculation:** Sum of all `betrag` fields where `datum` is in current month
- **Display:** Large currency format (e.g., "€ 1.234,56") with German locale formatting
- **Context shown:** Current month name displayed below (e.g., "Januar 2026")
- **Why this is the hero:** Directly answers "How much have I spent this month?"—the #1 user question

### Secondary KPIs
**Ausgaben heute (Today's Spending)**
- Source: Ausgaben app
- Calculation: Sum of betrag where datum = today
- Format: Currency (€)
- Display: Inline text in hero section, smaller (20px), muted

**Anzahl Transaktionen (Transaction Count)**
- Source: Ausgaben app
- Calculation: Count of records this month
- Format: Number
- Display: Small badge next to month name (e.g., "23 Ausgaben")

### Chart
- **Type:** Area chart (smooth line with filled area below) - WHY: Shows spending flow over time, softer than bars for daily data
- **Title:** Ausgaben der letzten 30 Tage
- **What question it answers:** "What's my spending pattern?" - helps users see if they're spending steadily or in bursts
- **Data source:** Ausgaben app
- **X-axis:** datum (Date), displayed as "DD.MM" format
- **Y-axis:** betrag (Amount), displayed as "€X"
- **Mobile simplification:** Show last 7 days only, simplified axis labels

### Lists/Tables

**Kategorien-Übersicht**
- Purpose: Shows spending breakdown by category
- Source: Ausgaben app joined with Kategorien
- Fields shown: kategoriename, sum of betrag per category
- Mobile style: Horizontal scroll pills
- Desktop style: Horizontal bar chart list in card
- Sort: By total amount descending
- Limit: All categories

**Letzte Ausgaben**
- Purpose: Quick access to recent transactions
- Source: Ausgaben app
- Fields shown: datum, beschreibung, kategorie (resolved name), betrag
- Mobile style: Simple compact list
- Desktop style: Table with subtle styling
- Sort: By datum descending
- Limit: 5 on mobile, 10 on desktop

### Primary Action Button (REQUIRED!)

- **Label:** "Ausgabe hinzufügen"
- **Action:** add_record
- **Target app:** Ausgaben (696f8228ac959abad478a05a)
- **What data:** Form with fields:
  - betrag (number input, required) - "Betrag (€)"
  - beschreibung (text input, required) - "Beschreibung"
  - kategorie (select from Kategorien) - "Kategorie"
  - datum (date picker, default today) - "Datum"
  - notizen (textarea, optional) - "Notizen"
- **Mobile position:** bottom_fixed (floating at bottom, always visible)
- **Desktop position:** header (top right of dashboard, next to title)
- **Why this action:** Adding expenses is the core interaction—users open the app specifically to log spending. One-tap access is essential.

---

## 7. Visual Details

### Border Radius
Rounded (8px) - `--radius: 0.5rem` - Soft but not playful, appropriate for financial app

### Shadows
Subtle - Cards have `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)). No heavy shadows. Elevation comes from background color contrast.

### Spacing
Normal - 16px base unit. Cards have 24px internal padding. Sections separated by 24px. Hero has extra breathing room (48px vertical padding).

### Animations
- **Page load:** Subtle fade-in (200ms) for content sections, staggered
- **Hover effects:** Cards lift slightly (translateY -2px), category bars brighten
- **Tap feedback:** Scale down to 0.98 on tap, spring back

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.5rem;
  --background: hsl(45 30% 97%);
  --foreground: hsl(150 20% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(150 20% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(150 20% 15%);
  --primary: hsl(158 45% 32%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(45 20% 94%);
  --secondary-foreground: hsl(150 20% 20%);
  --muted: hsl(45 20% 94%);
  --muted-foreground: hsl(150 10% 45%);
  --accent: hsl(158 35% 92%);
  --accent-foreground: hsl(150 20% 15%);
  --destructive: hsl(0 65% 50%);
  --border: hsl(45 15% 88%);
  --input: hsl(45 15% 88%);
  --ring: hsl(158 45% 32%);
  --chart-1: hsl(158 45% 32%);
  --chart-2: hsl(158 35% 45%);
  --chart-3: hsl(158 25% 55%);
  --chart-4: hsl(158 20% 65%);
  --chart-5: hsl(158 15% 75%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero dominant, horizontal category scroll, fixed bottom button)
- [ ] Desktop layout matches Section 5 (65/35 split, asymmetric)
- [ ] Hero element is prominent as described (44px mobile, 56px desktop)
- [ ] Colors create the warm, trustworthy mood described in Section 2
- [ ] Primary action button is prominent and always accessible
- [ ] Chart uses area style with smooth curves
- [ ] Category bars have proportional width visualization
- [ ] Currency formatting uses German locale (€ X.XXX,XX)
- [ ] Dates formatted as DD.MM.YYYY (German format)
