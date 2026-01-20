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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, differenceInCalendarDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface CategorySpending {
  categoryName: string;
  amount: number;
  percentage: number;
}

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    beschreibung: '',
    betrag: '',
    datum: format(new Date(), 'yyyy-MM-dd'),
    kategorie: '',
    notizen: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ausgabenData, kategorienData] = await Promise.all([
          LivingAppsService.getAusgaben(),
          LivingAppsService.getKategorien(),
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
    loadData();
  }, []);

  // Create kategorie lookup map
  const kategorieMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach(kat => map.set(kat.record_id, kat));
    return map;
  }, [kategorien]);

  // Calculate current month data
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const currentMonthAusgaben = ausgaben.filter(a => {
      if (!a.fields.datum) return false;
      const datum = parseISO(a.fields.datum);
      return datum >= monthStart && datum <= monthEnd;
    });

    const total = currentMonthAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);

    return { ausgaben: currentMonthAusgaben, total };
  }, [ausgaben]);

  // Calculate previous month total for comparison
  const previousMonthTotal = useMemo(() => {
    const now = new Date();
    const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const prevMonthEnd = endOfMonth(prevMonthStart);

    const prevMonthAusgaben = ausgaben.filter(a => {
      if (!a.fields.datum) return false;
      const datum = parseISO(a.fields.datum);
      return datum >= prevMonthStart && datum <= prevMonthEnd;
    });

    return prevMonthAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  }, [ausgaben]);

  // Calculate quick stats
  const quickStats = useMemo(() => {
    const now = new Date();
    const daysInMonth = differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1;
    const currentDay = now.getDate();

    const avgPerDay = currentDay > 0 ? currentMonthData.total / currentDay : 0;
    const count = currentMonthData.ausgaben.length;

    // Find most expensive category
    const categoryTotals = new Map<string, number>();
    currentMonthData.ausgaben.forEach(a => {
      const katId = extractRecordId(a.fields.kategorie);
      if (katId) {
        const current = categoryTotals.get(katId) || 0;
        categoryTotals.set(katId, current + (a.fields.betrag || 0));
      }
    });

    let topCategoryId = '';
    let topCategoryAmount = 0;
    categoryTotals.forEach((amount, katId) => {
      if (amount > topCategoryAmount) {
        topCategoryAmount = amount;
        topCategoryId = katId;
      }
    });

    const topCategory = topCategoryId ? kategorieMap.get(topCategoryId)?.fields.kategoriename : null;

    return {
      avgPerDay,
      count,
      topCategory: topCategory || 'Keine',
    };
  }, [currentMonthData, kategorieMap]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo((): CategorySpending[] => {
    const categoryTotals = new Map<string, number>();

    currentMonthData.ausgaben.forEach(a => {
      const katId = extractRecordId(a.fields.kategorie);
      if (katId) {
        const current = categoryTotals.get(katId) || 0;
        categoryTotals.set(katId, current + (a.fields.betrag || 0));
      }
    });

    const breakdown: CategorySpending[] = [];
    categoryTotals.forEach((amount, katId) => {
      const kat = kategorieMap.get(katId);
      if (kat) {
        breakdown.push({
          categoryName: kat.fields.kategoriename || 'Unbekannt',
          amount,
          percentage: currentMonthData.total > 0 ? (amount / currentMonthData.total) * 100 : 0,
        });
      }
    });

    return breakdown.sort((a, b) => b.amount - a.amount);
  }, [currentMonthData, kategorieMap]);

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

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData: Ausgaben['fields'] = {
        beschreibung: formData.beschreibung,
        betrag: parseFloat(formData.betrag),
        datum: formData.datum,
        kategorie: formData.kategorie ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie) : undefined,
        notizen: formData.notizen || undefined,
      };

      await LivingAppsService.createAusgabenEntry(apiData);

      // Reload data
      const newAusgaben = await LivingAppsService.getAusgaben();
      setAusgaben(newAusgaben);

      // Reset form and close dialog
      setFormData({
        beschreibung: '',
        betrag: '',
        datum: format(new Date(), 'yyyy-MM-dd'),
        kategorie: '',
        notizen: '',
      });
      setDialogOpen(false);

      toast.success('Ausgabe hinzugefügt', {
        description: `${formData.beschreibung} - ${parseFloat(formData.betrag).toFixed(2)} €`,
      });
    } catch (err) {
      toast.error('Fehler beim Speichern', {
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Format currency
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <div className="h-16 flex items-center justify-between border-b border-border pb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error.message}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const monthDiff = currentMonthData.total - previousMonthTotal;
  const isIncrease = monthDiff > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header - Desktop */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Ausgabentracker</h1>
            <p className="text-sm text-muted-foreground mt-1">Letzte Anfrage: "was hab ich dich gerade gefragt?"</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ausgabe hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Ausgabe</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="beschreibung">Beschreibung *</Label>
                  <Input
                    id="beschreibung"
                    value={formData.beschreibung}
                    onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                    required
                    placeholder="z.B. Einkauf, Kino, Tanken"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="betrag">Betrag (EUR) *</Label>
                  <Input
                    id="betrag"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.betrag}
                    onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datum">Datum *</Label>
                  <Input
                    id="datum"
                    type="date"
                    value={formData.datum}
                    onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategorie">Kategorie</Label>
                  <Select value={formData.kategorie} onValueChange={(v) => setFormData({ ...formData, kategorie: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {kategorien.map((kat) => (
                        <SelectItem key={kat.record_id} value={kat.record_id}>
                          {kat.fields.kategoriename}
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
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Wird gespeichert...' : 'Ausgabe speichern'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Header - Mobile */}
        <header className="md:hidden px-4 py-4 border-b border-border">
          <h1 className="text-lg font-semibold">Ausgabentracker</h1>
          <p className="text-xs text-muted-foreground mt-1">Letzte Anfrage: "was hab ich dich gerade gefragt?"</p>
        </header>

        {/* Desktop Layout */}
        <div className="hidden md:block px-6 py-6">
          <div className="grid grid-cols-[60%_40%] gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Hero Card */}
              <Card
                className="border-none shadow-md"
                style={{ background: 'var(--hero-gradient)' }}
              >
                <CardContent className="p-12">
                  <div className="space-y-3">
                    <p className="text-base font-medium text-muted-foreground">
                      Ausgaben diesen Monat
                    </p>
                    <p
                      className="text-7xl font-light text-primary tracking-tight"
                      style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
                    >
                      {formatCurrency(currentMonthData.total)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {isIncrease ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-[hsl(var(--success-color))]" />
                      )}
                      <span>
                        {formatCurrency(Math.abs(monthDiff))} {isIncrease ? 'mehr' : 'weniger'} als letzter Monat
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Chart */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Ausgaben nach Kategorie</h2>
                {categoryBreakdown.length === 0 ? (
                  <Card className="p-8">
                    <p className="text-center text-muted-foreground">
                      Noch keine Ausgaben in diesem Monat
                    </p>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryBreakdown}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis type="number" />
                          <YAxis
                            type="category"
                            dataKey="categoryName"
                            width={120}
                            tick={{ fontSize: 13 }}
                          />
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar
                            dataKey="amount"
                            fill="hsl(var(--chart-primary))"
                            radius={[0, 8, 8, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="p-6">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Durchschnitt pro Tag
                  </p>
                  <p className="text-3xl font-bold">{formatCurrency(quickStats.avgPerDay)}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Anzahl Ausgaben
                  </p>
                  <p className="text-3xl font-bold">{quickStats.count}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Größte Kategorie
                  </p>
                  <p className="text-3xl font-bold truncate">{quickStats.topCategory}</p>
                </Card>
              </div>

              {/* Recent Expenses */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Letzte Ausgaben</h2>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentExpenses.length === 0 ? (
                    <Card className="p-6">
                      <p className="text-center text-muted-foreground text-sm">
                        Noch keine Ausgaben erfasst
                      </p>
                    </Card>
                  ) : (
                    recentExpenses.map((exp) => {
                      const katId = extractRecordId(exp.fields.kategorie);
                      const kat = katId ? kategorieMap.get(katId) : null;

                      return (
                        <Card
                          key={exp.record_id}
                          className="p-4 hover:bg-accent transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-primary"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {exp.fields.beschreibung || 'Keine Beschreibung'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {exp.fields.datum ? format(parseISO(exp.fields.datum), 'd. MMM', { locale: de }) : '-'}
                                </p>
                                {kat && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                      {kat.fields.kategoriename}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-base font-bold whitespace-nowrap">
                              {formatCurrency(exp.fields.betrag || 0)}
                            </p>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden px-4 py-6 pb-24 space-y-6">
          {/* Hero Section */}
          <Card
            className="border-none shadow-md"
            style={{ background: 'var(--hero-gradient)' }}
          >
            <CardContent className="p-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Ausgaben diesen Monat
                </p>
                <p
                  className="text-6xl font-light text-primary tracking-tight"
                  style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
                >
                  {formatCurrency(currentMonthData.total)}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isIncrease ? (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-[hsl(var(--success-color))]" />
                  )}
                  <span>
                    {formatCurrency(Math.abs(monthDiff))} {isIncrease ? 'mehr' : 'weniger'} als letzter Monat
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Inline Badges */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="flex-shrink-0 bg-muted rounded-lg px-3 py-3 min-w-[140px]">
              <p className="text-xs font-medium text-muted-foreground mb-1">Ø pro Tag</p>
              <p className="text-lg font-semibold">{formatCurrency(quickStats.avgPerDay)}</p>
            </div>
            <div className="flex-shrink-0 bg-muted rounded-lg px-3 py-3 min-w-[140px]">
              <p className="text-xs font-medium text-muted-foreground mb-1">Anzahl</p>
              <p className="text-lg font-semibold">{quickStats.count}</p>
            </div>
            <div className="flex-shrink-0 bg-muted rounded-lg px-3 py-3 min-w-[140px]">
              <p className="text-xs font-medium text-muted-foreground mb-1">Top Kategorie</p>
              <p className="text-lg font-semibold truncate">{quickStats.topCategory}</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Nach Kategorie</h2>
            {categoryBreakdown.slice(0, 5).map((cat) => (
              <Card key={cat.categoryName} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{cat.categoryName}</span>
                  <span className="font-bold">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.percentage.toFixed(1)}% des Monatsbudgets
                </p>
              </Card>
            ))}
          </div>

          {/* Recent Expenses */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Letzte Ausgaben</h2>
            <div className="space-y-2">
              {recentExpenses.slice(0, 8).map((exp) => {
                const katId = extractRecordId(exp.fields.kategorie);
                const kat = katId ? kategorieMap.get(katId) : null;

                return (
                  <Card
                    key={exp.record_id}
                    className="p-4 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {exp.fields.beschreibung || 'Keine Beschreibung'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {exp.fields.datum ? format(parseISO(exp.fields.datum), 'd. MMM', { locale: de }) : '-'}
                          </p>
                          {kat && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                {kat.fields.kategoriename}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-base font-bold whitespace-nowrap">
                        {formatCurrency(exp.fields.betrag || 0)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button - Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-base gap-2 shadow-lg">
                <Plus className="h-5 w-5" />
                Ausgabe hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Ausgabe</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="beschreibung-mobile">Beschreibung *</Label>
                  <Input
                    id="beschreibung-mobile"
                    value={formData.beschreibung}
                    onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                    required
                    placeholder="z.B. Einkauf, Kino, Tanken"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="betrag-mobile">Betrag (EUR) *</Label>
                  <Input
                    id="betrag-mobile"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.betrag}
                    onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datum-mobile">Datum *</Label>
                  <Input
                    id="datum-mobile"
                    type="date"
                    value={formData.datum}
                    onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategorie-mobile">Kategorie</Label>
                  <Select value={formData.kategorie} onValueChange={(v) => setFormData({ ...formData, kategorie: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {kategorien.map((kat) => (
                        <SelectItem key={kat.record_id} value={kat.record_id}>
                          {kat.fields.kategoriename}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notizen-mobile">Notizen</Label>
                  <Textarea
                    id="notizen-mobile"
                    value={formData.notizen}
                    onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                    placeholder="Zusätzliche Informationen..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Wird gespeichert...' : 'Ausgabe speichern'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
}
