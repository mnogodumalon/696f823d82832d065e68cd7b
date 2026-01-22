import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subDays, startOfDay, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, AlertCircle, Receipt } from 'lucide-react';

// Currency formatter for German locale
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '€ 0,00';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

// Date formatter for German locale
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd.MM.yyyy', { locale: de });
  } catch {
    return '-';
  }
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-pulse">
      <div className="max-w-[1200px] mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-10 w-36 hidden md:block" />
        </div>

        {/* Hero skeleton */}
        <div className="text-center py-12 mb-8">
          <Skeleton className="h-4 w-24 mx-auto mb-4" />
          <Skeleton className="h-14 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-32 mx-auto" />
        </div>

        {/* Content skeleton */}
        <div className="grid md:grid-cols-[65%_35%] gap-8">
          <Skeleton className="h-[340px] rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[280px] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ onAddExpense }: { onAddExpense: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-['Plus_Jakarta_Sans']">
      <div className="max-w-[600px] mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
          <Receipt className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-3">Keine Ausgaben vorhanden</h2>
        <p className="text-muted-foreground mb-8">
          Beginne damit, deine erste Ausgabe zu erfassen und behalte den Überblick über deine Finanzen.
        </p>
        <Button size="lg" onClick={onAddExpense}>
          <Plus className="w-5 h-5 mr-2" />
          Erste Ausgabe hinzufügen
        </Button>
      </div>
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-['Plus_Jakarta_Sans']">
      <div className="max-w-[500px] mx-auto py-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler beim Laden</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error.message}</p>
            <Button variant="outline" onClick={onRetry}>
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// Add expense form dialog
function AddExpenseDialog({
  open,
  onOpenChange,
  kategorien,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kategorien: Kategorien[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    betrag: '',
    beschreibung: '',
    kategorie: '',
    datum: format(new Date(), 'yyyy-MM-dd'),
    notizen: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.betrag || !formData.beschreibung) {
      setError('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    setSubmitting(true);

    try {
      const apiData: Ausgaben['fields'] = {
        betrag: parseFloat(formData.betrag.replace(',', '.')),
        beschreibung: formData.beschreibung,
        datum: formData.datum, // Format: YYYY-MM-DD (date/date type)
        notizen: formData.notizen || undefined,
        kategorie: formData.kategorie
          ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie)
          : undefined,
      };

      await LivingAppsService.createAusgabenEntry(apiData);

      // Reset form
      setFormData({
        betrag: '',
        beschreibung: '',
        kategorie: '',
        datum: format(new Date(), 'yyyy-MM-dd'),
        notizen: '',
      });

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ausgabe hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              placeholder="z.B. Einkauf Supermarkt"
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
                {kategorien.map((kat) => (
                  <SelectItem key={kat.record_id} value={kat.record_id}>
                    {kat.fields.kategoriename || 'Unbenannt'}
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
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Category pill for mobile horizontal scroll
function CategoryPill({ name, amount }: { name: string; amount: number }) {
  return (
    <div className="flex-shrink-0 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium whitespace-nowrap">
      {name} {formatCurrency(amount)}
    </div>
  );
}

// Category bar for desktop
function CategoryBar({
  name,
  amount,
  percentage
}: {
  name: string;
  amount: number;
  percentage: number;
}) {
  return (
    <div className="relative py-3">
      {/* Background bar */}
      <div
        className="absolute inset-y-0 left-0 bg-primary/15 rounded-r"
        style={{ width: `${Math.max(percentage, 5)}%` }}
      />
      {/* Content */}
      <div className="relative flex justify-between items-center px-3">
        <span className="font-medium text-sm">{name}</span>
        <span className="font-semibold text-sm">{formatCurrency(amount)}</span>
      </div>
    </div>
  );
}

// Recent expense row
function ExpenseRow({
  expense,
  categoryName,
  expanded,
  onToggle
}: {
  expense: Ausgaben;
  categoryName: string | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors -mx-3 px-3"
      onClick={onToggle}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{expense.fields.beschreibung || 'Keine Beschreibung'}</p>
          <p className="text-sm text-muted-foreground">{formatDate(expense.fields.datum)}</p>
        </div>
        <p className="font-semibold ml-4 whitespace-nowrap">
          {formatCurrency(expense.fields.betrag)}
        </p>
      </div>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border/50 text-sm text-muted-foreground">
          {categoryName && <p>Kategorie: {categoryName}</p>}
          {expense.fields.notizen && <p className="mt-1">{expense.fields.notizen}</p>}
        </div>
      )}
    </div>
  );
}

// Main Dashboard component
export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

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
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Create category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach(kat => map.set(kat.record_id, kat));
    return map;
  }, [kategorien]);

  // Calculate current month stats
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthExpenses = ausgaben.filter(a => {
      if (!a.fields.datum) return false;
      try {
        const date = parseISO(a.fields.datum);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    });

    const total = thisMonthExpenses.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
    const count = thisMonthExpenses.length;

    return { total, count, expenses: thisMonthExpenses };
  }, [ausgaben]);

  // Calculate today's spending
  const todayTotal = useMemo(() => {
    const today = startOfDay(new Date());
    return ausgaben
      .filter(a => {
        if (!a.fields.datum) return false;
        try {
          return isSameDay(parseISO(a.fields.datum), today);
        } catch {
          return false;
        }
      })
      .reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  }, [ausgaben]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = new Map<string, { name: string; amount: number }>();

    currentMonthStats.expenses.forEach(expense => {
      const categoryId = extractRecordId(expense.fields.kategorie);
      const category = categoryId ? categoryMap.get(categoryId) : null;
      const categoryName = category?.fields.kategoriename || 'Ohne Kategorie';
      const key = categoryId || 'uncategorized';

      const current = breakdown.get(key) || { name: categoryName, amount: 0 };
      current.amount += expense.fields.betrag || 0;
      breakdown.set(key, current);
    });

    return Array.from(breakdown.values())
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthStats.expenses, categoryMap]);

  // Prepare chart data (last 30 days for desktop, 7 for mobile)
  const chartData = useMemo(() => {
    const days = 30;
    const data: Array<{ date: string; label: string; amount: number }> = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd.MM');

      const dayTotal = ausgaben
        .filter(a => a.fields.datum === dateStr)
        .reduce((sum, a) => sum + (a.fields.betrag || 0), 0);

      data.push({ date: dateStr, label, amount: dayTotal });
    }

    return data;
  }, [ausgaben]);

  // Chart data for mobile (last 7 days)
  const chartDataMobile = useMemo(() => {
    return chartData.slice(-7);
  }, [chartData]);

  // Recent expenses (sorted by date descending)
  const recentExpenses = useMemo(() => {
    return [...ausgaben]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      });
  }, [ausgaben]);

  // Get category name for an expense
  function getCategoryName(expense: Ausgaben): string | null {
    const categoryId = extractRecordId(expense.fields.kategorie);
    if (!categoryId) return null;
    const category = categoryMap.get(categoryId);
    return category?.fields.kategoriename || null;
  }

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  // Empty state
  if (ausgaben.length === 0) {
    return (
      <>
        <EmptyState onAddExpense={() => setDialogOpen(true)} />
        <AddExpenseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          kategorien={kategorien}
          onSuccess={fetchData}
        />
      </>
    );
  }

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: de });

  return (
    <div className="min-h-screen bg-background font-['Plus_Jakarta_Sans']">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <h1 className="text-lg font-semibold">Ausgabentracker</h1>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-10 text-center">
          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Diesen Monat</p>
          <p className="text-[44px] font-bold leading-tight">{formatCurrency(currentMonthStats.total)}</p>
          <p className="text-muted-foreground mt-1">{currentMonth} &middot; {currentMonthStats.count} Ausgaben</p>
          {todayTotal > 0 && (
            <p className="text-lg text-muted-foreground mt-4">
              Heute: {formatCurrency(todayTotal)}
            </p>
          )}
        </section>

        {/* Category Pills - Horizontal Scroll */}
        {categoryBreakdown.length > 0 && (
          <section className="mb-6">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 px-4 pb-4">
                {categoryBreakdown.map((cat, idx) => (
                  <CategoryPill key={idx} name={cat.name} amount={cat.amount} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* Chart */}
        <section className="px-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Letzte 7 Tage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataMobile}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(158 45% 32%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(158 45% 32%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(150 10% 45%)"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `€${v}`}
                      stroke="hsl(150 10% 45%)"
                      width={45}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Ausgaben']}
                      labelFormatter={(label) => `Datum: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(0 0% 100%)',
                        border: '1px solid hsl(45 15% 88%)',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(158 45% 32%)"
                      strokeWidth={2}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Expenses */}
        <section className="px-4 pb-24">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Letzte Ausgaben</CardTitle>
            </CardHeader>
            <CardContent>
              {recentExpenses.slice(0, 5).map((expense) => (
                <ExpenseRow
                  key={expense.record_id}
                  expense={expense}
                  categoryName={getCategoryName(expense)}
                  expanded={expandedExpenseId === expense.record_id}
                  onToggle={() => setExpandedExpenseId(
                    expandedExpenseId === expense.record_id ? null : expense.record_id
                  )}
                />
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Fixed Bottom Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold shadow-lg"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Ausgabe hinzufügen
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-semibold">Ausgabentracker</h1>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ausgabe hinzufügen
            </Button>
          </header>

          {/* Two Column Layout */}
          <div className="grid grid-cols-[65%_35%] gap-8">
            {/* Left Column */}
            <div>
              {/* Hero Section */}
              <section className="py-12 mb-8">
                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Diesen Monat</p>
                <p className="text-[56px] font-bold leading-none mb-2">{formatCurrency(currentMonthStats.total)}</p>
                <p className="text-muted-foreground">
                  {currentMonth} &middot; {currentMonthStats.count} Ausgaben
                  {todayTotal > 0 && (
                    <span className="ml-4">Heute: {formatCurrency(todayTotal)}</span>
                  )}
                </p>
              </section>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Ausgaben der letzten 30 Tage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorAmountDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(158 45% 32%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(158 45% 32%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          stroke="hsl(150 10% 45%)"
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `€${v}`}
                          stroke="hsl(150 10% 45%)"
                          width={50}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), 'Ausgaben']}
                          labelFormatter={(label) => `Datum: ${label}`}
                          contentStyle={{
                            backgroundColor: 'hsl(0 0% 100%)',
                            border: '1px solid hsl(45 15% 88%)',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="hsl(158 45% 32%)"
                          strokeWidth={2}
                          fill="url(#colorAmountDesktop)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Nach Kategorie</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {categoryBreakdown.length > 0 ? (
                    <div className="space-y-1">
                      {categoryBreakdown.map((cat, idx) => (
                        <CategoryBar
                          key={idx}
                          name={cat.name}
                          amount={cat.amount}
                          percentage={(cat.amount / currentMonthStats.total) * 100}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      Keine Kategorien diesen Monat
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Letzte Ausgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentExpenses.slice(0, 10).map((expense) => (
                    <ExpenseRow
                      key={expense.record_id}
                      expense={expense}
                      categoryName={getCategoryName(expense)}
                      expanded={expandedExpenseId === expense.record_id}
                      onToggle={() => setExpandedExpenseId(
                        expandedExpenseId === expense.record_id ? null : expense.record_id
                      )}
                    />
                  ))}
                  {recentExpenses.length === 0 && (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      Keine Ausgaben vorhanden
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kategorien={kategorien}
        onSuccess={fetchData}
      />
    </div>
  );
}
