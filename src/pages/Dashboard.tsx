import { useState, useEffect, useMemo } from 'react';
import type { Ausgaben, Kategorien } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO, startOfMonth, endOfMonth, getDaysInMonth, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, ChevronDown, Receipt } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Helper: Format currency
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '0,00 €';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

// Helper: Get available months for dropdown
function getAvailableMonths(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: de }),
    });
  }
  return months;
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-8 w-48" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="h-12 w-1/2 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error.message}</p>
          <Button variant="outline" onClick={onRetry}>
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
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
        <Receipt className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Keine Ausgaben vorhanden</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Starte damit, deine erste Ausgabe zu erfassen und behalte den Überblick über deine Finanzen.
      </p>
      <Button onClick={onAddExpense}>
        <Plus className="w-4 h-4 mr-2" />
        Erste Ausgabe hinzufügen
      </Button>
    </div>
  );
}

// Category Bar Component
interface CategoryData {
  id: string;
  name: string;
  total: number;
  percentage: number;
}

function CategoryBar({ category, maxTotal, rank }: { category: CategoryData; maxTotal: number; rank: number }) {
  const widthPercent = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;
  const opacities = [1, 0.7, 0.5, 0.35, 0.25];
  const opacity = opacities[Math.min(rank, opacities.length - 1)];

  return (
    <div className="group cursor-pointer transition-all hover:scale-[1.01]">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium">{category.name}</span>
        <span className="text-sm font-semibold">{formatCurrency(category.total)}</span>
      </div>
      <div className="h-8 bg-muted rounded-r-full overflow-hidden relative">
        <div
          className="h-full rounded-r-full transition-all duration-500 ease-out flex items-center"
          style={{
            width: `${Math.max(widthPercent, 8)}%`,
            backgroundColor: `hsl(150 25% 40% / ${opacity})`,
          }}
        >
          {widthPercent > 20 && (
            <span className="text-xs font-medium text-white pl-3">
              {category.percentage.toFixed(0)}%
            </span>
          )}
        </div>
        {widthPercent <= 20 && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {category.percentage.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Recent Expense Row Component
function ExpenseRow({ expense, categoryName }: { expense: Ausgaben; categoryName: string }) {
  const dateStr = expense.fields.datum
    ? format(parseISO(expense.fields.datum), 'dd.MM.', { locale: de })
    : '-';

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer px-2 -mx-2 rounded">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="text-sm text-muted-foreground w-12 shrink-0">{dateStr}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">
            {expense.fields.beschreibung || 'Ohne Beschreibung'}
          </p>
          <p className="text-xs text-muted-foreground">{categoryName}</p>
        </div>
      </div>
      <span className="text-sm font-semibold shrink-0 ml-4">
        {formatCurrency(expense.fields.betrag)}
      </span>
    </div>
  );
}

// Add Expense Form Component
interface AddExpenseFormProps {
  kategorien: Kategorien[];
  onSuccess: () => void;
  onClose: () => void;
}

function AddExpenseForm({ kategorien, onSuccess, onClose }: AddExpenseFormProps) {
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

    if (!formData.betrag || !formData.beschreibung || !formData.kategorie) {
      setError('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    setSubmitting(true);

    try {
      await LivingAppsService.createAusgabenEntry({
        betrag: parseFloat(formData.betrag.replace(',', '.')),
        beschreibung: formData.beschreibung,
        kategorie: createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie),
        datum: formData.datum,
        notizen: formData.notizen || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
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
          className="text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beschreibung">Beschreibung *</Label>
        <Input
          id="beschreibung"
          type="text"
          placeholder="z.B. Supermarkt Einkauf"
          value={formData.beschreibung}
          onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kategorie">Kategorie *</Label>
        <Select
          value={formData.kategorie}
          onValueChange={(value) => setFormData({ ...formData, kategorie: value })}
        >
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
        <Label htmlFor="datum">Datum</Label>
        <Input
          id="datum"
          type="date"
          value={formData.datum}
          onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notizen">Notizen (optional)</Label>
        <Textarea
          id="notizen"
          placeholder="Zusätzliche Informationen..."
          value={formData.notizen}
          onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [ausgaben, setAusgaben] = useState<Ausgaben[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [dialogOpen, setDialogOpen] = useState(false);

  const availableMonths = useMemo(() => getAvailableMonths(), []);

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
  const kategorieMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach((kat) => map.set(kat.record_id, kat));
    return map;
  }, [kategorien]);

  // Filter expenses by selected month
  const filteredAusgaben = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    return ausgaben.filter((a) => {
      if (!a.fields.datum) return false;
      const date = parseISO(a.fields.datum);
      return date >= monthStart && date <= monthEnd;
    });
  }, [ausgaben, selectedMonth]);

  // Calculate KPIs
  const monthlyTotal = useMemo(() => {
    return filteredAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  }, [filteredAusgaben]);

  const averagePerDay = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const selectedDate = new Date(year, month - 1);
    const now = new Date();

    let daysElapsed: number;
    if (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth()
    ) {
      daysElapsed = differenceInDays(now, startOfMonth(now)) + 1;
    } else {
      daysElapsed = getDaysInMonth(selectedDate);
    }

    return daysElapsed > 0 ? monthlyTotal / daysElapsed : 0;
  }, [monthlyTotal, selectedMonth]);

  const transactionCount = filteredAusgaben.length;

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();

    filteredAusgaben.forEach((a) => {
      const katId = extractRecordId(a.fields.kategorie);
      if (!katId) return;
      totals.set(katId, (totals.get(katId) || 0) + (a.fields.betrag || 0));
    });

    const result: CategoryData[] = [];
    totals.forEach((total, id) => {
      const kat = kategorieMap.get(id);
      result.push({
        id,
        name: kat?.fields.kategoriename || 'Unbekannt',
        total,
        percentage: monthlyTotal > 0 ? (total / monthlyTotal) * 100 : 0,
      });
    });

    return result.sort((a, b) => b.total - a.total);
  }, [filteredAusgaben, kategorieMap, monthlyTotal]);

  const maxCategoryTotal = categoryData.length > 0 ? categoryData[0].total : 0;

  // Get recent expenses (sorted by date, newest first)
  const recentExpenses = useMemo(() => {
    return [...filteredAusgaben]
      .sort((a, b) => {
        const dateA = a.fields.datum || '';
        const dateB = b.fields.datum || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 10);
  }, [filteredAusgaben]);

  // Get category name for expense
  function getCategoryName(expense: Ausgaben): string {
    const katId = extractRecordId(expense.fields.kategorie);
    if (!katId) return 'Ohne Kategorie';
    const kat = kategorieMap.get(katId);
    return kat?.fields.kategoriename || 'Unbekannt';
  }

  // Handlers
  function handleExpenseAdded() {
    fetchData();
  }

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  // Get selected month label
  const selectedMonthLabel =
    availableMonths.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Header */}
        <header className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-medium">Ausgaben</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {format(parseISO(selectedMonth + '-01'), 'MMM yyyy', { locale: de })}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableMonths.map((month) => (
                <DropdownMenuItem
                  key={month.value}
                  onClick={() => setSelectedMonth(month.value)}
                  className={selectedMonth === month.value ? 'bg-accent' : ''}
                >
                  {month.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {filteredAusgaben.length === 0 && kategorien.length > 0 ? (
          <EmptyState onAddExpense={() => setDialogOpen(true)} />
        ) : (
          <main className="px-4 pb-24">
            {/* Hero Section */}
            <section className="py-12 text-center">
              <p className="text-sm text-muted-foreground mb-2">Monatliche Ausgaben</p>
              <p className="text-5xl font-bold tracking-tight mb-2">
                {formatCurrency(monthlyTotal)}
              </p>
              <p className="text-sm text-muted-foreground">im {selectedMonthLabel}</p>
            </section>

            {/* Quick Stats Row */}
            <section className="flex items-center justify-center gap-6 py-4 mb-8">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Ø {formatCurrency(averagePerDay)} / Tag
                </p>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {transactionCount} Ausgaben
                </p>
              </div>
            </section>

            {/* Category Breakdown */}
            {categoryData.length > 0 && (
              <section className="mb-8">
                <h2 className="text-base font-semibold mb-4">Nach Kategorie</h2>
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((cat, index) => (
                    <CategoryBar
                      key={cat.id}
                      category={cat}
                      maxTotal={maxCategoryTotal}
                      rank={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Expenses */}
            {recentExpenses.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-4">Letzte Ausgaben</h2>
                <Card>
                  <CardContent className="p-4">
                    {recentExpenses.slice(0, 5).map((expense) => (
                      <ExpenseRow
                        key={expense.record_id}
                        expense={expense}
                        categoryName={getCategoryName(expense)}
                      />
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}
          </main>
        )}

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full h-12 text-base shadow-lg"
                style={{ boxShadow: '0 4px 12px hsl(45 10% 15% / 0.15)' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Ausgabe hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Ausgabe</DialogTitle>
              </DialogHeader>
              <AddExpenseForm
                kategorien={kategorien}
                onSuccess={handleExpenseAdded}
                onClose={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-[1200px] mx-auto p-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold">Ausgabentracker</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {selectedMonthLabel}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableMonths.map((month) => (
                  <DropdownMenuItem
                    key={month.value}
                    onClick={() => setSelectedMonth(month.value)}
                    className={selectedMonth === month.value ? 'bg-accent' : ''}
                  >
                    {month.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {filteredAusgaben.length === 0 && kategorien.length > 0 ? (
            <EmptyState onAddExpense={() => setDialogOpen(true)} />
          ) : (
            <div className="grid grid-cols-[1fr_380px] gap-8">
              {/* Left Column (65%) */}
              <div className="space-y-8">
                {/* Hero Card */}
                <Card className="p-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">Monatliche Ausgaben</p>
                    <p className="text-6xl font-bold tracking-tight mb-3">
                      {formatCurrency(monthlyTotal)}
                    </p>
                    <p className="text-muted-foreground">im {selectedMonthLabel}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-border">
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{formatCurrency(averagePerDay)}</p>
                      <p className="text-sm text-muted-foreground">pro Tag</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{transactionCount}</p>
                      <p className="text-sm text-muted-foreground">Ausgaben</p>
                    </div>
                  </div>
                </Card>

                {/* Category Breakdown */}
                {categoryData.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-5">Nach Kategorie</h2>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-5">
                          {categoryData.map((cat, index) => (
                            <CategoryBar
                              key={cat.id}
                              category={cat}
                              maxTotal={maxCategoryTotal}
                              rank={index}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}
              </div>

              {/* Right Column (35%) */}
              <div className="space-y-6">
                {/* Add Expense Button */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 text-base">
                      <Plus className="w-5 h-5 mr-2" />
                      Ausgabe hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Neue Ausgabe</DialogTitle>
                    </DialogHeader>
                    <AddExpenseForm
                      kategorien={kategorien}
                      onSuccess={handleExpenseAdded}
                      onClose={() => setDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                {/* Recent Activity */}
                {recentExpenses.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4">Letzte Ausgaben</h2>
                    <Card>
                      <CardContent className="p-4">
                        {recentExpenses.map((expense) => (
                          <ExpenseRow
                            key={expense.record_id}
                            expense={expense}
                            categoryName={getCategoryName(expense)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
