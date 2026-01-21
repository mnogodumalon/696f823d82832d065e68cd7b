import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien, CreateAusgabeErfassen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Plus, TrendingUp, TrendingDown, Receipt, FileText } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ausgabenData, kategorienData] = await Promise.all([
          LivingAppsService.getAusgaben(),
          LivingAppsService.getKategorien()
        ]);
        setAusgaben(ausgabenData);
        setKategorien(kategorienData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Create kategorie lookup map
  const kategorieMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach(kat => map.set(kat.record_id, kat));
    return map;
  }, [kategorien]);

  // Filter expenses for selected month
  const currentMonthExpenses = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);

    return ausgaben.filter(exp => {
      if (!exp.fields.datum) return false;
      const expDate = parseISO(exp.fields.datum);
      return expDate >= monthStart && expDate <= monthEnd;
    });
  }, [ausgaben, selectedMonth]);

  // Calculate previous month for comparison
  const previousMonthExpenses = useMemo(() => {
    const prevMonth = subMonths(selectedMonth, 1);
    const monthStart = startOfMonth(prevMonth);
    const monthEnd = endOfMonth(prevMonth);

    return ausgaben.filter(exp => {
      if (!exp.fields.datum) return false;
      const expDate = parseISO(exp.fields.datum);
      return expDate >= monthStart && expDate <= monthEnd;
    });
  }, [ausgaben, selectedMonth]);

  // Hero KPI: Total monthly spending
  const monthlyTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, exp) => sum + (exp.fields.betrag || 0), 0);
  }, [currentMonthExpenses]);

  const previousMonthTotal = useMemo(() => {
    return previousMonthExpenses.reduce((sum, exp) => sum + (exp.fields.betrag || 0), 0);
  }, [previousMonthExpenses]);

  const monthlyChange = useMemo(() => {
    if (previousMonthTotal === 0) return null;
    return ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100;
  }, [monthlyTotal, previousMonthTotal]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryTotals = new Map<string, { name: string; total: number; count: number }>();

    currentMonthExpenses.forEach(exp => {
      const katId = extractRecordId(exp.fields.kategorie);
      if (!katId) return;

      const kategorie = kategorieMap.get(katId);
      const name = kategorie?.fields.kategoriename || 'Unbekannt';
      const current = categoryTotals.get(katId) || { name, total: 0, count: 0 };

      categoryTotals.set(katId, {
        name,
        total: current.total + (exp.fields.betrag || 0),
        count: current.count + 1
      });
    });

    return Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total);
  }, [currentMonthExpenses, kategorieMap]);

  // Chart data: last 30 days
  const chartData = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const dailyTotals = new Map<string, number>();

    currentMonthExpenses.forEach(exp => {
      if (!exp.fields.datum) return;
      const dateKey = exp.fields.datum.split('T')[0];
      const current = dailyTotals.get(dateKey) || 0;
      dailyTotals.set(dateKey, current + (exp.fields.betrag || 0));
    });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'd. MMM', { locale: de }),
        dateKey,
        betrag: dailyTotals.get(dateKey) || 0
      };
    });
  }, [currentMonthExpenses, selectedMonth]);

  // Recent expenses (last 10)
  const recentExpenses = useMemo(() => {
    return [...currentMonthExpenses]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 10);
  }, [currentMonthExpenses]);

  // Average daily spending
  const avgDailySpending = useMemo(() => {
    const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    return monthlyTotal / daysInMonth;
  }, [monthlyTotal, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    const date = parseISO(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Heute';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Gestern';
    } else {
      return format(date, 'd. MMM', { locale: de });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  if (ausgaben.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">Ausgabentracker</h1>

            <div className="flex items-center gap-4">
              {/* Month selector */}
              <Select
                value={format(selectedMonth, 'yyyy-MM')}
                onValueChange={(value) => {
                  const [year, month] = value.split('-').map(Number);
                  setSelectedMonth(new Date(year, month - 1, 1));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = subMonths(new Date(), i);
                    return (
                      <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                        {format(date, 'MMMM yyyy', { locale: de })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Desktop: Primary action button */}
              <div className="hidden md:block">
                <AddExpenseDialog onSuccess={() => window.location.reload()} kategorien={kategorien} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Desktop Layout: 60/40 split */}
        <div className="grid gap-6 lg:grid-cols-[60%_40%]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Hero Card */}
            <Card className="hero-card border-none shadow-md">
              <CardContent className="p-8">
                <div className="mb-2 text-sm text-muted-foreground">Ausgaben dieses Monat</div>
                <div className="hero-number mb-3">{formatCurrency(monthlyTotal)}</div>
                {monthlyChange !== null && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {monthlyChange > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-destructive" />
                        <span>+{monthlyChange.toFixed(1)}% vs. letzter Monat</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-chart-2" />
                        <span>{monthlyChange.toFixed(1)}% vs. letzter Monat</span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Secondary KPIs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Durchschnitt pro Tag
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{formatCurrency(avgDailySpending)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Anzahl Ausgaben
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{currentMonthExpenses.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Spending Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ausgaben Verlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBetrag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        stroke="hsl(var(--border))"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        stroke="hsl(var(--border))"
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Betrag']}
                      />
                      <Area
                        type="monotone"
                        dataKey="betrag"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        fill="url(#colorBetrag)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Kategorien</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Kategorien für diesen Monat</p>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.map((cat, idx) => {
                      const percentage = monthlyTotal > 0 ? (cat.total / monthlyTotal) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{cat.name}</span>
                            <span className="font-semibold">{formatCurrency(cat.total)}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% · {cat.count} {cat.count === 1 ? 'Ausgabe' : 'Ausgaben'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Letzte Ausgaben</CardTitle>
              </CardHeader>
              <CardContent>
                {recentExpenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Ausgaben in diesem Monat</p>
                ) : (
                  <div className="space-y-3">
                    {recentExpenses.map((exp) => {
                      const katId = extractRecordId(exp.fields.kategorie);
                      const kategorie = katId ? kategorieMap.get(katId) : null;

                      return (
                        <div
                          key={exp.record_id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {exp.fields.beschreibung || 'Ohne Beschreibung'}
                              </span>
                              {exp.fields.beleg && (
                                <Receipt className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatDate(exp.fields.datum)}</span>
                              {kategorie && (
                                <>
                                  <span>·</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {kategorie.fields.kategoriename}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCurrency(exp.fields.betrag || 0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile: Fixed Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4 md:hidden">
        <AddExpenseDialog onSuccess={() => window.location.reload()} kategorien={kategorien} fullWidth />
      </div>
    </div>
  );
}

// Add Expense Dialog Component
function AddExpenseDialog({
  onSuccess,
  kategorien,
  fullWidth = false
}: {
  onSuccess: () => void;
  kategorien: Kategorien[];
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateAusgabeErfassen>>({
    datum_ausgabe: format(new Date(), 'yyyy-MM-dd'),
    betrag_ausgabe: undefined,
    beschreibung_ausgabe: '',
    kategorie_auswahl: undefined,
    notizen_ausgabe: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.betrag_ausgabe || !formData.datum_ausgabe) {
      alert('Bitte Betrag und Datum eingeben');
      return;
    }

    setSubmitting(true);

    try {
      const apiData: CreateAusgabeErfassen = {
        betrag_ausgabe: formData.betrag_ausgabe,
        datum_ausgabe: formData.datum_ausgabe,
        beschreibung_ausgabe: formData.beschreibung_ausgabe || '',
        kategorie_auswahl: formData.kategorie_auswahl || undefined,
        notizen_ausgabe: formData.notizen_ausgabe || ''
      };

      await LivingAppsService.createAusgabeErfassenEntry(apiData);
      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error('Failed to create expense:', err);
      alert('Fehler beim Speichern der Ausgabe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={fullWidth ? 'w-full' : ''}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ausgabe hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="betrag">Betrag (EUR) *</Label>
            <Input
              id="betrag"
              type="number"
              step="0.01"
              required
              value={formData.betrag_ausgabe || ''}
              onChange={(e) => setFormData({ ...formData, betrag_ausgabe: parseFloat(e.target.value) })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datum">Datum *</Label>
            <Input
              id="datum"
              type="date"
              required
              value={formData.datum_ausgabe}
              onChange={(e) => setFormData({ ...formData, datum_ausgabe: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategorie">Kategorie</Label>
            <Select
              value={formData.kategorie_auswahl || 'none'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  kategorie_auswahl: value === 'none' ? undefined : value
                })
              }
            >
              <SelectTrigger id="kategorie">
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Kategorie</SelectItem>
                {kategorien.map((kat) => (
                  <SelectItem
                    key={kat.record_id}
                    value={createRecordUrl(APP_IDS.KATEGORIEN, kat.record_id)}
                  >
                    {kat.fields.kategoriename || 'Unbenannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Input
              id="beschreibung"
              value={formData.beschreibung_ausgabe}
              onChange={(e) => setFormData({ ...formData, beschreibung_ausgabe: e.target.value })}
              placeholder="z.B. Einkauf bei Supermarkt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notizen">Notizen</Label>
            <Textarea
              id="notizen"
              value={formData.notizen_ausgabe}
              onChange={(e) => setFormData({ ...formData, notizen_ausgabe: e.target.value })}
              placeholder="Optional..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-[60%_40%]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>{error.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Keine Ausgaben vorhanden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fügen Sie Ihre erste Ausgabe hinzu, um Ihre Finanzen zu verfolgen.
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          <Plus className="mr-2 h-4 w-4" />
          Ausgabe hinzufügen
        </Button>
      </div>
    </div>
  );
}
