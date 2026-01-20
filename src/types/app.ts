// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Kategorien {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kategoriename?: string;
    beschreibung?: string;
  };
}

export interface Ausgaben {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    beleg?: string;
    notizen?: string;
    kategorie?: string; // applookup -> URL zu 'Kategorien' Record
    beschreibung?: string;
    betrag?: number;
  };
}

export interface AusgabeErfassen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kategorie_auswahl?: string; // applookup -> URL zu 'Kategorien' Record
    beschreibung_ausgabe?: string;
    betrag_ausgabe?: number;
    datum_ausgabe?: string; // Format: YYYY-MM-DD oder ISO String
    beleg_upload?: string;
    notizen_ausgabe?: string;
  };
}

export const APP_IDS = {
  KATEGORIEN: '696f822571ddec20b35bc68e',
  AUSGABEN: '696f8228ac959abad478a05a',
  AUSGABE_ERFASSEN: '696f8229befaff34971e38ed',
} as const;

// Helper Types for creating new records
export type CreateKategorien = Kategorien['fields'];
export type CreateAusgaben = Ausgaben['fields'];
export type CreateAusgabeErfassen = AusgabeErfassen['fields'];