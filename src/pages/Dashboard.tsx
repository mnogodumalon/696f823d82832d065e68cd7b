import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Euro,
  Calendar,
  Loader2,
  AlertCircle,
  Receipt,
  Package
} from 'lucide-react';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import type { Kategorien, Ausgaben } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

interface DashboardData {
  kategorien: Kategorien[];
  ausgaben: Ausgaben[];
}

interface NewAusgabeForm {
  datum: string;
  beschreibung: string;
  betrag: string;
  kategorie: string;
  notizen: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewAusgabeForm>({
    datum: format(new Date(), 'yyyy-MM-dd'),
    beschreibung: '',
    betrag: '',
    kategorie: '',
    notizen: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [kategorien, ausgaben] = await Promise.all([
        LivingAppsService.getKategorien(),
        LivingAppsService.getAusgaben()
      ]);

      setData({ kategorien, ausgaben });
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err);
      setError('Daten konnten nicht geladen werden. Bitte später erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.datum || !formData.beschreibung || !formData.betrag) {
      setError('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const betragNum = parseFloat(formData.betrag);
      if (isNaN(betragNum) || betragNum <= 0) {
        setError('Bitte einen gültigen Betrag eingeben.');
        return;
      }

      const newAusgabe: Ausgaben['fields'] = {
        datum: formData.datum,
        beschreibung: formData.beschreibung,
        betrag: betragNum,
        notizen: formData.notizen || undefined,
        kategorie: formData.kategorie ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie) : undefined
      };

      await LivingAppsService.createAusgabenEntry(newAusgabe);

      // Reset form
      setFormData({
        datum: format(new Date(), 'yyyy-MM-dd'),
        beschreibung: '',
        betrag: '',
        kategorie: '',
        notizen: ''
      });

      setDialogOpen(false);

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Fehler beim Erstellen der Ausgabe:', err);
      setError('Ausgabe konnte nicht erstellt werden. Bitte erneut versuchen.');
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Daten...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  // Calculate KPIs
  const totalAusgaben = data.ausgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  const anzahlAusgaben = data.ausgaben.length;
  const durchschnitt = anzahlAusgaben > 0 ? totalAusgaben / anzahlAusgaben : 0;

  // Calculate previous month for comparison
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthAusgaben = data.ausgaben.filter(a => {
    if (!a.fields.datum) return false;
    const datum = parse(a.fields.datum, 'yyyy-MM-dd', new Date());
    return datum >= currentMonthStart;
  });

  const previousMonthAusgaben = data.ausgaben.filter(a => {
    if (!a.fields.datum) return false;
    const datum = parse(a.fields.datum, 'yyyy-MM-dd', new Date());
    return datum >= previousMonthStart && datum <= previousMonthEnd;
  });

  const currentMonthTotal = currentMonthAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);
  const previousMonthTotal = previousMonthAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);

  const monthlyChange = previousMonthTotal > 0
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
    : 0;

  // Ausgaben by category
  const ausgabenByKategorie = data.ausgaben.reduce((acc, ausgabe) => {
    if (!ausgabe.fields.kategorie) {
      const key = 'Ohne Kategorie';
      acc[key] = (acc[key] || 0) + (ausgabe.fields.betrag || 0);
      return acc;
    }

    const kategorieId = extractRecordId(ausgabe.fields.kategorie);
    if (!kategorieId) {
      const key = 'Ohne Kategorie';
      acc[key] = (acc[key] || 0) + (ausgabe.fields.betrag || 0);
      return acc;
    }

    const kategorie = data.kategorien.find(k => k.record_id === kategorieId);
    const key = kategorie?.fields.kategoriename || 'Unbekannte Kategorie';
    acc[key] = (acc[key] || 0) + (ausgabe.fields.betrag || 0);
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(ausgabenByKategorie).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  // Timeline data (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subMonths(now, 1),
    end: now
  });

  const timelineData = last30Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayAusgaben = data.ausgaben.filter(a => a.fields.datum === dayStr);
    const total = dayAusgaben.reduce((sum, a) => sum + (a.fields.betrag || 0), 0);

