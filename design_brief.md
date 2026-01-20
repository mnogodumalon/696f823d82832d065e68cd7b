# Dashboard Design Brief: Ausgabentracker

## 1. App Analysis
- **Appgroup**: Ausgabentracker (Expense Tracker)
- **Apps**:
  - **Kategorien**: Master data for expense categories (e.g., Lebensmittel, Transport, Unterhaltung)
  - **Ausgaben**: Main expense records with amount (EUR), date, category reference, description, receipt upload, and notes
  - **Ausgabe erfassen**: Input form for capturing new expenses (mirrors Ausgaben structure)
- **Key Data**:
  - Expense amounts (betrag) in EUR with decimal precision
  - Dates (datum) for temporal analysis
  - Category relationships (kategorie) via applookup to Kategorien app
  - Optional receipt attachments and notes for audit trail

## 2. User Goals & KPIs

**User Persona**: Someone tracking personal or business expenses who wants to understand spending patterns, control budget, and identify cost drivers.

### Primary KPIs
- **Total Expenses (All Time)**: The cumulative spending amount - shows overall financial commitment and serves as baseline context
- **This Month's Expenses**: Current month spending - the most actionable metric for immediate budget control
- **Average Expense**: Mean transaction value - helps identify if spending is dominated by many small purchases or few large ones
- **Expense Count**: Total number of transactions - shows spending frequency and transaction volume

### Secondary Metrics
- **Expenses by Category**: Distribution of spending across categories - identifies where money goes
- **Monthly Trend**: Spending over time - reveals seasonal patterns and spending trajectory
- **Top Categories**: Highest-spending categories this month - highlights current cost drivers

## 3. Visualizations

### Total by Category (Pie Chart)
- **Type**: Pie Chart
- **Data Source**: Ausgaben app, aggregating `betrag` grouped by `kategorie` (resolved via lookup to Kategorien app)
- **Purpose**: Shows proportional distribution of spending - user instantly sees which category consumes most budget
- **Calculation**: Sum all `betrag` values per category, calculate percentage of total
- **Colors**: Use distinct colors per category (utilize recharts color palette)
- **Label**: Category name with EUR amount and percentage

### Monthly Spending Trend (Line Chart)
- **Type**: Line Chart with area fill
- **Data Source**: Ausgaben app, aggregating `betrag` by month from `datum` field
- **Purpose**: Reveals spending patterns over time - user can spot trends, seasonal spikes, or budget improvements
- **X-Axis**: Month labels (e.g., "Jan", "Feb", "Mär")
- **Y-Axis**: Total EUR amount
- **Calculation**: Group expenses by month (extract YYYY-MM from `datum`), sum `betrag` per month, sort chronologically
- **Range**: Last 6 months of data for meaningful trend visibility
- **Style**: Smooth curve with gradient fill below line, grid lines for readability

### Category Breakdown (Bar Chart)
- **Type**: Horizontal Bar Chart
- **Data Source**: Ausgaben app, aggregating `betrag` by `kategorie`
- **Purpose**: Compares absolute spending amounts across categories - easier to compare exact values than pie chart
- **X-Axis**: Total EUR amount
- **Y-Axis**: Category names (from Kategorien app via lookup)
- **Calculation**: Sum `betrag` per category, sort descending by total
- **Style**: Single color bars with value labels at end of each bar

### Recent Expenses Table
- **Type**: Data table with pagination
- **Data Source**: Ausgaben app, most recent records
- **Purpose**: Provides transaction-level detail - user can audit individual expenses and verify data accuracy
- **Columns**:
  - Datum (formatted as DD.MM.YYYY)
  - Beschreibung (expense description)
  - Kategorie (resolved category name)
  - Betrag (formatted as EUR with 2 decimals)
- **Rows**: Last 10 expenses, sorted by date descending
- **Features**: Clickable category filter, responsive column hiding on mobile

## 4. Layout

