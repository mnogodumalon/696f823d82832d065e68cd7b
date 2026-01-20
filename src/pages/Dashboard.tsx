import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl, APP_IDS } from '@/services/livingAppsService';
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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, TrendingDown, TrendingUp, Plus, Filter } from 'lucide-react';

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Ausgaben | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ausgabenData, kategorienData] = await Promise.all([
          LivingAppsService.getAusgaben(),
          LivingAppsService.getKategorien(),
        ]);
        setAusgaben(ausgabenData);
        setKategorien(kategorienData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Kategorie lookup map
  const kategorieMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach((k) => map.set(k.record_id, k));
    return map;
  }, [kategorien]);

  // Current month calculations
  const currentMonth = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthAusgaben = ausgaben.filter((a) => {
      if (!a.fields.datum) return false;
      const date = parseISO(a.fields.datum);
      return date >= monthStart && date <= monthEnd;
    });

    const total = thisMonthAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
    const count = thisMonthAusgaben.length;

    // Previous month comparison
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthEnd);
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);

    const prevMonthAusgaben = ausgaben.filter((a) => {
      if (!a.fields.datum) return false;
      const date = parseISO(a.fields.datum);
      return date >= prevMonthStart && date <= prevMonthEnd;
    });

    const prevTotal = prevMonthAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
    const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

    // Average per day (elapsed days only)
    const daysElapsed = Math.max(1, Math.floor((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const avgPerDay = total / daysElapsed;

    return { total, count, change, avgPerDay, thisMonthAusgaben };
  }, [ausgaben]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    currentMonth.thisMonthAusgaben.forEach((a) => {
      const kategorieId = extractRecordId(a.fields.kategorie);
      if (!kategorieId) return;

      const current = categoryTotals.get(kategorieId) || 0;
      categoryTotals.set(kategorieId, current + (a.fields.betrag || 0));
    });

    const breakdown = Array.from(categoryTotals.entries())
      .map(([kategorieId, total]) => ({
        kategorieId,
        kategorie: kategorieMap.get(kategorieId),
        total,
        percentage: (total / currentMonth.total) * 100,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return breakdown;
  }, [currentMonth, kategorieMap]);

  // Chart data (last 30 days)
  const chartData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 29), end: now });

    const dailyTotals = new Map<string, number>();
    ausgaben.forEach((a) => {
      if (!a.fields.datum) return;
      const dateStr = a.fields.datum.split('T')[0];
      const current = dailyTotals.get(dateStr) || 0;
      dailyTotals.set(dateStr, current + (a.fields.betrag || 0));
    });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: dateStr,
        label: format(day, 'dd. MMM', { locale: de }),
        betrag: dailyTotals.get(dateStr) || 0,
      };
    });
  }, [ausgaben]);

  // Recent expenses
  const recentExpenses = useMemo(() => {
    return [...ausgaben]
      .sort((a, b) => {
        const dateA = a.fields.datum || a.createdat;
        const dateB = b.fields.datum || b.createdat;
        return dateB.localeCompare(dateA);
      })
      .slice(0, 10);
  }, [ausgaben]);

  // Format currency
  const formatCurrency = (value: number | null | undefined): string => {
    if (value == null) return '0,00 €';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  if (ausgaben.length === 0) {
    return <EmptyState onAddClick={() => setDialogOpen(true)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">
          <h1 className="text-xl font-semibold">Ausgabentracker</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Filter className="h-5 w-5" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hidden md:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  Ausgabe hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <AddExpenseForm
                  kategorien={kategorien}
                  onSuccess={() => {
                    setDialogOpen(false);
                    window.location.reload();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[65%_35%] md:gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Hero Card */}
            <Card
              className="border-l-4 border-l-primary shadow-md"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <CardContent className="pt-8 pb-8 px-8">
                <div className="text-sm text-muted-foreground mb-2">Diesen Monat</div>
                <div
                  className="text-7xl font-bold mb-3"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    color: 'hsl(var(--primary))'
                  }}
                >
                  {formatCurrency(currentMonth.total)}
                </div>
                <div className={`flex items-center gap-2 text-sm ${currentMonth.change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentMonth.change <= 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  <span>
                    {Math.abs(currentMonth.change).toFixed(0)}% vs. letzten Monat
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ausgaben Trend (30 Tage)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBetrag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        stroke="hsl(var(--border))"
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        stroke="hsl(var(--border))"
                        tickFormatter={(value) => `${value}€`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Betrag']}
                      />
                      <Area
                        type="monotone"
                        dataKey="betrag"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBetrag)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Letzte Ausgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {recentExpenses.map((expense) => {
                    const kategorieId = extractRecordId(expense.fields.kategorie);
                    const kategorie = kategorieId ? kategorieMap.get(kategorieId) : null;

                    return (
                      <div
                        key={expense.record_id}
                        className="flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer px-4 -mx-4"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {expense.fields.beschreibung || 'Keine Beschreibung'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {kategorie?.fields.kategoriename || 'Keine Kategorie'}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-semibold">
                            {formatCurrency(expense.fields.betrag)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {expense.fields.datum ? format(parseISO(expense.fields.datum), 'dd.MM.yyyy', { locale: de }) : '-'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Quick Stats */}
            <div className="space-y-3">
              <Card>
                <CardContent className="pt-5 pb-5 px-5">
                  <div className="text-xs text-muted-foreground mb-1">Durchschnitt pro Tag</div>
                  <div className="text-3xl font-semibold">{formatCurrency(currentMonth.avgPerDay)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-5 px-5">
                  <div className="text-xs text-muted-foreground mb-1">Anzahl Ausgaben</div>
                  <div className="text-3xl font-semibold">{currentMonth.count}</div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.kategorieId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">
                          {cat.kategorie?.fields.kategoriename || 'Unbekannt'}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {cat.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {/* Hero Card */}
          <Card
            className="border-l-4 border-l-primary shadow-md"
            style={{ background: 'var(--gradient-hero)' }}
          >
            <CardContent className="pt-6 pb-6 px-5">
              <div className="text-sm text-muted-foreground mb-2">Diesen Monat</div>
              <div
                className="text-[56px] leading-none font-bold mb-3"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  color: 'hsl(var(--primary))'
                }}
              >
                {formatCurrency(currentMonth.total)}
              </div>
              <div className={`flex items-center gap-2 text-sm ${currentMonth.change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentMonth.change <= 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(currentMonth.change).toFixed(0)}% vs. letzten Monat
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Categories Horizontal Scroll */}
          <div>
            <h2 className="text-base font-semibold mb-3">Nach Kategorie</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.kategorieId}
                  className="flex-shrink-0 bg-muted rounded-lg px-3 py-2 min-w-[140px]"
                >
                  <div className="text-xs font-medium truncate mb-1">
                    {cat.kategorie?.fields.kategoriename || 'Unbekannt'}
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(cat.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Expenses */}
          <div>
            <h2 className="text-base font-semibold mb-3">Letzte Ausgaben</h2>
            <div className="space-y-0 bg-card rounded-xl overflow-hidden border border-border">
              {recentExpenses.map((expense, idx) => {
                const kategorieId = extractRecordId(expense.fields.kategorie);
                const kategorie = kategorieId ? kategorieMap.get(kategorieId) : null;

                return (
                  <div
                    key={expense.record_id}
                    className={`flex items-center justify-between py-4 px-5 ${idx < recentExpenses.length - 1 ? 'border-b border-border' : ''} active:bg-muted/50 transition-colors min-h-[64px]`}
                    onClick={() => {
                      setSelectedExpense(expense);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {expense.fields.beschreibung || 'Keine Beschreibung'}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {kategorie?.fields.kategoriename || 'Keine Kategorie'}
                      </Badge>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold">
                        {formatCurrency(expense.fields.betrag)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {expense.fields.datum ? format(parseISO(expense.fields.datum), 'dd.MM.', { locale: de }) : '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button (Mobile) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 text-base shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Ausgabe hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <AddExpenseForm
              kategorien={kategorien}
              onSuccess={() => {
                setDialogOpen(false);
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedExpense && (
            <ExpenseDetailView
              expense={selectedExpense}
              kategorie={(() => {
                const id = extractRecordId(selectedExpense.fields.kategorie);
                return id ? kategorieMap.get(id) : null;
              })()}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add Expense Form
function AddExpenseForm({ kategorien, onSuccess }: { kategorien: Kategorien[]; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    beschreibung: '',
    betrag: '',
    datum: format(new Date(), 'yyyy-MM-dd'),
    kategorie: '',
    notizen: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData = {
        beschreibung: formData.beschreibung,
        betrag: parseFloat(formData.betrag),
        datum: formData.datum, // YYYY-MM-DD format for date/date field
        kategorie: formData.kategorie ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie) : undefined,
        notizen: formData.notizen || undefined,
      };

      await LivingAppsService.createAusgabenEntry(apiData);
      onSuccess();
    } catch (err) {
      console.error('Failed to create expense:', err);
      alert('Fehler beim Erstellen der Ausgabe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Ausgabe hinzufügen</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="beschreibung">Beschreibung *</Label>
          <Input
            id="beschreibung"
            placeholder="z.B. Mittagessen"
            value={formData.beschreibung}
            onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="betrag">Betrag (EUR) *</Label>
          <Input
            id="betrag"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.betrag}
            onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="datum">Datum</Label>
          <Input
            id="datum"
            type="date"
            value={formData.datum}
            onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="kategorie">Kategorie *</Label>
          <Select
            value={formData.kategorie}
            onValueChange={(value) => setFormData({ ...formData, kategorie: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategorie wählen..." />
            </SelectTrigger>
            <SelectContent>
              {kategorien.map((k) => (
                <SelectItem key={k.record_id} value={k.record_id}>
                  {k.fields.kategoriename || 'Unbenannt'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notizen">Notizen</Label>
          <Textarea
            id="notizen"
            placeholder="Notizen..."
            value={formData.notizen}
            onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </>
  );
}

// Expense Detail View
function ExpenseDetailView({ expense, kategorie }: { expense: Ausgaben; kategorie: Kategorien | null | undefined }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Ausgaben-Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Beschreibung</div>
          <div className="font-semibold">{expense.fields.beschreibung || '-'}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Betrag</div>
          <div className="text-2xl font-bold" style={{ fontFamily: "'Source Serif 4', serif", color: 'hsl(var(--primary))' }}>
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(expense.fields.betrag || 0)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Datum</div>
            <div className="font-medium">
              {expense.fields.datum ? format(parseISO(expense.fields.datum), 'dd.MM.yyyy', { locale: de }) : '-'}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Kategorie</div>
            <Badge variant="secondary">
              {kategorie?.fields.kategoriename || 'Keine Kategorie'}
            </Badge>
          </div>
        </div>

        {expense.fields.notizen && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Notizen</div>
            <div className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
              {expense.fields.notizen}
            </div>
          </div>
        )}

        {expense.fields.beleg && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Beleg</div>
            <a
              href={expense.fields.beleg}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Beleg anzeigen
            </a>
          </div>
        )}
      </div>
    </>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </div>
  );
}

// Error State
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{error.message}</p>
          <Button variant="outline" onClick={onRetry} className="w-full">
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Empty State
function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">Keine Ausgaben vorhanden</h2>
        <p className="text-muted-foreground mb-6">
          Beginnen Sie mit dem Tracking Ihrer Ausgaben, indem Sie Ihre erste Ausgabe hinzufügen.
        </p>
        <Button onClick={onAddClick} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Erste Ausgabe hinzufügen
        </Button>
      </div>
    </div>
  );
}