    return {
      date: format(day, 'dd.MM', { locale: de }),
      betrag: parseFloat(total.toFixed(2))
    };
  });

  // Recent ausgaben (last 10)
  const recentAusgaben = [...data.ausgaben]
    .sort((a, b) => {
      const dateA = a.fields.datum ? new Date(a.fields.datum).getTime() : 0;
      const dateB = b.fields.datum ? new Date(b.fields.datum).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ausgabentracker</h1>
          <p className="text-muted-foreground">Übersicht deiner Ausgaben und Kategorien</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Neue Ausgabe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="datum">Datum *</Label>
                <Input
                  id="datum"
                  type="date"
                  value={formData.datum}
                  onChange={(e) => setFormData(prev => ({ ...prev, datum: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, beschreibung: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="betrag">Betrag (EUR) *</Label>
                <Input
                  id="betrag"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.betrag}
                  onChange={(e) => setFormData(prev => ({ ...prev, betrag: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategorie">Kategorie</Label>
                <Select value={formData.kategorie} onValueChange={(val) => setFormData(prev => ({ ...prev, kategorie: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.kategorien.map(kat => (
                      <SelectItem key={kat.record_id} value={kat.record_id}>
                        {kat.fields.kategoriename || 'Ohne Name'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notizen">Notizen</Label>
                <Textarea
                  id="notizen"
                  placeholder="Optional: Zusätzliche Informationen"
                  value={formData.notizen}
                  onChange={(e) => setFormData(prev => ({ ...prev, notizen: e.target.value }))}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Speichern
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtausgaben</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAusgaben.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {monthlyChange !== 0 && (
                <>
                  {monthlyChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  )}
                  <span className={monthlyChange > 0 ? 'text-red-500' : 'text-green-500'}>
                    {Math.abs(monthlyChange).toFixed(1)}%
                  </span>
                  <span className="ml-1">vs. letzter Monat</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anzahl Ausgaben</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anzahlAusgaben}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Davon {currentMonthAusgaben.length} in diesem Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnitt</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{durchschnitt.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground mt-1">Pro Ausgabe</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ausgaben nach Kategorie */}
        <Card>
          <CardHeader>
            <CardTitle>Ausgaben nach Kategorie</CardTitle>
            <CardDescription>Verteilung der Gesamtausgaben</CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}€`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} €`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Ausgaben vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zeitverlauf */}
        <Card>
          <CardHeader>
            <CardTitle>Zeitverlauf</CardTitle>
            <CardDescription>Ausgaben der letzten 30 Tage</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.some(d => d.betrag > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${value} €`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="betrag"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Betrag (EUR)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Ausgaben in den letzten 30 Tagen
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Ausgaben */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Ausgaben</CardTitle>
          <CardDescription>Die letzten 10 Ausgaben</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAusgaben.length > 0 ? (
            <div className="space-y-4">
              {recentAusgaben.map((ausgabe) => {
                const kategorieId = extractRecordId(ausgabe.fields.kategorie);
                const kategorie = kategorieId
                  ? data.kategorien.find(k => k.record_id === kategorieId)
                  : null;

                return (
                  <div
                    key={ausgabe.record_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{ausgabe.fields.beschreibung || 'Ohne Beschreibung'}</p>
                        {kategorie && (
                          <Badge variant="secondary" className="shrink-0">
                            {kategorie.fields.kategoriename || 'Unbekannt'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {ausgabe.fields.datum
                            ? format(parse(ausgabe.fields.datum, 'yyyy-MM-dd', new Date()), 'dd.MM.yyyy', { locale: de })
                            : 'Kein Datum'
                          }
                        </span>
                        {ausgabe.fields.notizen && (
                          <span className="hidden sm:inline truncate">{ausgabe.fields.notizen}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold shrink-0">
                      {(ausgabe.fields.betrag || 0).toFixed(2)} €
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Noch keine Ausgaben vorhanden</p>
              <p className="text-sm mt-1">Erstelle deine erste Ausgabe mit dem Button oben</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