### Desktop Layout (≥768px)
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Ausgabentracker Dashboard"                     │
│ Subheader: Current date range or "Alle Ausgaben"        │
├─────────────────────────────────────────────────────────┤
│ KPI Cards Row (4 cards, equal width)                    │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐│
│ │Total      │ │This Month │ │Avg Expense│ │Count     ││
│ │€12,345.67 │ │€1,234.56  │ │€123.45    │ │100       ││
│ └───────────┘ └───────────┘ └───────────┘ └──────────┘│
├─────────────────────────────────────────────────────────┤
│ Charts Grid (2 columns, 2 rows)                         │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Monthly Trend       │ │ Category Breakdown  │        │
│ │ (Line Chart)        │ │ (Bar Chart)         │        │
│ │ 6 months            │ │ All categories      │        │
│ └─────────────────────┘ └─────────────────────┘        │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Category Split      │ │ Recent Expenses     │        │
│ │ (Pie Chart)         │ │ (Table, last 10)    │        │
│ └─────────────────────┘ └─────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌──────────────────┐
│ Header           │
│ Ausgabentracker  │
├──────────────────┤
│ Total Expenses   │
│ €12,345.67       │
├──────────────────┤
│ This Month       │
│ €1,234.56        │
├──────────────────┤
│ Avg Expense      │
│ €123.45          │
├──────────────────┤
│ Expense Count    │
│ 100              │
├──────────────────┤
│ Monthly Trend    │
│ (Full width)     │
│ ▁▃▄▅█▇          │
├──────────────────┤
│ Category Split   │
│ (Full width)     │
│ 🟦🟩🟨🟥        │
├──────────────────┤
│ Recent Expenses  │
│ (Table, 2 cols)  │
│ Date | Amt       │
│ Desc (subtitle)  │
└──────────────────┘
```

## 5. Theme & Style

### Color Palette
```css
:root {
  --primary: 220 70% 50%;        /* Blue - primary actions, chart accents */
  --secondary: 220 30% 90%;      /* Light blue-gray - secondary elements */
  --accent: 45 93% 47%;          /* Gold/amber - highlight positive trends */
  --destructive: 0 72% 51%;      /* Red - high spending alerts */
  --success: 142 71% 45%;        /* Green - budget goals met */
  --muted: 220 13% 91%;          /* Soft gray - backgrounds, borders */
  --card: 0 0% 100%;             /* White - card backgrounds */
  --border: 220 13% 87%;         /* Light gray - subtle borders */
  --foreground: 222 47% 11%;     /* Dark blue-gray - primary text */
  --muted-foreground: 215 16% 47%; /* Medium gray - secondary text */
}
```

### Chart Colors (for categories)
- Use recharts built-in categorical palette: `hsl(220, 70%, 50%)`, `hsl(142, 71%, 45%)`, `hsl(45, 93%, 47%)`, `hsl(280, 65%, 60%)`, `hsl(340, 75%, 55%)`, `hsl(160, 60%, 45%)`
- Ensure sufficient contrast for accessibility

### Typography
- **Headings**:
  - H1 (Dashboard title): 2rem (32px), font-weight 700, letter-spacing tight
  - H2 (Section titles): 1.5rem (24px), font-weight 600
  - H3 (Card titles): 0.875rem (14px), font-weight 500, uppercase tracking-wide, muted-foreground
- **Body**: 1rem (16px), font-weight 400, line-height 1.5
- **Numbers/KPIs**:
  - Large: 2.5rem (40px), font-weight 700, tabular-nums for alignment
  - Medium: 1.5rem (24px), font-weight 600, tabular-nums
  - Small (table): 0.875rem (14px), font-weight 500, tabular-nums
- **Currency**: Always prefix with "€", 2 decimal places, thousand separators (e.g., "€1.234,56" German format OR "€1,234.56" international)

### Component Styling
- **Cards**:
  - Shadow: subtle `shadow-sm` (0 1px 2px rgba(0,0,0,0.05))
  - Border: 1px solid var(--border)
  - Radius: rounded-lg (0.5rem / 8px)
  - Padding: p-6 (1.5rem / 24px)
  - Hover: subtle shadow increase for interactive elements
- **Charts**:
  - Grid: Light gray horizontal lines for readability
  - Axes: Medium gray, 12px font size
  - Tooltips: White background, shadow, border, bold values
  - Height: 300px for desktop, 250px for mobile
- **Spacing**:
  - Grid gap: gap-6 (1.5rem) for desktop, gap-4 (1rem) for mobile
  - Section spacing: mb-8 (2rem) between major sections
  - Card internal spacing: consistent p-6

### Responsive Breakpoints
- Mobile: < 768px (stack all cards and charts vertically)
- Desktop: ≥ 768px (grid layouts as shown above)

## 6. Data Handling Notes

### API Calls
1. **Fetch Kategorien** first to build category lookup map (kategorie_id → kategoriename)
2. **Fetch Ausgaben** with all records to calculate KPIs and visualizations

### Date Handling
- **Format**: Ausgaben `datum` field is `YYYY-MM-DD` (date/date type)
- **Current Month**: Filter expenses where `datum` starts with current YYYY-MM
- **Monthly Trend**: Group by YYYY-MM substring, show last 6 months
- **Display Format**: Use `date-fns` format with German locale: `DD.MM.YYYY` or `MMM YYYY` for charts

### Category Resolution
- **applookup field**: `kategorie` is URL like `https://my.living-apps.de/rest/apps/696f822571ddec20b35bc68e/records/{record_id}`
- **Extract record_id**: Use `extractRecordId(kategorieUrl)` helper from livingAppsService
- **Handle null**: Some expenses may not have category - display as "Unkategorisiert" or filter out
- **Lookup**: Match record_id from Ausgaben to Kategorien records to get `kategoriename`

### Number Formatting
- **Currency**: Format as EUR with 2 decimals - use `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`
- **Calculations**: Sum `betrag` values (type: number/decimal), handle null as 0
- **Average**: Total sum / count of records with non-null betrag

### Error Handling
- **Loading states**: Show skeleton loaders for cards and charts during API fetch
- **Empty state**: If no Ausgaben records, show friendly message "Noch keine Ausgaben erfasst"
- **API errors**: Display error message with retry option
- **Missing categories**: Handle gracefully if kategorie lookup fails (show URL or "Unbekannt")

### Performance
- **Data fetch**: Single fetch for each app on component mount
- **Caching**: Consider caching in React state, no real-time updates needed
- **Chart data**: Pre-process data once into chart-ready format, memoize with useMemo

---

## Implementation Checklist
- [ ] Fetch data from Kategorien and Ausgaben apps
- [ ] Build category lookup map (record_id → kategoriename)
- [ ] Calculate KPIs: Total, This Month, Average, Count
- [ ] Prepare chart data: Monthly trend (6 months), Category totals
- [ ] Render 4 KPI cards with icons and formatting
- [ ] Render Monthly Trend line chart with recharts
- [ ] Render Category Breakdown bar chart
- [ ] Render Category Split pie chart
- [ ] Render Recent Expenses table (last 10)
- [ ] Implement responsive layout (grid → stack on mobile)
- [ ] Add loading skeletons and error handling
- [ ] Format currencies with EUR symbol and German locale
- [ ] Format dates with DD.MM.YYYY
- [ ] Test with empty data, missing categories, null values
