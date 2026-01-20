import { useEffect, useState, useMemo } from 'react'
import type { Ausgaben, Kategorien } from '@/types/app'
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format, startOfMonth, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { TrendingUp, Euro, Calculator, FileText } from 'lucide-react'

// Chart colors matching design brief
const CHART_COLORS = [
  'hsl(220, 70%, 50%)',
  'hsl(142, 71%, 45%)',
  'hsl(45, 93%, 47%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(160, 60%, 45%)',
]

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([])
  const [kategorien, setKategorien] = useState<Kategorien[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const [kategorienData, ausgabenData] = await Promise.all([
          LivingAppsService.getKategorien(),
          LivingAppsService.getAusgaben(),
        ])
        setKategorien(kategorienData)
        setAusgaben(ausgabenData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Build category lookup map (record_id -> kategoriename)
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    kategorien.forEach((kat) => {
      map.set(kat.record_id, kat.fields.kategoriename || 'Unbekannt')
    })
    return map
  }, [kategorien])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = ausgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0)
    const count = ausgaben.length

    // Current month filter
    const currentMonth = format(new Date(), 'yyyy-MM')
    const thisMonthExpenses = ausgaben.filter((a) => a.fields.datum?.startsWith(currentMonth))
    const thisMonthTotal = thisMonthExpenses.reduce((sum, a) => sum + (a.fields.betrag || 0), 0)

    // Average
    const average = count > 0 ? total / count : 0

    return { total, thisMonthTotal, average, count }
  }, [ausgaben])

  // Prepare monthly trend data (last 6 months)
  const monthlyData = useMemo(() => {
    if (ausgaben.length === 0) return []

    // Group by month
    const monthMap = new Map<string, number>()
    ausgaben.forEach((a) => {
      if (a.fields.datum) {
        const month = a.fields.datum.substring(0, 7) // YYYY-MM
        monthMap.set(month, (monthMap.get(month) || 0) + (a.fields.betrag || 0))
      }
    })

    // Sort and take last 6 months
    const sortedMonths = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)

    return sortedMonths.map(([month, total]) => ({
      month: format(parseISO(`${month}-01`), 'MMM', { locale: de }),
      total: Math.round(total * 100) / 100,
    }))
  }, [ausgaben])

  // Prepare category breakdown data
  const categoryData = useMemo(() => {
    const categoryTotals = new Map<string, number>()

    ausgaben.forEach((a) => {
      const categoryUrl = a.fields.kategorie
      const categoryId = extractRecordId(categoryUrl)
      const categoryName = categoryId ? categoryMap.get(categoryId) || 'Unkategorisiert' : 'Unkategorisiert'

      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + (a.fields.betrag || 0))
    })

    return Array.from(categoryTotals.entries())
      .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
  }, [ausgaben, categoryMap])

  // Prepare pie chart data
  const pieData = useMemo(() => {
    return categoryData.map((item) => ({
      name: item.name,
      value: item.total,
    }))
  }, [categoryData])

  // Recent expenses (last 10)
  const recentExpenses = useMemo(() => {
    return [...ausgaben]
      .sort((a, b) => {
        const dateA = a.fields.datum || ''
        const dateB = b.fields.datum || ''
        return dateB.localeCompare(dateA)
      })
      .slice(0, 10)
  }, [ausgaben])

  // Currency formatter
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-semibold">{payload[0].payload.name || payload[0].payload.month}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px]" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Fehler beim Laden der Daten: {error}</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Empty state
  if (ausgaben.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Ausgabentracker Dashboard</h1>
        <p className="text-muted-foreground mb-8">Übersicht Ihrer Ausgaben</p>
        <Alert>
          <AlertDescription>
            Noch keine Ausgaben erfasst. Erstellen Sie Ihre erste Ausgabe, um das Dashboard zu sehen.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Ausgabentracker Dashboard</h1>
        <p className="text-muted-foreground">
          Übersicht Ihrer Ausgaben • Stand: {format(new Date(), 'dd.MM.yyyy', { locale: de })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Gesamt
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold tabular-nums">{formatCurrency(kpis.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">Alle Ausgaben</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Dieser Monat
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold tabular-nums">{formatCurrency(kpis.thisMonthTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">{format(new Date(), 'MMMM yyyy', { locale: de })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Durchschnitt
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold tabular-nums">{formatCurrency(kpis.average)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pro Ausgabe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Anzahl
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold tabular-nums">{kpis.count}</div>
            <p className="text-xs text-muted-foreground mt-1">Ausgaben erfasst</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Monatlicher Verlauf</CardTitle>
            <p className="text-sm text-muted-foreground">Ausgaben der letzten 6 Monate</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(220, 70%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(220, 70%, 50%)', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Ausgaben nach Kategorie</CardTitle>
            <p className="text-sm text-muted-foreground">Vergleich der Ausgabenkategorien</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `€${value}`} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="hsl(220, 70%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Split Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Kategorienverteilung</CardTitle>
            <p className="text-sm text-muted-foreground">Prozentuale Aufteilung der Ausgaben</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Letzte Ausgaben</CardTitle>
            <p className="text-sm text-muted-foreground">Die 10 neuesten Einträge</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Datum</TableHead>
                    <TableHead className="hidden md:table-cell">Beschreibung</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentExpenses.map((expense) => {
                    const categoryId = extractRecordId(expense.fields.kategorie)
                    const categoryName = categoryId ? categoryMap.get(categoryId) || 'N/A' : 'N/A'

                    return (
                      <TableRow key={expense.record_id}>
                        <TableCell className="font-medium tabular-nums">
                          {expense.fields.datum ? format(parseISO(expense.fields.datum), 'dd.MM.yy', { locale: de }) : '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {expense.fields.beschreibung || '-'}
                        </TableCell>
                        <TableCell className="text-sm">{categoryName}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(expense.fields.betrag || 0)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
