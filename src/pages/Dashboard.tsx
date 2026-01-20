import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, Plus, TrendingUp, TrendingDown, Receipt, Moon, Sun } from 'lucide-react';

// Category colors (purple spectrum)
const CATEGORY_COLORS = [
  'hsl(270 70% 60%)',  // Purple
  'hsl(275 68% 62%)',
  'hsl(280 70% 65%)',
  'hsl(285 72% 63%)',
  'hsl(290 70% 60%)',
  'hsl(295 68% 58%)',
];

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Ausgaben | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Form state
  const [formData, setFormData] = useState({
    beschreibung: '',
    betrag: '',
    datum: format(new Date(), 'yyyy-MM-dd'),
    kategorie: '',
    notizen: '',
  });

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

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
        setError(err instanceof Error ? err : new Error('Fehler beim Laden'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Current month expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return ausgaben.filter(exp => {
      if (!exp.fields.datum) return false;
      const expDate = parseISO(exp.fields.datum);
      return expDate >= monthStart && expDate <= monthEnd;
    });
  }, [ausgaben]);

  // Hero KPI: Monthly total
  const monthlyTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, exp) => sum + (exp.fields.betrag || 0), 0);
  }, [currentMonthExpenses]);

  // Previous month total for comparison
  const previousMonthTotal = useMemo(() => {
    const now = new Date();
    const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const prevMonthEnd = endOfMonth(prevMonthStart);

    const prevExpenses = ausgaben.filter(exp => {
      if (!exp.fields.datum) return false;
      const expDate = parseISO(exp.fields.datum);
      return expDate >= prevMonthStart && expDate <= prevMonthEnd;
    });

    return prevExpenses.reduce((sum, exp) => sum + (exp.fields.betrag || 0), 0);
  }, [ausgaben]);

  const monthComparison = useMemo(() => {
    if (previousMonthTotal === 0) return null;
    const change = ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100;
    return {
      percentage: Math.abs(change),
      isUp: change > 0,
    };
  }, [monthlyTotal, previousMonthTotal]);

  // Secondary KPIs
  const averagePerDay = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date());
    return monthlyTotal / daysInMonth;
  }, [monthlyTotal]);

  const maxExpense = useMemo(() => {
    if (currentMonthExpenses.length === 0) return null;
    return currentMonthExpenses.reduce((max, exp) => {
      const amount = exp.fields.betrag || 0;
      return amount > (max?.fields.betrag || 0) ? exp : max;
    }, currentMonthExpenses[0]);
  }, [currentMonthExpenses]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = new Map<string, { name: string; total: number; count: number }>();

    currentMonthExpenses.forEach(exp => {
      const kategorieId = extractRecordId(exp.fields.kategorie);
      if (!kategorieId) return;

      const kategorie = kategorien.find(k => k.record_id === kategorieId);
      const name = kategorie?.fields.kategoriename || 'Unbekannt';
      const amount = exp.fields.betrag || 0;

      const current = breakdown.get(kategorieId) || { name, total: 0, count: 0 };
      breakdown.set(kategorieId, {
        name,
        total: current.total + amount,
        count: current.count + 1,
      });
    });

    return Array.from(breakdown.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [currentMonthExpenses, kategorien]);

  // Chart data: Daily spending
  const chartData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({
      start: startOfMonth(now),
      end: endOfMonth(now),
    });

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
        date: format(day, 'd', { locale: de }),
        fullDate: dateKey,
        value: dailyTotals.get(dateKey) || 0,
      };
    });
  }, [currentMonthExpenses]);

  // Recent expenses (sorted by date)
  const recentExpenses = useMemo(() => {
    return [...currentMonthExpenses]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 10);
  }, [currentMonthExpenses]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData = {
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

      // Reset form
      setFormData({
        beschreibung: '',
        betrag: '',
        datum: format(new Date(), 'yyyy-MM-dd'),
        kategorie: '',
        notizen: '',
      });
      setDialogOpen(false);
    } catch (err) {
      console.error('Fehler beim Erstellen:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            {error.message}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => window.location.reload()}
            >
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (ausgaben.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-2xl font-bold">Noch keine Ausgaben</h2>
          <p className="text-muted-foreground">
            Beginnen Sie mit dem Tracking Ihrer Ausgaben, um Ihre Finanzen im Blick zu behalten.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Erste Ausgabe hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ausgabe hinzufügen</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="beschreibung">Beschreibung *</Label>
                  <Input
                    id="beschreibung"
                    value={formData.beschreibung}
                    onChange={e => setFormData({ ...formData, beschreibung: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="betrag">Betrag (EUR) *</Label>
                  <Input
                    id="betrag"
                    type="number"
                    step="0.01"
                    value={formData.betrag}
                    onChange={e => setFormData({ ...formData, betrag: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="datum">Datum</Label>
                  <Input
                    id="datum"
                    type="date"
                    value={formData.datum}
                    onChange={e => setFormData({ ...formData, datum: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="kategorie">Kategorie</Label>
                  <Select value={formData.kategorie} onValueChange={v => setFormData({ ...formData, kategorie: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {kategorien.map(kat => (
                        <SelectItem key={kat.record_id} value={kat.record_id}>
                          {kat.fields.kategoriename}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notizen">Notizen</Label>
                  <Textarea
                    id="notizen"
                    value={formData.notizen}
                    onChange={e => setFormData({ ...formData, notizen: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-medium text-muted-foreground">Ausgaben</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Begrüßung */}
      <div className="px-4 md:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">Hallo Martin! 👋</h2>
          <p className="text-muted-foreground mt-1">Hier ist deine Ausgaben-Übersicht</p>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-4 pb-24 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">Diesen Monat</p>
            <div className="text-7xl font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {formatCurrency(monthlyTotal)}
            </div>
            <p className="text-xs text-muted-foreground">{currentMonthExpenses.length} Ausgaben</p>
            {monthComparison && (
              <div className="flex items-center justify-center gap-1 text-xs">
                {monthComparison.isUp ? (
                  <TrendingUp className="h-3 w-3" style={{ color: 'hsl(270 70% 60%)' }} />
                ) : (
                  <TrendingDown className="h-3 w-3 text-chart-2" />
                )}
                <span style={{ color: monthComparison.isUp ? 'hsl(270 70% 60%)' : 'hsl(145 60% 45%)' }}>
                  {monthComparison.isUp ? '↑' : '↓'} {monthComparison.percentage.toFixed(0)}% vs. letzten Monat
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown - Horizontal Scroll */}
        <div>
          <h2 className="text-sm font-medium mb-3 px-1">Nach Kategorie</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {categoryBreakdown.map((cat, index) => (
              <Card
                key={cat.id}
                className="min-w-[140px] flex-shrink-0 snap-start border-l-[8px] transition-all hover:shadow-md cursor-pointer"
                style={{ borderLeftColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
              >
                <CardContent className="p-4 space-y-1">
                  <p className="text-sm font-medium truncate">{cat.name}</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {formatCurrency(cat.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((cat.total / monthlyTotal) * 100).toFixed(0)}%
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <h2 className="text-sm font-medium mb-3 px-1">Letzte Ausgaben</h2>
          <div className="space-y-0">
            {recentExpenses.map((exp) => {
              const kategorieId = extractRecordId(exp.fields.kategorie);
              const kategorie = kategorien.find(k => k.record_id === kategorieId);
              const categoryIndex = categoryBreakdown.findIndex(c => c.id === kategorieId);

              return (
                <div
                  key={exp.record_id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors px-2 rounded"
                  onClick={() => setSelectedExpense(exp)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{exp.fields.beschreibung}</p>
                      <p className="text-xs text-muted-foreground">
                        {exp.fields.datum ? format(parseISO(exp.fields.datum), 'dd.MM.yyyy', { locale: de }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {formatCurrency(exp.fields.betrag || 0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Left Column (40%) */}
            <div className="w-2/5 space-y-6">
              {/* Hero KPI */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">Diesen Monat</p>
                    <div className="text-6xl font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {formatCurrency(monthlyTotal)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{currentMonthExpenses.length} Ausgaben</span>
                      {monthComparison && (
                        <span className="flex items-center gap-1" style={{ color: monthComparison.isUp ? 'hsl(270 70% 60%)' : 'hsl(145 60% 45%)' }}>
                          {monthComparison.isUp ? '↑' : '↓'} {monthComparison.percentage.toFixed(0)}% vs. letzten Monat
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tägliche Ausgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(270 70% 60%)" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="hsl(270 70% 60%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: 'hsl(270 30% 50%)' }}
                          stroke="hsl(270 20% 88%)"
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'hsl(270 30% 50%)' }}
                          stroke="hsl(270 20% 88%)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(270 30% 99%)',
                            border: '1px solid hsl(270 20% 88%)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                          labelStyle={{ color: 'hsl(270 30% 30%)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(270 70% 60%)"
                          strokeWidth={2}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (60%) */}
            <div className="w-3/5 space-y-6">
              {/* Category Breakdown - 3 Column Grid */}
              <div>
                <h2 className="text-base font-semibold mb-4">Nach Kategorie</h2>
                <div className="grid grid-cols-3 gap-4">
                  {categoryBreakdown.slice(0, 6).map((cat, index) => (
                    <Card
                      key={cat.id}
                      className="border-l-[8px] transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer"
                      style={{ borderLeftColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    >
                      <CardContent className="p-4 space-y-1">
                        <p className="text-sm font-medium truncate">{cat.name}</p>
                        <p className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {formatCurrency(cat.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((cat.total / monthlyTotal) * 100).toFixed(0)}%
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Expenses - Table */}
              <div>
                <h2 className="text-base font-semibold mb-4">Letzte Ausgaben</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {recentExpenses.map((exp, idx) => {
                        const kategorieId = extractRecordId(exp.fields.kategorie);
                        const kategorie = kategorien.find(k => k.record_id === kategorieId);
                        const categoryIndex = categoryBreakdown.findIndex(c => c.id === kategorieId);

                        return (
                          <div
                            key={exp.record_id}
                            className="grid grid-cols-[120px_1fr_150px_120px] gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                            style={idx % 2 === 0 ? { backgroundColor: 'hsl(270 20% 97%)' } : {}}
                            onClick={() => setSelectedExpense(exp)}
                          >
                            <div className="text-sm text-muted-foreground">
                              {exp.fields.datum ? format(parseISO(exp.fields.datum), 'dd.MM.yyyy', { locale: de }) : '—'}
                            </div>
                            <div className="font-medium truncate">{exp.fields.beschreibung}</div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full group-hover:w-3 transition-all"
                                style={{ backgroundColor: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] }}
                              />
                              <span className="text-sm truncate">{kategorie?.fields.kategoriename || '—'}</span>
                            </div>
                            <div className="text-right font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {formatCurrency(exp.fields.betrag || 0)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB - Desktop */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="hidden md:flex fixed bottom-8 right-8 h-[60px] w-[60px] rounded-full shadow-lg hover:shadow-xl transition-shadow p-0"
            style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ausgabe hinzufügen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="beschreibung-desktop">Beschreibung *</Label>
              <Input
                id="beschreibung-desktop"
                value={formData.beschreibung}
                onChange={e => setFormData({ ...formData, beschreibung: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="betrag-desktop">Betrag (EUR) *</Label>
              <Input
                id="betrag-desktop"
                type="number"
                step="0.01"
                value={formData.betrag}
                onChange={e => setFormData({ ...formData, betrag: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="datum-desktop">Datum</Label>
              <Input
                id="datum-desktop"
                type="date"
                value={formData.datum}
                onChange={e => setFormData({ ...formData, datum: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="kategorie-desktop">Kategorie</Label>
              <Select value={formData.kategorie} onValueChange={v => setFormData({ ...formData, kategorie: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {kategorien.map(kat => (
                    <SelectItem key={kat.record_id} value={kat.record_id}>
                      {kat.fields.kategoriename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notizen-desktop">Notizen</Label>
              <Textarea
                id="notizen-desktop"
                value={formData.notizen}
                onChange={e => setFormData({ ...formData, notizen: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bottom Fixed Button - Mobile */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="md:hidden fixed bottom-0 left-0 right-0 h-14 rounded-none shadow-lg"
            style={{ boxShadow: '0 -4px 12px rgba(66,133,244,0.20)' }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Ausgabe hinzufügen
          </Button>
        </DialogTrigger>
      </Dialog>

      {/* Expense Detail Dialog */}
      <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ausgabe Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <Label>Beschreibung</Label>
                <p className="text-sm mt-1">{selectedExpense.fields.beschreibung}</p>
              </div>
              <div>
                <Label>Betrag</Label>
                <p className="text-2xl font-bold mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatCurrency(selectedExpense.fields.betrag || 0)}
                </p>
              </div>
              <div>
                <Label>Datum</Label>
                <p className="text-sm mt-1">
                  {selectedExpense.fields.datum
                    ? format(parseISO(selectedExpense.fields.datum), 'dd. MMMM yyyy', { locale: de })
                    : '—'}
                </p>
              </div>
              <div>
                <Label>Kategorie</Label>
                <p className="text-sm mt-1">
                  {(() => {
                    const kategorieId = extractRecordId(selectedExpense.fields.kategorie);
                    const kategorie = kategorien.find(k => k.record_id === kategorieId);
                    return kategorie?.fields.kategoriename || '—';
                  })()}
                </p>
              </div>
              {selectedExpense.fields.notizen && (
                <div>
                  <Label>Notizen</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedExpense.fields.notizen}</p>
                </div>
              )}
              {selectedExpense.fields.beleg && (
                <div>
                  <Label>Beleg</Label>
                  <a
                    href={selectedExpense.fields.beleg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2 mt-1"
                  >
                    <Receipt className="h-4 w-4" />
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
