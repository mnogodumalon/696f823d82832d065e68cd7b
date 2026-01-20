import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';

// Utility function for German currency formatting
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '0,00 €';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription>
          {error.message}
          <Button variant="outline" onClick={onRetry} className="mt-4 w-full">
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Empty State Component
function EmptyState({ onAddExpense }: { onAddExpense: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Noch keine Ausgaben</h3>
          <p className="text-muted-foreground mb-4">
            Beginnen Sie mit dem Tracking Ihrer Ausgaben, indem Sie Ihre erste Ausgabe hinzufügen.
          </p>
          <Button onClick={onAddExpense} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Erste Ausgabe hinzufügen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Expense Form Component
function AddExpenseForm({ kategorien, onSuccess }: { kategorien: Kategorien[]; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    datum: format(new Date(), 'yyyy-MM-dd'),
    beschreibung: '',
    betrag: '',
    kategorie: '',
    notizen: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.beschreibung || !formData.betrag) return;

    setSubmitting(true);
    try {
      const apiData = {
        datum: formData.datum,
        beschreibung: formData.beschreibung,
        betrag: parseFloat(formData.betrag),
        kategorie: formData.kategorie ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie) : undefined,
        notizen: formData.notizen || undefined,
      };

      await LivingAppsService.createAusgabenEntry(apiData);

      // Reset form
      setFormData({
        datum: format(new Date(), 'yyyy-MM-dd'),
        beschreibung: '',
        betrag: '',
        kategorie: '',
        notizen: '',
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to create expense:', err);
      alert('Fehler beim Speichern der Ausgabe');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="datum">Datum</Label>
        <Input
          id="datum"
          type="date"
          value={formData.datum}
          onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beschreibung">Beschreibung *</Label>
        <Input
          id="beschreibung"
          type="text"
          value={formData.beschreibung}
          onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
          placeholder="z.B. Einkauf Supermarkt"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="betrag">Betrag (EUR) *</Label>
        <Input
          id="betrag"
          type="number"
          step="0.01"
          value={formData.betrag}
          onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
          placeholder="0,00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kategorie">Kategorie</Label>
        <Select value={formData.kategorie} onValueChange={(value) => setFormData({ ...formData, kategorie: value })}>
          <SelectTrigger id="kategorie">
            <SelectValue placeholder="Kategorie wählen..." />
          </SelectTrigger>
          <SelectContent>
            {kategorien.map((kat) => (
              <SelectItem key={kat.record_id} value={kat.record_id}>
                {kat.fields.kategoriename || 'Unbenannt'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notizen">Notizen</Label>
        <Textarea
          id="notizen"
          value={formData.notizen}
          onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
          placeholder="Zusätzliche Informationen..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Wird gespeichert...' : 'Ausgabe speichern'}
      </Button>
    </form>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [ausgabenData, kategorienData] = await Promise.all([
        LivingAppsService.getAusgaben(),
        LivingAppsService.getKategorien(),
      ]);
      setAusgaben(ausgabenData);
      setKategorien(kategorienData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Create kategorie lookup map
  const kategorieMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach((kat) => map.set(kat.record_id, kat));
    return map;
  }, [kategorien]);

  // Calculate current month expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return ausgaben.filter((ausgabe) => {
      if (!ausgabe.fields.datum) return false;
      const date = parseISO(ausgabe.fields.datum);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    });
  }, [ausgaben]);

  // Calculate previous month expenses
  const previousMonthExpenses = useMemo(() => {
    const lastMonth = subMonths(new Date(), 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth();

    return ausgaben.filter((ausgabe) => {
      if (!ausgabe.fields.datum) return false;
      const date = parseISO(ausgabe.fields.datum);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [ausgaben]);

  // Calculate hero KPI
  const monthlyTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, ausgabe) => sum + (ausgabe.fields.betrag || 0), 0);
  }, [currentMonthExpenses]);

  const previousMonthTotal = useMemo(() => {
    return previousMonthExpenses.reduce((sum, ausgabe) => sum + (ausgabe.fields.betrag || 0), 0);
  }, [previousMonthExpenses]);

  const monthlyChange = useMemo(() => {
    if (previousMonthTotal === 0) return null;
    return ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100;
  }, [monthlyTotal, previousMonthTotal]);

  // Calculate last 7 days total
  const last7DaysTotal = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return ausgaben
      .filter((ausgabe) => {
        if (!ausgabe.fields.datum) return false;
        const date = parseISO(ausgabe.fields.datum);
        return date >= sevenDaysAgo;
      })
      .reduce((sum, ausgabe) => sum + (ausgabe.fields.betrag || 0), 0);
  }, [ausgaben]);

  // Calculate average per day
  const averagePerDay = useMemo(() => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    return dayOfMonth > 0 ? monthlyTotal / dayOfMonth : 0;
  }, [monthlyTotal]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = new Map<string, { name: string; total: number }>();

    currentMonthExpenses.forEach((ausgabe) => {
      const kategorieId = extractRecordId(ausgabe.fields.kategorie);
      if (!kategorieId) return;

      const kategorie = kategorieMap.get(kategorieId);
      const name = kategorie?.fields.kategoriename || 'Unbekannt';
      const current = breakdown.get(kategorieId) || { name, total: 0 };
      breakdown.set(kategorieId, { name, total: current.total + (ausgabe.fields.betrag || 0) });
    });

    return Array.from(breakdown.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [currentMonthExpenses, kategorieMap]);

  // Calculate chart data for last 30 days
  const chartData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    const dailyTotals = new Map<string, number>();

    ausgaben.forEach((ausgabe) => {
      if (!ausgabe.fields.datum) return;
      const dateStr = ausgabe.fields.datum.split('T')[0];
      const current = dailyTotals.get(dateStr) || 0;
      dailyTotals.set(dateStr, current + (ausgabe.fields.betrag || 0));
    });

    return days.map((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const total = dailyTotals.get(dateStr) || 0;

      // Show every 5th day label on mobile, all on desktop
      const showLabel = index % 5 === 0 || index === days.length - 1;

      return {
        date: dateStr,
        label: showLabel ? format(day, 'dd.MM', { locale: de }) : '',
        betrag: total,
      };
    });
  }, [ausgaben]);

  // Recent expenses (sorted by date)
  const recentExpenses = useMemo(() => {
    return [...ausgaben]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 8);
  }, [ausgaben]);

  function handleExpenseAdded() {
    setDialogOpen(false);
    fetchData();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;
  if (ausgaben.length === 0) {
    return <EmptyState onAddExpense={() => setDialogOpen(true)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-semibold">Ausgabentracker</h1>

            {/* Desktop action button */}
            <div className="hidden md:flex items-center gap-4">
              {/* Quick stats inline */}
              <div className="flex gap-3">
                <div className="px-3 py-2 bg-muted rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Letzte 7 Tage</div>
                  <div className="text-base font-semibold">{formatCurrency(last7DaysTotal)}</div>
                </div>
                <div className="px-3 py-2 bg-muted rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Durchschnitt/Tag</div>
                  <div className="text-base font-semibold">{formatCurrency(averagePerDay)}</div>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Neue Ausgabe
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Neue Ausgabe hinzufügen</DialogTitle>
                  </DialogHeader>
                  <AddExpenseForm kategorien={kategorien} onSuccess={handleExpenseAdded} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Mobile quick stats */}
        <div className="md:hidden mb-4 flex gap-3">
          <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Letzte 7 Tage</div>
            <div className="text-base font-semibold">{formatCurrency(last7DaysTotal)}</div>
          </div>
          <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Durchschnitt/Tag</div>
            <div className="text-base font-semibold">{formatCurrency(averagePerDay)}</div>
          </div>
        </div>

        {/* 2-column layout (asymmetric on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column (2/3 width on desktop) */}
          <div className="md:col-span-2 space-y-6">
            {/* Hero KPI */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="text-sm md:text-base text-muted-foreground mb-2">Ausgaben diesen Monat</div>
                <div className="text-5xl md:text-6xl font-bold mb-3">{formatCurrency(monthlyTotal)}</div>
                {monthlyChange !== null && (
                  <div className={`text-sm flex items-center justify-center gap-1 ${monthlyChange >= 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                    {monthlyChange >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(monthlyChange).toFixed(1)}% vs. Vormonat
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spending Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Entwicklung (Letzte 30 Tage)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBetrag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--chart-gradient-start))" />
                          <stop offset="100%" stopColor="hsl(var(--chart-gradient-end))" />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `${value}€`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Betrag']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            const date = payload[0].payload.date;
                            return format(parseISO(date), 'dd. MMMM yyyy', { locale: de });
                          }
                          return label;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="betrag"
                        stroke="hsl(var(--accent))"
                        strokeWidth={3}
                        fill="url(#colorBetrag)"
                        strokeLinecap="round"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column (1/3 width on desktop) */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Kategorien für diesen Monat
                  </p>
                ) : (
                  categoryBreakdown.map((cat, index) => {
                    const percentage = monthlyTotal > 0 ? (cat.total / monthlyTotal) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{cat.name}</span>
                          <span className="text-sm font-semibold">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              opacity: 0.4 + (percentage / 100) * 0.6,
                              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Letzte Ausgaben</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentExpenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Ausgaben vorhanden
                  </p>
                ) : (
                  recentExpenses.slice(0, window.innerWidth < 768 ? 5 : 8).map((ausgabe) => {
                    const kategorieId = extractRecordId(ausgabe.fields.kategorie);
                    const kategorie = kategorieId ? kategorieMap.get(kategorieId) : null;

                    return (
                      <div
                        key={ausgabe.record_id}
                        className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium line-clamp-1">
                            {ausgabe.fields.beschreibung || 'Keine Beschreibung'}
                          </span>
                          <span className="text-base font-semibold ml-2 flex-shrink-0">
                            {formatCurrency(ausgabe.fields.betrag)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          {kategorie ? (
                            <Badge variant="secondary" className="text-xs">
                              {kategorie.fields.kategoriename || 'Unbekannt'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Keine Kategorie</span>
                          )}
                          <span className="text-muted-foreground">
                            {ausgabe.fields.datum
                              ? format(parseISO(ausgabe.fields.datum), 'dd.MM.yyyy', { locale: de })
                              : 'Kein Datum'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile fixed bottom action button */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-20">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 shadow-lg text-base">
              <PlusCircle className="mr-2 h-5 w-5" />
              Neue Ausgabe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neue Ausgabe hinzufügen</DialogTitle>
            </DialogHeader>
            <AddExpenseForm kategorien={kategorien} onSuccess={handleExpenseAdded} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
