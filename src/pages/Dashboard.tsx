import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien, CreateAusgabeErfassen } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl, APP_IDS } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Category lookup map
  const kategorieMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach(k => map.set(k.record_id, k));
    return map;
  }, [kategorien]);

  // Filter expenses for selected month
  const filteredAusgaben = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    return ausgaben.filter(a => {
      if (!a.fields.datum) return false;
      const datum = parseISO(a.fields.datum);
      return datum >= monthStart && datum <= monthEnd;
    });
  }, [ausgaben, selectedMonth]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = filteredAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
    const count = filteredAusgaben.length;
    const avg = count > 0 ? total / count : 0;
    const max = filteredAusgaben.reduce((m, a) => Math.max(m, a.fields.betrag || 0), 0);

    // Previous month comparison
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevMonth = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
    const [prevYear, prevMonthNum] = prevMonth.split('-').map(Number);
    const prevMonthStart = startOfMonth(new Date(prevYear, prevMonthNum - 1));
    const prevMonthEnd = endOfMonth(new Date(prevYear, prevMonthNum - 1));

    const prevMonthAusgaben = ausgaben.filter(a => {
      if (!a.fields.datum) return false;
      const datum = parseISO(a.fields.datum);
      return datum >= prevMonthStart && datum <= prevMonthEnd;
    });
    const prevTotal = prevMonthAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
    const diff = total - prevTotal;

    return { total, count, avg, max, diff };
  }, [filteredAusgaben, ausgaben, selectedMonth]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryTotals = new Map<string, { name: string; total: number }>();

    filteredAusgaben.forEach(a => {
      const kategorieId = extractRecordId(a.fields.kategorie);
      if (!kategorieId) return;

      const kategorie = kategorieMap.get(kategorieId);
      const name = kategorie?.fields.kategoriename || 'Unbekannt';
      const current = categoryTotals.get(kategorieId) || { name, total: 0 };
      categoryTotals.set(kategorieId, {
        name,
        total: current.total + (a.fields.betrag || 0),
      });
    });

    return Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [filteredAusgaben, kategorieMap]);

  // Chart data - daily spending
  const chartData = useMemo(() => {
    const dailyTotals = new Map<string, number>();

    filteredAusgaben.forEach(a => {
      if (!a.fields.datum) return;
      const date = a.fields.datum.split('T')[0];
      const current = dailyTotals.get(date) || 0;
      dailyTotals.set(date, current + (a.fields.betrag || 0));
    });

    return Array.from(dailyTotals.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAusgaben]);

  // Recent expenses
  const recentAusgaben = useMemo(() => {
    return [...filteredAusgaben]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 8);
  }, [filteredAusgaben]);

  // Generate month options
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = format(date, 'MMMM yyyy', { locale: de });
      options.push({ value, label });
    }
    return options;
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <h1 className="text-2xl font-semibold">Ausgabentracker</h1>
            <div className="flex items-center gap-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="hidden md:block">
                <AddExpenseDialog onSuccess={() => window.location.reload()} kategorien={kategorien} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredAusgaben.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Mobile Layout */}
            <div className="lg:hidden">
              {/* Hero KPI */}
              <div className="py-10 text-center">
                <div className="text-base font-light text-muted-foreground mb-2">
                  Ausgaben diesen Monat
                </div>
                <div className="text-7xl font-bold text-foreground">
                  {formatCurrency(kpis.total)}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  {kpis.diff > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span className="text-muted-foreground">
                        {formatCurrency(Math.abs(kpis.diff))} vs. letzten Monat
                      </span>
                    </>
                  ) : kpis.diff < 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">
                        {formatCurrency(Math.abs(kpis.diff))} vs. letzten Monat
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  aus {kpis.count} Ausgaben
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 flex justify-around border-y border-border py-4">
                <div className="text-center">
                  <div className="text-xs font-normal text-muted-foreground">Anzahl</div>
                  <div className="text-lg font-semibold">{kpis.count} Einträge</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-normal text-muted-foreground">Durchschnitt</div>
                  <div className="text-lg font-semibold">{formatCurrency(kpis.avg)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-normal text-muted-foreground">Höchste</div>
                  <div className="text-lg font-semibold">{formatCurrency(kpis.max)}</div>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Nach Kategorie</h2>
                <div className="flex flex-col gap-2">
                  {categoryBreakdown.map((cat, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="justify-between py-3 px-4 text-sm font-semibold rounded-[20px] bg-accent hover:bg-accent/80 cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <span>{cat.name}</span>
                      <span>{formatCurrency(cat.total)}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recent Expenses */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Letzte Ausgaben</h2>
                <div className="flex flex-col gap-3">
                  {recentAusgaben.map(ausgabe => (
                    <ExpenseCard key={ausgabe.record_id} ausgabe={ausgabe} kategorieMap={kategorieMap} />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="col-span-2 space-y-6">
                  {/* Hero KPI Card */}
                  <Card className="shadow-sm">
                    <CardContent className="p-8">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-sm font-light text-muted-foreground mb-2">
                            Ausgaben diesen Monat
                          </div>
                          <div className="text-6xl font-bold text-foreground leading-none">
                            {formatCurrency(kpis.total)}
                          </div>
                          <div className="mt-3 text-sm text-muted-foreground">
                            aus {kpis.count} Ausgaben
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm pb-1">
                          {kpis.diff > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-destructive" />
                              <span className="text-muted-foreground">
                                {formatCurrency(Math.abs(kpis.diff))} vs. letzten Monat
                              </span>
                            </>
                          ) : kpis.diff < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-600" />
                              <span className="text-muted-foreground">
                                {formatCurrency(Math.abs(kpis.diff))} vs. letzten Monat
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="shadow-sm">
                      <CardContent className="p-6">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Anzahl Ausgaben</div>
                        <div className="text-2xl font-bold">{kpis.count}</div>
                        <div className="text-xs text-muted-foreground mt-1">Einträge</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="p-6">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Durchschnitt</div>
                        <div className="text-2xl font-bold">{formatCurrency(kpis.avg)}</div>
                        <div className="text-xs text-muted-foreground mt-1">pro Ausgabe</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="p-6">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Höchste Ausgabe</div>
                        <div className="text-2xl font-bold">{formatCurrency(kpis.max)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Maximum</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trend Chart */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Ausgabenverlauf</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="date"
                              tickFormatter={(date) => format(parseISO(date), 'd. MMM', { locale: de })}
                              tick={{ fontSize: 12 }}
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis
                              tickFormatter={(value) => `€${value}`}
                              tick={{ fontSize: 12 }}
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value)}
                              labelFormatter={(date) => format(parseISO(date as string), 'PPP', { locale: de })}
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="total"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              fill="url(#colorTotal)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar (1/3) */}
                <div className="space-y-6">
                  {/* Categories Card */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Nach Kategorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryBreakdown.map((cat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-3 px-4 rounded-[20px] bg-accent hover:bg-accent/80 cursor-pointer transition-all hover:-translate-y-0.5"
                          >
                            <span className="text-sm font-semibold">{cat.name}</span>
                            <span className="text-sm font-bold">{formatCurrency(cat.total)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Expenses Card */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Letzte Ausgaben</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {recentAusgaben.slice(0, 10).map(ausgabe => {
                          const kategorieId = extractRecordId(ausgabe.fields.kategorie);
                          const kategorie = kategorieId ? kategorieMap.get(kategorieId) : null;
                          return (
                            <div
                              key={ausgabe.record_id}
                              className="flex items-start justify-between py-3 px-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate">
                                  {ausgabe.fields.beschreibung || 'Keine Beschreibung'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                  {kategorie && (
                                    <Badge variant="outline" className="text-xs px-2 py-0 rounded-full">
                                      {kategorie.fields.kategoriename}
                                    </Badge>
                                  )}
                                  {ausgabe.fields.datum && (
                                    <span>{format(parseISO(ausgabe.fields.datum), 'd. MMM', { locale: de })}</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm font-bold ml-3 whitespace-nowrap">
                                {formatCurrency(ausgabe.fields.betrag || 0)}
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
          </>
        )}
      </main>

      {/* Mobile Fixed Action Button */}
      <div className="fixed bottom-5 left-0 right-0 px-4 md:hidden">
        <AddExpenseDialog onSuccess={() => window.location.reload()} kategorien={kategorien} />
      </div>
    </div>
  );
}

// Helper Components
function ExpenseCard({ ausgabe, kategorieMap }: { ausgabe: Ausgaben; kategorieMap: Map<string, Kategorien> }) {
  const kategorieId = extractRecordId(ausgabe.fields.kategorie);
  const kategorie = kategorieId ? kategorieMap.get(kategorieId) : null;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold truncate">
              {ausgabe.fields.beschreibung || 'Keine Beschreibung'}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {kategorie && (
                <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-accent">
                  {kategorie.fields.kategoriename}
                </Badge>
              )}
              {ausgabe.fields.datum && (
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(ausgabe.fields.datum), 'd. MMM', { locale: de })}
                </span>
              )}
            </div>
          </div>
          <div className="text-base font-bold ml-4">
            {formatCurrency(ausgabe.fields.betrag || 0)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddExpenseDialog({ onSuccess, kategorien }: { onSuccess: () => void; kategorien: Kategorien[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateAusgabeErfassen>>({
    datum_ausgabe: new Date().toISOString().split('T')[0],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData: CreateAusgabeErfassen = {
        beschreibung_ausgabe: formData.beschreibung_ausgabe,
        betrag_ausgabe: formData.betrag_ausgabe,
        datum_ausgabe: formData.datum_ausgabe,
        kategorie_auswahl: formData.kategorie_auswahl,
        notizen_ausgabe: formData.notizen_ausgabe,
      };

      await LivingAppsService.createAusgabeErfassenEntry(apiData);
      setOpen(false);
      setFormData({ datum_ausgabe: new Date().toISOString().split('T')[0] });
      onSuccess();
    } catch (err) {
      console.error('Fehler beim Erstellen:', err);
      alert('Fehler beim Erstellen der Ausgabe');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto shadow-lg md:shadow-none" size="lg">
          <PlusCircle className="h-5 w-5 mr-2" />
          Neue Ausgabe erfassen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="kategorie">Kategorie</Label>
            <Select
              value={formData.kategorie_auswahl || undefined}
              onValueChange={(value) =>
                setFormData({ ...formData, kategorie_auswahl: createRecordUrl(APP_IDS.KATEGORIEN, value) })
              }
            >
              <SelectTrigger id="kategorie">
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
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Input
              id="beschreibung"
              value={formData.beschreibung_ausgabe || ''}
              onChange={(e) => setFormData({ ...formData, beschreibung_ausgabe: e.target.value })}
              placeholder="z.B. Einkauf Supermarkt"
            />
          </div>

          <div>
            <Label htmlFor="betrag">Betrag (EUR)</Label>
            <Input
              id="betrag"
              type="number"
              step="0.01"
              value={formData.betrag_ausgabe || ''}
              onChange={(e) => setFormData({ ...formData, betrag_ausgabe: parseFloat(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="datum">Datum</Label>
            <Input
              id="datum"
              type="date"
              value={formData.datum_ausgabe || ''}
              onChange={(e) => setFormData({ ...formData, datum_ausgabe: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="notizen">Notizen (optional)</Label>
            <Textarea
              id="notizen"
              value={formData.notizen_ausgabe || ''}
              onChange={(e) => setFormData({ ...formData, notizen_ausgabe: e.target.value })}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription className="mt-2">
          <p>{error.message}</p>
          <Button variant="outline" onClick={onRetry} className="mt-4">
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-muted-foreground mb-4">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Keine Ausgaben vorhanden</h2>
        <p className="text-sm">Erfassen Sie Ihre erste Ausgabe, um Ihre Finanzen zu tracken.</p>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}
