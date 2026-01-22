# Design Brief: Ausgabentracker

## 1. App Analysis

### What This App Does
Ausgabentracker is a personal expense tracking application that helps users monitor their spending habits. It consists of three interconnected apps: **Kategorien** (categories like food, transport, entertainment), **Ausgaben** (individual expense records with date, amount, category, description, and optional receipt upload), and **Ausgabe erfassen** (a form for logging new expenses). The system allows users to categorize expenses and track spending patterns over time.

### Who Uses This
A German-speaking individual or household managing personal finances. They want a quick overview of where their money goes, how much they've spent this month, and the ability to log expenses on-the-go. They're not accountants—they want simplicity and clarity, not spreadsheets.

### The ONE Thing Users Care About Most
**"Wie viel habe ich diesen Monat ausgegeben?"** (How much have I spent this month?) This is the burning question. Users open the app to see their monthly total at a glance, then may drill into categories to understand spending patterns.

### Primary Actions (IMPORTANT!)
1. **Ausgabe hinzufügen** → Primary Action Button (log a new expense immediately)
2. View spending by category
3. Review recent transactions

---

## 2. What Makes This Design Distinctive

### Visual Identity
The dashboard uses a **warm, earthy palette** built on soft cream backgrounds with a refined **sage green** accent. This creates a calm, grounded feeling—money management shouldn't feel stressful. The sage green suggests growth and balance, appropriate for financial health. Unlike typical finance apps with cold blues or aggressive reds, this feels approachable and domestic.

### Layout Strategy
**Asymmetric layout with clear visual hierarchy:**
- The **hero element** (monthly total) dominates the top with extra-large typography and generous whitespace—it's impossible to miss
- Below, a **spending-by-category** breakdown uses a horizontal bar visualization that's both informative and visually interesting
- Secondary KPIs (average per day, number of transactions) appear as compact inline elements, NOT identical cards
- The recent expenses list uses subtle alternating backgrounds rather than heavy card shadows
- **Size variation is key**: The hero is 3x larger than secondary metrics

### Unique Element
The **category spending bars** use the sage green with varying opacity levels to show proportional spending. Each bar has a subtle rounded end-cap and the category name sits directly inside the bar when space allows, creating a clean, integrated look. This is more visually engaging than a standard pie chart or plain list.

---

## 3. Theme & Colors

