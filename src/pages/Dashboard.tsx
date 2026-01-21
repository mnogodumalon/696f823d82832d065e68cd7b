import { useEffect, useState, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  Wallet,
  Receipt,
  PieChart as PieChartIcon,
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  // State management
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [timePeriod, setTimePeriod] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create category lookup map for fast access
  const kategorienMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach(kat => {
      map.set(kat.record_id, kat);
    });
    return map;
  }, [kategorien]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [kategorienData, ausgabenData] = await Promise.all([
          LivingAppsService.getKategorien(),
          LivingAppsService.getAusgaben()
        ]);

        setKategorien(kategorienData);
        setAusgaben(ausgabenData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Fehler beim Laden der Daten. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter by time period
  const filteredByTime = useMemo(() => {
    if (timePeriod === 'all') return ausgaben;

    const days = parseInt(timePeriod);
    const cutoffDate = subDays(new Date(), days);

    return ausgaben.filter(expense => {
      if (!expense.fields.datum) return false;
      const expenseDate = parseISO(expense.fields.datum);
      return isAfter(expenseDate, cutoffDate);
    });
  }, [ausgaben, timePeriod]);

  // Filter by category
  const filteredAusgaben = useMemo(() => {
    if (selectedCategory === 'all') return filteredByTime;

    return filteredByTime.filter(expense => {
      const categoryId = extractRecordId(expense.fields.kategorie);
      return categoryId === selectedCategory;
    });
  }, [filteredByTime, selectedCategory]);

  // Calculate hero metrics
  const totalSpending = useMemo(() => {
    return filteredAusgaben.reduce((sum, expense) => sum + (expense.fields.betrag || 0), 0);
  }, [filteredAusgaben]);

  const avgPerDay = useMemo(() => {
    if (timePeriod === 'all' || timePeriod === '0') return 0;
    const days = parseInt(timePeriod);
    return totalSpending / days;
  }, [totalSpending, timePeriod]);

  const expenseCount = useMemo(() => {
    return filteredAusgaben.length;
  }, [filteredAusgaben]);

  // Calculate spending by category for top category metric and bar chart
  const categorySpending = useMemo(() => {
    const spending = new Map<string, { name: string; value: number }>();

    filteredAusgaben.forEach(expense => {
      const categoryId = extractRecordId(expense.fields.kategorie);
      const categoryName = categoryId
        ? (kategorienMap.get(categoryId)?.fields.kategoriename || 'Nicht kategorisiert')
        : 'Nicht kategorisiert';

      const current = spending.get(categoryName) || { name: categoryName, value: 0 };
      current.value += expense.fields.betrag || 0;
      spending.set(categoryName, current);
    });

    return Array.from(spending.values()).sort((a, b) => b.value - a.value);
  }, [filteredAusgaben, kategorienMap]);

  const topCategory = useMemo(() => {
    return categorySpending.length > 0 ? categorySpending[0] : null;
  }, [categorySpending]);

  // Calculate daily spending trend for line chart
  const dailySpending = useMemo(() => {
    const spending = new Map<string, number>();

    filteredAusgaben.forEach(expense => {
      if (!expense.fields.datum) return;
      const date = expense.fields.datum;
      spending.set(date, (spending.get(date) || 0) + (expense.fields.betrag || 0));
    });

    return Array.from(spending.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAusgaben]);

  // Format helpers
  const formatEUR = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Kein Datum';
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy', { locale: de });
    } catch {
      return dateString;
    }
  };

  const getCategoryName = (categoryUrl: string | undefined) => {
    if (!categoryUrl) return 'Nicht kategorisiert';
    const categoryId = extractRecordId(categoryUrl);
    if (!categoryId) return 'Nicht kategorisiert';
    return kategorienMap.get(categoryId)?.fields.kategoriename || 'Nicht kategorisiert';
  };

  // Get time period label
  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case '7': return 'Letzte 7 Tage';
      case '30': return 'Letzte 30 Tage';
      case '90': return 'Letzte 90 Tage';
      case '365': return 'Letztes Jahr';
      case 'all': return 'Alle Zeit';
      default: return `Letzte ${timePeriod} Tage`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48 mt-4 md:mt-0" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Fehler beim Laden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
            >
              Erneut versuchen
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state (no expenses at all)
  if (ausgaben.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ausgabentracker Dashboard</h1>
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Ausgaben erfasst</h3>
            <p className="text-gray-600 mb-6">
              Fügen Sie Ihre erste Ausgabe hinzu, um die Auswertung zu sehen.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No expenses in selected period
  const noDataInPeriod = filteredAusgaben.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Ausgabentracker Dashboard</h1>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Letzte 7 Tage</SelectItem>
              <SelectItem value="30">Letzte 30 Tage</SelectItem>
              <SelectItem value="90">Letzte 90 Tage</SelectItem>
              <SelectItem value="365">Letztes Jahr</SelectItem>
              <SelectItem value="all">Alle Zeit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-600">
          <Calendar className="inline h-4 w-4 mr-1" />
          Zeitraum: {getTimePeriodLabel()}
        </p>
      </div>

      {noDataInPeriod ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Keine Ausgaben im gewählten Zeitraum gefunden. Wählen Sie einen anderen Zeitraum aus.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Hero Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Spending */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Gesamtausgaben
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold tabular-nums text-primary">
                  {formatEUR(totalSpending)}
                </div>
              </CardContent>
            </Card>

            {/* Average per Day */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ø pro Tag
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold tabular-nums text-gray-900">
                  {formatEUR(avgPerDay)}
                </div>
              </CardContent>
            </Card>

            {/* Expense Count */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Anzahl Ausgaben
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold tabular-nums text-gray-900">
                  {expenseCount}
                </div>
              </CardContent>
            </Card>

            {/* Top Category */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Top Kategorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topCategory ? (
                  <>
                    <div className="text-xl font-semibold text-gray-900 mb-1 truncate">
                      {topCategory.name}
                    </div>
                    <div className="text-sm font-bold tabular-nums text-primary">
                      {formatEUR(topCategory.value)}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">Keine Daten</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Bar Chart - Spending by Category */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Ausgaben pro Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                {categorySpending.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categorySpending}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis
                        dataKey="name"
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `${value}€`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatEUR(value)}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Keine Kategorien vorhanden
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Chart - Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Ausgaben-Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {dailySpending.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailySpending}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => {
                          try {
                            return format(parseISO(value), 'dd.MM', { locale: de });
                          } catch {
                            return value;
                          }
                        }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `${value}€`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatEUR(value)}
                        labelFormatter={(label) => formatDate(label)}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Keine Daten verfügbar
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-xl font-semibold">Letzte Ausgaben</CardTitle>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder="Alle Kategorien" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    {kategorien.map(kat => (
                      <SelectItem key={kat.record_id} value={kat.record_id}>
                        {kat.fields.kategoriename || 'Unbenannt'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wide">Datum</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide">Kategorie</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide">Beschreibung</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-right">Betrag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAusgaben
                      .sort((a, b) => {
                        const dateA = a.fields.datum || '';
                        const dateB = b.fields.datum || '';
                        return dateB.localeCompare(dateA); // Most recent first
                      })
                      .slice(0, 10)
                      .map(expense => (
                        <TableRow key={expense.record_id}>
                          <TableCell className="text-sm">
                            {formatDate(expense.fields.datum)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryName(expense.fields.kategorie)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {expense.fields.beschreibung || '-'}
                          </TableCell>
                          <TableCell className="text-sm font-semibold tabular-nums text-right">
                            {formatEUR(expense.fields.betrag || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredAusgaben
                  .sort((a, b) => {
                    const dateA = a.fields.datum || '';
                    const dateB = b.fields.datum || '';
                    return dateB.localeCompare(dateA);
                  })
                  .slice(0, 10)
                  .map(expense => (
                    <Card key={expense.record_id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-gray-600">
                            {formatDate(expense.fields.datum)}
                          </span>
                          <span className="text-lg font-bold tabular-nums text-primary">
                            {formatEUR(expense.fields.betrag || 0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {expense.fields.beschreibung || 'Keine Beschreibung'}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryName(expense.fields.kategorie)}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {filteredAusgaben.length > 10 && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Zeige 10 von {filteredAusgaben.length} Ausgaben
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
