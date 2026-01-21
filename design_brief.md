# Dashboard Design Brief: Ausgabentracker

## 1. User Context & Goals
This user manages personal or business expenses and needs a clear overview of their spending habits. They want to:
- See total spending at a glance without digging through records
- Understand where their money goes by category (e.g., Food, Transport, Office supplies)
- Quickly review recent expenses to verify entries
- Identify spending patterns and trends over time to make better financial decisions

## 2. Data Analysis

### Available Apps
- **Kategorien**: Categories for organizing expenses (e.g., "Lebensmittel", "Transport", "Büromaterial")
  - Key fields: `kategoriename` (string), `beschreibung` (textarea)
  - Purpose: Classification system for expenses

- **Ausgaben**: Main expense records containing the actual spending data
  - Key fields: `betrag` (number/EUR), `datum` (date), `kategorie` (applookup to Kategorien), `beschreibung` (string), `beleg` (file upload), `notizen` (textarea)
  - Purpose: Core transaction data with amounts, dates, and categorization

- **Ausgabe erfassen**: Form app for entering new expenses
  - Key fields: Similar to Ausgaben but with different identifiers
  - Purpose: Data entry interface (not needed for dashboard analytics)

### Relationships
- `Ausgaben.kategorie` → `Kategorien` (applookup/select)
  - Each expense is linked to exactly one category
  - Categories can be null (uncategorized expenses)
  - Use `extractRecordId()` to parse the record reference

### Calculable Metrics
1. **Gesamtausgaben** (Total Spending): Sum of all `Ausgaben.betrag`
2. **Durchschnitt pro Tag** (Daily Average): Total spending / number of days in selected period
3. **Anzahl Ausgaben** (Transaction Count): Count of expense records
4. **Ausgaben pro Kategorie** (Spending by Category): Group by `kategorie`, sum `betrag`
5. **Teuerste Kategorie** (Top Category): Category with highest total spending
6. **Zeitlicher Trend** (Time Trend): Daily/weekly spending aggregation for trend analysis
7. **Durchschnittlicher Betrag** (Average Transaction): Total / count

## 3. Dashboard Layout Strategy

### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────┐
│ [Header: "Ausgabentracker Dashboard" + Date Filter]     │
├─────────────┬─────────────┬─────────────┬──────────────┤
│ Card 1      │ Card 2      │ Card 3      │ Card 4       │
│ Gesamt      │ Ø pro Tag   │ Anzahl      │ Top Kategorie│
├─────────────────────────────┬───────────────────────────┤
│ Bar Chart                   │ Line Chart                │
│ Ausgaben pro Kategorie      │ Ausgaben-Trend            │
│ (2/3 width)                 │ (1/3 width)               │
├─────────────────────────────────────────────────────────┤
│ Data Table: Letzte Ausgaben (Recent Expenses)          │
│ [Datum | Kategorie | Beschreibung | Betrag | Actions]  │
└─────────────────────────────────────────────────────────┘
```

Visual hierarchy:
1. Hero metrics at top (immediate insight)
2. Visual analytics in middle (understand patterns)
3. Detailed table at bottom (drill down into specifics)

### Mobile Layout (<1024px)
```
┌─────────────────────┐
│ [Header + Filter]   │
├─────────────────────┤
│ Card: Gesamt        │
├─────────────────────┤
│ Card: Ø pro Tag     │
├─────────────────────┤
│ Card: Anzahl        │
├─────────────────────┤
│ Card: Top Kategorie │
├─────────────────────┤
│ Bar Chart           │
│ (Ausgaben/Kategorie)│
├─────────────────────┤
│ Line Chart          │
│ (Trend)             │
├─────────────────────┤
│ Compact Expense     │
│ Cards (not table)   │
│ ┌─────────────────┐ │
│ │ Datum • Betrag  │ │
│ │ Beschreibung    │ │
│ │ Kategorie       │ │
│ └─────────────────┘ │
└─────────────────────┘
```

Stack everything vertically, use compact card layouts instead of tables.

## 4. Visualizations & Components

### Hero Metrics (Top KPIs)
| Metric | Calculation | Why It Matters |
|--------|-------------|----------------|
| Gesamtausgaben | `Sum(Ausgaben.betrag)` | Most important number: "How much did I spend?" - gives immediate financial overview |
| Ø pro Tag | `Total / days_in_period` | Daily burn rate helps users understand spending velocity and plan budgets |
| Anzahl Ausgaben | `Count(Ausgaben)` | Transaction volume indicates spending frequency - many small vs few large expenses |
| Top Kategorie | `Max(GroupBy(kategorie).Sum(betrag))` | Identifies the biggest spending area - helps prioritize cost-cutting efforts |

Display format:
- Large number (2xl font, bold, tabular-nums)
- Small label below (muted text)
- Icon for visual recognition
- Color coding: primary for neutral metrics, warning for high spending

### Charts

| Chart Type | Data Source | Purpose |
|------------|-------------|---------|
| Bar Chart (Vertical) | `Ausgaben` grouped by `kategorie`, sum `betrag` | Show spending distribution across categories - helps identify where money goes. Sort descending by amount. Use category names as x-axis labels. Color bars with distinct but harmonious colors. |
| Line Chart | `Ausgaben` grouped by `datum`, sum `betrag` per day/week | Visualize spending trend over time - helps identify patterns (e.g., "I spend more on weekends"). Show smooth curve with area fill below for visual weight. X-axis: dates, Y-axis: EUR amount. |

Chart specifics:
- Use recharts library (ResponsiveContainer, BarChart, LineChart, AreaChart)
- Desktop: Side-by-side (bar chart takes 2/3 width, line chart 1/3)
- Mobile: Stack vertically, full width
- Include tooltips with formatted EUR values
- Responsive height: 300px on desktop, 250px on mobile
- Grid lines for readability

### Data Tables

| Table | Columns | Sorting/Filters |
|-------|---------|-----------------|
| Letzte Ausgaben | 1. **Datum** (dd.MM.yyyy format)<br>2. **Kategorie** (category name from lookup, fallback: "Nicht kategorisiert")<br>3. **Beschreibung** (expense description)<br>4. **Betrag** (formatted as EUR currency, right-aligned) | - Default sort: Most recent first (datum DESC)<br>- Click column headers to re-sort<br>- Show max 10 rows initially<br>- Pagination or "Load more" for additional rows<br>- Filter by category via dropdown at top |

Mobile adaptation:
- Replace table with card list
- Each card shows: Datum (top-right), Betrag (large, bold), Beschreibung (main text), Kategorie (small chip/badge)

## 5. Theme & Colors

### Color Palette
```css
:root {
  --color-primary: #3b82f6;      /* Blue - neutral, trustworthy for financial data */
  --color-primary-light: #60a5fa; /* Lighter blue for hover states */
  --color-success: #10b981;      /* Green - positive metrics, under budget */
  --color-warning: #f59e0b;      /* Amber - attention needed, nearing limits */
  --color-danger: #ef4444;       /* Red - overspending, alerts */
  --color-muted: #6b7280;        /* Gray - secondary text, borders */
  --color-muted-light: #f3f4f6;  /* Light gray - card backgrounds */
  --color-text: #111827;         /* Dark gray - primary text */
  --color-text-muted: #6b7280;   /* Gray - secondary text */

  /* Chart colors (distinct but harmonious) */
  --chart-1: #3b82f6;  /* Blue */
  --chart-2: #8b5cf6;  /* Violet */
  --chart-3: #ec4899;  /* Pink */
  --chart-4: #f59e0b;  /* Amber */
  --chart-5: #10b981;  /* Green */
  --chart-6: #06b6d4;  /* Cyan */
}
```

### Typography
- **H1 (Dashboard Title)**: `text-3xl font-bold text-gray-900` - "Ausgabentracker Dashboard"
- **H2 (Section Titles)**: `text-xl font-semibold text-gray-900` - "Ausgaben pro Kategorie", "Letzte Ausgaben"
- **Metric Values**: `text-2xl md:text-3xl font-bold tabular-nums` - ensures numbers align properly
- **Metric Labels**: `text-sm text-gray-600 font-medium` - small, muted, readable
- **Table Headers**: `text-xs font-medium uppercase tracking-wide text-gray-700`
- **Table Body**: `text-sm text-gray-900` - readable without being too large
- **Currency Values**: Always use `tabular-nums` class for alignment

Font family: System default (inherits from Tailwind)

## 6. Interactions & Filters

### Time Period Filter
Location: Top-right of dashboard header, next to title

Options:
- **Letzte 7 Tage** (Last 7 days)
- **Letzte 30 Tage** (Last 30 days) ← DEFAULT
- **Letzte 90 Tage** (Last 90 days)
- **Letztes Jahr** (Last 365 days)
- **Alle Zeit** (All time)

Behavior:
- Select dropdown (shadcn Select component)
- On change: Recalculate all metrics, filter charts and table
- Show selected period in header: "Zeitraum: Letzte 30 Tage"

### Category Filter
Location: Above the table section, left side

Options:
- **Alle Kategorien** ← DEFAULT
- List all categories from Kategorien app dynamically
- Multi-select capability (can select multiple categories)

Behavior:
- Multi-select dropdown (shadcn Select with multiple)
- On change: Filter bar chart, line chart, and table
- Show active filters as chips/badges that can be removed

### Sorting
- Table columns with sort icons
- Click header to toggle: ascending → descending → no sort
- Default: datum DESC (newest first)
- Sortable columns: Datum, Betrag
- Visual indicator: arrow icon next to column header

### Responsive Behavior
- Desktop: All filters in header row
- Mobile: Filters stack vertically, collapsible filter panel

## 7. Empty States & Error Handling

### No Data States

**No expenses at all:**
```
┌─────────────────────────────────┐
│   [Icon: Receipt with X]        │
│                                 │
│   Noch keine Ausgaben erfasst   │
│   Fügen Sie Ihre erste Ausgabe  │
│   hinzu, um die Auswertung zu   │
│   sehen.                        │
│                                 │
│   [Button: Ausgabe hinzufügen]  │
└─────────────────────────────────┘
```

**No expenses in selected period:**
```
┌─────────────────────────────────┐
│   Keine Ausgaben im gewählten   │
│   Zeitraum gefunden.            │
│                                 │
│   Wählen Sie einen anderen      │
│   Zeitraum aus.                 │
└─────────────────────────────────┘
```
Show hero metrics as 0.00 EUR

**No categories defined:**
- Bar chart: Show message "Keine Kategorien vorhanden"
- Table: Show "Nicht kategorisiert" for kategorie column

### Error Handling

**API fetch error:**
```
┌─────────────────────────────────┐
│   [Icon: Alert Triangle]        │
│                                 │
│   Fehler beim Laden der Daten   │
│   Bitte überprüfen Sie Ihre     │
│   Verbindung und versuchen Sie  │
│   es erneut.                    │
│                                 │
│   [Button: Erneut versuchen]    │
└─────────────────────────────────┘
```

**Partial data load:**
- Show what loaded successfully
- Display warning banner at top: "Einige Daten konnten nicht geladen werden"

**Loading states:**
- Hero metrics: Skeleton loaders (pulsing gray rectangles)
- Charts: Spinner in center of chart area
- Table: Skeleton rows

## 8. Implementation Notes

### API Data Fetching
1. Fetch all three apps on mount:
   - `GET /apps/696f822571ddec20b35bc68e/records` → Kategorien
   - `GET /apps/696f8228ac959abad478a05a/records` → Ausgaben
   - Use `Promise.all()` for parallel requests

2. Transform data immediately:
   ```typescript
   // Parse applookup fields
   const categoryId = extractRecordId(expense.kategorie);
   const categoryName = kategorienMap.get(categoryId)?.kategoriename || 'Nicht kategorisiert';

   // Parse dates
   const date = parseISO(expense.datum); // datum is YYYY-MM-DD format
   ```

3. Apply filters client-side (fast, no extra API calls)

### Data Transformations

**For bar chart (spending by category):**
```typescript
const categorySpending = expenses
  .reduce((acc, expense) => {
    const catId = extractRecordId(expense.kategorie);
    const catName = kategorienMap.get(catId)?.kategoriename || 'Nicht kategorisiert';
    acc[catName] = (acc[catName] || 0) + (expense.betrag || 0);
    return acc;
  }, {});