### Font
- **Family:** Outfit
- **URL:** `https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap`
- **Why this font:** Outfit has a friendly, rounded geometric quality that feels modern yet warm. Its excellent weight range (300-700) creates strong typographic hierarchy. It reads clearly at both large hero sizes and small label text.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(45 30% 97%)` | `--background` |
| Main text | `hsl(45 10% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(45 10% 15%)` | `--card-foreground` |
| Borders | `hsl(45 15% 88%)` | `--border` |
| Primary action (sage green) | `hsl(150 25% 40%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(150 20% 94%)` | `--accent` |
| Muted background | `hsl(45 20% 95%)` | `--muted` |
| Muted text | `hsl(45 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(150 40% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 55%)` | `--destructive` |

### Why These Colors
The warm cream background (`hsl(45 30% 97%)`) avoids cold clinical white—it feels like quality paper. The sage green primary (`hsl(150 25% 40%)`) is sophisticated and calming, avoiding the generic "tech blue" or aggressive finance greens. Together they create a palette that feels premium but approachable.

### Background Treatment
The page background has a subtle warm tint (cream with yellow undertone). Cards are pure white, creating gentle lift without harsh shadows. This slight contrast between page and cards adds depth without visual noise.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
The hero (monthly total) dominates the first viewport entirely—users see their spending immediately without scrolling. Below the fold, content is organized in tight, scannable sections. Size variation is dramatic: the hero number is 48px, while secondary metrics are 16px.

### What Users See (Top to Bottom)

**Header:**
Minimal header with app title "Ausgaben" (left-aligned, 18px, weight 500) and current month selector dropdown (right side). No hamburger menu—everything essential is visible.

**Hero Section (The FIRST thing users see):**
- **Content:** Monthly total spending amount
- **Size:** The number takes 40% of viewport height, with generous padding
- **Typography:** 48px, weight 700, `--foreground` color
- **Subtext:** "im [Month Name]" in 14px, weight 400, `--muted-foreground`
- **Whitespace:** 48px padding on all sides
- **Why hero:** This directly answers the user's primary question—total monthly spend

**Section 2: Quick Stats Row**
- Inline horizontal row (NOT cards) showing:
  - "Ø [X] € / Tag" (average per day)
  - "[X] Ausgaben" (number of transactions)
- 14px, weight 500, muted-foreground color
- Separated by a subtle vertical divider
- Tight spacing, fits on one line

**Section 3: Ausgaben nach Kategorie**
- Section header: "Nach Kategorie" (16px, weight 600)
- Horizontal bars showing spending per category
- Each bar shows: category name (inside bar if fits, else below), amount on right
- Bars sorted by amount (highest first)
- Uses primary color with varying opacity (100%, 70%, 50%, 35%, 25%) for top 5
- Tap a bar to see transactions in that category (detail drill-down)

**Section 4: Letzte Ausgaben**
- Section header: "Letzte Ausgaben" (16px, weight 600)
- List of 5 most recent expenses
- Each row: Date (left, muted), Description (center), Amount (right, weight 600)
- Subtle divider lines between rows
- Tap to view/edit expense detail

**Bottom Navigation / Action:**
- **Fixed bottom button**: "Ausgabe hinzufügen" (primary color, full width minus 16px margin each side, 48px height, rounded-lg)
- Button has subtle shadow to float above content
- Always visible, always reachable with thumb

### Mobile-Specific Adaptations
- Category bars are full-width and vertically stacked
- Recent expenses show only essential info (date, description, amount)
- All sections have consistent 16px horizontal padding

### Touch Targets
- All tappable elements minimum 44px height
- Bottom action button is 48px height
- Category bars have 48px minimum height for comfortable tapping

### Interactive Elements
- Month selector dropdown changes displayed data
- Category bars tap to filter/show category detail
- Recent expense rows tap to view expense detail

---

## 5. Desktop Layout

### Overall Structure
**Two-column asymmetric layout: 65% left / 35% right**

The left column contains the hero and chart—the "at a glance" view. The right column contains the activity feed—recent transactions and quick actions. This creates clear visual flow: see the summary first (left), then details (right).

Maximum content width: 1200px, centered on page.

### Section Layout

**Top Area (full width):**
- Header bar with "Ausgabentracker" title (left) and month selector (right)
- 24px height, clean and minimal

**Left Column (65%):**
- **Hero card:** Monthly total with large typography (64px number, weight 700)
- **Below hero:** Quick stats inline (average/day, transaction count)
- **Chart area:** Category spending visualization as horizontal bars
- Bars have hover state showing exact amount and percentage

**Right Column (35%):**
- **"Ausgabe hinzufügen" button** at top of column (full column width, primary color)
- **Recent Activity feed:** Scrollable list of last 10 transactions
- Each transaction shows: date, description, category pill, amount
- Subtle card background with clean list styling

### What Appears on Hover
- Category bars: Tooltip with exact € amount and percentage of total
- Transaction rows: Subtle background highlight, "Edit" icon appears on right
- Primary button: Slight darkening of background

### Clickable/Interactive Areas
- Category bars: Click to open modal showing all transactions in that category
- Transaction rows: Click to open edit modal for that expense
- Month selector: Dropdown to change displayed month

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Monatliche Ausgaben
- **Data source:** Ausgaben app, filtered by current month
- **Calculation:** SUM of all `betrag` fields where `datum` is in selected month
- **Display:** Large number with € symbol, centered in generous whitespace
- **Context shown:** Current month name displayed below ("im Januar 2025")
- **Why this is the hero:** Directly answers "How much have I spent?" - the user's primary concern

### Secondary KPIs

**Durchschnitt pro Tag (Average per day)**
- Source: Ausgaben app (same month filter)
- Calculation: Monthly total ÷ number of days elapsed in month
- Format: Currency (€) with 2 decimals
- Display: Inline text, compact, muted styling

**Anzahl Ausgaben (Number of expenses)**
- Source: Ausgaben app (same month filter)
- Calculation: COUNT of records
- Format: Integer
- Display: Inline text next to average, muted styling

### Chart: Category Spending Breakdown

- **Type:** Horizontal bar chart (WHY: easier to read labels, works well on mobile, shows ranking clearly)
- **Title:** Nach Kategorie
- **What question it answers:** "Where is my money going?" - lets users identify spending patterns
- **Data source:** Ausgaben app joined with Kategorien
- **X-axis:** Amount (€)
- **Y-axis:** Category names
- **Mobile simplification:** Full-width bars, category name above bar if doesn't fit inside
- **Visual treatment:** Primary color with decreasing opacity for each rank. Rounded end caps (4px radius)

### Lists/Tables

**Letzte Ausgaben (Recent Expenses)**
- Purpose: Quick review of recent spending, spot errors, remember what was logged
- Source: Ausgaben app
- Fields shown: datum, beschreibung, kategorie (as pill/badge), betrag
- Mobile style: Simple list with dividers, date/amount on edges, description in middle
- Desktop style: Compact table rows with hover state
- Sort: By datum descending (newest first)
- Limit: 5 on mobile, 10 on desktop

### Primary Action Button (REQUIRED!)

- **Label:** "Ausgabe hinzufügen"
- **Action:** Opens modal form to add_record
- **Target app:** Ausgaben (696f8228ac959abad478a05a)
- **What data:** Form fields for:
  - `betrag` (number, required) - Amount in EUR
  - `beschreibung` (text, required) - Short description
  - `kategorie` (select from Kategorien, required) - Category picker
  - `datum` (date, default: today) - Date of expense
  - `notizen` (textarea, optional) - Additional notes
- **Mobile position:** bottom_fixed (always visible, full width with margin)
- **Desktop position:** Top of right sidebar column
- **Why this action:** Logging expenses is the core user action—it must be instant and frictionless

---

## 7. Visual Details

### Border Radius
- Cards: rounded (8px) - `--radius: 0.5rem`
- Buttons: rounded (8px)
- Category bars: pill on right end (4px)
- Input fields: rounded (6px)

### Shadows
- Cards: subtle (`0 1px 3px hsl(45 10% 15% / 0.05)`) - barely visible lift
- Fixed action button: elevated (`0 4px 12px hsl(45 10% 15% / 0.15)`) - needs to float
- Modals: elevated (`0 8px 24px hsl(45 10% 15% / 0.2)`)

### Spacing
- **Spacious** - generous breathing room creates calm feeling
- Page padding: 16px mobile, 32px desktop
- Section gaps: 24px mobile, 32px desktop
- Card internal padding: 20px mobile, 24px desktop
- Between list items: 12px

### Animations
- **Page load:** Subtle fade-in (300ms ease-out)
- **Hover effects:** Background color transition (150ms ease)
- **Tap feedback:** Subtle scale down (0.98) on press
- **Modal:** Fade + slight slide up (200ms ease-out)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --radius: 0.5rem;
  --background: hsl(45 30% 97%);
  --foreground: hsl(45 10% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(45 10% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(45 10% 15%);
  --primary: hsl(150 25% 40%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(45 20% 95%);
  --secondary-foreground: hsl(45 10% 25%);
  --muted: hsl(45 20% 95%);
  --muted-foreground: hsl(45 10% 45%);
  --accent: hsl(150 20% 94%);
  --accent-foreground: hsl(150 25% 25%);
  --destructive: hsl(0 65% 55%);
  --border: hsl(45 15% 88%);
  --input: hsl(45 15% 88%);
  --ring: hsl(150 25% 40%);
  --chart-1: hsl(150 25% 40%);
  --chart-2: hsl(150 25% 50%);
  --chart-3: hsl(150 25% 60%);
  --chart-4: hsl(150 25% 70%);
  --chart-5: hsl(150 25% 80%);
}

body {
  font-family: 'Outfit', sans-serif;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Outfit)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero dominates, fixed bottom button)
- [ ] Desktop layout matches Section 5 (65/35 two-column)
- [ ] Hero element is prominent as described (48px mobile, 64px desktop)
- [ ] Colors create the warm, calm mood described in Section 2
- [ ] Category bars use primary color with opacity variation
- [ ] Month selector allows filtering data
- [ ] "Ausgabe hinzufügen" button opens form modal
- [ ] Form submits to Ausgaben app with correct fields
- [ ] Recent expenses list is tappable/clickable
- [ ] All spacing follows "spacious" guidelines
