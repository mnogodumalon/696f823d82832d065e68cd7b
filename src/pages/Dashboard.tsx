import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl, APP_IDS } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, PlusCircle, Calendar, Euro, Car } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

interface ExpenseDetail extends Ausgaben {
  kategorieName?: string;
}

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  count: number;
}

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    datum: format(new Date(), 'yyyy-MM-dd'),
    kategorie: '',
    beschreibung: '',
    betrag: '',
    notizen: '',
  });

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

  // Create category lookup map
  const kategorienMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach(k => map.set(k.record_id, k));
    return map;
  }, [kategorien]);

  // Filter expenses for current month
  const currentMonthExpenses = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return ausgaben.filter(a => {
      if (!a.fields.datum) return false;
      const expenseDate = parseISO(a.fields.datum);
      return expenseDate >= start && expenseDate <= end;
    });
  }, [ausgaben, selectedMonth]);

  // Enrich expenses with category names
  const enrichedExpenses = useMemo((): ExpenseDetail[] => {
    return currentMonthExpenses.map(expense => {
      const categoryId = extractRecordId(expense.fields.kategorie);
      const category = categoryId ? kategorienMap.get(categoryId) : null;
      return {
        ...expense,
        kategorieName: category?.fields.kategoriename || 'Ohne Kategorie',
      };
    });
  }, [currentMonthExpenses, kategorienMap]);

  // Calculate monthly total
  const monthlyTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  }, [currentMonthExpenses]);

  // Calculate weekly total
  const weeklyTotal = useMemo(() => {
    const start = startOfWeek(new Date(), { locale: de });
    const end = endOfWeek(new Date(), { locale: de });
    return ausgaben
      .filter(a => {
        if (!a.fields.datum) return false;
        const expenseDate = parseISO(a.fields.datum);
        return expenseDate >= start && expenseDate <= end;
      })
      .reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  }, [ausgaben]);

  // Calculate daily average
  const dailyAverage = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(selectedMonth);
    const daysElapsed = Math.max(1, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return monthlyTotal / daysElapsed;
  }, [monthlyTotal, selectedMonth]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo((): CategorySummary[] => {
    const categoryMap = new Map<string, { total: number; count: number; name: string }>();

    currentMonthExpenses.forEach(expense => {
      const categoryId = extractRecordId(expense.fields.kategorie);
      const categoryName = categoryId
        ? (kategorienMap.get(categoryId)?.fields.kategoriename || 'Ohne Kategorie')
        : 'Ohne Kategorie';
      const key = categoryId || 'none';

      if (!categoryMap.has(key)) {
        categoryMap.set(key, { total: 0, count: 0, name: categoryName });
      }
      const current = categoryMap.get(key)!;
      current.total += expense.fields.betrag || 0;
      current.count += 1;
    });

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        total: data.total,
        count: data.count,
        percentage: monthlyTotal > 0 ? (data.total / monthlyTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [currentMonthExpenses, kategorienMap, monthlyTotal]);

  // Prepare chart data (daily spending)
  const chartData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    const dailyTotals = new Map<string, number>();
    currentMonthExpenses.forEach(expense => {
      if (!expense.fields.datum) return;
      const dateKey = expense.fields.datum.split('T')[0];
      const current = dailyTotals.get(dateKey) || 0;
      dailyTotals.set(dateKey, current + (expense.fields.betrag || 0));
    });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'd. MMM', { locale: de }),
        fullDate: dateKey,
        betrag: dailyTotals.get(dateKey) || 0,
      };
    });
  }, [currentMonthExpenses, selectedMonth]);

  // Recent expenses (sorted by date descending)
  const recentExpenses = useMemo(() => {
    return [...enrichedExpenses]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 8);
  }, [enrichedExpenses]);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.betrag || !formData.datum) return;

    setSubmitting(true);
    try {
      const apiData = {
        datum: formData.datum,
        kategorie: formData.kategorie ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie) : undefined,
        beschreibung: formData.beschreibung || undefined,
        betrag: parseFloat(formData.betrag),
        notizen: formData.notizen || undefined,
      };

      await LivingAppsService.createAusgabenEntry(apiData);

      // Refresh data
      const newAusgaben = await LivingAppsService.getAusgaben();
      setAusgaben(newAusgaben);

      // Reset form
      setFormData({
        datum: format(new Date(), 'yyyy-MM-dd'),
        kategorie: '',
        beschreibung: '',
        betrag: '',
        notizen: '',
      });
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to create expense:', err);
      alert('Fehler beim Speichern der Ausgabe');
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>
              {error.message}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Erneut versuchen
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const monthName = format(selectedMonth, 'MMMM yyyy', { locale: de });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold">Ausgabentracker</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <Select
              value={format(selectedMonth, 'yyyy-MM')}
              onValueChange={(val) => setSelectedMonth(parseISO(val + '-01'))}
            >
              <SelectTrigger className="w-32 md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = format(date, 'yyyy-MM');
                  const label = format(date, 'MMMM yyyy', { locale: de });
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hidden md:flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Ausgabe hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Neue Ausgabe</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="datum">Datum</Label>
                    <Input
                      id="datum"
                      type="date"
                      required
                      value={formData.datum}
                      onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kategorie">Kategorie</Label>
                    <Select
                      value={formData.kategorie}
                      onValueChange={(val) => setFormData({ ...formData, kategorie: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {kategorien.map(k => (
                          <SelectItem key={k.record_id} value={k.record_id}>
                            {k.fields.kategoriename || 'Ohne Name'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="beschreibung">Beschreibung</Label>
                    <Input
                      id="beschreibung"
                      value={formData.beschreibung}
                      onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                      placeholder="z.B. Einkauf bei Rewe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="betrag">Betrag (EUR)</Label>
                    <Input
                      id="betrag"
                      type="number"
                      step="0.01"
                      required
                      value={formData.betrag}
                      onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notizen">Notizen (optional)</Label>
                    <Textarea
                      id="notizen"
                      value={formData.notizen}
                      onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                      placeholder="Zusätzliche Informationen..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? 'Wird gespeichert...' : 'Hinzufügen'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={submitting}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column (Main Content) - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Hero KPI - Monthly Total */}
            <Card className="shadow-lg" style={{
              borderRadius: '10px 14px 11px 13px',
              boxShadow: '0 2px 8px hsla(25, 40%, 30%, 0.08), 0 0px 2px hsla(25, 40%, 30%, 0.04), 0 4px 16px hsla(12, 40%, 50%, 0.06)'
            }}>
              <CardContent className="p-6 md:p-8">
                <div className="text-sm text-muted-foreground mb-2">
                  Ausgaben {format(selectedMonth, 'MMMM', { locale: de })}
                </div>
                <div className="text-5xl md:text-6xl font-bold mb-2">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(monthlyTotal)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {monthlyTotal > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span className="text-muted-foreground">
                        {currentMonthExpenses.length} Ausgaben
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Keine Ausgaben</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Diese Woche</div>
                  <div className="text-lg md:text-xl font-bold">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(weeklyTotal)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Ø pro Tag</div>
                  <div className="text-lg md:text-xl font-bold">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(dailyAverage)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Anzahl</div>
                  <div className="text-lg md:text-xl font-bold">
                    {currentMonthExpenses.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Nach Kategorie</h2>
              {categoryBreakdown.length > 0 ? (
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  {categoryBreakdown.slice(0, 6).map((cat) => (
                    <Card key={cat.categoryId} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold">{cat.categoryName}</div>
                          <div className="text-lg font-bold text-accent">
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(cat.total)}
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-accent rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {cat.percentage.toFixed(1)}% · {cat.count} Ausgaben
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Keine Ausgaben in diesem Monat
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Spending Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ausgabenverlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBetrag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(25 60% 45%)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="hsl(25 60% 45%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 85%)" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: 'hsl(25 15% 50%)' }}
                        stroke="hsl(35 20% 85%)"
                        interval="preserveStartEnd"
                        tickCount={8}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'hsl(25 15% 50%)' }}
                        stroke="hsl(35 20% 85%)"
                        tickFormatter={(value) => `${value}€`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(40 40% 99%)',
                          border: '1px solid hsl(35 20% 85%)',
                          borderRadius: '8px',
                          fontSize: '14px',
                        }}
                        formatter={(value: number) => [
                          new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(value),
                          'Betrag'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="betrag"
                        stroke="hsl(25 60% 45%)"
                        strokeWidth={3}
                        fill="url(#colorBetrag)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Sidebar) - 1/3 width on desktop */}
          <div className="mt-6 lg:mt-0 space-y-6">
            {/* Savings Goal - Mazda 6 */}
            <Card className="shadow-lg border-2 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Car className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Mazda 6</div>
                    <div className="text-sm text-muted-foreground">Traumauto Sparziel</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Gespart</span>
                      <span className="font-semibold">0,00 € / 15.000 €</span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Noch benötigt</div>
                      <div className="text-lg font-bold text-accent">15.000 €</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Fortschritt</div>
                      <div className="text-lg font-bold">0%</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Spare jeden Monat etwas, um deinen Traum zu verwirklichen!
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Quick Add - Hidden on mobile */}
            <Card className="hidden lg:block">
              <CardHeader>
                <CardTitle className="text-base">Schnell hinzufügen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={formData.kategorie}
                  onValueChange={(val) => setFormData({ ...formData, kategorie: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kategorien.map(k => (
                      <SelectItem key={k.record_id} value={k.record_id}>
                        {k.fields.kategoriename || 'Ohne Name'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Betrag (EUR)"
                  value={formData.betrag}
                  onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                />
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!formData.betrag || submitting}
                >
                  Hinzufügen
                </Button>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Letzte Ausgaben</CardTitle>
              </CardHeader>
              <CardContent>
                {recentExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {recentExpenses.map((expense) => (
                      <div
                        key={expense.record_id}
                        className="pb-3 border-b border-border last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {expense.fields.beschreibung || 'Ohne Beschreibung'}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {expense.kategorieName}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className="font-bold">
                              {new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(expense.fields.betrag || 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {expense.fields.datum && format(parseISO(expense.fields.datum), 'dd.MM.yyyy', { locale: de })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    Keine Ausgaben vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Action Button */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 text-base shadow-lg">
              <PlusCircle className="h-5 w-5 mr-2" />
              Ausgabe hinzufügen
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Expense Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ausgabe Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Beschreibung</div>
                <div className="font-semibold">
                  {selectedExpense.fields.beschreibung || 'Ohne Beschreibung'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Betrag</div>
                <div className="text-2xl font-bold text-accent">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(selectedExpense.fields.betrag || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Kategorie</div>
                <Badge variant="secondary">{selectedExpense.kategorieName}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Datum</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedExpense.fields.datum &&
                    format(parseISO(selectedExpense.fields.datum), 'PPP', { locale: de })
                  }
                </div>
              </div>
              {selectedExpense.fields.notizen && (
                <div>
                  <div className="text-sm text-muted-foreground">Notizen</div>
                  <div className="text-sm bg-muted p-3 rounded">
                    {selectedExpense.fields.notizen}
                  </div>
                </div>
              )}
              {selectedExpense.fields.beleg && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Beleg</div>
                  <a
                    href={selectedExpense.fields.beleg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Beleg ansehen
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
