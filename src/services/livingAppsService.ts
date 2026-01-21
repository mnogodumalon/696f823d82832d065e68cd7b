// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Kategorien, Ausgaben, AusgabeErfassen } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- KATEGORIEN ---
  static async getKategorien(): Promise<Kategorien[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KATEGORIEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKategorienEntry(id: string): Promise<Kategorien | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createKategorienEntry(fields: Kategorien['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KATEGORIEN}/records`, { fields });
  }
  static async updateKategorienEntry(id: string, fields: Partial<Kategorien['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`, { fields });
  }
  static async deleteKategorienEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`);
  }

  // --- AUSGABEN ---
  static async getAusgaben(): Promise<Ausgaben[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUSGABEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getAusgabenEntry(id: string): Promise<Ausgaben | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUSGABEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createAusgabenEntry(fields: Ausgaben['fields']) {
    return callApi('POST', `/apps/${APP_IDS.AUSGABEN}/records`, { fields });
  }
  static async updateAusgabenEntry(id: string, fields: Partial<Ausgaben['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.AUSGABEN}/records/${id}`, { fields });
  }
  static async deleteAusgabenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.AUSGABEN}/records/${id}`);
  }

  // --- AUSGABE_ERFASSEN ---
  static async getAusgabeErfassen(): Promise<AusgabeErfassen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUSGABE_ERFASSEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getAusgabeErfassenEntry(id: string): Promise<AusgabeErfassen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUSGABE_ERFASSEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createAusgabeErfassenEntry(fields: AusgabeErfassen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.AUSGABE_ERFASSEN}/records`, { fields });
  }
  static async updateAusgabeErfassenEntry(id: string, fields: Partial<AusgabeErfassen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.AUSGABE_ERFASSEN}/records/${id}`, { fields });
  }
  static async deleteAusgabeErfassenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.AUSGABE_ERFASSEN}/records/${id}`);
  }

}