const chartData = Object.entries(categorySpending)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value); // Sort descending
```

**For line chart (daily spending trend):**
```typescript
const dailySpending = expenses
  .reduce((acc, expense) => {
    const date = expense.datum; // Already YYYY-MM-DD
    acc[date] = (acc[date] || 0) + (expense.betrag || 0);
    return acc;
  }, {});

const chartData = Object.entries(dailySpending)
  .map(([date, value]) => ({ date, value }))
  .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
```

### Currency Formatting
Always use German locale:
```typescript
const formatEUR = (amount: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
```

### Date Formatting
Use date-fns with German locale:
```typescript
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const formattedDate = format(parseISO(datum), 'dd.MM.yyyy', { locale: de });
```

### Performance Optimizations
- Use `useMemo` for expensive calculations (filtering, sorting, aggregations)
- Use `React.memo` for chart components (prevent unnecessary re-renders)
- Debounce filter changes (300ms delay) to avoid excessive recalculations
- Cache category lookup map

### Component Structure
```
Dashboard.tsx
├── DashboardHeader (title + time period filter)
├── MetricsGrid
│   ├── MetricCard (Gesamtausgaben)
│   ├── MetricCard (Ø pro Tag)
│   ├── MetricCard (Anzahl)
│   └── MetricCard (Top Kategorie)
├── ChartsSection
│   ├── CategoryBarChart
│   └── TrendLineChart
└── ExpensesTable (with category filter)
```

### Accessibility
- All interactive elements keyboard accessible
- Color contrast ratios meet WCAG AA standards
- Screen reader labels for charts and metrics
- Focus indicators visible on all inputs

### Mobile Responsiveness Breakpoints
- `sm`: 640px (compact cards begin)
- `md`: 768px (tablet optimizations)
- `lg`: 1024px (desktop layout activates)
- `xl`: 1280px (wider chart spacing)

Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
