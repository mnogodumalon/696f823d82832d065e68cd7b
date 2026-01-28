import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Receipt, Car } from 'lucide-react';

// Currency formatter for German locale
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '€ 0,00';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

// Category bar colors (red gradient)
const CATEGORY_COLORS = [
  'hsl(0 72% 51%)',
  'hsl(0 65% 58%)',
  'hsl(0 55% 62%)',
  'hsl(0 45% 68%)',
];

// Sparziel für Mazda 6
const SAVINGS_GOAL = {
  name: 'Mazda 6',
  targetAmount: 28000,
  currentAmount: 9500,
  emoji: '🚗',
  note: 'In Berlin angeschaut',
};

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    betrag: '',
    beschreibung: '',
    kategorie: '',
    datum: format(new Date(), 'yyyy-MM-dd'),
    notizen: '',
  });

  // Fetch data
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
      setError(err instanceof Error ? err : new Error('Ein Fehler ist aufgetreten'));
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
    kategorien.forEach((k) => map.set(k.record_id, k));
    return map;
  }, [kategorien]);

  // Get kategorie name by record ID
  function getKategorieName(kategorieUrl: string | undefined): string {
    if (!kategorieUrl) return 'Ohne Kategorie';
    const id = extractRecordId(kategorieUrl);
    if (!id) return 'Ohne Kategorie';
    const kategorie = kategorieMap.get(id);
    return kategorie?.fields.kategoriename || 'Ohne Kategorie';
  }

  // Current month calculations
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Filter expenses for current month
  const currentMonthExpenses = useMemo(() => {
    return ausgaben.filter((a) => {
      if (!a.fields.datum) return false;
      const date = parseISO(a.fields.datum);
      return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
    });
  }, [ausgaben, currentMonthStart, currentMonthEnd]);

  // Filter expenses for last month
  const lastMonthExpenses = useMemo(() => {
    return ausgaben.filter((a) => {
      if (!a.fields.datum) return false;
      const date = parseISO(a.fields.datum);
      return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
    });
  }, [ausgaben, lastMonthStart, lastMonthEnd]);

  // Calculate totals
  const currentMonthTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  }, [currentMonthExpenses]);

  const lastMonthTotal = useMemo(() => {
    return lastMonthExpenses.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  }, [lastMonthExpenses]);

  // Calculate percentage change
  const percentChange = useMemo(() => {
    if (lastMonthTotal === 0) return null;
    return ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }, [currentMonthTotal, lastMonthTotal]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const groups = new Map<string, { name: string; total: number }>();

    currentMonthExpenses.forEach((a) => {
      const kategorieUrl = a.fields.kategorie;
      const kategorieId = kategorieUrl ? extractRecordId(kategorieUrl) : 'none';
      const name = getKategorieName(kategorieUrl);
      const key = kategorieId || 'none';

      if (!groups.has(key)) {
        groups.set(key, { name, total: 0 });
      }
      const group = groups.get(key)!;
      group.total += a.fields.betrag || 0;
    });

    return Array.from(groups.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [currentMonthExpenses, kategorieMap]);

  // Daily spending chart data
  const chartData = useMemo(() => {
    const dailyTotals = new Map<number, number>();

    currentMonthExpenses.forEach((a) => {
      if (!a.fields.datum) return;
      const day = parseISO(a.fields.datum).getDate();
      dailyTotals.set(day, (dailyTotals.get(day) || 0) + (a.fields.betrag || 0));
    });

    const daysInMonth = currentMonthEnd.getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      data.push({
        day: i,
        betrag: dailyTotals.get(i) || 0,
      });
    }
    return data;
  }, [currentMonthExpenses, currentMonthEnd]);

  // Recent expenses (sorted by date desc)
  const recentExpenses = useMemo(() => {
    return [...ausgaben]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 8);
  }, [ausgaben]);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.betrag || !formData.beschreibung) return;

    setSubmitting(true);
    try {
      await LivingAppsService.createAusgabenEntry({
        betrag: parseFloat(formData.betrag.replace(',', '.')),
        beschreibung: formData.beschreibung,
        datum: formData.datum,
        kategorie: formData.kategorie
          ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie)
          : undefined,
        notizen: formData.notizen || undefined,
      });

      // Reset form and close dialog
      setFormData({
        betrag: '',
        beschreibung: '',
        kategorie: '',
        datum: format(new Date(), 'yyyy-MM-dd'),
        notizen: '',
      });
      setDialogOpen(false);

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message}
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={fetchData}>
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="p-4 pb-24">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold text-foreground">Ausgabentracker</h1>
            <Badge variant="secondary" className="font-medium">
              {format(now, 'MMMM yyyy', { locale: de })}
            </Badge>
          </header>

          {/* Hero Section */}
          <div className="py-8 text-center">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
              Ausgaben diesen Monat
            </p>
            <p className="text-[72px] font-bold leading-none text-foreground tabular-nums">
              {formatCurrency(currentMonthTotal)}
            </p>
            {percentChange !== null && (
              <div className={`flex items-center justify-center gap-1 mt-3 text-sm ${percentChange > 0 ? 'text-destructive' : 'text-[hsl(160_50%_40%)]'}`}>
                {percentChange > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}% vs. letzter Monat
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {currentMonthExpenses.length} Transaktionen
            </p>
          </div>

          {/* Sparziel Mazda 6 */}
          <Card className="mb-6 shadow-sm border-2 border-primary/20 bg-gradient-to-br from-card to-accent/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    Sparziel: {SAVINGS_GOAL.name} {SAVINGS_GOAL.emoji}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{SAVINGS_GOAL.note}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(SAVINGS_GOAL.currentAmount)}</p>
                  <p className="text-xs text-muted-foreground">von {formatCurrency(SAVINGS_GOAL.targetAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    {((SAVINGS_GOAL.currentAmount / SAVINGS_GOAL.targetAmount) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">erreicht</p>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                  style={{ width: `${(SAVINGS_GOAL.currentAmount / SAVINGS_GOAL.targetAmount) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Noch {formatCurrency(SAVINGS_GOAL.targetAmount - SAVINGS_GOAL.currentAmount)} bis zum Ziel!
              </p>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Nach Kategorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Ausgaben diesen Monat
                </p>
              ) : (
                categoryBreakdown.map((cat, index) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-muted-foreground">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${currentMonthTotal > 0 ? (cat.total / currentMonthTotal) * 100 : 0}%`,
                          backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Letzte Ausgaben</CardTitle>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Ausgaben erfasst
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {recentExpenses.slice(0, 5).map((expense) => (
                    <div key={expense.record_id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{expense.fields.beschreibung || 'Ohne Beschreibung'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-normal">
                              {getKategorieName(expense.fields.kategorie)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {expense.fields.datum
                                ? format(parseISO(expense.fields.datum), 'dd.MM.yyyy', { locale: de })
                                : ''}
                            </span>
                          </div>
                        </div>
                        <p className="font-semibold text-foreground whitespace-nowrap">
                          {formatCurrency(expense.fields.betrag)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fixed Bottom Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-base font-semibold shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Ausgabe hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="betrag">Betrag (EUR) *</Label>
                  <Input
                    id="betrag"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={formData.betrag}
                    onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beschreibung">Beschreibung *</Label>
                  <Input
                    id="beschreibung"
                    type="text"
                    placeholder="z.B. Mittagessen"
                    value={formData.beschreibung}
                    onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategorie">Kategorie</Label>
                  <Select
                    value={formData.kategorie || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, kategorie: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine Kategorie</SelectItem>
                      {kategorien.map((k) => (
                        <SelectItem key={k.record_id} value={k.record_id}>
                          {k.fields.kategoriename || 'Unbenannt'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datum">Datum</Label>
                  <Input
                    id="datum"
                    type="date"
                    value={formData.datum}
                    onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notizen">Notizen</Label>
                  <Textarea
                    id="notizen"
                    placeholder="Optionale Notizen..."
                    value={formData.notizen}
                    onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Speichern...' : 'Ausgabe speichern'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">Ausgabentracker</h1>
            <Badge variant="secondary" className="font-medium text-sm px-3 py-1">
              {format(now, 'MMMM yyyy', { locale: de })}
            </Badge>
          </header>

          {/* Main Grid: 60% Left / 40% Right */}
          <div className="grid grid-cols-5 gap-8">
            {/* Left Column (60%) */}
            <div className="col-span-3 space-y-8">
              {/* Hero KPI Card */}
              <Card className="shadow-sm">
                <CardContent className="py-10 text-center">
                  <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                    Ausgaben diesen Monat
                  </p>
                  <p className="text-[96px] font-bold leading-none text-foreground tabular-nums">
                    {formatCurrency(currentMonthTotal)}
                  </p>
                  {percentChange !== null && (
                    <div className={`flex items-center justify-center gap-1.5 mt-4 text-base ${percentChange > 0 ? 'text-destructive' : 'text-[hsl(160_50%_40%)]'}`}>
                      {percentChange > 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}% vs. letzter Monat
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentMonthExpenses.length} Transaktionen
                  </p>
                </CardContent>
              </Card>

              {/* Daily Spending Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Tägliche Ausgaben – {format(now, 'MMMM yyyy', { locale: de })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBetrag" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(175 45% 35%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(175 45% 35%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(200 10% 50%)"
                          axisLine={{ stroke: 'hsl(45 15% 88%)' }}
                          tickLine={false}
                          tickFormatter={(value) => {
                            if (value === 1 || value === 5 || value === 10 || value === 15 || value === 20 || value === 25 || value === 30) {
                              return value.toString();
                            }
                            return '';
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          stroke="hsl(200 10% 50%)"
                          axisLine={{ stroke: 'hsl(45 15% 88%)' }}
                          tickLine={false}
                          tickFormatter={(value) => `€${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(0 0% 100%)',
                            border: '1px solid hsl(45 15% 88%)',
                            borderRadius: '8px',
                            fontSize: '14px',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Ausgaben']}
                          labelFormatter={(label) => `Tag ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="betrag"
                          stroke="hsl(175 45% 35%)"
                          strokeWidth={2}
                          fill="url(#colorBetrag)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (40%) */}
            <div className="col-span-2 space-y-6">
              {/* Primary Action Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 text-base font-semibold shadow-sm">
                    <Plus className="h-5 w-5 mr-2" />
                    Ausgabe hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="betrag-desktop">Betrag (EUR) *</Label>
                      <Input
                        id="betrag-desktop"
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={formData.betrag}
                        onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="beschreibung-desktop">Beschreibung *</Label>
                      <Input
                        id="beschreibung-desktop"
                        type="text"
                        placeholder="z.B. Mittagessen"
                        value={formData.beschreibung}
                        onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kategorie-desktop">Kategorie</Label>
                      <Select
                        value={formData.kategorie || 'none'}
                        onValueChange={(v) => setFormData({ ...formData, kategorie: v === 'none' ? '' : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Keine Kategorie</SelectItem>
                          {kategorien.map((k) => (
                            <SelectItem key={k.record_id} value={k.record_id}>
                              {k.fields.kategoriename || 'Unbenannt'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="datum-desktop">Datum</Label>
                      <Input
                        id="datum-desktop"
                        type="date"
                        value={formData.datum}
                        onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notizen-desktop">Notizen</Label>
                      <Textarea
                        id="notizen-desktop"
                        placeholder="Optionale Notizen..."
                        value={formData.notizen}
                        onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Speichern...' : 'Ausgabe speichern'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Sparziel Mazda 6 */}
              <Card className="shadow-sm border-2 border-primary/20 bg-gradient-to-br from-card to-accent/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        Sparziel: {SAVINGS_GOAL.name} {SAVINGS_GOAL.emoji}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{SAVINGS_GOAL.note}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(SAVINGS_GOAL.currentAmount)}</p>
                      <p className="text-xs text-muted-foreground">von {formatCurrency(SAVINGS_GOAL.targetAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-primary">
                        {((SAVINGS_GOAL.currentAmount / SAVINGS_GOAL.targetAmount) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">erreicht</p>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                      style={{ width: `${(SAVINGS_GOAL.currentAmount / SAVINGS_GOAL.targetAmount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Noch {formatCurrency(SAVINGS_GOAL.targetAmount - SAVINGS_GOAL.currentAmount)} bis zum Ziel!
                  </p>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Nach Kategorie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryBreakdown.length === 0 ? (
                    <div className="text-center py-6">
                      <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Noch keine Ausgaben diesen Monat
                      </p>
                    </div>
                  ) : (
                    categoryBreakdown.map((cat, index) => (
                      <div key={cat.name} className="space-y-1.5 group">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {formatCurrency(cat.total)}
                            <span className="text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              ({currentMonthTotal > 0 ? ((cat.total / currentMonthTotal) * 100).toFixed(0) : 0}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${currentMonthTotal > 0 ? (cat.total / currentMonthTotal) * 100 : 0}%`,
                              backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Letzte Ausgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentExpenses.length === 0 ? (
                    <div className="text-center py-6">
                      <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Noch keine Ausgaben erfasst
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Klicke oben auf "Ausgabe hinzufügen"
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {recentExpenses.map((expense) => (
                        <div
                          key={expense.record_id}
                          className="py-3 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-3 px-3 rounded-lg transition-colors cursor-default"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {expense.fields.beschreibung || 'Ohne Beschreibung'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {getKategorieName(expense.fields.kategorie)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {expense.fields.datum
                                    ? format(parseISO(expense.fields.datum), 'dd.MM.yyyy', { locale: de })
                                    : ''}
                                </span>
                              </div>
                            </div>
                            <p className="font-semibold text-foreground whitespace-nowrap">
                              {formatCurrency(expense.fields.betrag)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
